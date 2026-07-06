"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorClassesErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorClassesError({
  error,
  reset,
}: CoordinatorClassesErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar as turmas"
      error={error}
      reset={reset}
    />
  );
}
