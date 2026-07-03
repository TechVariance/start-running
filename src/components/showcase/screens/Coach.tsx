import { Send, Sparkles } from "lucide-react";

const messages = [
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
  { role: "user", text: "E hoje?" },
  { role: "coach", text: "Hoje é dia de segurar. Troquei o tiro por rodado leve pra você chegar redondo no longão de domingo. Confia no processo." },
];

const chips = ["O que é ACWR?", "Como está minha forma?", "Ajusta meu treino de amanhã", "Explica meu TSB"];

export function Coach() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-5 pb-3 pt-2">
        <div className="relative grid h-11 w-11 place-items-center rounded-full bg-pulse">
          <Sparkles size={20} className="text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] font-black leading-none text-foreground">Coach IA</h1>
          <p className="text-[12px] text-muted-foreground">Sempre com seus dados na mão</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {messages.map((m, i) => (
          <Message key={i} {...m} />
        ))}

        <div className="pt-2">
          <p className="label-cap mb-2 text-muted-foreground">Sugestões</p>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <button
                key={c}
                className="rounded-full border border-pulse/40 bg-pulse/10 px-3 py-1.5 text-[12px] font-semibold text-pulse hover:bg-pulse/20"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface-alt px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
          <input
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Pergunta pro coach..."
          />
          <button className="grid h-9 w-9 place-items-center rounded-full bg-ignite text-white" style={{ boxShadow: "var(--shadow-glow-ignite)" }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Message({ role, text, highlight }: { role: string; text: string; highlight?: { k: string; v: string }[] }) {
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
            {highlight.map(h => (
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
