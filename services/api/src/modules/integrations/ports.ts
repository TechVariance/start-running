/**
 * Portas do módulo integrations (Módulo 2 do SRS).
 *
 * O módulo depende só destas interfaces; os adapters concretos
 * (Postgres para conexões, S3 para bruto, BullMQ para a fila — doc 04)
 * são plugados na composição. Os defaults em memória permitem subir o
 * monólito sem infraestrutura em dev/teste.
 */

export type WearableProvider = 'garmin' | 'apple_health';
export type ConnectionStatus = 'connected' | 'revoked' | 'error';

export interface WearableConnection {
  athleteId: string;
  provider: WearableProvider;
  status: ConnectionStatus;
  /** Identidade do atleta no provedor (Garmin userId; bundle id no Apple Health). */
  providerUserId?: string;
  accessToken?: string;
  refreshToken?: string;
  /** Epoch ms em que o access token expira. */
  expiresAt?: number;
  scopes?: string[];
  connectedAt: string;
}

export interface ConnectionStore {
  upsert(connection: WearableConnection): Promise<void>;
  findByAthlete(athleteId: string, provider?: WearableProvider): Promise<WearableConnection[]>;
  findByProviderUser(provider: WearableProvider, providerUserId: string): Promise<WearableConnection | undefined>;
  /** Revogação LGPD (RNF-3.x): apaga tokens, mantém trilha mínima. */
  revoke(athleteId: string, provider: WearableProvider): Promise<void>;
}

/** Bruto imutável no object storage (ADR-0006). Chave natural: sha256. */
export interface RawFileStore {
  put(sha256: string, bytes: Buffer, contentType: string): Promise<string>; // -> storage key
}

/** Job consumido pelo metrics-engine (doc 04 §1). */
export interface ActivityReceivedJob {
  athleteId: string;
  source: 'garmin' | 'apple_health';
  rawFormat: 'fit' | 'tcx' | 'gpx' | 'healthkit_json';
  rawSha256: string;
  rawStorageKey: string;
  hrSensor: 'chest_strap' | 'optical' | 'none';
  sourceActivityId?: string;
  device?: string;
  startedAt?: string;
}

export interface IngestQueue {
  enqueueActivityReceived(job: ActivityReceivedJob): Promise<void>;
}

/** Estado OAuth pendente (PKCE) entre /connect e /callback. */
export interface OAuthStateStore {
  put(state: string, payload: { athleteId: string; codeVerifier: string }, ttlMs: number): Promise<void>;
  take(state: string): Promise<{ athleteId: string; codeVerifier: string } | undefined>;
}

export const CONNECTION_STORE = Symbol('CONNECTION_STORE');
export const RAW_FILE_STORE = Symbol('RAW_FILE_STORE');
export const INGEST_QUEUE = Symbol('INGEST_QUEUE');
export const OAUTH_STATE_STORE = Symbol('OAUTH_STATE_STORE');
