import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import listActivities from "./tools/list-activities";
import getLoadSummary from "./tools/get-load-summary";
import logWellness from "./tools/log-wellness";
import getToday from "./tools/get-today";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "start-running-mcp",
  title: "Start Running — Coach MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas do Start Running (coaching de corrida por IA, powered by Variance). Permitem consultar perfil, carga (CTL/ATL/TSB/ACWR), treinos recentes e o dia de hoje, além de registrar wellness (HRV, sono, FC de repouso). Todas as chamadas são escopadas ao usuário autenticado via RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfile, getToday, listActivities, getLoadSummary, logWellness],
});
