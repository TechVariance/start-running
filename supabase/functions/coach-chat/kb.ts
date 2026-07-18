// KB_RUN_SR — base de conhecimento de treinamento de corrida (5K/10K/21K/42K).
// Embutida diretamente na function (em vez de depender de uma tabela) para não
// depender de mais uma migração de banco ser aplicada no Supabase do Lovable.
// Fonte canônica: /KB_RUN_SR no repositório (v1.1.0-rag). Se o conteúdo da KB
// mudar lá, replique aqui manualmente.

export const KB_VERSION = "KB_RUN_SR v1.1.0-rag (corrida 5K/10K/21K/42K)";

export const KB_SAFETY_POLICY = `POLÍTICA DE SEGURANÇA E ENCAMINHAMENTO (prioridade máxima — nunca contrarie isto)
O agente não diagnostica, não libera retorno após lesão e não substitui avaliação clínica. Não incentive treino por meio de dor persistente nem apresente desconforto como requisito de progresso.

Interrompa a recomendação esportiva e oriente avaliação profissional apropriada diante de:
- Dor no peito, desmaio, confusão, falta de ar desproporcional ou sintomas neurológicos durante esforço.
- Dor localizada persistente, incapacidade de apoiar o membro, piora progressiva ou suspeita de lesão óssea.
- Sinais recorrentes compatíveis com baixa disponibilidade energética, alteração menstrual relevante, fadiga persistente ou quedas inexplicadas de desempenho.
- Retorno após cirurgia, fratura, condição cardiometabólica relevante ou gestação sem liberação profissional.
Em situação potencialmente urgente, oriente interrupção do exercício e busca de atendimento local imediato.

Menores de 18 anos: só educação geral e opções conservadoras. Prescrição individualizada exige responsável e profissional habilitado. Não forneça metas de emagrecimento, contagem calórica, restrição alimentar ou incentivo a volumes/intensidades excessivos.

Nutrição, hidratação e suplementos: não prescreva restrição energética; não indique dose individual de suplemento/substância sem avaliação; não recomende ingestão excessiva de líquidos ("beber o máximo possível" é orientação insegura); estratégias para 21K/42K devem ser testadas progressivamente em treino.

Progressão: não apresente a regra dos 10% como garantia de segurança. Considere carga por sessão, volume, intensidade, terreno, sono, histórico de lesão e resposta subjetiva. Evite mudar várias variáveis grandes ao mesmo tempo.`;

export const KB_RESPONSE_POLICY = `POLÍTICA DE RESPOSTAS (segue em prioridade logo após a de segurança)
Processo obrigatório antes de responder algo técnico sobre corrida:
1. Identifique distância, perfil do corredor, objetivo e natureza da pergunta.
2. Baseie-se nos registros de evidência (BC-xxx) e módulos de distância fornecidos abaixo — nunca em conhecimento geral não referenciado, quando o tema for coberto pela base.
3. Priorize evidência direta, recente e de nível A/B.
4. Verifique limitações, contraindicações e divergências antes de generalizar.
5. Responda em linguagem simples, distinguindo evidência, aplicação prática e incerteza.
6. Cite os identificadores BC-xxx relevantes na resposta.

Linguagem controlada (use estes termos com o sentido exato abaixo):
- "Recomenda-se": evidência consistente, aplicação direta e risco baixo.
- "Pode ser considerado": benefício provável, condicionado ao contexto.
- "Está associado": dado observacional; não implica causalidade.
- "Evidência insuficiente": não há base adequada para conclusão operacional — diga isso explicitamente em vez de inventar.

Personalização: antes de sugerir uma estrutura individual de treino (plano, volume, ritmo, carga de força), tente obter ao menos idade, experiência, distância-alvo, data da prova, frequência atual, volume recente, maior treino recente, disponibilidade semanal, histórico de lesão e restrições relevantes — parte disso já vem no contexto do atleta abaixo; para o que faltar, pergunte ou ofereça apenas princípios gerais/exemplo ilustrativo claramente rotulado como tal. Nunca invente ritmo, quilometragem, carga de força ou ingestão individual que não foram informados.

Conflito entre fontes: informe a divergência, explique diferenças de população/desenho/desfecho, prefira a conclusão mais prudente, nunca oculte incerteza para parecer mais categórico.

Escopo: esta base cobre treinamento de corrida de rua (5K/10K/21K/42K). Musculação e natação têm bases de evidência próprias e igualmente conectadas (KB_MUSC_SR, com registros BM-xxx, e KB_SWIM_SR, com registros SW-xxx) — nunca cite BC-xxx para afirmações sobre força ou natação, nem o inverso; use o registro da base correspondente ao tema da pergunta.`;

export const KB_IP_POLICY = `PROPRIEDADE INTELECTUAL: cite apenas metadados bibliográficos, DOI/PMID/links públicos e paráfrases curtas das fontes abaixo. Nunca reproduza artigos/planos protegidos na íntegra.`;

export const KB_GLOSSARY = `GLOSSÁRIO CONTROLADO
- Aplicabilidade direta: população, intervenção e desfecho próximos ao uso pretendido.
- Baixa intensidade: esforço abaixo do primeiro limiar fisiológico (modelo de três zonas); não é um ritmo universal.
- Carga externa: trabalho executado (distância, duração, velocidade, elevação).
- Carga interna: resposta individual (RPE, frequência cardíaca).
- Durabilidade: capacidade de preservar desempenho fisiológico/mecânico com fadiga acumulada.
- Economia de corrida: custo energético/O2 para sustentar uma velocidade submáxima.
- HIIT: treino intervalado de alta intensidade.
- Limiar: faixa fisiológica que exige método de medição; não é número universal.
- Modelo piramidal: predominância de baixa intensidade, menos moderada, ainda menos alta.
- Modelo polarizado: predominância de baixa intensidade, pouca moderada, parcela menor de alta.
- RPE: percepção subjetiva de esforço. sRPE: duração da sessão × RPE global.
- Taper: redução planejada de carga pré-prova para dissipar fadiga preservando adaptações.
- VO₂máx/VO₂pico: maior taxa de consumo de O2 medida/observada em teste apropriado.`;

// Registros de evidência (BC-xxx) — cada um é uma afirmação científica autocontida.
export const KB_EVIDENCE = `REGISTROS DE EVIDÊNCIA (cite o BC-xxx usado na resposta)

### BC-001 — Predominância de baixa intensidade no treinamento de endurance
Nível A · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: A maior parte do treinamento de endurance deve ocorrer em baixa intensidade; modelos piramidal e polarizado são defensáveis, sem superioridade universal do polarizado.
Aplicação prática: Preservar predominância de sessões fáceis e usar intensidade alta de forma deliberada sem transformar 80/20 em regra rígida.
Limitações: a classificação muda conforme medida (sessão, tempo, FC ou percepção); parte dos dados vem de atletas treinados e de outros esportes de endurance.
Fontes: SRC-0005, SRC-0003

### BC-002 — Uso contextual do treinamento intervalado de alta intensidade
Nível A · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained
Afirmação: Intervalados de alta intensidade podem melhorar VO2max, economia e desempenho, mas o protocolo ideal depende do nível, objetivo e tolerância do corredor.
Aplicação prática: Selecionar duração, recuperação e intensidade pela adaptação-alvo e capacidade de recuperação — não pela ideia de que mais intenso é sempre melhor.
Limitações: protocolos e populações heterogêneos; amostras pequenas e intervenções curtas em vários estudos.
Fontes: SRC-0003, SRC-0004

### BC-003 — Trabalho de limiar como componente específico
Nível B · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained
Afirmação: A velocidade no limiar relaciona-se ao desempenho de fundo; sessões próximas ao limiar são úteis, mas intensidade moderada em excesso não mostra superioridade consistente.
Aplicação prática: Usar trabalho de limiar como sessão específica, evitando que vire o ritmo padrão de todos os treinos.
Limitações: métodos de determinação do limiar não são intercambiáveis; dose ideal por distância/perfil ainda não é universal.
Fontes: SRC-0003, SRC-0005

### BC-004 — Treinamento de força para economia e desempenho
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: Treino de força com cargas altas, pliometria ou métodos combinados tende a melhorar a economia de corrida e pode melhorar desempenho em corredores de média/longa distância.
Aplicação prática: Integrar força progressiva ao ciclo, compatibilizando com sessões-chave e capacidade técnica do corredor.
Limitações: confiança maior para economia do que para prevenção de lesão; exercícios/cargas não devem ser copiados sem avaliação técnica.
Fontes: SRC-0006, SRC-0007

### BC-005 — Progressão de carga sem regra semanal universal
Nível A · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: beginner,recreational,trained,return_to_run
Afirmação: A regra dos 10% ao ano não está validada como limite universal; histórico de lesão, carga por sessão e contexto individual pesam mais.
Aplicação prática: Monitorar maior sessão recente, volume, intensidade, terreno e resposta do atleta; progredir uma variável relevante por vez quando possível.
Limitações: alta confiança sobre lesão prévia, mas baixa/moderada para limiares numéricos de progressão; achado sobre picos em sessão única precisa de replicação.
Fontes: SRC-0012, SRC-0013, SRC-0026

### BC-006 — Taper com redução de volume e preservação de qualidade
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: O taper tende a melhorar desempenho quando reduz de forma relevante o volume e preserva intensidade; duração/magnitude devem ser individualizadas.
Aplicação prática: Reduzir volume antes da prova sem eliminar estímulos de qualidade; considerar mais dissipação de fadiga em provas longas.
Limitações: melhor duração depende de carga anterior, distância e indivíduo; dados agrupam modalidades/níveis diferentes.
Fontes: SRC-0008

### BC-007 — Monitoramento combinado de carga externa e interna
Nível B · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: beginner,recreational,trained,elite
Afirmação: Distância/duração/velocidade descrevem o trabalho executado; RPE e respostas fisiológicas ajudam a estimar o custo individual desse trabalho.
Aplicação prática: Registrar por sessão duração/distância, tipo, RPE global, dor, sono e ambiente; interpretar tendência, não um valor isolado.
Limitações: métricas diferentes não são diretamente intercambiáveis; resposta individual e qualidade do sensor alteram a interpretação.
Fontes: SRC-0009

### BC-008 — Wearables como apoio e não como decisão clínica
Nível A · Confiança moderada · Aplicabilidade parcial · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained
Afirmação: Feedback de wearables pode ajudar técnica, controle de ritmo e motivação, mas métricas proprietárias não substituem contexto, percepção ou avaliação profissional.
Aplicação prática: Guardar dado bruto e contexto; tratar VO2max estimado, readiness e carga proprietária como estimativas, não diagnósticos.
Limitações: efeito depende do dispositivo/algoritmo/desfecho; evidência para redução de lesão ainda limitada.
Fontes: SRC-0022

### BC-009 — Fundamentos da recuperação em atletas de endurance
Nível A · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: Não há modalidade isolada de recuperação com superioridade consistente; carga adequada, sono, nutrição e periodização são os fundamentos.
Aplicação prática: Usar massagem, frio, compressão e tecnologias como complementos definidos por objetivo, preferência, custo e timing.
Limitações: modalidades podem reduzir dor percebida sem melhorar adaptação/desempenho; protocolos e medidas de recuperação são heterogêneos.
Fontes: SRC-0018, SRC-0019

### BC-010 — Sono como componente central da recuperação
Nível A · Confiança moderada · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite,masters
Afirmação: Sono insuficiente pode comprometer recuperação; atletas podem precisar de mais sono conforme carga/déficit acumulado; extensão de sono e cochilos são estratégias promissoras.
Aplicação prática: Monitorar regularidade, duração, qualidade percebida e sonolência; ajustar carga diante de déficit persistente.
Limitações: necessidade individual varia; qualidade dos estudos de intervenção é desigual.
Fontes: SRC-0019

### BC-011 — Carboidrato em esforços prolongados
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: A disponibilidade de carboidrato influencia sustentar esforço intenso/prolongado; ingestão durante esforços longos pode melhorar desempenho quando individualizada e tolerada.
Aplicação prática: Para esforços suficientemente longos, testar antecipadamente produto, dose, concentração, timing e líquidos; nunca estrear estratégia na prova.
Limitações: necessidade varia com duração, intensidade e estoque energético; tolerância gastrointestinal limita médias populacionais.
Fontes: SRC-0015

### BC-012 — Risco de hidratação excessiva em endurance
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: Hiponatremia associada ao exercício está frequentemente ligada a ingestão de líquido acima das perdas, sobretudo em esforços longos; "beber o máximo possível" não é orientação segura.
Aplicação prática: Considerar sede, duração, condições ambientais, taxa individual de suor e oportunidades de abastecimento; testar a estratégia em treino.
Limitações: necessidades são individuais e mudam com ambiente/ritmo; condições clínicas e ambientes extremos exigem orientação profissional.
Fontes: SRC-0016

### BC-013 — Aclimatação para treinamento e competição no calor
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: Exposições repetidas e controladas ao calor antes da competição melhoram respostas termorregulatórias e são a principal preparação fisiológica para competir em ambiente quente.
Aplicação prática: Preparar-se progressivamente em ambiente semelhante, ajustar ritmo e manter plano de segurança, evitando exposição extrema sem supervisão.
Limitações: protocolo ideal depende da carga térmica e do estado do atleta; resposta e retenção das adaptações variam.
Fontes: SRC-0017

### BC-014 — Prevenção multifatorial de lesões relacionadas à corrida
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: beginner,recreational,trained,return_to_run
Afirmação: Lesões de corrida resultam da interação entre histórico, exposição, capacidade e fatores biomecânicos; nenhum exercício isolado demonstrou prevenção universal.
Aplicação prática: Combinar histórico, progressão contextual, educação, força, técnica quando indicada e acesso rápido à avaliação de sintomas persistentes.
Limitações: confiança menor para intervenções específicas; definições de lesão e populações variam entre estudos.
Fontes: SRC-0011, SRC-0012, SRC-0014

### BC-015 — Cadência e passada sem número universal
Nível A · Confiança moderada · Aplicabilidade parcial · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,return_to_run
Afirmação: Aumentar cadência pode reduzir algumas cargas biomecânicas, mas não há cadência universal; o efeito sobre lesão e desempenho depende do corredor.
Aplicação prática: Considerar reeducação só com objetivo definido, mudança gradual e monitoramento de sintomas e desempenho.
Limitações: evidência mais forte para mudanças biomecânicas agudas do que para prevenção de lesão; mudanças podem redistribuir carga para outros tecidos.
Fontes: SRC-0014

### BC-016 — Alongamento e aquecimento para corrida
Nível A · Confiança moderada · Aplicabilidade parcial · Distâncias: 5K,10K,21K,42K,geral · Perfis: beginner,recreational,trained
Afirmação: Alongamento não substitui aquecimento nem previne universalmente lesões; efeitos agudos dependem de tipo, duração, momento e tarefa subsequente.
Aplicação prática: Antes de esforços rápidos, priorizar aquecimento dinâmico e específico; usar mobilidade/alongamento conforme necessidade individual.
Limitações: evidência de prevenção de lesão em corredores é limitada; protocolos de alongamento diferem muito entre estudos.
Fontes: SRC-0003

### BC-017 — Baixa disponibilidade energética e risco sistêmico
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite,female,male,adolescent
Afirmação: Ingestão energética persistentemente incompatível com a carga pode prejudicar saúde óssea, endócrina, reprodutiva, imune e desempenho, em pessoas de diferentes sexos.
Aplicação prática: Nunca associar melhora de desempenho a restrição ou perda de peso; diante de sinais de risco, orientar avaliação multidisciplinar.
Limitações: estimativas de disponibilidade energética em campo são imprecisas; ferramentas de triagem não substituem diagnóstico profissional.
Fontes: SRC-0020, SRC-0025

### BC-018 — Individualização relacionada ao ciclo menstrual
Nível A · Confiança moderada · Aplicabilidade parcial · Distâncias: 5K,10K,21K,42K,geral · Perfis: female,recreational,trained,elite
Afirmação: Efeitos médios da fase menstrual sobre desempenho são pequenos e variáveis, não sustentando sincronização rígida e universal do treinamento.
Aplicação prática: Registrar sintomas e resposta individual, adaptando só quando houver padrão consistente, preservando atenção à saúde menstrual.
Limitações: qualidade e padronização dos estudos ainda limitadas; respostas individuais podem diferir das médias.
Fontes: SRC-0020

### BC-019 — Treinamento e recuperação em corredores masters
Nível B · Confiança moderada · Aplicabilidade parcial · Distâncias: 5K,10K,21K,42K,geral · Perfis: masters,recreational,trained
Afirmação: Corredores masters treinados podem preservar boa economia de corrida, embora recuperação, capacidade aeróbia e risco individual ganhem importância com a idade.
Aplicação prática: Manter estímulos aeróbios e de força, individualizando recuperação, progressão e avaliação clínica.
Limitações: grande heterogeneidade entre indivíduos; parte da evidência é observacional.
Fontes: SRC-0021

### BC-020 — Tecnologia avançada de calçados e economia de corrida
Nível A · Confiança alta · Aplicabilidade direta · Distâncias: 5K,10K,21K,42K,geral · Perfis: recreational,trained,elite
Afirmação: Calçados com placas e espumas avançadas reduzem o custo metabólico em média, mas a resposta é individual e o benefício não prova prevenção de lesões.
Aplicação prática: Testar conforto e resposta antes da prova, respeitar regras esportivas e evitar mudança abrupta de equipamento.
Limitações: magnitude varia entre corredores e velocidades; evidência de prevenção de lesão é insuficiente.
Fontes: SRC-0023`;

export const KB_DISTANCE_MODULES: Record<"5k" | "10k" | "21k" | "maratona", string> = {
  "5k": `MÓDULO — 5 KM
Demanda predominante: potência aeróbia, velocidade associada ao VO2máx, economia de corrida, capacidade de sustentar intensidade alta e execução de ritmo. Desempenho continua majoritariamente aeróbio; "prova curta" não significa treino exclusivamente rápido.
Ênfases sustentadas pela base: predominância de baixa intensidade (BC-001); intervalos de alta intensidade selecionados pela adaptação-alvo (BC-002); trabalho de limiar sem virar regra (BC-003); força com progressão técnica (BC-004); taper geralmente menor que o da maratona (BC-006); aquecimento dinâmico e específico antes de esforços máximos/submáximos (BC-016).
Restrições: não inferir ritmos de treino sem desempenho recente ou teste apropriado; não prescrever frequência de intervalados universal; volume/recuperação dependem de experiência, histórico e carga atual.
Evidências prioritárias: BC-001, BC-002, BC-003, BC-004, BC-006, BC-007, BC-016.`,

  "10k": `MÓDULO — 10 KM
Demanda predominante: interação entre potência aeróbia, economia e capacidade de sustentar alta fração da capacidade aeróbia, frequentemente próxima ao limiar individual.
Ênfases sustentadas pela base: base majoritária em baixa intensidade (BC-001); intervalos longos e sessões de limiar como opções específicas (BC-002, BC-003); força integrada sem comprometer sessões-chave (BC-004); monitoramento conjunto de carga externa e interna (BC-007); taper com redução de volume e preservação de intensidade (BC-006).
Restrições: não converter "ritmo de limiar" em valor fixo por FC ou pace sem método e contexto; não assumir que mais tempo em intensidade intermediária produz melhor resultado.
Evidências prioritárias: BC-001, BC-002, BC-003, BC-004, BC-005, BC-006, BC-007.`,

  "21k": `MÓDULO — MEIA MARATONA
Demanda predominante: limiar, economia, resistência, durabilidade inicial, controle de ritmo e relevância crescente de abastecimento conforme o tempo individual de prova.
Ênfases sustentadas pela base: volume fácil predominante e progressão contextual (BC-001, BC-005); blocos prolongados controlados, próximos ao objetivo fisiológico da sessão (BC-003); longos progressivos só quando compatíveis com experiência e recuperação; força para economia e robustez, sem alegar prevenção garantida de lesão (BC-004); prática prévia de carboidrato e hidratação quando a duração justificar (BC-011, BC-012); preparação ambiental para calor (BC-013); taper individualizado (BC-006).
Restrições: não usar uma duração de longo, dose de carboidrato ou volume semanal como regra universal; diferenciar atleta que completa a prova rápido daquele exposto por várias horas.
Evidências prioritárias: BC-001, BC-003, BC-004, BC-005, BC-006, BC-011, BC-012, BC-013.`,

  "maratona": `MÓDULO — MARATONA
Demanda predominante: durabilidade, economia sob fadiga, resistência musculoesquelética, controle de ritmo, disponibilidade energética, hidratação individual e gestão ambiental.
Ênfases sustentadas pela base: predominância de baixa intensidade para acumular volume tolerável (BC-001); progressão baseada no histórico e no tamanho da sessão mais longa recente (BC-005); corridas longas e blocos específicos usados progressivamente, sem quilometragem mágica; força como suporte à economia e desempenho (BC-004); monitoramento de carga, sono, dor e resposta subjetiva (BC-007, BC-010); nutrição e hidratação ensaiadas nos treinos (BC-011, BC-012); aclimatação e ajuste de expectativas no calor (BC-013); taper frequentemente de 2–3 semanas, individualizado (BC-006).
Restrições: não prescrever maratona a partir de poucas informações — exigir histórico de corrida, volume e maior treino recentes, tolerância musculoesquelética, disponibilidade semanal, data da prova e histórico clínico relevante; nunca recomendar "beber o máximo possível", restrição energética ou estratégia inédita no dia da prova.
Evidências prioritárias: BC-001, BC-004, BC-005, BC-006, BC-007, BC-009, BC-010, BC-011, BC-012, BC-013, BC-014, BC-017.`,
};

// Catálogo de fontes públicas (para citar link quando fizer sentido)
export const KB_SOURCES = `FONTES PÚBLICAS (id — título, ano — link)
SRC-0001 — Endurance exercise performance: the physiology of champions (2008) — https://pmc.ncbi.nlm.nih.gov/articles/PMC2375555/
SRC-0002 — Running economy: measurement, norms, and determining factors (2015) — https://pmc.ncbi.nlm.nih.gov/articles/PMC4555089/
SRC-0003 — Factors Affecting Training and Physical Performance in Recreational Endurance Runners (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7183043/
SRC-0004 — A Systematic Review of the Factors Associated with Performance in Non-Elite Runners (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC13027911/
SRC-0005 — Comparison of Polarized Versus Other Types of Endurance Training Intensity Distribution (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11329428/
SRC-0006 — Effect of Strength Training Programs in Middle- and Long-Distance Runners' Economy (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/
SRC-0007 — The Effect of Strength Training Methods on Middle-Distance and Long-Distance Runners' Athletic Performance (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11258194/
SRC-0008 — Effects of tapering on performance in endurance athletes (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10171681/
SRC-0009 — Session RPE Combined With Training Volume for Estimating Training Responses in Runners (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7740055/
SRC-0010 — Quantitative Analysis of 92 12-Week Sub-elite Marathon Training Plans (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11065819/
SRC-0011 — A systematic review of running-related musculoskeletal injuries in runners (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8500811/
SRC-0012 — Risk factors for running-related injuries: An umbrella systematic review (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11336318/
SRC-0013 — How much running is too much? High-risk running sessions in a 5200-person cohort (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12421110/
SRC-0014 — Running-Related Biomechanical Risk Factors for Overuse Injuries (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9325808/
SRC-0015 — Nutrition and Supplement Update for the Endurance Athlete (2019) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6628334/
SRC-0016 — Exercise-Associated Hyponatremia: 2017 Update (2017) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5334560/
SRC-0017 — IOC consensus statement on sport events in the heat (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9811094/
SRC-0018 — Effectiveness of Recovery Strategies After Training/Competition in Endurance Athletes (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11098991/
SRC-0019 — The Impact of Sleep Interventions on Athletic Performance (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10354314/
SRC-0020 — 2025 Update to the Female Athlete Triad Coalition Consensus Statement (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12982345/
SRC-0021 — Older Runners Retain Youthful Running Economy Despite Biomechanical Differences (2016) — https://pmc.ncbi.nlm.nih.gov/articles/PMC4795964/
SRC-0022 — The Effect of Wearable-Based Real-Time Feedback on Running Injuries and Performance (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10905988/
SRC-0023 — Metabolic effects of carbon-plated running shoes (2026) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12827780/
SRC-0024 — Long Distance Running and Knee Osteoarthritis: A Prospective Study (2008) — https://pmc.ncbi.nlm.nih.gov/articles/PMC2556152/
SRC-0025 — Healthy Runner Project: 7-year nutrition education intervention (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10174024/
SRC-0026 — Preventing bone stress injuries in runners with optimal workload (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8316280/`;

export function pickDistanceModule(raceDistanceM: number | null | undefined): string | null {
  if (!raceDistanceM) return null;
  if (raceDistanceM <= 6000) return KB_DISTANCE_MODULES["5k"];
  if (raceDistanceM <= 12000) return KB_DISTANCE_MODULES["10k"];
  if (raceDistanceM <= 25000) return KB_DISTANCE_MODULES["21k"];
  return KB_DISTANCE_MODULES.maratona;
}

export function buildKbContext(raceDistanceM: number | null | undefined): string {
  const relevantModule = pickDistanceModule(raceDistanceM);
  return [
    `=== KB_RUN_SR (${KB_VERSION}) — base de conhecimento de corrida ===`,
    KB_SAFETY_POLICY,
    KB_RESPONSE_POLICY,
    KB_IP_POLICY,
    relevantModule ? `MÓDULO DA DISTÂNCIA-ALVO DO ATLETA:\n${relevantModule}` : null,
    KB_EVIDENCE,
    KB_GLOSSARY,
    KB_SOURCES,
    "=== fim da KB_RUN_SR ===",
  ].filter(Boolean).join("\n\n");
}
