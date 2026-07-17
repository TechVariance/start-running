/**
 * Módulo 19 — Natação (especificação Natação/Musculação, ADR-0007).
 * Métricas de piscina são POR PISCINA (RN-19.1): pace e SWOLF nunca se
 * comparam entre comprimentos diferentes.
 */

export type SwimStroke = 'free' | 'back' | 'breast' | 'fly' | 'mixed' | 'drill';
export type PoolLength = 25 | 50 | number; // metros; águas abertas = 0

/** Uma piscina nadada (espelha a mensagem `length` do FIT). */
export interface SwimLength {
  index: number;
  stroke: SwimStroke;
  durationS: number;
  strokes: number;
  /** SWOLF = tempo (s) + braçadas da piscina — menor é melhor. */
  swolf: number;
}

/** Agregados de sessão de nado (RF-19.3) — Camada 1 da natação. */
export interface SwimActivitySummary {
  poolLengthM: PoolLength;
  distanceM: number;
  movingS: number;
  avgPaceSPer100m: number;
  avgSwolf?: number;
  avgStrokesPerLength?: number;
  /** Distância por braçada (m) — eficiência técnica. */
  distancePerStrokeM?: number;
  timeByStroke?: Partial<Record<SwimStroke, number>>;
  lengths?: SwimLength[];
}

/** Estimativa do Critical Swim Speed (RF-19.4/19.6) — o "limiar" do nado. */
export interface CssEstimate {
  /** Pace de limiar em segundos por 100 m. */
  cssSPer100m: number;
  /** CSS = 200 / (T400 − T200), em m/s, convertido para s/100m. */
  source: 'field_test_400_200' | 'auto_recalibration' | 'manual';
  confidence: number;
  effectiveAt: string;
  methodologyVersion: string;
}
