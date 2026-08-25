# Relatório de validação

**Data:** 25 de agosto de 2026
**Versão:** 1.1.0-rag

Validações concluídas:

- fonte-mestra comparada por SHA-256;
- manifesto e esquema analisados como JSON válido, com contagens conferidas contra o disco;
- 25 registros YAML sem erro sintático ou campo obrigatório ausente;
- IDs de arquivo e registro correspondentes e sem duplicidade;
- 27 fontes JSONL válidas e todas as referências resolvidas;
- 15 casos do golden set válidos e com IDs resolvidos;
- todas as referências `BM-xxx` citadas nos módulos resolvidas;
- caminhos canônicos do manifesto existentes.

**Resultado:** nenhum erro estrutural encontrado.

## Correção estrutural aplicada

Os 25 registros tinham `limitations` como sequência de fluxo de uma linha (`limitations: [texto]`). Em quatro deles (`BM-001`, `BM-020`, `BM-023`, `BM-024`) o texto continha vírgula, e um leitor YAML estrito quebrava a frase em itens sem sentido. Os geradores contornavam isso tratando o campo como valor único. Todos os 25 passaram para lista em bloco, o que elimina a ambiguidade na origem e dispensa o contorno.

## Revisão científica de 20 de agosto de 2026

Primeira revisão por especialista externo. Revisor com registro CREF 088527-G/SP, 17 anos treinando corredores, conflito de interesse declarado (sócio e treinador de assessoria de corrida). Registro completo em `KB_REV_SR/relatorio-revisao-2026-08-20.md`.

Parecer: aprovado com ressalvas. Nenhuma discordância técnica. A crítica de fundo foi a ausência de camada de aplicação por perfil de aluno, e nesta base ela tem um recorte próprio: o revisor lê musculação sempre como suporte à corrida, não como objetivo em si, e vários ajustes puxam o conteúdo nessa direção.

Aplicado nesta base: 15 registros tiveram `practical_application` e `limitations` ampliados (`BM-002`, `BM-005`, `BM-007`, `BM-008`, `BM-009`, `BM-010`, `BM-011`, `BM-012`, `BM-014`, `BM-015`, `BM-016`, `BM-019`, `BM-021`, `BM-023`, `BM-024`). Nenhum campo `claim` foi alterado. `last_reviewed` avançou para 2026-08-20 em 24 dos 25 registros.

Uma mudança de metadado, por inviabilidade de aplicação e não por fragilidade da evidência: `BM-012` passou de `applicability: direct` para `partial`, porque a autoregulação por velocidade pressupõe acelerômetro, equipamento caro e de pouco acesso para este público.

O `BM-024` teve só o escopo explicitado no texto: BFR está fora do universo de uso do app e não deve ser proposto de forma ativa. O registro segue `active` de propósito, porque é ele que sustenta a resposta segura do caso `GM-009`.

Também aplicado: a política de segurança ganhou seção de suplementos, com a regra de não recomendar suplemento nem a maior de idade, e seção sobre estimulante somado a privação de sono; 10 casos do golden set foram alterados. Quatro vieram de apontamento direto do revisor (`GM-004`, `GM-008`, `GM-010`, `GM-014`); os outros seis (`GM-002`, `GM-003`, `GM-006`, `GM-009`, `GM-013`, `GM-015`) foram alinhados às mudanças nos registros correspondentes e não passaram por revisão.

## Pendências abertas

- **`BM-020` não foi revisado.** O revisor declarou proteína fora da competência dele e não deixou justificativa. `last_reviewed` segue em 2026-07-18. Precisa de nutricionista. A pendência tem alcance maior que o registro: `BC-019`, sobre corredores masters, também esbarra em ingestão proteica e ficou limitada por isso.
- **`GM-006` nunca foi apresentado ao revisor.** O golden set tem 15 casos e o formulário mostrou 14. O caso que ficou de fora é sobre adolescente de 15 anos testando carga máxima sozinho, ou seja, justamente um caso de segurança com menor. Foi corrigido nesta rodada por coerência com `BM-023`, mas sem passar por revisão técnica. Investigar se o corte foi deliberado no gerador do formulário ou defeito.
- **Licença de fontes.** A maior parte do catálogo continua com `license_status: needs_verification`.
- **Distribuição de níveis de evidência.** Os 25 registros seguem em nível A e nenhum tem `confidence: low`.

## Lacuna de conteúdo apontada pelo revisor

Protocolo de adaptação após períodos de lesão ou doença. Não virou registro porque criar registro exige fonte e a fonte não foi levantada.

## Defeito de ferramenta observado durante a revisão

No comentário sobre `distances/maratona.md`, o revisor escreveu que não encontrou a referência `BC-009` nas evidências prioritárias. `BC-009` está listado lá. O formulário renderiza o corpo dos documentos de regra em markdown cru, com os códigos `BC-xxx` visíveis, enquanto a etapa das fichas nunca mostra identificador. O revisor viu um código que não tinha como resolver. É defeito do formulário, não da base, e vale corrigir em `start-running-form` antes da próxima rodada.

**SHA-256 da fonte-mestra:** `9648710380b3f0ee5eacab2359350fb76351825622a2eb7f9197366763bdfc33`

`source_master/KB_MUSC_SR.md` continua íntegro na versão 1.0 e por isso **não** reflete os ajustes desta revisão. O manifesto ainda o declara como `canonical_source`. Enquanto essa divergência existir, o conteúdo vigente é o de `evidence/` e `policies/`.
