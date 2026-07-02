# Start Running · *powered by Variance*

Plataforma de **coaching de corrida por IA**: ingere a série temporal bruta de qualquer relógio, calcula carga, forma e prontidão com **uma única metodologia canônica** e entrega planos que evoluem com o atleta de verdade — não com o pace declarado no cadastro.

## Documentos-fonte

| Documento | Conteúdo |
|---|---|
| [Especificação de Requisitos (SRS) v1.0](docs/requisitos/especificacao-de-requisitos.md) | Visão de produto, princípios PC-1–PC-5, 18 módulos de requisitos, RNFs, roadmap em 3 fases |
| [Design System v1.0](docs/design/design-system.md) | Identidade Bold & Energético: Ignite/Pulse/Volt, Archivo+Inter, componentes, voz e tom |
| [**Arquitetura Técnica v1.0**](docs/arquitetura/README.md) | Este repositório: stack, modelo de dados, APIs, pipeline, ADRs |

## Estrutura do monorepo

```
docs/                        SRS, design system e arquitetura técnica (7 docs + 6 ADRs)
packages/
  design-tokens/             Tokens do DS §11 — CSS + TypeScript, temas claro/escuro
  domain/                    Modelo canônico tipado — camadas 0–4, zonas, métricas, plano
apps/
  mobile/                    App iOS/Android (Expo) — tabs Hoje/Plano/Treinos/Coach/Perfil
services/
  api/                       Backend NestJS — monólito modular, um módulo por épico do SRS
  metrics-engine/            Motor canônico Python — parse FIT, qualidade (PC-5), Camadas 1–3
```

## Princípios que este código obedece

1. **A série bruta é a fonte da verdade** — FIT original imutável no S3; derivadas recomputáveis e versionadas ([ADR-0006](docs/arquitetura/adr/0006-serie-bruta-fonte-da-verdade.md)).
2. **Cálculo canônico** — todas as métricas calculadas internamente com uma metodologia; scores proprietários nunca são base (PC-1/PC-2).
3. **Qualidade antes de cálculo** — confiança do dado propagada do pipeline até a UI (PC-5).
4. **Zonas configuráveis** — 3/5/7 zonas, 5 âncoras; limiar como padrão do atleta sério (PC-4).
5. **Degradação elegante** — funciona só com celular (sRPE) e enriquece com sensores.
6. **LGPD por construção** — consentimento granular, criptografia, exclusão e portabilidade (RNF-3.x).

## Desenvolvimento

```sh
pnpm install                                   # workspaces TS
pnpm -r typecheck                              # packages + apps + api
pnpm --filter @startrunning/mobile start       # app Expo
pnpm --filter @startrunning/api start:dev      # backend
cd services/metrics-engine && pip install -e ".[dev]" && pytest   # engine
```

Roadmap de implementação: [Fases 1–3 no doc de visão geral](docs/arquitetura/01-visao-geral.md#5-mapeamento-para-o-roadmap-srs-7).
