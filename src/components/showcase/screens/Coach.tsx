import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Msg = { role: "user" | "coach"; content: string; id?: string };

const chips = ["Como está minha forma?", "Explica meu ACWR", "O que fazer amanhã?", "Analisa meu último treino"];

export function Coach() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["coach", uid],
    queryFn: async (): Promise<Msg[]> => {
      const { data } = await supabase.from("coach_messages").select("id, role, content").eq("user_id", uid).order("created_at").limit(200);
      return (data ?? []) as Msg[];
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      // Persist user msg
      await supabase.from("coach_messages").insert({ user_id: uid, role: "user", content: clean });
      qc.invalidateQueries({ queryKey: ["coach", uid] });

      // Call edge function
      const { data, error } = await supabase.functions.invoke("coach-chat", {
        body: { message: clean },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? "Deu ruim aqui, tenta de novo.";

      await supabase.from("coach_messages").insert({ user_id: uid, role: "coach", content: reply });
      qc.invalidateQueries({ queryKey: ["coach", uid] });
    },
    onSuccess: () => setInput(""),
  });

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] flex-col">
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <div className="relative grid h-11 w-11 place-items-center rounded-full bg-pulse">
          <Sparkles size={20} className="text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] font-black leading-none text-foreground">Coach IA</h1>
          <p className="text-[12px] text-muted-foreground">Técnico que respeita seu corpo</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {messages.length === 0 && (
          <div className="card-surface p-4">
            <p className="text-[14px] text-foreground">Fala aí, atleta. Me pergunta qualquer coisa sobre seus treinos, forma ou plano — eu leio seus dados antes de responder.</p>
          </div>
        )}
        {messages.map((m, i) => <Message key={m.id ?? i} {...m} />)}
        {send.isPending && <TypingIndicator />}

        {messages.length < 3 && (
          <div className="pt-2">
            <p className="label-cap mb-2 text-muted-foreground">Sugestões</p>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => send.mutate(c)}
                  disabled={send.isPending}
                  className="rounded-full border border-pulse/40 bg-pulse/10 px-3 py-1.5 text-[12px] font-semibold text-pulse hover:bg-pulse/20 disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface-alt px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); send.mutate(input); }} className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Pergunta pro coach..."
          />
          <button
            type="submit"
            disabled={!input.trim() || send.isPending}
            className="grid h-9 w-9 place-items-center rounded-full bg-ignite text-white disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-glow-ignite)" }}
            aria-label="Enviar"
          >
            {send.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pulse">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-surface-alt px-4 py-3">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function Message({ role, content }: Msg) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-ignite px-4 py-2.5 text-[14px] font-medium text-white whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pulse">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface-alt px-4 py-2.5 text-[14px] text-foreground whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
