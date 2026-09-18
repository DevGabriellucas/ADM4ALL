interface BotaoVerSenhaProps {
  visivel: boolean;
  onClick: () => void;
  /** id do input controlado, para o aria-controls. */
  controla?: string;
  disabled?: boolean;
  /** Complemento do rotulo, para telas com dois campos de senha. */
  descricao?: string;
  /**
   * Onde o botao se apoia dentro do container `relative`:
   * - "abaixoDaLabel": o container tem label + input (componente Input)
   * - "centro": o container envolve so o input (formulario de cadastro)
   * - "campoAlto": o container tem so o input h-14 e, quando ha erro, o texto
   *   do erro embaixo (tela de ativacao). Medido a partir do topo de proposito:
   *   centralizar faria o olho escorregar para baixo assim que o erro
   *   aparecesse.
   */
  posicao?: "abaixoDaLabel" | "centro" | "campoAlto";
}

const POSICOES = {
  abaixoDaLabel: "top-[1.85rem]",
  centro: "-translate-y-1/2 top-1/2",
  // (3.5rem do campo - 2rem do botao) / 2
  campoAlto: "top-3",
} as const;

// O olho de mostrar/ocultar senha vivia copiado em tres telas, cada uma com o
// seu desenho. Agora e um componente so — trocar o icone e mexer aqui.
//
// `onMouseDown` com preventDefault mantem o foco no input: sem isso, clicar no
// olho tira o cursor do campo e a pessoa perde a posicao do que digitava.
export const BotaoVerSenha = ({
  visivel,
  onClick,
  controla,
  disabled = false,
  descricao,
  posicao = "abaixoDaLabel",
}: BotaoVerSenhaProps) => {
  const acao = visivel ? "Ocultar" : "Mostrar";
  const rotulo = descricao ? `${acao} ${descricao}` : `${acao} senha`;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(evento) => evento.preventDefault()}
      aria-label={rotulo}
      aria-pressed={visivel}
      aria-controls={controla}
      title={rotulo}
      disabled={disabled}
      className={`absolute right-1.5 z-10 flex size-8 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-800 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 ${POSICOES[posicao]}`}
    >
      <svg
        aria-hidden="true"
        className="size-[1.1rem]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {visivel ? (
          <>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.64 0 8.1 3.35 9.58 5.31a1.13 1.13 0 0 1 0 1.38 16.4 16.4 0 0 1-2.1 2.3" />
            <path d="M6.6 6.63A16.1 16.1 0 0 0 2.42 10.7a1.13 1.13 0 0 0 0 1.38C3.9 14.05 7.36 17.4 12 17.4a10.6 10.6 0 0 0 4.1-.82" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="m3.5 3.5 17 17" />
          </>
        ) : (
          <>
            <path d="M2.42 10.7C3.9 8.74 7.36 5.39 12 5.39s8.1 3.35 9.58 5.31a1.13 1.13 0 0 1 0 1.38c-1.48 1.96-4.94 5.31-9.58 5.31s-8.1-3.35-9.58-5.31a1.13 1.13 0 0 1 0-1.38Z" />
            <circle cx="12" cy="11.39" r="2.75" />
          </>
        )}
      </svg>
    </button>
  );
};
