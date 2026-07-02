/**
 * Start Running — Design Tokens (Design System v1.0 §11).
 * Fonte da verdade visual em TypeScript, consumida pelo app mobile (React Native)
 * e pela web. Deve permanecer em sincronia com ../tokens.css e com o
 * living style guide.
 */

export const color = {
  // Marca
  ignite: '#FF3A5E',
  ignite600: '#E82550',
  ignite400: '#FF6E85',
  ignite100: '#FFE0E6',
  variancePink: '#FF3A5E',
  pulse: '#1E5BFF',
  pulse600: '#1246D6',
  pulse100: '#DEE8FF',
  volt: '#D6FF3D',
  volt600: '#A8CC00',
  // Neutros (base Ink)
  n0: '#FFFFFF',
  n50: '#F5F7FA',
  n100: '#E9EEF4',
  n200: '#D6DEE8',
  n300: '#B4C0CE',
  n400: '#8A99AB',
  n500: '#64748B',
  n600: '#48566A',
  n700: '#303C4D',
  n800: '#1B2530',
  n900: '#0B0F14',
  ink: '#0B0F14',
  // Semânticas
  success: '#17B26A',
  warning: '#F5A524',
  danger: '#E02749',
  info: '#1E5BFF',
} as const;

/** Zonas de treino — base 5 zonas; o modelo é configurável (PC-4). */
export const zoneColor = {
  z1: '#3FA9F5', // Recuperação
  z2: '#17B26A', // Endurance
  z3: '#F5C518', // Tempo
  z4: '#FF7A1F', // Limiar
  z5: '#E02749', // Anaeróbico/Máx
} as const;

/** Escala de espaçamento base 4px (DS §4). */
export const space = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20,
  s6: 24, s8: 32, s10: 40, s12: 48, s16: 64,
} as const;

export const radius = {
  sm: 8,   // chips, inputs
  md: 12,  // cards, campos
  lg: 16,  // cards grandes, modais
  xl: 24,  // bottom sheets
  pill: 999,
} as const;

export const elevation = {
  e1: { shadowColor: '#0B0F14', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  e2: { shadowColor: '#0B0F14', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  e3: { shadowColor: '#0B0F14', shadowOpacity: 0.14, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  /** Reservado ao CTA primário e momentos de energia (DS §5). */
  glowIgnite: { shadowColor: '#FF3A5E', shadowOpacity: 0.38, shadowRadius: 24, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
} as const;

export const motion = {
  durFast: 120,
  durBase: 200,
  durSlow: 320,
  /** cubic-bezier(.2,.8,.2,1) — easing "momentum". */
  easeMomentum: [0.2, 0.8, 0.2, 1] as const,
} as const;

export const font = {
  display: 'Archivo', // headlines e números de métrica (700–900, tabular-nums)
  text: 'Inter',      // corpo, rótulos, dados tabulares (400–700)
} as const;

/** Escala tipográfica (DS §3.1) — tamanhos em px, base 16. */
export const type = {
  displayXL: { fontFamily: font.display, fontSize: 56, lineHeight: 60, fontWeight: '800' },
  displayL:  { fontFamily: font.display, fontSize: 44, lineHeight: 48, fontWeight: '800' },
  h1:        { fontFamily: font.display, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h2:        { fontFamily: font.display, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  h3:        { fontFamily: font.display, fontSize: 21, lineHeight: 28, fontWeight: '700' },
  title:     { fontFamily: font.text, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  bodyL:     { fontFamily: font.text, fontSize: 17, lineHeight: 26, fontWeight: '400' },
  body:      { fontFamily: font.text, fontSize: 15, lineHeight: 22, fontWeight: '400' },
  small:     { fontFamily: font.text, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label:     { fontFamily: font.text, fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.72, textTransform: 'uppercase' },
} as const;

/** Alvo mínimo de toque (DS §4 / acessibilidade). */
export const touchTargetMin = 44;
