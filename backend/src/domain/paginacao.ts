// Paginacao das listagens.
//
// As telas traziam a tabela inteira a cada abertura. No volume de hoje isso nao
// pesa, mas as listagens de alunos, usuarios e certificados acumulam para
// sempre: ~300 por ano, sem nada que as limite.

export const ITENS_POR_PAGINA_PADRAO = 25;

// Teto por pagina, para que um cliente nao peca a tabela inteira de volta so
// mandando porPagina=999999.
export const ITENS_POR_PAGINA_MAXIMO = 100;

export interface Paginacao {
  /** Comeca em 1. */
  pagina: number;
  porPagina: number;
}

export interface Pagina<T> {
  itens: T[];
  /** Total de linhas que atendem ao filtro, nao o tamanho de `itens`. */
  total: number;
  pagina: number;
  porPagina: number;
}

const paraInteiro = (valor: unknown): number | null => {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return Math.trunc(valor);
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    const numero = Number(valor);
    return Number.isFinite(numero) ? Math.trunc(numero) : null;
  }

  return null;
};

// Tudo aqui chega pela query string, entao qualquer coisa pode vir: vazio,
// texto, negativo, fracionario. Sai sempre uma paginacao valida.
export function normalizarPaginacao(
  pagina?: unknown,
  porPagina?: unknown,
): Paginacao {
  const paginaPedida = paraInteiro(pagina) ?? 1;
  const tamanhoPedido = paraInteiro(porPagina) ?? ITENS_POR_PAGINA_PADRAO;

  return {
    pagina: paginaPedida < 1 ? 1 : paginaPedida,
    porPagina: Math.min(
      Math.max(tamanhoPedido, 1),
      ITENS_POR_PAGINA_MAXIMO,
    ),
  };
}

export function totalDePaginas(total: number, porPagina: number): number {
  if (total <= 0) return 0;
  return Math.ceil(total / porPagina);
}
