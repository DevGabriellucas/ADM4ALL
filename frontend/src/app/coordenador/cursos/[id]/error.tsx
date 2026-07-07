"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorCourseDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorCourseDetailError({
  error,
  reset,
}: CoordinatorCourseDetailErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar o curso"
      error={error}
      reset={reset}
    />
  );
}
