/**
 * Sync Apple Watch → API (RF-2.x): lê treinos novos do HealthKit e envia o
 * payload bruto para /v1/integrations/apple-health/workouts. O cálculo de
 * métricas NUNCA acontece aqui — série bruta sobe, o metrics-engine deriva
 * (PC-1). Lógica pura sobre as fronteiras HealthKitAdapter/IngestApi, para
 * testar sem dispositivo.
 */

import type { HealthKitAdapter, HealthKitWorkoutPayload, IngestApi } from './types';

export interface SyncResult {
  scanned: number;
  sent: number;
  failed: number;
  lastSyncedAt: string;
}

export interface SyncState {
  /** ISO do último sync bem-sucedido; primeira execução usa 30 dias. */
  lastSyncedAt?: string;
  /** uuids já enviados — dedup local barato (o servidor dedupa por sha256). */
  sentUuids: string[];
}

const FIRST_SYNC_WINDOW_DAYS = 30;
const MAX_SENT_UUIDS = 500;

export async function connectAppleHealth(
  adapter: HealthKitAdapter,
  api: IngestApi,
  sourceBundleId?: string,
): Promise<boolean> {
  const granted = await adapter.requestPermissions();
  if (granted) await api.registerConnection(sourceBundleId);
  return granted;
}

export async function syncAppleHealth(
  adapter: HealthKitAdapter,
  api: IngestApi,
  state: SyncState,
): Promise<{ result: SyncResult; state: SyncState }> {
  const since = state.lastSyncedAt
    ? new Date(state.lastSyncedAt)
    : new Date(Date.now() - FIRST_SYNC_WINDOW_DAYS * 24 * 3600 * 1000);

  const workouts = await adapter.listRunningWorkouts(since);
  const pending = workouts.filter((w) => !state.sentUuids.includes(w.uuid));

  let sent = 0;
  let failed = 0;
  const sentUuids = [...state.sentUuids];
  for (const workout of pending) {
    try {
      const samples = await adapter.loadSamples(workout.uuid);
      const payload: HealthKitWorkoutPayload = { workout, samples };
      await api.postWorkout(payload);
      sentUuids.push(workout.uuid);
      sent += 1;
    } catch {
      // Próximo sync tenta de novo — o servidor dedupa por sha256 (RNF-2.3).
      failed += 1;
    }
  }

  const lastSyncedAt = new Date().toISOString();
  return {
    result: { scanned: workouts.length, sent, failed, lastSyncedAt },
    state: { lastSyncedAt, sentUuids: sentUuids.slice(-MAX_SENT_UUIDS) },
  };
}
