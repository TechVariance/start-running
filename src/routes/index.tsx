import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { PhoneFrame } from "@/components/showcase/PhoneFrame";
import { TabBar } from "@/components/showcase/TabBar";
import type { ScreenId } from "@/components/showcase/types";
import { Hoje } from "@/components/showcase/screens/Hoje";
import { Plano } from "@/components/showcase/screens/Plano";
import { Treinos } from "@/components/showcase/screens/Treinos";
import { Coach } from "@/components/showcase/screens/Coach";
import { Perfil } from "@/components/showcase/screens/Perfil";

export const Route = createFileRoute("/")({
  component: Showcase,
});

const NAV: { id: ScreenId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "plano", label: "Plano" },
  { id: "treinos", label: "Treinos" },
  { id: "coach", label: "Coach" },
  { id: "perfil", label: "Perfil" },
];

function Showcase() {
  const [screen, setScreen] = useState<ScreenId>("hoje");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: dark
            ? "radial-gradient(80% 60% at 20% 0%, rgba(30,91,255,0.15), transparent 60%), radial-gradient(60% 50% at 90% 10%, rgba(255,58,94,0.12), transparent 60%), radial-gradient(70% 50% at 50% 100%, rgba(214,255,61,0.06), transparent 60%)"
            : "radial-gradient(80% 60% at 20% 0%, rgba(30,91,255,0.10), transparent 60%), radial-gradient(60% 50% at 90% 10%, rgba(255,58,94,0.08), transparent 60%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl"
                 style={{ background: "linear-gradient(135deg, #FF3A5E, #1E5BFF)", boxShadow: "var(--shadow-glow-ignite)" }}>
              <span className="font-display text-[18px] font-black text-white">S</span>
            </div>
            <div>
              <p className="font-display text-[18px] font-black leading-none text-foreground">Start Running</p>
              <p className="text-[11px] text-muted-foreground">
                App showcase · powered by <span className="font-bold">Variance</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setDark(v => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-3.5 py-2 text-[12px] font-bold text-foreground transition hover:border-ignite"
            aria-label="Alternar tema"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? "Claro" : "Escuro"}
          </button>
        </div>

        {/* Tabs */}
        <nav className="mx-auto max-w-6xl overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1.5">
            {NAV.map(t => {
              const active = t.id === screen;
              return (
                <button
                  key={t.id}
                  onClick={() => setScreen(t.id)}
                  className="relative rounded-full px-4 py-2 text-[13px] font-bold transition"
                  style={{
                    background: active ? "var(--color-ignite)" : "var(--color-surface-alt)",
                    color: active ? "#FFFFFF" : "var(--color-muted-foreground)",
                    boxShadow: active ? "var(--shadow-glow-ignite)" : "none",
                    border: active ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Stage */}
      <main className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-10 lg:flex-row lg:items-start lg:justify-between">
        <aside className="w-full max-w-md lg:sticky lg:top-40">
          <p className="label-cap text-ignite">Coaching de corrida por IA</p>
          <h1 className="mt-2 font-display text-[44px] font-black leading-[1.05] text-foreground">
            Treine com<br />
            <span style={{ background: "linear-gradient(90deg, #FF3A5E, #1E5BFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              inteligência.
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Prontidão diária, plano periodizado que se ajusta sozinho, leitura de sessão
            profunda e um coach que responde com os seus dados na mão — não com achismo.
          </p>

          <div className="mt-6 space-y-3">
            <Feature k="Prontidão" v="HRV, sono, FC repouso · escala vermelho→verde" />
            <Feature k="Plano" v="Fases Base → Build → Peak → Taper com ajuste automático" />
            <Feature k="Sessão" v="Zonas, splits, CTL/ATL/TSB e selo de confiança do dado" />
            <Feature k="Coach IA" v="Explica seu treino com dado real, sem jargão" />
          </div>

          <div className="mt-8 hidden lg:block">
            <p className="label-cap text-muted-foreground">Explore as telas ↗</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Use as abas acima ou a tab bar do celular pra navegar. Alterne o tema no canto superior direito — o escuro é o palco natural dos dashboards.
            </p>
          </div>
        </aside>

        {/* Phone */}
        <div className="relative">
          <PhoneWithBar screen={screen} onChange={setScreen} />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4 text-center text-[11px] text-muted-foreground lg:text-left">
        Protótipo visual · dados mock · sem backend · © Variance
      </footer>
    </div>
  );
}

function PhoneWithBar({ screen, onChange }: { screen: ScreenId; onChange: (id: ScreenId) => void }) {
  return (
    <div className="relative">
      <PhoneFrame bottomBar={<TabBar active={screen} onChange={onChange} />}>
        <ScreenSwitch screen={screen} />
      </PhoneFrame>
    </div>
  );
}

function ScreenSwitch({ screen }: { screen: ScreenId }) {
  return (
    <div key={screen} className="animate-in fade-in duration-300">
      {screen === "hoje" && <Hoje />}
      {screen === "plano" && <Plano />}
      {screen === "treinos" && <Treinos />}
      {screen === "coach" && <Coach />}
      {screen === "perfil" && <Perfil />}
    </div>
  );
}

function Feature({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ignite" style={{ boxShadow: "0 0 0 4px rgba(255,58,94,0.15)" }} />
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-foreground">{k}</p>
        <p className="text-[13px] text-muted-foreground">{v}</p>
      </div>
    </div>
  );
}
