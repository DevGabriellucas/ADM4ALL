"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorCoursesErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorCoursesError({
  error,
  reset,
}: CoordinatorCoursesErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar os cursos"
      error={error}
      reset={reset}
    />
  );
}
