"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorInstructorDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorInstructorDetailError({
  error,
  reset,
}: CoordinatorInstructorDetailErrorProps) {
  return (
    <CoordinatorRouteError
      title="Nao foi possivel carregar o instrutor"
      error={error}
      reset={reset}
    />
  );
}
