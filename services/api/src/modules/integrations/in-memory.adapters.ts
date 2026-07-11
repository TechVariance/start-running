/**
 * Adapters em memória — default de desenvolvimento/teste.
 * Produção troca por Postgres (conexões), S3 (bruto) e BullMQ (fila)
 * na composição do módulo, sem tocar nos serviços.
 */

import { Logger } from '@nestjs/common';
import type {
  ActivityReceivedJob,
  ConnectionStore,
  IngestQueue,
  OAuthStateStore,
  RawFileStore,
  WearableConnection,
  WearableProvider,
} from './ports';

export class InMemoryConnectionStore implements ConnectionStore {
  private readonly byKey = new Map<string, WearableConnection>();

  private key(athleteId: string, provider: WearableProvider): string {
    return `${athleteId}:${provider}`;
  }

  async upsert(connection: WearableConnection): Promise<void> {
    this.byKey.set(this.key(connection.athleteId, connection.provider), connection);
  }

  async findByAthlete(athleteId: string, provider?: WearableProvider): Promise<WearableConnection[]> {
    return [...this.byKey.values()].filter(
      (c) => c.athleteId === athleteId && (provider === undefined || c.provider === provider),
    );
  }

  async findByProviderUser(
    provider: WearableProvider,
    providerUserId: string,
  ): Promise<WearableConnection | undefined> {
    return [...this.byKey.values()].find(
      (c) => c.provider === provider && c.providerUserId === providerUserId,
    );
  }

  async revoke(athleteId: string, provider: WearableProvider): Promise<void> {
    const existing = this.byKey.get(this.key(athleteId, provider));
    if (!existing) return;
    this.byKey.set(this.key(athleteId, provider), {
      ...existing,
      status: 'revoked',
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
    });
  }
}

export class InMemoryRawFileStore implements RawFileStore {
  private readonly files = new Map<string, Buffer>();

  async put(sha256: string, bytes: Buffer): Promise<string> {
    // Idempotência natural: mesmo sha256 => mesma chave, nunca duplica (RNF-2.3).
    const key = `raw/${sha256}`;
    if (!this.files.has(key)) this.files.set(key, bytes);
    return key;
  }
}

export class LoggingIngestQueue implements IngestQueue {
  private readonly logger = new Logger('IngestQueue');

  async enqueueActivityReceived(job: ActivityReceivedJob): Promise<void> {
    // Produção: fila BullMQ `activity.received` consumida pelo metrics-engine.
    this.logger.log(
      `activity.received athlete=${job.athleteId} source=${job.source} sha256=${job.rawSha256.slice(0, 12)}…`,
    );
  }
}

export class InMemoryOAuthStateStore implements OAuthStateStore {
  private readonly states = new Map<string, { payload: { athleteId: string; codeVerifier: string }; expiresAt: number }>();

  async put(state: string, payload: { athleteId: string; codeVerifier: string }, ttlMs: number): Promise<void> {
    this.states.set(state, { payload, expiresAt: Date.now() + ttlMs });
  }

  async take(state: string): Promise<{ athleteId: string; codeVerifier: string } | undefined> {
    const entry = this.states.get(state);
    this.states.delete(state); // uso único — replay de state é rejeitado
    if (!entry || entry.expiresAt < Date.now()) return undefined;
    return entry.payload;
  }
}
