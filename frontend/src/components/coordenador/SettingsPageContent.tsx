"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import type { CoordinatorSettings } from "@/types/coordinator";

interface SettingsPageContentProps {
  settings: CoordinatorSettings;
}

const INPUT_STYLES =
  "h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30";

export const SettingsPageContent = ({ settings }: SettingsPageContentProps) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const showVisualFeedback = (message: string) => {
    setFeedback(message);
  };

  return (
    <>
      <CoordinatorPageHeader
        title="Configurações"
        subtitle="Gerencie preferências e dados administrativos"
      />

      {feedback && (
        <output
          aria-live="polite"
          className="block rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 text-sm"
        >
          {feedback}
        </output>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="account-settings-heading"
          className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
        >
          <h2
            id="account-settings-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Dados do coordenador
          </h2>
          <p className="mt-1 text-slate-500 text-xs">
            Informações administrativas da conta responsável.
          </p>

          <form className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Nome
              <input
                type="text"
                defaultValue={settings.account.nome}
                className={INPUT_STYLES}
              />
            </label>
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              E-mail
              <input
                type="email"
                defaultValue={settings.account.email}
                className={INPUT_STYLES}
              />
            </label>
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Telefone
              <input
                type="tel"
                defaultValue={settings.account.telefone}
                className={INPUT_STYLES}
              />
            </label>
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Cargo
              <input
                type="text"
                defaultValue={settings.account.cargo}
                className={INPUT_STYLES}
              />
            </label>

            <div className="sm:col-span-2 sm:text-right">
              <button
                type="button"
                onClick={() =>
                  showVisualFeedback("Dados administrativos validados.")
                }
                className="h-10 rounded-lg bg-brand-dark px-4 font-semibold text-white text-xs transition-colors hover:bg-[#292E68]"
              >
                Salvar dados
              </button>
            </div>
          </form>
        </section>

        <section
          aria-labelledby="system-settings-heading"
          className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
        >
          <h2
            id="system-settings-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Preferências do sistema
          </h2>
          <p className="mt-1 text-slate-500 text-xs">
            Parâmetros gerais usados na operação acadêmica.
          </p>

          <form className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm sm:col-span-2">
              Nome da instituição
              <input
                type="text"
                defaultValue={settings.system.instituicao}
                className={INPUT_STYLES}
              />
            </label>
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Período letivo atual
              <input
                type="text"
                defaultValue={settings.system.periodoLetivo}
                className={INPUT_STYLES}
              />
            </label>
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Frequência mínima para certificado
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={settings.system.frequenciaMinimaCertificado}
                  className={`${INPUT_STYLES} w-full pr-9`}
                />
                <span className="-translate-y-1/2 absolute top-1/2 right-3 text-slate-500 text-sm">
                  %
                </span>
              </div>
            </label>

            <div className="sm:col-span-2 sm:text-right">
              <button
                type="button"
                onClick={() =>
                  showVisualFeedback("Preferências do sistema validadas.")
                }
                className="h-10 rounded-lg bg-brand-dark px-4 font-semibold text-white text-xs transition-colors hover:bg-[#292E68]"
              >
                Salvar preferências
              </button>
            </div>
          </form>
        </section>

        <section
          aria-labelledby="access-settings-heading"
          className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
        >
          <h2
            id="access-settings-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Perfis de acesso
          </h2>
          <p className="mt-1 text-slate-500 text-xs">
            Perfis disponíveis para organização das permissões.
          </p>

          <div className="mt-5 divide-y divide-slate-100">
            {settings.accessProfiles.map((profile) => (
              <label
                key={profile.role}
                className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span>
                  <span className="block font-semibold text-slate-900 text-sm">
                    {profile.label}
                  </span>
                  <span className="mt-1 block text-slate-500 text-xs leading-5">
                    {profile.description}
                  </span>
                </span>
                <input
                  type="checkbox"
                  defaultChecked={profile.enabled}
                  className="mt-1 size-4 accent-brand-dark"
                />
              </label>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="security-settings-heading"
          className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
        >
          <h2
            id="security-settings-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Segurança
          </h2>
          <p className="mt-1 text-slate-500 text-xs">
            Controles de senha e sessões vinculadas à conta.
          </p>

          <dl className="mt-5 grid grid-cols-1 border-slate-200 border-y sm:grid-cols-2 sm:divide-x sm:divide-slate-200">
            <div className="px-1 py-4 sm:pr-5">
              <dt className="text-slate-500 text-xs">Sessões ativas</dt>
              <dd className="mt-1 font-semibold text-2xl text-slate-950">
                {settings.security.sessoesAtivas}
              </dd>
            </div>
            <div className="border-slate-200 border-t px-1 py-4 sm:border-t-0 sm:pl-5">
              <dt className="text-slate-500 text-xs">
                Última alteração de senha
              </dt>
              <dd className="mt-2 font-semibold text-slate-900 text-sm">
                {new Intl.DateTimeFormat("pt-BR", {
                  timeZone: "UTC",
                }).format(new Date(settings.security.ultimaAlteracaoSenha))}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                showVisualFeedback("Alteração de senha preparada.")
              }
              className="h-10 rounded-lg border border-brand-dark bg-white px-4 font-semibold text-brand-dark text-xs transition-colors hover:bg-[#E7ECF8]"
            >
              Alterar senha
            </button>
            <button
              type="button"
              onClick={() =>
                showVisualFeedback("Solicitação de encerramento preparada.")
              }
              className="h-10 rounded-lg border border-red-300 bg-white px-4 font-semibold text-red-700 text-xs transition-colors hover:bg-red-50"
            >
              Sair de todos os dispositivos
            </button>
          </div>
        </section>
      </div>
    </>
  );
};
