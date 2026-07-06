"use client";

import { CoordinatorRouteError } from "@/components/coordenador/CoordinatorRouteError";

interface CoordinatorCertificatesErrorProps {
  error: Error;
  reset: () => void;
}

export default function CoordinatorCertificatesError({
  error,
  reset,
}: CoordinatorCertificatesErrorProps) {
  return (
    <CoordinatorRouteError
      title="Não foi possível carregar os certificados"
      error={error}
      reset={reset}
    />
  );
}
