import type { ReactNode } from "react";
import { CoordinatorSidebar } from "@/components/coordenador/CoordinatorSidebar";

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
    <div className="flex min-h-screen flex-col bg-[#EDF1FB] font-poppins text-slate-950 lg:flex-row">
      <CoordinatorSidebar
        nomeUsuario={nomeUsuario}
        perfilUsuario={perfilUsuario}
      />

      <main className="flex-1 px-4 py-6 sm:px-6 xl:px-10">
        <div className="flex w-full max-w-none flex-col gap-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
