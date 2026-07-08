import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { BaseUser, UserRole } from "@/types/coordinator";

interface UserTableProps {
  users: BaseUser[];
  showActions?: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  administrador: "Administrador",
  coordenador: "Coordenador",
  instrutor: "Instrutor",
  aluno: "Aluno",
};

const getUserStatusInfo = (status: BaseUser["status"]) => {
  if (status === "ativo") {
    return { label: "Ativo", tone: "green" as const };
  }
  if (status === "pendente_ativacao") {
    return { label: "Pendente de ativação", tone: "amber" as const };
  }
  if (status === "bloqueado") {
    return { label: "Bloqueado", tone: "red" as const };
  }
  return { label: "Inativo", tone: "slate" as const };
};

const formatLastAccess = (lastAccess: string | null) => {
  if (!lastAccess) {
    return "Nunca acessou";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(lastAccess));
};

export const UserTable = ({ users, showActions = true }: UserTableProps) => {
  return (
    <section
      aria-labelledby="users-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="users-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Contas cadastradas
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Visão administrativa de perfis e acessos ao sistema.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-5xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Nome
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                E-mail
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Perfil
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Último acesso
              </th>
              {showActions && (
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const status = getUserStatusInfo(user.status);

              return (
                <tr key={user.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {user.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {user.email}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {ROLE_LABELS[user.role]}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-600 text-xs">
                    {formatLastAccess(user.ultimoAcesso)}
                  </td>
                  {showActions && (
                    <td className="border-slate-100 border-b px-3 py-3">
                      <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                        <button
                          type="button"
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                        >
                          Visualizar
                        </button>
                        <button
                          type="button"
                          className="font-semibold text-blue-700 text-xs transition-colors hover:text-blue-900"
                        >
                          Editar perfil
                        </button>
                        {user.status === "pendente_ativacao" && (
                          <button
                            type="button"
                            className="font-semibold text-amber-700 text-xs transition-colors hover:text-amber-900"
                          >
                            Reenviar ativação
                          </button>
                        )}
                        {user.status === "ativo" && (
                          <button
                            type="button"
                            className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800"
                          >
                            Desativar
                          </button>
                        )}
                        <button
                          type="button"
                          className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum usuário encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
