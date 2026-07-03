import { createFileRoute } from "@tanstack/react-router";
import { Perfil } from "@/components/showcase/screens/Perfil";

export const Route = createFileRoute("/_app/perfil")({
  component: Perfil,
});
