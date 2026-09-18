"use client";

import { avaliarSenha, type NivelSenha } from "@/utils/senha";

/**
 * Barra de forca da senha: tres segmentos que vao de vermelho a verde.
 *
 * So a barra. A lista de requisitos que abria embaixo do campo saiu de todas as
 * telas em 18/09 — quem diz o que falta na senha e a mensagem de erro do
 * proprio campo, que todos os formularios de senha mostram a cada tecla.
 */
interface MedidorForcaSenhaProps {
  senha: string;
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
    </div>
  );
};
