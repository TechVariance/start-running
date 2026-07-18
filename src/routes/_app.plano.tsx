import { createFileRoute } from "@tanstack/react-router";
import { Plano } from "@/components/showcase/screens/Plano";

export const Route = createFileRoute("/_app/plano")({
  component: Plano,
});
