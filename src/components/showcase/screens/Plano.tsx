import { useState } from "react";
import { Loader2, Plus, Check, ChevronDown, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function Plano() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const qc = useQueryClient();
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ["plan", uid],
    queryFn: async () => {
      const { data } = await supabase.from("plans").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const { data: workouts } = useQuery({
    queryKey: ["planned", uid, plan?.id],
    enabled: !!plan,
    queryFn: async () => {
      const { data } = await supabase.from("planned_workouts").select("*").eq("plan_id", plan!.id).order("day");
      return data ?? [];
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities", uid],
    queryFn: async () => {
      const { data } = await supabase.from("activities").select("id, started_at").eq("user_id", uid).order("started_at", { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const create10k = useMutation({
    mutationFn: async () => {
      const start = new Date();
      const race = new Date(start); race.setDate(race.getDate() + 70);
      const { data: p } = await supabase.from("plans").insert({
        user_id: uid,
        race_name: "10K",
        race_distance_m: 10000,
        race_date: race.toISOString().slice(0, 10),
        phase: "Base",
        week: 1,
        total_weeks: 10,
      }).select().single();
      if (!p) return;

      const templates = [
        { dow: 1, type: "easy", title: "Rodado leve", duration: 40, dist: 6, zone: "Z2", desc: "Constante, respiração cômoda." },
        { dow: 2, type: "tempo", title: "Tempo run", duration: 45, dist: 7, zone: "Z3", desc: "20 min em Z3, no limite do confortável." },
        { dow: 3, type: "easy", title: "Regenerativo", duration: 30, dist: 5, zone: "Z1-Z2", desc: "Trote leve, foco em recuperar." },
        { dow: 4, type: "interval", title: "Intervalos", duration: 55, dist: 8, zone: "Z4", desc: "6 × 800m no ritmo de 5K." },
        { dow: 6, type: "long", title: "Longão", duration: 90, dist: 15, zone: "Z2", desc: "Ritmo constante, hidrate a cada 20 min." },
      ];
      const rows = [];
      for (let w = 0; w < 10; w++) {
        for (const t of templates) {
          const d = new Date(start); d.setDate(d.getDate() + w * 7 + (t.dow - ((start.getDay() + 6) % 7)));
          rows.push({
            plan_id: p.id, user_id: uid, day: d.toISOString().slice(0, 10),
            type: t.type, title: t.title, description: t.desc,
            target_zone: t.zone, distance_m: t.dist * 1000, duration_s: t.duration * 60, status: "planejado",
          });
        }
      }
      await supabase.from("planned_workouts").insert(rows);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plan", uid] }),
  });

  const resetPlan = useMutation({
    mutationFn: async () => {
      if (!plan) return;
      await supabase.from("plans").delete().eq("id", plan.id);
    },
    onSuccess: () => {
      setConfirmReset(false);
      qc.invalidateQueries({ queryKey: ["plan", uid] });
      qc.invalidateQueries({ queryKey: ["planned", uid, plan?.id] });
    },
  });

  const markDone = useMutation({
    mutationFn: async ({ id, day }: { id: string; day: string }) => {
      const match = recentActivities?.find((a) => a.started_at.slice(0, 10) === day);
      await supabase.from("planned_workouts").update({
        status: "executado",
        matched_activity_id: match?.id ?? null,
      }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planned", uid, plan?.id] }),
  });

  const executed = workouts?.filter((w) => w.status === "executado").length ?? 0;
  const total = workouts?.length ?? 0;
  const adherence = total > 0 ? Math.round((executed / total) * 100) : 0;

  return (
    <div className="px-5 pb-6">
      <header className="pt-4">
        <p className="label-cap text-muted-foreground">Periodização</p>
        <h1 className="font-display text-[28px] font-black text-foreground">Seu plano</h1>
      </header>

      {!plan && (
        <div className="card-surface mt-6 p-6 text-center">
          <p className="text-[14px] text-muted-foreground">Nenhum plano ativo.</p>
          <button onClick={() => create10k.mutate()} disabled={create10k.isPending} className="btn-ignite mx-auto mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-[13px]">
            {create10k.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Criar plano 10K (10 semanas)
          </button>
        </div>
      )}

      {plan && (
        <>
          <div className="card-surface mt-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-[18px] font-black text-foreground">{plan.race_name} · {(plan.race_distance_m! / 1000).toFixed(0)}K</p>
                <p className="text-[12px] text-muted-foreground">Prova em {new Date(plan.race_date!).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} · {plan.total_weeks} semanas</p>
              </div>
              <div className="text-right">
                <p className="label-cap text-muted-foreground">Aderência</p>
                <p className="font-display text-[24px] font-black text-ignite tabular">{adherence}%</p>
              </div>
            </div>

            {!confirmReset && (
              <button onClick={() => setConfirmReset(true)} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-danger">
                <RotateCcw size={12} /> Resetar plano
              </button>
            )}
            {confirmReset && (
              <div className="mt-3 rounded-xl border border-danger/30 bg-danger/5 p-3">
                <p className="text-[12px] text-foreground">Isso apaga este plano e todos os treinos planejados (o histórico de treinos executados continua intacto). Tem certeza?</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => resetPlan.mutate()} disabled={resetPlan.isPending} className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-60">
                    {resetPlan.isPending && <Loader2 size={12} className="animate-spin" />} Confirmar reset
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="rounded-full border border-border px-3 py-1.5 text-[12px] font-bold text-muted-foreground">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {workouts?.map((w) => {
              const isOpen = openDay === w.id;
              const dayFmt = new Date(w.day).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
              return (
                <div key={w.id} className="card-surface">
                  <button onClick={() => setOpenDay(isOpen ? null : w.id)} className="flex w-full items-center gap-3 p-3 text-left">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${w.status === "executado" ? "bg-success" : w.status === "perdido" ? "bg-danger" : "bg-muted-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] tabular text-muted-foreground">{dayFmt}</p>
                      <p className="font-display text-[14px] font-extrabold text-foreground">{w.title}</p>
                    </div>
                    <span className="text-[11px] tabular text-muted-foreground">{w.duration_s ? Math.round(w.duration_s / 60) : "—"}min · {w.target_zone}</span>
                    <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="space-y-2 border-t border-border p-3">
                      <p className="text-[13px] text-muted-foreground">{w.description}</p>
                      {w.status !== "executado" && (
                        <button onClick={() => markDone.mutate({ id: w.id, day: w.day })} disabled={markDone.isPending} className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-[12px] font-bold text-success hover:bg-success/25">
                          <Check size={12} /> Marcar como executado
                        </button>
                      )}
                      {w.status === "executado" && (
                        <p className="text-[12px] font-bold text-success">✓ Executado{w.matched_activity_id ? " · vinculado ao treino do dia" : ""}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
