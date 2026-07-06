"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorScheduleErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorScheduleError({
  error,
  reset,
}: CoordinatorScheduleErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar o cronograma"
      error={error}
      reset={reset}
    />
  );
}
