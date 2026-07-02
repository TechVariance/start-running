# 07 — Observabilidade e operação

## 1. Telemetria (RNF-9.1)

Três planos, com OpenTelemetry como base (traces + métricas + logs estruturados):

**Motor de métricas (o crítico):**
- taxa de erro de ingestão por fonte/formato;
- % de dado descartado/interpolado por sessão (qualidade — PC-5);
- distribuição de `confidence` por fonte e sensor;
- latência p50/p95 do pipeline por estágio (orçamento do doc 04, alvo RNF-1.1 ≤ 2 min);
- profundidade de fila e lag de consumo (dispara autoscaling);
- divergência da suite canônica (mesmo treino, devices distintos) por versão de metodologia.

**Produto (KPIs do SRS §8):** ativação (onboarding + ≥1 fonte), aderência semanal, latência média de feedback, retenção D30/D90 por segmento, conversão trial→pago. Eventos de produto respeitam o consentimento de telemetria (doc 06).

**Plataforma:** disponibilidade por serviço (alvo 99,5% mensal — RNF-2.2), erros 5xx, saturação de banco/fila.

## 2. SLOs e alertas

| SLO | Alvo | Alerta |
|---|---|---|
| Disponibilidade API | 99,5%/mês | burn rate multi-janela |
| Feedback de sessão | p95 ≤ 2 min | fila > N ou estágio estourando orçamento |
| Carregamento de telas (RUM mobile) | p75 ≤ 2 s | regressão por release |
| Geração de plano | p95 ≤ 10 s | por versão do motor de treino |

## 3. Ambientes e CI/CD

- **Ambientes:** `dev` → `staging` (dados sintéticos + contas de teste Strava/Garmin) → `prod`. Infra como código; serviços em contêineres com autoscaling de workers por fila.
- **CI por workspace:** lint + typecheck + testes; o engine roda a **suite de regressão canônica** (fixtures FIT/TCX/GPX de devices distintos — critério de aceite do Módulo 3) e falha o build em divergência acima da tolerância.
- **Migrações** de banco versionadas e retrocompatíveis (expand/contract) — obrigatório para reprocessamento sem downtime.
- **Mudança de metodologia** (RNF-9.2): PR que altera fórmula ⇒ bump de `METHODOLOGY_VERSION` + plano de backfill; release notes internas com impacto esperado nas métricas.
- **Feature flags** por fase do roadmap: módulos da Fase 2/3 são ativados por flag, não por branch de longa duração.

## 4. Backups e recuperação

Postgres com PITR (WAL contínuo, retenção 30 dias); S3 versionado — o bruto é irrecuperável se perdido, é a fonte da verdade (ADR-0006), então replicação cross-região. RTO 4h / RPO 15 min para o núcleo.
