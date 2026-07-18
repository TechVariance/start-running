import { useRef, useState } from "react";
import { Plus, Loader2, Trash2, Upload, Download, AlertTriangle } from "lucide-react";
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

// Aceita tanto o slug (peito) quanto o rótulo em português (Peito); o que não bater
// com nada conhecido vira um slug best-effort e ainda é aceito (livre-forma).
function normalizeToSlug(input: string, options: { value: string; label: string }[]): string {
  const t = input.trim().toLowerCase();
  if (!t) return t;
  const byValue = options.find((o) => o.value === t);
  if (byValue) return byValue.value;
  const byLabel = options.find((o) => o.label.toLowerCase() === t);
  if (byLabel) return byLabel.value;
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");
}

// Parser simples de CSV com suporte a campos entre aspas (RFC 4180 básico)
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.trim() !== "")) rows.push(row);
  }
  return rows;
}

type ImportRow = { name: string; muscleGroup: string; equipment: string };

function parseExercisesCsv(text: string): ImportRow[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const findCol = (...names: string[]) => names.map((n) => header.indexOf(n)).find((i) => i >= 0) ?? -1;
  const nameIdx = findCol("name", "nome");
  const groupIdx = findCol("muscle_group", "grupo_muscular", "grupo muscular", "grupo");
  const equipIdx = findCol("equipment", "equipamento");

  const dataRows = nameIdx >= 0 ? rows.slice(1) : rows; // sem cabeçalho reconhecido: assume 3 colunas na ordem nome, grupo, equipamento
  const [nI, gI, eI] = nameIdx >= 0 ? [nameIdx, groupIdx, equipIdx] : [0, 1, 2];

  return dataRows
    .map((r) => ({
      name: (r[nI] ?? "").trim(),
      muscleGroup: normalizeToSlug(r[gI] ?? "", MUSCLE_GROUPS),
      equipment: normalizeToSlug(r[eI] ?? "", EQUIPMENT),
    }))
    .filter((r) => r.name);
}

function downloadCsvTemplate() {
  const csv = "name,muscle_group,equipment\nAgachamento sumô,pernas,halteres\nCrucifixo,peito,halteres\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo_exercicios.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function Exercicios() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

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
        <div className="flex gap-2">
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[13px] font-bold text-muted-foreground hover:border-ignite hover:text-ignite">
            <Upload size={14} /> Importar
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-ignite inline-flex items-center gap-1.5 px-4 py-2 text-[13px]">
            <Plus size={14} /> Novo
          </button>
        </div>
      </header>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Exercícios globais ficam disponíveis para todo mundo. Os que você cadastra aqui — um por um ou por arquivo — são só seus e podem ser usados para registrar treinos.
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

      <ImportExercisesSheet
        open={importOpen}
        onClose={() => setImportOpen(false)}
        userId={uid}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["exercises"] });
          setImportOpen(false);
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

function ImportExercisesSheet({ open, onClose, userId, onSaved }: { open: boolean; onClose: () => void; userId: string; onSaved: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const reset = () => { setFileName(null); setRows([]); setErr(null); if (fileRef.current) fileRef.current.value = ""; };

  const handleFile = async (file: File) => {
    setErr(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = parseExercisesCsv(text);
      if (parsed.length === 0) throw new Error("Nenhuma linha válida encontrada — confira se o arquivo tem as colunas name, muscle_group, equipment");
      setRows(parsed);
    } catch (e) {
      setRows([]);
      setErr(e instanceof Error ? e.message : "Não foi possível ler o arquivo");
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (rows.length === 0) return;
      const { error } = await supabase.from("exercises").insert(
        rows.map((r) => ({ user_id: userId, name: r.name, muscle_group: r.muscleGroup, equipment: r.equipment })),
      );
      if (error) throw error;
    },
    onSuccess: () => { reset(); onSaved(); },
    onError: (e: unknown) => setErr(e instanceof Error ? e.message : "Erro ao importar"),
  });

  return (
    <BottomSheet open={open} onClose={() => { reset(); onClose(); }} title="Importar exercícios">
      <div className="space-y-3">
        <p className="text-[13px] text-muted-foreground">
          Envie um arquivo CSV com as colunas <b className="text-foreground">name, muscle_group, equipment</b> (aceita também nome, grupo, equipamento). Uma linha por exercício.
        </p>

        <button onClick={downloadCsvTemplate} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ignite">
          <Download size={12} /> Baixar modelo CSV
        </button>

        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-4 text-[13px] font-semibold text-muted-foreground hover:border-ignite hover:text-ignite">
          <Upload size={16} />
          {fileName ?? "Escolher arquivo .csv"}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>

        {err && (
          <p className="flex items-start gap-1.5 text-[13px] text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {err}
          </p>
        )}

        {rows.length > 0 && (
          <div>
            <p className="label-cap mb-1.5 text-muted-foreground">{rows.length} exercício(s) prontos para importar</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-1.5 text-[12px]">
                  <span className="font-bold text-foreground">{r.name}</span>
                  <span className="text-muted-foreground">{groupLabel(r.muscleGroup)} · {equipmentLabel(r.equipment)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => importMutation.mutate()}
          disabled={rows.length === 0 || importMutation.isPending}
          className="btn-ignite mt-2 flex w-full items-center justify-center gap-2 py-3 text-[14px] disabled:opacity-60"
        >
          {importMutation.isPending && <Loader2 size={14} className="animate-spin" />} Importar {rows.length > 0 ? `${rows.length} exercícios` : ""}
        </button>
      </div>
    </BottomSheet>
  );
}
