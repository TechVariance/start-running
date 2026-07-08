import { useState } from "react";
import { Plus, Loader2, Trash2, ChevronDown } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { NumberField } from "./Hoje";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { computeLoads, computeZones, formatKm, formatDuration, formatPace, METHODOLOGY_VERSION, timeInZoneFromAvgHr } from "@/lib/metodologia";
import { recomputeDailyLoadForUser } from "@/lib/loadRecompute";

export function Treinos() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const [addOpen, setAddOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", uid],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, activity_metrics(*)")
        .eq("user_id", uid)
        .order("started_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("activities").delete().eq("id", id);
      await recomputeDailyLoadForUser(uid);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", uid] });
      qc.invalidateQueries({ queryKey: ["daily-latest", uid] });
      qc.invalidateQueries({ queryKey: ["daily-load", uid] });
    },
  });

  return (
    <div className="px-5 pb-6">
      <header className="flex items-end justify-between pt-4">
        <div>
          <p className="label-cap text-muted-foreground">Histórico</p>
          <h1 className="font-display text-[28px] font-black leading-tight text-foreground">Seus treinos</h1>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-ignite inline-flex items-center gap-1.5 px-4 py-2 text-[13px]">
          <Plus size={14} /> Registrar
        </button>
      </header>

      {isLoading && <div className="mt-6 grid place-items-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>}

      {!isLoading && activities && activities.length === 0 && (
        <div className="card-surface mt-6 p-8 text-center">
          <p className="text-[14px] text-muted-foreground">Nenhum treino ainda. Registre o primeiro ou carregue dados de demonstração no Perfil.</p>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {activities?.map((a) => {
          const m = a.activity_metrics?.[0];
          const isOpen = openId === a.id;
          return (
            <div key={a.id} className="card-surface overflow-hidden">
              <button onClick={() => setOpenId(isOpen ? null : a.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="label-cap text-muted-foreground">{new Date(a.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    {a.source === "demo" && <span className="rounded-full bg-pulse/15 px-2 py-0.5 text-[9px] font-bold text-pulse">DEMO</span>}
                  </div>
                  <p className="mt-0.5 font-display text-[16px] font-extrabold text-foreground">
                    {a.distance_m ? `${formatKm(a.distance_m)} km` : formatDuration(a.elapsed_s)} · {formatPace(a.avg_pace_s_per_km)}/km
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {formatDuration(a.elapsed_s)}{a.avg_hr ? ` · FC ${a.avg_hr}` : ""}{m?.session_load ? ` · ${m.session_load.toFixed(0)} TSS` : ""}
                  </p>
                </div>
                <ChevronDown size={18} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-border bg-background/60 p-4">
                  {m && (
                    <div className="grid grid-cols-4 gap-2">
                      <MiniStat label="hrTSS" value={m.hrtss?.toFixed(0) ?? "—"} />
                      <MiniStat label="rTSS" value={m.rtss?.toFixed(0) ?? "—"} />
                      <MiniStat label="TRIMP" value={m.trimp?.toFixed(0) ?? "—"} />
                      <MiniStat label="sRPE" value={m.srpe_load?.toFixed(0) ?? "—"} />
                    </div>
                  )}
                  {m?.time_in_zone && <TimeInZone tiz={m.time_in_zone as Record<string, number>} total={a.elapsed_s} />}
                  {m && (
                    <p className="text-[11px] text-muted-foreground">
                      Carga da sessão: <b className="text-foreground tabular">{m.session_load?.toFixed(0)}</b> · confiança {(Number(m.confidence) * 100).toFixed(0)}%
                    </p>
                  )}
                  {a.notes && <p className="text-[13px] text-muted-foreground">{a.notes}</p>}
                  <button
                    onClick={() => del.mutate(a.id)}
                    disabled={del.isPending}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-danger hover:underline"
                  >
                    <Trash2 size={12} /> Excluir treino
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        userId={uid}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["activities", uid] });
          qc.invalidateQueries({ queryKey: ["daily-latest", uid] });
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function TimeInZone({ tiz, total }: { tiz: Record<string, number>; total: number }) {
  const entries = Object.entries(tiz).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  const colors: Record<string, string> = { Z1: "#3FA9F5", Z2: "#17B26A", Z3: "#F5C518", Z4: "#FF7A1F", Z5: "#E02749", Fácil: "#17B26A", Moderado: "#F5C518", Forte: "#E02749" };
  return (
    <div>
      <p className="label-cap mb-1 text-muted-foreground">Tempo em zona</p>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-border">
        {entries.map(([k, v]) => (
          <div key={k} style={{ width: `${(v / total) * 100}%`, background: colors[k] ?? "#8A99AB" }} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
        {entries.map(([k, v]) => (
          <span key={k} className="tabular"><span style={{ color: colors[k] ?? undefined }}>■</span> {k} {Math.round((v / total) * 100)}%</span>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2 text-center">
      <p className="label-cap text-[9px] text-muted-foreground">{label}</p>
      <p className="font-display text-[16px] font-black text-foreground tabular">{value}</p>
    </div>
  );
}

function AddSheet({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [rpe, setRpe] = useState(5);
  const [avgHr, setAvgHr] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      setErr(null);
      const elapsedS = Math.round(Number(duration) * 60);
      if (!elapsedS) throw new Error("Duração é obrigatória");
      const distanceM = distance ? Math.round(Number(distance) * 1000) : null;
      const avgHrN = avgHr ? Number(avgHr) : null;
      const paceS = distanceM ? Math.round((elapsedS / distanceM) * 1000) : null;

      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      const profile = prof ?? { hr_rest: 55, hr_max: 190, lthr: 168, threshold_pace_s_per_km: 300, sex: "M", zone_model: 5, zone_anchor: "pct_lthr" };

      const loads = computeLoads({
        elapsedS,
        avgHr: avgHrN,
        avgPaceSPerKm: paceS,
        srpe: rpe,
        profile: {
          hrRest: profile.hr_rest,
          hrMax: profile.hr_max,
          lthr: profile.lthr,
          thresholdPaceSPerKm: profile.threshold_pace_s_per_km,
          sex: profile.sex,
        },
      });

      const zones = computeZones(
        (profile.zone_model as 3 | 5 | 7) ?? 5,
        (profile.zone_anchor as "pct_lthr" | "pct_hrmax" | "karvonen") ?? "pct_lthr",
        profile.hr_max ?? 190,
        profile.lthr ?? 168,
        profile.hr_rest ?? 55,
      );
      const tiz = timeInZoneFromAvgHr(elapsedS, avgHrN, zones);

      const { data: created, error } = await supabase.from("activities").insert({
        user_id: userId,
        started_at: new Date(date + "T08:00:00").toISOString(),
        source: "manual",
        status: "concluido",
        elapsed_s: elapsedS,
        distance_m: distanceM,
        avg_pace_s_per_km: paceS,
        avg_hr: avgHrN,
        srpe: rpe,
        notes: notes || null,
      }).select("id").single();
      if (error) throw error;

      await supabase.from("activity_metrics").insert({
        activity_id: created.id,
        user_id: userId,
        methodology_version: METHODOLOGY_VERSION,
        confidence: loads.confidence,
        time_in_zone: tiz,
        trimp: loads.trimp,
        hrtss: loads.hrtss,
        rtss: loads.rtss,
        srpe_load: loads.srpeLoad,
        session_load: loads.sessionLoad,
      });

      await recomputeDailyLoadForUser(userId);
    },
    onSuccess: () => {
      setDuration(""); setDistance(""); setAvgHr(""); setNotes(""); setRpe(5);
      onSaved();
    },
    onError: (e: unknown) => setErr(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Registrar treino">
      <div className="space-y-3">
        <label className="block">
          <span className="label-cap text-muted-foreground">Data</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] tabular text-foreground focus:border-ignite focus:outline-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Duração (min)" value={duration} onChange={setDuration} placeholder="45" />
          <NumberField label="Distância (km)" value={distance} onChange={setDistance} placeholder="8" step="0.01" />
        </div>
        <NumberField label="FC média (bpm) — opcional" value={avgHr} onChange={setAvgHr} placeholder="145" />

        <label className="block">
          <span className="label-cap text-muted-foreground">Percepção de esforço (RPE 0–10): <b className="tabular text-foreground">{rpe}</b></span>
          <input type="range" min={0} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="mt-2 w-full accent-ignite" />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Fácil</span><span>Duro</span><span>Máximo</span>
          </div>
        </label>

        <label className="block">
          <span className="label-cap text-muted-foreground">Notas</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground focus:border-ignite focus:outline-none" placeholder="Como foi?" />
        </label>

        {err && <p className="text-[13px] text-danger">{err}</p>}

        <button onClick={() => save.mutate()} disabled={save.isPending || !duration} className="btn-ignite mt-2 flex w-full items-center justify-center gap-2 py-3 text-[14px] disabled:opacity-60">
          {save.isPending && <Loader2 size={14} className="animate-spin" />} Salvar treino
        </button>
      </div>
    </BottomSheet>
  );
}
