import { unstable_rethrow } from "next/navigation";

// Mensagem de erro para devolver de uma server action.
//
// Toda action daqui embrulha a chamada num try/catch, e o catch engolia o
// desvio do proprio Next: o apiClient responde a um 401 chamando redirect(),
// que sinaliza o desvio LANCANDO um erro cuja mensagem e a string
// "NEXT_REDIRECT". O resultado na tela era um banner vermelho escrito
// NEXT_REDIRECT, os cookies velhos nunca eram limpos e o clique seguinte
// repetia tudo.
//
// Isso deixou de ser caso raro quando a sessao passou a ser revalidada a cada
// request: para conta bloqueada ou excluida, o 401 virou rotina.
//
// unstable_rethrow devolve ao Next os erros de controle de fluxo dele
// (redirect, notFound) e retorna normalmente para qualquer outro erro.
export function mensagemDeErroDeAction(
  erro: unknown,
  alternativa: string,
): string {
  unstable_rethrow(erro);

  return erro instanceof Error ? erro.message : alternativa;
}
