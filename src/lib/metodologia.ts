// Metodologia canônica Start Running — motor determinístico compartilhado.
// Grave sempre `METHODOLOGY_VERSION` em toda tabela derivada.

export const METHODOLOGY_VERSION = "engine-2026.07-preview-ts";

// ------------------------- Zonas ----------------------------

export type ZoneAnchor = "pct_lthr" | "pct_hrmax" | "karvonen";

export type Zone = { label: string; low: number; high: number; color: string };

const ZONE_LABELS_5 = ["Z1", "Z2", "Z3", "Z4", "Z5"];
const ZONE_LABELS_3 = ["Fácil", "Moderado", "Forte"];
const ZONE_LABELS_7 = ["Z1", "Z2", "Z3", "Z4a", "Z4b", "Z5a", "Z5b"];
const ZONE_COLORS = ["#3FA9F5", "#17B26A", "#F5C518", "#FF7A1F", "#E02749", "#B01E3B", "#7A1229"];

// Limites em % (do LTHR ou FCmáx). Um limite fecha uma zona e abre a próxima.
const PCT_LTHR_5 = [55, 81, 90, 96, 103]; // 5 zonas => 4 divisores + teto simbólico
const PCT_HRMAX_5 = [50, 60, 70, 80, 90];

const PCT_LTHR_3 = [81, 96, 110];
const PCT_LTHR_7 = [55, 75, 85, 92, 97, 102, 110];

const PCT_HRMAX_3 = [60, 80, 100];
const PCT_HRMAX_7 = [50, 65, 75, 82, 88, 94, 100];

export function computeZones(
  model: 3 | 5 | 7,
  anchor: ZoneAnchor,
  hrMax: number,
  lthr: number,
  hrRest = 55,
): Zone[] {
  const pcts =
    anchor === "pct_hrmax"
      ? model === 3 ? PCT_HRMAX_3 : model === 7 ? PCT_HRMAX_7 : PCT_HRMAX_5
      : model === 3 ? PCT_LTHR_3 : model === 7 ? PCT_LTHR_7 : PCT_LTHR_5;

  const labels = model === 3 ? ZONE_LABELS_3 : model === 7 ? ZONE_LABELS_7 : ZONE_LABELS_5;

  const bpm = (pct: number) => {
    if (anchor === "karvonen") return Math.round(hrRest + (pct / 100) * (hrMax - hrRest));
    if (anchor === "pct_hrmax") return Math.round((pct / 100) * hrMax);
    return Math.round((pct / 100) * lthr);
  };

  const bounds = pcts.map(bpm);
  const zones: Zone[] = [];
  const floor = anchor === "karvonen" ? hrRest : Math.round(0.5 * (anchor === "pct_hrmax" ? hrMax : lthr));
  let prev = floor;
  for (let i = 0; i < model; i++) {
    zones.push({
      label: labels[i],
      low: prev,
      high: bounds[i],
      color: ZONE_COLORS[i] ?? "#8A99AB",
    });
    prev = bounds[i];
  }
  return zones;
}

// Retorna o índice da zona (0-based) para uma FC média.
export function zoneIndexForHr(hr: number, zones: Zone[]): number {
  for (let i = 0; i < zones.length; i++) {
    if (hr <= zones[i].high) return i;
  }
  return zones.length - 1;
}

// ---------------------- Cargas de sessão ---------------------

export function srpeLoad(rpe0to10: number, minutes: number): number {
  return Math.max(0, rpe0to10) * Math.max(0, minutes);
}

// TRIMP (Banister) aproximado pela FC média
export function trimpFromAvgHr(
  minutes: number,
  avgHr: number,
  hrRest: number,
  hrMax: number,
  sex: "M" | "F" | "X" = "M",
): number | null {
  if (!avgHr || !hrRest || !hrMax || hrMax <= hrRest) return null;
  const hrr = (avgHr - hrRest) / (hrMax - hrRest);
  if (hrr <= 0) return 0;
  const k = sex === "F" ? 1.67 : 1.92;
  return +(minutes * hrr * 0.64 * Math.exp(k * hrr)).toFixed(1);
}

// hrTSS = horas × (FCmédia/LTHR)² × 100
export function hrTss(minutes: number, avgHr: number, lthr: number): number | null {
  if (!avgHr || !lthr) return null;
  return +((minutes / 60) * Math.pow(avgHr / lthr, 2) * 100).toFixed(1);
}

// rTSS = horas × (velocidade/velocidade_limiar)² × 100
// velocity = 1000 / pace_s_per_km (m/s abstrato — ratio equivalente ao ratio de paces invertido)
export function rTss(minutes: number, avgPaceSPerKm: number, thresholdPaceSPerKm: number): number | null {
  if (!avgPaceSPerKm || !thresholdPaceSPerKm) return null;
  const vel = 1 / avgPaceSPerKm;
  const velT = 1 / thresholdPaceSPerKm;
  return +((minutes / 60) * Math.pow(vel / velT, 2) * 100).toFixed(1);
}

// Hierarquia: hrTSS > rTSS > TRIMP > sRPE
export type LoadComputeInput = {
  elapsedS: number;
  avgHr?: number | null;
  avgPaceSPerKm?: number | null;
  srpe?: number | null; // 0-10
  profile: {
    hrRest?: number | null;
    hrMax?: number | null;
    lthr?: number | null;
    thresholdPaceSPerKm?: number | null;
    sex?: string | null;
  };
};

export type LoadComputeOutput = {
  minutes: number;
  trimp: number | null;
  hrtss: number | null;
  rtss: number | null;
  srpeLoad: number | null;
  sessionLoad: number;
  confidence: number; // 0..1
  source: "hrtss" | "rtss" | "trimp" | "srpe";
};

export function computeLoads(input: LoadComputeInput): LoadComputeOutput {
  const minutes = input.elapsedS / 60;
  const sex = (input.profile.sex === "F" ? "F" : input.profile.sex === "X" ? "X" : "M") as "M" | "F" | "X";
  const trimp = input.avgHr && input.profile.hrRest && input.profile.hrMax
    ? trimpFromAvgHr(minutes, input.avgHr, input.profile.hrRest, input.profile.hrMax, sex)
    : null;
  const hrtss = input.avgHr && input.profile.lthr ? hrTss(minutes, input.avgHr, input.profile.lthr) : null;
  const rtss = input.avgPaceSPerKm && input.profile.thresholdPaceSPerKm
    ? rTss(minutes, input.avgPaceSPerKm, input.profile.thresholdPaceSPerKm)
    : null;
  const srpeL = input.srpe != null ? srpeLoad(input.srpe, minutes) : null;

  let source: LoadComputeOutput["source"] = "srpe";
  let sessionLoad = srpeL ?? 0;
  let confidence = 0.4;
  if (hrtss != null) { source = "hrtss"; sessionLoad = hrtss; confidence = 0.9; }
  else if (rtss != null) { source = "rtss"; sessionLoad = rtss; confidence = 0.8; }
  else if (trimp != null) { source = "trimp"; sessionLoad = trimp; confidence = 0.65; }

  return {
    minutes: +minutes.toFixed(1),
    trimp,
    hrtss,
    rtss,
    srpeLoad: srpeL,
    sessionLoad: +sessionLoad.toFixed(1),
    confidence,
    source,
  };
}

// ---------------------- Tempo em zona (aprox. FC média) ----------------------
// Sem série ponto a ponto: alocamos 100% do tempo à zona da FC média.
export function timeInZoneFromAvgHr(
  elapsedS: number,
  avgHr: number | null | undefined,
  zones: Zone[],
): Record<string, number> {
  const out: Record<string, number> = {};
  zones.forEach((z) => (out[z.label] = 0));
  if (!avgHr) return out;
  const idx = zoneIndexForHr(avgHr, zones);
  out[zones[idx].label] = elapsedS;
  return out;
}

// ---------------------- CTL / ATL / TSB / ACWR ----------------------

export type DailyLoadRow = {
  day: string; // YYYY-MM-DD
  daily_load: number;
  ctl: number;
  atl: number;
  tsb: number;
  acwr: number | null;
  acwr_alert: boolean;
};

// EWMA determinística: ctl += (load - ctl) / 42; atl += (load - atl) / 7
// TSB do dia = CTL_ontem - ATL_ontem; ACWR = média 7d / média 28d (janelas incluindo hoje).
export function recomputeDailyLoadSeries(
  loadsByDay: Map<string, number>, // YYYY-MM-DD -> soma de session_load do dia (0 se descanso)
  startDate: string,
  endDate: string,
): DailyLoadRow[] {
  const rows: DailyLoadRow[] = [];
  const days = enumerateDays(startDate, endDate);

  let ctl = 0;
  let atl = 0;
  const loads: number[] = [];

  for (const d of days) {
    const load = loadsByDay.get(d) ?? 0;
    const tsb = ctl - atl; // "de ontem"
    ctl += (load - ctl) / 42;
    atl += (load - atl) / 7;
    loads.push(load);

    const win7 = loads.slice(-7);
    const win28 = loads.slice(-28);
    const avg7 = win7.reduce((a, b) => a + b, 0) / Math.max(win7.length, 1);
    const avg28 = win28.reduce((a, b) => a + b, 0) / Math.max(win28.length, 1);
    const acwr = avg28 > 0 ? +(avg7 / avg28).toFixed(2) : null;
    const alert = acwr != null && (acwr < 0.8 || acwr > 1.3);

    rows.push({
      day: d,
      daily_load: +load.toFixed(1),
      ctl: +ctl.toFixed(2),
      atl: +atl.toFixed(2),
      tsb: +tsb.toFixed(2),
      acwr,
      acwr_alert: alert,
    });
  }
  return rows;
}

export function enumerateDays(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  while (d <= e) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function toDayString(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// ---------------------- Readiness ----------------------
// Combinação simples e explicável: desvios normalizados de HRV, sono e FC repouso.
export function computeReadiness(input: {
  hrvRmssd?: number | null;
  hrvBaseline?: number | null;
  sleepHours?: number | null;
  hrRest?: number | null;
  hrRestBaseline?: number | null;
}): { score: number; parts: { label: string; delta: number; weight: number }[] } {
  const parts: { label: string; delta: number; weight: number }[] = [];

  if (input.hrvRmssd && input.hrvBaseline && input.hrvBaseline > 0) {
    const d = (input.hrvRmssd - input.hrvBaseline) / input.hrvBaseline; // + é melhor
    parts.push({ label: "HRV", delta: clamp(d, -0.3, 0.3), weight: 0.5 });
  }
  if (input.sleepHours != null) {
    const d = (input.sleepHours - 7.5) / 7.5; // + é melhor
    parts.push({ label: "Sono", delta: clamp(d, -0.3, 0.3), weight: 0.35 });
  }
  if (input.hrRest && input.hrRestBaseline && input.hrRestBaseline > 0) {
    const d = -((input.hrRest - input.hrRestBaseline) / input.hrRestBaseline); // FC alta é ruim
    parts.push({ label: "FC repouso", delta: clamp(d, -0.3, 0.3), weight: 0.15 });
  }

  let weighted = 0;
  let sumW = 0;
  parts.forEach((p) => { weighted += p.delta * p.weight; sumW += p.weight; });
  const base = 70;
  const score = sumW > 0 ? Math.round(base + (weighted / sumW) * 100) : base;
  return { score: clamp(score, 0, 100), parts };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ---------------------- Format helpers ----------------------
export function formatPace(secPerKm: number | null | undefined): string {
  if (!secPerKm) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m} min`;
}

export function formatKm(m: number | null | undefined): string {
  if (!m) return "—";
  return (m / 1000).toFixed(2).replace(".", ",");
}
