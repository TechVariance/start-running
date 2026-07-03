import { createFileRoute } from "@tanstack/react-router";
import { Coach } from "@/components/showcase/screens/Coach";

export const Route = createFileRoute("/_app/coach")({
  component: Coach,
});
