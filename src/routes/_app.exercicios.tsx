import { createFileRoute } from "@tanstack/react-router";
import { Exercicios } from "@/components/showcase/screens/Exercicios";

export const Route = createFileRoute("/_app/exercicios")({
  component: Exercicios,
});
