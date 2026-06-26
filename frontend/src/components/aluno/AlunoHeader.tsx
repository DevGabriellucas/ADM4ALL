import Image from "next/image";
import { AlunoLogoutButton } from "@/components/aluno/AlunoLogoutButton";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoHeaderProps {
  aluno: Pick<AlunoDashboard, "avatarUrl" | "matricula" | "nome">;
}

export const AlunoHeader = ({ aluno }: AlunoHeaderProps) => {
  const matricula = aluno.matricula ?? "Nao informada";

  return (
    <header className="flex min-h-24 w-full flex-col items-center justify-center gap-5 bg-brand-medium px-5 py-4 text-center text-slate-950 sm:flex-row sm:gap-x-7">
      <Image
        src={aluno.avatarUrl}
        alt={`Avatar de ${aluno.nome}`}
        width={80}
        height={80}
        unoptimized
        className="size-20 rounded-full border-2 border-[#E7ECF8] object-cover shadow-md"
      />

      <div className="flex flex-col items-start gap-y-2 text-left">
        <h1 className="font-medium text-base tracking-[0.35em] sm:text-lg">
          {aluno.nome}
        </h1>
        <p className="text-xs tracking-[0.35em] sm:text-sm">
          Matricula/RGM: {matricula}
        </p>
      </div>

      <AlunoLogoutButton />
    </header>
  );
};
