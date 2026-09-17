"use client";

import { avaliarSenha, type NivelSenha, REQUISITOS_SENHA } from "@/utils/senha";

interface MedidorForcaSenhaProps {
  senha: string;
  /**
   * Lista de requisitos. Fica escondida ate o usuario entrar no campo de senha,
   * para o formulario nao abrir com um bloco de texto que ninguem pediu.
   */
  mostrarRequisitos?: boolean;
  className?: string;
}

const SEGMENTOS_PREENCHIDOS: Record<NivelSenha, number> = {
  vazia: 0,
  fraca: 1,
  media: 2,
  forte: 3,
};

const COR_DA_BARRA: Record<NivelSenha, string> = {
  vazia: "bg-slate-400/40",
  fraca: "bg-red-600",
  media: "bg-amber-500",
  forte: "bg-emerald-600",
};

export const MedidorForcaSenha = ({
  senha,
  mostrarRequisitos = false,
  className,
}: MedidorForcaSenhaProps) => {
  const forca = avaliarSenha(senha);
  const preenchidos = SEGMENTOS_PREENCHIDOS[forca.nivel];

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <div className="flex h-1.5 gap-1" aria-hidden="true">
        {[0, 1, 2].map((indice) => (
          <span
            key={indice}
            className={`h-full flex-1 rounded-full transition-colors ${
              indice < preenchidos
                ? COR_DA_BARRA[forca.nivel]
                : "bg-slate-400/40"
            }`}
          />
        ))}
      </div>

      {/* A cor sozinha nao chega a quem usa leitor de tela, entao o nivel
          continua escrito — so que invisivel. */}
      <output aria-live="polite" className="sr-only">
        {forca.nivel === "vazia"
          ? ""
          : `Nível de segurança da senha: ${forca.rotulo}`}
      </output>

      {mostrarRequisitos && (
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.7rem] text-slate-700">
          {REQUISITOS_SENHA.map((requisito) => {
            const atende = forca.idsAtendidos.includes(requisito.id);

            return (
              <li
                key={requisito.id}
                className={`flex items-center gap-1 ${
                  atende ? "text-emerald-800" : "text-slate-700"
                }`}
              >
                <span aria-hidden="true">{atende ? "✓" : "•"}</span>
                {requisito.texto}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
