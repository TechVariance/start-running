import { useState, useEffect } from "react";
import { Loader2, Database, LogOut, Trash2, Bot, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { computeZones, type ZoneAnchor } from "@/lib/metodologia";
import { seedDemoData, clearDemoData } from "@/lib/demoData";
import { useNavigate } from "@tanstack/react-router";

export function Perfil() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState<{
    display_name: string;
    hr_max: string;
    hr_rest: string;
    lthr: string;
    zone_model: 3 | 5 | 7;
    zone_anchor: ZoneAnchor;
    consent_analytics: boolean;
    consent_marketing: boolean;
    consent_share_anon: boolean;
  } | null>(null);

  useEffect(() => {
    if (profile && !form) {
      setForm({
        display_name: profile.display_name ?? "",
        hr_max: String(profile.hr_max ?? 190),
        hr_rest: String(profile.hr_rest ?? 55),
        lthr: String(profile.lthr ?? 168),
        zone_model: (profile.zone_model as 3 | 5 | 7) ?? 5,
        zone_anchor: (profile.zone_anchor as ZoneAnchor) ?? "pct_lthr",
        consent_analytics: profile.consent_analytics,
        consent_marketing: profile.consent_marketing,
        consent_share_anon: profile.consent_share_anon,
      });
    }
  }, [profile, form]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) return;
      await supabase.from("profiles").update({
        display_name: form.display_name || null,
        hr_max: Number(form.hr_max),
        hr_rest: Number(form.hr_rest),
        lthr: Number(form.lthr),
        zone_model: form.zone_model,
        zone_anchor: form.zone_anchor,
        consent_analytics: form.consent_analytics,
        consent_marketing: form.consent_marketing,
        consent_share_anon: form.consent_share_anon,
      }).eq("user_id", uid);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", uid] }),
  });

  const seed = useMutation({
    mutationFn: async () => {
      if (!profile) return;
      await seedDemoData(uid, profile);
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const clearDemo = useMutation({
    mutationFn: async () => clearDemoData(uid),
    onSuccess: () => qc.invalidateQueries(),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (isLoading || !form) return <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  const zones = computeZones(form.zone_model, form.zone_anchor, Number(form.hr_max), Number(form.lthr), Number(form.hr_rest));

  return (
    <div className="space-y-4 px-5 pb-6 pt-4">
      <header>
        <p className="label-cap text-muted-foreground">Perfil</p>
        <h1 className="font-display text-[26px] font-black text-foreground">{form.display_name || session!.user.email}</h1>
        <p className="text-[12px] text-muted-foreground">{session!.user.email}</p>
      </header>

      <Section title="Limiares fisiológicos">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Nome" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} />
          <TextField label="FC máx (bpm)" value={form.hr_max} onChange={(v) => setForm({ ...form, hr_max: v })} num />
          <TextField label="FC repouso" value={form.hr_rest} onChange={(v) => setForm({ ...form, hr_rest: v })} num />
          <TextField label="LTHR" value={form.lthr} onChange={(v) => setForm({ ...form, lthr: v })} num />
        </div>
      </Section>

      <Section title="Zonas de FC">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[3, 5, 7].map((n) => (
            <button
              key={n}
              onClick={() => setForm({ ...form, zone_model: n as 3 | 5 | 7 })}
              className={`rounded-lg border py-2 text-[12px] font-bold transition ${form.zone_model === n ? "border-ignite bg-ignite/10 text-ignite" : "border-border text-muted-foreground"}`}
            >
              {n} zonas
            </button>
          ))}
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { v: "pct_lthr", l: "%LTHR" },
            { v: "pct_hrmax", l: "%FCmáx" },
            { v: "karvonen", l: "Karvonen" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setForm({ ...form, zone_anchor: o.v as ZoneAnchor })}
              className={`rounded-lg border py-2 text-[11px] font-bold transition ${form.zone_anchor === o.v ? "border-pulse bg-pulse/10 text-pulse" : "border-border text-muted-foreground"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {zones.map((z) => (
            <div key={z.label} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
              <span className="h-3 w-3 rounded-full" style={{ background: z.color }} />
              <span className="w-16 text-[12px] font-bold text-foreground">{z.label}</span>
              <span className="tabular text-[12px] text-muted-foreground">{z.low}–{z.high} bpm</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Privacidade e dados (LGPD)">
        <ToggleRow label="Análise de uso" desc="Nos ajuda a melhorar o app." value={form.consent_analytics} onChange={(v) => setForm({ ...form, consent_analytics: v })} />
        <ToggleRow label="Comunicações" desc="Novidades e conteúdo sobre treinos." value={form.consent_marketing} onChange={(v) => setForm({ ...form, consent_marketing: v })} />
        <ToggleRow label="Dados anônimos para pesquisa" desc="Melhora a metodologia para todos." value={form.consent_share_anon} onChange={(v) => setForm({ ...form, consent_share_anon: v })} />
      </Section>

      <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-ignite flex w-full items-center justify-center gap-2 py-3 text-[14px] disabled:opacity-60">
        {save.isPending && <Loader2 size={14} className="animate-spin" />} {save.isSuccess ? "Salvo ✓" : "Salvar perfil"}
      </button>

      <Section title="Dados de demonstração">
        <p className="mb-3 text-[12px] text-muted-foreground">Popula 6 semanas de treinos variados + wellness. Idempotente — apaga demos anteriores antes.</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => seed.mutate()} disabled={seed.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-pulse px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60">
            {seed.isPending ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />} Carregar
          </button>
          <button onClick={() => clearDemo.mutate()} disabled={clearDemo.isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-[12px] font-bold text-muted-foreground disabled:opacity-60">
            {clearDemo.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Limpar demo
          </button>
        </div>
      </Section>

      <Section title="Integrações">
        <Link
          to="/connect"
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-ignite"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-ignite/10 text-ignite">
            <Bot size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-foreground">Assistente de IA</p>
            <p className="text-[11px] text-muted-foreground">Conecte ChatGPT, Claude ou outro cliente MCP.</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </Section>

      <button onClick={signOut} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-[13px] font-semibold text-muted-foreground hover:text-danger">
        <LogOut size={14} /> Sair
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-4">
      <p className="label-cap mb-3 text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, num }: { label: string; value: string; onChange: (v: string) => void; num?: boolean }) {
  return (
    <label className="block">
      <span className="label-cap text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={num ? "numeric" : undefined}
        className={`mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px] text-foreground focus:border-ignite focus:outline-none ${num ? "tabular" : ""}`}
      />
    </label>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex w-full items-center gap-3 py-2.5 text-left">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-ignite" : "bg-border"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
