"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorStudentDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorStudentDetailError({
  error,
  reset,
}: CoordinatorStudentDetailErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar os dados do aluno"
      error={error}
      reset={reset}
    />
  );
}
