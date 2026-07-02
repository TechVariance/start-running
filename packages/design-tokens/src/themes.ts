/**
 * Temas claro e escuro (DS §2.5) — mapeiam tokens brutos para papéis semânticos.
 * O modo escuro é o "palco" natural para dashboards de dado.
 */
import { color } from './tokens';

export interface Theme {
  name: 'light' | 'dark';
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  /** Cor de ação primária (CTAs, estados "go"). */
  primary: string;
  primaryPressed: string;
  /** Links, esforço/pace, info, seleção. */
  accent: string;
  /** PRs, conquistas — usar com parcimônia (~10% da tela). */
  energy: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const lightTheme: Theme = {
  name: 'light',
  surface: color.n0,
  surfaceAlt: color.n50,
  text: color.ink,
  textMuted: color.n500,
  border: color.n100,
  primary: color.ignite,
  primaryPressed: color.ignite600,
  accent: color.pulse,
  energy: color.volt600, // volt como texto sobre claro exige a variante 600 (contraste)
  success: color.success,
  warning: color.warning,
  danger: color.danger,
  info: color.info,
};

export const darkTheme: Theme = {
  name: 'dark',
  surface: color.ink,
  surfaceAlt: color.n800,
  text: color.n50,
  textMuted: color.n400,
  border: color.n700,
  primary: color.ignite,
  primaryPressed: color.ignite600,
  accent: color.pulse,
  energy: color.volt,
  success: color.success,
  warning: color.warning,
  danger: color.danger,
  info: color.info,
};
