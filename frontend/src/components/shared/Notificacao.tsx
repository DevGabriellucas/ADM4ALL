"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export type NotificacaoTipo = "sucesso" | "erro" | "aviso" | "info";

// O padrao visual nasceu nos avisos do painel do aluno (aprovacao, reprovacao
// por falta e certificado liberado). Todo aviso do sistema usa este mesmo
// cartao para o usuario reconhecer na hora que aquilo e um recado do sistema.
const TONS: Record<NotificacaoTipo, string> = {
  sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800",
  erro: "border-red-200 bg-red-50 text-red-800",
  aviso: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const BASE =
  "block rounded-lg border px-6 py-4 text-center font-medium text-xs leading-6 tracking-[0.25em]";

interface NotificacaoProps {
  tipo: NotificacaoTipo;
  children: ReactNode;
  /** Espacamento em relacao ao bloco vizinho (ex.: "mt-4", "mb-4"). */
  className?: string;
  id?: string;
  /**
   * Prazo, em ms, para o aviso sumir sozinho. Sem prazo, ele fica na tela —
   * que e o comportamento certo para aviso de status.
   */
  autoDismissAfterMs?: number | null;
}

export const Notificacao = ({
  tipo,
  children,
  className,
  id,
  autoDismissAfterMs,
}: NotificacaoProps) => {
  const [saindo, setSaindo] = useState(false);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    // Sem prazo pedido, o aviso permanece.
    //
    // O padrao era o inverso — `autoDismissAfterMs ?? 7000` — entao todo ponto
    // de uso que omitisse a prop, ou seja quase todos, ganhava um sumico de
    // sete segundos que ninguem pediu. Avisos permanentes iam junto: o "Voce
    // foi reprovado por falta" do painel do aluno e o aviso de ativacao dos
    // tres formularios de cadastro desapareciam sozinhos e nao voltavam mais.
    if (!autoDismissAfterMs) {
      return;
    }

    setSaindo(false);
    setDispensado(false);

    const iniciarSaida = window.setTimeout(
      () => setSaindo(true),
      autoDismissAfterMs,
    );
    const remover = window.setTimeout(
      () => setDispensado(true),
      autoDismissAfterMs + 350,
    );

    return () => {
      window.clearTimeout(iniciarSaida);
      window.clearTimeout(remover);
    };
  }, [autoDismissAfterMs]);

  if (dispensado) {
    return null;
  }

  const classes = `${BASE} ${TONS[tipo]} ${saindo ? "animate-subir" : "animate-descer"}${className ? ` ${className}` : ""}`;

  // Erro e aviso interrompem o leitor de tela porque exigem uma acao de quem
  // esta na tela; sucesso e informacao entram como atualizacao educada.
  if (tipo === "erro" || tipo === "aviso") {
    return (
      <div className={classes} id={id} role="alert">
        {children}
      </div>
    );
  }

  return (
    <output aria-live="polite" className={classes} id={id}>
      {children}
    </output>
  );
};
