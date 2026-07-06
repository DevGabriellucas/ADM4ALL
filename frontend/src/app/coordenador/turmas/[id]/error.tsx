"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorClassDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorClassDetailError({
  error,
  reset,
}: CoordinatorClassDetailErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar a turma"
      error={error}
      reset={reset}
    />
  );
}
