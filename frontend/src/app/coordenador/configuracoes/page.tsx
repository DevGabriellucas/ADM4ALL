"use client";

import { useEffect, useState } from "react";
import { obterConfiguracoesAction } from "@/app/coordenador/actions";
import { CertificadoCard } from "@/components/coordenador/CertificadoCard";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { InstituicaoCard } from "@/components/coordenador/InstituicaoCard";
import { PeriodoLetivoCard } from "@/components/coordenador/PeriodoLetivoCard";
import { PreferenciasCard } from "@/components/coordenador/PreferenciasCard";
import { BackButton } from "@/components/shared/BackButton";
import type { ConfiguracoesData } from "@/schemas/configuracionsSchema";

export default function CoordinatorSettingsPage() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const dados = await obterConfiguracoesAction();
        setConfiguracoes(dados);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar configurações",
        );
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  const handleConfigurationUpdated = async () => {
    try {
      const dados = await obterConfiguracoesAction();
      setConfiguracoes(dados);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao recarregar configurações",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Carregando configurações...</div>
      </div>
    );
  }

  if (error && !configuracoes) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!configuracoes) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-yellow-700">Nenhuma configuração disponível</p>
      </div>
    );
  }

  return (
    <>
      <BackButton className="mb-4" />
      <CoordinatorPageHeader
        title="Configurações do Sistema"
        subtitle="Configure informações institucionais e preferências usadas na gestão acadêmica."
      />

      <div className="mt-6 space-y-6">
        <InstituicaoCard
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
          initialData={configuracoes.preferencias}
          onSuccess={handleConfigurationUpdated}
        />
      </div>
    </>
  );
}
