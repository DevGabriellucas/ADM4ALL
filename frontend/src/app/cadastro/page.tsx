"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { MedidorForcaSenha } from "@/components/shared/MedidorForcaSenha";
import { Notificacao } from "@/components/shared/Notificacao";
import { CURSOS_UNIPE } from "@/constants/cursosUnipe";
import {
  type CadastroFormData,
  cadastroFormDataSchema,
} from "@/schemas/cadastroSchema";
import {
  cadastrarAluno,
  listarTreinamentosPublicos,
  type TreinamentoPublico,
} from "@/services/cadastroService";
import { formatarCpf } from "@/utils/cpf";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatarTelefone } from "@/utils/telefone";

type Feedback = {
  tipo: "aviso" | "erro";
  texto: string;
  link?: string;
} | null;

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-medium focus:bg-white focus:ring-4 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-50";
const selectClass = `${inputClass} cursor-pointer`;
const passwordInputClass = `${inputClass} pr-12`;

const somenteDigitos = (valor: string, limite: number) =>
  valor.replace(/\D/g, "").slice(0, limite);

export default function Cadastro() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [treinamentos, setTreinamentos] = useState<TreinamentoPublico[]>([]);
  const [carregandoTreinamentos, setCarregandoTreinamentos] = useState(true);
  const [erroTreinamentos, setErroTreinamentos] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [senhaFocada, setSenhaFocada] = useState(false);

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
  const senhaDigitada = watch("senha") ?? "";

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
      setErroTreinamentos(getErrorMessage(error));
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
  const emailField = register("email");
  const telefoneField = register("telefone");
  const rgmField = register("rgm");
  const senhaField = register("senha");

  const passwordToggle = (
    ativo: boolean,
    alternar: () => void,
    label: string,
  ) => (
    <button
      type="button"
      onClick={(evento) => {
        evento.preventDefault();
        evento.stopPropagation();
        alternar();
      }}
      aria-label={label}
      title={label}
      aria-pressed={ativo}
      onMouseDown={(evento) => evento.preventDefault()}
      className="-translate-y-1/2 absolute top-1/2 right-3 z-10 rounded p-1 text-slate-800 transition-colors hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-brand-medium"
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
      reset();

      // Quando a API devolve o link de ativacao (ambiente sem e-mail), ele so
      // serve aqui: a tela fica onde esta para o aluno ativar na hora. No fluxo
      // normal o aluno vai para o login e le o aviso do e-mail enviado.
      if (result.emailEnviado === false && result.linkAtivacao) {
        setFeedback({
          tipo: "aviso",
          texto: result.mensagem,
          link: result.linkAtivacao,
        });
        return;
      }

      router.push(
        result.emailEnviado === false
          ? "/?cadastro=sem-email"
          : "/?cadastro=ativacao-enviada",
      );
    } catch (error: unknown) {
      setFeedback({
        tipo: "erro",
        texto: getErrorMessage(error),
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
    <main className="min-h-screen w-full bg-[#f5f7fb] font-poppins text-slate-950 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(560px,1fr)]">
      <div className="flex min-h-[25rem] items-center justify-center bg-linear-to-br from-[#252c65] via-brand-dark to-[#59639c] px-6 py-12 sm:px-12 lg:min-h-screen">
        <AuthBrandPanel
          compact
          eyebrow="Projeto de extensão"
          title="Faça parte desta jornada."
          description="Crie seu acesso para acompanhar treinamentos, aulas e oportunidades de desenvolvimento."
        />
      </div>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-slate-200/60 shadow-xl sm:p-9">
          <div className="mb-7">
            <p className="font-semibold text-brand-dark text-xs uppercase tracking-[0.2em]">
              Novo participante
            </p>
            <h1 className="mt-2 font-semibold text-2xl tracking-tight">
              Criar cadastro
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Preencha seus dados para iniciar sua participação no projeto.
            </p>
          </div>
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
                  {...emailField}
                  onChange={(event) => {
                    setValue("email", event.target.value.toLowerCase(), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
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
                    {...senhaField}
                    onFocus={() => setSenhaFocada(true)}
                    onBlur={(evento) => {
                      setSenhaFocada(false);
                      return senhaField.onBlur(evento);
                    }}
                  />
                  {passwordToggle(
                    mostrarSenha,
                    () => setMostrarSenha((atual) => !atual),
                    mostrarSenha ? "Ocultar senha" : "Mostrar senha",
                  )}
                </div>
                <MedidorForcaSenha
                  senha={senhaDigitada}
                  mostrarRequisitos={senhaFocada}
                />
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
                  <div
                    className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950 shadow-sm"
                    aria-live="polite"
                  >
                    <svg
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-amber-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <span className="text-xs leading-5">
                      <strong className="font-semibold">
                        {treinamentoAtual.cargaHoraria}h de formação
                      </strong>
                      {treinamentoAtual.descricao
                        ? ` - ${treinamentoAtual.descricao}`
                        : ""}
                    </span>
                  </div>
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

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <input
                  id="isAlunoUnipe"
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-slate-300 text-brand-dark"
                  {...register("isAlunoUnipe")}
                />
                <label
                  htmlFor="isAlunoUnipe"
                  className="text-slate-700 text-sm"
                >
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
                    <select className={selectClass} {...register("cursoUnipe")}>
                      <option value="">Selecione seu curso</option>
                      {CURSOS_UNIPE.map((curso) => (
                        <option key={curso} value={curso}>
                          {curso}
                        </option>
                      ))}
                    </select>
                    {errorText(errors.cursoUnipe?.message)}
                  </label>
                </>
              )}
            </div>

            {feedback && (
              <Notificacao tipo={feedback.tipo} className="mt-4">
                <p>{feedback.texto}</p>
                {feedback.link && (
                  <Link
                    href={feedback.link}
                    className="mt-2 inline-flex font-semibold underline underline-offset-2"
                  >
                    Ativar conta agora
                  </Link>
                )}
              </Notificacao>
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
                className="w-full rounded-lg bg-brand-dark px-8 py-3 font-semibold text-sm text-white transition hover:bg-[#252c65] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? "Enviando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
