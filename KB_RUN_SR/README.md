# KB_RUN_SR — Base de conhecimento RAG

Pacote estruturado para recuperação por agentes de IA sobre treinamento de corrida de rua para 5 km, 10 km, meia maratona e maratona.

## Ordem de autoridade

1. `policies/seguranca_e_encaminhamento.md`
2. `policies/politica_de_respostas.md`
3. Registros em `evidence/`
4. Módulos em `distances/`
5. Documento preservado em `source_master/KB_RUN_SR.md`

Em conflito, prevalece a fonte mais recente, diretamente aplicável e com maior nível de evidência. Dúvidas não resolvidas devem ser informadas ao usuário.

## Conteúdo

- `source_master/`: documento editorial original, preservado integralmente.
- `evidence/`: uma afirmação científica autocontida por arquivo YAML.
- `sources/`: catálogo JSONL das fontes públicas.
- `distances/`: módulos de recuperação por distância.
- `policies/`: regras executáveis de resposta, segurança e propriedade intelectual.
- `schemas/`: contrato dos registros estruturados.
- `retrieval/`: estratégia de indexação e recuperação.
- `evaluation/`: golden set e critérios de avaliação.
- `glossary/`: vocabulário controlado.

## Uso recomendado

1. Indexar separadamente registros YAML, módulos de distância e políticas.
2. Aplicar filtros por `distances`, `profiles`, `topics`, `confidence` e `status`.
3. Recuperar de 3 a 6 registros de evidência por consulta.
4. Anexar as políticas de resposta e segurança ao contexto fixo do agente.
5. Exigir referência a `evidence_id` e `source_ids` em afirmações técnicas.
6. Executar o golden set após qualquer mudança de conteúdo, modelo ou prompt.

## Escopo e limites

Base voltada principalmente a adultos recreacionais e competitivos não profissionais. Ela não diagnostica condições clínicas nem substitui treinador, médico, fisioterapeuta ou nutricionista. Para menores de 18 anos, oferecer educação geral e exigir supervisão adulta/profissional apropriada para prescrição individualizada.

