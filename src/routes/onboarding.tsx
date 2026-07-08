import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  component: Onboarding,
});

function Onboarding() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [hrMax, setHrMax] = useState("");
  const [hrRest, setHrRest] = useState("");
  const [lthr, setLthr] = useState("");
  const [pace, setPace] = useState("");
  const [weekly, setWeekly] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (session) {
      supabase.from("profiles").select("display_name").eq("user_id", session.user.id).maybeSingle().then(({ data }) => {
        if (data?.display_name) setName(data.display_name);
      });
    }
  }, [session]);

  const save = async (skip = false) => {
    if (!session) return;
    setBusy(true);
    const paceS = pace ? paceToSec(pace) : null;
    const payload = {
      user_id: session.user.id,
      display_name: name || null,
      hr_max: hrMax ? Number(hrMax) : 190,
      hr_rest: hrRest ? Number(hrRest) : 55,
      lthr: lthr ? Number(lthr) : 168,
      threshold_pace_s_per_km: paceS ?? 300,
      weekly_volume_km: weekly ? Number(weekly) : 30,
      onboarded: true,
    };
    await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    void skip;
    setBusy(false);
    navigate({ to: "/hoje", replace: true });
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[480px] px-6 py-10">
        <h1 className="font-display text-[28px] font-black">Bora te conhecer, {name || "atleta"}.</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Isso deixa a leitura dos seus treinos mais precisa. Pula se ainda não sabe — a gente refina depois.
        </p>

        <div className="mt-6 space-y-3">
          <Field label="Como quer ser chamado">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Seu nome" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="FC máx (bpm)">
              <input value={hrMax} onChange={(e) => setHrMax(e.target.value)} className="input tabular" inputMode="numeric" placeholder="190" />
            </Field>
            <Field label="FC repouso (bpm)">
              <input value={hrRest} onChange={(e) => setHrRest(e.target.value)} className="input tabular" inputMode="numeric" placeholder="55" />
            </Field>
            <Field label="LTHR (bpm)">
              <input value={lthr} onChange={(e) => setLthr(e.target.value)} className="input tabular" inputMode="numeric" placeholder="168" />
            </Field>
            <Field label="Pace limiar (m:ss/km)">
              <input value={pace} onChange={(e) => setPace(e.target.value)} className="input tabular" placeholder="4:52" />
            </Field>
          </div>
          <Field label="Volume semanal (km)">
            <input value={weekly} onChange={(e) => setWeekly(e.target.value)} className="input tabular" inputMode="numeric" placeholder="30" />
          </Field>
        </div>

        <button
          onClick={() => save(false)}
          disabled={busy}
          className="btn-ignite mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-[15px] disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />} Bora começar
        </button>
        <button
          onClick={() => save(true)}
          disabled={busy}
          className="mt-3 w-full py-2 text-[13px] text-muted-foreground hover:text-foreground"
        >
          Pular por enquanto
        </button>
      </div>
      <style>{`
        .input {
          width: 100%;
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 15px;
          color: var(--color-foreground);
        }
        .input:focus { outline: none; border-color: var(--color-ignite); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-cap text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function paceToSec(p: string): number | null {
  const m = p.match(/^(\d+):(\d{1,2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}
