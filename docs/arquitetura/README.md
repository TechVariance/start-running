# Arquitetura Técnica — Start Running

**Produto:** Start Running · powered by Variance
**Versão:** 1.0 · Julho de 2026
**Base:** [Especificação de Requisitos (SRS) v1.0](../requisitos/especificacao-de-requisitos.md) e [Design System v1.0](../design/design-system.md)

Este é o documento de arquitetura técnica referido na Seção 6 do SRS: detalha stack, modelo de dados físico, contratos de API e decisões de implementação. Os princípios de produto **PC-1 a PC-5** e os requisitos **RNF-x** do SRS são vinculantes para tudo o que está aqui.

## Documentos

| Doc | Conteúdo |
|---|---|
| [01 — Visão geral](01-visao-geral.md) | Drivers, diagrama de contêineres (C4), stack, estrutura do monorepo, mapeamento para o roadmap |
| [02 — Dados e domínio](02-dados-e-dominio.md) | Modelo canônico, camadas 0–4, esquema físico (Postgres/Timescale), versionamento de métricas |
| [03 — Backend: serviços e APIs](03-backend-servicos-e-apis.md) | Módulos do backend, contratos REST, eventos e filas |
| [04 — Pipeline de ingestão e métricas](04-pipeline-ingestao-e-metricas.md) | Conectores, qualidade de dado (PC-5), motor canônico, idempotência, orçamento de latência |
| [05 — Apps cliente e design system](05-apps-cliente-e-design-system.md) | Arquitetura do app mobile/web, navegação, estado, integração dos design tokens |
| [06 — Segurança, privacidade e LGPD](06-seguranca-privacidade-lgpd.md) | Consentimento, criptografia, cofre de tokens, direitos do titular, limites clínicos |
| [07 — Observabilidade e operação](07-observabilidade-e-operacao.md) | Telemetria do motor, SLOs, ambientes, CI/CD |
| [08 — Conectores de wearables](08-conectores-wearables.md) | Garmin (OAuth2+PKCE, webhook, FIT) e Apple Watch (HealthKit → healthkit_json), portas e pendências de produção |

## Decisões de arquitetura (ADRs)

| ADR | Decisão |
|---|---|
| [0001](adr/0001-monorepo-pnpm.md) | Monorepo com pnpm workspaces |
| [0002](adr/0002-mobile-react-native-expo.md) | Mobile com React Native + Expo |
| [0003](adr/0003-backend-monolito-modular-nestjs.md) | Backend como monólito modular (NestJS/TypeScript) |
| [0004](adr/0004-motor-de-metricas-python.md) | Motor de métricas em Python (worker separado) |
| [0005](adr/0005-postgres-timescale-s3.md) | PostgreSQL + TimescaleDB + object storage S3 |
| [0006](adr/0006-serie-bruta-fonte-da-verdade.md) | Série bruta como fonte da verdade; métricas derivadas recomputáveis e versionadas |
| [0007](adr/0007-carga-unificada-multiesporte.md) | Carga unificada multiesporte (PC-6): uma moeda TSS para corrida, natação e musculação |

## Mapa do repositório

```
startrunning/
├── docs/                      # SRS, design system e esta arquitetura
├── packages/
│   ├── design-tokens/         # Tokens do design system (CSS + TS, temas claro/escuro)
│   └── domain/                # Modelo de domínio canônico tipado (TypeScript)
├── apps/
│   └── mobile/                # App iOS/Android (Expo / React Native)
├── services/
│   ├── api/                   # Backend principal (NestJS, monólito modular)
│   └── metrics-engine/        # Motor de métricas canônico (Python)
└── ...
```
