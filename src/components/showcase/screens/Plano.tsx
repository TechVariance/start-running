import { Trophy, Sparkles } from "lucide-react";

const phases = [
  { name: "Base", weeks: 4, status: "done" as const },
  { name: "Build", weeks: 4, status: "current" as const, progress: "3/4" },
  { name: "Peak", weeks: 2, status: "todo" as const },
  { name: "Taper", weeks: 1, status: "todo" as const },
];

const week = [
  { day: "SEG", type: "Descanso", detail: "Mobilidade opcional", tone: "muted" as const, done: true },
  { day: "TER", type: "Tiros", detail: "6×800m @ 4:40 · R 90s", tone: "ignite" as const, done: true },
  { day: "QUA", type: "Rodado", detail: "6 km fácil · Z2", tone: "success" as const, done: true },
  { day: "QUI", type: "Força", detail: "Full body · 40min", tone: "pulse" as const, done: false, today: false, swapped: true },
  { day: "SEX", type: "Rodado", detail: "8 km moderado · Z2", tone: "success" as const, today: true },
  { day: "SÁB", type: "Descanso", detail: "Recuperação total", tone: "muted" as const },
  { day: "DOM", type: "Longão", detail: "18 km · Z2 progressivo", tone: "warning" as const },
];

export function Plano() {
  return (
    <div className="space-y-4 px-5 pb-4">
      <header className="pt-2">
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

      {/* Fases */}
      <div className="card-surface p-4">
        <span className="label-cap text-muted-foreground">Fases</span>
        <div className="mt-3 flex items-center gap-1">
          {phases.map((p, i) => (
            <div key={p.name} className="flex-1">
              <div
                className="h-2 rounded-full"
                style={{
                  background:
                    p.status === "done" ? "var(--color-success)" :
                    p.status === "current" ? "var(--color-ignite)" :
                    "var(--color-border)",
                  opacity: p.status === "todo" ? 1 : 1,
                }}
              />
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-[12px] font-bold ${p.status === "current" ? "text-ignite" : "text-foreground"}`}>{p.name}</span>
                <span className="text-[10px] tabular text-muted-foreground">{p.status === "current" ? p.progress : `${p.weeks}s`}</span>
              </div>
              {i < phases.length - 1 && null}
            </div>
          ))}
        </div>
      </div>

      {/* Semana atual */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="label-cap text-muted-foreground">Semana 3 · Build</span>
          <span className="text-[12px] font-bold text-success">92% aderência</span>
        </div>
        <div className="space-y-2">
          {week.map((d) => (
            <DayCard key={d.day} {...d} />
          ))}
        </div>
      </div>

      {/* Ajuste da IA */}
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

function DayCard({ day, type, detail, tone, today, done, swapped }: {
  day: string; type: string; detail: string; tone: keyof typeof toneMap;
  today?: boolean; done?: boolean; swapped?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-3"
      style={{
        background: today ? "color-mix(in oklab, var(--color-ignite) 8%, var(--color-surface-alt))" : "var(--color-surface-alt)",
        borderColor: today ? "var(--color-ignite)" : "var(--color-border)",
      }}
    >
      <div className="flex w-10 flex-col items-center">
        <span className="label-cap" style={{ color: today ? "var(--color-ignite)" : "var(--color-muted-foreground)" }}>{day}</span>
        <span
          className="mt-1 h-1.5 w-1.5 rounded-full"
          style={{ background: done ? "var(--color-success)" : today ? "var(--color-ignite)" : "var(--color-border)" }}
        />
      </div>
      <div className="w-1 self-stretch rounded-full" style={{ background: toneMap[tone] }} />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-foreground">
          {type}
          {swapped && <span className="ml-2 rounded-full bg-pulse/20 px-1.5 py-0.5 text-[10px] font-bold text-pulse">AJUSTADO</span>}
          {today && <span className="ml-2 rounded-full bg-ignite px-1.5 py-0.5 text-[10px] font-bold text-white">HOJE</span>}
        </p>
        <p className="text-[12px] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
