import { ChevronDown, ShieldCheck, AlertTriangle } from "lucide-react";

const zones = [
  { z: "Z1", label: "Recuperação", pct: 8, color: "#3FA9F5" },
  { z: "Z2", label: "Endurance", pct: 64, color: "#17B26A" },
  { z: "Z3", label: "Tempo", pct: 18, color: "#F5C518" },
  { z: "Z4", label: "Limiar", pct: 8, color: "#FF7A1F" },
  { z: "Z5", label: "Anaeróbico", pct: 2, color: "#E02749" },
];

const splits = [
  { km: 1, pace: "5:42", zone: "#17B26A", w: 60 },
  { km: 2, pace: "5:38", zone: "#17B26A", w: 64 },
  { km: 3, pace: "5:29", zone: "#17B26A", w: 72 },
  { km: 4, pace: "5:24", zone: "#17B26A", w: 78 },
  { km: 5, pace: "5:31", zone: "#17B26A", w: 71 },
  { km: 6, pace: "5:12", zone: "#F5C518", w: 92 },
  { km: 7, pace: "5:18", zone: "#F5C518", w: 86 },
  { km: 8, pace: "5:22", zone: "#17B26A", w: 80 },
  { km: 9, pace: "5:48", zone: "#17B26A", w: 55 },
];

const sessions = [
  { date: "Hoje", title: "Rodado moderado", dist: "planejado", pace: "8 km", status: "planned" },
  { date: "Qui, 2/7", title: "Força · full body", dist: "40 min", pace: "—", status: "skipped" },
  { date: "Qua, 1/7", title: "Rodado fácil", dist: "6,1 km", pace: "5:52/km", status: "done", low: true },
  { date: "Ter, 30/6", title: "Tiros 6×800m", dist: "9,4 km", pace: "4:38/km", status: "done" },
];

export function Treinos() {
  return (
    <div className="space-y-4 px-5 pb-4">
      <header className="pt-2">
        <p className="label-cap text-muted-foreground">Histórico</p>
        <h1 className="font-display text-[28px] font-black leading-tight text-foreground">Suas sessões</h1>
      </header>

      {/* Sessão expandida */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <p className="label-cap text-muted-foreground">Dom, 28/6 · Longão</p>
            <h3 className="font-display text-[20px] font-extrabold text-foreground">Longão de domingo</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
            <ShieldCheck size={12} /> Alta confiança
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 px-5">
          <BigStat label="Distância" value="16,2" unit="km" />
          <BigStat label="Tempo" value="1:28" unit="h" />
          <BigStat label="Pace" value="5:29" unit="/km" />
          <BigStat label="hrTSS" value="118" />
        </div>

        {/* Zonas */}
        <div className="mt-5 px-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="label-cap text-muted-foreground">Distribuição por zona</span>
            <span className="text-[11px] tabular text-muted-foreground">TRIMP 142</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
            {zones.map(z => (
              <div key={z.z} style={{ width: `${z.pct}%`, background: z.color }} title={`${z.z} ${z.pct}%`} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-1.5">
            {zones.map(z => (
              <div key={z.z} className="flex items-center gap-2 text-[12px]">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: z.color }} />
                <span className="font-bold text-foreground">{z.z}</span>
                <span className="text-muted-foreground">{z.label}</span>
                <span className="ml-auto font-bold tabular text-foreground">{z.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Splits */}
        <div className="mt-5 px-5 pb-5">
          <span className="label-cap text-muted-foreground">Splits por km</span>
          <div className="mt-2 space-y-1">
            {splits.map(s => (
              <div key={s.km} className="flex items-center gap-2">
                <span className="w-5 text-[11px] tabular text-muted-foreground">{s.km}</span>
                <div className="relative h-4 flex-1 overflow-hidden rounded-md bg-background">
                  <div className="h-full" style={{ width: `${s.w}%`, background: s.zone, opacity: 0.85 }} />
                </div>
                <span className="w-12 text-right text-[11px] font-bold tabular text-foreground">{s.pace}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTL/ATL/TSB */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <span className="label-cap text-muted-foreground">Carga · 42 dias</span>
          <div className="flex gap-3 text-[10px]">
            <LegendDot color="var(--color-pulse)" label="CTL" />
            <LegendDot color="var(--color-muted-foreground)" label="ATL" />
            <LegendDot color="var(--color-success)" label="TSB" />
          </div>
        </div>
        <LoadChart />
        <div className="mt-2 flex justify-between text-[10px] tabular text-muted-foreground">
          <span>-42d</span><span>-21d</span><span>hoje</span>
        </div>
      </div>

      {/* Lista */}
      <div>
        <span className="label-cap px-1 text-muted-foreground">Sessões recentes</span>
        <div className="mt-2 space-y-2">
          {sessions.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-alt p-3"
              style={{ opacity: s.low ? 0.7 : 1 }}
            >
              <div className="w-14">
                <p className="label-cap text-muted-foreground">{s.date}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-foreground">{s.title}</p>
                <p className="text-[12px] tabular text-muted-foreground">
                  {s.dist} · {s.pace}
                  {s.low && (
                    <span className="ml-2 inline-flex items-center gap-1 text-warning">
                      <AlertTriangle size={11} /> baixa confiança
                    </span>
                  )}
                </p>
              </div>
              <StatusChip status={s.status} />
              <ChevronDown size={14} className="-rotate-90 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2.5">
      <p className="label-cap text-muted-foreground" style={{ fontSize: 9 }}>{label}</p>
      <p className="font-display text-[18px] font-black leading-tight text-foreground">
        {value}{unit && <span className="text-[10px] font-semibold text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}

function LoadChart() {
  // 42 days mock — CTL climbs, ATL wavy, TSB bars diverge
  const days = 42;
  const ctl = Array.from({ length: days }, (_, i) => 45 + i * 0.6 + Math.sin(i / 4) * 2);
  const atl = Array.from({ length: days }, (_, i) => 50 + Math.sin(i / 2) * 12 + i * 0.7);
  const tsb = ctl.map((c, i) => c - atl[i]);
  const w = 320, h = 100;
  const max = 90, min = -25;
  const scaleY = (v: number) => h - ((v - min) / (max - min)) * h;
  const stepX = w / (days - 1);
  const ctlPath = ctl.map((v, i) => `${i === 0 ? "M" : "L"}${i * stepX},${scaleY(v)}`).join(" ");
  const atlPath = atl.map((v, i) => `${i === 0 ? "M" : "L"}${i * stepX},${scaleY(v)}`).join(" ");
  const zeroY = scaleY(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-[100px] w-full">
      {/* zero line */}
      <line x1="0" x2={w} y1={zeroY} y2={zeroY} stroke="var(--color-border)" strokeDasharray="2 3" />
      {/* CTL area */}
      <path d={`${ctlPath} L${w},${h} L0,${h} Z`} fill="var(--color-pulse)" opacity="0.18" />
      <path d={ctlPath} stroke="var(--color-pulse)" strokeWidth="2" fill="none" />
      {/* ATL line */}
      <path d={atlPath} stroke="var(--color-muted-foreground)" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
      {/* TSB bars */}
      {tsb.map((v, i) => (
        <rect
          key={i}
          x={i * stepX - 2}
          y={v >= 0 ? scaleY(v) : zeroY}
          width="4"
          height={Math.abs(scaleY(v) - zeroY)}
          fill={v >= 0 ? "var(--color-success)" : "var(--color-warning)"}
          opacity="0.85"
          rx="1"
        />
      ))}
    </svg>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    done: { label: "Executado", bg: "color-mix(in oklab, var(--color-success) 15%, transparent)", fg: "var(--color-success)" },
    planned: { label: "Planejado", bg: "color-mix(in oklab, var(--color-pulse) 15%, transparent)", fg: "var(--color-pulse)" },
    skipped: { label: "Perdido", bg: "color-mix(in oklab, var(--color-danger) 15%, transparent)", fg: "var(--color-danger)" },
  };
  const s = map[status];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}
