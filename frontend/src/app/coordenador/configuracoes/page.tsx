"use client";

import { useEffect, useState } from "react";
import { BackButton } from "@/components/shared/BackButton";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { InstituicaoCard } from "@/components/coordenador/InstituicaoCard";
import { PeriodoLetivoCard } from "@/components/coordenador/PeriodoLetivoCard";
import { CertificadoCard } from "@/components/coordenador/CertificadoCard";
import { PreferenciasCard } from "@/components/coordenador/PreferenciasCard";
import { configService } from "@/services/configService";
import type { ConfiguracoesData } from "@/schemas/configuracionsSchema";

export default function CoordinatorSettingsPage() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const dados = await configService.obter();
        setConfiguracoes(dados);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar configurações"
        );
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  const handleConfigurationUpdated = async () => {
    try {
      const dados = await configService.obter();
      setConfiguracoes(dados);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao recarregar configurações"
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
        subtitle="Ajuste os parâmetros do ADM4All sem necessidade de alteração no código"
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
