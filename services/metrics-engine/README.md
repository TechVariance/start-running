# Start Running — Metrics Engine

Motor de métricas canônico (Python 3.12) — o núcleo do diferencial competitivo (PC-1/PC-5). Arquitetura: [docs/arquitetura/04](../../docs/arquitetura/04-pipeline-ingestao-e-metricas.md), decisão em [ADR-0004](../../docs/arquitetura/adr/0004-motor-de-metricas-python.md).

```
src/metrics_engine/
  pipeline.py        # orquestração por sessão + METHODOLOGY_VERSION       [Fase 1 ✓]
  models.py          # série canônica + perfil — espelha packages/domain   [Fase 1 ✓]
  parsers/           # fit.py, tcx.py, gpx.py -> série canônica            [Fase 1 ✓]
  quality/           # limpeza e confiança (PC-5)                          [Fase 1 ✓]
  metrics/           # layer1 (splits/GAP/elevação)                        [Fase 1 ✓]
                     # load (TRIMP/rTSS/hrTSS/sRPE + CTL/ATL/TSB/ACWR)     [Fase 1 ✓]
                     # efficiency (Fase 2), dynamics (Fase 3)
  zones/             # 3/5/7 zonas, 5 âncoras (PC-4)                       [Fase 1 ✓]
  recalibration/     # LTHR/pace de limiar a partir do executado (Fase 2)
tests/               # suite da Fase 1 (parsers, PC-5, zonas, camada 1, carga, pipeline)
```

```sh
python3.12 -m venv .venv && .venv/bin/pip install -e ".[dev]"
.venv/bin/pytest            # suite completa
.venv/bin/ruff check src tests
```

O núcleo é **puro e determinístico** (bytes → derivadas): S3, Postgres e fila
entram apenas pelo worker (a ser plugado no módulo `ingestion` do API), o que
mantém o cálculo recomputável e testável sem infraestrutura (RNF-2.3).

Regras invioláveis:

1. **Bruto é a fonte da verdade** — o engine lê do S3 e nunca o altera (ADR-0006).
2. **Toda derivada carrega `METHODOLOGY_VERSION` + `confidence`** (RNF-7.1/9.2). Mudou fórmula ⇒ bump de versão + backfill via `activity.reprocess`.
3. **Scores proprietários de fabricante nunca entram como base de cálculo** (PC-2).
4. **Suite de regressão canônica no CI**: o mesmo treino gravado em relógios de marcas diferentes deve produzir métricas equivalentes dentro da tolerância (critério de aceite do Módulo 3); divergência acima da tolerância falha o build.

O vocabulário espelha `packages/domain` (TypeScript); mudanças no modelo canônico atualizam os dois lados no mesmo PR.
