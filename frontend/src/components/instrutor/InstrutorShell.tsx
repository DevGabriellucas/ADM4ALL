import type { ReactNode } from "react";
import { InstrutorSidebar } from "@/components/instrutor/InstrutorSidebar";
import { InstrutorTopbar } from "@/components/instrutor/InstrutorTopbar";
import type { InstrutorResumo } from "@/types/instrutor";

interface InstrutorShellProps {
  instrutor: InstrutorResumo;
  curso: string;
  dataAula: string | null;
  children: ReactNode;
}

export const InstrutorShell = ({
  instrutor,
  curso,
  dataAula,
  children,
}: InstrutorShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#EDF1FB] font-poppins text-slate-950 lg:flex-row">
      <InstrutorSidebar instrutor={instrutor} />

      <main className="flex-1 px-4 py-6 sm:px-6 xl:px-10">
        <div className="flex w-full max-w-none flex-col gap-y-6">
          <InstrutorTopbar curso={curso} dataAula={dataAula} />
          {children}
        </div>
      </main>
    </div>
  );
};
