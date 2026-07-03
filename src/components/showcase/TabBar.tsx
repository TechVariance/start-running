import { Home, CalendarDays, Activity, MessageSquare, User } from "lucide-react";
import type { ScreenId } from "./types";

const tabs: { id: ScreenId; label: string; Icon: typeof Home }[] = [
  { id: "hoje", label: "Hoje", Icon: Home },
  { id: "plano", label: "Plano", Icon: CalendarDays },
  { id: "treinos", label: "Treinos", Icon: Activity },
  { id: "coach", label: "Coach", Icon: MessageSquare },
  { id: "perfil", label: "Perfil", Icon: User },
];

export function TabBar({ active, onChange }: { active: ScreenId; onChange: (id: ScreenId) => void }) {
  return (
    <div className="border-t border-border bg-surface-alt/90 backdrop-blur-xl">
      <div className="flex items-end justify-around px-2 pb-5 pt-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              {isActive && (
                <span className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-ignite" />
              )}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
