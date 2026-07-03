import { useState } from "react";
import { ChevronDown, ShieldCheck, AlertTriangle } from "lucide-react";

const zones = [
  { z: "Z1", label: "Recuperação", pct: 8, color: "#3FA9F5" },
  { z: "Z2", label: "Endurance", pct: 64, color: "#17B26A" },
  { z: "Z3", label: "Tempo", pct: 18, color: "#F5C518" },
  { z: "Z4", label: "Limiar", pct: 8, color: "#FF7A1F" },
  { z: "Z5", label: "Anaeróbico", pct: 2, color: "#E02749" },
];

type Session = {
  id: string;
  date: string;
  title: string;
  dist: string;
  pace: string;
  status: "done" | "planned" | "skipped";
  low?: boolean;
  detail?: {
    stats: { label: string; value: string; unit?: string }[];
    zones: { z: string; label: string; pct: number; color: string }[];
    splits: { km: number; pace: string; zone: string; w: number }[];
    trimp?: number;
    confidence: "alta" | "baixa";
  };
};

const featuredDetail = {
  stats: [
    { label: "Distância", value: "16,2", unit: "km" },
    { label: "Tempo", value: "1:28", unit: "h" },
    { label: "Pace", value: "5:29", unit: "/km" },
    { label: "hrTSS", value: "118" },
  ],
  zones,
  splits: [
    { km: 1, pace: "5:42", zone: "#17B26A", w: 60 },
    { km: 2, pace: "5:38", zone: "#17B26A", w: 64 },
    { km: 3, pace: "5:29", zone: "#17B26A", w: 72 },
    { km: 4, pace: "5:24", zone: "#17B26A", w: 78 },
    { km: 5, pace: "5:31", zone: "#17B26A", w: 71 },
    { km: 6, pace: "5:12", zone: "#F5C518", w: 92 },
    { km: 7, pace: "5:18", zone: "#F5C518", w: 86 },
    { km: 8, pace: "5:22", zone: "#17B26A", w: 80 },
    { km: 9, pace: "5:48", zone: "#17B26A", w: 55 },
  ],
  trimp: 142,
  confidence: "alta" as const,
};

const sessions: Session[] = [
  {
    id: "longao-28-6", date: "Dom, 28/6", title: "Longão de domingo", dist: "16,2 km", pace: "5:29/km",
    status: "done", detail: featuredDetail,
  },
  {
    id: "hoje", date: "Hoje", title: "Rodado moderado", dist: "planejado", pace: "8 km", status: "planned",
  },
  {
    id: "forca-2-7", date: "Qui, 2/7", title: "Força · full body", dist: "40 min", pace: "—", status: "skipped",
  },
  {
    id: "facil-1-7", date: "Qua, 1/7", title: "Rodado fácil", dist: "6,1 km", pace: "5:52/km",
    status: "done", low: true,
    detail: {
      stats: [
        { label: "Distância", value: "6,1", unit: "km" },
        { label: "Tempo", value: "36", unit: "min" },
        { label: "Pace", value: "5:52", unit: "/km" },
        { label: "hrTSS", value: "42" },
      ],
      zones: [
        { z: "Z1", label: "Recuperação", pct: 15, color: "#3FA9F5" },
        { z: "Z2", label: "Endurance", pct: 78, color: "#17B26A" },
        { z: "Z3", label: "Tempo", pct: 5, color: "#F5C518" },
        { z: "Z4", label: "Limiar", pct: 2, color: "#FF7A1F" },
        { z: "Z5", label: "Anaeróbico", pct: 0, color: "#E02749" },
      ],
      splits: [
        { km: 1, pace: "6:02", zone: "#17B26A", w: 45 },
        { km: 2, pace: "5:55", zone: "#17B26A", w: 52 },
        { km: 3, pace: "5:48", zone: "#17B26A", w: 58 },
        { km: 4, pace: "5:50", zone: "#17B26A", w: 56 },
        { km: 5, pace: "5:52", zone: "#17B26A", w: 54 },
        { km: 6, pace: "5:44", zone: "#17B26A", w: 62 },
      ],
      trimp: 58,
      confidence: "baixa",
    },
  },
  {
    id: "tiros-30-6", date: "Ter, 30/6", title: "Tiros 6×800m", dist: "9,4 km", pace: "4:38/km",
    status: "done",
    detail: {
      stats: [
        { label: "Distância", value: "9,4", unit: "km" },
        { label: "Tempo", value: "48", unit: "min" },
        { label: "Pace", value: "4:38", unit: "/km" },
        { label: "hrTSS", value: "96" },
      ],
      zones: [
        { z: "Z1", label: "Recuperação", pct: 22, color: "#3FA9F5" },
        { z: "Z2", label: "Endurance", pct: 28, color: "#17B26A" },
        { z: "Z3", label: "Tempo", pct: 12, color: "#F5C518" },
        { z: "Z4", label: "Limiar", pct: 30, color: "#FF7A1F" },
        { z: "Z5", label: "Anaeróbico", pct: 8, color: "#E02749" },
      ],
      splits: [
        { km: 1, pace: "5:20", zone: "#17B26A", w: 55 },
        { km: 2, pace: "4:22", zone: "#FF7A1F", w: 96 },
        { km: 3, pace: "5:10", zone: "#17B26A", w: 60 },
        { km: 4, pace: "4:18", zone: "#FF7A1F", w: 98 },
        { km: 5, pace: "5:12", zone: "#17B26A", w: 58 },
        { km: 6, pace: "4:20", zone: "#FF7A1F", w: 97 },
        { km: 7, pace: "5:05", zone: "#17B26A", w: 62 },
        { km: 8, pace: "4:24", zone: "#FF7A1F", w: 94 },
        { km: 9, pace: "5:40", zone: "#17B26A", w: 48 },
      ],
      trimp: 128,
      confidence: "alta",
    },
  },
];

export function Treinos() {
  const [expandedId, setExpandedId] = useState<string | null>("longao-28-6");

  return (
    <div className="space-y-4 px-5 pb-6">
      <header className="pt-4">
        <p className="label-cap text-muted-foreground">Histórico</p>
        <h1 className="font-display text-[28px] font-black leading-tight text-foreground">Suas sessões</h1>
      </header>

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

      <div>
        <span className="label-cap px-1 text-muted-foreground">Sessões recentes</span>
        <div className="mt-2 space-y-2">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              expanded={expandedId === s.id}
              onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session: s, expanded, onToggle }: { session: Session; expanded: boolean; onToggle: () => void }) {
  const clickable = !!s.detail;
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface-alt"
      style={{ opacity: s.low ? 0.75 : 1 }}
    >
      <button
        onClick={clickable ? onToggle : undefined}
        disabled={!clickable}
        className="flex w-full items-center gap-3 p-3 text-left disabled:cursor-default"
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
        {clickable && (
          <ChevronDown
            size={14}
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {expanded && s.detail && <SessionDetail detail={s.detail} low={s.low} />}
    </div>
  );
}

function SessionDetail({ detail, low }: { detail: NonNullable<Session["detail"]>; low?: boolean }) {
  return (
    <div className="space-y-4 border-t border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        {detail.confidence === "alta" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
            <ShieldCheck size={12} /> Alta confiança
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-bold text-warning">
            <AlertTriangle size={12} /> Baixa confiança
          </span>
        )}
        {detail.trimp && (
          <span className="text-[11px] tabular text-muted-foreground">TRIMP {detail.trimp}</span>
        )}
      </div>

      {low && (
        <div
          className="rounded-lg border p-2.5 text-[12px]"
          style={{
            background: "color-mix(in oklab, var(--color-warning) 10%, transparent)",
            borderColor: "color-mix(in oklab, var(--color-warning) 35%, transparent)",
          }}
        >
          <p className="font-bold text-warning">⚠ Dado de baixa confiança</p>
          <p className="mt-0.5 text-muted-foreground">Sinal de FC intermitente durante a sessão. Métricas derivadas podem estar imprecisas.</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {detail.stats.map((s) => (
          <BigStat key={s.label} label={s.label} value={s.value} unit={s.unit} />
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label-cap text-muted-foreground">Distribuição por zona</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
          {detail.zones.map((z) => (
            <div key={z.z} style={{ width: `${z.pct}%`, background: z.color }} title={`${z.z} ${z.pct}%`} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-1.5">
          {detail.zones.map((z) => (
            <div key={z.z} className="flex items-center gap-2 text-[12px]">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: z.color }} />
              <span className="font-bold text-foreground">{z.z}</span>
              <span className="text-muted-foreground">{z.label}</span>
              <span className="ml-auto font-bold tabular text-foreground">{z.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="label-cap text-muted-foreground">Splits por km</span>
        <div className="mt-2 space-y-1">
          {detail.splits.map((s) => (
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

function LoadChart() {
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
      <line x1="0" x2={w} y1={zeroY} y2={zeroY} stroke="var(--color-border)" strokeDasharray="2 3" />
      <path d={`${ctlPath} L${w},${h} L0,${h} Z`} fill="var(--color-pulse)" opacity="0.18" />
      <path d={ctlPath} stroke="var(--color-pulse)" strokeWidth="2" fill="none" />
      <path d={atlPath} stroke="var(--color-muted-foreground)" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
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
