"use client";

import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { UserTable } from "@/components/coordenador/UserTable";
import type { BaseUser } from "@/types/coordinator";

interface UsersPageContentProps {
  users: BaseUser[];
}

export const UsersPageContent = ({ users }: UsersPageContentProps) => {
  return (
    <>
      <CoordinatorPageHeader
        title="Usuários"
        subtitle="Gerencie os acessos de coordenadores, instrutores e alunos."
        action={
          <button
            type="button"
            disabled
            title="A criação de usuários será implementada na próxima etapa."
            className="h-11 w-full cursor-not-allowed rounded-lg bg-slate-300 px-5 font-semibold text-slate-600 text-sm sm:w-auto"
          >
            + Novo usuário
          </button>
        }
      />

      <UserTable users={users} showActions={false} />
    </>
  );
};
