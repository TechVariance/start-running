/**
 * Plano de treino periodizado (Módulos 4, 6, 11 do SRS).
 * A prescrição deriva do executado e dos limiares recalibrados, nunca do
 * pace declarado no onboarding (RN-4.1).
 */

export type PhaseKind = 'base' | 'volume' | 'intensity' | 'taper' | 'recovery';

export type WorkoutKind =
  | 'easy' | 'long' | 'tempo' | 'interval' | 'recovery'
  | 'strength' | 'race' | 'field_test';

export type WorkoutStatus = 'planned' | 'completed' | 'missed' | 'moved' | 'skipped';

export interface TrainingPlan {
  id: string;
  athleteId: string;
  raceGoalId?: string;
  status: 'active' | 'archived' | 'draft';
  generatedBy: string; // versão do motor de treino
  phases: PlanPhase[];
}

export interface PlanPhase {
  id: string;
  kind: PhaseKind;
  startsOn: string;
  endsOn: string;
  weeklyVolumeTargetKm?: number;
}

/** Bloco de prescrição: ex. 4× (1200 m em Z4, recuperação 400 m em Z1). */
export interface PrescriptionBlock {
  repeat?: number;
  /** Zona-alvo no modelo do atleta; a UI resolve para FC ou pace conforme a âncora. */
  targetZone?: number;
  targetPaceSPerKm?: { min: number; max: number };
  distanceM?: number;
  durationS?: number;
  recovery?: Omit<PrescriptionBlock, 'repeat' | 'recovery'>;
  note?: string;
}

export interface PlannedWorkout {
  id: string;
  athleteId: string;
  phaseId: string;
  scheduledOn: string;
  kind: WorkoutKind;
  /** Treino-chave da semana, com descrição detalhada (RF-4.3). */
  isKeyWorkout: boolean;
  title: string;
  description: string;
  blocks: PrescriptionBlock[];
  status: WorkoutStatus;
  executedActivityId?: string; // match p/ planejado vs executado (RF-5.1)
}

/**
 * Ajuste de plano com transparência (RF-6.4): o atleta vê o raciocínio e
 * pode aceitar, recusar ou pedir explicação (RN-6.2). Nenhum ajuste que
 * aumente carga é aplicado sem checar ACWR e prontidão (RN-6.1).
 */
export interface PlanAdjustment {
  id: string;
  planId: string;
  trigger: 'weekly_review' | 'readiness' | 'missed_workout' | 'user_request';
  reasoning: string;
  diff: Record<string, unknown>;
  athleteDecision?: 'accepted' | 'rejected';
  createdAt: string;
}

/** Biblioteca de fortalecimento (Módulo 11). */
export interface StrengthExercise {
  id: string;
  slug: string;
  name: string;
  category: 'strength' | 'proprioception' | 'plyometrics';
  videoUrl?: string;
  description?: string;
  /** Contraindicações cruzadas com o histórico de lesões (RF-11.3). */
  contraindications?: string[];
}
