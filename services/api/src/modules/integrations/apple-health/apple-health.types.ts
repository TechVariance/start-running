/**
 * Contrato de ingestão Apple Health / Apple Watch.
 *
 * A Apple não tem API server-side de treinos: o dado sai do HealthKit
 * NO DISPOSITIVO (app mobile, ver apps/mobile/src/services/health) e o app
 * envia este payload. Ele é serializado de forma canônica e vira o "bruto"
 * imutável (raw_format = 'healthkit_json') — recomputável como qualquer
 * FIT (ADR-0006). Este contrato espelha o parser
 * services/metrics-engine/src/metrics_engine/parsers/healthkit.py —
 * mudanças acontecem nos dois lados no mesmo PR.
 */

export interface HealthKitSample {
  /** Segundos desde o início do treino. */
  t: number;
  hr?: number;
  lat?: number;
  lon?: number;
  /** Distância ACUMULADA em metros (HKQuantityType distanceWalkingRunning). */
  distanceM?: number;
  altitudeM?: number;
  /** Passos/min totais (HealthKit reporta cadência total, não por perna). */
  cadenceSpm?: number;
}

export interface HealthKitWorkoutPayload {
  workout: {
    /** HKWorkout.uuid — chave de dedup por dispositivo (RF-2.6). */
    uuid: string;
    startedAt: string; // ISO 8601
    endedAt: string;
    distanceM?: number;
    elapsedS: number;
    /** ex.: 'Apple Watch Series 9' (HKDevice.name/model). */
    device?: string;
    /** Bundle do app de origem (com.apple.workout etc.). */
    sourceBundleId?: string;
  };
  samples: HealthKitSample[];
}
