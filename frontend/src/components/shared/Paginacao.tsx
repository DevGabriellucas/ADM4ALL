import Link from "next/link";
import { totalDePaginas } from "@/types/paginacao";

interface PaginacaoProps {
  pagina: number;
  porPagina: number;
  total: number;
  /** Caminho da tela, ex.: "/coordenador/alunos". */
  href: string;
  /** Filtros da tela, preservados ao trocar de pagina. */
  parametros?: Record<string, string | undefined>;
  /** Nome do que esta listado, para a contagem ("aluno", "turma"). */
  rotulo: string;
  rotuloPlural?: string;
}

const enderecoDaPagina = (
  href: string,
  parametros: Record<string, string | undefined>,
  pagina: number,
) => {
  const query = new URLSearchParams();

  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor) query.set(chave, valor);
  }

  // Pagina 1 nao entra na URL: mantem o endereco limpo e faz "Limpar filtros"
  // voltar exatamente para o endereco base.
  if (pagina > 1) query.set("pagina", String(pagina));

  const texto = query.toString();
  return texto ? `${href}?${texto}` : href;
};

const CLASSE_BOTAO =
  "rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 text-xs transition-colors hover:bg-slate-100";

export const Paginacao = ({
  pagina,
  porPagina,
  total,
  href,
  parametros = {},
  rotulo,
  rotuloPlural,
}: PaginacaoProps) => {
  const paginas = totalDePaginas(total, porPagina);
  const plural = rotuloPlural ?? `${rotulo}s`;
  const nome = total === 1 ? rotulo : plural;

  if (total === 0) {
    return (
      <p className="mt-4 text-slate-500 text-xs">Nenhum {rotulo} encontrado.</p>
    );
  }

  const primeiro = (pagina - 1) * porPagina + 1;
  const ultimo = Math.min(pagina * porPagina, total);

  return (
    <nav
      aria-label={`Paginação de ${plural}`}
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-slate-500 text-xs">
        Exibindo {primeiro}–{ultimo} de {total} {nome}
      </p>

      {paginas > 1 && (
        <div className="flex items-center gap-2">
          {pagina > 1 ? (
            <Link
              href={enderecoDaPagina(href, parametros, pagina - 1)}
              className={CLASSE_BOTAO}
              rel="prev"
            >
              Anterior
            </Link>
          ) : (
            <span
              className={`${CLASSE_BOTAO} cursor-not-allowed opacity-40`}
              aria-disabled="true"
            >
              Anterior
            </span>
          )}

          <span className="text-slate-600 text-xs">
            Página {pagina} de {paginas}
          </span>

          {pagina < paginas ? (
            <Link
              href={enderecoDaPagina(href, parametros, pagina + 1)}
              className={CLASSE_BOTAO}
              rel="next"
            >
              Próxima
            </Link>
          ) : (
            <span
              className={`${CLASSE_BOTAO} cursor-not-allowed opacity-40`}
              aria-disabled="true"
            >
              Próxima
            </span>
          )}
        </div>
      )}
    </nav>
  );
};
