import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/hoje", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/hoje`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        // Autologin caso confirmação de e-mail esteja off
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/onboarding", replace: true });
        else setErr("Confira seu e-mail para confirmar a conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/hoje", replace: true });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Falha ao autenticar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #FF3A5E, #1E5BFF)", boxShadow: "var(--shadow-glow-ignite)" }}
          >
            <span className="font-display text-lg font-black text-white">S</span>
          </div>
          <div>
            <p className="font-display text-lg font-black">Start Running</p>
            <p className="text-[11px] text-muted-foreground">powered by Variance</p>
          </div>
        </div>

        <h1 className="font-display text-[32px] font-black leading-tight">
          {mode === "login" ? "Bora treinar." : "Cria sua conta."}
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {mode === "login" ? "Entra pra ver sua prontidão e treino de hoje." : "Um coach que respeita seu corpo."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          {mode === "signup" && (
            <Field label="Como quer ser chamado">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Seu primeiro nome"
              />
            </Field>
          )}
          <Field label="E-mail">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="input"
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Senha">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              className="input"
              placeholder="Mínimo 6 caracteres"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Field>

          {err && <p className="text-[13px] text-danger">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="btn-ignite mt-2 flex w-full items-center justify-center gap-2 py-3.5 text-[15px] disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(null); }}
          className="mt-6 text-center text-[13px] text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "Não tem conta? Cria uma." : "Já tem conta? Entra."}
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

