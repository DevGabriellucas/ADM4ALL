import { AlunoAvatarUpload } from "@/components/aluno/AlunoAvatarUpload";
import { AlunoLogoutButton } from "@/components/aluno/AlunoLogoutButton";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoHeaderProps {
  aluno: Pick<AlunoDashboard, "avatarUrl" | "matricula" | "nome">;
}

export const AlunoHeader = ({ aluno }: AlunoHeaderProps) => {
  const matricula = aluno.matricula ?? "Não informado(a)";

  return (
    <header className="flex w-full flex-col gap-5 bg-gradient-to-br from-[#172554] via-brand-dark to-[#3155A6] px-5 py-6 text-white shadow-lg sm:flex-row sm:items-center sm:px-8">
      <AlunoAvatarUpload nome={aluno.nome} avatarUrl={aluno.avatarUrl} />

      <div className="flex min-w-0 flex-col items-center gap-y-1 text-center sm:items-start sm:text-left">
        <h1 className="break-words font-semibold text-xl tracking-tight sm:text-2xl">
          Olá, {aluno.nome}
        </h1>
        <p className="text-blue-100 text-sm">RGM: {matricula}</p>
      </div>

      <div className="sm:ml-auto">
        <AlunoLogoutButton />
      </div>
    </header>
  );
};
