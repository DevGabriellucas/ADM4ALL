"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorReportsErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorReportsError({
  error,
  reset,
}: CoordinatorReportsErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar os relatórios"
      error={error}
      reset={reset}
    />
  );
}
