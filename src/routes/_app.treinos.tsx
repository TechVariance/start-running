import { createFileRoute } from "@tanstack/react-router";
import { Treinos } from "@/components/showcase/screens/Treinos";

export const Route = createFileRoute("/_app/treinos")({
  component: Treinos,
});
