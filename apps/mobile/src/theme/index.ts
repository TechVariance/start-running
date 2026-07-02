/**
 * Tema do app — ponte entre @startrunning/design-tokens e o React Native.
 * O modo segue o sistema (userInterfaceStyle: automatic); o escuro é o palco
 * natural dos dashboards de dado (DS §2.5).
 */
import { useColorScheme } from 'react-native';
import {
  darkTheme,
  lightTheme,
  type Theme,
  color,
  zoneColor,
  space,
  radius,
  elevation,
  motion,
  type as typeScale,
  touchTargetMin,
} from '@startrunning/design-tokens';

export { color, zoneColor, space, radius, elevation, motion, typeScale, touchTargetMin };
export type { Theme };

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

/**
 * Números de métrica sempre em Archivo com dígitos tabulares para não
 * "dançar" (DS §3): use este estilo como base de qualquer número grande.
 */
export const metricNumber = {
  fontFamily: typeScale.displayXL.fontFamily,
  fontVariant: ['tabular-nums' as const],
};
