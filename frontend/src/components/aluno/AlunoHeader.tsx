import { AlunoLogoutButton } from "@/components/aluno/AlunoLogoutButton";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoHeaderProps {
  aluno: Pick<AlunoDashboard, "matricula" | "nome">;
}

export const AlunoHeader = ({ aluno }: AlunoHeaderProps) => {
  const matricula = aluno.matricula ?? "Nao informada";
  const iniciais = aluno.nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex min-h-24 w-full flex-col items-center justify-center gap-5 bg-brand-medium px-5 py-4 text-center text-slate-950 sm:flex-row sm:gap-x-7">
      <div
        role="img"
        aria-label={`Iniciais de ${aluno.nome}`}
        className="flex size-20 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-[#2F3F62] font-semibold text-2xl text-white shadow-md"
      >
        {iniciais}
      </div>

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
