# KB_MUSC_SR — Base RAG de musculação

Pacote estruturado para agentes de IA sobre treinamento resistido, força, hipertrofia, potência, função, saúde e integração com corrida.

## Ordem de autoridade

1. `policies/seguranca_e_encaminhamento.md`
2. `policies/politica_de_respostas.md`
3. `evidence/BM-xxx.yaml`
4. `modules/`
5. `source_master/KB_MUSC_SR.md`

## Uso

- Indexar cada YAML como chunk indivisível.
- Filtrar por objetivo, perfil, tópico, confiança e status.
- Recuperar de 3 a 6 registros por consulta.
- Manter políticas de resposta e segurança no contexto fixo.
- Exigir IDs e links públicos em afirmações técnicas.
- Executar o golden set após mudanças no modelo, prompt ou conteúdo.

O documento em `source_master/` é a fonte editorial canônica. Os registros estruturados são derivados para recuperação e não devem divergir silenciosamente dela.

