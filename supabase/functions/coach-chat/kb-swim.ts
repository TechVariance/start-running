// KB_SWIM_SR — base de conhecimento de natação competitiva amadora (piscina, 50 m a 1.500 m, quatro estilos e medley).
// Embutida diretamente na function (em vez de depender de uma tabela) para não
// depender de mais uma migração de banco ser aplicada no Supabase do Lovable.
// Fonte canônica: /KB_SWIM_SR no repositório (v1.0.0). Se o conteúdo da KB
// mudar lá, replique aqui manualmente.

export const KB_SWIM_VERSION = "KB_SWIM_SR v1.0.0-rag (natação 50m-1500m, 4 estilos + medley)";

export const KB_SWIM_SAFETY_POLICY = `POLÍTICA DE SEGURANÇA E ENCAMINHAMENTO (prioridade máxima — nunca contrarie isto)
Esta base não substitui treinador qualificado, salva-vidas, médico, fisioterapeuta ou nutricionista.

Nunca sugira treinar sozinho em piscina sem supervisão apropriada. Nunca recomende hiperventilação, competições de apneia ou repetição de submersos prolongados — há risco real de perda de consciência na água. Largadas, viradas, submersos e exercícios de potência devem respeitar profundidade, regras da piscina, domínio técnico e supervisão.

Interrompa a recomendação esportiva e oriente avaliação profissional apropriada diante de: dor persistente ou crescente no ombro, dificuldade respiratória, desmaio, dor no peito, sintomas neurológicos ou incapacidade funcional; febre, infecção relevante ou mal-estar sistêmico (motivo para não realizar treino intenso); fadiga persistente, queda de desempenho, alterações marcantes de sono/humor e recuperação inadequada (exigem redução de carga e avaliação).

Jovens devem treinar com supervisão, progressão compatível com maturação e prioridade para técnica, prazer, saúde e desenvolvimento amplo.

Encaminhamento: em emergência ou risco imediato, oriente acionar o serviço local de emergência e a equipe da instalação. Diante de sintomas musculoesqueléticos persistentes, oriente avaliação clínica qualificada antes de manter a mesma carga. Questões alimentares, energéticas ou menstruais persistentes exigem profissional de saúde habilitado — nunca prescreva restrição alimentar. Retorno após doença ou lesão deve ser progressivo e guiado por profissional quando indicado.`;

export const KB_SWIM_RESPONSE_POLICY = `POLÍTICA DE RESPOSTAS (segue em prioridade logo após a de segurança)
Hierarquia de autoridade: (1) segurança e encaminhamento; (2) registros de evidência ativa (SW-xxx); (3) módulos de síntese; (4) documento fonte-mestra.

Processo obrigatório antes de responder algo técnico sobre natação:
1. Identifique idade/faixa etária, experiência aquática, prova, estilo, piscina de 25 m ou 50 m, frequência disponível, histórico recente, dores, supervisão e objetivo.
2. Recupere entre 3 e 6 registros relevantes.
3. Distinga achado direto, parcial e indireto.
4. Formule a orientação como princípios e opções ajustáveis, nunca como promessa ou receita universal.
5. Exponha incertezas, limites e sinais para reduzir/interromper o treino.
6. Cite os IDs usados e, quando útil, os links públicos correspondentes.

Restrições de linguagem: não diagnostique, prescreva tratamento ou prometa resultado; não invente zonas, ritmos, volumes, tempos de intervalo ou progressões ausentes da base; não transforme correlação em causalidade; não aplique dados de elite automaticamente a amadores; não recomende treino de apneia, hiperventilação ou retenções respiratórias sem supervisão qualificada; não recomende suplementos a menores — para adultos, limite-se à síntese da evidência e encaminhe decisões a profissional habilitado; não oriente perda de peso, redução de gordura ou manipulação corporal para adolescentes.

Saída recomendada: contexto e premissas; prioridade principal; opções práticas; monitoramento; limites/alertas; evidências consultadas.

Escopo: esta base cobre natação competitiva amadora em piscina, dos 50 m aos 1.500 m, nos quatro estilos e no medley — técnica, largadas, viradas, submerso, distribuição de intensidade, treino de força em terra, taper, monitoramento, recuperação, nutrição geral e prevenção de lesões. Águas abertas, mergulho em apneia e protocolos clínicos estão fora do escopo desta base. Para corrida de rua (5K/10K/21K/42K) existe uma base de evidências dedicada e separada (KB_RUN_SR); para musculação/treinamento de força como modalidade própria existe a base KB_MUSC_SR. Não cite SW-xxx fora de contexto de natação, nem BC-xxx (corrida) ou registros de musculação dentro desta base — nesses casos, direcione o atleta à base correspondente ou apoie-se em orientação geral cautelosa deixando clara a limitação.`;

export const KB_SWIM_IP_POLICY = `PROPRIEDADE INTELECTUAL: esta base contém sínteses originais e curtas, não reproduções de artigos, tabelas, figuras ou protocolos protegidos; cite apenas metadados bibliográficos, links públicos e paráfrases curtas das fontes abaixo, e nunca reproduza texto integral protegido sem licença compatível.`;

export const KB_SWIM_GLOSSARY = `GLOSSÁRIO CONTROLADO
- Carga externa: trabalho observável, como metros, tempo, repetições, ritmo e trabalho em terra.
- Carga interna: resposta do nadador, como percepção de esforço, frequência cardíaca, bem-estar e sintomas.
- Comprimento de braçada: distância média avançada por ciclo de braçada.
- Frequência de braçada: ciclos de braçada por unidade de tempo.
- Eficiência: relação entre velocidade/propulsão e custo energético; não é uma única medida.
- Pace de prova: velocidade específica da prova-alvo.
- Taper: redução planejada da carga antes da competição, preservando estímulos importantes.
- Submerso: fase após largada ou virada antes do nado de superfície, sujeita a regras da prova.
- sRPE: esforço percebido da sessão multiplicado pela duração; medida simples de carga interna.
- Aplicabilidade direta: população e intervenção próximas do uso pretendido.
- Aplicabilidade parcial: somente parte do contexto corresponde.
- Aplicabilidade indireta: inferência de outro esporte, população ou desenho.`;

// Registros de evidência (SW-xxx) — cada um é uma afirmação científica autocontida.
export const KB_SWIM_EVIDENCE = `REGISTROS DE EVIDÊNCIA (cite o SW-xxx usado na resposta)

### SW-001 — Desempenho multifatorial
Nível A · Confiança alta · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: O desempenho competitivo resulta da interação entre fatores fisiológicos, biomecânicos, neuromusculares e habilidades de prova.
Aplicação prática: Avaliar técnica, condicionamento, largadas, viradas e pacing em conjunto.
Limitações: Grande parte dos estudos de determinantes é observacional.
Fontes: SRC-S-0001, SRC-S-0010

### SW-002 — Frequência e comprimento de braçada
Nível B · Confiança moderada · Aplicabilidade parcial · Provas: all · Estilos: all · Perfis: all
Afirmação: A combinação útil entre frequência e comprimento de braçada varia por nadador, estilo, distância e fadiga; não existe contagem universal ideal.
Aplicação prática: Usar vídeo e parciais para encontrar a combinação individual que sustenta velocidade com técnica estável.
Limitações: Parte da evidência vem de crawl ou masters e não generaliza a todos os estilos.
Fontes: SRC-S-0002, SRC-S-0015

### SW-003 — Especificidade por distância
Nível B · Confiança moderada · Aplicabilidade direta · Provas: 50m, 100m, 200m, 400m, 800m, 1500m · Estilos: all · Perfis: all
Afirmação: Potência e capacidade anaeróbia têm maior peso relativo em provas curtas, enquanto capacidade aeróbia e economia ganham importância em distâncias maiores.
Aplicação prática: Manter base ampla e aumentar a especificidade conforme prova e fase da temporada.
Limitações: Todas as provas usam sistemas energéticos mistos; fronteiras não são rígidas.
Fontes: SRC-S-0001, SRC-S-0016

### SW-004 — Distribuição de intensidade
Nível B · Confiança moderada · Aplicabilidade parcial · Provas: all · Estilos: all · Perfis: recreational_competitor, trained_amateur, youth, adult, masters
Afirmação: Nadadores treinados costumam realizar grande parcela do volume em baixa intensidade, mas a evidência não sustenta uma proporção universal para amadores.
Aplicação prática: Ajustar a distribuição à prova, frequência, fase, técnica e recuperação; evitar regra rígida 80/20.
Limitações: Dados de natação são sobretudo observacionais e de elite.
Fontes: SRC-S-0003, SRC-S-0004

### SW-005 — Trabalho intenso e pace de prova
Nível C · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: recreational_competitor, trained_amateur, youth, adult, masters
Afirmação: Séries intensas e específicas podem desenvolver velocidade e execução sob fadiga, mas não devem transformar todas as sessões em testes máximos.
Aplicação prática: Preservar qualidade e recuperação; dosar o trabalho intenso conforme resposta individual.
Limitações: Não existe dose semanal universal validada para amadores.
Fontes: SRC-S-0003, SRC-S-0004

### SW-006 — Progressão de carga
Nível B · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: A carga deve ser monitorada e progredir de forma individual; distância semanal isolada não representa todo o estresse do treino.
Aplicação prática: Registrar metros, duração, intensidade, estilos, equipamentos, treino em terra, sintomas e recuperação.
Limitações: Não há corte universal de volume seguro nem causalidade estabelecida.
Fontes: SRC-S-0005, SRC-S-0006

### SW-007 — Natação combinada com força
Nível A · Confiança moderada · Aplicabilidade direta · Provas: 50m, 100m, 200m, 400m · Estilos: all · Perfis: recreational_competitor, trained_amateur, youth, adult, masters
Afirmação: Combinar treino na água com força ou potência em terra tende a superar treino somente na água em vários desfechos de desempenho.
Aplicação prática: Integrar sessões progressivas de força sem comprometer a qualidade do treino aquático.
Limitações: Protocolos e populações são heterogêneos.
Fontes: SRC-S-0007, SRC-S-0008, SRC-S-0009

### SW-008 — Nenhum método único de força
Nível A · Confiança alta · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: A literatura não identifica um método de treinamento de força universalmente superior para o desempenho na natação.
Aplicação prática: Escolher método seguro, progressivo e compatível com experiência, prova e recursos.
Limitações: Comparações diretas entre métodos são limitadas.
Fontes: SRC-S-0007, SRC-S-0008

### SW-009 — Especificidade aquática
Nível B · Confiança alta · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: O treino em terra complementa, mas não substitui, a prática técnica e específica na água.
Aplicação prática: Manter a natação como eixo do programa e usar força para apoiar capacidades limitantes.
Limitações: A transferência varia por exercício, atleta e prova.
Fontes: SRC-S-0007, SRC-S-0009

### SW-010 — Valor de largadas, viradas e submerso
Nível A · Confiança alta · Aplicabilidade direta · Provas: 50m, 100m, 200m, 400m, medley · Estilos: all · Perfis: all
Afirmação: Largadas, viradas e submersos contribuem de modo relevante ao tempo total, sobretudo em sprints e piscina curta.
Aplicação prática: Treinar essas fases com feedback técnico, profundidade adequada e supervisão.
Limitações: Importância relativa varia com prova, estilo e comprimento da piscina.
Fontes: SRC-S-0001, SRC-S-0010

### SW-011 — Segurança no submerso
Nível A · Confiança alta · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: Treino de submerso não justifica hiperventilação, apneia prolongada ou prática sem supervisão por causa do risco de perda de consciência na água.
Aplicação prática: Respeitar regras, limites técnicos, supervisão e retorno à respiração normal; interromper diante de sintomas.
Limitações: Princípio de segurança; não é protocolo de desempenho.
Fontes: SRC-S-0010

### SW-012 — Aquecimento individualizado
Nível A · Confiança moderada · Aplicabilidade direta · Provas: 50m, 100m · Estilos: all · Perfis: all
Afirmação: Diferentes aquecimentos produzem efeitos pequenos e inconsistentes no sprint; não há formato único superior.
Aplicação prática: Usar rotina familiar, progressiva e específica sem gerar fadiga desnecessária.
Limitações: Estudos pequenos e protocolos heterogêneos.
Fontes: SRC-S-0011

### SW-013 — Taper antes da competição
Nível A · Confiança moderada · Aplicabilidade parcial · Provas: all · Estilos: all · Perfis: recreational_competitor, trained_amateur, youth, adult, masters
Afirmação: Reduzir volume antes da competição enquanto se preservam estímulos importantes tende a melhorar desempenho de endurance.
Aplicação prática: Individualizar duração e redução com base em carga anterior, prova e resposta histórica.
Limitações: A faixa de 41% a 60% por até 21 dias vem de múltiplos esportes e não é regra universal.
Fontes: SRC-S-0012

### SW-014 — Monitoramento interno e externo
Nível B · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: Combinar carga externa com percepção de esforço, recuperação, sono e sintomas oferece contexto melhor do que uma métrica isolada.
Aplicação prática: Registrar medidas simples e consistentes e observar tendências individuais.
Limitações: Relações com lesão e desempenho são complexas e não determinísticas.
Fontes: SRC-S-0005, SRC-S-0006

### SW-015 — Dor no ombro é multifatorial
Nível A · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: Exposição, fadiga, histórico, mobilidade, força, controle e técnica podem se associar à dor no ombro, sem uma causa única universal.
Aplicação prática: Monitorar sintomas e modificar a carga; procurar avaliação quando a dor persiste, cresce ou limita função.
Limitações: Associações não provam causalidade e pontos de corte não são amplamente validados.
Fontes: SRC-S-0005, SRC-S-0013, SRC-S-0014

### SW-016 — Não normalizar dor
Nível B · Confiança alta · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: all
Afirmação: Continuar a mesma carga apesar de dor persistente ou crescente não é uma estratégia segura de desenvolvimento.
Aplicação prática: Interromper ou modificar estímulos provocadores e buscar avaliação qualificada.
Limitações: A base não diagnostica nem prescreve reabilitação.
Fontes: SRC-S-0005, SRC-S-0013

### SW-017 — Pacing específico e treinável
Nível B · Confiança moderada · Aplicabilidade parcial · Provas: 100m, 200m, 400m, 800m, 1500m, medley · Estilos: all · Perfis: all
Afirmação: O perfil de ritmo varia por distância, estilo e indivíduo; parciais e feedback ajudam a praticar a distribuição de esforço.
Aplicação prática: Testar estratégias em treino e ajustar pelos parciais sem copiar percentuais de elite.
Limitações: Dados disponíveis são frequentemente específicos de estilo ou nível competitivo.
Fontes: SRC-S-0015, SRC-S-0017

### SW-018 — Sono e recuperação
Nível A · Confiança moderada · Aplicabilidade indireta · Provas: all · Estilos: all · Perfis: all
Afirmação: Sono suficiente e regular apoia recuperação e desempenho; extensão do sono pode ajudar atletas com sono insuficiente.
Aplicação prática: Proteger rotina de sono e ajustar carga quando houver privação ou recuperação ruim.
Limitações: Revisão não específica de natação e protocolos heterogêneos.
Fontes: SRC-S-0018

### SW-019 — Disponibilidade energética e saúde
Nível B · Confiança alta · Aplicabilidade indireta · Provas: all · Estilos: all · Perfis: all
Afirmação: Ingestão insuficiente para sustentar treino, recuperação e crescimento pode prejudicar saúde e desempenho.
Aplicação prática: Priorizar alimentação suficiente e encaminhar sinais persistentes a profissional habilitado; não prescrever restrição.
Limitações: Fonte clínica geral e não específica de natação.
Fontes: SRC-S-0019

### SW-020 — Creatina em nadadores
Nível A · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: adult, masters
Afirmação: A meta-análise disponível não mostrou benefício significativo consistente da creatina no desempenho de natação.
Aplicação prática: Não tratar creatina como intervenção rotineira; não recomendar suplemento a menores.
Limitações: Número e qualidade dos estudos limitam conclusões definitivas.
Fontes: SRC-S-0020

### SW-021 — Treinamento muscular respiratório
Nível A · Confiança moderada · Aplicabilidade direta · Provas: 50m, 100m, 200m · Estilos: all · Perfis: trained_amateur, adult, masters
Afirmação: Pode melhorar força inspiratória e alguns índices pulmonares, mas não demonstrou melhora consistente em provas de 50 a 200 m.
Aplicação prática: Não priorizar sobre técnica, treino específico e recuperação.
Limitações: Heterogeneidade e ausência de efeito consistente no tempo de prova.
Fontes: SRC-S-0021

### SW-022 — Intervenções hipóxicas
Nível A · Confiança moderada · Aplicabilidade parcial · Provas: 100m, 200m · Estilos: freestyle · Perfis: trained_amateur, adult
Afirmação: Intervenções hipóxicas mostraram efeito pequeno em desempenho e nenhum efeito significativo em VO2máx no conjunto analisado.
Aplicação prática: Não usar como padrão para amadores; exige estrutura e supervisão especializadas e não equivale a apneia.
Limitações: Onze estudos, 182 nadadores; aplicabilidade estreita.
Fontes: SRC-S-0022

### SW-023 — Desenvolvimento de jovens
Nível A · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: youth
Afirmação: Em jovens, maturação e idade relativa podem afetar desempenho e seleção; formação não deve se reduzir ao resultado imediato.
Aplicação prática: Priorizar técnica ampla, segurança, variedade, prazer e progressão compatível com maturação.
Limitações: Efeito populacional não permite prever trajetória individual.
Fontes: SRC-S-0001, SRC-S-0023

### SW-024 — Adaptação em masters
Nível C · Confiança moderada · Aplicabilidade parcial · Provas: 50m, 100m, 200m · Estilos: freestyle · Perfis: masters
Afirmação: Nadadores masters podem melhorar desempenho e eficiência com blocos que integrem condicionamento, intensidade e técnica.
Aplicação prática: Individualizar volume, intensidade e técnica considerando histórico e recuperação.
Limitações: Estudos pequenos e predominantemente de crawl.
Fontes: SRC-S-0002, SRC-S-0024

### SW-025 — Recuperação em masters mais velhos
Nível C · Confiança moderada · Aplicabilidade direta · Provas: all · Estilos: all · Perfis: masters
Afirmação: Com o avanço da idade, alguns nadadores podem precisar de aquecimento mais longo, mais recuperação e menor carga total, com grande variação individual.
Aplicação prática: Ajustar pela resposta real, condições clínicas e regularidade, sem presumir incapacidade pela idade.
Limitações: Revisão parcialmente narrativa e recomendações não são universais.
Fontes: SRC-S-0025`;

export const KB_SWIM_MODULES: Record<string, string> = {
  competicao_amadora: `# Competição amadora

## Preparação

Definir prova-alvo, estilo, piscina, datas, experiência e disponibilidade. Usar rotinas testadas, não novidades na semana da competição.

## Decisões

- Aquecimento: familiar, progressivo, específico e sem fadiga excessiva.
- Pacing: testado por parciais no treino.
- Taper: redução individualizada de carga.
- Recuperação: sono e alimentação suficientes; não compensar sessão perdida com excesso.

## Evidências

SW-012, SW-013, SW-017, SW-018, SW-019.`,

  estilos_e_medley: `# Quatro estilos e medley

## Princípio

Biomecânica, demanda muscular, respiração, regras e pacing diferem entre crawl, costas, peito e borboleta. Evidência de um estilo não deve ser transferida automaticamente a outro.

## Aplicação

- Preservar domínio técnico amplo, principalmente em jovens.
- Treinar transições e ordem específica no medley.
- Usar parciais por estilo para identificar onde o tempo é ganho ou perdido.
- Ajustar volume de estilos à tolerância musculoesquelética.

## Evidências

SW-001, SW-002, SW-010, SW-017, SW-023.`,

  forca_em_terra: `# Força e potência em terra

## Papel

O trabalho em terra pode melhorar força, potência e desempenho, especialmente em provas curtas e médias, mas não há método universalmente superior e a transferência não é automática.

## Aplicação

- Técnica supervisionada e progressão compatível com experiência.
- Movimentos globais, tronco e equilíbrio entre padrões.
- Dose integrada à carga aquática.
- Jovens: foco em competência motora e segurança, não em aparência corporal.

## Evidências

SW-007, SW-008, SW-009, SW-023.`,

  fundo_800_1500: `# Fundo — 800 m e 1.500 m

## Prioridades

Capacidade aeróbia, economia, técnica sustentável, pacing e tolerância ao volume. O plano não deve copiar a quilometragem de elite nem impor percentuais fixos de intensidade.

## Aplicação

- Grande parte do trabalho em intensidade controlada, ajustada ao nível e à frequência semanal.
- Prática regular de parciais e percepção de esforço.
- Progressão gradual e recuperação protegida.
- Taper individual, sem eliminar completamente a intensidade.

## Evidências

SW-003, SW-004, SW-006, SW-013, SW-014, SW-017, SW-018.`,

  largadas_viradas_submerso: `# Largadas, viradas e submerso

## Valor competitivo

Essas fases ganham peso relativo em provas curtas e piscinas de 25 m. Força, potência, posição hidrodinâmica e timing influenciam a execução.

## Segurança

Treinar apenas com profundidade permitida e supervisão. Não orientar hiperventilação, apneia prolongada nem desafio de retenção respiratória. O treino termina diante de tontura, confusão, falta de ar incomum ou outro sinal de alerta.

## Evidências

SW-010, SW-011.`,

  meio_fundo_200_400: `# Meio-fundo — 200 m e 400 m

## Prioridades

Integração de capacidade aeróbia, velocidade, tolerância ao esforço, economia e pacing. A prova deve ser decomposta em parciais e habilidades de parede, com estratégia testada no treino.

## Aplicação

- Base técnica e aeróbia consistente.
- Estímulos em pace de prova sem acumular fadiga que destrua a técnica.
- Força em terra como complemento.
- Monitoramento conjunto de carga externa e interna.

## Evidências

SW-003, SW-004, SW-005, SW-007, SW-014, SW-017.`,

  populacoes: `# Populações

## Jovens

Supervisão, competência nos quatro estilos, variedade, prazer, saúde e desenvolvimento de longo prazo. Evitar seleção rígida por maturação, composição corporal ou resultado precoce. Não recomendar restrição alimentar nem suplementos.

## Adultos iniciando competição

Confirmar competência aquática, construir técnica e consistência antes de elevar volume/intensidade e aprender regras e habilidades de prova com treinador.

## Masters

Há capacidade de adaptação, mas histórico, mobilidade, doenças, medicamentos e recuperação variam. Ajustar aquecimento, intervalo, frequência e carga total; não usar idade isolada como diagnóstico de capacidade.

## Evidências

SW-019, SW-023, SW-024, SW-025.`,

  sprint_50_100: `# Sprint — 50 m e 100 m

## Prioridades

Velocidade, potência, largada, transição, viradas, submerso, chegada e capacidade de manter técnica em alta frequência. O treino de força pode contribuir, mas precisa transferir à água e coexistir com recuperação adequada.

## Aplicação

- Técnica em velocidade e repetições de qualidade com recuperação suficiente.
- Parciais e análise das fases, não apenas tempo total.
- Aquecimento familiar e individualizado.
- Taper ajustado à carga anterior.

## Evidências

SW-003, SW-007, SW-010, SW-012, SW-013, SW-016.`,
};

// Catálogo de fontes públicas (para citar link quando fizer sentido)
export const KB_SWIM_SOURCES = `FONTES PÚBLICAS (id — título, ano — link)
SRC-S-0001 — Physical performance determinants in competitive youth swimmers: a systematic review (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10797935/
SRC-S-0002 — Energetic and Biomechanical Contributions for Longitudinal Performance in Master Swimmers (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7739371/
SRC-S-0003 — Elite Swimmers' Training Patterns in the 25 Weeks Prior to Their Season's Best Performances (2019) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6470949/
SRC-S-0004 — Polarized training intensity distribution: systematic review (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11679080/
SRC-S-0005 — Swim-Training Volume and Shoulder Pain Across the Life Span of the Competitive Swimmer (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6961642/
SRC-S-0006 — Methods of Monitoring Internal and External Loads in Adolescent Athletes (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10356657/
SRC-S-0007 — Effect of Different Types of Strength Training on Swimming Performance (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8804114/
SRC-S-0008 — Resistance training methodology and short-medium distance front crawl performance (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11310150/
SRC-S-0009 — Comparative effectiveness of physical training modalities on swimming performance (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12423047/
SRC-S-0010 — Determinants of undulatory underwater kick velocity in competitive swimmers (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9334501/
SRC-S-0011 — The effects of warm-up on physical performance in sprint swimming (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8544352/
SRC-S-0012 — Effects of tapering on performance in endurance athletes (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10171681/
SRC-S-0013 — Sink or Swim? Clinical Objective Tests Associated with Shoulder Pain (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10761606/
SRC-S-0014 — Clinical Evaluation Techniques for Injury Risk Assessment in Elite Swimmers (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7734355/
SRC-S-0015 — Biomechanical, Physiological and Anthropometric Determinants of Backstroke Performance (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12146239/
SRC-S-0016 — Relative contributions of upper-body muscular power and repeated sprint ability to 50-m freestyle (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12852417/
SRC-S-0017 — Pacing in World-Class Age Group Swimmers in 200 and 400 m Individual Medley (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7874226/
SRC-S-0018 — Sleep interventions designed to improve athletic performance and recovery (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10354314/
SRC-S-0019 — Relative Energy Deficiency in Sport and the role of the dietitian (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9724109/
SRC-S-0020 — Effects of creatine supplementation on swimming performance (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11499511/
SRC-S-0021 — Effects of respiratory muscle training in competitive swimmers (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC13046513/
SRC-S-0022 — Effect of hypoxic interventions on swimming performance (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12926167/
SRC-S-0023 — Prevalence and Impact of the Relative Age Effect on Competition Performance in Swimming (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8535716/
SRC-S-0024 — Monitoring Master Swimmers' Performance and Active Drag along a Mesocycle (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8038111/
SRC-S-0025 — Effects of aging in Masters swimmers: 40-year review (2013) — https://pmc.ncbi.nlm.nih.gov/articles/PMC3781853/`;

export function buildSwimKbContext(): string {
  return [
    `=== KB_SWIM_SR (${KB_SWIM_VERSION}) — base de conhecimento de natação ===`,
    KB_SWIM_SAFETY_POLICY,
    KB_SWIM_RESPONSE_POLICY,
    KB_SWIM_IP_POLICY,
    Object.values(KB_SWIM_MODULES).join("\n\n"),
    KB_SWIM_EVIDENCE,
    KB_SWIM_GLOSSARY,
    KB_SWIM_SOURCES,
    "=== fim da KB_SWIM_SR ===",
  ].filter(Boolean).join("\n\n");
}
