"use client";

import { useCallback, useState } from "react";
import { baixarMaterialAlunoAction } from "@/app/aluno/actions";
import type { MaterialAluno } from "@/types/aluno";

interface AlunoMateriaisListProps {
  materiais: MaterialAluno[];
}

const formatarData = (dataIso: string) => {
  const data = new Date(dataIso);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatarTipo = (tipo: string) => {
  const mapa: Record<string, string> = {
    pdf: "PDF",
    video: "Vídeo",
    imagem: "Imagem",
    documento: "Documento",
    link: "Link",
    outro: "Outro",
  };
  return mapa[tipo] ?? tipo;
};

const agruparPorTurma = (
  materiais: MaterialAluno[],
): Map<string, MaterialAluno[]> => {
  const grupos = new Map<string, MaterialAluno[]>();

  for (const material of materiais) {
    const existente = grupos.get(material.turmaNome);
    if (existente) {
      existente.push(material);
    } else {
      grupos.set(material.turmaNome, [material]);
    }
  }

  return grupos;
};

export const AlunoMateriaisList = ({ materiais }: AlunoMateriaisListProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [erroId, setErroId] = useState<string | null>(null);

  const handleDownload = useCallback(async (material: MaterialAluno) => {
    setLoadingId(material.id);
    setErroId(null);

    try {
      const result = await baixarMaterialAlunoAction(material.id);
      const binary = atob(result.base64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(
        new Blob([bytes], { type: result.contentType }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErroId(material.id);
    } finally {
      setLoadingId(null);
    }
  }, []);

  if (materiais.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-[#F1F4FC] px-8 py-16 text-center">
        <p className="text-slate-600 text-sm tracking-[0.25em]">
          Nenhum material disponível no momento.
        </p>
      </div>
    );
  }

  const grupos = agruparPorTurma(materiais);

  return (
    <div className="flex flex-col gap-y-8">
      {Array.from(grupos.entries()).map(([turmaNome, itens]) => (
        <div key={turmaNome} className="flex flex-col gap-y-4">
          <h3 className="font-semibold text-brand-medium text-sm tracking-[0.35em]">
            {turmaNome}
          </h3>

          <div className="flex flex-col gap-y-3">
            {itens.map((material) => {
              const isLoading = loadingId === material.id;
              const hasError = erroId === material.id;

              return (
                <div
                  key={material.id}
                  className="flex flex-col gap-y-2 rounded-lg bg-[#F1F4FC] px-5 py-4"
                >
                  <div className="flex flex-col gap-y-1 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-medium text-sm">{material.titulo}</h4>

                    <span className="font-medium text-brand-medium text-xs tracking-[0.25em]">
                      {formatarTipo(material.tipo)}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs tracking-[0.2em]">
                    Turma: {material.turmaNome} | Publicado em:{" "}
                    {formatarData(material.criadoEm)}
                  </p>

                  {material.urlArquivo ? (
                    <div className="mt-1">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDownload(material)}
                        className="inline-flex w-fit cursor-pointer items-center gap-x-1 rounded-md bg-brand-medium px-3 py-1.5 font-medium text-slate-950 text-xs transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? "Baixando..." : "Baixar material"}
                      </button>

                      {hasError && (
                        <span className="ml-3 font-medium text-red-700 text-xs tracking-[0.2em]">
                          Não foi possível baixar este material. Tente
                          novamente.
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="mt-1 font-medium text-red-700 text-xs tracking-[0.2em]">
                      Material indisponível no momento.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
