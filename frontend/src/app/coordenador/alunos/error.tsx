"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorStudentsErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorStudentsError({
  error,
  reset,
}: CoordinatorStudentsErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar os alunos"
      error={error}
      reset={reset}
    />
  );
}
