"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorSettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CoordinatorSettingsError({
  error,
  reset,
}: CoordinatorSettingsErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar as configurações"
      description="Verifique se o backend está rodando e tente novamente."
      error={error}
      reset={reset}
    />
  );
}
