// Coach IA — usa Lovable AI Gateway. Contexto real do atleta.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return json({ error: "unauthorized" }, 401);
    const uid = userRes.user.id;

    const body = await req.json();
    const message: string = (body?.message ?? "").toString().slice(0, 2000);
    if (!message.trim()) return json({ error: "empty message" }, 400);

    // Contexto do atleta
    const [{ data: profile }, { data: daily }, { data: acts }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("display_name, hr_max, hr_rest, lthr, weekly_volume_km, threshold_pace_s_per_km").eq("user_id", uid).maybeSingle(),
      supabase.from("daily_load").select("day, ctl, atl, tsb, acwr, acwr_alert").eq("user_id", uid).order("day", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("activities").select("started_at, distance_m, elapsed_s, avg_hr, avg_pace_s_per_km, activity_metrics(session_load, hrtss, rtss, trimp)").eq("user_id", uid).order("started_at", { ascending: false }).limit(5),
      supabase.from("coach_messages").select("role, content").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
    ]);

    const name = profile?.display_name ?? "atleta";
    const ctx = [
      profile ? `Perfil: nome ${name}, FCmáx ${profile.hr_max ?? "?"}, FCrep ${profile.hr_rest ?? "?"}, LTHR ${profile.lthr ?? "?"}, volume ${profile.weekly_volume_km ?? "?"} km/sem.` : "Perfil ainda incompleto.",
      daily ? `Carga atual: CTL ${daily.ctl?.toFixed(0)}, ATL ${daily.atl?.toFixed(0)}, TSB ${daily.tsb?.toFixed(0)}, ACWR ${daily.acwr ?? "n/d"}${daily.acwr_alert ? " (fora da zona 0.8–1.3)" : ""}.` : "Sem dados de carga acumulados ainda.",
      acts && acts.length > 0
        ? "Últimos treinos:\n" + acts.map((a: Record<string, unknown>) => {
          const d = new Date(a.started_at as string).toLocaleDateString("pt-BR");
          const km = a.distance_m ? ((a.distance_m as number) / 1000).toFixed(1) + "km" : "";
          const min = Math.round((a.elapsed_s as number) / 60) + "min";
          const hr = a.avg_hr ? `FC${a.avg_hr}` : "";
          const m = (a.activity_metrics as Array<{ session_load: number }> | undefined)?.[0];
          const tss = m?.session_load ? `${m.session_load.toFixed(0)}TSS` : "";
          return `  - ${d}: ${km} ${min} ${hr} ${tss}`.trim();
        }).join("\n")
        : "Nenhum treino registrado ainda.",
    ].join("\n");

    const systemPrompt = `Você é o coach de corrida do ${name} no app Start Running. Persona: técnico que respeita o atleta — direto, prático, sem jargão despejado. Celebra evolução real. Nunca inventa números; se um dado não existe, diga. Português do Brasil. Frases curtas. Nada de listas gigantes: máximo 3 bullets curtos ou parágrafo direto. Não recomenda medicação. Sempre baseia conselho nos dados abaixo.

DADOS ATUAIS DO ATLETA:
${ctx}`;

    const priorMessages = (history ?? []).reverse().map((m: { role: string; content: string }) => ({
      role: m.role === "coach" ? "assistant" : "user",
      content: m.content,
    }));

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY")!,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...priorMessages,
          { role: "user", content: message },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("AI Gateway error:", resp.status, text);
      if (resp.status === 429) return json({ reply: "Muita gente conversando comigo ao mesmo tempo. Espera uns segundos e tenta de novo." }, 200);
      if (resp.status === 402) return json({ reply: "Créditos de IA esgotados. Avise o time." }, 200);
      return json({ error: "ai gateway error" }, 500);
    }

    const data = await resp.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "Sem resposta.";
    return json({ reply });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
