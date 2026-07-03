import { createFileRoute } from "@tanstack/react-router";
import { Hoje } from "@/components/showcase/screens/Hoje";

export const Route = createFileRoute("/_app/hoje")({
  component: Hoje,
});
