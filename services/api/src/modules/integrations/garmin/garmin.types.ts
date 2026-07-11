/**
 * Contratos do Garmin Connect Developer Program (Health/Activity API).
 *
 * Pré-requisito de produção: aprovação no programa (developer.garmin.com)
 * gera GARMIN_CLIENT_ID/SECRET. Sem credenciais o conector sobe desativado
 * e /connect responde 503 — nada quebra.
 */

/** Notificação push de atividade (webhook "Activity File"). */
export interface GarminActivityFileNotification {
  userId: string;
  summaryId?: string;
  activityId?: number;
  fileType?: 'FIT' | 'TCX' | 'GPX';
  /** URL temporária para baixar o arquivo original — o PC-3 em ação. */
  callbackURL: string;
  startTimeInSeconds?: number;
  activityType?: string;
  manual?: boolean;
}

export interface GarminWebhookBody {
  activityFiles?: GarminActivityFileNotification[];
  /** Desregistro do usuário no Garmin Connect — revogação LGPD. */
  deregistrations?: Array<{ userId: string }>;
}

export interface GarminTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // segundos
  scope?: string;
}

export const GARMIN_AUTHORIZE_URL = 'https://connect.garmin.com/oauth2Confirm';
export const GARMIN_TOKEN_URL = 'https://diauth.garmin.com/di-oauth2-service/oauth/token';
export const GARMIN_USER_ID_URL = 'https://apis.garmin.com/wellness-api/rest/user/id';
