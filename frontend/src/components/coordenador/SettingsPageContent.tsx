"use client";

import { useState } from "react";
import { obterConfiguracoesAction } from "@/app/coordenador/actions";
import { CertificadoCard } from "@/components/coordenador/CertificadoCard";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { InstituicaoCard } from "@/components/coordenador/InstituicaoCard";
import { PeriodoLetivoCard } from "@/components/coordenador/PeriodoLetivoCard";
import { PreferenciasCard } from "@/components/coordenador/PreferenciasCard";
import { Notificacao } from "@/components/shared/Notificacao";
import type { ConfiguracoesData } from "@/schemas/configuracionsSchema";

interface SettingsPageContentProps {
  configuracoesInicial: ConfiguracoesData;
}

const STATUS_LABELS: Record<string, string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  encerrada: "Encerrada",
};

export const SettingsPageContent = ({
  configuracoesInicial,
}: SettingsPageContentProps) => {
  const [configuracoes, setConfiguracoes] = useState(configuracoesInicial);
  const [error, setError] = useState<string | null>(null);

  const handleConfigurationUpdated = async () => {
    try {
      const dados = await obterConfiguracoesAction();
      setConfiguracoes(dados);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao recarregar configuracoes",
      );
    }
  };

  return (
    <>
      <CoordinatorPageHeader
        title="Configurações"
        subtitle="Parâmetros acadêmicos e operacionais usados pelo ADM4All."
      />

      <section
        aria-label="Resumo das configurações"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Período letivo"
          value={configuracoes.periodoLetivo.valor}
          subtitle="Atual em novas turmas"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Máximo de faltas"
          value={configuracoes.certificado.maximoFaltas}
          subtitle="Para emissão de certificado"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Capacidade padrão"
          value={configuracoes.preferencias.capacidadePadrao}
          subtitle="Alunos por nova turma"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Status padrão"
          value={
            STATUS_LABELS[configuracoes.preferencias.statusPadrao] ??
            configuracoes.preferencias.statusPadrao
          }
          subtitle="Ao criar turma"
          variant="green"
        />
      </section>

      {error && <Notificacao tipo="erro">{error}</Notificacao>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <InstituicaoCard
          className="xl:col-span-2"
          initialData={configuracoes.instituicao}
          onSuccess={handleConfigurationUpdated}
        />

        <PeriodoLetivoCard
          initialData={configuracoes.periodoLetivo.valor}
          onSuccess={handleConfigurationUpdated}
        />

        <CertificadoCard
          initialData={configuracoes.certificado}
          onSuccess={handleConfigurationUpdated}
        />

        <PreferenciasCard
          className="xl:col-span-2"
          initialData={configuracoes.preferencias}
          onSuccess={handleConfigurationUpdated}
        />
      </div>
    </>
  );
};
