# ADR-0001 — Monorepo com pnpm workspaces

**Status:** aceito · 2026-07

## Contexto
Apps mobile/web, backend e motor de métricas compartilham o modelo canônico e os design tokens. O SRS exige faseamento sem retrabalho e um vocabulário único de métricas.

## Decisão
Monorepo com pnpm workspaces: `packages/` (domain, design-tokens), `apps/` (mobile), `services/` (api, metrics-engine). O engine Python vive no mesmo repo para que mudanças no modelo canônico atualizem TS e Python no mesmo PR.

## Consequências
+ Tipos e tokens compartilhados sem publicação de pacotes; refactors atômicos; uma esteira de CI.
− CI precisa de filtros por workspace; o time inteiro clona tudo (aceitável no tamanho atual).
