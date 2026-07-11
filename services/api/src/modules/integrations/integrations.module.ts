import { Module } from '@nestjs/common';

// Conectores de wearables (Módulo 2 do SRS): Garmin (OAuth2+PKCE, webhook
// push, download do FIT original — PC-3) e Apple Health (ingestão do payload
// HealthKit enviado pelo app; a Apple não tem API server-side de treinos).
// Strava entra no mesmo padrão nesta pasta. Os adapters em memória são o
// default de dev; produção pluga Postgres/S3/BullMQ nestes mesmos tokens.
import {
  CONNECTION_STORE,
  INGEST_QUEUE,
  OAUTH_STATE_STORE,
  RAW_FILE_STORE,
} from './ports';
import {
  InMemoryConnectionStore,
  InMemoryOAuthStateStore,
  InMemoryRawFileStore,
  LoggingIngestQueue,
} from './in-memory.adapters';
import { GarminService } from './garmin/garmin.service';
import { GarminController } from './garmin/garmin.controller';
import { AppleHealthService } from './apple-health/apple-health.service';
import { AppleHealthController } from './apple-health/apple-health.controller';
import { ConnectionsController } from './connections.controller';

@Module({
  controllers: [GarminController, AppleHealthController, ConnectionsController],
  providers: [
    GarminService,
    AppleHealthService,
    { provide: CONNECTION_STORE, useClass: InMemoryConnectionStore },
    { provide: RAW_FILE_STORE, useClass: InMemoryRawFileStore },
    { provide: INGEST_QUEUE, useClass: LoggingIngestQueue },
    { provide: OAUTH_STATE_STORE, useClass: InMemoryOAuthStateStore },
  ],
  exports: [CONNECTION_STORE],
})
export class IntegrationsModule {}
