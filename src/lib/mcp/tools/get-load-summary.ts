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
  name: "get_load_summary",
  title: "Resumo de carga (CTL/ATL/TSB/ACWR)",
  description:
    "Retorna a série diária de carga do atleta (CTL fitness, ATL fadiga, TSB forma, ACWR) dos últimos N dias e o último ponto.",
  inputSchema: {
    days: z.number().int().min(7).max(120).default(30).describe("Janela em dias (7-120)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
    const { data, error } = await sb(ctx)
      .from("daily_load")
      .select("day, daily_load, ctl, atl, tsb, acwr, acwr_alert")
      .eq("user_id", ctx.getUserId())
      .gte("day", since)
      .order("day", { ascending: true });
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = data ?? [];
    const last = rows[rows.length - 1] ?? null;
    return {
      content: [
        {
          type: "text",
          text: last
            ? `Último dia (${last.day}): CTL ${last.ctl} · ATL ${last.atl} · TSB ${last.tsb} · ACWR ${last.acwr ?? "—"}${last.acwr_alert ? " ⚠︎" : ""}. Série: ${rows.length} pontos.`
            : "Sem dados de carga na janela.",
        },
      ],
      structuredContent: { series: rows, latest: last },
    };
  },
});
