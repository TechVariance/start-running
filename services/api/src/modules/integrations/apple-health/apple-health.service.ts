/**
 * Ingestão Apple Health / Apple Watch (RF-2.x, degradação elegante RN-1.2).
 *
 * O payload vindo do app é serializado canonicamente, hasheado (sha256 =
 * identidade do bruto, RNF-2.3) e enfileirado para o metrics-engine com
 * raw_format 'healthkit_json'. FC do Watch é sensor óptico => confiança
 * base 0,8 no estágio de qualidade (RN-2.2).
 */

import { createHash } from 'node:crypto';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import {
  CONNECTION_STORE,
  INGEST_QUEUE,
  RAW_FILE_STORE,
  type ConnectionStore,
  type IngestQueue,
  type RawFileStore,
} from '../ports';
import type { HealthKitWorkoutPayload } from './apple-health.types';

@Injectable()
export class AppleHealthService {
  private readonly logger = new Logger(AppleHealthService.name);

  constructor(
    @Inject(CONNECTION_STORE) private readonly connections: ConnectionStore,
    @Inject(RAW_FILE_STORE) private readonly rawFiles: RawFileStore,
    @Inject(INGEST_QUEUE) private readonly queue: IngestQueue,
  ) {}

  /** Marca a conexão como ativa quando o app conclui a permissão HealthKit. */
  async register(athleteId: string, sourceBundleId?: string): Promise<void> {
    await this.connections.upsert({
      athleteId,
      provider: 'apple_health',
      status: 'connected',
      providerUserId: sourceBundleId,
      connectedAt: new Date().toISOString(),
    });
  }

  async ingestWorkout(
    athleteId: string,
    payload: HealthKitWorkoutPayload,
  ): Promise<{ rawSha256: string; accepted: boolean }> {
    this.validate(payload);
    // Serialização canônica: chaves ordenadas => mesmo treino, mesmo sha256.
    const bytes = Buffer.from(canonicalJson(payload), 'utf8');
    const rawSha256 = createHash('sha256').update(bytes).digest('hex');
    const storageKey = await this.rawFiles.put(rawSha256, bytes, 'application/json');
    await this.queue.enqueueActivityReceived({
      athleteId,
      source: 'apple_health',
      rawFormat: 'healthkit_json',
      rawSha256,
      rawStorageKey: storageKey,
      hrSensor: 'optical',
      sourceActivityId: payload.workout.uuid,
      device: payload.workout.device,
      startedAt: payload.workout.startedAt,
    });
    this.logger.log(
      `Treino HealthKit ingerido: athlete=${athleteId} uuid=${payload.workout.uuid} samples=${payload.samples.length}`,
    );
    return { rawSha256, accepted: true };
  }

  async disconnect(athleteId: string): Promise<void> {
    await this.connections.revoke(athleteId, 'apple_health');
  }

  private validate(payload: HealthKitWorkoutPayload): void {
    if (!payload?.workout?.uuid) {
      throw new BadRequestException('workout.uuid é obrigatório');
    }
    if (!payload.workout.startedAt || !payload.workout.elapsedS) {
      throw new BadRequestException('workout.startedAt e workout.elapsedS são obrigatórios');
    }
    if (!Array.isArray(payload.samples)) {
      throw new BadRequestException('samples deve ser uma lista (pode ser vazia)');
    }
    for (const sample of payload.samples) {
      if (typeof sample.t !== 'number' || sample.t < 0) {
        throw new BadRequestException('Cada sample precisa de t (segundos desde o início) >= 0');
      }
    }
  }
}

/** JSON com chaves ordenadas — identidade estável do bruto. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
}
