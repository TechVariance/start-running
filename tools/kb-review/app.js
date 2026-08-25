/* Revisão técnica do conteúdo do Start Running.
   Quem preenche é técnico de corrida, não engenheiro de base de conhecimento:
   nada de identificador, YAML ou nomenclatura interna aparece na tela. A tradução
   entre a linguagem do técnico e a estrutura da base acontece toda aqui dentro. */

(function () {
  "use strict";

  const DATA = JSON.parse(document.getElementById("kb-data").textContent);
  const STORE_KEY = "kb-review-sr-v2";
  const TODAY = new Date().toISOString().slice(0, 10);

  const KB = {};
  DATA.kbs.forEach(function (k) {
    KB[k.key] = k;
  });

  const RUN = KB.RUN;
  const MUSC = KB.MUSC;

  const allClaims = [];
  DATA.kbs.forEach(function (kb) {
    kb.evidence.forEach(function (r) {
      r._kb = kb.key;
      allClaims.push(r);
    });
  });

  const allQuestions = [];
  DATA.kbs.forEach(function (kb) {
    kb.golden.forEach(function (g) {
      g._kb = kb.key;
      allQuestions.push(g);
    });
  });

  // Documentos que o técnico consegue julgar. Ficam de fora, de propósito:
  // propriedade intelectual e política de recuperação, que são decisões de
  // engenharia e jurídico, não de treinamento.
  const docs = [];
  DATA.kbs.forEach(function (kb) {
    kb.policies.forEach(function (p) {
      if (p.path.indexOf("propriedade") !== -1) return;
      const seguranca = p.path.indexOf("seguranca") !== -1;
      docs.push({
        key: kb.key + ":" + p.path,
        kb: kb.key,
        grupo: seguranca ? "Quando o app manda procurar um profissional" : "Como o app fala com o aluno",
        titulo: (seguranca ? "Regras de segurança" : "Regras de linguagem") + " — " + kb.label.toLowerCase(),
        body: p.body,
        peso: seguranca ? 1 : 2,
      });
    });
    kb.syntheses.forEach(function (s) {
      docs.push({
        key: kb.key + ":" + s.path,
        kb: kb.key,
        grupo: kb.key === "RUN" ? "Resumo por distância de prova" : "Resumo por objetivo de treino",
        titulo: s.title,
        body: s.body,
        peso: 3,
      });
    });
    if (kb.glossary) {
      docs.push({
        key: kb.key + ":" + kb.glossary.path,
        kb: kb.key,
        grupo: "Vocabulário",
        titulo: "Termos usados em " + kb.label.toLowerCase(),
        body: kb.glossary.body,
        peso: 4,
      });
    }
  });
  docs.sort(function (a, b) {
    return a.peso - b.peso;
  });

  /* -------------------------------------------------------------- estado */

  const blank = {
    version: 2,
    acknowledged: false,
    reviewer: {},
    claims: {},
    docs: {},
    questions: {},
    newQuestions: [],
    faltas: {},
    fontes_obs: "",
    parecer: {},
    savedAt: null,
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(blank));
      return Object.assign(JSON.parse(JSON.stringify(blank)), JSON.parse(raw));
    } catch (e) {
      return JSON.parse(JSON.stringify(blank));
    }
  }

  let saveTimer = null;
  function save() {
    setSaveState("dirty");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        state.savedAt = new Date().toISOString();
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
        setSaveState("saved");
      } catch (e) {
        setSaveState("error");
      }
      renderTrail();
    }, 400);
  }

  function setSaveState(kind) {
    const box = document.getElementById("save-state");
    if (!box) return;
    box.dataset.state = kind;
    const when = state.savedAt
      ? new Date(state.savedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : null;
    document.getElementById("save-label").textContent =
      kind === "dirty" ? "salvando" : kind === "error" ? "não consegui salvar" : when ? "salvo às " + when : "salvo";
  }

  /* ---------------------------------------------------------------- util */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function lines(v) {
    return String(v || "")
      .split(/\r?\n/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  let uid = 0;
  function textarea(placeholder, rows) {
    return el('<textarea id="t' + ++uid + '" rows="' + (rows || 4) + '" placeholder="' + esc(placeholder || "") + '"></textarea>');
  }
  function textinput(placeholder) {
    return el('<input type="text" id="t' + ++uid + '" placeholder="' + esc(placeholder || "") + '">');
  }

  function field(label, hint, control) {
    const f = el('<div class="field"></div>');
    const l = el("<label>" + esc(label) + "</label>");
    f.appendChild(l);
    if (hint) f.appendChild(el('<span class="f-hint">' + esc(hint) + "</span>"));
    f.appendChild(control);
    if (control.id) l.setAttribute("for", control.id);
    return f;
  }

  function bind(control, get, set) {
    control.value = get() || "";
    control.addEventListener("input", function () {
      set(control.value);
      save();
    });
    return control;
  }

  /* ------------------------------------------------- tradução da estrutura */
  /* O técnico não vê "evidence_level A" nem "applicability: indirect". Vê o que
     essas categorias querem dizer sobre a confiança que ele pode ter na frase. */

  const FORCA = {
    A: { n: 4, txt: "Vários estudos independentes apontam na mesma direção." },
    B: { n: 3, txt: "Há estudos sólidos, mas com variação entre eles." },
    C: { n: 2, txt: "Ainda é indício: pouco estudo, ou estudo indireto." },
    D: { n: 1, txt: "É prática comum, sem confirmação científica." },
  };

  const CONFIANCA = {
    high: "O resultado é consistente.",
    moderate: "O resultado varia conforme o estudo.",
    low: "A incerteza ainda é grande.",
    insufficient: "Não há base suficiente para concluir.",
  };

  const APLICACAO = {
    partial: "Parte dos dados vem de contextos diferentes do corredor recreacional.",
    indirect: "Vem de estudos feitos em outro contexto e foi transposto para a corrida.",
  };

  function strengthBox(r) {
    const f = FORCA[r.evidence_level] || FORCA.C;
    let bars = "";
    for (let i = 1; i <= 4; i++) bars += '<i class="' + (i <= f.n ? "on" : "") + '"></i>';
    const partes = [f.txt, CONFIANCA[r.confidence] || ""];
    if (APLICACAO[r.applicability]) partes.push(APLICACAO[r.applicability]);
    return el(
      '<div class="strength"><span class="sbars" aria-hidden="true">' +
        bars +
        "</span><span>" +
        esc(partes.filter(Boolean).join(" ")) +
        "</span></div>"
    );
  }

  function studiesBox(r) {
    const kb = KB[r._kb];
    const items = (r.source_ids || [])
      .map(function (sid) {
        const s = kb.sources.filter(function (x) {
          return x.id === sid;
        })[0];
        if (!s) return "";
        return (
          "<li><strong>" +
          esc(s.title) +
          "</strong><br>" +
          esc(s.year) +
          (s.institution_note ? " · " + esc(s.institution_note) : "") +
          ' · <a href="' +
          esc(s.url) +
          '" target="_blank" rel="noreferrer noopener">abrir o estudo</a></li>'
        );
      })
      .filter(Boolean)
      .join("");
    if (!items) return null;
    const n = (r.source_ids || []).length;
    return el(
      '<details class="studies"><summary>Ver ' +
        (n === 1 ? "o estudo que sustenta isso" : "os " + n + " estudos que sustentam isso") +
        '</summary><ul class="studylist">' +
        items +
        "</ul></details>"
    );
  }

  /* -------------------------------------------------------------- percurso */

  const STEPS = [
    { id: "inicio", label: "Comece aqui" },
    { id: "voce", label: "Quem é você" },
    { id: "corrida", label: "Corrida" },
    { id: "musculacao", label: "Musculação" },
    { id: "regras", label: "Regras do app" },
    { id: "perguntas", label: "Perguntas de aluno" },
    { id: "fechamento", label: "O que falta" },
    { id: "entrega", label: "Entregar" },
  ];

  function claimsOf(kbKey) {
    return allClaims.filter(function (r) {
      return r._kb === kbKey;
    });
  }

  function answered(map, id) {
    return Boolean(map[id] && map[id].ans);
  }

  function claimComplete(r) {
    const a = state.claims[r.id];
    if (!a || !a.ans) return false;
    if (a.ans === "concordo" || a.ans === "fora") return true;
    return Boolean((a.texto || "").trim());
  }

  function questionComplete(g) {
    const a = state.questions[g.id];
    if (!a || !a.ans) return false;
    if (a.ans === "certo" || a.ans === "fora") return true;
    return Boolean((a.texto || "").trim());
  }

  function docComplete(d) {
    const a = state.docs[d.key];
    if (!a || !a.ans) return false;
    if (a.ans === "ok" || a.ans === "fora") return true;
    return Boolean((a.texto || "").trim());
  }

  function progress() {
    const req = ["nome", "formacao", "registro"];
    return {
      inicio: { done: state.acknowledged ? 1 : 0, total: 1 },
      voce: {
        done:
          req.filter(function (k) {
            return (state.reviewer[k] || "").trim();
          }).length + (state.reviewer.conflito ? 1 : 0),
        total: req.length + 1,
      },
      corrida: { done: claimsOf("RUN").filter(claimComplete).length, total: claimsOf("RUN").length },
      musculacao: { done: claimsOf("MUSC").filter(claimComplete).length, total: claimsOf("MUSC").length },
      regras: { done: docs.filter(docComplete).length, total: docs.length },
      perguntas: { done: allQuestions.filter(questionComplete).length, total: allQuestions.length },
      fechamento: {
        done: (state.parecer.apto ? 1 : 0) + ((state.parecer.texto || "").trim() ? 1 : 0),
        total: 2,
      },
      entrega: { done: 0, total: 0 },
    };
  }

  let current = "inicio";

  function renderTrail() {
    const p = progress();
    const trail = document.getElementById("trail");
    trail.innerHTML = "";
    STEPS.forEach(function (s, i) {
      const st = p[s.id];
      const done = st.total > 0 && st.done >= st.total;
      const li = el("<li></li>");
      const b = el(
        '<button class="tstep' +
          (done ? " tstep-done" : "") +
          '" aria-current="' +
          (current === s.id) +
          '"><span class="tnum" aria-hidden="true">' +
          (done ? "✓" : i + 1) +
          "</span>" +
          esc(s.label) +
          (st.total > 0 ? " <span class=\"qcount\">" + st.done + "/" + st.total + "</span>" : "") +
          "</button>"
      );
      b.addEventListener("click", function () {
        go(s.id);
      });
      li.appendChild(b);
      trail.appendChild(li);
    });
  }

  function go(id) {
    current = id;
    STEPS.forEach(function (s) {
      const pg = document.getElementById("pg-" + s.id);
      if (pg) pg.hidden = s.id !== id;
    });
    renderTrail();
    if (id === "corrida") renderQueue("RUN");
    if (id === "musculacao") renderQueue("MUSC");
    if (id === "perguntas") renderQuestionQueue();
    if (id === "entrega") renderEntrega();
    window.scrollTo({ top: 0, behavior: "instant" });
    // Só nas filas: lá o foco no primeiro botão faz os atalhos de teclado
    // funcionarem de imediato. Nas outras páginas roubaria o foco à toa.
    if (id === "corrida" || id === "musculacao" || id === "perguntas") {
      const first = document.getElementById("pg-" + id).querySelector(".ans");
      if (first) first.focus({ preventScroll: true });
    }
  }

  function nextBar(target, label, secondary) {
    const row = el('<div class="rowend"></div>');
    row.appendChild(el('<span class="kbdhint">' + esc(secondary || "") + "</span>"));
    const b = el('<button class="btn btn-primary">' + esc(label) + "</button>");
    b.addEventListener("click", function () {
      go(target);
    });
    row.appendChild(b);
    return row;
  }

  /* ------------------------------------------------------------ 1. início */

  function renderInicio() {
    const pg = document.getElementById("pg-inicio");
    const nRun = claimsOf("RUN").length;
    const nMusc = claimsOf("MUSC").length;

    pg.appendChild(el('<span class="eyebrow">Start Running</span>'));
    pg.appendChild(el('<h1 class="h-title">Você vai revisar o que o app diz para os corredores</h1>'));
    pg.appendChild(
      el(
        '<p class="h-lede">O Start Running tem um treinador dentro do app que responde dúvidas de quem treina. Ele não inventa resposta: só pode falar o que está escrito em uma lista de afirmações que alguém precisa conferir. Essa pessoa é você.</p>'
      )
    );

    pg.appendChild(
      el(
        '<div class="prose">' +
          "<h3>Como funciona</h3>" +
          "<p>Você vai ver uma afirmação por vez, escrita em português comum. Do tipo: <em>a maior parte do treino deve ser em baixa intensidade</em>. Para cada uma, a pergunta é simples: <strong>você diria isso a um aluno?</strong></p>" +
          "<p>Se concordar, é um clique e passa para a próxima. Só quando você discorda ou ajustaria alguma coisa é que precisa escrever, e aí basta explicar com suas palavras, do jeito que você explicaria para outro treinador.</p>" +
          "<h3>O que tem pela frente</h3>" +
          "<ul>" +
          "<li><strong>" +
          nRun +
          " afirmações sobre corrida.</strong> É o núcleo do trabalho.</li>" +
          "<li><strong>" +
          nMusc +
          " afirmações sobre musculação.</strong> Se não for sua área, você marca isso e segue.</li>" +
          "<li><strong>As regras do app.</strong> Quando ele deve mandar procurar médico ou fisioterapeuta, e como ele fala com o aluno.</li>" +
          "<li><strong>Perguntas de aluno.</strong> Casos usados para testar se o treinador do app está respondendo direito.</li>" +
          "</ul>" +
          "<p>Some algo entre duas e quatro horas. Não precisa fazer de uma vez: o que você responder fica guardado e você continua depois, no mesmo computador e navegador. Para trocar de máquina, ou por segurança no fim de cada sessão, use <strong>Guardar em arquivo</strong> na barra de cima, e depois <strong>Retomar de um arquivo</strong> para voltar de onde parou.</p>" +
          "<h3>Onde sua opinião pesa mais</h3>" +
          "<p>Existe uma resposta chamada <strong>isso me preocupa</strong>. Use sempre que uma afirmação puder levar alguém a se machucar, a treinar doente, a ignorar um sintoma ou a fazer algo que você não deixaria um aluno seu fazer. É a informação mais valiosa que você pode dar aqui, mais até do que corrigir uma imprecisão técnica.</p>" +
          "<h3>Quando não for sua área</h3>" +
          "<p>Toda pergunta tem a saída <strong>fora da minha área</strong>. Use sem constrangimento. Um palpite seu vira conteúdo que o app vai repetir para milhares de pessoas; um <em>não sei</em> faz a gente procurar quem sabe. Não existe penalidade por marcar isso.</p>" +
          "<h3>O que não é pedido de você</h3>" +
          "<p>Você não precisa entender nada de programação, de banco de dados ou de como o app guarda esse conteúdo. Também não precisa conferir licença de artigo nem formatar nada. Isso é problema nosso.</p>" +
          "</div>"
      )
    );

    pg.appendChild(
      el(
        '<div class="note"><span class="note-mark">Antes</span><div>Este material organiza evidência de população e serve para orientar treino de adultos saudáveis. Ele não diagnostica, não libera retorno depois de lesão e não substitui médico, fisioterapeuta ou nutricionista. Se alguma afirmação empurra o app para além desse limite, é exatamente isso que precisamos saber.</div></div>'
      )
    );

    const ack = el(
      '<label class="note" style="cursor:pointer;align-items:flex-start">' +
        '<input type="checkbox" id="ack" style="width:19px;height:19px;margin-top:3px;flex:none;accent-color:var(--accent)">' +
        "<span>Entendi como funciona e vou marcar <strong>fora da minha área</strong> sempre que não for minha competência, em vez de arriscar um palpite.</span></label>"
    );
    const cb = ack.querySelector("input");
    cb.checked = Boolean(state.acknowledged);
    cb.addEventListener("change", function () {
      state.acknowledged = cb.checked;
      save();
    });
    pg.appendChild(ack);

    pg.appendChild(nextBar("voce", "Começar", "Leva um minuto"));
  }

  /* -------------------------------------------------------------- 2. você */

  function renderVoce() {
    const pg = document.getElementById("pg-voce");
    pg.appendChild(el('<span class="eyebrow">Etapa 2</span>'));
    pg.appendChild(el('<h1 class="h-title">Quem está assinando esta revisão</h1>'));
    pg.appendChild(
      el(
        '<p class="h-lede">Fica registrado junto com o conteúdo. Quem for consultar isso daqui a um ano precisa saber quem conferiu e com que formação.</p>'
      )
    );

    const g = el('<div class="grid2"></div>');
    function rv(key, label, hint, control) {
      bind(
        control,
        function () {
          return state.reviewer[key];
        },
        function (v) {
          state.reviewer[key] = v;
        }
      );
      return field(label, hint, control);
    }
    g.appendChild(rv("nome", "Seu nome", null, textinput("Nome completo")));
    g.appendChild(rv("formacao", "Formação", "A que melhor descreve você", textinput("Ex.: Educação Física, especialização em fisiologia")));
    g.appendChild(rv("registro", "Registro no conselho", null, textinput("Ex.: CREF 000000-G/SP")));
    g.appendChild(rv("experiencia", "Tempo treinando corredores", "Opcional", textinput("Ex.: 12 anos")));
    g.appendChild(rv("email", "E-mail", "Para a gente voltar com dúvidas", textinput("seu@email.com")));
    pg.appendChild(g);

    pg.appendChild(
      el(
        '<div class="field" style="margin-top:6px"><label>Você tem algum vínculo comercial que a gente deva saber?</label><span class="f-hint">Patrocínio de marca de tênis ou suplemento, sociedade em academia, aplicativo concorrente, ou autoria de algum estudo usado aqui. Ter vínculo não impede nada: só precisa estar registrado.</span></div>'
      )
    );

    const mini = el('<div class="mini"></div>');
    const detWrap = el('<div class="followup" hidden></div>');
    [
      ["nenhum", "Não tenho", "ok"],
      ["declarado", "Tenho, vou descrever", "warn"],
    ].forEach(function (o) {
      const b = el('<button data-tone="' + o[2] + '">' + esc(o[1]) + "</button>");
      b.setAttribute("aria-pressed", String(state.reviewer.conflito === o[0]));
      b.addEventListener("click", function () {
        state.reviewer.conflito = o[0];
        mini.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", "false");
        });
        b.setAttribute("aria-pressed", "true");
        detWrap.hidden = o[0] !== "declarado";
        save();
      });
      mini.appendChild(b);
    });
    pg.appendChild(mini);

    const det = textarea("Qual vínculo, com quem e desde quando.", 3);
    bind(
      det,
      function () {
        return state.reviewer.conflito_detalhe;
      },
      function (v) {
        state.reviewer.conflito_detalhe = v;
      }
    );
    detWrap.appendChild(el('<span class="f-label">Descreva o vínculo</span>'));
    detWrap.appendChild(det);
    detWrap.hidden = state.reviewer.conflito !== "declarado";
    pg.appendChild(detWrap);

    pg.appendChild(nextBar("corrida", "Ir para as afirmações de corrida", ""));
  }

  /* ------------------------------------------------------- 3 e 4. as fichas */

  const RESPOSTAS = [
    ["concordo", "Concordo", "É o que eu diria a um aluno.", "ok", true],
    ["ajustaria", "Concordo, mas ajustaria", "A ideia está certa, a forma de dizer não.", "warn", false],
    ["discordo", "Discordo", "Isso não está correto.", "bad", false],
    ["perigoso", "Isso me preocupa", "Pode levar alguém a se machucar.", "bad", false],
    ["fora", "Fora da minha área", "Não é onde eu tenho competência.", "skip", true],
  ];

  const queue = { RUN: 0, MUSC: 0 };

  function renderQueueShell(kbKey, pageId, titulo, lede) {
    const pg = document.getElementById(pageId);
    pg.innerHTML = "";
    pg.appendChild(el('<span class="eyebrow">' + esc(KB[kbKey].label) + "</span>"));
    pg.appendChild(el('<h1 class="h-title">' + esc(titulo) + "</h1>"));
    pg.appendChild(el('<p class="h-lede">' + esc(lede) + "</p>"));

    if (kbKey === "MUSC") {
      const box = el(
        '<div class="note"><span class="note-mark">Atalho</span><div><p>Se musculação não é a sua área, não precisa passar ficha por ficha.</p></div></div>'
      );
      const b = el('<button class="btn btn-sm" style="margin-top:10px">Marcar as ' + claimsOf("MUSC").length + " como fora da minha área</button>");
      b.addEventListener("click", function () {
        claimsOf("MUSC").forEach(function (r) {
          if (!state.claims[r.id] || !state.claims[r.id].ans) state.claims[r.id] = { ans: "fora" };
        });
        save();
        renderQueue("MUSC");
      });
      box.querySelector("div").appendChild(b);
      pg.appendChild(box);
    }

    pg.appendChild(el('<div class="qhead"><span class="qcount" id="qc-' + kbKey + '"></span><span class="qbar"><i id="qb-' + kbKey + '"></i></span></div>'));
    pg.appendChild(el('<div id="qslot-' + kbKey + '"></div>'));
    pg.appendChild(el('<div id="qfoot-' + kbKey + '"></div>'));
  }

  function renderQueue(kbKey) {
    const rows = claimsOf(kbKey);
    const slot = document.getElementById("qslot-" + kbKey);
    const foot = document.getElementById("qfoot-" + kbKey);
    if (!slot) return;

    if (queue[kbKey] >= rows.length) queue[kbKey] = rows.length - 1;
    if (queue[kbKey] < 0) queue[kbKey] = 0;

    const done = rows.filter(claimComplete).length;
    document.getElementById("qc-" + kbKey).textContent = "Ficha " + (queue[kbKey] + 1) + " de " + rows.length + " · " + done + " respondidas";
    document.getElementById("qb-" + kbKey).style.width = Math.round((done / rows.length) * 100) + "%";

    slot.innerHTML = "";
    slot.appendChild(claimCard(rows[queue[kbKey]], kbKey, rows.length));

    foot.innerHTML = "";
    if (done >= rows.length) {
      const next = kbKey === "RUN" ? "musculacao" : "regras";
      const label = kbKey === "RUN" ? "Ir para musculação" : "Ir para as regras do app";
      foot.appendChild(
        el('<div class="note note-ok" style="margin-top:18px"><span class="note-mark">Pronto</span><div>Você respondeu todas as ' + rows.length + " fichas desta parte.</div></div>")
      );
      foot.appendChild(nextBar(next, label, ""));
    }
  }

  function claimCard(r, kbKey, total) {
    const a = state.claims[r.id] || (state.claims[r.id] = {});
    const card = el('<div class="qcard"></div>');

    card.appendChild(el('<div class="claim">' + esc(r.claim) + "</div>"));

    if (r.practical_application) {
      card.appendChild(
        el('<div class="qblock"><span class="qlabel">Como o app usa isso</span><span class="qtext">' + esc(r.practical_application) + "</span></div>")
      );
    }

    if ((r.limitations || []).length) {
      card.appendChild(
        el(
          '<div class="qblock"><span class="qlabel">Ressalvas que o app precisa dizer junto</span><span class="qtext"><ul>' +
            r.limitations
              .map(function (l) {
                return "<li>" + esc(l) + "</li>";
              })
              .join("") +
            "</ul></span></div>"
        )
      );
    }

    card.appendChild(strengthBox(r));
    const st = studiesBox(r);
    if (st) card.appendChild(st);

    card.appendChild(el('<div class="ask">Você diria isso a um aluno?</div>'));

    const answers = el('<div class="answers"></div>');
    const follow = el('<div class="followup" hidden></div>');

    RESPOSTAS.forEach(function (o, i) {
      const b = el(
        '<button class="ans" data-tone="' +
          o[3] +
          '" data-ans="' +
          o[0] +
          '"><span class="ans-key" aria-hidden="true">' +
          (i + 1) +
          '</span><span class="ans-body"><span class="ans-t">' +
          esc(o[1]) +
          '</span><span class="ans-s">' +
          esc(o[2]) +
          "</span></span></button>"
      );
      b.setAttribute("aria-pressed", String(a.ans === o[0]));
      b.addEventListener("click", function () {
        pick(o[0], o[4]);
      });
      answers.appendChild(b);
    });
    card.appendChild(answers);

    const ta = textarea("", 4);
    ta.value = a.texto || "";
    ta.addEventListener("input", function () {
      a.texto = ta.value;
      save();
      refreshCounter(kbKey);
    });
    const fl = el('<span class="f-label"></span>');
    const fh = el('<span class="f-hint"></span>');
    follow.appendChild(fl);
    follow.appendChild(fh);
    follow.appendChild(ta);
    card.appendChild(follow);

    const nav = el('<div class="rowend"></div>');
    const left = el('<div style="display:flex;gap:8px"></div>');
    const prev = el('<button class="btn btn-ghost">Anterior</button>');
    prev.disabled = queue[kbKey] === 0;
    prev.addEventListener("click", function () {
      queue[kbKey]--;
      renderQueue(kbKey);
    });
    const next = el('<button class="btn">Próxima</button>');
    next.disabled = queue[kbKey] >= total - 1;
    next.addEventListener("click", function () {
      queue[kbKey]++;
      renderQueue(kbKey);
    });
    left.appendChild(prev);
    left.appendChild(next);
    nav.appendChild(left);

    const jump = el('<button class="btn btn-ghost btn-sm">Ir para a próxima sem resposta</button>');
    jump.addEventListener("click", function () {
      const rows = claimsOf(kbKey);
      for (let i = 0; i < rows.length; i++) {
        const k = (queue[kbKey] + 1 + i) % rows.length;
        if (!claimComplete(rows[k])) {
          queue[kbKey] = k;
          renderQueue(kbKey);
          return;
        }
      }
    });
    nav.appendChild(jump);
    card.appendChild(nav);
    card.appendChild(el('<span class="kbdhint">Atalhos: <kbd>1</kbd> a <kbd>5</kbd> para responder, <kbd>←</kbd> e <kbd>→</kbd> para navegar.</span>'));

    const TEXTOS = {
      ajustaria: ["Como você escreveria?", "Escreva do seu jeito. A gente cuida da forma final."],
      discordo: ["O que está errado?", "Se souber de estudo ou diretriz que sustenta o contrário, cite. Se for da sua experiência de quadra, diga isso também: também conta."],
      perigoso: ["O que pode dar errado, e com quem?", "Descreva a situação e o tipo de aluno em risco. Se o app deveria mandar procurar um profissional nesse caso, diga."],
    };

    function paint() {
      answers.querySelectorAll(".ans").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.ans === a.ans));
      });
      const t = TEXTOS[a.ans];
      follow.hidden = !t;
      if (t) {
        fl.textContent = t[0];
        fh.textContent = t[1];
      }
    }

    function pick(val, avanca) {
      a.ans = val;
      save();
      paint();
      refreshCounter(kbKey);
      if (avanca && queue[kbKey] < total - 1) {
        setTimeout(function () {
          queue[kbKey]++;
          renderQueue(kbKey);
        }, 160);
      } else if (avanca) {
        renderQueue(kbKey);
      } else {
        ta.focus();
      }
    }

    card._pick = function (i) {
      const o = RESPOSTAS[i];
      if (o) pick(o[0], o[4]);
    };

    paint();
    return card;
  }

  function refreshCounter(kbKey) {
    const rows = claimsOf(kbKey);
    const done = rows.filter(claimComplete).length;
    const c = document.getElementById("qc-" + kbKey);
    if (c) c.textContent = "Ficha " + (queue[kbKey] + 1) + " de " + rows.length + " · " + done + " respondidas";
    const b = document.getElementById("qb-" + kbKey);
    if (b) b.style.width = Math.round((done / rows.length) * 100) + "%";
  }

  /* ------------------------------------------------------------ 5. regras */

  function renderRegras() {
    const pg = document.getElementById("pg-regras");
    pg.appendChild(el('<span class="eyebrow">Etapa 5</span>'));
    pg.appendChild(el('<h1 class="h-title">As regras que o app segue em toda resposta</h1>'));
    pg.appendChild(
      el(
        '<p class="h-lede">As afirmações dizem o que o app pode falar. Estes textos dizem como ele fala e quando ele para de falar e manda procurar um profissional. Valem para toda pergunta, então um erro aqui aparece em todas as respostas.</p>'
      )
    );

    const grupos = {};
    docs.forEach(function (d) {
      if (!grupos[d.grupo]) grupos[d.grupo] = [];
      grupos[d.grupo].push(d);
    });

    Object.keys(grupos).forEach(function (nome) {
      pg.appendChild(el('<h3 style="font-size:19px;margin-top:12px">' + esc(nome) + "</h3>"));
      const stack = el('<div class="stack"></div>');
      grupos[nome].forEach(function (d) {
        stack.appendChild(docCard(d));
      });
      pg.appendChild(stack);
    });

    pg.appendChild(nextBar("perguntas", "Ir para as perguntas de aluno", ""));
  }

  // Converte o markdown simples dos documentos em leitura, sem expor sintaxe.
  function readable(md) {
    const box = el('<div class="readbox"></div>');
    let ul = null;
    lines(md).forEach(function (raw) {
      const line = raw.replace(/`/g, "").replace(/\*\*/g, "");
      if (/^#{1,6}\s/.test(line)) {
        ul = null;
        box.appendChild(el("<h4>" + esc(line.replace(/^#{1,6}\s*/, "")) + "</h4>"));
      } else if (/^[-*]\s/.test(line)) {
        if (!ul) {
          ul = el("<ul></ul>");
          box.appendChild(ul);
        }
        ul.appendChild(el("<li>" + esc(line.replace(/^[-*]\s*/, "")) + "</li>"));
      } else if (/^\|/.test(line) || /^-{3,}$/.test(line)) {
        ul = null;
      } else {
        ul = null;
        box.appendChild(el("<p>" + esc(line) + "</p>"));
      }
    });
    return box;
  }

  function docCard(d) {
    const a = state.docs[d.key] || (state.docs[d.key] = {});
    const card = el('<div class="rowcard"></div>');
    card.dataset.done = String(docComplete(d));
    card.appendChild(el("<h3>" + esc(d.titulo) + "</h3>"));
    card.appendChild(readable(d.body));

    const mini = el('<div class="mini"></div>');
    const follow = el('<div class="followup" hidden></div>');
    const opts = [
      ["ok", "Está certo assim", "ok"],
      ["falta", "Falta alguma coisa", "warn"],
      ["errado", "Tem coisa errada aqui", "warn"],
      ["fora", "Fora da minha área", "skip"],
    ];
    opts.forEach(function (o) {
      const b = el('<button data-tone="' + o[2] + '" data-ans="' + o[0] + '">' + esc(o[1]) + "</button>");
      b.setAttribute("aria-pressed", String(a.ans === o[0]));
      b.addEventListener("click", function () {
        a.ans = o[0];
        mini.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x.dataset.ans === a.ans));
        });
        follow.hidden = o[0] === "ok" || o[0] === "fora";
        card.dataset.done = String(docComplete(d));
        save();
        if (!follow.hidden) ta.focus();
      });
      mini.appendChild(b);
    });
    card.appendChild(mini);

    const ta = textarea(
      d.peso === 1
        ? "Que situação o app deveria tratar e não trata? Que sintoma ou condição deveria fazer ele parar e mandar procurar um profissional?"
        : "O que precisa mudar e por quê.",
      3
    );
    ta.value = a.texto || "";
    ta.addEventListener("input", function () {
      a.texto = ta.value;
      card.dataset.done = String(docComplete(d));
      save();
    });
    follow.appendChild(el('<span class="f-label">Conte o que precisa mudar</span>'));
    follow.appendChild(ta);
    follow.hidden = !a.ans || a.ans === "ok" || a.ans === "fora";
    card.appendChild(follow);

    return card;
  }

  /* --------------------------------------------------------- 6. perguntas */

  let qIdx = 0;

  function renderPerguntasShell() {
    const pg = document.getElementById("pg-perguntas");
    pg.appendChild(el('<span class="eyebrow">Etapa 6</span>'));
    pg.appendChild(el('<h1 class="h-title">Perguntas que o app precisa acertar</h1>'));
    pg.appendChild(
      el(
        '<p class="h-lede">Toda vez que mudamos alguma coisa no app, rodamos estas perguntas para conferir se o treinador continua respondendo direito. Cada uma tem o que a resposta precisa conter e, principalmente, o que ela nunca pode dizer.</p>'
      )
    );
    pg.appendChild(el('<div class="qhead"><span class="qcount" id="qc-Q"></span><span class="qbar"><i id="qb-Q"></i></span></div>'));
    pg.appendChild(el('<div id="qslot-Q"></div>'));
    pg.appendChild(el('<h3 style="font-size:19px;margin-top:22px">Pergunta que você acha que ele erraria</h3>'));
    pg.appendChild(
      el(
        '<p class="prose">Esta é a parte mais útil desta etapa. Pense na dúvida que seus alunos trazem e que costuma receber resposta ruim na internet. Se você tem uma, escreva.</p>'
      )
    );
    pg.appendChild(el('<div class="stack" id="newq"></div>'));
    const add = el('<button class="btn">Escrever uma pergunta</button>');
    add.addEventListener("click", function () {
      state.newQuestions.push({ uid: "q" + Date.now() });
      save();
      renderNewQuestions();
    });
    pg.appendChild(add);
    pg.appendChild(nextBar("fechamento", "Ir para o fechamento", ""));
    renderNewQuestions();
  }

  // Espelha refreshCounter das fichas: uma resposta "falta" ou "errado" só conta
  // como respondida depois que o texto é escrito, então o contador precisa
  // reagir à digitação, não só à navegação entre perguntas.
  function refreshQCounter() {
    const done = allQuestions.filter(questionComplete).length;
    const c = document.getElementById("qc-Q");
    if (c) c.textContent = "Pergunta " + (qIdx + 1) + " de " + allQuestions.length + " · " + done + " respondidas";
    const b = document.getElementById("qb-Q");
    if (b) b.style.width = Math.round((done / allQuestions.length) * 100) + "%";
  }

  function renderQuestionQueue() {
    const slot = document.getElementById("qslot-Q");
    if (!slot) return;
    if (qIdx >= allQuestions.length) qIdx = allQuestions.length - 1;
    if (qIdx < 0) qIdx = 0;

    refreshQCounter();

    slot.innerHTML = "";
    slot.appendChild(questionCard(allQuestions[qIdx]));
    // As perguntas que o revisor escreve não são redesenhadas aqui de propósito:
    // ele pode estar digitando numa delas quando responde uma ficha acima, e
    // refazer a lista apagaria o cursor de dentro do campo.
  }

  function questionCard(g) {
    const a = state.questions[g.id] || (state.questions[g.id] = {});
    const card = el('<div class="qcard"></div>');

    card.appendChild(el('<div class="qblock"><span class="qlabel">Um aluno pergunta</span></div>'));
    card.appendChild(el('<div class="claim">' + esc(g.query) + "</div>"));

    if ((g.must_include || []).length) {
      card.appendChild(
        el(
          '<div class="qblock"><span class="qlabel">A resposta precisa conter</span><span class="qtext"><ul>' +
            g.must_include
              .map(function (x) {
                return "<li>" + esc(x) + "</li>";
              })
              .join("") +
            "</ul></span></div>"
        )
      );
    }
    if ((g.must_not_include || []).length) {
      card.appendChild(
        el(
          '<div class="qblock"><span class="qlabel">E nunca pode dizer</span><span class="qtext"><ul>' +
            g.must_not_include
              .map(function (x) {
                return "<li>" + esc(x) + "</li>";
              })
              .join("") +
            "</ul></span></div>"
        )
      );
    }

    card.appendChild(el('<div class="ask">Essa é a resposta certa para essa pergunta?</div>'));

    const opts = [
      ["certo", "Está certo", "Responderia assim.", "ok", true],
      ["falta", "Falta alguma coisa", "Está certo, mas incompleto.", "warn", false],
      ["errado", "Está errado", "Não é isso que eu responderia.", "bad", false],
      ["fora", "Fora da minha área", "", "skip", true],
    ];

    const answers = el('<div class="answers"></div>');
    const follow = el('<div class="followup" hidden></div>');

    opts.forEach(function (o, i) {
      const b = el(
        '<button class="ans" data-tone="' +
          o[3] +
          '" data-ans="' +
          o[0] +
          '"><span class="ans-key" aria-hidden="true">' +
          (i + 1) +
          '</span><span class="ans-body"><span class="ans-t">' +
          esc(o[1]) +
          "</span>" +
          (o[2] ? '<span class="ans-s">' + esc(o[2]) + "</span>" : "") +
          "</span></button>"
      );
      b.setAttribute("aria-pressed", String(a.ans === o[0]));
      b.addEventListener("click", function () {
        pick(o[0], o[4]);
      });
      answers.appendChild(b);
    });
    card.appendChild(answers);

    const ta = textarea("O que a resposta deveria conter, ou o que ela nunca pode dizer.", 3);
    ta.value = a.texto || "";
    ta.addEventListener("input", function () {
      a.texto = ta.value;
      save();
      refreshQCounter();
    });
    follow.appendChild(el('<span class="f-label">O que ajustar</span>'));
    follow.appendChild(ta);
    card.appendChild(follow);

    const nav = el('<div class="rowend"></div>');
    const left = el('<div style="display:flex;gap:8px"></div>');
    const prev = el('<button class="btn btn-ghost">Anterior</button>');
    prev.disabled = qIdx === 0;
    prev.addEventListener("click", function () {
      qIdx--;
      renderQuestionQueue();
    });
    const next = el('<button class="btn">Próxima</button>');
    next.disabled = qIdx >= allQuestions.length - 1;
    next.addEventListener("click", function () {
      qIdx++;
      renderQuestionQueue();
    });
    left.appendChild(prev);
    left.appendChild(next);
    nav.appendChild(left);
    nav.appendChild(el('<span class="kbdhint">Atalhos: <kbd>1</kbd> a <kbd>4</kbd>, <kbd>←</kbd> e <kbd>→</kbd>.</span>'));
    card.appendChild(nav);

    function paint() {
      answers.querySelectorAll(".ans").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.ans === a.ans));
      });
      follow.hidden = !(a.ans === "falta" || a.ans === "errado");
    }

    function pick(val, avanca) {
      a.ans = val;
      save();
      paint();
      if (avanca && qIdx < allQuestions.length - 1) {
        setTimeout(function () {
          qIdx++;
          renderQuestionQueue();
        }, 160);
      } else if (avanca) {
        renderQuestionQueue();
      } else {
        ta.focus();
      }
    }

    card._pick = function (i) {
      const o = opts[i];
      if (o) pick(o[0], o[4]);
    };

    paint();
    return card;
  }

  function renderNewQuestions() {
    const host = document.getElementById("newq");
    if (!host) return;
    host.innerHTML = "";
    if (!state.newQuestions.length) {
      host.appendChild(el('<div class="empty">Nenhuma pergunta escrita ainda.</div>'));
      return;
    }
    state.newQuestions.forEach(function (rec, idx) {
      const card = el('<div class="rowcard"></div>');
      const head = el('<div class="rowend"></div>');
      head.appendChild(el("<h3>" + esc(rec.pergunta || "Pergunta nova") + "</h3>"));
      const del = el('<button class="btn btn-ghost btn-sm">Apagar</button>');
      del.addEventListener("click", function () {
        state.newQuestions.splice(idx, 1);
        save();
        renderNewQuestions();
      });
      head.appendChild(del);
      card.appendChild(head);

      function b(key, control, onInput) {
        control.value = rec[key] || "";
        control.addEventListener("input", function () {
          rec[key] = control.value;
          save();
          if (onInput) onInput(control.value);
        });
        return control;
      }

      card.appendChild(
        field(
          "A pergunta",
          "Do jeito que um aluno escreveria.",
          b("pergunta", textinput("Ex.: posso correr com dor no joelho se passar depois de aquecer?"), function (v) {
            head.querySelector("h3").textContent = v || "Pergunta nova";
          })
        )
      );
      card.appendChild(field("O que uma boa resposta precisa dizer", null, b("deve", textarea("", 3))));
      card.appendChild(field("O que ela nunca pode dizer", "É a trava de segurança.", b("naopode", textarea("", 3))));
      host.appendChild(card);
    });
  }

  /* ------------------------------------------------------- 7. fechamento */

  function renderFechamento() {
    const pg = document.getElementById("pg-fechamento");
    pg.appendChild(el('<span class="eyebrow">Etapa 7</span>'));
    pg.appendChild(el('<h1 class="h-title">O que está faltando</h1>'));
    pg.appendChild(
      el(
        '<p class="h-lede">Até aqui você reagiu ao que já existe. Agora o contrário: o que um corredor pergunta e este conteúdo não responde?</p>'
      )
    );

    const c1 = el('<div class="rowcard"></div>');
    const t1 = textarea("Um assunto por linha. Ex.: nada sobre correr no calor; nada sobre volta ao treino depois de virose; nada sobre corredor acima de 60 anos.", 5);
    bind(
      t1,
      function () {
        return state.faltas.RUN;
      },
      function (v) {
        state.faltas.RUN = v;
      }
    );
    c1.appendChild(field("Falta em corrida", "Uma coisa por linha, em ordem de importância.", t1));
    pg.appendChild(c1);

    const c2 = el('<div class="rowcard"></div>');
    const t2 = textarea("Se não for sua área, deixe em branco.", 4);
    bind(
      t2,
      function () {
        return state.faltas.MUSC;
      },
      function (v) {
        state.faltas.MUSC = v;
      }
    );
    c2.appendChild(field("Falta em musculação", "Opcional.", t2));
    pg.appendChild(c2);

    const c3 = el('<div class="rowcard"></div>');
    const t3 = textarea("Ex.: aquele estudo de 2008 sobre economia de corrida está bem defasado.", 3);
    bind(
      t3,
      function () {
        return state.fontes_obs;
      },
      function (v) {
        state.fontes_obs = v;
      }
    );
    c3.appendChild(
      field(
        "Algum estudo citado te pareceu velho ou fraco?",
        "Opcional. Você viu os estudos ao abrir as fichas. Se algum te incomodou, diga qual.",
        t3
      )
    );
    pg.appendChild(c3);

    const c4 = el('<div class="rowcard"></div>');
    c4.appendChild(
      el(
        '<div class="field"><label>Do jeito que está hoje, você deixaria este conteúdo respondendo para os seus alunos?</label></div>'
      )
    );
    const mini = el('<div class="mini"></div>');
    [
      ["sim", "Deixaria", "ok"],
      ["ressalva", "Deixaria, depois dos ajustes que apontei", "warn"],
      ["nao", "Não deixaria", "warn"],
    ].forEach(function (o) {
      const b = el('<button data-tone="' + o[2] + '" data-ans="' + o[0] + '">' + esc(o[1]) + "</button>");
      b.setAttribute("aria-pressed", String(state.parecer.apto === o[0]));
      b.addEventListener("click", function () {
        state.parecer.apto = o[0];
        mini.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x.dataset.ans === o[0]));
        });
        save();
      });
      mini.appendChild(b);
    });
    c4.appendChild(mini);

    const t4 = textarea("O que estava bem, o que você mudaria primeiro, e o que ainda te deixa em dúvida.", 6);
    bind(
      t4,
      function () {
        return state.parecer.texto;
      },
      function (v) {
        state.parecer.texto = v;
      }
    );
    c4.appendChild(field("Seu parecer, em texto livre", "Escreva como se estivesse explicando para outro treinador.", t4));
    pg.appendChild(c4);

    pg.appendChild(nextBar("entrega", "Terminar e enviar", ""));
  }

  /* ---------------------------------------------------------- 8. entrega */

  function contagem() {
    const c = { concordo: 0, ajustaria: 0, discordo: 0, perigoso: 0, fora: 0, sem: 0 };
    allClaims.forEach(function (r) {
      const a = state.claims[r.id];
      if (a && a.ans) c[a.ans]++;
      else c.sem++;
    });
    return c;
  }

  function relatorio() {
    const rv = state.reviewer;
    const c = contagem();
    const L = [];

    L.push("# Revisão técnica do conteúdo do Start Running");
    L.push("");
    L.push("Revisor: " + (rv.nome || "não informado"));
    L.push("Formação: " + (rv.formacao || "não informada"));
    L.push("Registro: " + (rv.registro || "não informado"));
    if (rv.experiencia) L.push("Tempo treinando corredores: " + rv.experiencia);
    if (rv.email) L.push("Contato: " + rv.email);
    L.push("Data: " + TODAY);
    L.push(
      "Conflito de interesse: " +
        (rv.conflito === "declarado" ? "declarado. " + (rv.conflito_detalhe || "") : "nenhum declarado")
    );
    L.push("");

    const vered = {
      sim: "Deixaria o conteúdo respondendo para os alunos dele.",
      ressalva: "Deixaria depois dos ajustes apontados.",
      nao: "Não deixaria do jeito que está.",
    };
    L.push("## Parecer");
    L.push("");
    L.push(vered[state.parecer.apto] || "Não respondido.");
    L.push("");
    L.push(state.parecer.texto || "(parecer em texto não preenchido)");
    L.push("");

    L.push("## Resumo");
    L.push("");
    L.push("| Resposta | Fichas |");
    L.push("|---|---|");
    L.push("| Concorda | " + c.concordo + " |");
    L.push("| Ajustaria a redação | " + c.ajustaria + " |");
    L.push("| Discorda | " + c.discordo + " |");
    L.push("| Sinalizou risco | " + c.perigoso + " |");
    L.push("| Fora da área dele | " + c.fora + " |");
    L.push("| Sem resposta | " + c.sem + " |");
    L.push("");

    // Risco primeiro: é o achado que não pode se perder no meio do relatório.
    const risco = allClaims.filter(function (r) {
      const a = state.claims[r.id];
      return a && a.ans === "perigoso";
    });
    if (risco.length) {
      L.push("## Sinalizado como risco — tratar primeiro");
      L.push("");
      risco.forEach(function (r) {
        L.push("### " + r.id + " · " + r.title);
        L.push("");
        L.push("Afirmação atual: " + r.claim);
        L.push("");
        L.push("Revisor: " + (state.claims[r.id].texto || ""));
        L.push("");
      });
    }

    [["discordo", "Discordâncias"], ["ajustaria", "Ajustes de redação"]].forEach(function (par) {
      const rows = allClaims.filter(function (r) {
        const a = state.claims[r.id];
        return a && a.ans === par[0];
      });
      if (!rows.length) return;
      L.push("## " + par[1]);
      L.push("");
      rows.forEach(function (r) {
        L.push("### " + r.id + " · " + r.title);
        L.push("");
        L.push("Afirmação atual: " + r.claim);
        L.push("");
        L.push("Revisor: " + (state.claims[r.id].texto || ""));
        L.push("");
      });
    });

    const fora = allClaims.filter(function (r) {
      const a = state.claims[r.id];
      return a && a.ans === "fora";
    });
    if (fora.length) {
      L.push("## Fora da competência deste revisor — precisa de outro especialista");
      L.push("");
      fora.forEach(function (r) {
        L.push("- " + r.id + " · " + r.title);
      });
      L.push("");
    }

    const dchg = docs.filter(function (d) {
      const a = state.docs[d.key];
      return a && (a.ans === "falta" || a.ans === "errado");
    });
    if (dchg.length) {
      L.push("## Regras do app");
      L.push("");
      dchg.forEach(function (d) {
        L.push("### " + d.titulo + " (" + d.key + ")");
        L.push("");
        L.push((state.docs[d.key].ans === "falta" ? "Falta alguma coisa. " : "Tem coisa errada. ") + (state.docs[d.key].texto || ""));
        L.push("");
      });
    }

    const qchg = allQuestions.filter(function (g) {
      const a = state.questions[g.id];
      return a && (a.ans === "falta" || a.ans === "errado");
    });
    if (qchg.length) {
      L.push("## Perguntas de teste a corrigir");
      L.push("");
      qchg.forEach(function (g) {
        L.push("### " + g.id + " · " + g.query);
        L.push("");
        L.push((state.questions[g.id].ans === "falta" ? "Incompleta. " : "Errada. ") + (state.questions[g.id].texto || ""));
        L.push("");
      });
    }

    const novas = state.newQuestions.filter(function (n) {
      return (n.pergunta || "").trim();
    });
    if (novas.length) {
      L.push("## Perguntas novas propostas");
      L.push("");
      novas.forEach(function (n) {
        L.push("### " + n.pergunta);
        L.push("");
        L.push("Deve dizer: " + (n.deve || ""));
        L.push("");
        L.push("Nunca pode dizer: " + (n.naopode || ""));
        L.push("");
      });
    }

    if ((state.faltas.RUN || "").trim() || (state.faltas.MUSC || "").trim()) {
      L.push("## Lacunas apontadas");
      L.push("");
      if ((state.faltas.RUN || "").trim()) {
        L.push("Corrida:");
        lines(state.faltas.RUN).forEach(function (x) {
          L.push("- " + x);
        });
        L.push("");
      }
      if ((state.faltas.MUSC || "").trim()) {
        L.push("Musculação:");
        lines(state.faltas.MUSC).forEach(function (x) {
          L.push("- " + x);
        });
        L.push("");
      }
    }

    if ((state.fontes_obs || "").trim()) {
      L.push("## Observações sobre os estudos citados");
      L.push("");
      L.push(state.fontes_obs);
      L.push("");
    }

    return L.join("\n");
  }

  function outBlock(nome, conteudo, nota) {
    const box = el('<div class="out"></div>');
    const head = el('<div class="out-head"></div>');
    head.appendChild(el('<span class="out-name">' + esc(nome) + "</span>"));
    if (nota) head.appendChild(el('<span class="kbdhint">' + esc(nota) + "</span>"));
    const btn = el('<button class="btn btn-sm btn-primary">Copiar</button>');
    btn.addEventListener("click", function () {
      const ok = function () {
        btn.textContent = "Copiado";
        setTimeout(function () {
          btn.textContent = "Copiar";
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(conteudo).then(ok, function () {
          selectPre(box);
        });
      } else {
        selectPre(box);
      }
    });
    head.appendChild(btn);
    box.appendChild(head);
    box.appendChild(el("<pre>" + esc(conteudo) + "</pre>"));
    return box;
  }

  function selectPre(box) {
    const pre = box.querySelector("pre");
    const range = document.createRange();
    range.selectNodeContents(pre);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function renderEntregaShell() {
    const pg = document.getElementById("pg-entrega");
    pg.appendChild(el('<span class="eyebrow">Etapa 8</span>'));
    pg.appendChild(el('<h1 class="h-title">Enviar sua revisão</h1>'));
    pg.appendChild(
      el(
        '<p class="h-lede">Copie os dois blocos abaixo e mande para a Variance por e-mail. O primeiro é a sua revisão em texto; o segundo é uma cópia de segurança que permite reabrir tudo do jeito que você deixou.</p>'
      )
    );
    pg.appendChild(el('<div class="deck" id="ent-deck"></div>'));
    pg.appendChild(el('<div id="ent-alert"></div>'));
    pg.appendChild(el('<div class="stack" id="ent-out"></div>'));
  }

  function renderEntrega() {
    const c = contagem();
    const deck = document.getElementById("ent-deck");
    deck.innerHTML = "";
    [
      ["Concordou", c.concordo, "sem alteração"],
      ["Ajustaria", c.ajustaria, "redação a rever"],
      ["Discorda", c.discordo, "conteúdo a rever"],
      ["Risco sinalizado", c.perigoso, c.perigoso ? "prioridade máxima" : "nenhum"],
      ["Fora da área", c.fora, "vai para outro especialista"],
      ["Sem resposta", c.sem, c.sem ? "ainda faltam" : "nenhuma"],
    ].forEach(function (t) {
      deck.appendChild(
        el(
          '<div class="dcard" style="cursor:default"><span class="dcard-k">' +
            esc(t[0]) +
            '</span><span class="dcard-v">' +
            t[1] +
            '</span><span class="dcard-n">' +
            esc(t[2]) +
            "</span></div>"
        )
      );
    });

    const alert = document.getElementById("ent-alert");
    alert.innerHTML = "";
    if (c.sem > 0) {
      const n = el(
        '<div class="note note-warn"><span class="note-mark">Falta</span><div>Ainda há <strong>' +
          c.sem +
          " ficha(s) sem resposta</strong>. Você pode enviar assim mesmo, mas o ideal é fechar antes. Se alguma não for sua área, marque como tal em vez de deixar em branco.</div></div>"
      );
      alert.appendChild(n);
    } else {
      alert.appendChild(el('<div class="note note-ok"><span class="note-mark">Pronto</span><div>Todas as fichas foram respondidas.</div></div>'));
    }

    const out = document.getElementById("ent-out");
    out.innerHTML = "";

    if (dl) {
      out.appendChild(
        el(
          '<div class="note"><span class="note-mark">Enviar</span><div>Salve os dois arquivos e anexe num e-mail para a Variance. O primeiro é a sua revisão; o segundo permite reabrir o formulário do jeito que você deixou.</div></div>'
        )
      );
      out.appendChild(saveRow());
      out.appendChild(
        el('<p class="f-hint" style="margin-top:6px">Se preferir colar o texto direto no e-mail, os dois blocos abaixo têm o mesmo conteúdo.</p>')
      );
    } else {
      out.appendChild(
        el(
          '<div class="note"><span class="note-mark">Enviar</span><div>Copie os dois blocos abaixo e cole num e-mail para a Variance. O primeiro é a sua revisão; o segundo permite reabrir o formulário do jeito que você deixou.</div></div>'
        )
      );
    }

    out.appendChild(outBlock("Sua revisão", relatorio(), "o conteúdo do parecer"));
    out.appendChild(outBlock("Cópia de segurança", JSON.stringify(state), "guarde para poder retomar"));
    out.appendChild(
      el(
        '<div class="note"><span class="note-mark">Depois</span><div>Enquanto você não limpar os dados deste navegador, pode fechar a página e voltar quando quiser: tudo continua aqui. A cópia de segurança serve para retomar em outro computador, ou para recuperar caso o navegador seja limpo. Para recarregá-la, use <strong>Retomar de um arquivo</strong>, lá em cima.</div></div>'
      )
    );
  }

  /* ------------------------------------------------ guardar em arquivo */

  // A capacidade `downloads` é resolvida uma vez e pode não existir (página
  // aberta fora do visualizador, ou permissão negada). Quando não existe, os
  // botões de salvar ficam escondidos e o copiar continua sendo o caminho.
  let dl = null;

  function initDownloads() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    Promise.resolve(window.claude.use("downloads")).then(
      function (ns) {
        dl = ns || null;
        if (!dl) return;
        document.getElementById("btn-guardar").hidden = false;
        if (current === "entrega") renderEntrega();
      },
      function () {
        dl = null;
      }
    );
  }

  function slug() {
    const base = (state.reviewer.nome || "").trim();
    if (!base) return "start-running";
    // \u0300-\u036f: as marcas de acento que o normalize NFD separa da letra.
    return (
      base
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "start-running"
    );
  }

  const ERRO_SAVE = {
    declined: "Você cancelou. O arquivo não foi salvo.",
    rate_limited: "Já tem um salvamento esperando resposta. Aguarde um instante e tente de novo.",
    too_large: "O arquivo ficou grande demais para salvar por aqui. Use o botão de copiar.",
    bad_request: "Não consegui montar o arquivo. Use o botão de copiar.",
  };

  // msgEl é opcional: na barra superior não há espaço para mensagem, e o
  // retorno fica só no rótulo do próprio botão.
  function guardar(filename, data, btn, msgEl) {
    if (!dl) return;
    const antes = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Salvando";
    if (msgEl) {
      msgEl.textContent = "";
      msgEl.removeAttribute("data-tone");
    }

    function diga(texto, tom) {
      if (msgEl) {
        msgEl.textContent = texto;
        if (tom) msgEl.dataset.tone = tom;
        else msgEl.removeAttribute("data-tone");
      }
    }

    dl.save({ filename: filename, data: data })
      .then(
        function () {
          diga("Salvo como " + filename + ". Confira na pasta de downloads.", "ok");
          btn.dataset.flash = "Salvo";
        },
        function (err) {
          const code = err && err.code;
          diga(ERRO_SAVE[code] || "Não consigo salvar arquivo nesta janela. Use o botão de copiar.", code === "declined" ? "" : "bad");
          btn.dataset.flash = code === "declined" ? "Cancelado" : "Não deu";
        }
      )
      .then(function () {
        btn.disabled = false;
        btn.textContent = btn.dataset.flash || antes;
        if (btn.dataset.flash) {
          const volta = btn.dataset.flash;
          setTimeout(function () {
            if (btn.textContent === volta) btn.textContent = antes;
          }, 1800);
          delete btn.dataset.flash;
        }
      });
  }

  function saveRow() {
    const row = el('<div class="saverow"></div>');
    const msg = el('<span class="savemsg"></span>');

    const b1 = el('<button class="btn btn-primary">Salvar minha revisão</button>');
    b1.addEventListener("click", function () {
      guardar("revisao-" + slug() + ".md", relatorio(), b1, msg);
    });
    row.appendChild(b1);

    const b2 = el('<button class="btn">Salvar cópia de segurança</button>');
    b2.addEventListener("click", function () {
      guardar("copia-de-seguranca-" + slug() + ".json", JSON.stringify(state), b2, msg);
    });
    row.appendChild(b2);

    const wrap = el("<div></div>");
    wrap.appendChild(row);
    wrap.appendChild(msg);
    return wrap;
  }

  /* -------------------------------------------------- retomar de arquivo */

  let pendente = null;

  function wireRestore() {
    const panel = document.getElementById("restore-panel");
    const file = document.getElementById("restore-file");
    const go2 = document.getElementById("restore-go");
    const msg = document.getElementById("restore-msg");

    document.getElementById("btn-retomar").addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) panel.scrollIntoView({ block: "nearest" });
    });
    document.getElementById("restore-cancel").addEventListener("click", function () {
      panel.hidden = true;
    });

    file.addEventListener("change", function () {
      pendente = null;
      go2.disabled = true;
      msg.removeAttribute("data-tone");
      const f = file.files && file.files[0];
      if (!f) {
        msg.textContent = "";
        return;
      }
      const reader = new FileReader();
      reader.onerror = function () {
        msg.textContent = "Não consegui ler esse arquivo.";
        msg.dataset.tone = "bad";
      };
      reader.onload = function () {
        try {
          const obj = JSON.parse(String(reader.result));
          if (!obj || typeof obj !== "object" || !obj.claims) throw new Error("formato");
          // Um arquivo de outra versão do formulário tem outro formato de
          // resposta. Melhor recusar do que misturar e devolver um relatório
          // com respostas silenciosamente perdidas.
          if (obj.version !== blank.version) {
            msg.textContent = "Esse arquivo é de outra versão do formulário. Fale com a Variance antes de continuar: aplicar assim pode perder respostas.";
            msg.dataset.tone = "bad";
            return;
          }
          pendente = obj;
          go2.disabled = false;
          const nome = (obj.reviewer && obj.reviewer.nome) || "sem nome";
          const respondidas = Object.keys(obj.claims).filter(function (k) {
            return obj.claims[k] && obj.claims[k].ans;
          }).length;
          const quando = obj.savedAt ? new Date(obj.savedAt).toLocaleString("pt-BR") : "data desconhecida";
          msg.textContent = "Arquivo de " + nome + ", com " + respondidas + " ficha(s) respondida(s), guardado em " + quando + ".";
          msg.dataset.tone = "ok";
        } catch (e) {
          msg.textContent = "Esse arquivo não parece ser uma cópia de segurança deste formulário.";
          msg.dataset.tone = "bad";
        }
      };
      reader.readAsText(f);
    });

    go2.addEventListener("click", function () {
      if (!pendente) return;
      state = Object.assign(JSON.parse(JSON.stringify(blank)), pendente);
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
      } catch (e) {
        /* segue mesmo sem conseguir persistir: o estado em memória já foi trocado */
      }
      pendente = null;
      go2.disabled = true;
      file.value = "";
      panel.hidden = true;
      pularParaPrimeiraSemResposta();
      rebuild();
      go("corrida");
      setSaveState("saved");
    });
  }

  function pularParaPrimeiraSemResposta() {
    ["RUN", "MUSC"].forEach(function (k) {
      const rows = claimsOf(k);
      const i = rows.findIndex(function (r) {
        return !claimComplete(r);
      });
      queue[k] = i === -1 ? 0 : i;
    });
    const j = allQuestions.findIndex(function (g) {
      return !questionComplete(g);
    });
    qIdx = j === -1 ? 0 : j;
  }

  /* ---------------------------------------------------------- atalhos */

  function keys(e) {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
    // Com modificador pressionado o atalho é do navegador, não do formulário:
    // Ctrl+1 troca de aba e Alt+seta volta no histórico. Sem esta saída, o
    // preventDefault abaixo engoliria o atalho do navegador e ainda gravaria
    // uma resposta que o revisor não quis dar.
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

    let slot = null;
    let onPrev = null;
    let onNext = null;

    if (current === "corrida" || current === "musculacao") {
      const k = current === "corrida" ? "RUN" : "MUSC";
      slot = document.getElementById("qslot-" + k);
      onPrev = function () {
        if (queue[k] > 0) {
          queue[k]--;
          renderQueue(k);
        }
      };
      onNext = function () {
        if (queue[k] < claimsOf(k).length - 1) {
          queue[k]++;
          renderQueue(k);
        }
      };
    } else if (current === "perguntas") {
      slot = document.getElementById("qslot-Q");
      onPrev = function () {
        if (qIdx > 0) {
          qIdx--;
          renderQuestionQueue();
        }
      };
      onNext = function () {
        if (qIdx < allQuestions.length - 1) {
          qIdx++;
          renderQuestionQueue();
        }
      };
    }
    if (!slot) return;

    const card = slot.firstElementChild;
    if (e.key >= "1" && e.key <= "5" && card && card._pick) {
      e.preventDefault();
      card._pick(Number(e.key) - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
    }
  }

  /* -------------------------------------------------------------- boot */

  // Monta todas as páginas do zero. Chamado no início e de novo depois de
  // retomar de um arquivo, quando o estado inteiro foi substituído.
  function rebuild() {
    STEPS.forEach(function (s) {
      const pg = document.getElementById("pg-" + s.id);
      if (pg) pg.innerHTML = "";
    });

    renderInicio();
    renderVoce();
    renderQueueShell("RUN", "pg-corrida", "As afirmações sobre corrida", "São " + claimsOf("RUN").length + " no total. Uma por vez, e você responde no seu ritmo.");
    renderQueueShell("MUSC", "pg-musculacao", "As afirmações sobre musculação", "São " + claimsOf("MUSC").length + ". O app usa isso para orientar quem faz força junto com a corrida.");
    renderRegras();
    renderPerguntasShell();
    renderFechamento();
    renderEntregaShell();

    renderQueue("RUN");
    renderQueue("MUSC");
    renderQuestionQueue();

    renderTrail();
  }

  function boot() {
    document.getElementById("btn-theme").addEventListener("click", function () {
      const root = document.documentElement;
      const dark =
        root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      root.setAttribute("data-theme", dark ? "light" : "dark");
    });

    // Guardar no meio do trabalho: um clique salva a cópia de segurança, sem
    // obrigar a ir até o fim do percurso.
    const bg = document.getElementById("btn-guardar");
    bg.addEventListener("click", function () {
      guardar("copia-de-seguranca-" + slug() + ".json", JSON.stringify(state), bg, null);
    });

    wireRestore();
    rebuild();

    document.addEventListener("keydown", keys);

    go("inicio");
    setSaveState("saved");
    initDownloads();
  }

  boot();
})();
