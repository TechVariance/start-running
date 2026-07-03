import { Home, CalendarDays, Activity, MessageSquare, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/hoje", label: "Hoje", Icon: Home },
  { to: "/plano", label: "Plano", Icon: CalendarDays },
  { to: "/treinos", label: "Treinos", Icon: Activity },
  { to: "/coach", label: "Coach", Icon: MessageSquare },
  { to: "/perfil", label: "Perfil", Icon: User },
] as const;

export function TabBar() {
  return (
    <nav
      className="border-t border-border backdrop-blur-xl"
      style={{ background: "color-mix(in oklab, var(--color-surface-alt) 92%, transparent)" }}
    >
      <div className="mx-auto flex max-w-[480px] items-end justify-around px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        {tabs.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex flex-1 flex-col items-center gap-1 py-1.5"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute -top-0.5 h-0.5 rounded-full bg-ignite transition-all duration-200 ${
                    isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                  }`}
                  style={{ transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)" }}
                />
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? "text-ignite" : "text-muted-foreground"}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={isActive ? 0.18 : 0}
                />
                <span
                  className="label-cap"
                  style={{
                    color: isActive ? "var(--color-ignite)" : "var(--color-muted-foreground)",
                    fontSize: 10,
                    letterSpacing: 0.6,
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
