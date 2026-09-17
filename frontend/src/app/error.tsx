"use client";

import { useEffect } from "react";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Rede de seguranca da aplicacao inteira.
 *
 * O Next sobe o erro ate o error.tsx mais proximo, e varias rotas nao tinham
 * nenhum acima delas — Presenca, Cronograma, Frequencia e Materiais da
 * coordenacao, Usuarios e Perfil. Uma falha de API ali caia na tela de erro
 * generica do Next, com um digest opaco e sem caminho de volta.
 *
 * Fica na raiz de proposito: cobre toda rota que nao tenha um boundary mais
 * especifico, inclusive as que ainda nao existem.
 */
export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error("Erro nao tratado na aplicacao:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-6 font-poppins">
      <section
        role="alert"
        className="w-full max-w-lg rounded-lg border border-[#D5DDEC] bg-white p-8 text-center shadow-sm"
      >
        <h1 className="font-semibold text-slate-950 text-xl">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-3 text-slate-600 text-sm leading-relaxed">
          Ocorreu um erro inesperado. Tente novamente e, se continuar, entre em
          contato com a coordenação do curso.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center rounded-lg bg-brand-dark px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#23275F]"
          >
            Tentar novamente
          </button>
          {/* <a>, e nao <Link>: /logout precisa de uma navegacao real para o
              servidor limpar os cookies de sessao. */}
          <a
            href="/logout"
            className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50"
          >
            Voltar ao login
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-slate-400 text-xs">
            Código do erro: {error.digest}
          </p>
        )}
      </section>
    </main>
  );
}
