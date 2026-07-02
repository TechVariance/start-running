# 05 — Apps cliente e design system

## 1. App mobile (Expo / React Native)

`apps/mobile`, TypeScript, Expo Router. Uma base para iOS e Android com paridade (RNF-6.1).

### 1.1 Navegação (DS §7.7)

Tab bar inferior com os 5 destinos definidos no design system — ícone outline → filled no ativo, rótulo em Label, indicador Ignite:

| Tab | Conteúdo | RFs |
|---|---|---|
| **Hoje** | treino do dia, prontidão, alertas de carga, CTA "iniciar/registrar" | RF-6.2, RF-8.2, RF-14.x |
| **Plano** | fases, calendário planejado × executado, ajustes com raciocínio | RF-4.x, RF-6.4, RF-15.3 |
| **Treinos** | histórico, leitura da sessão (splits, barra de zonas, confiança) | RF-5.x, RF-15.2 |
| **Coach** | conversacional IA (Fase 3; antes, central de explicações de métricas) | RF-9.x, RNF-4.2 |
| **Perfil** | Camada 0, zonas, integrações, assinatura, consentimentos LGPD | Módulos 1, 16, 18 |

Fluxos fora das tabs: onboarding (stack próprio, concluível < 5 min — RN-1.1), detalhe de treino, bottom sheets (`--r-xl`) para ações.

### 1.2 Estado e dados

- **TanStack Query** para dado servidor (cache, retry, revalidação) — tolera conectividade intermitente (premissa 2.4 do SRS): leitura sempre do cache primeiro, sincronização assíncrona em background.
- **Zustand** para estado local de UI (onboarding em progresso, preferências).
- Registro manual de treino funciona **offline** com fila local e envio posterior.
- Push (Expo Notifications) para "leitura pronta" e alertas de prontidão (RF-14.1/14.2).

### 1.3 Performance (RNF-1.2)

Telas principais ≤ 2 s em rede móvel: payloads agregados prontos (o motor materializa; o app não calcula), listas virtualizadas, gráficos com dado decimado pelo servidor (`?resolution=`), imagens/vídeos da biblioteca de exercícios via CDN.

## 2. Integração do design system

Fonte única: [`packages/design-tokens`](../../packages/design-tokens/) — os tokens do DS §11 exportados em três formas:

1. **`tokens.css`** — variáveis CSS para web/living style guide;
2. **`src/tokens.ts`** — objeto TS tipado (cores, tipo, espaçamento, raio, motion) consumido pelo React Native;
3. **`src/themes.ts`** — temas **claro** e **escuro** (DS §2.5) mapeando tokens → papéis semânticos (`surface`, `text`, `border`…). O modo escuro é o palco padrão dos dashboards de dado.

Regras aplicadas em código:

- Tipografia **Archivo** (display/números, `tabular-nums`) + **Inter** (texto/UI) via `expo-font`; escala do DS §3.1 exportada como estilos nomeados (`displayXL`…`label`).
- Botões pill (`--r-pill`), CTA primário único por tela com `--glow-ignite`.
- **Volt ≤ ~10% da tela** — reservado a PR/meta/streak (regra de acento do DS §2.1).
- Estado **nunca só por cor**: componentes de chip/alerta exigem `icon` + `label` por tipo (DS §2.6/10) — obrigatório no TypeScript, não opcional.
- Zonas Z1–Z5 vêm dos tokens (`zone.z1…z5`); a **barra de zonas** (componente-assinatura, DS §7.5) recebe tempo-em-zona da API e sempre renderiza legenda com percentuais.
- Dado de baixa confiança (PC-5): variação visual padronizada (opacidade/hachura) no kit de gráficos (DS §7.6).
- Acessibilidade: alvos ≥ 44 px, foco anel Pulse, fontes escaláveis, `prefers-reduced-motion` respeitado nas animações de celebração (DS §8, RNF-5.1).

### 2.1 Inventário de componentes (DS §7 → código)

| Componente | DS | Uso principal |
|---|---|---|
| `Button` (primary/secondary/outline/ghost/danger, sm/md/lg) | §7.1 | toda a UI |
| `MetricCard` (Label + número Archivo tabular + unidade leve + ▲▼) | §7.2 | dashboard |
| `WorkoutCard` (tipo, chips de zona, planejado×executado) | §7.2 | Hoje/Plano/Treinos |
| `ReadinessCard` (score vermelho→verde) | §7.2 | Hoje (Fase 2) |
| `ZoneBar` (barra segmentada tempo-em-zona + legenda) | §7.5 | leitura do treino |
| `Chip` (zona/status/filtro — sempre ícone+rótulo) | §7.3 | transversal |
| `AlertBanner` (info/warning/danger + ação sugerida) | §7.8 | prontidão e risco |
| `LoadChart` (CTL área Pulse, ATL linha n500, TSB barras divergentes) | §7.6 | dashboard carga |
| `AcwrChart` (faixa segura sombreada) | §7.6 | risco de lesão |
| `EmptyState` motivador | §7.8 | onboarding de dados |
| `MetricInfoSheet` (explicação sob demanda de métrica) | — | RNF-4.2: toda métrica avançada tem "o que é isso?" |

### 2.2 Voz e conteúdo (DS §9)

Textos de feedback e alertas seguem o tom "técnico que respeita o atleta": direto, motivador, nunca culpabilizador. Strings centralizadas em catálogo i18n (pt-BR no lançamento; arquitetura pronta p/ múltiplos idiomas e unidades métricas/imperiais — RNF-8.1). Mensagens com implicação de saúde carregam a ressalva clínica (RNF-10.1).

## 3. Web complementar (Fase 2+)

Dashboard e gestão (RNF-6.2): React + os mesmos `design-tokens` (via `tokens.css`) e contratos de API. Prioridade para visualizações grandes (tendências, calendário de temporada) e painel do treinador (Módulo 17, Fase 3).
