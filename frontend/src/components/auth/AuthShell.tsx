import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  /** Linha pequena acima do titulo do painel. */
  eyebrow: string;
  tituloPainel: string;
  descricaoPainel: string;
  /**
   * Frases curtas sobre o projeto, uma por linha, abaixo da descricao.
   *
   * So a tela de entrada usa: e a unica que costuma ser aberta por quem ainda
   * nao conhece o projeto — o link e divulgado para estudantes do UNIPE e para
   * a comunidade, e o painel precisava responder "que curso e este" antes de
   * pedir e-mail e senha.
   */
  destaques?: string[];
  tituloCartao: string;
  descricaoCartao?: string;
  voltarPara?: { href: string; texto: string };
  /** "larga" e para o cadastro, que tem formulario de duas colunas. */
  largura?: "padrao" | "larga";
  children: ReactNode;
}

const LARGURAS = {
  padrao: "max-w-[26rem]",
  larga: "max-w-2xl",
} as const;

// Sem o token de rastreio que vem no link compartilhado pelo app.
const INSTAGRAM = "https://www.instagram.com/admparatodos_unipe";

export const AuthShell = ({
  eyebrow,
  tituloPainel,
  descricaoPainel,
  destaques,
  tituloCartao,
  descricaoCartao,
  voltarPara,
  largura = "padrao",
  children,
}: AuthShellProps) => (
  <main className="min-h-dvh bg-paper font-poppins text-slate-900 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
    {/* 30% da paleta: bloco institucional, chapado. Sem degrade — e o degrade
        de tres paradas que fazia a tela parecer template pronto. */}
    <aside className="flex flex-col justify-between gap-y-10 bg-navy-800 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
      <div>
        <div className="flex items-center gap-x-3">
          {/* O simbolo e marinho e azul: sobre o painel marinho ele precisa de
              uma base clara para aparecer. */}
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
            <Image
              src="/simbolo-adm.png"
              alt=""
              aria-hidden
              width={320}
              height={177}
              className="h-auto w-full"
            />
          </span>
          <p className="font-semibold text-[0.6875rem] text-azure-500 uppercase tracking-[0.2em]">
            {eyebrow}
          </p>
        </div>
        {/* A barra fina e a assinatura do azul: aparece uma vez, pequena. */}
        <span
          aria-hidden
          className="mt-5 block h-0.5 w-10 rounded-full bg-azure-600"
        />
        <h2 className="mt-6 max-w-md font-semibold text-2xl text-white leading-snug tracking-tight sm:text-3xl">
          {tituloPainel}
        </h2>
        <p className="mt-4 max-w-md text-[0.9375rem] text-slate-300 leading-relaxed">
          {descricaoPainel}
        </p>

        {destaques && destaques.length > 0 && (
          <ul className="mt-6 flex max-w-md flex-col gap-y-2.5">
            {destaques.map((destaque) => (
              <li
                key={destaque}
                className="flex items-start gap-x-2.5 text-[0.875rem] text-slate-200 leading-relaxed"
              >
                <span
                  aria-hidden
                  className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-azure-500"
                />
                {destaque}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* A marca do projeto e o centro do painel: e a imagem que responde "que
          sistema e este". Fica centralizada e grande o bastante para o nome
          impresso abaixo do simbolo ser lido — encolhida, so se via o desenho.

          A placa clara nao e enfeite: a marca e marinho sobre transparente e
          sumiria direto no painel. */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white">
          <span aria-hidden className="block h-1 w-full bg-azure-600" />
          <div className="px-8 py-7">
            <Image
              src="/administracao-para-todos.png"
              alt="Projeto de extensão Administração para Todos"
              width={980}
              height={571}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-x-2.5 rounded text-[0.875rem] text-slate-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-azure-500 focus-visible:outline-offset-2"
          >
            <Image
              src="/instagram.webp"
              alt=""
              aria-hidden
              width={180}
              height={180}
              className="size-5 rounded-[0.3rem]"
            />
            @admparatodos_unipe
          </a>

          {/* A marca da instituicao deixou de ocupar uma placa propria no meio
              do painel e virou a assinatura ao lado do Instagram, no tamanho
              de um selo — ainda sobre superficie clara, pelo mesmo motivo. */}
          <span className="flex items-center rounded-md bg-white px-3 py-2">
            <Image
              src="/unipe.webp"
              alt="UNIPÊ — Centro Universitário de João Pessoa"
              width={481}
              height={180}
              className="h-auto w-[6.5rem]"
            />
          </span>
        </div>

        <p className="mt-4 text-[0.75rem] text-slate-400">
          Projeto de extensão · UNIPÊ, João Pessoa
        </p>
      </div>
    </aside>

    <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
      <div className={`w-full ${LARGURAS[largura]}`}>
        {voltarPara && (
          <Link
            href={voltarPara.href}
            className="mb-5 inline-flex items-center gap-x-2 rounded font-medium text-[0.8125rem] text-slate-600 transition-colors hover:text-azure-700 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <title>Voltar</title>
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            {voltarPara.texto}
          </Link>
        )}

        {/* 60% da paleta: papel atras, branco na superficie do formulario.
            Fio de 1px no lugar de sombra pesada. */}
        <div className="rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(15,31,61,0.04)]">
          <div className="flex items-start gap-x-3.5 border-line border-b px-6 py-6 sm:px-8">
            {/* No cartao branco o simbolo aparece direto, sem base. */}
            <Image
              src="/simbolo-adm.png"
              alt=""
              aria-hidden
              width={320}
              height={177}
              className="mt-0.5 h-auto w-11 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-semibold text-slate-900 text-xl tracking-tight">
                {tituloCartao}
              </h1>
              {descricaoCartao && (
                <p className="mt-1.5 text-[0.875rem] text-slate-600 leading-relaxed">
                  {descricaoCartao}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">{children}</div>
        </div>
      </div>
    </section>
  </main>
);
