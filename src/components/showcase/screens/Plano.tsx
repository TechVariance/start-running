import { useState } from "react";
import { Trophy, Sparkles, ChevronDown } from "lucide-react";

const phases = [
  { name: "Base", weeks: 4, status: "done" as const },
  { name: "Build", weeks: 4, status: "current" as const, progress: "3/4" },
  { name: "Peak", weeks: 2, status: "todo" as const },
  { name: "Taper", weeks: 1, status: "todo" as const },
];

type Day = {
  day: string;
  type: string;
  detail: string;
  tone: "ignite" | "success" | "warning" | "pulse" | "muted";
  done?: boolean;
  today?: boolean;
  swapped?: boolean;
  plan: { phase: string; time: string; desc: string; color: string }[];
};

const week: Day[] = [
  {
    day: "SEG", type: "Descanso", detail: "Mobilidade opcional", tone: "muted", done: true,
    plan: [{ phase: "Recuperação", time: "livre", desc: "Caminhada leve ou mobilidade 20min. Foco em quadril e panturrilha.", color: "#8A99AB" }],
  },
  {
    day: "TER", type: "Tiros", detail: "6×800m @ 4:40 · R 90s", tone: "ignite", done: true,
    plan: [
      { phase: "Aquecimento", time: "15 min", desc: "Trote Z1 + 4 educativos + 3×30s progressivo.", color: "#3FA9F5" },
      { phase: "Série", time: "6×800m", desc: "Pace 4:40/km, recuperação 90s trote muito leve.", color: "#FF3A5E" },
      { phase: "Desaquecimento", time: "10 min", desc: "Trote Z1 até FC baixar.", color: "#8A99AB" },
    ],
  },
  {
    day: "QUA", type: "Rodado", detail: "6 km fácil · Z2", tone: "success", done: true,
    plan: [{ phase: "Bloco único", time: "35 min", desc: "6 km constante em Z2. Conversa fluindo, sem ofegar.", color: "#17B26A" }],
  },
  {
    day: "QUI", type: "Força", detail: "Full body · 40min", tone: "pulse", swapped: true,
    plan: [
      { phase: "Ativação", time: "5 min", desc: "Prancha, ponte, banda de quadril.", color: "#1E5BFF" },
      { phase: "Força", time: "30 min", desc: "Agachamento, RDL, remada, apoio. 3×8, cargas confortáveis.", color: "#1E5BFF" },
      { phase: "Mobilidade", time: "5 min", desc: "Tornozelo, quadril, coluna torácica.", color: "#8A99AB" },
    ],
  },
  {
    day: "SEX", type: "Rodado", detail: "8 km moderado · Z2", tone: "success", today: true,
    plan: [
      { phase: "Aquecimento", time: "10 min", desc: "Trote leve até chegar em Z2.", color: "#3FA9F5" },
      { phase: "Principal", time: "30 min", desc: "8 km em Z2, pace alvo 5:30/km. FC 132–148.", color: "#17B26A" },
      { phase: "Desaquecimento", time: "5 min", desc: "Trote muito leve + caminhada.", color: "#8A99AB" },
    ],
  },
  {
    day: "SÁB", type: "Descanso", detail: "Recuperação total", tone: "muted",
    plan: [{ phase: "Off", time: "—", desc: "Descanso completo. Se quiser, caminhada leve.", color: "#8A99AB" }],
  },
  {
    day: "DOM", type: "Longão", detail: "18 km · Z2 progressivo", tone: "warning",
    plan: [
      { phase: "Aquecimento", time: "10 min", desc: "Trote leve, entrada gradual.", color: "#3FA9F5" },
      { phase: "Longão", time: "90 min", desc: "18 km em Z2. Últimos 5 km progressivos até final de Z2/começo de Z3.", color: "#17B26A" },
      { phase: "Volta à calma", time: "10 min", desc: "Trote lento + alongamento.", color: "#8A99AB" },
    ],
  },
];

export function Plano() {
  const [expanded, setExpanded] = useState<string | null>("SEX");

  return (
    <div className="space-y-4 px-5 pb-6">
      <header className="pt-4">
        <p className="label-cap text-muted-foreground">Meu plano</p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-[28px] font-black leading-tight text-foreground">
            Meia do Rio · 21k
          </h1>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-volt/20">
            <Trophy size={20} className="text-volt-ink" />
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[13px] text-muted-foreground">
          <span>10 semanas restantes</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span>Meta <span className="font-bold text-foreground tabular">1h52</span></span>
        </div>
      </header>

      <div className="card-surface p-4">
        <span className="label-cap text-muted-foreground">Fases</span>
        <div className="mt-3 flex items-center gap-1">
          {phases.map((p) => (
            <div key={p.name} className="flex-1">
              <div
                className="h-2 rounded-full"
                style={{
                  background:
                    p.status === "done" ? "var(--color-success)" :
                    p.status === "current" ? "var(--color-ignite)" :
                    "var(--color-border)",
                }}
              />
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-[12px] font-bold ${p.status === "current" ? "text-ignite" : "text-foreground"}`}>{p.name}</span>
                <span className="text-[10px] tabular text-muted-foreground">{p.status === "current" ? p.progress : `${p.weeks}s`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="label-cap text-muted-foreground">Semana 3 · Build</span>
          <span className="text-[12px] font-bold text-success">92% aderência</span>
        </div>
        <div className="space-y-2">
          {week.map((d) => (
            <DayCard
              key={d.day}
              day={d}
              expanded={expanded === d.day}
              onToggle={() => setExpanded(expanded === d.day ? null : d.day)}
            />
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{
          background: "color-mix(in oklab, var(--color-pulse) 10%, transparent)",
          borderColor: "color-mix(in oklab, var(--color-pulse) 40%, transparent)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-pulse">
            <Sparkles size={16} className="text-white" />
          </span>
          <div>
            <p className="label-cap text-pulse">Ajuste da IA · hoje</p>
            <p className="text-[13px] font-bold text-foreground">Troquei o tiro por rodado</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-foreground">
          Sua variabilidade caiu e o sono foi curto. Hoje pega leve — troquei o tiro por um rodado tranquilo pra você chegar redondo no longão de domingo.
        </p>
      </div>
    </div>
  );
}

const toneMap = {
  ignite: "var(--color-ignite)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  pulse: "var(--color-pulse)",
  muted: "var(--color-muted-foreground)",
};

function DayCard({ day: d, expanded, onToggle }: { day: Day; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors"
      style={{
        background: d.today ? "color-mix(in oklab, var(--color-ignite) 8%, var(--color-surface-alt))" : "var(--color-surface-alt)",
        borderColor: d.today || expanded ? "var(--color-ignite)" : "var(--color-border)",
      }}
    >
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-3 text-left">
        <div className="flex w-10 flex-col items-center">
          <span className="label-cap" style={{ color: d.today ? "var(--color-ignite)" : "var(--color-muted-foreground)" }}>{d.day}</span>
          <span
            className="mt-1 h-1.5 w-1.5 rounded-full"
            style={{ background: d.done ? "var(--color-success)" : d.today ? "var(--color-ignite)" : "var(--color-border)" }}
          />
        </div>
        <div className="w-1 self-stretch rounded-full" style={{ background: toneMap[d.tone] }} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-foreground">
            {d.type}
            {d.swapped && <span className="ml-2 rounded-full bg-pulse/20 px-1.5 py-0.5 text-[10px] font-bold text-pulse">AJUSTADO</span>}
            {d.today && <span className="ml-2 rounded-full bg-ignite px-1.5 py-0.5 text-[10px] font-bold text-white">HOJE</span>}
          </p>
          <p className="text-[12px] text-muted-foreground">{d.detail}</p>
        </div>
        <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="space-y-2 border-t border-border bg-background/40 p-3">
          {d.plan.map((b, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border bg-background p-2.5">
              <div className="w-1 shrink-0 rounded-full" style={{ background: b.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-bold text-foreground">{b.phase}</p>
                  <span className="text-[10px] font-bold tabular text-muted-foreground">{b.time}</span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
