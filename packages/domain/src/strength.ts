/**
 * Módulo 20 — Musculação (especificação Natação/Musculação, ADR-0007).
 * O registro estruturado É o bruto da sessão de força (não há série
 * temporal obrigatória): serializado canonicamente e hasheado como
 * qualquer FIT (RNF-2.3).
 */

export type MuscleGroup =
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'      // MMII — interferência (RN-20.2)
  | 'core' | 'back' | 'chest' | 'shoulders' | 'arms';

export type StrengthFocus = 'base' | 'max_strength' | 'power' | 'maintenance' | 'prevention';

export interface ExerciseDef {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  /** Equipamento necessário — filtro pela Camada 0 (RF-20.2). */
  equipment: string[];
  videoUrl?: string;
  cues?: string[];
}

export interface StrengthSet {
  reps: number;
  weightKg?: number; // ausente = peso do corpo
  rpe?: number;      // 0–10
  restS?: number;
}

export interface StrengthExerciseLog {
  exerciseId: string;
  sets: StrengthSet[];
}

/** Sessão de força — o "bruto" do Módulo 20. */
export interface StrengthSession {
  id: string;
  athleteId: string;
  startedAt: string;
  durationS: number;
  focus?: StrengthFocus;
  exercises: StrengthExerciseLog[];
  /** session RPE 0–10 — base da carga na moeda comum (RF-20.4). */
  srpe?: number;
  notes?: string;
}

/** Derivadas da sessão (RF-20.3) — calculadas pelo motor, versionadas. */
export interface StrengthSessionMetrics {
  sessionId: string;
  methodologyVersion: string;
  /** Σ reps × carga (kg). */
  tonnageKg: number;
  setsByMuscleGroup: Partial<Record<MuscleGroup, number>>;
  /** 1RM estimado (Epley) por exercício presente na sessão. */
  estimated1RmByExercise: Record<string, number>;
  /** Carga na moeda comum (sRPE base — PC-6/ADR-0007). */
  strengthLoad: number;
  /** Sessão pesada de MMII dispara a janela de interferência (RN-20.2). */
  heavyLowerBody: boolean;
}
