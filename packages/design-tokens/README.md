# @startrunning/design-tokens

Tokens do [Design System — Start Running v1.0](../../docs/design/design-system.md) em duas formas:

- **`tokens.css`** — variáveis CSS (web, living style guide), com papéis semânticos por tema via `[data-theme]`;
- **`src/`** — objetos TypeScript tipados (`color`, `zoneColor`, `space`, `radius`, `elevation`, `motion`, `type`) e temas claro/escuro (`lightTheme`/`darkTheme`) para o app React Native.

Regras que este pacote codifica (não viole no consumidor):

- **Volt é tempero, não base** — reservado a PR/meta/streak, ≤ ~10% da tela; sobre fundo claro use `volt600`.
- **Estado nunca só por cor** — todo chip/alerta acompanha ícone + rótulo (DS §2.6).
- **Números de métrica** usam Archivo com `tabular-nums`.
- **Glow Ignite** só no CTA primário e momentos de energia.
- Toda mudança de token reflete simultaneamente em `tokens.css`, `src/tokens.ts` e no living style guide.
