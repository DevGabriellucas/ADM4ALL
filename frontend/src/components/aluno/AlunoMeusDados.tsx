"use client";

import { useState } from "react";
import { baixarMeusDadosAlunoAction } from "@/app/aluno/actions";
import { downloadBase64File } from "@/utils/downloadFile";

/**
 * Direito de acesso do titular (LGPD, Art. 18, II e V).
 *
 * O aluno baixa, em JSON, tudo que o sistema guarda sobre ele: cadastro,
 * matriculas, frequencias e certificados. JSON de proposito — e legivel por
 * pessoa e carregavel por outro sistema, que e o que a portabilidade pede.
 */
export const AlunoMeusDados = () => {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const baixar = async () => {
    setBaixando(true);
    setErro(null);

    try {
      downloadBase64File(await baixarMeusDadosAlunoAction());
    } catch (falha: unknown) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível baixar seus dados. Tente novamente.",
      );
    } finally {
      setBaixando(false);
    }
  };

  return (
    <section
      aria-labelledby="meus-dados-titulo"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2
        id="meus-dados-titulo"
        className="font-semibold text-lg text-slate-950"
      >
        Meus dados
      </h2>
      <p className="mt-2 text-slate-600 text-sm leading-6">
        Baixe uma cópia de tudo que o sistema guarda sobre você: cadastro,
        matrículas, frequência e certificados. Para corrigir ou apagar algum
        dado, fale com a coordenação do curso.
      </p>

      <button
        type="button"
        onClick={baixar}
        disabled={baixando}
        className="mt-4 inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {baixando ? "Preparando..." : "Baixar meus dados"}
      </button>

      {erro && (
        <p className="mt-3 text-red-700 text-sm" role="alert">
          {erro}
        </p>
      )}
    </section>
  );
};
