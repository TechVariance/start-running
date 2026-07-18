import { useState } from "react";
import { Plus, Loader2, Trash2, ChevronDown, Waves, Dumbbell, PersonStanding, Target, X } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { NumberField } from "./Hoje";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  computeLoads,
  computeZones,
  computeSwimLoads,
  computeSwimZones,
  computeStrengthLoads,
  cssFromTest,
  tonnageFromSets,
  formatKm,
  formatDuration,
  formatPace,
  METHODOLOGY_VERSION,
  timeInZoneFromAvgHr,
} from "@/lib/metodologia";
import { recomputeDailyLoadForUser } from "@/lib/loadRecompute";

type Modality = "run" | "swim" | "strength";

type StrengthSetRow = {
  id: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  rpe: number | null;
  exercises: { name: string; muscle_group: string } | null;
};

const MODALITIES: { id: Modality; label: string; Icon: typeof PersonStanding }[] = [
  { id: "run", label: "Corrida", Icon: PersonStanding },
  { id: "swim", label: "Natação", Icon: Waves },
  { id: "strength", label: "Musculação", Icon: Dumbbell },
];

export function Treinos() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const [modality, setModality] = useState<Modality>("run");
  const [addOpen, setAddOpen] = useState(false);
  const [cssOpen, setCssOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
      return data;
    },
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", uid, modality],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, activity_metrics(*), strength_sets(*, exercises(name, muscle_group))")
        .eq("user_id", uid)
        .eq("modality", modality)
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
      qc.invalidateQueries({ queryKey: ["activities", uid, modality] });
      qc.invalidateQueries({ queryKey: ["daily-latest", uid] });
      qc.invalidateQueries({ queryKey: ["daily-load", uid] });
    },
  });

  const swimZones = profile?.css_pace_s_per_100m ? computeSwimZones(profile.css_pace_s_per_100m) : null;

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

      <div className="mt-4 grid grid-cols-3 gap-2">
        {MODALITIES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setModality(m.id); setOpenId(null); }}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12px] font-bold transition ${
              modality === m.id ? "border-ignite bg-ignite/10 text-ignite" : "border-border text-muted-foreground"
            }`}
          >
            <m.Icon size={14} /> {m.label}
          </button>
        ))}
      </div>

      {modality === "swim" && (
        <div className="card-surface mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-cap text-muted-foreground">CSS (velocidade crítica)</p>
              <p className="font-display text-[20px] font-black text-foreground tabular">
                {profile?.css_pace_s_per_100m ? `${formatPace(profile.css_pace_s_per_100m)}/100m` : "Sem teste ainda"}
              </p>
              {profile?.css_pool_length_m && (
                <p className="text-[11px] text-muted-foreground">Piscina {profile.css_pool_length_m}m</p>
              )}
            </div>
            <button onClick={() => setCssOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-bold text-muted-foreground hover:border-ignite hover:text-ignite">
              <Target size={12} /> Testar CSS
            </button>
          </div>
          {swimZones && (
            <div className="mt-3 space-y-1.5">
              {swimZones.map((z) => (
                <div key={z.label} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: z.color }} />
                  <span className="w-32 text-[11px] font-bold text-foreground">{z.label}</span>
                  <span className="tabular text-[11px] text-muted-foreground">{formatPace(z.low)}–{formatPace(z.high)}/100m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && <div className="mt-6 grid place-items-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>}

      {!isLoading && activities && activities.length === 0 && (
        <div className="card-surface mt-6 p-8 text-center">
          <p className="text-[14px] text-muted-foreground">Nenhum treino nesta modalidade ainda. Registre o primeiro ou carregue dados de demonstração no Perfil.</p>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {activities?.map((a) => {
          const m = a.activity_metrics?.[0];
          const strengthSets = (a.strength_sets ?? []) as unknown as StrengthSetRow[];
          const isOpen = openId === a.id;
          return (
            <div key={a.id} className="card-surface overflow-hidden">
              <button onClick={() => setOpenId(isOpen ? null : a.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="label-cap text-muted-foreground">{new Date(a.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    {a.source === "demo" && <span className="rounded-full bg-pulse/15 px-2 py-0.5 text-[9px] font-bold text-pulse">DEMO</span>}
                  </div>
                  {modality === "run" && (
                    <>
                      <p className="mt-0.5 font-display text-[16px] font-extrabold text-foreground">
                        {a.distance_m ? `${formatKm(a.distance_m)} km` : formatDuration(a.elapsed_s)} · {formatPace(a.avg_pace_s_per_km)}/km
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {formatDuration(a.elapsed_s)}{a.avg_hr ? ` · FC ${a.avg_hr}` : ""}{m?.session_load ? ` · ${m.session_load.toFixed(0)} TSS` : ""}
                      </p>
                    </>
                  )}
                  {modality === "swim" && (
                    <>
                      <p className="mt-0.5 font-display text-[16px] font-extrabold text-foreground">
                        {a.distance_m ? `${a.distance_m} m` : formatDuration(a.elapsed_s)} · {formatPace(m?.avg_pace_s_per_100m)}/100m
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {formatDuration(a.elapsed_s)}{a.stroke ? ` · ${a.stroke}` : ""}{a.pool_length_m ? ` · piscina ${a.pool_length_m}m` : ""}{m?.session_load ? ` · ${m.session_load.toFixed(0)} carga` : ""}
                      </p>
                    </>
                  )}
                  {modality === "strength" && (
                    <>
                      <p className="mt-0.5 font-display text-[16px] font-extrabold text-foreground">
                        {strengthSets.length} séries · {formatDuration(a.elapsed_s)}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {m?.tonnage_kg ? `${m.tonnage_kg.toFixed(0)} kg tonelagem` : ""}{a.srpe ? ` · RPE ${a.srpe}` : ""}{m?.session_load ? ` · ${m.session_load.toFixed(0)} carga` : ""}
                      </p>
                    </>
                  )}
                </div>
                <ChevronDown size={18} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-border bg-background/60 p-4">
                  {modality === "run" && m && (
                    <div className="grid grid-cols-4 gap-2">
                      <MiniStat label="hrTSS" value={m.hrtss?.toFixed(0) ?? "—"} />
                      <MiniStat label="rTSS" value={m.rtss?.toFixed(0) ?? "—"} />
                      <MiniStat label="TRIMP" value={m.trimp?.toFixed(0) ?? "—"} />
                      <MiniStat label="sRPE" value={m.srpe_load?.toFixed(0) ?? "—"} />
                    </div>
                  )}
                  {modality === "swim" && m && (
                    <div className="grid grid-cols-3 gap-2">
                      <MiniStat label="hrTSS" value={m.hrtss?.toFixed(0) ?? "—"} />
                      <MiniStat label="sTSS" value={m.stss?.toFixed(0) ?? "—"} />
                      <MiniStat label="sRPE" value={m.srpe_load?.toFixed(0) ?? "—"} />
                    </div>
                  )}
                  {modality === "strength" && strengthSets.length > 0 && (
                    <StrengthSetsSummary sets={strengthSets} />
                  )}
                  {modality === "run" && m?.time_in_zone && <TimeInZone tiz={m.time_in_zone as Record<string, number>} total={a.elapsed_s} />}
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

      {modality === "run" && (
        <AddSheetRun
          open={addOpen}
          onClose={() => setAddOpen(false)}
          userId={uid}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["activities", uid, modality] });
            qc.invalidateQueries({ queryKey: ["daily-latest", uid] });
            setAddOpen(false);
          }}
        />
      )}
      {modality === "swim" && (
        <AddSheetSwim
          open={addOpen}
          onClose={() => setAddOpen(false)}
          userId={uid}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["activities", uid, modality] });
            qc.invalidateQueries({ queryKey: ["daily-latest", uid] });
            setAddOpen(false);
          }}
        />
      )}
      {modality === "strength" && (
        <AddSheetStrength
          open={addOpen}
          onClose={() => setAddOpen(false)}
          userId={uid}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["activities", uid, modality] });
            qc.invalidateQueries({ queryKey: ["daily-latest", uid] });
            setAddOpen(false);
          }}
        />
      )}

      <CssTestSheet
        open={cssOpen}
        onClose={() => setCssOpen(false)}
        userId={uid}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["profile", uid] });
          setCssOpen(false);
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

function StrengthSetsSummary({ sets }: { sets: StrengthSetRow[] }) {
  const byExercise = new Map<string, typeof sets>();
  for (const s of sets) {
    const key = s.exercises?.name ?? "Exercício";
    byExercise.set(key, [...(byExercise.get(key) ?? []), s]);
  }
  return (
    <div className="space-y-2">
      {[...byExercise.entries()].map(([name, exSets]) => (
        <div key={name} className="rounded-lg border border-border bg-surface p-2.5">
          <p className="text-[13px] font-bold text-foreground">{name}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {exSets
              .sort((a, b) => a.set_number - b.set_number)
              .map((s) => (
                <span key={s.id} className="tabular rounded-md bg-background px-2 py-1 text-[11px] text-muted-foreground">
                  {s.reps}×{s.weight_kg}kg{s.rpe ? ` @${s.rpe}` : ""}
                </span>
              ))}
          </div>
        </div>
      ))}
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

function AddSheetRun({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
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
        modality: "run",
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
    <BottomSheet open={open} onClose={onClose} title="Registrar corrida">
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

function AddSheetSwim({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [poolLength, setPoolLength] = useState<25 | 50>(25);
  const [stroke, setStroke] = useState("livre");
  const [avgHr, setAvgHr] = useState("");
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      setErr(null);
      const elapsedS = Math.round(Number(duration) * 60);
      if (!elapsedS) throw new Error("Duração é obrigatória");
      const distanceM = distance ? Math.round(Number(distance)) : null;
      const avgHrN = avgHr ? Number(avgHr) : null;
      const avgPaceSPer100m = distanceM ? elapsedS / (distanceM / 100) : null;

      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();

      const loads = computeSwimLoads({
        elapsedS,
        avgHr: avgHrN,
        avgPaceSPer100m,
        srpe: rpe,
        profile: {
          lthr: prof?.lthr,
          cssPaceSPer100m: prof?.css_pace_s_per_100m,
        },
      });

      const { data: created, error } = await supabase.from("activities").insert({
        user_id: userId,
        started_at: new Date(date + "T08:00:00").toISOString(),
        source: "manual",
        status: "concluido",
        modality: "swim",
        elapsed_s: elapsedS,
        distance_m: distanceM,
        avg_hr: avgHrN,
        srpe: rpe,
        stroke,
        pool_length_m: poolLength,
        notes: notes || null,
      }).select("id").single();
      if (error) throw error;

      await supabase.from("activity_metrics").insert({
        activity_id: created.id,
        user_id: userId,
        methodology_version: METHODOLOGY_VERSION,
        confidence: loads.confidence,
        hrtss: loads.hrtss,
        stss: loads.stss,
        srpe_load: loads.srpeLoad,
        session_load: loads.sessionLoad,
        avg_pace_s_per_100m: avgPaceSPer100m,
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
    <BottomSheet open={open} onClose={onClose} title="Registrar natação">
      <div className="space-y-3">
        <label className="block">
          <span className="label-cap text-muted-foreground">Data</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] tabular text-foreground focus:border-ignite focus:outline-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Duração (min)" value={duration} onChange={setDuration} placeholder="40" />
          <NumberField label="Distância (m)" value={distance} onChange={setDistance} placeholder="1500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label-cap text-muted-foreground">Piscina</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {[25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setPoolLength(n as 25 | 50)}
                  className={`rounded-lg border py-2 text-[12px] font-bold transition ${poolLength === n ? "border-ignite bg-ignite/10 text-ignite" : "border-border text-muted-foreground"}`}
                >
                  {n}m
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="label-cap text-muted-foreground">Estilo predominante</span>
            <select value={stroke} onChange={(e) => setStroke(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-[14px] text-foreground focus:border-ignite focus:outline-none">
              <option value="livre">Livre</option>
              <option value="costas">Costas</option>
              <option value="peito">Peito</option>
              <option value="borboleta">Borboleta</option>
              <option value="medley">Medley</option>
            </select>
          </label>
        </div>

        <NumberField label="FC média (bpm) — opcional" value={avgHr} onChange={setAvgHr} placeholder="140" />

        <label className="block">
          <span className="label-cap text-muted-foreground">Percepção de esforço (RPE 0–10): <b className="tabular text-foreground">{rpe}</b></span>
          <input type="range" min={0} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="mt-2 w-full accent-ignite" />
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

type StrengthSetDraft = { reps: string; weight: string; rpe: string };
type StrengthEntryDraft = { exerciseId: string; exerciseName: string; sets: StrengthSetDraft[] };

function AddSheetStrength({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState("");
  const [rpe, setRpe] = useState(6);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<StrengthEntryDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data } = await supabase.from("exercises").select("*").order("muscle_group").order("name");
      return data ?? [];
    },
    staleTime: Infinity,
  });

  const filtered = (exercises ?? []).filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()));

  const addExercise = async (exerciseId: string, exerciseName: string) => {
    const { data: last } = await supabase
      .from("strength_sets")
      .select("reps, weight_kg")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setEntries((prev) => [
      ...prev,
      {
        exerciseId,
        exerciseName,
        sets: [{ reps: last?.reps ? String(last.reps) : "", weight: last?.weight_kg ? String(last.weight_kg) : "", rpe: "" }],
      },
    ]);
    setPickerOpen(false);
    setFilter("");
  };

  const addSet = (idx: number) => {
    setEntries((prev) => {
      const next = [...prev];
      const last = next[idx].sets[next[idx].sets.length - 1];
      next[idx] = { ...next[idx], sets: [...next[idx].sets, { reps: last?.reps ?? "", weight: last?.weight ?? "", rpe: "" }] };
      return next;
    });
  };

  const updateSet = (idx: number, setIdx: number, patch: Partial<StrengthSetDraft>) => {
    setEntries((prev) => {
      const next = [...prev];
      const sets = [...next[idx].sets];
      sets[setIdx] = { ...sets[setIdx], ...patch };
      next[idx] = { ...next[idx], sets };
      return next;
    });
  };

  const removeEntry = (idx: number) => setEntries((prev) => prev.filter((_, i) => i !== idx));

  const save = useMutation({
    mutationFn: async () => {
      setErr(null);
      const elapsedS = Math.round(Number(duration) * 60);
      if (!elapsedS) throw new Error("Duração é obrigatória");
      if (entries.length === 0) throw new Error("Adicione ao menos um exercício");

      const loads = computeStrengthLoads(elapsedS, rpe);

      const flatSets = entries.flatMap((e) =>
        e.sets.map((s, i) => ({
          exercise_id: e.exerciseId,
          set_number: i + 1,
          reps: Math.round(Number(s.reps) || 0),
          weight_kg: Number(s.weight) || 0,
          rpe: s.rpe ? Number(s.rpe) : null,
        })),
      );
      const tonnage = tonnageFromSets(flatSets.map((s) => ({ reps: s.reps, weightKg: s.weight_kg })));

      const { data: created, error } = await supabase.from("activities").insert({
        user_id: userId,
        started_at: new Date(date + "T08:00:00").toISOString(),
        source: "manual",
        status: "concluido",
        modality: "strength",
        elapsed_s: elapsedS,
        srpe: rpe,
        notes: notes || null,
      }).select("id").single();
      if (error) throw error;

      await supabase.from("activity_metrics").insert({
        activity_id: created.id,
        user_id: userId,
        methodology_version: METHODOLOGY_VERSION,
        confidence: loads.confidence,
        srpe_load: loads.srpeLoad,
        session_load: loads.sessionLoad,
        tonnage_kg: tonnage,
      });

      await supabase.from("strength_sets").insert(
        flatSets.map((s) => ({ ...s, activity_id: created.id, user_id: userId })),
      );

      await recomputeDailyLoadForUser(userId);
    },
    onSuccess: () => {
      setDuration(""); setNotes(""); setRpe(6); setEntries([]);
      onSaved();
    },
    onError: (e: unknown) => setErr(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Registrar musculação">
      <div className="space-y-3">
        <label className="block">
          <span className="label-cap text-muted-foreground">Data</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] tabular text-foreground focus:border-ignite focus:outline-none" />
        </label>
        <NumberField label="Duração (min)" value={duration} onChange={setDuration} placeholder="50" />

        <div>
          <span className="label-cap text-muted-foreground">Exercícios</span>
          <div className="mt-2 space-y-2">
            {entries.map((entry, idx) => (
              <div key={`${entry.exerciseId}-${idx}`} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-foreground">{entry.exerciseName}</p>
                  <button onClick={() => removeEntry(idx)} className="text-muted-foreground hover:text-danger">
                    <X size={14} />
                  </button>
                </div>
                <div className="mt-2 space-y-1.5">
                  {entry.sets.map((s, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <span className="w-5 text-[11px] tabular text-muted-foreground">{setIdx + 1}</span>
                      <input
                        value={s.reps}
                        onChange={(e) => updateSet(idx, setIdx, { reps: e.target.value })}
                        inputMode="numeric"
                        placeholder="reps"
                        className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-[13px] tabular text-foreground focus:border-ignite focus:outline-none"
                      />
                      <span className="text-[11px] text-muted-foreground">×</span>
                      <input
                        value={s.weight}
                        onChange={(e) => updateSet(idx, setIdx, { weight: e.target.value })}
                        inputMode="decimal"
                        placeholder="kg"
                        className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-[13px] tabular text-foreground focus:border-ignite focus:outline-none"
                      />
                      <span className="text-[11px] text-muted-foreground">kg</span>
                      <input
                        value={s.rpe}
                        onChange={(e) => updateSet(idx, setIdx, { rpe: e.target.value })}
                        inputMode="decimal"
                        placeholder="RPE"
                        className="w-14 rounded-lg border border-border bg-surface px-2 py-1.5 text-[13px] tabular text-foreground focus:border-ignite focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(idx)} className="mt-2 text-[12px] font-semibold text-ignite">+ Série</button>
              </div>
            ))}

            {!pickerOpen && (
              <button onClick={() => setPickerOpen(true)} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-[13px] font-semibold text-muted-foreground hover:border-ignite hover:text-ignite">
                <Plus size={14} /> Adicionar exercício
              </button>
            )}
            {pickerOpen && (
              <div className="rounded-xl border border-border bg-background p-2">
                <input
                  autoFocus
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar exercício..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-foreground focus:border-ignite focus:outline-none"
                />
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {filtered.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex.id, ex.name)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[13px] text-foreground hover:bg-surface"
                    >
                      {ex.name}
                      <span className="text-[10px] uppercase text-muted-foreground">{ex.muscle_group}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="p-2 text-[12px] text-muted-foreground">Nada encontrado.</p>}
                </div>
                <button onClick={() => { setPickerOpen(false); setFilter(""); }} className="mt-1 w-full text-center text-[11px] text-muted-foreground">Cancelar</button>
              </div>
            )}
          </div>
        </div>

        <label className="block">
          <span className="label-cap text-muted-foreground">Percepção de esforço da sessão (RPE 0–10): <b className="tabular text-foreground">{rpe}</b></span>
          <input type="range" min={0} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="mt-2 w-full accent-ignite" />
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

function parseClock(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  if (t.includes(":")) {
    const [m, s] = t.split(":");
    const min = Number(m);
    const sec = Number(s);
    if (Number.isNaN(min) || Number.isNaN(sec)) return null;
    return min * 60 + sec;
  }
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

function CssTestSheet({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const [poolLength, setPoolLength] = useState<25 | 50>(25);
  const [t200, setT200] = useState("");
  const [t400, setT400] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      setErr(null);
      const t200S = parseClock(t200);
      const t400S = parseClock(t400);
      if (!t200S || !t400S) throw new Error("Informe os dois tempos (mm:ss)");
      const css = cssFromTest(t200S, t400S);
      if (!css) throw new Error("T400 precisa ser maior que T200");

      await supabase.from("swim_tests").insert({
        user_id: userId,
        pool_length_m: poolLength,
        t200_s: t200S,
        t400_s: t400S,
        css_pace_s_per_100m: css,
        confidence: 0.8,
      });

      await supabase.from("profiles").update({
        css_pace_s_per_100m: css,
        css_pool_length_m: poolLength,
        css_tested_at: new Date().toISOString(),
      }).eq("user_id", userId);
    },
    onSuccess: () => { setT200(""); setT400(""); onSaved(); },
    onError: (e: unknown) => setErr(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Teste de CSS (400/200)">
      <div className="space-y-3">
        <p className="text-[13px] text-muted-foreground">
          Nade 200m e 400m no máximo esforço sustentável (com descanso entre eles) e registre os tempos. CSS = 200 ÷ (T400 − T200).
        </p>
        <label className="block">
          <span className="label-cap text-muted-foreground">Piscina</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[25, 50].map((n) => (
              <button
                key={n}
                onClick={() => setPoolLength(n as 25 | 50)}
                className={`rounded-lg border py-2 text-[12px] font-bold transition ${poolLength === n ? "border-ignite bg-ignite/10 text-ignite" : "border-border text-muted-foreground"}`}
              >
                {n}m
              </button>
            ))}
          </div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label-cap text-muted-foreground">Tempo 200m (mm:ss)</span>
            <input value={t200} onChange={(e) => setT200(e.target.value)} placeholder="3:10" className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] tabular text-foreground focus:border-ignite focus:outline-none" />
          </label>
          <label className="block">
            <span className="label-cap text-muted-foreground">Tempo 400m (mm:ss)</span>
            <input value={t400} onChange={(e) => setT400(e.target.value)} placeholder="6:40" className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] tabular text-foreground focus:border-ignite focus:outline-none" />
          </label>
        </div>
        {err && <p className="text-[13px] text-danger">{err}</p>}
        <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-ignite mt-2 flex w-full items-center justify-center gap-2 py-3 text-[14px] disabled:opacity-60">
          {save.isPending && <Loader2 size={14} className="animate-spin" />} Salvar teste
        </button>
      </div>
    </BottomSheet>
  );
}
