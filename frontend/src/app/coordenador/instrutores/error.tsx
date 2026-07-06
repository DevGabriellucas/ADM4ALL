"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorInstructorsErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorInstructorsError({
  error,
  reset,
}: CoordinatorInstructorsErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar os instrutores"
      error={error}
      reset={reset}
    />
  );
}
