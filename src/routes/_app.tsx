import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { TabBar } from "@/components/app/TabBar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-surface">
      {/* Ambient side background on wide screens */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: dark
            ? "radial-gradient(80% 60% at 20% 0%, rgba(30,91,255,0.12), transparent 60%), radial-gradient(60% 50% at 90% 10%, rgba(255,58,94,0.10), transparent 60%)"
            : "radial-gradient(80% 60% at 20% 0%, rgba(30,91,255,0.08), transparent 60%)",
        }}
      />

      {/* App viewport — mobile-first, centered on wide screens */}
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background shadow-[0_0_60px_-20px_rgba(0,0,0,0.6)]">
        {/* Compact header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{
                background: "linear-gradient(135deg, #FF3A5E, #1E5BFF)",
                boxShadow: "var(--shadow-glow-ignite)",
              }}
            >
              <span className="font-display text-[14px] font-black text-white">S</span>
            </div>
            <div className="leading-tight">
              <p className="font-display text-[14px] font-black text-foreground">Start Running</p>
              <p className="text-[10px] text-muted-foreground">powered by Variance</p>
            </div>
          </div>
          <button
            onClick={() => setDark((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-[11px] font-bold text-foreground transition hover:border-ignite"
            aria-label="Alternar tema"
          >
            {dark ? <Sun size={12} /> : <Moon size={12} />}
            {dark ? "Claro" : "Escuro"}
          </button>
        </header>

        {/* Screen — animated transition per route */}
        <main
          key={pathname}
          className="flex-1 animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDuration: "200ms", animationTimingFunction: "cubic-bezier(.2,.8,.2,1)" }}
        >
          <Outlet />
        </main>

        {/* Fixed bottom tab bar */}
        <div className="sticky bottom-0 z-30">
          <TabBar />
        </div>
      </div>
    </div>
  );
}
