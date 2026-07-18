// Erros do Supabase (PostgrestError etc.) são objetos simples, não `instanceof Error` —
// extrai a mensagem de qualquer um dos dois formatos em vez de cair num fallback genérico.
export function errorMessage(e: unknown, fallback = "Erro"): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return fallback;
}
