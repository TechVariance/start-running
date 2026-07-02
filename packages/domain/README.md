# @startrunning/domain

Modelo de domínio canônico em TypeScript — o vocabulário único da plataforma (SRS §3.2):

| Arquivo | Conteúdo |
|---|---|
| `athlete.ts` | Camada 0: perfil, lesões, prova-alvo, estimativas de limiar |
| `zones.ts` | Sistema de zonas configurável — 3/5/7 zonas, 5 âncoras (PC-4) |
| `activity.ts` | Atividade, série canônica ponto a ponto (Camadas 1–2), flags de qualidade (PC-5), registro manual |
| `metrics.ts` | Camada 3: métricas derivadas versionadas com confiança, carga diária (CTL/ATL/TSB/ACWR), wellness, Camada 4 |
| `plan.ts` | Plano periodizado, prescrição por blocos/zonas, ajustes com raciocínio, fortalecimento |

O `services/metrics-engine` (Python) espelha este vocabulário; mudanças no modelo canônico atualizam os dois lados **no mesmo PR** (ADR-0001/0004).
