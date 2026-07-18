import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/app/BottomSheet";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MUSCLE_GROUPS = [
  { value: "peito", label: "Peito" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "bracos", label: "Braços" },
  { value: "pernas", label: "Pernas" },
  { value: "posterior", label: "Posterior" },
  { value: "gluteos", label: "Glúteos" },
  { value: "panturrilha", label: "Panturrilha" },
  { value: "core", label: "Core" },
];

const EQUIPMENT = [
  { value: "barra", label: "Barra" },
  { value: "halteres", label: "Halteres" },
  { value: "maquina", label: "Máquina" },
  { value: "cabo", label: "Cabo" },
  { value: "peso_corporal", label: "Peso corporal" },
  { value: "kettlebell", label: "Kettlebell" },
];

const groupLabel = (v: string) => MUSCLE_GROUPS.find((g) => g.value === v)?.label ?? v;
const equipmentLabel = (v: string) => EQUIPMENT.find((e) => e.value === v)?.label ?? v;

export function Exercicios() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data } = await supabase.from("exercises").select("*").order("muscle_group").order("name");
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("exercises").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const byGroup = new Map<string, typeof exercises>();
  (exercises ?? []).forEach((ex) => byGroup.set(ex.muscle_group, [...(byGroup.get(ex.muscle_group) ?? []), ex]));

  return (
    <div className="px-5 pb-6">
      <header className="flex items-end justify-between pt-4">
        <div>
          <p className="label-cap text-muted-foreground">Musculação</p>
          <h1 className="font-display text-[28px] font-black leading-tight text-foreground">Biblioteca de exercícios</h1>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-ignite inline-flex items-center gap-1.5 px-4 py-2 text-[13px]">
          <Plus size={14} /> Novo
        </button>
      </header>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Exercícios globais ficam disponíveis para todo mundo. Os que você cadastra aqui são só seus e podem ser usados para registrar treinos.
      </p>

      {isLoading && <div className="mt-6 grid place-items-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>}

      <div className="mt-4 space-y-4">
        {[...byGroup.entries()].map(([group, exs]) => (
          <div key={group}>
            <p className="label-cap mb-1.5 text-muted-foreground">{groupLabel(group)}</p>
            <div className="space-y-1.5">
              {exs?.map((ex) => (
                <div key={ex.id} className="card-surface flex items-center justify-between px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-foreground">{ex.name}</p>
                    <p className="text-[11px] text-muted-foreground">{equipmentLabel(ex.equipment)}{ex.user_id ? " · seu" : ""}</p>
                  </div>
                  {ex.user_id === uid && (
                    <button onClick={() => del.mutate(ex.id)} disabled={del.isPending} className="text-muted-foreground hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddExerciseSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        userId={uid}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["exercises"] });
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function AddExerciseSheet({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState(MUSCLE_GROUPS[0].value);
  const [equipment, setEquipment] = useState(EQUIPMENT[0].value);
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      setErr(null);
      if (!name.trim()) throw new Error("Nome é obrigatório");
      const { error } = await supabase.from("exercises").insert({
        user_id: userId,
        name: name.trim(),
        muscle_group: muscleGroup,
        equipment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName(""); setMuscleGroup(MUSCLE_GROUPS[0].value); setEquipment(EQUIPMENT[0].value);
      onSaved();
    },
    onError: (e: unknown) => setErr(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Novo exercício">
      <div className="space-y-3">
        <label className="block">
          <span className="label-cap text-muted-foreground">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Agachamento sumô"
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground focus:border-ignite focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="label-cap text-muted-foreground">Grupo muscular</span>
          <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-[14px] text-foreground focus:border-ignite focus:outline-none">
            {MUSCLE_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label-cap text-muted-foreground">Equipamento</span>
          <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-[14px] text-foreground focus:border-ignite focus:outline-none">
            {EQUIPMENT.map((eq) => <option key={eq.value} value={eq.value}>{eq.label}</option>)}
          </select>
        </label>

        {err && <p className="text-[13px] text-danger">{err}</p>}

        <button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()} className="btn-ignite mt-2 flex w-full items-center justify-center gap-2 py-3 text-[14px] disabled:opacity-60">
          {save.isPending && <Loader2 size={14} className="animate-spin" />} Salvar exercício
        </button>
      </div>
    </BottomSheet>
  );
}
