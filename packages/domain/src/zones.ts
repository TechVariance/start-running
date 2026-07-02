/**
 * Sistema de zonas configurável (PC-4 / RF-3.9).
 * O modelo NÃO é fixo: 3, 5 ou 7 zonas, ancoradas em cinco referências.
 * Padrão para atleta com limiar conhecido: trabalhar por limiar, não %FCmax.
 */

export type ZoneModel = 3 | 5 | 7;

export type ZoneAnchor =
  | 'pct_hrmax'          // % FC máxima
  | 'karvonen_pct_hrr'   // Karvonen — % FC de reserva
  | 'pct_lthr'           // % LTHR (padrão atleta sério)
  | 'pct_threshold_pace' // % pace de limiar
  | 'pct_critical_power';

export interface ZoneBoundary {
  zone: number;      // 1..model
  label: string;     // ex.: 'Endurance' — sempre exibido junto à cor (DS §2.6)
  /** Limites na unidade da âncora (bpm, s/km ou W). `upper` aberto na última zona. */
  lower: number;
  upper?: number;
}

export interface ZoneConfig {
  athleteId: string;
  model: ZoneModel;
  anchor: ZoneAnchor;
  boundaries: ZoneBoundary[];
  updatedAt: string;
}

/** Tempo em cada zona de uma sessão, em segundos — alimenta a ZoneBar (DS §7.5). */
export type TimeInZone = Record<number, number>;
