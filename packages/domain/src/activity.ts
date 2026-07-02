/**
 * Atividade e série temporal canônica (Camadas 1–2, SRS §3.2).
 * A série bruta é a fonte da verdade (ADR-0006); campos de Camada 2 são
 * opcionais e dependem do sensor — nunca presuma presença.
 */

export type ActivitySource = 'strava' | 'garmin' | 'upload' | 'manual';
export type RawFormat = 'fit' | 'tcx' | 'gpx';
/** Ponderação de confiança da FC pela origem do sensor (RN-2.2). */
export type HrSensor = 'chest_strap' | 'optical' | 'none';
export type ActivityStatus = 'ingested' | 'processing' | 'ready' | 'rejected';

export interface Activity {
  id: string;
  athleteId: string;
  startedAt: string;
  timezone?: string;
  sport: 'run';
  source: ActivitySource;
  sourceActivityId?: string;
  device?: string;
  hrSensor: HrSensor;
  /** FIT(3) > TCX(2) > GPX(1) > resumo(0) — decide dedup e reprocessamento (RF-2.6/2.7). */
  richnessRank: 0 | 1 | 2 | 3;
  status: ActivityStatus;
  // Agregados Camada 1 (preenchidos pelo motor)
  distanceM?: number;
  elapsedS?: number;
  movingS?: number;
  avgPaceSPerKm?: number;
  avgHr?: number;
  maxHr?: number;
  avgCadenceSpm?: number;
  elevationGainM?: number;
  avgTempC?: number;
}

/** Flags de qualidade por ponto (PC-5) — bitmask. */
export enum QualityFlag {
  None = 0,
  SpikeRemoved = 1 << 0,
  Interpolated = 1 << 1,
  Gap = 1 << 2,
  GpsDrift = 1 << 3,
}

/** Um ponto da série canônica (tipicamente 1 Hz). */
export interface StreamSample {
  ts: string;
  // Camada 1 — núcleo universal
  lat?: number;
  lon?: number;
  distanceM?: number;
  paceSPerKm?: number;
  hr?: number;
  cadenceSpm?: number;
  altitudeM?: number;
  gradePct?: number;
  tempC?: number;
  // Camada 2 — dinâmica/potência (depende de sensor)
  powerW?: number;
  gctMs?: number;
  gctBalancePct?: number;
  verticalOscMm?: number;
  strideLenM?: number;
  qualityFlags: QualityFlag;
}

/** Registro manual sem dispositivo (RF-2.5) — alimenta a Camada 4. */
export interface ManualActivityInput {
  startedAt: string;
  distanceM?: number;
  durationS: number;
  /** session RPE 0–10; carga = sRPE × minutos. */
  srpe: number;
  notes?: string;
  surface?: string;
  shoe?: string;
}
