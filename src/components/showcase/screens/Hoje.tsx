import { useState } from "react";
import { AlertTriangle, ArrowRight, Heart, Moon, Activity, Loader2 } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { computeReadiness } from "@/lib/metodologia";

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
        <circle cx="90" cy="90" r={r} fill="none" stroke="url(#arc-grad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${c * 0.75 * pct} ${c}`} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-[56px] font-black leading-none text-foreground">{score}</span>
        <span className="label-cap mt-1 text-muted-foreground">Prontidão</span>
      </div>
    </div>
  );
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export function Hoje() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const qc = useQueryClient();
  const [acwrOpen, setAcwrOpen] = useState(false);
  const [wellnessOpen, setWellnessOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
      return data;
    },
  });

  const { data: wellness } = useQuery({
    queryKey: ["wellness-today", uid],
    queryFn: async () => {
      const { data } = await supabase.from("wellness").select("*").eq("user_id", uid).eq("day", todayStr()).maybeSingle();
      return data;
    },
  });

  const { data: daily } = useQuery({
    queryKey: ["daily-latest", uid],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_load")
        .select("*")
        .eq("user_id", uid)
        .order("day", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: todayPlan } = useQuery({
    queryKey: ["plan-today", uid],
    queryFn: async () => {
      const { data } = await supabase
        .from("planned_workouts")
        .select("*")
        .eq("user_id", uid)
        .eq("day", todayStr())
        .maybeSingle();
      return data;
    },
  });

  const readiness = wellness?.readiness ?? computeReadiness({
    hrvRmssd: wellness?.hrv_rmssd,
    hrvBaseline: wellness?.hrv_baseline ?? profile?.hr_max ? 60 : null,
    sleepHours: wellness?.sleep_s ? wellness.sleep_s / 3600 : null,
    hrRest: wellness?.hr_rest_bpm,
    hrRestBaseline: profile?.hr_rest,
  }).score;

  const dateFmt = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" });
  const firstName = profile?.display_name?.split(" ")[0] ?? "atleta";
  const acwr = daily?.acwr ?? null;
  const acwrAlert = daily?.acwr_alert ?? false;

  return (
    <div className="space-y-4 px-5 pb-6">
      <header className="pt-4">
        <p className="label-cap text-muted-foreground">{dateFmt}</p>
        <h1 className="font-display text-[32px] font-black leading-tight text-foreground">Bora, {firstName}.</h1>
        <p className="text-[15px] text-muted-foreground">
          {daily ? <>CTL {daily.ctl.toFixed(0)} · TSB {daily.tsb.toFixed(0)}</> : "Sem dados de carga ainda."}
        </p>
      </header>

      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <span className="label-cap text-muted-foreground">Você hoje</span>
          {wellness ? (
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">REGISTRADO</span>
          ) : (
            <button onClick={() => setWellnessOpen(true)} className="rounded-full bg-pulse/15 px-2.5 py-1 text-[11px] font-bold text-pulse">
              REGISTRAR
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-4">
          <ReadinessArc score={readiness} />
          <div className="flex-1 space-y-3">
            <MetricRow Icon={Heart} label="HRV" value={wellness?.hrv_rmssd ? String(wellness.hrv_rmssd) : "—"} unit="ms" />
            <MetricRow Icon={Moon} label="Sono" value={wellness?.sleep_s ? formatSleep(wellness.sleep_s) : "—"} />
            <MetricRow Icon={Activity} label="FC repouso" value={wellness?.hr_rest_bpm ? String(wellness.hr_rest_bpm) : "—"} unit="bpm" />
          </div>
        </div>
        {!wellness && (
          <button onClick={() => setWellnessOpen(true)} className="mt-3 w-full rounded-full border border-dashed border-border py-2.5 text-[13px] font-semibold text-muted-foreground hover:border-ignite hover:text-ignite">
            + Registrar sono, HRV e FC repouso
          </button>
        )}
      </div>

      {acwrAlert && acwr && (
        <div
          className="flex items-start gap-3 rounded-2xl border p-4"
          style={{ background: "color-mix(in oklab, var(--color-warning) 12%, transparent)", borderColor: "color-mix(in oklab, var(--color-warning) 40%, transparent)" }}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-warning)" }}>
            <AlertTriangle size={18} className="text-[#0B0F14]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-foreground">Carga aguda fora da zona segura</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              ACWR <span className="tabular">{acwr.toFixed(2)}</span>. {acwr > 1.3 ? "Vamos segurar o volume esta semana." : "Volume abaixo — cuidado com o destreinamento."}
            </p>
            <button onClick={() => setAcwrOpen(true)} className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-warning">
              Entender <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="p-5">
          <span className="label-cap text-pulse">Treino de hoje</span>
          {todayPlan ? (
            <>
              <h3 className="mt-1 font-display text-[21px] font-extrabold text-foreground">{todayPlan.title}</h3>
              <p className="text-[13px] text-muted-foreground">{todayPlan.description ?? "Bora."}</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Distância" value={todayPlan.distance_m ? (todayPlan.distance_m / 1000).toFixed(0) : "—"} unit="km" />
                <Stat label="Duração" value={todayPlan.duration_s ? Math.round(todayPlan.duration_s / 60).toString() : "—"} unit="min" />
                <Stat label="Zona" value={todayPlan.target_zone ?? "—"} unit="" />
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-1 font-display text-[21px] font-extrabold text-foreground">Sem treino planejado</h3>
              <p className="text-[13px] text-muted-foreground">Crie um plano ou registre um treino livre em Treinos.</p>
            </>
          )}
        </div>
      </div>

      <BottomSheet open={acwrOpen} onClose={() => setAcwrOpen(false)} title="Por que este alerta">
        <div className="space-y-3 text-[14px] text-foreground">
          <p><b>ACWR</b> = carga aguda 7d ÷ carga crônica 28d. Fora de <b className="tabular">0,8–1,3</b> a chance de lesão ou destreino sobe.</p>
          <div className="rounded-xl bg-background p-3">
            <p className="label-cap text-muted-foreground">Seu número</p>
            <p className="tabular mt-1 font-display text-2xl font-black">{acwr?.toFixed(2)}</p>
          </div>
          <p className="text-muted-foreground">Ajuste sugerido: {acwr && acwr > 1.3 ? "-20% de volume nos próximos 5 dias." : "aumente ~10% de volume esta semana, sem intensidade nova."}</p>
        </div>
      </BottomSheet>

      <WellnessSheet
        open={wellnessOpen}
        onClose={() => setWellnessOpen(false)}
        userId={uid}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["wellness-today", uid] }); setWellnessOpen(false); }}
      />
    </div>
  );
}

function WellnessSheet({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const [hrv, setHrv] = useState("");
  const [sleep, setSleep] = useState("");
  const [hrRest, setHrRest] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const readiness = computeReadiness({
        hrvRmssd: hrv ? Number(hrv) : null,
        hrvBaseline: 60,
        sleepHours: sleep ? Number(sleep) : null,
        hrRest: hrRest ? Number(hrRest) : null,
        hrRestBaseline: 55,
      }).score;
      await supabase.from("wellness").upsert({
        user_id: userId,
        day: todayStr(),
        hrv_rmssd: hrv ? Number(hrv) : null,
        hrv_baseline: 60,
        sleep_s: sleep ? Math.round(Number(sleep) * 3600) : null,
        hr_rest_bpm: hrRest ? Number(hrRest) : null,
        readiness,
      }, { onConflict: "user_id,day" });
    },
    onSuccess: onSaved,
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Como você acordou">
      <div className="space-y-3">
        <NumberField label="HRV (ms, RMSSD)" value={hrv} onChange={setHrv} placeholder="60" />
        <NumberField label="Sono (horas)" value={sleep} onChange={setSleep} placeholder="7.5" step="0.1" />
        <NumberField label="FC repouso (bpm)" value={hrRest} onChange={setHrRest} placeholder="52" />
        <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-ignite mt-3 flex w-full items-center justify-center gap-2 py-3 text-[14px]">
          {save.isPending && <Loader2 size={14} className="animate-spin" />} Salvar
        </button>
        <p className="text-center text-[11px] text-muted-foreground">Readiness = combinação simples do desvio de HRV, sono e FC repouso vs baseline.</p>
      </div>
    </BottomSheet>
  );
}

export function NumberField({ label, value, onChange, placeholder, step }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; step?: string }) {
  return (
    <label className="block">
      <span className="label-cap text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        step={step}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] tabular text-foreground focus:border-ignite focus:outline-none"
      />
    </label>
  );
}

function formatSleep(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function MetricRow({ Icon, label, value, unit }: { Icon: typeof Heart; label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-surface">
        <Icon size={16} className="text-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="label-cap text-muted-foreground">{label}</p>
        <p className="font-display text-[18px] font-extrabold text-foreground tabular">
          {value}{unit && <span className="text-[13px] font-semibold text-muted-foreground"> {unit}</span>}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="label-cap text-muted-foreground">{label}</p>
      <p className="font-display text-[22px] font-black text-foreground tabular">
        {value}<span className="text-[12px] font-semibold text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
