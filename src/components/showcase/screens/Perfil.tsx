import { Check, ChevronRight, Crown, Shield, Watch, Download, Trash2 } from "lucide-react";

const zones = [
  { z: "Z1", label: "Recuperação", range: "< 138 bpm", color: "#3FA9F5" },
  { z: "Z2", label: "Endurance", range: "138–151", color: "#17B26A" },
  { z: "Z3", label: "Tempo", range: "152–160", color: "#F5C518" },
  { z: "Z4", label: "Limiar", range: "161–168", color: "#FF7A1F" },
  { z: "Z5", label: "Anaeróbico", range: "> 168", color: "#E02749" },
];

export function Perfil() {
  return (
    <div className="space-y-4 px-5 pb-4">
      {/* Header */}
      <header className="pt-2">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-[24px] font-black text-white"
               style={{ background: "linear-gradient(135deg, #FF3A5E, #1E5BFF)" }}>
            LP
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[22px] font-black leading-tight text-foreground">Luiz Pereira</h1>
            <p className="text-[13px] text-muted-foreground">Intermediário · 42 km/sem</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-volt/20 px-2.5 py-1 text-[11px] font-bold text-volt-ink">
            <Crown size={12} /> Premium
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniStat label="Semanal" value="42" unit="km" />
          <MiniStat label="VO2max" value="52" />
          <MiniStat label="LTHR" value="168" unit="bpm" />
        </div>
      </header>

      {/* Zonas */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="label-cap text-muted-foreground">Zonas de FC</span>
            <p className="text-[13px] font-bold text-foreground">Modelo de 5 zonas · ancorado em LTHR</p>
          </div>
          <button className="text-[12px] font-bold text-pulse">Editar</button>
        </div>

        <div className="mt-3 flex h-2 overflow-hidden rounded-full">
          {zones.map(z => (
            <div key={z.z} className="flex-1" style={{ background: z.color }} />
          ))}
        </div>

        <div className="mt-3 space-y-1.5">
          {zones.map(z => (
            <div key={z.z} className="flex items-center gap-2 text-[12px]">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: z.color }} />
              <span className="font-bold text-foreground">{z.z}</span>
              <span className="text-muted-foreground">{z.label}</span>
              <span className="ml-auto tabular font-semibold text-muted-foreground">{z.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limiares */}
      <div className="card-surface p-5">
        <span className="label-cap text-muted-foreground">Limiares</span>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Threshold label="LTHR" value="168" unit="bpm" />
          <Threshold label="Pace limiar" value="4:52" unit="/km" />
          <Threshold label="FCmáx" value="189" unit="bpm" />
          <Threshold label="VO2max" value="52" unit="ml/kg" />
        </div>
      </div>

      {/* Integrações */}
      <div className="card-surface overflow-hidden">
        <div className="px-5 pb-2 pt-5">
          <span className="label-cap text-muted-foreground">Integrações</span>
        </div>
        <Integration name="Garmin Connect" status="connected" Icon={Watch} />
        <Integration name="Strava" status="connected" Icon={Watch} />
        <Integration name="Apple Health" status="disconnected" Icon={Watch} />
      </div>

      {/* LGPD */}
      <div className="card-surface overflow-hidden">
        <div className="px-5 pb-2 pt-5">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-pulse" />
            <span className="label-cap text-muted-foreground">Privacidade e dados · LGPD</span>
          </div>
        </div>
        <Row label="Consentimentos granulares" hint="FC, GPS, sono, notificações" />
        <Row label="Exportar meus dados" Icon={Download} />
        <Row label="Excluir minha conta" Icon={Trash2} danger />
      </div>

      <p className="pt-2 text-center text-[11px] text-muted-foreground">
        v1.0 · powered by <span className="font-bold text-foreground">Variance</span>
      </p>
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-alt p-3">
      <p className="label-cap text-muted-foreground" style={{ fontSize: 10 }}>{label}</p>
      <p className="font-display text-[20px] font-black text-foreground">
        {value}{unit && <span className="text-[11px] font-semibold text-muted-foreground"> {unit}</span>}
      </p>
    </div>
  );
}

function Threshold({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="label-cap text-muted-foreground" style={{ fontSize: 10 }}>{label}</p>
      <p className="font-display text-[22px] font-black text-foreground tabular">
        {value}<span className="text-[11px] font-semibold text-muted-foreground"> {unit}</span>
      </p>
    </div>
  );
}

function Integration({ name, status, Icon }: { name: string; status: "connected" | "disconnected"; Icon: typeof Watch }) {
  const connected = status === "connected";
  return (
    <div className="flex items-center gap-3 border-t border-border px-5 py-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-background">
        <Icon size={16} className="text-foreground" />
      </div>
      <span className="flex-1 text-[14px] font-semibold text-foreground">{name}</span>
      {connected ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-success">
          <Check size={14} /> Conectado
        </span>
      ) : (
        <button className="rounded-full border border-pulse px-3 py-1 text-[12px] font-bold text-pulse">
          Conectar
        </button>
      )}
    </div>
  );
}

function Row({ label, hint, Icon, danger }: { label: string; hint?: string; Icon?: typeof Download; danger?: boolean }) {
  return (
    <button className="flex w-full items-center gap-3 border-t border-border px-5 py-3.5 text-left">
      {Icon && (
        <div className="grid h-8 w-8 place-items-center rounded-full bg-background">
          <Icon size={14} className={danger ? "text-danger" : "text-foreground"} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] font-semibold ${danger ? "text-danger" : "text-foreground"}`}>{label}</p>
        {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  );
}
