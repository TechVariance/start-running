# Especificação — Módulos Natação e Musculação

**Extensão do SRS v1.0** · Status: aprovada para arquitetura · 2026-07-11

O SRS v1.0 §1 colocava modalidades fora da corrida como "evolução futura". Este documento ativa essa evolução: especifica os módulos **Natação (Módulo 19)** e **Musculação (Módulo 20** — evolução do Módulo 11, que ele absorve**)**, e estabelece o princípio vinculante de que **corrida, natação e musculação são um único sistema de treino**, não três apps num só ícone.

---

## 1. Pesquisa de mercado

### 1.1 Natação

| App | Proposta | O que faz bem | Onde falha |
|---|---|---|---|
| **MySwimPro** | Planos personalizados + coaching (líder da categoria) | Planos por objetivo (velocidade, resistência, tri), workout do dia, técnica com vídeo, dryland integrado, AI coach | Natação isolada do resto do treino do atleta; carga não conversa com corrida/força; paywall agressivo cedo |
| **FORM Swim** | Óculos com display AR + app | Dado em tempo real na água (pace, tempo, FC), programas guiados no óculos, precisão alta | Depende de hardware proprietário (~US$250+); sem visão multiesporte; dado preso ao ecossistema |
| **Swim.com** | Tracking social | Registro simples multi-relógio, comunidade, ranking por piscina | Análise rasa: conta metros mas não modela carga nem prescreve |
| **Garmin/Apple (nativos)** | Métricas de dispositivo | SWOLF automático, detecção de estilo, CSS auto (Garmin), FC no pulso na água | Scores proprietários não comparáveis (o problema PC-1/PC-2 de sempre); prescrição genérica |

**Leitura:** ninguém entrega natação **contextualizada** com o restante do treino. Quem nada e corre usa 2–3 apps que não se falam — a carga de ontem na piscina não modula o tiro de hoje na pista em nenhum concorrente consumer.

### 1.2 Musculação

| App | Proposta | O que faz bem | Onde falha |
|---|---|---|---|
| **Hevy** | Log + social (free tier forte) | Registro de séries rápido e sem fricção, histórico por exercício, 1RM estimado, templates, social opcional | Não prescreve; não conhece o "porquê" (força para quê?); carga não integra com endurance |
| **Strong** | Log minimalista | A melhor UX pura de registro da categoria: abrir → logar → sair; placas/anilhas calculadas; Apple Watch | Zero prescrição e zero contexto; assinatura só para recursos básicos (múltiplas rotinas) |
| **Fitbod** | Prescrição por IA | Gera o treino do dia por fadiga muscular estimada, equipamento e histórico; rotação de grupos musculares | Caixa-preta (fórmula fechada = anti-PC-2); ignora o treino de endurance do atleta; caro (US$12,99/mês) |
| **Jefit / TrainHeroic** | Biblioteca + programas de coach | Biblioteca enorme com vídeo; programas de treinadores reais | UX datada (Jefit); foco em quem VIVE de musculação, não em atleta de endurance que usa força como meio |

**Leitura:** o mercado se divide entre *logs excelentes sem cérebro* (Hevy, Strong) e *cérebros fechados sem contexto* (Fitbod). Para o corredor/nadador, musculação é **meio** (economia de corrida, prevenção, potência) — nenhum app trata assim.

### 1.3 DOs — o que os melhores fazem e vamos absorver

**Funcionalidade**
1. **Registro em < 10 s por série** (Strong/Hevy): pesos e reps pré-preenchidos da última sessão; teclado numérico otimizado; timer de descanso automático.
2. **Workout do dia pronto ao abrir** (MySwimPro/Fitbod): decisão zero — o atleta abre e executa.
3. **Progressão visível por exercício/estilo** (Hevy): 1RM estimado, recordes, gráficos por movimento; na natação, pace/SWOLF por estilo.
4. **Treino estruturado executável no dispositivo** (FORM/Garmin): série de natação enviada ao relógio (Training API — doc 08); ficha de força no telefone com o próximo set em destaque.
5. **Biblioteca com vídeo curto e cues de execução** (Jefit), filtrável por equipamento disponível (Fitbod).
6. **CSS e zonas de pace de natação** (Garmin/tri): teste 400/200 ⇒ CSS = 200 ÷ (T400−T200) por 100 m; zonas ancoradas no CSS como o limiar ancora a corrida (PC-4).
7. **Dryland/força integrada ao plano da modalidade** (MySwimPro) — no nosso caso, ao plano GERAL.

**UX**
8. **Modo "mãos molhadas/luva"**: alvos de toque grandes, alto contraste, mínimo de texto durante a execução (aprendizado do FORM).
9. **Free tier utilizável de verdade** (Hevy): logar e ver o próprio histórico nunca é pago; a inteligência (prescrição, integração de carga) é o premium.
10. **Social opcional e silencioso por padrão** (Hevy): comparação é opt-in; o padrão é o atleta contra ele mesmo.

### 1.4 DON'Ts — erros que NÃO vamos repetir

1. **Modalidade-ilha**: o erro estrutural de todos — carga de natação/força invisível para o plano de corrida. *No Start Running isso é violação de princípio (PC-6, §2).*
2. **Score proprietário como base** (Fitbod "muscle recovery", Garmin load): fórmula fechada não entra no cálculo — recalculamos tudo da série/registro bruto (PC-1/PC-2).
3. **Paywall na frente do registro**: cobrar para logar treino mata o hábito que alimenta o modelo de carga (RF-2.5 vale para as três modalidades).
4. **Hardware obrigatório** (FORM): tudo funciona com registro manual; sensor só enriquece (RN-1.2).
5. **Gamificação ruidosa**: badge por abrir o app desvaloriza o marco real (DS §7.8 — Volt só para conquista de verdade).
6. **Formulário de 15 campos por série** (Jefit): fricção no registro = abandono; capturamos o mínimo e derivamos o resto.
7. **Ignorar interferência**: prescrever perna pesada na véspera do tiro de pista é erro de treinador — nenhum app previne; o nosso motor tem que prevenir (RN-20.2).

---

## 2. Princípio vinculante PC-6 — Um atleta, um sistema de carga

> **PC-6:** Corrida, natação e musculação compartilham o mesmo modelo de carga, a mesma prontidão e o mesmo plano. Toda sessão — de qualquer modalidade — produz carga na mesma moeda (TSS-like), alimenta o mesmo CTL/ATL/TSB e ACWR, e o motor de treino considera as três ao prescrever qualquer uma. Módulo que não respeita PC-6 não entra em produção.

Consequências concretas:

1. **Carga unificada:** hrTSS/rTSS (corrida) + sTSS por CSS (natação) + carga de força (tonelagem×RPE normalizada) somam no `daily_load` único. Séries por modalidade existem para análise; a decisão usa o total (ADR-0007).
2. **Prontidão única:** HRV/sono/FC repouso modulam as TRÊS modalidades. Prontidão baixa ⇒ o ajuste escolhe onde cortar (ex.: mantém técnica de nado, corta tiro de corrida).
3. **Interferência modelada:** força pesada de membros inferiores gera janela de proteção (24–48 h) antes de sessões-chave de corrida; o calendário previne conflito na prescrição (RN-20.2).
4. **Contexto cruzado na leitura:** a leitura do treino de corrida cita a musculação de ontem quando relevante ("pace caiu 3% — esperado, agachamento pesado ontem"); o coach IA enxerga as três (RF-9.x).
5. **Transferência visível:** dashboards mostram correlações (ex.: bloco de força ↔ economia de corrida/EF; volume de nado ↔ FC repouso) — sempre como tendência com confiança, nunca causalidade mágica (PC-5).

---

## 3. Módulo 19 — Natação

| ID | Prioridade | Requisito |
|---|---|---|
| RF-19.1 | Must | Ingestão de natação de piscina e águas abertas via FIT (Garmin — mensagens `length`/`lap`) e HealthKit, pelo mesmo pipeline canônico (doc 04): bruto imutável → qualidade → derivadas versionadas. |
| RF-19.2 | Must | Registro manual de nado (distância, tempo, estilo predominante, sRPE) — Camada 4, mesmo caminho do RF-2.5. |
| RF-19.3 | Must | Métricas canônicas por sessão: pace/100 m, SWOLF por piscina, contagem de braçadas, distância por braçada, tempo por estilo, séries/descansos detectados. |
| RF-19.4 | Must | **CSS (Critical Swim Speed)** como âncora de limiar: teste 400/200 guiado no app ⇒ CSS = 200 ÷ (T400−T200); zonas de pace de nado ancoradas em %CSS (mesmo motor PC-4, âncora `pct_css`). |
| RF-19.5 | Must | Carga de sessão **sTSS** = horas × (CSS/pace médio)² × 100 (mesma família do rTSS); com FC disponível, hrTSS de nado como alternativa — a melhor entra no `daily_load` unificado (PC-6). |
| RF-19.6 | Must | Recalibração do CSS a partir do executado (equivalente do RF-3.10), com procedência e confiança. |
| RF-19.7 | Should | Plano de natação integrado: sessões de nado prescritas no MESMO calendário, respeitando prontidão e carga total; envio da série estruturada ao relógio via Training API (doc 08). |
| RF-19.8 | Should | Biblioteca de séries (aquecimento/técnica/principal/soltura) com notação padrão (ex.: 8×50 @1:00) e drills com vídeo. |
| RF-19.9 | Could | Águas abertas: distância por GPS com suavização própria (drift na água é pior — PC-5), sighting e pacing de prova. |
| RN-19.1 | — | SWOLF e pace são POR PISCINA (25 m/50 m/jardas): comparações só entre piscinas equivalentes; a UI nunca mistura. |
| RN-19.2 | — | FC óptica na água tem confiança reduzida (arrasto + contato): peso máximo 0,6 no estágio de qualidade; sem FC, sTSS por pace é o caminho padrão. |

## 4. Módulo 20 — Musculação (absorve o Módulo 11)

| ID | Prioridade | Requisito |
|---|---|---|
| RF-20.1 | Must | Registro de sessão de força em < 10 s/série: exercício → séries × reps × carga (kg) × RPE opcional; última execução pré-preenchida; timer de descanso automático. |
| RF-20.2 | Must | Biblioteca de exercícios com vídeo curto, cues, grupos musculares e equipamento; filtro por equipamento disponível do atleta (Camada 0). |
| RF-20.3 | Must | Métricas canônicas por sessão: tonelagem (Σ reps×carga), séries por grupo muscular, 1RM estimado (Epley) por exercício, recordes e progressão. |
| RF-20.4 | Must | Carga de sessão de força na moeda comum: **strength-load = sRPE (RPE×min)** como base universal, refinada por tonelagem relativa quando houver registro completo — entra no `daily_load` unificado (PC-6). |
| RF-20.5 | Must | Prescrição integrada à fase do plano (herda RF-11.2): força-base/força-máxima/potência/manutenção conforme periodização da corrida ou natação; adaptação a lesões e equipamento (herda RF-11.3). |
| RF-20.6 | Must | **Prevenção de interferência (RN-20.2)**: o motor não agenda força pesada de membros inferiores nas 24–48 h anteriores a sessão-chave de corrida; conflitos existentes geram alerta com sugestão de troca. |
| RF-20.7 | Should | Execução guiada: ficha da sessão com próximo set em destaque, modo academia (toques grandes, uma mão), check por série. |
| RF-20.8 | Should | Ingestão de treinos de força do Apple Watch/Garmin (workout de força com FC) para capturar carga cardiovascular da sessão. |
| RF-20.9 | Could | Detecção de estagnação por exercício (platô de 1RM estimado) com sugestão de variação. |
| RN-20.1 | — | Musculação NUNCA aparece como "queima de calorias": a narrativa é função (economia, prevenção, potência) — voz do DS §9. |
| RN-20.2 | — | Janela de interferência configurável por atleta (default 36 h) entre força pesada de MMII e sessões-chave de endurance. |

## 5. Requisitos transversais (as três modalidades)

| ID | Prioridade | Requisito |
|---|---|---|
| RF-21.1 | Must | `daily_load`, CTL/ATL/TSB e ACWR calculados sobre a carga TOTAL, com decomposição por modalidade disponível na análise (PC-6, ADR-0007). |
| RF-21.2 | Must | Tela Hoje unificada: o treino do dia pode ser de qualquer modalidade; prontidão e alertas de carga são únicos. |
| RF-21.3 | Must | Coach IA com contexto das três modalidades na mesma conversa (RF-9.x estendido). |
| RF-21.4 | Should | Dashboard de distribuição de carga por modalidade (semana/bloco) e correlações de transferência com confiança. |
| RNF-21.1 | — | Glossário (docs/glossario) ganha os termos novos (CSS, SWOLF, sTSS, tonelagem, 1RM, interferência) no mesmo PR que os implementar. |

## 6. Roadmap de entrada

| Fase | Entrega |
|---|---|
| **F-a (junto ao MVP+)** | Registro manual das duas modalidades (RF-19.2, RF-20.1) + carga na moeda comum (RF-19.5 via sRPE, RF-20.4) + Hoje unificado (RF-21.2). Baixo custo, ativa PC-6 desde o início. |
| **F-b** | Ingestão FIT/HealthKit de nado (RF-19.1/19.3), CSS + zonas (RF-19.4), biblioteca de força (RF-20.2/20.3), prevenção de interferência (RF-20.6). |
| **F-c** | Planos integrados (RF-19.7, RF-20.5 completo), Training API no relógio, dashboards de transferência (RF-21.4), águas abertas (RF-19.9). |

---

*Fontes da pesquisa: [MySwimPro](https://www.myswimpro.com/), [comparativos de apps de natação 2026](https://www.aquaplan.fit/blog/best-swim-apps-2026), [FORM Swim](https://bestswimgoggles.com/top-5-best-swimming-app/), [Hevy vs Strong vs Fitbod 2026](https://www.sensai.fit/blog/hevy-vs-strong-vs-fitbod-vs-jefit), [Fitbod](https://fitbod.me/blog/best-workout-tracker-apps-for-2026/), [CSS/SWOLF — Garmin](https://www8.garmin.com/manuals/webhelp/garminswim2/EN-US/GUID-9481691E-B9E0-4793-BDF7-4F78D8703E2B.html), [Critical Swim Speed](https://triathlonpace.com/articles/estimate-your-critical-swim-speed-using-garmin-or-race-results).*
