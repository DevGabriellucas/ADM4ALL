"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { InstrutorTopbar } from "@/components/instrutor/InstrutorTopbar";
import type { ClassGroup } from "@/types/coordinator";

interface ClassWorkspaceHeaderProps {
  titulo: string;
  descricao: string;
  turmas: ClassGroup[];
  turmaSelecionada: ClassGroup | null;
  /** Aula que esta por vir na turma escolhida. */
  dataAula: string | null;
}

// As quatro telas que o instrutor ja tinha e a coordenacao passou a ter. Elas
// so mudam de recorte, entao a troca entre uma e outra precisa levar a turma
// escolhida junto — sem isso o seletor voltaria ao padrao a cada clique.
const SECOES = [
  { label: "Presença", href: "/coordenador/presenca" },
  { label: "Frequência", href: "/coordenador/frequencia" },
  { label: "Cronograma", href: "/coordenador/cronograma" },
  { label: "Materiais", href: "/coordenador/materiais" },
];

const STATUS_LABEL: Record<ClassGroup["status"], string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
};

const rotuloDaTurma = (turma: ClassGroup) =>
  `${turma.nome} — ${turma.codigo} (${STATUS_LABEL[turma.status]})`;

export const ClassWorkspaceHeader = ({
  titulo,
  descricao,
  turmas,
  turmaSelecionada,
  dataAula,
}: ClassWorkspaceHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isTrocandoTurma, startTrocaTurma] = useTransition();

  const trocarTurma = (turmaId: string) => {
    // replace e nao push: o botao Voltar da pagina deve sair da secao, nao
    // desfazer uma a uma as turmas que a coordenacao olhou.
    startTrocaTurma(() => {
      router.replace(`${pathname}?turma=${turmaId}`);
    });
  };

  return (
    <div className="flex flex-col gap-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl text-slate-950">{titulo}</h1>
          <p className="mt-1 text-slate-600 text-sm">{descricao}</p>
        </div>

        <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs sm:min-w-80">
          Turma
          <select
            value={turmaSelecionada?.id ?? ""}
            disabled={turmas.length === 0 || isTrocandoTurma}
            onChange={(event) => trocarTurma(event.target.value)}
            className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none transition-colors hover:border-brand-medium focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {turmas.length === 0 && (
              <option value="">Nenhuma turma cadastrada</option>
            )}
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {rotuloDaTurma(turma)}
              </option>
            ))}
          </select>
        </label>
      </header>

      <nav
        aria-label="Seções da turma"
        className="-mx-1 flex gap-1 overflow-x-auto px-1"
      >
        {SECOES.map((secao) => {
          const ativo = pathname === secao.href;
          const href = turmaSelecionada
            ? `${secao.href}?turma=${turmaSelecionada.id}`
            : secao.href;

          return (
            <Link
              key={secao.href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={`min-w-max rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${
                ativo
                  ? "bg-brand-dark text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {secao.label}
            </Link>
          );
        })}
      </nav>

      {turmaSelecionada && (
        <InstrutorTopbar curso={turmaSelecionada.curso} dataAula={dataAula} />
      )}
    </div>
  );
};
