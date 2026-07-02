# Start Running — App Mobile

Expo / React Native (TypeScript, Expo Router). Arquitetura em [docs/arquitetura/05](../../docs/arquitetura/05-apps-cliente-e-design-system.md).

## Estrutura

```
app/
  _layout.tsx        # root: QueryClient, tema, stack (onboarding entra aqui)
  (tabs)/            # 5 destinos do DS §7.7: Hoje, Plano, Treinos, Coach, Perfil
src/
  theme/             # ponte design-tokens → RN; useTheme() claro/escuro
  components/        # kit do DS §7 (Button, ZoneBar, MetricCard, AlertBanner…)
```

## Rodar

```sh
pnpm install
pnpm --filter @startrunning/mobile start
```

Fontes **Archivo** (display/números) e **Inter** (texto) são carregadas via `expo-font` — adicione os arquivos em `assets/fonts/` (não versionados ainda).

## Regras do design system aplicadas em código

- CTA primário único por tela, pill, com glow Ignite (`Button variant="primary"`).
- Estado nunca só por cor — componentes exigem rótulo/ícone junto da cor.
- Volt reservado a conquistas reais (PR, meta, streak), ≤ ~10% da tela.
- Dado de baixa confiança sempre sinalizado (`lowConfidence` na `ZoneBar` etc.).
- Alvos de toque ≥ 44 px; `prefers-reduced-motion` respeitado nas celebrações.
