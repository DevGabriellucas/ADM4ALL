"use client";

import { useState } from "react";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { UserTable } from "@/components/coordenador/UserTable";
import type { BaseUser, UserRole, UserStatus } from "@/types/coordinator";

interface UsersPageContentProps {
  users: BaseUser[];
}

export const UsersPageContent = ({ users }: UsersPageContentProps) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      user.nome.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      user.email.toLocaleLowerCase("pt-BR").includes(normalizedSearch);

    return (
      matchesSearch &&
      (!roleFilter || user.role === roleFilter) &&
      (!statusFilter || user.status === statusFilter)
    );
  });

  const activeUsers = users.filter((user) => user.status === "ativo").length;
  const pendingUsers = users.filter(
    (user) => user.status === "pendente_ativacao",
  ).length;
  const inactiveUsers = users.filter(
    (user) => user.status === "inativo",
  ).length;

  return (
    <>
      <header>
        <h1 className="font-semibold text-2xl text-slate-950">Usuários</h1>
        <p className="mt-1 text-slate-600 text-sm">
          Gerencie contas, perfis e status de acesso
        </p>
      </header>

      <section
        aria-label="Indicadores de usuários"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de usuários"
          value={users.length}
          subtitle="Contas cadastradas"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Usuários ativos"
          value={activeUsers}
          subtitle="Com acesso liberado"
          variant="green"
        />
        <CoordinatorStatCard
          title="Pendentes de ativação"
          value={pendingUsers}
          subtitle="Aguardando confirmação"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Usuários inativos"
          value={inactiveUsers}
          subtitle="Sem acesso ao sistema"
          variant="blue"
        />
      </section>

      <section
        aria-label="Filtros de usuários"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(14rem,2fr)_minmax(10rem,1fr)_minmax(10rem,1fr)]">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Buscar usuário
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome ou e-mail"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Perfil
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as UserRole | "")
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os perfis</option>
              <option value="administrador">Administrador</option>
              <option value="coordenador">Coordenador</option>
              <option value="instrutor">Instrutor</option>
              <option value="aluno">Aluno</option>
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as UserStatus | "")
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente_ativacao">Pendente de ativação</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
        </div>
      </section>

      <UserTable users={filteredUsers} />
    </>
  );
};
