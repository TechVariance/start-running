import { Module } from '@nestjs/common';

// Monólito modular (ADR-0003): módulos alinhados aos épicos do SRS.
// Fronteira: um módulo só importa a interface pública de outro
// (imposto por eslint-plugin-boundaries). Fase 3 (coach, community,
// coach-panel) entra por feature flag, não por branch longa.
import { IdentityModule } from './modules/identity/identity.module';
import { ConsentModule } from './modules/consent/consent.module';
import { ProfileModule } from './modules/profile/profile.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ZonesModule } from './modules/zones/zones.module';
import { TrainingModule } from './modules/training/training.module';
import { StrengthModule } from './modules/strength/strength.module';
import { SwimmingModule } from './modules/swimming/swimming.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    IdentityModule,
    ConsentModule,
    ProfileModule,
    IntegrationsModule,
    IngestionModule,
    ActivitiesModule,
    ZonesModule,
    TrainingModule,
    StrengthModule,
    SwimmingModule,
    FeedbackModule,
    NotificationsModule,
    BillingModule,
    AdminModule,
  ],
})
export class AppModule {}
