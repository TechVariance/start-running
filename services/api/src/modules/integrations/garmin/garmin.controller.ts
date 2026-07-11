/**
 * Rotas do conector Garmin. Auth Bearer do atleta conforme doc 03
 * (guard entra com o módulo identity); o webhook é público por contrato
 * do Garmin — a autenticidade vem do callbackURL + token da conexão.
 */

import { Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common';
import { GarminService } from './garmin.service';
import type { GarminWebhookBody } from './garmin.types';

@Controller('integrations/garmin')
export class GarminController {
  constructor(private readonly garmin: GarminService) {}

  /** Início do fluxo: o app abre esta URL no navegador do atleta. */
  @Get('connect')
  async connect(@Query('athleteId') athleteId: string): Promise<{ authorizeUrl: string }> {
    return { authorizeUrl: await this.garmin.buildAuthorizeUrl(athleteId) };
  }

  /** Redirect do Garmin após o consentimento. */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<{ connected: true; athleteId: string }> {
    const { athleteId } = await this.garmin.handleCallback(code, state);
    return { connected: true, athleteId };
  }

  /** Push de atividades (Activity File) e desregistros. Sempre 200 rápido. */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: GarminWebhookBody): Promise<{ ok: true }> {
    await this.garmin.handleWebhook(body);
    return { ok: true };
  }

  /** Desconexão iniciada pelo atleta (LGPD — RNF-3.x). */
  @Delete()
  async disconnect(@Query('athleteId') athleteId: string): Promise<{ revoked: true }> {
    await this.garmin.disconnect(athleteId);
    return { revoked: true };
  }
}
