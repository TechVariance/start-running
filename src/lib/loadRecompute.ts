import { supabase } from "@/integrations/supabase/client";
import {
  METHODOLOGY_VERSION,
  enumerateDays,
  recomputeDailyLoadSeries,
  toDayString,
} from "./metodologia";

// Recomputa daily_load para o usuário do primeiro treino até hoje.
export async function recomputeDailyLoadForUser(userId: string, fromDay?: string) {
  const { data: mets, error } = await supabase
    .from("activity_metrics")
    .select("session_load, activities!inner(started_at, user_id)")
    .eq("user_id", userId);
  if (error) throw error;

  const loadsByDay = new Map<string, number>();
  let earliest: string | null = fromDay ?? null;

  for (const row of (mets ?? []) as Array<{ session_load: number | null; activities: { started_at: string } }>) {
    const day = toDayString(row.activities.started_at);
    loadsByDay.set(day, (loadsByDay.get(day) ?? 0) + (row.session_load ?? 0));
    if (!earliest || day < earliest) earliest = day;
  }

  const today = new Date().toISOString().slice(0, 10);
  if (!earliest) earliest = today;

  // Estende janela pra trás em 28d pra baseline razoável
  const start = new Date(earliest + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - 28);
  const startStr = start.toISOString().slice(0, 10);

  const rows = recomputeDailyLoadSeries(loadsByDay, startStr, today);

  // Apaga o intervalo e reinsere
  await supabase.from("daily_load").delete().eq("user_id", userId).gte("day", startStr).lte("day", today);
  if (rows.length > 0) {
    const payload = rows.map((r) => ({
      user_id: userId,
      day: r.day,
      daily_load: r.daily_load,
      ctl: r.ctl,
      atl: r.atl,
      tsb: r.tsb,
      acwr: r.acwr,
      acwr_alert: r.acwr_alert,
      methodology_version: METHODOLOGY_VERSION,
    }));
    // Insere em lotes de 500 para segurança
    for (let i = 0; i < payload.length; i += 500) {
      const batch = payload.slice(i, i + 500);
      const { error: e2 } = await supabase.from("daily_load").insert(batch);
      if (e2) throw e2;
    }
  }
  return rows;
}

export { enumerateDays };
