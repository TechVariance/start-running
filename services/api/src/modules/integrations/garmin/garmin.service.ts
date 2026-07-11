/**
 * Conector Garmin (RF-2.1/RF-2.3): OAuth2 + PKCE, webhook push e download
 * do FIT original (PC-3). O arquivo bruto vai imutável para o storage e a
 * atividade entra na fila `activity.received` — o cálculo é sempre do
 * metrics-engine (PC-1), nunca dos scores do Garmin (PC-2).
 */

import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  CONNECTION_STORE,
  INGEST_QUEUE,
  OAUTH_STATE_STORE,
  RAW_FILE_STORE,
  type ConnectionStore,
  type IngestQueue,
  type OAuthStateStore,
  type RawFileStore,
} from '../ports';
import {
  GARMIN_AUTHORIZE_URL,
  GARMIN_TOKEN_URL,
  GARMIN_USER_ID_URL,
  type GarminActivityFileNotification,
  type GarminTokenResponse,
  type GarminWebhookBody,
} from './garmin.types';

const STATE_TTL_MS = 10 * 60 * 1000;

function base64url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

@Injectable()
export class GarminService {
  private readonly logger = new Logger(GarminService.name);
  private readonly clientId = process.env.GARMIN_CLIENT_ID ?? '';
  private readonly clientSecret = process.env.GARMIN_CLIENT_SECRET ?? '';
  private readonly redirectUri = process.env.GARMIN_REDIRECT_URI ?? '';

  constructor(
    @Inject(CONNECTION_STORE) private readonly connections: ConnectionStore,
    @Inject(RAW_FILE_STORE) private readonly rawFiles: RawFileStore,
    @Inject(INGEST_QUEUE) private readonly queue: IngestQueue,
    @Inject(OAUTH_STATE_STORE) private readonly oauthStates: OAuthStateStore,
  ) {}

  get enabled(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.redirectUri);
  }

  private assertEnabled(): void {
    if (!this.enabled) {
      throw new ServiceUnavailableException(
        'Conector Garmin não configurado (GARMIN_CLIENT_ID/SECRET/REDIRECT_URI)',
      );
    }
  }

  /** Passo 1 do OAuth: devolve a URL de autorização com PKCE. */
  async buildAuthorizeUrl(athleteId: string): Promise<string> {
    this.assertEnabled();
    const state = base64url(randomBytes(24));
    const codeVerifier = base64url(randomBytes(48));
    await this.oauthStates.put(state, { athleteId, codeVerifier }, STATE_TTL_MS);
    const challenge = base64url(createHash('sha256').update(codeVerifier).digest());
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    return `${GARMIN_AUTHORIZE_URL}?${params}`;
  }

  /** Passo 2: callback com `code` — troca por tokens e grava a conexão. */
  async handleCallback(code: string, state: string): Promise<{ athleteId: string }> {
    this.assertEnabled();
    const pending = await this.oauthStates.take(state);
    if (!pending) {
      throw new ServiceUnavailableException('State OAuth desconhecido ou expirado');
    }
    const token = await this.exchangeCode(code, pending.codeVerifier);
    const providerUserId = await this.fetchGarminUserId(token.access_token);
    await this.connections.upsert({
      athleteId: pending.athleteId,
      provider: 'garmin',
      status: 'connected',
      providerUserId,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      scopes: token.scope?.split(' '),
      connectedAt: new Date().toISOString(),
    });
    this.logger.log(`Garmin conectado: athlete=${pending.athleteId} garminUser=${providerUserId}`);
    return { athleteId: pending.athleteId };
  }

  /**
   * Webhook push. Responde rápido (Garmin exige < 30 s); o download do FIT e
   * o enfileiramento acontecem por notificação, com falha isolada por item.
   */
  async handleWebhook(body: GarminWebhookBody): Promise<void> {
    for (const notification of body.activityFiles ?? []) {
      try {
        await this.ingestActivityFile(notification);
      } catch (error) {
        // Falha de um item não derruba o lote — Garmin reenvia por até 24 h.
        this.logger.error(
          `Falha ao ingerir activityFile do usuário Garmin ${notification.userId}: ${String(error)}`,
        );
      }
    }
    for (const dereg of body.deregistrations ?? []) {
      const connection = await this.connections.findByProviderUser('garmin', dereg.userId);
      if (connection) {
        await this.connections.revoke(connection.athleteId, 'garmin');
        this.logger.log(`Garmin desregistrado: athlete=${connection.athleteId}`);
      }
    }
  }

  /** Desconexão iniciada pelo atleta (LGPD): apaga tokens imediatamente. */
  async disconnect(athleteId: string): Promise<void> {
    await this.connections.revoke(athleteId, 'garmin');
    this.logger.log(`Garmin desconectado a pedido do atleta: ${athleteId}`);
  }

  private async ingestActivityFile(notification: GarminActivityFileNotification): Promise<void> {
    const connection = await this.connections.findByProviderUser('garmin', notification.userId);
    if (!connection || connection.status !== 'connected' || !connection.accessToken) {
      this.logger.warn(`Webhook Garmin para usuário sem conexão ativa: ${notification.userId}`);
      return;
    }
    const bytes = await this.download(notification.callbackURL, connection.accessToken);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const format = (notification.fileType ?? 'FIT').toLowerCase() as 'fit' | 'tcx' | 'gpx';
    const storageKey = await this.rawFiles.put(sha256, bytes, `application/octet-stream`);
    await this.queue.enqueueActivityReceived({
      athleteId: connection.athleteId,
      source: 'garmin',
      rawFormat: format,
      rawSha256: sha256,
      rawStorageKey: storageKey,
      // O engine refina pela mensagem device_info do FIT (cinta => 1.0).
      hrSensor: 'optical',
      sourceActivityId: notification.activityId?.toString() ?? notification.summaryId,
      startedAt: notification.startTimeInSeconds
        ? new Date(notification.startTimeInSeconds * 1000).toISOString()
        : undefined,
    });
  }

  private async exchangeCode(code: string, codeVerifier: string): Promise<GarminTokenResponse> {
    const response = await fetch(GARMIN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        code_verifier: codeVerifier,
        redirect_uri: this.redirectUri,
      }),
    });
    if (!response.ok) {
      throw new Error(`Troca de token Garmin falhou: HTTP ${response.status}`);
    }
    return (await response.json()) as GarminTokenResponse;
  }

  private async fetchGarminUserId(accessToken: string): Promise<string> {
    const response = await fetch(GARMIN_USER_ID_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Consulta de userId Garmin falhou: HTTP ${response.status}`);
    }
    const body = (await response.json()) as { userId: string };
    return body.userId;
  }

  private async download(url: string, accessToken: string): Promise<Buffer> {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) {
      throw new Error(`Download do bruto Garmin falhou: HTTP ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
}
