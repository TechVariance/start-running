/** Estado das conexões do atleta — alimenta a seção Integrações do Perfil. */

import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CONNECTION_STORE, type ConnectionStore, type WearableProvider } from './ports';
import { GarminService } from './garmin/garmin.service';

interface ConnectionView {
  provider: WearableProvider;
  status: 'connected' | 'revoked' | 'error' | 'not_connected';
  connectedAt?: string;
}

const PROVIDERS: WearableProvider[] = ['garmin', 'apple_health'];

@Controller('integrations/connections')
export class ConnectionsController {
  constructor(
    @Inject(CONNECTION_STORE) private readonly connections: ConnectionStore,
    private readonly garmin: GarminService,
  ) {}

  @Get()
  async list(
    @Query('athleteId') athleteId: string,
  ): Promise<{ connections: ConnectionView[]; garminConfigured: boolean }> {
    const existing = await this.connections.findByAthlete(athleteId);
    const connections = PROVIDERS.map((provider): ConnectionView => {
      const found = existing.find((c) => c.provider === provider);
      return found
        ? { provider, status: found.status, connectedAt: found.connectedAt }
        : { provider, status: 'not_connected' };
    });
    return { connections, garminConfigured: this.garmin.enabled };
  }
}
