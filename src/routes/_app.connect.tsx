import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Bot, Check, Copy, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/connect")({
  component: ConnectInstructions,
});

function ConnectInstructions() {
  const [mcpUrl, setMcpUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  const copy = async () => {
    if (!mcpUrl) return;
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <div className="space-y-5 px-5 pb-6 pt-4">
      <Link
        to="/perfil"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Voltar para Perfil
      </Link>

      <header>
        <p className="label-cap text-muted-foreground">Agente de IA</p>
        <h1 className="font-display text-[26px] font-black text-foreground">
          Conectar assistente
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Use o Start Running dentro do ChatGPT, Claude ou outro cliente MCP compatível.
        </p>
      </header>

      <section className="card-surface p-4">
        <p className="label-cap mb-3 text-muted-foreground">URL do servidor MCP</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={mcpUrl}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] text-foreground tabular focus:outline-none"
          />
          <button
            onClick={copy}
            disabled={!mcpUrl}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pulse px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </section>

      <section className="card-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Bot size={18} className="text-ignite" />
          <p className="font-display text-[16px] font-black text-foreground">ChatGPT</p>
        </div>
        <ol className="list-decimal space-y-2 pl-4 text-[13px] text-foreground">
          <li>
            Abra{" "}
            <a
              href="https://chatgpt.com/#settings/Connectors/Advanced"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold text-pulse hover:underline"
            >
              Configurações → Conectores → Avançado <ExternalLink size={12} />
            </a>{" "}
            e ative o modo Desenvolvedor.
          </li>
          <li>No compositor de mensagens, toque em “+” e ligue o modo Desenvolvedor.</li>
          <li>Escolha “Adicionar fontes” e depois “Conectar mais”.</li>
            <li>Dê um nome ao conector e cole a URL do servidor MCP copiada acima.</li>
          <li>Pronto. Pergunte ao ChatGPT sobre seus treinos, carga ou plano.</li>
        </ol>
      </section>

      <section className="card-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Bot size={18} className="text-pulse" />
          <p className="font-display text-[16px] font-black text-foreground">Claude</p>
        </div>
        <ol className="list-decimal space-y-2 pl-4 text-[13px] text-foreground">
          <li>
            Abra{" "}
            <a
              href="https://claude.ai/customize/connectors?modal=add-custom-connector"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold text-pulse hover:underline"
            >
              Conectores personalizados <ExternalLink size={12} />
            </a>
            .
          </li>
          <li>Nomeie o conector e cole a URL do servidor MCP copiada acima.</li>
          <li>Ative o conector no compositor de mensagens.</li>
          <li>Pronto. Peça ao Claude para consultar seu dia, treinos recentes ou resumo de carga.</li>
        </ol>
      </section>

      <section className="card-surface p-4">
        <p className="label-cap mb-2 text-muted-foreground">O que o assistente pode fazer</p>
        <ul className="list-disc space-y-1 pl-4 text-[13px] text-foreground">
          <li>Ver seu perfil e limiares.</li>
          <li>Consultar o dia de hoje (wellness + treino planejado + carga).</li>
          <li>Listar treinos recentes.</li>
          <li>Trazer o resumo de carga (CTL/ATL/TSB/ACWR).</li>
          <li>Registrar wellness (HRV, sono, FC de repouso).</li>
        </ul>
        <p className="mt-3 text-[12px] text-muted-foreground">
          O acesso é feito via OAuth: você aprova a conexão e o assistente só enxerga seus dados,
          respeitando as mesmas regras do app.
        </p>
      </section>
    </div>
  );
}
