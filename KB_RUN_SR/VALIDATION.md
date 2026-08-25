# Relatório de validação

**Data:** 25 de agosto de 2026
**Versão:** 1.2.0-rag

## Testes executados

- Documento-fonte preservado e comparado por SHA-256.
- `MANIFEST.json` analisado como JSON válido e com contagens conferidas contra o disco.
- 20 registros YAML analisados sem erro sintático.
- Campos obrigatórios, enumerações, IDs e correspondência arquivo/ID verificados.
- 27 linhas do catálogo de fontes analisadas como JSON válido e sem IDs duplicados.
- Todas as referências `source_ids` resolvidas no catálogo.
- 17 casos do golden set analisados como JSON válido.
- Todas as referências `expected_evidence_ids` resolvidas nos registros de evidência.
- Todas as referências `BC-xxx` citadas nos módulos de distância resolvidas.
- Caminhos canônicos declarados no manifesto verificados.

## Resultado

Nenhum erro estrutural encontrado.

## Revisão científica de 20 de agosto de 2026

Primeira revisão por especialista externo. Revisor com registro CREF 088527-G/SP, 17 anos treinando corredores, conflito de interesse declarado (sócio e treinador de assessoria de corrida). Registro completo em `KB_REV_SR/relatorio-revisao-2026-08-20.md`.

Parecer: aprovado com ressalvas. Nenhuma discordância técnica em 45 fichas nas duas bases. A crítica de fundo não foi sobre correção das afirmações e sim sobre ausência de camada de aplicação por perfil de aluno: as afirmações estavam certas e escritas para o papel, sem a gradação que a prática exige.

Aplicado nesta base: 9 registros tiveram `practical_application` e `limitations` ampliados (`BC-004`, `BC-007`, `BC-010`, `BC-011`, `BC-013`, `BC-014`, `BC-016`, `BC-019`, `BC-020`); 2 deles vinham sinalizados como risco (`BC-004`, `BC-013`). Nenhum campo `claim` foi alterado, porque o revisor confirmou os conceitos. `last_reviewed` avançou para 2026-08-20 em 19 dos 20 registros.

Também aplicado: a política de segurança ganhou a idade mínima de inscrição em maratona e a conduta de ampliar descanso ao primeiro sintoma; `distances/21k.md` passou a delimitar o taper em 1 a 2 semanas; `distances/maratona.md` explicitou volume semanal e recuperação (`BC-009`) nas ênfases; o golden set ganhou 5 casos novos (`GS-013` a `GS-017`) e teve 3 casos corrigidos (`GS-003`, `GS-007`, `GS-011`).

## Pendências abertas

- **`BC-018` não foi revisado.** O revisor declarou individualização por ciclo menstrual fora da competência dele e não deixou justificativa. `last_reviewed` segue em 2026-07-18. Precisa de outro especialista.
- **Licença de fontes.** A maior parte do catálogo continua com `license_status: needs_verification`. A conferência de licença é tarefa da Variance, nunca do revisor técnico.
- **`SRC-0027` sem cobertura própria de registro.** A fonte entrou pelo apontamento do revisor na `GS-011` e hoje só aparece em `BC-020`. É estudo transversal de biomecânica em corredores de elite, gerador de hipótese, não demonstração de aumento de lesão. Não sustenta afirmação mais forte que a registrada.
- **`GS-014` sem lastro para o intervalo de 48 horas.** O caso exige separar sessões de qualidade por cerca de 48 horas, número que veio da prática do revisor e não está em nenhum registro. Falta um registro sobre frequência e espaçamento entre sessões.
- **`GS-017` sem lastro nenhum.** O caso sobre pisada e calçado corretivo foi proposto pelo revisor e não tem registro de evidência que o sustente. `BC-020` cobre placa de carbono e espuma, não prescrição de calçado por tipo de pisada. Enquanto não houver registro próprio, o agente responderá esse caso por conhecimento geral, o que a política de respostas proíbe quando o tema é coberto pela base, e não proíbe quando não é. É a lacuna mais visível desta rodada.
- **Distribuição de níveis de evidência.** 18 dos 20 registros seguem em nível A e nenhum tem `confidence: low`. A revisão não questionou isso, mas a concentração continua atípica.

## Lacunas de conteúdo apontadas pelo revisor

Nenhuma virou registro de evidência, porque criar registro exige fonte e a fonte não foi levantada. Ficam como pauta da próxima rodada:

- Importância da corrida/caminhada no início dos programas de adaptação.
- Protocolo de adaptação após períodos de lesão ou doença.
- Tempos e marcas intermediárias para projetar prova mais longa, por exemplo 1h26 na meia para uma maratona sub 3h.
- Ajuste da sessão entre esteira e rua, em especial quando o treino é dado por distância e o wearable mede distância mal em ambiente interno.

## Integridade da fonte-mestra

`f4288874081f6b1d794eee7d7377ba56f03bb3226df74c28127c135c4308a25f`

`source_master/KB_RUN_SR.md` continua íntegro na versão 1.0 e por isso **não** reflete os ajustes desta revisão. O manifesto ainda o declara como `canonical_source`. Enquanto essa divergência existir, o conteúdo vigente é o de `evidence/`, `policies/` e `distances/`.
