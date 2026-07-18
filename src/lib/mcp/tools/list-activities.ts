import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_recent_activities",
  title: "Listar treinos recentes",
  description:
    "Lista os treinos concluídos mais recentes do atleta autenticado (distância, duração, pace médio, FC média, sRPE).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Quantos treinos retornar (1-50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("activities")
      .select(
        "id, started_at, source, distance_m, elapsed_s, moving_s, avg_pace_s_per_km, avg_hr, max_hr, elevation_gain_m, srpe, notes",
      )
      .eq("user_id", ctx.getUserId())
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { activities: data ?? [] },
    };
  },
});
