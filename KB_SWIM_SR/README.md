# KB_SWIM_SR — Base RAG de natação competitiva amadora

Pacote estruturado para agentes de IA sobre treinamento de natação competitiva em piscina para nadadores amadores, dos 50 m aos 1.500 m, nos quatro estilos e no medley.

## Ordem de autoridade

1. `policies/seguranca_e_encaminhamento.md`
2. `policies/politica_de_respostas.md`
3. `evidence/SW-xxx.yaml`
4. `modules/`
5. `source_master/KB_SWIM_SR.md`

## Uso pelo agente

- Indexar cada YAML como unidade indivisível.
- Filtrar por prova, estilo, perfil, tópico, confiança, aplicabilidade e status.
- Recuperar de 3 a 6 registros por consulta.
- Manter as políticas de resposta e segurança no contexto fixo.
- Citar IDs de evidência e links públicos em afirmações técnicas.
- Tratar faixas numéricas como pontos de partida, nunca como prescrição universal.
- Executar o golden set após mudanças no conteúdo, no modelo ou no prompt.

O documento em `source_master/` é a fonte editorial canônica. Os registros estruturados são derivados para recuperação e não devem divergir silenciosamente dela.

## Escopo

Inclui técnica, largadas, viradas, submerso, distribuição de intensidade, treino de força em terra, taper, monitoramento, recuperação, nutrição geral e prevenção de lesões. Águas abertas, mergulho em apneia e protocolos clínicos estão fora do escopo principal.

