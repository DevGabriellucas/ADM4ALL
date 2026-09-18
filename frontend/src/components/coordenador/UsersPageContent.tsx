"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  atualizarStatusUsuarioAction,
  excluirUsuarioAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { EditUserModal } from "@/components/coordenador/EditUserModal";
import { NewUserModal } from "@/components/coordenador/NewUserModal";
import { UserTable } from "@/components/coordenador/UserTable";
import { Notificacao } from "@/components/shared/Notificacao";
import { Paginacao } from "@/components/shared/Paginacao";
import type {
  BaseUser,
  ClassGroup,
  Course,
  UserRole,
  UserStatus,
} from "@/types/coordinator";
import type { Pagina } from "@/types/paginacao";

export type FiltrosDeUsuarios = Record<string, string | undefined> & {
  busca?: string | undefined;
  perfil?: string | undefined;
  status?: string | undefined;
  ordenacao?: string | undefined;
};

interface UsersPageContentProps {
  pagina: Pagina<BaseUser>;
  filtros: FiltrosDeUsuarios;
  courses: Course[];
  classes: ClassGroup[];
  currentUserId?: string | null;
}

type SortOption = "nome_asc" | "nome_desc" | "acesso_recente" | "acesso_antigo";

const ROLE_FILTER_OPTIONS: { label: string; value: UserRole | "" }[] = [
  { label: "Todos os perfis", value: "" },
  { label: "Administrador", value: "administrador" },
  { label: "Coordenador", value: "coordenador" },
  { label: "Instrutor", value: "instrutor" },
  { label: "Aluno", value: "aluno" },
];

const STATUS_FILTER_OPTIONS: { label: string; value: UserStatus | "" }[] = [
  { label: "Todos os status", value: "" },
  { label: "Ativo", value: "ativo" },
  { label: "Desativado", value: "inativo" },
  { label: "Pendente de ativação", value: "pendente_ativacao" },
  { label: "Bloqueado", value: "bloqueado" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Nome A-Z", value: "nome_asc" },
  { label: "Nome Z-A", value: "nome_desc" },
  { label: "Último acesso mais recente", value: "acesso_recente" },
  { label: "Último acesso mais antigo", value: "acesso_antigo" },
];

const hasActiveFilter = (
  searchTerm: string,
  roleFilter: UserRole | "",
  statusFilter: UserStatus | "",
  sortBy: SortOption,
) =>
  searchTerm.trim() !== "" ||
  roleFilter !== "" ||
  statusFilter !== "" ||
  sortBy !== "nome_asc";

export const UsersPageContent = ({
  pagina,
  filtros,
  courses,
  classes,
  currentUserId = null,
}: UsersPageContentProps) => {
  const router = useRouter();
  const users = pagina.itens;

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BaseUser | null>(null);

  // O campo de busca guarda o que esta sendo digitado para a digitacao nao
  // engasgar; a URL so e atualizada depois de uma pausa. Os seletores nao
  // precisam disso e vao direto.
  const [searchTerm, setSearchTerm] = useState(filtros.busca ?? "");
  const roleFilter = (filtros.perfil ?? "") as UserRole | "";
  const statusFilter = (filtros.status ?? "") as UserStatus | "";
  const sortBy = (filtros.ordenacao ?? "nome_asc") as SortOption;

  const aplicarFiltros = useCallback(
    (novos: FiltrosDeUsuarios) => {
      const query = new URLSearchParams();
      const combinado: FiltrosDeUsuarios = {
        busca: searchTerm,
        perfil: roleFilter,
        status: statusFilter,
        ordenacao: sortBy,
        ...novos,
      };

      for (const [chave, valor] of Object.entries(combinado)) {
        // "nome_asc" e o padrao: fora da URL, "Limpar filtros" volta ao
        // endereco base.
        if (valor && valor !== "nome_asc") query.set(chave, valor);
      }

      // Sempre volta para a primeira pagina: o resultado mudou, e a pagina 7
      // do filtro anterior provavelmente nem existe no novo.
      const texto = query.toString();
      router.push(
        texto ? `/coordenador/usuarios?${texto}` : "/coordenador/usuarios",
      );
    },
    [router, searchTerm, roleFilter, statusFilter, sortBy],
  );

  useEffect(() => {
    const atual = filtros.busca ?? "";
    if (searchTerm === atual) return;

    const timeout = window.setTimeout(
      () => aplicarFiltros({ busca: searchTerm }),
      400,
    );
    return () => window.clearTimeout(timeout);
  }, [searchTerm, filtros.busca, aplicarFiltros]);

  const [confirmState, setConfirmState] = useState<{
    user: BaseUser;
    targetStatus: "ativo" | "inativo";
  } | null>(null);
  const [userPendingDeletion, setUserPendingDeletion] =
    useState<BaseUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCloseEditModal = () => {
    setSelectedUser(null);
  };

  const handleStatusChange = (
    user: BaseUser,
    targetStatus: "ativo" | "inativo",
  ) => {
    setConfirmState({ user, targetStatus });
  };

  const handleConfirmDelete = async () => {
    if (!userPendingDeletion) return;

    setIsDeleting(true);
    setErrorMessage(null);

    const result = await excluirUsuarioAction(userPendingDeletion.id);

    setIsDeleting(false);

    if (!result.sucesso) {
      setErrorMessage(result.mensagem);
      return;
    }

    setUserPendingDeletion(null);
  };

  const handleConfirmStatus = async () => {
    if (!confirmState) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = await atualizarStatusUsuarioAction(
      confirmState.user.id,
      confirmState.targetStatus,
    );

    setIsLoading(false);

    if (!result.sucesso) {
      setErrorMessage(result.mensagem);
      return;
    }

    setConfirmState(null);
  };

  const handleCancelStatus = () => {
    setErrorMessage(null);
    setConfirmState(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    aplicarFiltros({
      busca: "",
      perfil: "",
      status: "",
      ordenacao: "nome_asc",
    });
  };

  // A filtragem e a ordenacao agora acontecem no banco: filtrar aqui pegaria
  // apenas a pagina aberta e esconderia quem esta nas outras.

  const desativando = confirmState?.targetStatus === "inativo";

  const confirmTitle = desativando ? "Desativar usuário?" : "Ativar usuário?";
  const confirmDescription = desativando
    ? "A conta perde o acesso ao sistema, mas nada é apagado: os dados e o histórico continuam no lugar e a conta pode ser reativada a qualquer momento."
    : "Este usuário poderá acessar o sistema novamente.";
  const confirmLabel = desativando ? "Desativar usuário" : "Ativar usuário";
  const confirmTone = desativando ? ("danger" as const) : ("neutral" as const);

  return (
    <>
      <CoordinatorPageHeader
        title="Usuários"
        subtitle="Gerencie os acessos de coordenadores, instrutores e alunos."
        action={
          <button
            type="button"
            onClick={() => setIsNewUserModalOpen(true)}
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo usuário
          </button>
        }
      />

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        courses={courses}
        classes={classes}
      />

      <EditUserModal
        isOpen={selectedUser !== null}
        user={selectedUser}
        onClose={handleCloseEditModal}
      />

      <section className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-[#D5DDEC] bg-white p-4 shadow-sm">
        <div className="min-w-48 flex-[1_1_0%]">
          <label
            htmlFor="user-search"
            className="mb-1 block font-medium text-slate-700 text-xs"
          >
            Buscar
          </label>
          <input
            id="user-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF"
            className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-dark focus:outline-none"
          />
        </div>

        <div className="min-w-36">
          <label
            htmlFor="role-filter"
            className="mb-1 block font-medium text-slate-700 text-xs"
          >
            Perfil
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => aplicarFiltros({ perfil: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-dark focus:outline-none"
          >
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-36">
          <label
            htmlFor="status-filter"
            className="mb-1 block font-medium text-slate-700 text-xs"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => aplicarFiltros({ status: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-dark focus:outline-none"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label
            htmlFor="sort-by"
            className="mb-1 block font-medium text-slate-700 text-xs"
          >
            Ordenar por
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => aplicarFiltros({ ordenacao: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-dark focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className={`mb-px h-9 cursor-pointer rounded-lg border border-slate-300 px-4 font-medium text-xs transition-colors hover:bg-slate-100 ${
            hasActiveFilter(searchTerm, roleFilter, statusFilter, sortBy)
              ? "text-slate-600"
              : "invisible text-slate-600"
          }`}
        >
          Limpar filtros
        </button>
      </section>

      {users.length > 0 ? (
        <>
          <UserTable
            users={users}
            showActions
            onEdit={setSelectedUser}
            onStatusChange={handleStatusChange}
            onDelete={setUserPendingDeletion}
            currentUserId={currentUserId}
          />

          <Paginacao
            pagina={pagina.pagina}
            porPagina={pagina.porPagina}
            total={pagina.total}
            href="/coordenador/usuarios"
            parametros={filtros}
            rotulo="usuário"
            rotuloPlural="usuários"
          />
        </>
      ) : (
        <section className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-900 text-sm">
              Nenhum usuário encontrado com os filtros atuais.
            </p>
          </div>
        </section>
      )}

      {userPendingDeletion && (
        <ConfirmDialog
          title="Excluir usuário?"
          description={`${userPendingDeletion.nome} será apagado do sistema, junto com tudo que estiver vinculado à conta. Essa ação não pode ser desfeita.`}
          confirmLabel={isDeleting ? "Excluindo..." : "Excluir usuário"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeleting}
          onCancel={() => {
            setErrorMessage(null);
            setUserPendingDeletion(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title={confirmTitle}
          description={confirmDescription}
          confirmLabel={confirmLabel}
          cancelLabel="Cancelar"
          tone={confirmTone}
          isLoading={isLoading}
          onCancel={handleCancelStatus}
          onConfirm={handleConfirmStatus}
        />
      )}

      {errorMessage && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-60 flex justify-center pt-4">
          <Notificacao
            tipo="erro"
            className="pointer-events-auto w-full max-w-md shadow-lg"
          >
            {errorMessage}
          </Notificacao>
        </div>
      )}
    </>
  );
};
