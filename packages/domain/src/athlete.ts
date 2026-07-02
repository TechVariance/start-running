/**
 * Camada 0 — Perfil do atleta (SRS §3.2).
 * Campos avançados são opcionais: a ausência não bloqueia a geração de plano,
 * apenas reduz a precisão (RN-1.2 — degradação elegante).
 */

export type SelfLevel = 'beginner' | 'intermediate' | 'competitive';
export type Sex = 'female' | 'male' | 'other' | 'undisclosed';
export type Units = 'metric' | 'imperial';

export interface AthleteProfile {
  athleteId: string;
  birthDate?: string; // ISO date
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  hrRest?: number;
  hrMax?: number;
  /** FC máx medida vale mais que estimada (RF-1.3). */
  hrMaxSource?: 'measured' | 'estimated';
  /** Lactate Threshold Heart Rate — âncora preferida do atleta sério. */
  lthr?: number;
  thresholdPaceSPerKm?: number;
  vo2max?: number;
  criticalSpeedMS?: number;
  criticalPowerW?: number;
  selfLevel: SelfLevel;
  weeklyVolumeKm?: number;
  /** Dias da semana disponíveis (0 = domingo). */
  availableDays: number[];
  /** Triagem de prontidão (RF-1.5); false ⇒ encaminhar a avaliação profissional. */
  parqPassed?: boolean;
}

export interface InjuryRecord {
  id: string;
  bodyRegion: string;
  description?: string;
  occurredAt?: string;
  resolved: boolean;
  /** Restrições que o motor de treino respeita na prescrição (RF-1.4). */
  restrictions?: Record<string, unknown>;
}

export interface RaceGoal {
  id: string;
  distanceM: number; // 5000 … ultra
  raceDate: string;
  targetTimeS?: number;
  raceName?: string;
  isPrimary: boolean;
}

/** Estimativa de limiar com procedência e confiança (RF-3.10). */
export interface ThresholdEstimate {
  kind: 'lthr' | 'threshold_pace' | 'cs' | 'cp' | 'hr_max';
  value: number;
  source: 'onboarding' | 'field_test' | 'auto_recalibration';
  confidence: number; // 0..1
  effectiveAt: string;
  methodologyVersion: string;
}
