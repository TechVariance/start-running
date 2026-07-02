# ADR-0002 — Mobile com React Native + Expo

**Status:** aceito · 2026-07

## Contexto
RNF-6.1 exige iOS e Android com paridade de recursos essenciais; RNF-6.2 pede web complementar; o diferencial é UX premium com dashboards de dado, não features nativas profundas (sem gravação de treino por GPS em v1 — a ingestão vem de relógios e APIs).

## Decisão
React Native + Expo (TypeScript, Expo Router). Push, OAuth, fontes e billing via módulos Expo/RevenueCat. Web complementar reusa componentes e tokens.

## Alternativas
- **Nativo duplo (Swift/Kotlin):** melhor acesso a HealthKit/sensores, mas dobra o custo de paridade — injustificado quando o dado vem de APIs de terceiros.
- **Flutter:** viável, porém o ecossistema TS unifica app + backend + domain package.

## Consequências
+ Uma base de código, iteração rápida de UX (o diferencial premium), OTA updates.
− HealthKit (RF-2.3, Should/Fase 3) exigirá módulo nativo/config plugin — aceito.
