export const ITENS_POR_PAGINA = 25;

export interface Pagina<T> {
  itens: T[];
  /** Total de linhas que atendem ao filtro, nao o tamanho de `itens`. */
  total: number;
  pagina: number;
  porPagina: number;
}

export function totalDePaginas(total: number, porPagina: number): number {
  if (total <= 0 || porPagina <= 0) return 0;
  return Math.ceil(total / porPagina);
}

// A pagina pedida chega pela URL, entao pode vir qualquer coisa.
export function paginaDaUrl(valor: string | string[] | undefined): number {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  const numero = Number(bruto);

  return Number.isFinite(numero) && numero >= 1 ? Math.trunc(numero) : 1;
}

export function textoDaUrl(
  valor: string | string[] | undefined,
): string | undefined {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  return bruto?.trim() ? bruto.trim() : undefined;
}

// Os cartoes do topo contam sobre a base (Alunos) ou sobre o resultado
// filtrado (Certificados), nunca sobre a pagina aberta, entao vem do servidor
// junto com ela.
export interface ResumoDeAlunos {
  ativos: number;
  pendentes: number;
  emRisco: number;
}

export interface ResumoDeCertificados {
  elegiveis: number;
  pendentes: number;
  emitidos: number;
  inelegiveis: number;
}
