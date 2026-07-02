# 06 — Segurança, privacidade e LGPD

Dados de treino e saúde são **dados pessoais sensíveis** (Lei 13.709/2018, art. 5º II). Este documento cobre RNF-3.x e RNF-10.1.

## 1. Consentimento (RNF-3.1)

- Consentimento **explícito, informado e granular**, coletado no onboarding e gerenciável em Perfil → Privacidade. Finalidades separadas: (a) processamento de treino/saúde para coaching; (b) HRV/sono; (c) notificações; (d) telemetria de produto.
- Tabela `consent` com trilha: finalidade, versão do texto, timestamp, origem (tela), revogações. Revogar (b) interrompe ingestão de wellness sem afetar (a).
- Nenhum pipeline processa dado de uma finalidade sem consentimento ativo — verificação no enfileiramento, não só na UI.

## 2. Criptografia e segredos (RNF-3.2, RNF-3.4)

- **Trânsito:** TLS 1.2+ em tudo (apps↔API, API↔terceiros, serviços internos).
- **Repouso:** criptografia de disco no Postgres e S3; colunas de maior sensibilidade (tokens OAuth, respostas PAR-Q) com criptografia de aplicação (AES-256-GCM, chaves no KMS com rotação).
- **Cofre de tokens de terceiros:** tokens Strava/Garmin com **escopo mínimo** de leitura, criptografados, nunca logados; desconexão do provedor ⇒ revogação remota + apagamento imediato (RNF-3.4).
- Segredos de serviço via secret manager do ambiente; nada em repositório.

## 3. Direitos do titular (RNF-3.3, RF-18.1/18.3)

| Direito | Implementação |
|---|---|
| Acesso/correção | Perfil editável (RF-1.6) + `GET /v1/me/*` |
| Portabilidade | `POST /v1/me/export` — job assíncrono gera pacote (JSON + arquivos FIT originais) com link expira-em-7-dias |
| Exclusão | `DELETE /v1/me` — soft delete imediato (conta inacessível) + apagamento físico de dados pessoais dentro do prazo legal; brutos no S3 deletados; agregados anonimizados apenas se não reidentificáveis |
| Revogação de consentimento | por finalidade, efeito imediato no pipeline |

## 4. Auditoria e minimização (RNF-3.5)

- `audit_log` de todo acesso administrativo a dado sensível (quem, o quê, quando, justificativa) — o painel admin (RF-18.4) só acessa dado de atleta via ações auditadas.
- Retenção: telemetria bruta 13 meses; logs de acesso 6 meses; dado de treino enquanto a conta existir (é o produto). Política revisada por DPO.
- Minimização: conectores pedem apenas escopos de leitura de atividade/wellness; nada de contatos, localização contínua ou social graph.

## 5. Segurança de aplicação

- Auth: JWT de curta duração + refresh rotativo; Sign in with Apple/Google; rate limiting e bloqueio progressivo.
- Webhooks de terceiros validados por assinatura/segredo por provedor.
- Autorização por recurso: todo acesso é filtrado por `athlete_id` do token (inclusive ferramentas do coach IA — o modelo só lê o atleta autenticado).
- OWASP ASVS L2 como baseline; dependabot + SAST no CI; pentest antes do GA.

## 6. Limites clínicos (RNF-10.1, RF-1.5)

- Triagem PAR-Q no onboarding; resposta de risco ⇒ bloqueio suave com encaminhamento a avaliação profissional antes de plano de intensidade.
- Nenhum texto do produto (inclusive coach IA — RN-9.2) emite diagnóstico ou prescrição médica; catálogo de strings com ressalvas revisadas.
- Mecânicas de engajamento auditadas contra RN-13.1 (nunca incentivar treinar doente/fatigado); alertas de risco (ACWR fora da zona) têm sempre ação sugerida conservadora.
