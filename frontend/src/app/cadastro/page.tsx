"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type CadastroFormData,
  cadastroFormDataSchema,
} from "@/schemas/cadastroSchema";
import {
  cadastrarAluno,
  listarTreinamentosPublicos,
  type TreinamentoPublico,
} from "@/services/cadastroService";

type Feedback = { tipo: "ok" | "erro"; texto: string; link?: string } | null;

const inputClass =
  "h-12 w-full rounded-lg border-0 bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-4 text-sm text-slate-950 opacity-70 outline-none transition placeholder:text-slate-700 focus:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const selectClass = `${inputClass} cursor-pointer`;
const passwordInputClass = `${inputClass} pr-12`;

const somenteDigitos = (valor: string, limite: number) =>
  valor.replace(/\D/g, "").slice(0, limite);

const formatarCpf = (valor: string) =>
  somenteDigitos(valor, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const formatarTelefone = (valor: string) => {
  const digitos = somenteDigitos(valor, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

export default function Cadastro() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [treinamentos, setTreinamentos] = useState<TreinamentoPublico[]>([]);
  const [carregandoTreinamentos, setCarregandoTreinamentos] = useState(true);
  const [erroTreinamentos, setErroTreinamentos] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroFormDataSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      dataNascimento: "",
      isAlunoUnipe: false,
      cursoUnipe: "",
      senha: "",
      confirmarSenha: "",
      treinamento: "",
      rgm: "",
    },
  });

  const isAlunoUnipe = watch("isAlunoUnipe");
  const treinamentoSelecionado = watch("treinamento");

  const treinamentoAtual = useMemo(
    () =>
      treinamentos.find(
        (treinamento) => treinamento.nome === treinamentoSelecionado,
      ) ?? null,
    [treinamentoSelecionado, treinamentos],
  );

  const carregarTreinamentos = useCallback(async () => {
    setCarregandoTreinamentos(true);
    setErroTreinamentos(null);

    try {
      const lista = await listarTreinamentosPublicos();
      setTreinamentos(lista);
    } catch (error: unknown) {
      setTreinamentos([]);
      setErroTreinamentos(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar os treinamentos.",
      );
    } finally {
      setCarregandoTreinamentos(false);
    }
  }, []);

  useEffect(() => {
    void carregarTreinamentos();
  }, [carregarTreinamentos]);

  useEffect(() => {
    if (!isAlunoUnipe) {
      setValue("cursoUnipe", "");
      setValue("rgm", "");
    }
  }, [isAlunoUnipe, setValue]);

  const cpfField = register("cpf");
  const telefoneField = register("telefone");
  const rgmField = register("rgm");

  const passwordToggle = (
    ativo: boolean,
    alternar: () => void,
    label: string,
  ) => (
    <button
      type="button"
      onClick={alternar}
      aria-label={label}
      title={label}
      className="-translate-y-1/2 absolute top-1/2 right-3 text-slate-800 transition-colors hover:text-brand-dark"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <title>{label}</title>
        {ativo ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5 0 9 4 10 8a11.8 11.8 0 0 1-3.2 5.1" />
            <path d="M6.1 6.1A11.8 11.8 0 0 0 2 12c1 4 5 8 10 8a10.6 10.6 0 0 0 4.1-.8" />
          </>
        ) : (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );

  const cadastroSubmit = async (data: CadastroFormData) => {
    setFeedback(null);

    try {
      const result = await cadastrarAluno(data);
      setFeedback({
        tipo: "ok",
        texto: result.mensagem,
        link: result.linkAtivacao,
      });
      reset();
    } catch (error: unknown) {
      setFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel realizar o cadastro.",
      });
    }
  };

  const errorText = (message?: string) =>
    message ? (
      <span className="text-red-700 text-xs" role="alert">
        {message}
      </span>
    ) : null;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-5 overflow-y-auto overflow-x-hidden bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 p-4 py-6 font-poppins text-slate-950 sm:gap-y-7 xl:flex-row xl:gap-x-20 xl:gap-y-0">
      <section className="flex w-full max-w-[300px] flex-col items-center justify-center gap-y-4 text-center sm:max-w-md xl:max-w-xl xl:items-start xl:gap-y-8 xl:text-left">
        <h1 className="font-medium text-3xl tracking-[0.1em] xl:text-4xl">
          Cadastro
        </h1>
        <div className="relative h-32 w-full max-w-[280px] sm:h-48 sm:max-w-sm xl:h-[20.5rem] xl:max-w-[37.5rem]">
          <Image
            src="/login-page-illustration.png"
            alt="Ilustracao conceitual de planejamento estrategico e analise de dados"
            fill
            priority
            sizes="(min-width: 1280px) 601px, 100vw"
            className="object-contain object-center"
          />
        </div>
      </section>

      <section className="flex w-full max-w-[300px] flex-col rounded-xl bg-[#9FA3C7E5]/60 px-5 py-6 shadow-sm sm:max-w-xl sm:px-6 sm:py-7 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
        <form
          onSubmit={handleSubmit(cadastroSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-slate-600 text-xs sm:col-span-2">
              Nome completo
              <input
                type="text"
                autoComplete="name"
                className={inputClass}
                placeholder="Ex.: Ana Clara Silva"
                {...register("nome")}
              />
              {errorText(errors.nome?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
              CPF
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className={inputClass}
                placeholder="000.000.000-00"
                {...cpfField}
                onChange={(evento) => {
                  evento.target.value = formatarCpf(evento.target.value);
                  cpfField.onChange(evento);
                }}
              />
              {errorText(errors.cpf?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
              Telefone
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={inputClass}
                placeholder="(83) 99999-9999"
                {...telefoneField}
                onChange={(evento) => {
                  evento.target.value = formatarTelefone(evento.target.value);
                  telefoneField.onChange(evento);
                }}
              />
              {errorText(errors.telefone?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
              Data de nascimento
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
                {...register("dataNascimento")}
              />
              {errorText(errors.dataNascimento?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
              E-mail
              <input
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder="nome@email.com"
                {...register("email")}
              />
              {errorText(errors.email?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
              Senha de acesso
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  className={passwordInputClass}
                  placeholder="Crie sua senha do sistema"
                  {...register("senha")}
                />
                {passwordToggle(
                  mostrarSenha,
                  () => setMostrarSenha((atual) => !atual),
                  mostrarSenha ? "Ocultar senha" : "Mostrar senha",
                )}
              </div>
              {errorText(errors.senha?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
              Confirmar senha de acesso
              <div className="relative">
                <input
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  className={passwordInputClass}
                  placeholder="Repita sua senha"
                  {...register("confirmarSenha")}
                />
                {passwordToggle(
                  mostrarConfirmarSenha,
                  () => setMostrarConfirmarSenha((atual) => !atual),
                  mostrarConfirmarSenha
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha",
                )}
              </div>
              {errorText(errors.confirmarSenha?.message)}
            </label>

            <label className="flex flex-col gap-1.5 text-slate-600 text-xs sm:col-span-2">
              Treinamento
              <select
                className={selectClass}
                disabled={carregandoTreinamentos}
                {...register("treinamento")}
              >
                <option value="">
                  {carregandoTreinamentos
                    ? "Carregando treinamentos..."
                    : "Selecione um treinamento"}
                </option>
                {treinamentos.map((treinamento) => (
                  <option key={treinamento.id} value={treinamento.nome}>
                    {treinamento.nome}
                  </option>
                ))}
              </select>
              {treinamentoAtual && (
                <span className="text-slate-500">
                  {treinamentoAtual.cargaHoraria}h
                  {treinamentoAtual.descricao
                    ? ` - ${treinamentoAtual.descricao}`
                    : ""}
                </span>
              )}
              {erroTreinamentos && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-red-700 text-xs" role="alert">
                    {erroTreinamentos}
                  </span>
                  <button
                    type="button"
                    onClick={carregarTreinamentos}
                    disabled={carregandoTreinamentos}
                    className="font-semibold text-brand-dark text-xs underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
              {errorText(errors.treinamento?.message)}
            </label>

            <div className="flex items-start gap-3 rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] p-3 opacity-70 sm:col-span-2">
              <input
                id="isAlunoUnipe"
                type="checkbox"
                className="mt-0.5 size-4 rounded border-slate-300 text-brand-dark"
                {...register("isAlunoUnipe")}
              />
              <label htmlFor="isAlunoUnipe" className="text-slate-700 text-sm">
                Sou aluno da UNIPE
              </label>
            </div>

            {isAlunoUnipe && (
              <>
                <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
                  RGM
                  <input
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    placeholder="8 digitos"
                    {...rgmField}
                    onChange={(evento) => {
                      evento.target.value = somenteDigitos(
                        evento.target.value,
                        8,
                      );
                      rgmField.onChange(evento);
                    }}
                  />
                  {errorText(errors.rgm?.message)}
                </label>

                <label className="flex flex-col gap-1.5 text-slate-600 text-xs">
                  Curso UNIPE
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Digite seu curso"
                    {...register("cursoUnipe")}
                  />
                  {errorText(errors.cursoUnipe?.message)}
                </label>
              </>
            )}
          </div>

          {feedback && (
            <div
              className={`mt-4 block rounded-md px-4 py-3 text-sm ${
                feedback.tipo === "ok"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <p>{feedback.texto}</p>
              {feedback.link && (
                <Link
                  href={feedback.link}
                  className="mt-2 inline-flex font-semibold underline underline-offset-2"
                >
                  Ativar conta agora
                </Link>
              )}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="text-center font-medium text-slate-800 text-sm underline-offset-2 hover:underline sm:text-left"
            >
              Já tenho acesso
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || carregandoTreinamentos}
              className="w-full rounded-lg bg-radial-[at_0%_48.97%] from-[#78A4EA] to-[#445D84] px-8 py-3 font-semibold text-slate-950 text-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Enviando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
