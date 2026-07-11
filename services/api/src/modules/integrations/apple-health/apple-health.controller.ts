/**
 * Rotas de ingestão Apple Health. Chamadas pelo próprio app (auth Bearer
 * do atleta, doc 03) — não há webhook: quem empurra é o dispositivo.
 */

import { Body, Controller, Delete, HttpCode, Post, Query } from '@nestjs/common';
import { AppleHealthService } from './apple-health.service';
import type { HealthKitWorkoutPayload } from './apple-health.types';

@Controller('integrations/apple-health')
export class AppleHealthController {
  constructor(private readonly appleHealth: AppleHealthService) {}

  /** O app registra a conexão após o atleta conceder permissão no HealthKit. */
  @Post('register')
  @HttpCode(204)
  async register(
    @Query('athleteId') athleteId: string,
    @Body() body: { sourceBundleId?: string },
  ): Promise<void> {
    await this.appleHealth.register(athleteId, body?.sourceBundleId);
  }

  /** Um treino do Apple Watch (payload HealthKit) por chamada. */
  @Post('workouts')
  async ingest(
    @Query('athleteId') athleteId: string,
    @Body() payload: HealthKitWorkoutPayload,
  ): Promise<{ rawSha256: string; accepted: boolean }> {
    return this.appleHealth.ingestWorkout(athleteId, payload);
  }

  @Delete()
  async disconnect(@Query('athleteId') athleteId: string): Promise<{ revoked: true }> {
    await this.appleHealth.disconnect(athleteId);
    return { revoked: true };
  }
}
