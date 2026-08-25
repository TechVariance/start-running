// KB_MUSC_SR — base de conhecimento de treinamento resistido/musculação
// (força, hipertrofia, potência, saúde/função e integração com a corrida).
// Embutida diretamente na function (em vez de depender de uma tabela) para não
// depender de mais uma migração de banco ser aplicada no Supabase do Lovable.
// Fonte canônica: /KB_MUSC_SR no repositório (v1.0.0-rag). Se o conteúdo da KB
// mudar lá, replique aqui manualmente.

export const KB_MUSC_VERSION = "KB_MUSC_SR v1.1.0-rag (musculação: força, hipertrofia, potência, saúde e função)";

export const KB_MUSC_SAFETY_POLICY = `POLÍTICA DE SEGURANÇA E ENCAMINHAMENTO (prioridade máxima — nunca contrarie isto)
O agente não diagnostica, não libera retorno após lesão e não substitui médico, fisioterapeuta, nutricionista ou profissional de educação física. Dor persistente não é indicador de eficácia e não deve ser apresentada como requisito de progresso.

Interrompa a recomendação de treino e oriente avaliação profissional apropriada diante de:
- Sintomas desproporcionais durante o esforço, como dor no peito, desmaio, confusão ou falta de ar incomum.
- Dor localizada persistente, perda importante de função ou piora progressiva.
- Retorno após cirurgia, fratura ou condição clínica relevante.
- Sinais de baixa disponibilidade energética, fadiga persistente ou comportamento alimentar preocupante.
Em situação potencialmente urgente, oriente interrupção da atividade e busca de atendimento local apropriado.

Menores de 18 anos: só educação geral e opções conservadoras. Programas individualizados, testes máximos e movimentos técnicos exigem responsável e profissional qualificado. Não ofereça emagrecimento, restrição alimentar, contagem calórica, suplemento, substância para desempenho ou treinamento autônomo avançado.

Práticas especiais: falha muscular não deve ser padrão obrigatório de treino. Restrição de fluxo sanguíneo (BFR) exige triagem e supervisão profissional, está fora do universo de uso deste app e nunca deve ser proposta de forma ativa. Técnicas avançadas só devem aparecer quando houver objetivo claro e domínio técnico básico. Nunca recomende hormônios, esteroides ou substâncias proibidas.

Suplementos: não recomende suplemento a ninguém, inclusive maior de idade. Você pode descrever em linhas gerais o que a literatura diz sobre eficácia, e deve encerrar orientando que dose e decisão de uso são tomadas junto a um especialista. Nunca converta média populacional em prescrição individual.

Estimulantes e privação de sono: nunca apresente estimulante como forma de compensar noite mal dormida. A privação de sono já eleva cortisol, frequência cardíaca de repouso e pressão arterial, e somar dose alta de estimulante a um organismo nessa condição produz sobrecarga simpática excessiva, aumentando risco de arritmia, palpitação e pico hipertensivo durante o esforço. Diante desse pedido, alerte sobre o risco e oriente ajuste da sessão.`;

export const KB_MUSC_RESPONSE_POLICY = `POLÍTICA DE RESPOSTAS (segue em prioridade logo após a de segurança)
Processo obrigatório antes de responder algo técnico sobre treinamento resistido:
1. Identifique objetivo principal (saúde, força, hipertrofia, potência, função ou suporte à corrida), idade, experiência, equipamentos disponíveis, frequência atual, outros esportes praticados, histórico de lesão e restrições relevantes.
2. Baseie-se nos registros de evidência (BM-xxx) e módulos fornecidos abaixo — nunca em conhecimento geral não referenciado, quando o tema for coberto pela base.
3. Separe claramente força, hipertrofia, potência, saúde/função e reabilitação — não misture desfechos de objetivos diferentes.
4. Informe confiança, limitações e alternativas antes de generalizar.
5. Responda em linguagem simples, distinguindo evidência, aplicação prática e incerteza.
6. Cite os identificadores BM-xxx relevantes na resposta.

Linguagem controlada (use estes termos com o sentido exato abaixo):
- "Recomenda-se": evidência consistente e aplicação direta.
- "Pode ser considerado": opção dependente do contexto.
- "Está associado": dado observacional; não implica causalidade.
- "Evidência insuficiente": não há base adequada para conclusão operacional — diga isso explicitamente em vez de inventar.

Personalização: nunca invente carga, 1RM, número de séries, frequência ou progressão que não foram informados. Se os dados forem insuficientes, responda com princípios gerais e exemplos ilustrativos claramente rotulados como tal. A progressão deve ser condicionada à técnica, ao desempenho, à recuperação, à dor e à aderência do praticante.

Rastreamento e conflito entre fontes: toda recomendação técnica deve apontar para os registros recuperados (BM-xxx). Divergências entre fontes devem ser informadas, nunca ocultadas, e resolvidas priorizando a fonte mais recente, de maior nível de evidência e maior aplicabilidade.

Escopo: esta base cobre treinamento resistido/musculação — força, hipertrofia, potência, saúde/função e integração com a corrida — voltado a adultos saudáveis recreacionais e treinados não profissionais, incluindo populações especiais (idosos, mulheres, jovens sob supervisão) tratadas nos módulos dedicados. Evidência específica de corrida (fisiologia de prova, ritmos, taper, nutrição de prova) pertence à base de corrida (KB_RUN_SR); evidência específica de natação pertence à base de natação (KB_SWIM_SR). Fora do escopo de musculação, apoie-se apenas nos dados reais do atleta e em orientação geral cautelosa, sem citar BM-xxx (que são exclusivos de musculação) fora de contexto.`;

export const KB_MUSC_IP_POLICY = `PROPRIEDADE INTELECTUAL: cite apenas metadados bibliográficos, DOI/PMID/PMCID, links públicos e paráfrases curtas das fontes abaixo. Nunca reproduza artigos, livros, cursos, fichas ou planilhas protegidas na íntegra, nem contorne paywall. Quando a licença específica não estiver confirmada, trate a fonte como needs_verification e use apenas metadados e resumo analítico original.`;

export const KB_MUSC_GLOSSARY = `GLOSSÁRIO CONTROLADO
- 1RM: maior carga completada uma vez com técnica definida em teste apropriado.
- APRE: exercício resistido progressivo autoregulado.
- BFR: treinamento com restrição de fluxo sanguíneo; requer aplicação especializada.
- Carga: resistência externa usada no exercício.
- Falha momentânea: incapacidade de completar outra repetição concêntrica com o padrão definido.
- Hipertrofia: aumento mensurável do tamanho muscular.
- Potência: produção de força em função do tempo/velocidade.
- RIR: repetições estimadas que ainda poderiam ser feitas antes da falha.
- RPE: percepção subjetiva de esforço.
- Treino concorrente: combinação de resistência e endurance no mesmo programa.
- Volume: quantidade de trabalho; deve especificar a métrica usada.`;

// Registros de evidência (BM-xxx) — cada um é uma afirmação científica autocontida.
export const KB_MUSC_EVIDENCE = `REGISTROS DE EVIDÊNCIA (cite o BM-xxx usado na resposta)

### BM-001 — Efeitos gerais do treinamento resistido
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: health,strength,hypertrophy,function,general · Perfis: beginner,recreational,trained
Afirmação: Treinamento resistido melhora força, massa muscular e função física em comparação com não treinar.
Aplicação prática: Usar um programa progressivo e aderente; complexidade não é pré-requisito para benefício.
Limitações: Magnitude varia por objetivo, experiência e população.
Fontes: SRC-M-0001, SRC-M-0002

### BM-002 — Especificidade dos ganhos de força
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: strength,power,running_support · Perfis: recreational,trained,athlete
Afirmação: Ganhos de força são maiores nas tarefas, amplitudes, equipamentos e padrões praticados; a transferência não é completa.
Aplicação prática: Incluir movimentos próximos ao desempenho que será avaliado. Para o corredor, exercícios tradicionais como agachamento e afundo já entregam boa parte dessa proximidade e devem ser a base; a especificidade se aumenta por volume, velocidade de execução, uso ou não do ciclo alongamento-encurtamento e carga, não por aproximar o exercício do gesto da corrida.
Limitações: A transferência depende da semelhança entre treino e teste. O princípio se presta a extrapolação perigosa: o raciocínio de que ser específico significa reproduzir o gesto da corrida com sobrecarga leva a condutas como correr com colete ou cinto de peso, que aumentam muito o risco de lesão e nunca devem ser sugeridas.
Fontes: SRC-M-0004, SRC-M-0012

### BM-003 — Cargas altas e força máxima
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: strength,power,running_support · Perfis: recreational,trained,athlete
Afirmação: Cargas relativamente altas tendem a favorecer ganhos em testes de força máxima, embora não sejam ponto obrigatório de partida.
Aplicação prática: Introduzir cargas altas após domínio técnico e progressão adequada.
Limitações: Efeito é parcialmente explicado pela especificidade do teste.
Fontes: SRC-M-0001, SRC-M-0005

### BM-004 — Ampla faixa de cargas para hipertrofia
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: hypertrophy,strength · Perfis: recreational,trained
Afirmação: Cargas baixas e altas podem gerar hipertrofia quando as séries oferecem esforço suficiente; cargas altas continuam mais específicas para força máxima.
Aplicação prática: Escolher carga por objetivo, conforto, equipamento e capacidade de manter técnica sob esforço.
Limitações: Diferenças regionais e por tipo de fibra permanecem incertas.
Fontes: SRC-M-0001, SRC-M-0006

### BM-005 — Dose-resposta do volume com retornos decrescentes
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: strength,hypertrophy,function · Perfis: beginner,recreational,trained
Afirmação: Múltiplas séries geralmente superam uma série e maior volume pode ampliar ganhos, mas os retornos diminuem e a tolerância é individual.
Aplicação prática: Começar com dose recuperável e aumentar somente quando desempenho e recuperação justificarem. Para quem também corre, o volume de força é a variável que acopla os dois treinos: progredir volume gradualmente e reduzir o volume de força nos blocos de maior volume de corrida.
Limitações: Não existe ponto ótimo universal por grupo muscular. Mesmo com carga baixa, volume alto gera estímulo de hipertrofia, e dependendo do momento da periodização da corrida esse estímulo alonga a recuperação e pode colocar a sessão de corrida num momento de maior fragilidade muscular.
Fontes: SRC-M-0001, SRC-M-0003, SRC-M-0007

### BM-006 — Frequência como distribuição de volume e prática
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,function · Perfis: beginner,recreational,trained
Afirmação: Maior frequência não garante hipertrofia quando o volume é equiparado; para força, prática mais frequente pode ajudar pela especificidade.
Aplicação prática: Escolher frequência por volume, recuperação, agenda e habilidade a praticar.
Limitações: A literatura usa divisões e volumes heterogêneos.
Fontes: SRC-M-0001, SRC-M-0002

### BM-007 — Falha muscular não obrigatória
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: strength,hypertrophy,power,running_support · Perfis: beginner,recreational,trained
Afirmação: Treinar até falha momentânea não é superior de forma consistente para hipertrofia e aumenta fadiga aguda.
Aplicação prática: Manter repetições em reserva ao longo de todo o programa. Para o público deste app, que treina força como suporte à corrida e em geral sem supervisão presencial, não proponha treino até a falha, nem como recurso contextual.
Limitações: A distância ótima da falha ainda é difícil de medir. A ressalva contra o uso contextual é decisão de escopo do produto, apoiada no perfil do usuário e na ausência de supervisão, não conclusão das fontes citadas.
Fontes: SRC-M-0008

### BM-008 — Descanso entre séries e qualidade do trabalho
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,power · Perfis: recreational,trained
Afirmação: Diferentes descansos produzem hipertrofia, mas intervalos muito curtos podem reduzir repetições e carga; descansos maiores têm pequena vantagem média.
Aplicação prática: Descansar o suficiente para preservar técnica e objetivo da próxima série. Para o corredor, adotar descanso mais largo, acima de um minuto e meio, para manter a qualidade técnica do movimento e deixar o componente neuromuscular em condição de gerar força rápida e coordenada.
Limitações: A evidência não define um único intervalo ótimo. O piso de um minuto e meio é conduta prática dirigida ao corredor, não valor derivado das fontes citadas.
Fontes: SRC-M-0009

### BM-009 — Amplitude de movimento contextual
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,function · Perfis: beginner,recreational,trained
Afirmação: Amplitude completa é padrão inicial defensável, mas adaptações são específicas ao músculo, região e amplitude treinada.
Aplicação prática: Usar amplitude controlada e confortável; parciais podem ser ferramenta específica. No agachamento, frequente nos programas de força para corredores, a versão profunda tem pouca especificidade para a corrida, mas cabe em blocos de volume baixo com objetivo de saúde, mobilidade e força geral, quando não houver limitação que a contraindique.
Limitações: Evidência de membros superiores e tronco é limitada.
Fontes: SRC-M-0010, SRC-M-0011

### BM-010 — Eficácia de máquinas e pesos livres
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: health,strength,hypertrophy,function · Perfis: beginner,recreational,trained,older_adult
Afirmação: Máquinas e pesos livres podem produzir força e hipertrofia; cada modalidade melhora mais testes semelhantes ao treinamento.
Aplicação prática: Escolher por objetivo, preferência, acesso, estabilidade, habilidade e segurança. Para quem tem pouca experiência em treino de força, preferir máquinas e prever evolução para pesos livres conforme a experiência aumenta, pela solicitação da musculatura sinergista e pela maior transferência ao movimento; um programa que combina os dois tipos é a conduta usual.
Limitações: Há menos estudos de hipertrofia que de força.
Fontes: SRC-M-0012

### BM-011 — Ordem definida pela prioridade da sessão
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,power · Perfis: recreational,trained
Afirmação: Exercícios realizados cedo tendem a receber melhor desempenho e podem gerar maiores ganhos de força específicos.
Aplicação prática: Colocar primeiro o exercício mais importante ou tecnicamente exigente, o que na prática costuma significar abrir a sessão com os multiarticulares e deixar os monoarticulares para o final.
Limitações: Impacto sobre hipertrofia é menos claro.
Fontes: SRC-M-0002

### BM-012 — Intenção de velocidade para potência
Nível A · Confiança moderada · Aplicabilidade parcial · Objetivos: power,strength,running_support · Perfis: trained,athlete
Afirmação: Potência depende de produzir força rapidamente; intenção de velocidade com controle é mais útil que um tempo de repetição universal.
Aplicação prática: Sem acelerômetro, não peça que o praticante ajuste a série pela degradação da velocidade, porque essa leitura exige experiência que ele em geral não tem. O caminho praticável é prescrever séries curtas, de cinco a seis repetições, com máxima intenção de velocidade e descanso adequado entre elas.
Limitações: Medição de velocidade nem sempre está disponível ou validada. Equipamento de medição é caro e de pouco acesso para o público deste app, o que inviabiliza a autoregulação por velocidade como conduta padrão.
Fontes: SRC-M-0001

### BM-013 — Periodização como ferramenta organizacional
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,power · Perfis: recreational,trained,athlete
Afirmação: Modelos linear e ondulatório produzem hipertrofia semelhante quando volume é equiparado; nenhum é universalmente superior.
Aplicação prática: Usar variação para organizar progressão, prática e fadiga, sem tratar o modelo como requisito mágico.
Limitações: Há menos dados em pessoas altamente treinadas.
Fontes: SRC-M-0013

### BM-014 — Autoregulação do treinamento
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,power · Perfis: recreational,trained,athlete
Afirmação: APRE, RPE, RIR e velocidade podem ajustar o treino ao estado do praticante, mas dependem de aprendizagem e medição consistente.
Aplicação prática: Combinar meta planejada com resposta real da sessão e manter registros consistentes. Para o iniciante, o uso mais defensável não é pedir que ele autoregule dentro da sessão, e sim acumular os registros e usar o cruzamento deles para planejar as sessões seguintes.
Limitações: Comparações entre métodos são heterogêneas. A qualidade da autoregulação depende fortemente da experiência do praticante, o que limita o método justamente em quem mais precisaria de ajuste.
Fontes: SRC-M-0014

### BM-015 — Técnicas avançadas como opções não obrigatórias
Nível A · Confiança moderada · Aplicabilidade parcial · Objetivos: strength,hypertrophy · Perfis: trained
Afirmação: Drop sets, rest-pause, supersets e outras técnicas podem economizar tempo ou variar estímulo, sem superioridade universal.
Aplicação prática: Priorizar técnica, progressão, volume recuperável e adesão antes de adicionar complexidade; reservar essas técnicas a quem já tem experiência de treino de força.
Limitações: Protocolos e equiparação de volume variam. São técnicas próprias de programas voltados à hipertrofia e têm pouco lugar em um programa de força como suporte à corrida.
Fontes: SRC-M-0015

### BM-016 — Compatibilidade do treino concorrente
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,hypertrophy,running_support · Perfis: recreational,trained,runner
Afirmação: Resistência e endurance são geralmente compatíveis, com pequena interferência possível em fibras, força ou potência quando o volume e a proximidade dos estímulos são altos.
Aplicação prática: Definir prioridade, gerenciar volume e separar sessões exigentes quando desempenho máximo for essencial. Neste app a corrida é a prioridade declarada do usuário, então a conduta padrão é evitar a faixa de interferência não adotando volumes altos no treino de força, em vez de tentar compensá-la depois.
Limitações: Interferência em fibras não implica necessariamente diferença no músculo inteiro.
Fontes: SRC-M-0016

### BM-017 — Ordem no treino concorrente
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: strength,running_support · Perfis: recreational,trained,runner
Afirmação: Quando resistência e endurance ocorrem na mesma sessão, realizar primeiro a prioridade pode preservar melhor o desfecho desejado.
Aplicação prática: Colocar primeiro o componente prioritário e separar sessões quando possível.
Limitações: Efeito mais claro para força dinâmica de membros inferiores.
Fontes: SRC-M-0017

### BM-018 — Aquecimento específico e mobilidade
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: health,strength,hypertrophy,power,function · Perfis: beginner,recreational,trained
Afirmação: Séries progressivas preparam a tarefa e o treinamento resistido em amplitude adequada pode melhorar mobilidade; alongamento separado não é universalmente obrigatório.
Aplicação prática: Usar aquecimento geral curto quando útil e séries específicas antes de cargas desafiadoras.
Limitações: Necessidades de mobilidade são individuais e específicas à tarefa.
Fontes: SRC-M-0011

### BM-019 — Sono e desempenho de força
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: health,strength,hypertrophy,power,function · Perfis: recreational,trained,athlete
Afirmação: Perda de sono pode reduzir algumas medidas de força, potência e resistência muscular, embora a resposta varie entre tarefas e indivíduos.
Aplicação prática: Diante de sono ruim, ficar no aviso, priorizando técnica e ajustando carga ou volume em vez de buscar recordes. A variação entre indivíduos é grande demais para justificar conduta mais prescritiva que isso.
Limitações: Número de estudos e amostras ainda é limitado. A resposta individual varia muito, o que desaconselha transformar o achado em regra de ajuste automático de carga.
Fontes: SRC-M-0018

### BM-020 — Proteína como benefício adicional ao treinamento
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: strength,hypertrophy,function · Perfis: adult,recreational,trained
Afirmação: Maior ingestão proteica pode acrescentar pequenos ganhos de massa magra e força em adultos quando combinada ao treinamento, sobretudo se a ingestão habitual for insuficiente.
Aplicação prática: Priorizar alimentação adequada e avaliação individual; não converter médias em prescrição automática.
Limitações: Dose individual depende de ingestão habitual, saúde e objetivo.
Fontes: SRC-M-0019

### BM-021 — Benefícios em adultos mais velhos
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: health,strength,hypertrophy,function · Perfis: older_adult,sarcopenia
Afirmação: Adultos mais velhos podem melhorar força, função e massa muscular com treinamento resistido adaptado à capacidade e ao estado de saúde.
Aplicação prática: Individualizar técnica, equilíbrio, carga e supervisão sem excluir estímulo desafiador somente pela idade. Neste público a preferência por máquinas costuma fazer mais sentido. Ações com velocidade na fase concêntrica são importantes para velocidade e ativação neuromuscular, mas a orientação precisa ser reescrita de forma inequívoca para essa faixa, em vez de repetir a fórmula de máxima intenção de velocidade.
Limitações: Condições clínicas e fragilidade alteram aplicabilidade. A expressão máxima intenção de velocidade é ambígua para este público e não deve ser usada sem reformulação.
Fontes: SRC-M-0020, SRC-M-0021

### BM-022 — Adaptações em mulheres sem regra hormonal universal
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: strength,hypertrophy,power,function · Perfis: female,recreational,trained,athlete
Afirmação: Mulheres obtêm ganhos robustos de força, potência e massa muscular; evidência não sustenta prescrição rígida por contraceptivo ou ciclo.
Aplicação prática: Individualizar por resposta, sintomas, objetivo e histórico, sem estereótipos.
Limitações: Outros métodos contraceptivos e fases hormonais têm dados limitados.
Fontes: SRC-M-0022, SRC-M-0023

### BM-023 — Treinamento resistido supervisionado para jovens
Nível A · Confiança alta · Aplicabilidade direta · Objetivos: health,strength,function · Perfis: youth,adolescent
Afirmação: Crianças e adolescentes podem ganhar força com baixa taxa de eventos adversos quando o programa é adequado ao desenvolvimento, supervisionado e orientado por técnica.
Aplicação prática: Fornecer educação geral e exigir responsável e profissional qualificado para programas individualizados ou testes máximos. Quando o tema aparecer, deixe claro que volume e intensidade precisam começar baixos e que o foco inicial é técnica.
Limitações: Maturidade, equipamento e qualidade da supervisão modificam segurança.
Fontes: SRC-M-0024

### BM-024 — Restrição de fluxo sanguíneo sob supervisão
Nível A · Confiança moderada · Aplicabilidade parcial · Objetivos: strength,hypertrophy,function · Perfis: adult,clinical_context
Afirmação: BFR com cargas baixas pode gerar adaptações, mas aplicação e segurança dependem de pressão, manguito, triagem e supervisão; não é método autônomo padrão.
Aplicação prática: Reservar BFR para contexto supervisionado por profissional competente. Este registro existe para responder com segurança a quem pergunta, não para propor o método: BFR está fora do escopo de uso deste app e nunca deve ser sugerido de forma ativa.
Limitações: Protocolos, pressões e populações são heterogêneos. Método fora do universo de aplicação deste app, que atende corredores amadores treinando sem supervisão presencial.
Fontes: SRC-M-0025, SRC-M-0026

### BM-025 — Benefícios amplos de saúde
Nível A · Confiança moderada · Aplicabilidade direta · Objetivos: health,function · Perfis: adult,recreational,older_adult
Afirmação: Atividades de fortalecimento estão associadas a menor risco de mortalidade e doenças crônicas, e a combinação com atividade aeróbia tende a ampliar benefícios.
Aplicação prática: Para saúde, priorizar consistência e combinação de modalidades em vez de maximizar volume.
Limitações: Grande parte da evidência de mortalidade é observacional.
Fontes: SRC-M-0027`;

export const KB_MUSC_MODULES: Record<
  "forca" | "hipertrofia" | "integracao_com_corrida" | "populacoes" | "potencia" | "saude_e_funcao",
  string
> = {
  forca: `MÓDULO — Força máxima
Força é específica (BM-002). Cargas relativamente altas e prática da tarefa favorecem testes máximos (BM-003), mas iniciantes devem dominar técnica e progressão antes. Volume apresenta retornos decrescentes (BM-005), falha não é obrigatória (BM-007) e descanso deve preservar desempenho (BM-008).

Ordenar primeiro o exercício prioritário (BM-011) e usar autoregulação quando houver domínio das escalas (BM-014). Não inventar 1RM nem prescrever teste máximo sem contexto.

Evidências prioritárias: BM-002, BM-003, BM-005, BM-007, BM-008, BM-011, BM-014.`,

  hipertrofia: `MÓDULO — Hipertrofia
Hipertrofia ocorre com ampla faixa de cargas quando o esforço é suficiente (BM-004). Volume influencia a resposta, mas apresenta retornos decrescentes e tolerância individual (BM-005). Falha não é obrigatória (BM-007), descansos muito curtos podem reduzir trabalho (BM-008) e máquinas ou pesos livres são opções válidas (BM-010).

Não associar hipertrofia a valor pessoal, insatisfação corporal, restrição alimentar ou substâncias. Para menores, limitar-se a educação geral e supervisão.

Evidências prioritárias: BM-001, BM-004, BM-005, BM-006, BM-007, BM-008, BM-009, BM-010, BM-020.`,

  integracao_com_corrida: `MÓDULO — Musculação integrada à corrida
Treino concorrente é compatível, com pequena interferência possível quando volumes são altos ou estímulos ficam próximos (BM-016). Se ambos ocorrerem na mesma sessão, colocar primeiro a prioridade (BM-017). Para corredores, preservar qualidade das sessões-chave, gerenciar fadiga de membros inferiores e usar força como suporte, não como competição com a corrida.

Não há divisão semanal universal. A escolha depende de prova-alvo, volume de corrida, experiência de força, histórico de lesão e recuperação.

Evidências prioritárias: BM-003, BM-005, BM-007, BM-016, BM-017, BM-019.`,

  populacoes: `MÓDULO — Populações

Pessoas idosas: respondem em força e função; adaptar por capacidade, saúde e supervisão, sem excluir desafios apenas pela idade (BM-021).

Mulheres: obtêm adaptações robustas. Não impor regras universais baseadas em sexo, contraceptivo ou fase do ciclo (BM-022).

Jovens: treinamento supervisionado e orientado por técnica pode ser seguro e benéfico. O agente não gera plano autônomo avançado, teste máximo, suplementação ou objetivo estético para menores (BM-023).

Retorno após lesão: exige avaliação apropriada. A base não libera retorno nem prescreve reabilitação clínica.`,

  potencia: `MÓDULO — Potência
Potência exige intenção de produzir força rapidamente (BM-012). A qualidade da repetição e a velocidade não devem ser sacrificadas por fadiga desnecessária. Exercícios técnicos e explosivos exigem progressão e supervisão proporcionais à experiência.

Evidências prioritárias: BM-002, BM-003, BM-007, BM-008, BM-012, BM-014.`,

  saude_e_funcao: `MÓDULO — Saúde e função
Priorizar aderência, principais padrões de movimento, progressão conservadora e função cotidiana. Treinamento resistido melhora força, massa muscular e função (BM-001) e está associado a benefícios amplos de saúde (BM-025). Máquinas, pesos livres, elásticos e peso corporal podem ser escolhidos por acesso, segurança e preferência (BM-010).

Evitar transformar objetivo de saúde em busca de exaustão, aparência ou volume máximo. Integrar atividade aeróbia quando apropriado.

Evidências prioritárias: BM-001, BM-005, BM-010, BM-018, BM-019, BM-025.`,
};

// Catálogo de fontes públicas (para citar link quando fizer sentido)
export const KB_MUSC_SOURCES = `FONTES PÚBLICAS (id — título, ano — link)
SRC-M-0001 — ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
SRC-M-0002 — The influence of resistance exercise training prescription variables on skeletal muscle mass, strength, and physical function in healthy adults (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10818109/
SRC-M-0003 — Resistance Training Variables for Optimization of Muscle Hypertrophy (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9302196/
SRC-M-0004 — Task Specificity of Dynamic Resistance Training and Its Transferability to Non-trained Isometric Muscle Strength (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12296774/
SRC-M-0005 — Effects of strength training on neuromuscular adaptations in the development of maximal strength (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12130258/
SRC-M-0006 — The Effects of Low-Load Vs. High-Load Resistance Training on Muscle Fiber Hypertrophy (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7706639/
SRC-M-0007 — The Effect of Weekly Set Volume on Strength Gain (2017) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5684266/
SRC-M-0008 — Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9935748/
SRC-M-0009 — Give it a rest: effect of inter-set rest interval duration on muscle hypertrophy (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11349676/
SRC-M-0010 — Effects of range of motion on muscle development during resistance training interventions (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6977096/
SRC-M-0011 — Resistance Training Induces Improvements in Range of Motion (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9935664/
SRC-M-0012 — Effect of free-weight vs. machine-based strength training on maximal strength, hypertrophy and jump performance (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10426227/
SRC-M-0013 — Effects of linear and daily undulating periodized resistance training programs on muscle hypertrophy (2017) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5571788/
SRC-M-0014 — Autoregulated resistance training for maximal strength enhancement (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12336695/
SRC-M-0015 — Effects of Advanced Resistance Training Systems on Muscle Hypertrophy and Strength in Recreationally Trained Adults (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12922048/
SRC-M-0016 — The Effects of Concurrent Aerobic and Strength Training on Muscle Fiber Hypertrophy (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9474354/
SRC-M-0017 — The Role of Intra-Session Exercise Sequence in the Interference Effect (2018) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5752732/
SRC-M-0018 — Implications of sleep loss or sleep deprivation on muscle strength (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12263768/
SRC-M-0019 — Effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults (2018) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5867436/
SRC-M-0020 — Effects of maximal versus submaximal intended velocity resistance training on muscular fitness adaptations in older adults (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC13250209/
SRC-M-0021 — Optimal resistance training prescriptions in older adults diagnosed with sarcopenia (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12602684/
SRC-M-0022 — Effects of Resistance Training on Muscular Fitness, Muscle Morphology, and Body Composition in Elite Female Athletes (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10432341/
SRC-M-0023 — Effect of Hormonal Contraceptive Use on Adaptations to Resistance Exercise Training (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10798924/
SRC-M-0024 — Resistance Training for Children and Adolescents (2020) — https://doi.org/10.1542/peds.2020-1011
SRC-M-0025 — Blood Flow Restriction Exercise: Considerations of Methodology, Application, and Safety (2019) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6530612/
SRC-M-0026 — Effect of blood-flow restricted vs heavy-load resistance training on strength, power, and speed (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11927561/
SRC-M-0027 — Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9209691/`;

export function buildMuscKbContext(): string {
  return [
    `=== KB_MUSC_SR (${KB_MUSC_VERSION}) — base de conhecimento de musculação ===`,
    KB_MUSC_SAFETY_POLICY,
    KB_MUSC_RESPONSE_POLICY,
    KB_MUSC_IP_POLICY,
    Object.values(KB_MUSC_MODULES).join("\n\n"),
    KB_MUSC_EVIDENCE,
    KB_MUSC_GLOSSARY,
    KB_MUSC_SOURCES,
    "=== fim da KB_MUSC_SR ===",
  ].filter(Boolean).join("\n\n");
}
