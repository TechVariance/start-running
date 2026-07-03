import { AlertTriangle, ArrowRight, Heart, Moon, Activity } from "lucide-react";

function ReadinessArc({ score }: { score: number }) {
  const r = 78;
  const c = Math.PI * r;
  const pct = score / 100;
  return (
    <div className="relative flex h-[180px] w-[180px] items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-[200deg]">
        <defs>
          <linearGradient id="arc-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#E02749" />
            <stop offset="50%" stopColor="#F5C518" />
            <stop offset="100%" stopColor="#17B26A" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--color-border)" strokeWidth="12" strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke="url(#arc-grad)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${c * 0.75 * pct} ${c}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-[56px] font-black leading-none text-foreground">{score}</span>
        <span className="label-cap mt-1 text-muted-foreground">Prontidão</span>
      </div>
    </div>
  );
}

export function Hoje() {
  return (
    <div className="space-y-4 px-5 pb-4">
      <header className="pt-2">
        <p className="label-cap text-muted-foreground">Sexta · 3 jul</p>
        <h1 className="font-display text-[32px] font-black leading-tight text-foreground">
          Bora, Luiz.
        </h1>
        <p className="text-[15px] text-muted-foreground">Semana 3 de 10 · Bloco Build</p>
      </header>

      {/* Readiness */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <span className="label-cap text-muted-foreground">Você hoje</span>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">BOA FORMA</span>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <ReadinessArc score={78} />
          <div className="flex-1 space-y-3">
            <MetricRow Icon={Heart} label="HRV" value="62" unit="ms" hint="baseline 58" up />
            <MetricRow Icon={Moon} label="Sono" value="7h20" hint="meta 7h30" />
            <MetricRow Icon={Activity} label="FC repouso" value="48" unit="bpm" hint="ótimo" />
          </div>
        </div>
      </div>

      {/* Alerta de carga */}
      <div
        className="flex items-start gap-3 rounded-2xl border p-4"
        style={{ background: "color-mix(in oklab, var(--color-warning) 12%, transparent)", borderColor: "color-mix(in oklab, var(--color-warning) 40%, transparent)" }}
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-warning)" }}>
          <AlertTriangle size={18} className="text-[#0B0F14]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground">Carga aguda acima da zona segura</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            ACWR 1,4. Vamos segurar o volume esta semana pra te manter inteiro.
          </p>
          <button className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-warning">
            Ver ajuste <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Workout do dia */}
      <div className="card-surface overflow-hidden">
        <div className="p-5">
          <span className="label-cap text-pulse">Treino de hoje</span>
          <h3 className="mt-1 font-display text-[21px] font-extrabold text-foreground">Rodado moderado</h3>
          <p className="text-[13px] text-muted-foreground">Constante, respiração cômoda até o fim.</p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Distância" value="8" unit="km" />
            <Stat label="Pace alvo" value="5:30" unit="/km" />
            <Stat label="Duração" value="~45" unit="min" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ZoneChip zone="Z2" label="Endurance" color="#17B26A" />
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-muted-foreground">
              FC 132–148 bpm
            </span>
          </div>
        </div>
        <button className="btn-ignite mx-5 mb-5 flex w-[calc(100%-40px)] items-center justify-center gap-2 py-4 text-[15px]">
          Bora pro treino de hoje <ArrowRight size={18} />
        </button>
      </div>

      <p className="pt-1 text-center text-[11px] text-muted-foreground">
        powered by <span className="font-bold text-foreground">Variance</span>
      </p>
    </div>
  );
}

function MetricRow({ Icon, label, value, unit, hint, up }: { Icon: typeof Heart; label: string; value: string; unit?: string; hint?: string; up?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-surface">
        <Icon size={16} className="text-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="label-cap text-muted-foreground">{label}</p>
        <p className="font-display text-[18px] font-extrabold text-foreground">
          {value}{unit && <span className="text-[13px] font-semibold text-muted-foreground"> {unit}</span>}
        </p>
      </div>
      {hint && (
        <span className={`text-[11px] font-semibold ${up ? "text-success" : "text-muted-foreground"}`}>
          {up && "▲ "}{hint}
        </span>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="label-cap text-muted-foreground">{label}</p>
      <p className="font-display text-[22px] font-black text-foreground">
        {value}<span className="text-[12px] font-semibold text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function ZoneChip({ zone, label, color }: { zone: string; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {zone} · {label}
    </span>
  );
}
