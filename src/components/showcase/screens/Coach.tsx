import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

type Msg = {
  role: "coach" | "user";
  text: string;
  highlight?: { k: string; v: string }[];
};

const initialMessages: Msg[] = [
  { role: "coach", text: "Bom dia, Luiz. Vi que seu sono foi curto ontem — quer conversar sobre o treino de hoje?" },
  { role: "user", text: "Por que meu treino de ontem foi tão pesado?" },
  {
    role: "coach",
    text: "Faz sentido você ter sentido. Seu TSB estava em -18 (bem cansado) e você rodou 70% do tempo em Z3, quando o plano pedia Z2. Combinação de fadiga acumulada + intensidade acima do previsto.",
    highlight: [
      { k: "TSB", v: "-18" },
      { k: "Z3", v: "70%" },
      { k: "Plano", v: "Z2" },
    ],
  },
];

const chips = ["O que é ACWR?", "Como está minha forma?", "Ajusta meu treino de amanhã", "Explica meu TSB"];

// Respostas mock coerentes com os dados do atleta
function mockReply(input: string): Msg {
  const q = input.toLowerCase();
  if (q.includes("acwr")) {
    return {
      role: "coach",
      text: "ACWR é a razão entre sua carga aguda (7 dias) e a crônica (28 dias). O seu tá em 1,4 — acima de 1,3 a chance de lesão sobe bastante. Por isso segurei o volume desta semana.",
      highlight: [{ k: "ACWR", v: "1,4" }, { k: "Zona segura", v: "0,8–1,3" }],
    };
  }
  if (q.includes("forma") || q.includes("tsb")) {
    return {
      role: "coach",
      text: "Sua forma (TSB) tá em -14 — cansado, mas não fundo. CTL subindo (52 → 58), o que é bom sinal de progressão. Vamos manter a semana leve pra TSB voltar pra 0 antes do próximo bloco forte.",
      highlight: [{ k: "TSB", v: "-14" }, { k: "CTL", v: "58" }],
    };
  }
  if (q.includes("amanh")) {
    return {
      role: "coach",
      text: "Amanhã é sábado, dia de descanso total. Nada de \"só um trotinho\" — recuperar é parte do treino. Domingo é longão de 18k em Z2, aí a gente foca.",
    };
  }
  if (q.includes("hoje")) {
    return {
      role: "coach",
      text: "Hoje é rodado moderado de 8k em Z2 (FC 132–148). Pace alvo 5:30/km. Se a respiração ficar curta, alivia — hoje é volume, não intensidade.",
      highlight: [{ k: "Alvo", v: "Z2" }, { k: "Pace", v: "5:30" }],
    };
  }
  return {
    role: "coach",
    text: "Boa pergunta. Com base nos seus dados atuais (TSB -14, ACWR 1,4, aderência 92%), meu conselho é manter a semana leve e chegar redondo no longão. Quer que eu abra o raciocínio?",
    highlight: [{ k: "TSB", v: "-14" }, { k: "ACWR", v: "1,4" }],
  };
}

export function Coach() {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, mockReply(clean)]);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] flex-col">
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <div className="relative grid h-11 w-11 place-items-center rounded-full bg-pulse">
          <Sparkles size={20} className="text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] font-black leading-none text-foreground">Coach IA</h1>
          <p className="text-[12px] text-muted-foreground">Sempre com seus dados na mão</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {messages.map((m, i) => (
          <Message key={i} {...m} />
        ))}
        {typing && <TypingIndicator />}

        <div className="pt-2">
          <p className="label-cap mb-2 text-muted-foreground">Sugestões</p>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="rounded-full border border-pulse/40 bg-pulse/10 px-3 py-1.5 text-[12px] font-semibold text-pulse hover:bg-pulse/20"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-surface-alt px-4 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Pergunta pro coach..."
          />
          <button
            type="submit"
            className="grid h-9 w-9 place-items-center rounded-full bg-ignite text-white disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-glow-ignite)" }}
            disabled={!input.trim() || typing}
            aria-label="Enviar"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pulse">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-surface-alt px-4 py-3">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function Message({ role, text, highlight }: Msg) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-ignite px-4 py-2.5 text-[14px] font-medium text-white">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pulse">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface-alt px-4 py-2.5 text-[14px] text-foreground">
        <p>{text}</p>
        {highlight && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {highlight.map((h) => (
              <span key={h.k} className="rounded-md bg-background px-2 py-1 text-[11px] font-bold tabular">
                <span className="text-muted-foreground">{h.k}</span>{" "}
                <span className="text-foreground">{h.v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
