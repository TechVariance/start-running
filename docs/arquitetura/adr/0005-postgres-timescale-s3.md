# ADR-0005 — PostgreSQL + TimescaleDB + object storage S3

**Status:** aceito · 2026-07

## Contexto
O domínio é relacional (atletas, planos, assinaturas), mas cada treino traz ~3.600+ pontos de série temporal (1 Hz), e os arquivos FIT originais devem ser preservados imutáveis (PC-3, fonte da verdade).

## Decisão
- **PostgreSQL 16** para o domínio;
- **TimescaleDB** (extensão) para `activity_stream` — hypertable com compressão nativa, consultas por janela e retenção configurável, sem operar um segundo banco;
- **S3** para FIT/TCX/GPX brutos, versionado e replicado cross-região.

## Alternativas
- Banco de série temporal dedicado (Influx/Clickhouse): poder analítico maior, custo operacional e de consistência que não se justifica na fase atual; migração futura fica isolada atrás do repositório de streams.
- Guardar séries só como JSON no Postgres: barato, mas mata consultas por janela e decimação server-side (RNF-1.2).

## Consequências
+ Uma tecnologia primária de banco; transações entre domínio e derivadas; compressão de streams.
− Extensão Timescale exige ambiente compatível (self-hosted/Timescale Cloud) — aceito.
