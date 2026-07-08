import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{
    data: {
      client?: { name?: string; client_uri?: string; redirect_uris?: string[] } | null;
      scope?: string;
      redirect_url?: string;
      redirect_to?: string;
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function oauthApi(): OAuthNs {
  return (supabase.auth as unknown as { oauth: OAuthNs }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("authorization_id ausente");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <div className="dark grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="max-w-md rounded-2xl border border-border bg-surface-alt p-6">
        <h1 className="font-display text-xl font-black">Não foi possível carregar a autorização</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {(error as Error)?.message ?? String(error)}
        </p>
      </div>
    </div>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const decide = async (approve: boolean) => {
    setBusy(approve ? "approve" : "deny");
    setErr(null);
    const { data, error } = approve
      ? await oauthApi().approveAuthorization(authorization_id)
      : await oauthApi().denyAuthorization(authorization_id);
    if (error) {
      setBusy(null);
      setErr(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      setErr("O servidor de autorização não retornou destino de redirecionamento.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? "aplicativo externo";
  const clientUri = details?.client?.client_uri;
  const redirectHost = (() => {
    const uri = details?.client?.redirect_uris?.[0];
    try {
      return uri ? new URL(uri).host : null;
    } catch {
      return null;
    }
  })();
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #FF3A5E, #1E5BFF)",
              boxShadow: "var(--shadow-glow-ignite)",
            }}
          >
            <span className="font-display text-lg font-black text-white">S</span>
          </div>
          <div>
            <p className="font-display text-lg font-black">Start Running</p>
            <p className="text-[11px] text-muted-foreground">powered by Variance</p>
          </div>
        </div>

        <h1 className="font-display text-[28px] font-black leading-tight">
          Conectar <span className="text-ignite">{clientName}</span> à sua conta
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Isso permite que <b>{clientName}</b> use o Start Running como você — lendo seus treinos,
          carga, wellness e plano, e registrando dados que você autorizar.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-border bg-surface-alt p-4 text-[13px]">
          <Row label="Cliente" value={clientName} />
          {clientUri && <Row label="Site" value={clientUri} />}
          {redirectHost && <Row label="Redireciona para" value={redirectHost} />}
          <Row
            label="Escopo"
            value={scopes.length ? scopes.join(", ") : "identidade básica"}
          />
        </div>

        <p className="mt-4 text-[12px] text-muted-foreground">
          As permissões e políticas do app (RLS) continuam valendo — o cliente só acessa o que suas
          regras permitem.
        </p>

        {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => decide(true)}
            disabled={!!busy}
            className="btn-ignite flex items-center justify-center gap-2 py-3.5 text-[15px] disabled:opacity-60"
          >
            {busy === "approve" && <Loader2 size={16} className="animate-spin" />}
            Aprovar e conectar
          </button>
          <button
            onClick={() => decide(false)}
            disabled={!!busy}
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface-alt py-3 text-[14px] font-bold text-foreground disabled:opacity-60"
          >
            {busy === "deny" && <Loader2 size={16} className="animate-spin" />}
            Cancelar conexão
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="label-cap text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground break-all">{value}</span>
    </div>
  );
}
