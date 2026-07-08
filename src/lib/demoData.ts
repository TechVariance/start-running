import { supabase } from "@/integrations/supabase/client";
import { computeLoads, METHODOLOGY_VERSION, timeInZoneFromAvgHr, computeZones } from "./metodologia";
import { recomputeDailyLoadForUser } from "./loadRecompute";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Perfis de sessões para ~6 semanas variadas
const SESSION_TEMPLATES = [
  { type: "easy", minutes: 45, hr: 138, pace: 360, rpe: 4 },
  { type: "long", minutes: 90, hr: 145, pace: 355, rpe: 5 },
  { type: "tempo", minutes: 40, hr: 165, pace: 305, rpe: 7 },
  { type: "interval", minutes: 55, hr: 172, pace: 290, rpe: 8 },
  { type: "recovery", minutes: 30, hr: 128, pace: 400, rpe: 3 },
];

// Padrão semanal: Seg descanso, Ter easy, Qua tempo, Qui easy, Sex interval, Sáb recovery/descanso, Dom long
const WEEK_PATTERN: (number | null)[] = [null, 0, 2, 0, 3, 4, 1];

export async function seedDemoData(userId: string, profile: Profile) {
  // Idempotente: apaga demos anteriores
  await supabase.from("activities").delete().eq("user_id", userId).eq("source", "demo");

  const inserts: Array<{
    activity: Database["public"]["Tables"]["activities"]["Insert"];
    template: (typeof SESSION_TEMPLATES)[number];
  }> = [];

  const today = new Date();
  today.setHours(7, 0, 0, 0);

  for (let daysAgo = 42; daysAgo >= 1; daysAgo--) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dow = (d.getDay() + 6) % 7; // 0 = seg
    const idx = WEEK_PATTERN[dow];
    if (idx == null) continue;
    const t = SESSION_TEMPLATES[idx];
    // Adiciona ruído: ±10%
    const jitter = 1 + (Math.random() * 0.2 - 0.1);
    const elapsed = Math.round(t.minutes * 60 * jitter);
    const distance = Math.round((elapsed / t.pace) * 1000);
    inserts.push({
      activity: {
        user_id: userId,
        started_at: d.toISOString(),
        source: "demo",
        status: "concluido",
        elapsed_s: elapsed,
        moving_s: elapsed,
        distance_m: distance,
        avg_pace_s_per_km: t.pace,
        avg_hr: t.hr,
        srpe: t.rpe,
        notes: `Demo · ${t.type}`,
      },
      template: t,
    });
  }

  // Insere activities em lote
  const activityRows = inserts.map((i) => i.activity);
  const { data: created, error } = await supabase
    .from("activities")
    .insert(activityRows)
    .select("id, started_at, elapsed_s, avg_hr, avg_pace_s_per_km, srpe");
  if (error) throw error;

  const zones = computeZones(
    (profile.zone_model as 3 | 5 | 7) ?? 5,
    (profile.zone_anchor as "pct_lthr" | "pct_hrmax" | "karvonen") ?? "pct_lthr",
    profile.hr_max ?? 190,
    profile.lthr ?? 168,
    profile.hr_rest ?? 55,
  );

  // Cria activity_metrics
  const metrics = (created ?? []).map((a) => {
    const load = computeLoads({
      elapsedS: a.elapsed_s,
      avgHr: a.avg_hr,
      avgPaceSPerKm: a.avg_pace_s_per_km,
      srpe: a.srpe as number | null,
      profile: {
        hrRest: profile.hr_rest,
        hrMax: profile.hr_max,
        lthr: profile.lthr,
        thresholdPaceSPerKm: profile.threshold_pace_s_per_km,
        sex: profile.sex,
      },
    });
    const tiz = timeInZoneFromAvgHr(a.elapsed_s, a.avg_hr, zones);
    return {
      activity_id: a.id,
      user_id: userId,
      methodology_version: METHODOLOGY_VERSION,
      confidence: load.confidence,
      splits: null,
      time_in_zone: tiz,
      trimp: load.trimp,
      hrtss: load.hrtss,
      rtss: load.rtss,
      srpe_load: load.srpeLoad,
      session_load: load.sessionLoad,
    };
  });

  if (metrics.length > 0) {
    const { error: e2 } = await supabase.from("activity_metrics").insert(metrics);
    if (e2) throw e2;
  }

  // Wellness dos últimos 21 dias
  await supabase.from("wellness").delete().eq("user_id", userId).gte("day", daysAgoStr(21));
  const wellnessRows = [];
  for (let daysAgo = 21; daysAgo >= 0; daysAgo--) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    wellnessRows.push({
      user_id: userId,
      day: d.toISOString().slice(0, 10),
      hrv_rmssd: 55 + Math.round(Math.random() * 15),
      hrv_baseline: 60,
      sleep_s: Math.round((6.5 + Math.random() * 1.5) * 3600),
      hr_rest_bpm: 48 + Math.round(Math.random() * 6),
      readiness: 60 + Math.round(Math.random() * 30),
    });
  }
  await supabase.from("wellness").insert(wellnessRows);

  await recomputeDailyLoadForUser(userId);
}

function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function clearDemoData(userId: string) {
  await supabase.from("activities").delete().eq("user_id", userId).eq("source", "demo");
  await recomputeDailyLoadForUser(userId);
}
