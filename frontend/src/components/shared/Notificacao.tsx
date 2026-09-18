"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type NotificacaoTipo = "sucesso" | "erro" | "aviso" | "info";

/**
 * - "flutuante" (padrao): cartao fixo no topo da tela, centralizado sobre o
 *   conteudo, que se anuncia e sai de cena sozinho. E o lugar do recado de
 *   acao ("salvo", "falhou"), que o usuario le e esquece.
 * - "inline": no fluxo da pagina, onde foi escrito, e sem prazo. E o lugar do
 *   recado que e *estado* e nao evento — o aviso de chamada pendente, o
 *   "reprovado por falta", a explicacao dentro de um formulario — e das telas
 *   de acesso, onde o aviso pertence ao cartao branco do formulario.
 */
export type NotificacaoPosicao = "flutuante" | "inline";

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

// Largura e sombra do cartao flutuante. Sete telas carregavam esta medida
// copiada na mao, e a copia derivou: top-4 contra top-5, z-50 contra z-60,
// max-w-xl contra 42rem. Agora existe uma vez so.
const FLUTUANTE = "pointer-events-auto w-[min(92vw,42rem)] shadow-lg";

const PRAZO_PADRAO_FLUTUANTE = 7000;
const DURACAO_DA_SAIDA = 350;

/**
 * Prazo para a TELA zerar o estado que faz o aviso aparecer (o `feedback`, a
 * `successMessage`) — 7s de leitura mais a animacao de saida.
 *
 * O aviso se esconde sozinho, mas esconder nao basta: como a tela continua
 * montando o mesmo componente, ele guarda "ja fui dispensado" e a proxima
 * acao com a mesma mensagem nao apareceria. Quem zera o estado desmonta o
 * aviso, e o proximo nasce limpo.
 *
 * Existe exportado para que o numero viva num lugar so: as telas tinham cada
 * uma o seu, entre 3s e 3,5s, e nenhuma esperava a animacao terminar.
 */
export const PRAZO_PARA_LIMPAR_AVISO =
  PRAZO_PADRAO_FLUTUANTE + DURACAO_DA_SAIDA;

// A pilha vive fora da arvore do React, colada no <body>, por dois motivos:
// aviso preso dentro de um container com `overflow` ou `transform` fica
// recortado ou ancorado no lugar errado, e dois avisos ao mesmo tempo
// precisam empilhar em vez de se sobrepor.
//
// Centralizar pelo flex do container, e nao por `left-1/2 -translate-x-1/2`,
// tambem conserta um bug antigo: as animacoes escrevem `transform:
// translateY(...)`, que apagava o translate-x e fazia o aviso saltar na
// horizontal enquanto entrava.
// z acima de tudo, inclusive do ConfirmDialog (z-[100]): o aviso e a resposta
// do sistema a uma acao e nao pode nascer atras do que estava aberto na tela.
const ID_PILHA = "adm4all-avisos";
const CLASSES_PILHA =
  "pointer-events-none fixed inset-x-0 top-4 z-[110] flex flex-col items-center gap-y-2 px-4";

const usarPilhaDeAvisos = (ativo: boolean) => {
  const [pilha, setPilha] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ativo) {
      return;
    }

    let elemento = document.getElementById(ID_PILHA);

    if (!elemento) {
      elemento = document.createElement("div");
      elemento.id = ID_PILHA;
      elemento.className = CLASSES_PILHA;
      document.body.appendChild(elemento);
    }

    setPilha(elemento);
  }, [ativo]);

  return pilha;
};

interface NotificacaoProps {
  tipo: NotificacaoTipo;
  children: ReactNode;
  /**
   * Espacamento em relacao ao bloco vizinho (ex.: "mt-4", "mb-4"). So vale
   * para a posicao "inline": o cartao flutuante nao tem bloco vizinho, e a
   * margem que o ponto de uso pediu para o fluxo o empurraria para fora do
   * lugar.
   */
  className?: string;
  id?: string;
  /**
   * Prazo, em ms, para o aviso sumir sozinho. Omitido, o flutuante sai em 7s e
   * o inline fica. `null` segura na tela em qualquer posicao.
   */
  autoDismissAfterMs?: number | null;
  posicao?: NotificacaoPosicao;
}

export const Notificacao = ({
  tipo,
  children,
  className,
  id,
  autoDismissAfterMs,
  posicao = "flutuante",
}: NotificacaoProps) => {
  const [saindo, setSaindo] = useState(false);
  const [dispensado, setDispensado] = useState(false);
  const flutuante = posicao === "flutuante";
  const pilha = usarPilhaDeAvisos(flutuante && !dispensado);

  // O padrao ja foi `autoDismissAfterMs ?? 7000` para todo mundo, e o sumico de
  // sete segundos atingia tambem o que precisava ficar: o "Voce foi reprovado
  // por falta" do painel do aluno e o aviso de ativacao dos formularios de
  // cadastro desapareciam e nao voltavam mais. O prazo agora acompanha a
  // posicao — quem flutua passa, quem esta no fluxo fica — e `null` ou um
  // numero explicito continuam mandando mais que o padrao.
  const prazo =
    autoDismissAfterMs === undefined
      ? flutuante
        ? PRAZO_PADRAO_FLUTUANTE
        : null
      : autoDismissAfterMs;

  useEffect(() => {
    if (!prazo) {
      return;
    }

    setSaindo(false);
    setDispensado(false);

    const iniciarSaida = window.setTimeout(() => setSaindo(true), prazo);
    const remover = window.setTimeout(
      () => setDispensado(true),
      prazo + DURACAO_DA_SAIDA,
    );

    return () => {
      window.clearTimeout(iniciarSaida);
      window.clearTimeout(remover);
    };
  }, [prazo]);

  if (dispensado) {
    return null;
  }

  const espacamento = flutuante ? FLUTUANTE : (className ?? "");
  const classes = `${BASE} ${TONS[tipo]} ${
    saindo ? "animate-subir" : "animate-descer"
  }${espacamento ? ` ${espacamento}` : ""}`;

  // Erro e aviso interrompem o leitor de tela porque exigem uma acao de quem
  // esta na tela; sucesso e informacao entram como atualizacao educada.
  const cartao =
    tipo === "erro" || tipo === "aviso" ? (
      <div className={classes} id={id} role="alert">
        {children}
      </div>
    ) : (
      <output aria-live="polite" className={classes} id={id}>
        {children}
      </output>
    );

  if (!flutuante) {
    return cartao;
  }

  // Primeiro render no servidor, e o primeiro no cliente antes do efeito, nao
  // tem pilha: o aviso entra logo depois, junto com a hidratacao.
  return pilha ? createPortal(cartao, pilha) : null;
};
