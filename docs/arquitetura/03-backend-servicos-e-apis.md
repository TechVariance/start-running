# 03 — Backend: serviços e APIs

## 1. Monólito modular (ADR-0003)

`services/api` é um NestJS com **módulos alinhados aos épicos do SRS**. Fronteiras são impostas por convenção de import (módulo só importa a *interface pública* de outro) para permitir extração futura sem retrabalho — a exigência de faseamento do SRS §1.2.

| Módulo NestJS | Épicos do SRS | Fase |
|---|---|---|
| `identity` | conta, auth, sessões (Módulo 18) | 1 |
| `consent` | LGPD: consentimentos, exclusão, portabilidade (RF-18.1/18.3) | 1 |
| `profile` | onboarding e Camada 0 (Módulo 1) | 1 |
| `integrations` | conectores OAuth, webhooks, cofre de tokens (Módulo 2) | 1 |
| `ingestion` | upload manual, registro manual, dedup, enfileiramento (Módulo 2) | 1 |
| `activities` | leitura de atividades, streams e métricas (Módulo 5, 15) | 1 |
| `zones` | configuração de zonas e limiares (PC-4, RF-3.9/3.10) | 1 |
| `training` | motor de treino: geração, adaptação, regras ACWR (Módulos 4, 6, 8) | 1 |
| `strength` | biblioteca e prescrição de fortalecimento (Módulo 11) | 1 |
| `feedback` | leitura pós-treino, alertas de risco (Módulos 5, 8) | 1 |
| `notifications` | push, lembretes, preferências (Módulo 14) | 1 |
| `billing` | assinatura via lojas/RevenueCat (Módulo 16) | 1 |
| `coach` | conversacional IA (Módulo 9) | 3 |
| `community` | grupos, desafios, feed (Módulos 12, 13) | 3 |
| `coach-panel` | painel do treinador B2B2C (Módulo 17) | 3 |
| `admin` | painel interno, conteúdo, observabilidade do motor (RF-18.4) | 1 |

O **motor de treino** vive dentro de `training` como biblioteca pura (regras de periodização codificadas por especialistas — premissa 2.4 do SRS), separada da camada HTTP; é candidata a extração na Fase 2+.

## 2. Contratos de API (REST/JSON, v1)

Prefixo `/v1`, autenticação Bearer (JWT curto + refresh). Erros no formato RFC 9457 (`application/problem+json`). Paginação por cursor. Versionamento por prefixo de rota.

### Onboarding e perfil
```
POST   /v1/auth/signup | /login | /refresh | /logout
GET    /v1/me
PUT    /v1/me/profile                  # Camada 0; recalcula derivações (RF-1.6)
POST   /v1/me/parq                     # triagem RF-1.5 → pode retornar encaminhamento
GET    /v1/me/injuries · POST · PATCH  # RF-1.4
POST   /v1/me/race-goals               # prova-alvo
GET    /v1/me/zones · PUT              # modelo 3/5/7 + âncora (PC-4)
```

### Integrações e ingestão
```
GET    /v1/integrations                          # estado das conexões
POST   /v1/integrations/{provider}/connect       # inicia OAuth (strava|garmin|…)
DELETE /v1/integrations/{provider}               # revoga + apaga tokens (RNF-3.4)
POST   /v1/webhooks/{provider}                   # entrada de eventos (assinado)
POST   /v1/activities/upload                     # multipart FIT/TCX/GPX (RF-2.4)
POST   /v1/activities/manual                     # distância, tempo, sRPE (RF-2.5)
```

### Atividades e métricas
```
GET    /v1/activities?cursor=…                   # lista com agregados Camada 1
GET    /v1/activities/{id}                       # detalhe + métricas correntes + confiança
GET    /v1/activities/{id}/streams?fields=hr,pace,power
GET    /v1/activities/{id}/feedback              # leitura da sessão (RF-5.2)
GET    /v1/load?from=…&to=…                      # CTL/ATL/TSB/ACWR p/ dashboard (RF-15.1)
GET    /v1/wellness?from=…&to=…                  # HRV, sono, FC repouso (RF-3.7)
GET    /v1/trends?metrics=ef,decoupling          # RF-5.3
```

### Plano de treino
```
POST   /v1/plans                                 # gera plano periodizado (RF-4.1) — 202 + polling se >10s (RNF-1.3)
GET    /v1/plans/current                         # fases + semana corrente
GET    /v1/plans/current/week?start=…            # planejado vs executado (RF-15.3)
POST   /v1/plans/current/regenerate              # mudança de disponibilidade/prova (RF-4.7)
GET    /v1/plans/adjustments                     # histórico com raciocínio (RF-6.4)
POST   /v1/plans/adjustments/{id}/decision       # accept | reject (RN-6.2)
GET    /v1/workouts/today                        # treino do dia + prontidão
PATCH  /v1/workouts/{id}                         # mover/pular
```

### Coach IA (Fase 3)
```
POST   /v1/coach/messages                        # streaming SSE; tool use lê dados reais (RN-9.1)
GET    /v1/coach/threads/{id}
```

### Plataforma
```
GET/PUT /v1/me/notification-preferences
POST    /v1/billing/receipts                     # validação de compra (RevenueCat webhook também)
GET     /v1/me/consents · PUT                    # granular (RNF-3.1)
POST    /v1/me/export                            # portabilidade (RF-18.3) — job assíncrono
DELETE  /v1/me                                   # exclusão LGPD com prazo legal (RNF-3.3)
```

## 3. Eventos internos e filas

Comunicação assíncrona via BullMQ (Redis); todo job é idempotente (RNF-2.3).

| Evento/Job | Produtor → Consumidor | Conteúdo |
|---|---|---|
| `activity.received` | integrations/ingestion → engine | ref do arquivo bruto no S3, fonte, sensor de FC |
| `activity.processed` | engine → api (feedback, training, notifications) | métricas correntes + confiança |
| `activity.reprocess` | admin/engine → engine | recomputar com nova `methodology_version` (RNF-9.2) |
| `load.updated` | engine → training, feedback | daily_load do atleta atualizado; dispara alertas ACWR (RF-8.2) |
| `plan.adjustment.proposed` | training → notifications | ajuste com raciocínio (RF-6.4) |
| `wellness.received` | integrations → engine | HRV/sono/FC repouso p/ prontidão (RF-6.2) |
| `billing.subscription.changed` | RevenueCat webhook → billing | estado de assinatura |

Regra de negócio aplicada no consumo: **nenhum ajuste que aumente carga é aplicado sem checar ACWR e prontidão** (RN-6.1); o consumidor `training` valida antes de propor.

## 4. Coach conversacional (Fase 3) — desenho

- Backend chama a **Claude API** com *tool use*; as ferramentas expostas são somente-leitura sobre o atleta autenticado: `get_profile`, `get_recent_activities`, `get_load_history`, `get_plan_week`, `explain_metric`.
- **RN-9.1** (nunca inventar dado) é aplicada por construção: o modelo só responde sobre métricas que as ferramentas retornam; sem dado, a instrução de sistema exige declarar a limitação.
- **RN-9.2**: respostas com implicação de saúde passam por um pós-processador que anexa a ressalva clínica padrão (RNF-10.1).
- Memória de contexto (RF-9.2): resumo persistente por atleta (objetivos, preferências, lesões) injetado na instrução de sistema.
- Ajuste via linguagem natural (RF-9.4) **não** executa direto: gera um `plan_adjustment` proposto que o atleta confirma na UI (RN-6.2).
