# Start Running — API

Monólito modular NestJS. Arquitetura: [docs/arquitetura/03](../../docs/arquitetura/03-backend-servicos-e-apis.md).

- Um módulo por épico do SRS (`src/modules/*`); fronteiras por interface pública (lint `eslint-plugin-boundaries` a configurar).
- Processamento pesado **não** acontece aqui: ingestão grava o bruto no S3 e enfileira (`activity.received`); o cálculo é do [`metrics-engine`](../metrics-engine/).
- Contratos REST em `/v1` (doc 03 §2); eventos/filas BullMQ (doc 03 §3).
- Módulos da Fase 3 (`coach`, `community`, `coach-panel`) entram por feature flag.

```sh
pnpm install
pnpm --filter @startrunning/api start:dev
```
