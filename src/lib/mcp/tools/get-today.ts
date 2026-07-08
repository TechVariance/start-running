import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_today",
  title: "Ver o dia de hoje",
  description:
    "Retorna o wellness de hoje, o treino planejado do dia (se houver) e o último ponto de carga (CTL/ATL/TSB/ACWR).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const uid = ctx.getUserId();
    const today = new Date().toISOString().slice(0, 10);
    const s = sb(ctx);
    const [w, pw, dl] = await Promise.all([
      s.from("wellness").select("*").eq("user_id", uid).eq("day", today).maybeSingle(),
      s
        .from("planned_workouts")
        .select("id, type, title, description, target_zone, distance_m, duration_s, status")
        .eq("user_id", uid)
        .eq("day", today)
        .maybeSingle(),
      s
        .from("daily_load")
        .select("day, ctl, atl, tsb, acwr, acwr_alert")
        .eq("user_id", uid)
        .order("day", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    const payload = {
      date: today,
      wellness: w.data,
      planned_workout: pw.data,
      load_latest: dl.data,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
