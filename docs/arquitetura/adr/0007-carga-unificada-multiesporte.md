# ADR-0007 — Carga unificada multiesporte (PC-6)

**Status:** aceita · 2026-07-11 · decorre da [especificação Natação/Musculação](../../requisitos/especificacao-modulos-natacao-musculacao.md)

## Contexto

Os módulos Natação (19) e Musculação (20) entram na plataforma. A pesquisa de mercado mostrou que TODOS os concorrentes tratam modalidades como ilhas: a carga da piscina não modula o treino de pista em nenhum app consumer. O SRS agora exige o contrário (PC-6): um atleta, um sistema de carga.

## Decisão

1. **Uma moeda de carga.** Toda sessão produz carga na família TSS (100 = 1 h no limiar da modalidade): corrida hrTSS/rTSS/TRIMP/sRPE (como hoje); natação **sTSS** = horas × (CSS/pace)² × 100, com sRPE como fallback; musculação **sRPE** (RPE×min) como base universal, refinável por tonelagem relativa. A hierarquia de degradação elegante vale por modalidade.
2. **Séries únicas, decompostas.** `daily_load` (CTL/ATL/TSB/ACWR) é calculada sobre a carga TOTAL do dia; a decomposição por modalidade é persistida junto (`daily_load.by_sport` jsonb) para análise e dashboards, mas alerta e prescrição usam o total.
3. **Âncoras por modalidade no mesmo motor de zonas (PC-4).** O motor de zonas ganha a âncora `pct_css` (pace de nado por 100 m); a semântica invertida de pace já existe (`pct_threshold_pace`). Perfil do atleta (Camada 0) ganha `css_s_per_100m` com a mesma mecânica de procedência/confiança dos demais limiares.
4. **Interferência é restrição do motor de treino, não do motor de métricas.** A janela de proteção força-pesada ⇒ sessão-chave (RN-20.2) vive no módulo `training` como restrição de agendamento; o motor de métricas apenas fornece a classificação da sessão (pesada/leve, MMII/MMSS).
5. **`sport` passa a ser dimensão de primeira classe** no domínio (`'run' | 'swim' | 'strength'`), nos dois lados (TS e Python) no mesmo PR, como manda o doc 01 §4. Atividades de força não têm série temporal obrigatória: o registro estruturado (exercícios/séries/reps/carga) é o "bruto" delas — serializado canonicamente e hasheado como qualquer FIT (RNF-2.3).

## Consequências

- O metrics-engine ganha `metrics/swim.py` (sTSS, SWOLF, pace/100 m) e `metrics/strength.py` (tonelagem, 1RM Epley, classificação de sessão); `load.py` e `daily_load` passam a receber contribuições de qualquer modalidade sem mudança estrutural (a moeda já era comum).
- O API ganha o módulo `swimming` e o módulo `strength` é promovido de stub a Módulo 20; ambos publicam na MESMA fila `activity.received`/`strength_session.recorded`.
- Comparabilidade preservada: nada de somar "minutos" ou "calorias" — só carga na moeda TSS entra no modelo (PC-1/PC-2 continuam valendo por modalidade).
- Risco aceito: sTSS e strength-load têm literatura menos consolidada que o TSS de corrida; mitigação = versão de metodologia + backfill (RNF-9.2), como qualquer fórmula nossa.
