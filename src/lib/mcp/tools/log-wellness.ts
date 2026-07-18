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
  name: "log_wellness",
  title: "Registrar wellness do dia",
  description:
    "Grava (ou atualiza) os dados de prontidão do dia: HRV (rMSSD, ms), horas de sono e FC de repouso (bpm).",
  inputSchema: {
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Data ISO YYYY-MM-DD. Padrão: hoje."),
    hrv_rmssd: z.number().min(5).max(300).optional().describe("HRV rMSSD em ms."),
    sleep_hours: z.number().min(0).max(24).optional().describe("Horas de sono."),
    hr_rest_bpm: z.number().int().min(25).max(120).optional().describe("FC de repouso ao acordar."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ day, hrv_rmssd, sleep_hours, hr_rest_bpm }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const d = day ?? new Date().toISOString().slice(0, 10);
    const row = {
      user_id: ctx.getUserId(),
      day: d,
      hrv_rmssd: hrv_rmssd ?? null,
      sleep_s: sleep_hours != null ? Math.round(sleep_hours * 3600) : null,
      hr_rest_bpm: hr_rest_bpm ?? null,
    };
    const { data, error } = await sb(ctx)
      .from("wellness")
      .upsert(row, { onConflict: "user_id,day" })
      .select()
      .single();
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Wellness de ${d} registrado.` }],
      structuredContent: { wellness: data },
    };
  },
});
