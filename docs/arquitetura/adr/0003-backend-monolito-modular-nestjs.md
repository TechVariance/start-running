# ADR-0003 — Backend como monólito modular (NestJS)

**Status:** aceito · 2026-07

## Contexto
O SRS cobre 18 módulos faseados em 3 fases. Microserviços no dia 1 multiplicariam custo operacional para um time pequeno; um monólito sem fronteiras impediria a extração futura (retrabalho que o SRS §1.2 proíbe).

## Decisão
Um serviço NestJS (`services/api`) com módulos alinhados aos épicos do SRS e fronteiras impostas por convenção de import (só interface pública entre módulos). Processamento pesado fica fora, no `metrics-engine` (ADR-0004), desacoplado por fila.

## Consequências
+ Deploy e transações simples; refactor barato enquanto o domínio assenta; extração posterior guiada pelas fronteiras já existentes (candidatos: training engine, coach IA).
− Disciplina de fronteira exige lint rule (`eslint-plugin-boundaries`) e revisão.
