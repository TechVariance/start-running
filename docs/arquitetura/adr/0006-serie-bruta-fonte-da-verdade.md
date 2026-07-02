# ADR-0006 — Série bruta como fonte da verdade; derivadas recomputáveis e versionadas

**Status:** aceito · 2026-07 · **Origem:** princípio arquitetural vinculante do SRS §6

## Contexto
A metodologia de cálculo vai evoluir (recalibração, novas métricas, correções). Concorrentes que guardam só agregados não conseguem corrigir o passado; o SRS exige comparabilidade e evolução sem perda de histórico (PC-1, RNF-9.2).

## Decisão
1. O arquivo bruto (FIT > TCX > GPX) é gravado **imutável** no S3 antes de qualquer processamento; hash `sha256` é a identidade.
2. Toda métrica derivada carrega `methodology_version` e `confidence`; nada de derivada sobrescrever bruto.
3. Reprocessamento é uma operação de primeira classe (`activity.reprocess`): nova versão convive com a antiga até o backfill completar (`is_current`).
4. Scores proprietários de fabricante nunca entram como base de cálculo (PC-2) — quando ingeridos, são gravados como sinal secundário rotulado.

## Consequências
+ Correções e evoluções da metodologia se aplicam retroativamente; auditabilidade total ("por que meu CTL mudou?" tem resposta versionada).
− Custo de storage (aceito: brutos são pequenos, ~100KB–1MB/treino) e disciplina de versionamento em todo o engine.
