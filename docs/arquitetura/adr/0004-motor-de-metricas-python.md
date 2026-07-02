# ADR-0004 — Motor de métricas em Python (worker separado)

**Status:** aceito · 2026-07

## Contexto
O motor canônico (PC-1/PC-5, Módulo 3) é o núcleo do diferencial: parsing FIT registro a registro, limpeza de sinal, GAP, cargas, EWMA, recalibração de limiares. Precisa ser versionável (RNF-9.2), testável contra fixtures multi-device e escalável independentemente da API (RNF-2.1).

## Decisão
Serviço worker em Python 3.12 (`services/metrics-engine`): `fitdecode` para FIT, `numpy`/`pandas` para sinal, consumindo jobs da fila e escrevendo derivadas versionadas no Postgres.

## Alternativas
- **Tudo em Node:** menos linguagens, mas o ecossistema de processamento numérico/FIT é fraco; reimplementar filtros de sinal em JS é risco no componente mais crítico.

## Consequências
+ Linguagem certa para o problema; escala e versiona isolado; a suite canônica roda no CI do pacote.
− Duas linguagens no repo; o vocabulário canônico é espelhado TS↔Python e mantido em sincronia no mesmo PR (ADR-0001).
