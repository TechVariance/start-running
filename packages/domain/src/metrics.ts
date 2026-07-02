/**
 * Camada 3 — métricas derivadas, sempre calculadas pela plataforma
 * (RN-3.1/PC-2: nunca importadas de scores proprietários) e sempre com
 * versão de metodologia + nível de confiança (RN-3.2, RNF-7.1, RNF-9.2).
 */

import type { TimeInZone } from './zones';

/** Toda derivada carrega procedência; a UI sinaliza confiança < 0.6 (DS §7.6). */
export interface DerivedMeta {
  methodologyVersion: string; // ex.: 'engine-2026.07'
  confidence: number;         // 0..1, agregado do pipeline de qualidade (PC-5)
  computedAt: string;
}

export interface KmSplit {
  km: number;
  paceSPerKm: number;
  gapSPerKm?: number; // Grade Adjusted Pace
  avgHr?: number;
  elevationGainM?: number;
}

/** Métricas por sessão (RF-3.2/3.3/3.6/3.8). */
export interface ActivityMetrics extends DerivedMeta {
  activityId: string;
  splits: KmSplit[];
  timeInZone: TimeInZone;
  gapAvgSPerKm?: number;
  // Carga interna — a melhor disponível conforme o dado (degradação elegante):
  trimp?: number;
  rtss?: number;
  hrtss?: number;
  srpeLoad?: number; // RPE × minutos, único caminho no registro manual
  // Fase 2
  efficiencyFactor?: number;
  decouplingPct?: number; // < 5% = boa durabilidade aeróbia
  // Fase 3 (Camada 2)
  normalizedPowerW?: number;
}

/** Série diária de carga (RF-3.4/3.5). */
export interface DailyLoad extends DerivedMeta {
  athleteId: string;
  day: string;
  ctl?: number;  // Chronic Training Load (~42d) — "fitness"
  atl?: number;  // Acute Training Load (~7d) — fadiga
  tsb?: number;  // CTL − ATL — forma/frescor
  /** Acute:Chronic Workload Ratio; zona segura ~0,8–1,3 (alerta fora dela — RF-8.2). */
  acwr?: number;
  dailyLoad: number;
}

export const ACWR_SAFE_RANGE = { min: 0.8, max: 1.3 } as const;

/** Prontidão diária (RF-3.7, RF-6.2). */
export interface WellnessSample {
  athleteId: string;
  day: string;
  hrvRmssd?: number;
  hrvBaseline?: number;
  hrvDeviation?: number;
  sleepS?: number;
  hrRest?: number;
  spo2Pct?: number;
  source: string;
  confidence: number;
}

/** Camada 4 — subjetivo e contexto. */
export interface SubjectiveLog {
  athleteId: string;
  day: string;
  activityId?: string;
  srpe?: number;
  pain?: Record<string, unknown>;
  mood?: number;
  stress?: number;
  motivation?: number;
  surface?: string;
  shoe?: string;
  notes?: string;
}
