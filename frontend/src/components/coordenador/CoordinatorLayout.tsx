import type { ReactNode } from "react";
import { CoordinatorShellWrapper } from "@/components/coordenador/CoordinatorShellWrapper";

interface CoordinatorLayoutProps {
  children: ReactNode;
  nomeUsuario: string;
  perfilUsuario: string;
}

export const CoordinatorLayout = ({
  children,
  nomeUsuario,
  perfilUsuario,
}: CoordinatorLayoutProps) => {
  return (
    <CoordinatorShellWrapper
      nomeUsuario={nomeUsuario}
      perfilUsuario={perfilUsuario}
    >
      {children}
    </CoordinatorShellWrapper>
  );
};
