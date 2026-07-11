/**
 * Contrato do sync Apple Health/Watch no app.
 *
 * `HealthKitAdapter` é a fronteira com o módulo nativo. A implementação
 * concreta usa `react-native-health` (HealthKit) e exige DEV BUILD com a
 * entitlement HealthKit — não funciona no Expo Go. Passos:
 *   1. pnpm --filter @startrunning/mobile add react-native-health
 *   2. app.json > ios.infoPlist: NSHealthShareUsageDescription
 *      + entitlement com.apple.developer.healthkit (via expo prebuild/EAS)
 *   3. implementar RNHealthAdapter com initHealthKit + getSamples
 * O payload espelha services/api/.../apple-health/apple-health.types.ts.
 */

export interface HealthKitSample {
  t: number; // segundos desde o início do treino
  hr?: number;
  lat?: number;
  lon?: number;
  distanceM?: number; // acumulada
  altitudeM?: number;
  cadenceSpm?: number;
}

export interface HealthKitWorkout {
  uuid: string;
  startedAt: string;
  endedAt: string;
  distanceM?: number;
  elapsedS: number;
  device?: string;
  sourceBundleId?: string;
}

export interface HealthKitWorkoutPayload {
  workout: HealthKitWorkout;
  samples: HealthKitSample[];
}

/** Fronteira com o HealthKit nativo — implementada com react-native-health. */
export interface HealthKitAdapter {
  /** Pede permissão de leitura (workouts, FC, distância, rota). */
  requestPermissions(): Promise<boolean>;
  /** Corridas concluídas desde `since` (HKWorkoutActivityType.Running). */
  listRunningWorkouts(since: Date): Promise<HealthKitWorkout[]>;
  /** Amostras do treino (FC 1 ponto/~5 s no Watch, distância, rota). */
  loadSamples(workoutUuid: string): Promise<HealthKitSample[]>;
}

export interface IngestApi {
  registerConnection(sourceBundleId?: string): Promise<void>;
  postWorkout(payload: HealthKitWorkoutPayload): Promise<{ rawSha256: string; accepted: boolean }>;
}
