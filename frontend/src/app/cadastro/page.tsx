"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { BotaoVerSenha } from "@/components/shared/BotaoVerSenha";
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
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-[0.9375rem] text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-azure-600 focus:ring-4 focus:ring-azure-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
const selectClass = `${inputClass} cursor-pointer`;
const passwordInputClass = `${inputClass} pr-12`;

// Nome aceita letra (com acento), espaco, apostrofo e hifen. Nada mais.
const apenasLetrasDeNome = (valor: string) =>
  valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '-]/g, "");

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
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
  const confirmacaoDigitada = watch("confirmarSenha") ?? "";

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

  const nomeField = register("nome");
  const cpfField = register("cpf");
  const emailField = register("email");
  const telefoneField = register("telefone");
  const rgmField = register("rgm");
  const senhaField = register("senha");
  const confirmarSenhaField = register("confirmarSenha");

  // Os dois campos de senha conferem a cada tecla, como os de e-mail e CPF logo
  // acima. Sem isso a mensagem so aparecia depois de enviar o formulario, e era
  // justamente ela que passou a explicar a regra da senha — a lista de
  // requisitos que abria embaixo do campo saiu em 18/09.
  //
  // Mexer na senha revalida a confirmacao junto: "As senhas nao coincidem" e um
  // erro do par, entao corrigir a senha precisa apagar o aviso que estava na
  // confirmacao. So depois que a confirmacao tem algo digitado, senao o
  // formulario acusa um campo em que ninguem chegou a mexer.
  const aoDigitarSenha = (valor: string) => {
    setValue("senha", valor, { shouldDirty: true, shouldValidate: true });

    if (confirmacaoDigitada !== "") {
      void trigger("confirmarSenha");
    }
  };

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
    <AuthShell
      largura="larga"
      eyebrow="Administração para Todos"
      tituloPainel="Inscrição aberta à comunidade, sem custo."
      descricaoPainel="Preencha seus dados para criar o acesso. A coordenação confere a inscrição e vincula você a uma turma."
      tituloCartao="Criar cadastro"
      descricaoCartao="Leva menos de dois minutos. Os campos com * são obrigatórios."
      voltarPara={{ href: "/", texto: "Voltar para o acesso" }}
    >
      <form onSubmit={handleSubmit(cadastroSubmit)} className="flex flex-col">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700 sm:col-span-2">
            Nome completo
            <input
              type="text"
              autoComplete="name"
              className={inputClass}
              placeholder="Ex.: Ana Clara Silva"
              {...nomeField}
              onChange={(evento) => {
                // Numero nem chega a entrar no campo. O schema ja recusava no
                // envio, mas so depois de a pessoa digitar o nome inteiro e
                // apertar Cadastrar — barrar aqui evita a viagem perdida.
                setValue("nome", apenasLetrasDeNome(evento.target.value), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
            {errorText(errors.nome?.message)}
          </label>

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
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

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
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

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
            Data de nascimento
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              className={inputClass}
              {...register("dataNascimento")}
            />
            {errorText(errors.dataNascimento?.message)}
          </label>

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
            E-mail
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="nome@email.com"
              {...emailField}
              onChange={(event) => {
                // Sem minuscula forcada a cada tecla: quem digitava com
                // maiuscula nao conseguia. O schema normaliza no envio, que e
                // onde de fato importa para gravar o e-mail.
                setValue("email", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
            {errorText(errors.email?.message)}
          </label>

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
            Senha de acesso
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                autoComplete="new-password"
                className={passwordInputClass}
                placeholder="Crie sua senha do sistema"
                {...senhaField}
                onChange={(evento) => aoDigitarSenha(evento.target.value)}
              />
              <BotaoVerSenha
                posicao="centro"
                visivel={mostrarSenha}
                onClick={() => setMostrarSenha((atual) => !atual)}
              />
            </div>
            <MedidorForcaSenha senha={senhaDigitada} />
            {errorText(errors.senha?.message)}
          </label>

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
            Confirmar senha de acesso
            <div className="relative">
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                autoComplete="new-password"
                className={passwordInputClass}
                placeholder="Repita sua senha"
                {...confirmarSenhaField}
                onChange={(evento) =>
                  setValue("confirmarSenha", evento.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <BotaoVerSenha
                posicao="centro"
                visivel={mostrarConfirmarSenha}
                descricao="confirmação de senha"
                onClick={() => setMostrarConfirmarSenha((atual) => !atual)}
              />
            </div>
            {/* A mesma barrinha da senha acima: quem repete a senha enxerga o
                mesmo nivel subindo, em vez de um campo sem retorno nenhum. */}
            <MedidorForcaSenha senha={confirmacaoDigitada} />
            {errorText(errors.confirmarSenha?.message)}
          </label>

          <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700 sm:col-span-2">
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
            <label htmlFor="isAlunoUnipe" className="text-slate-700 text-sm">
              Sou aluno da UNIPE
            </label>
          </div>

          {isAlunoUnipe && (
            <>
              <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
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

              <label className="flex flex-col gap-1.5 font-medium text-[0.8125rem] text-slate-700">
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
          <Notificacao posicao="inline" tipo={feedback.tipo} className="mt-4">
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

        <div className="mt-7 flex flex-col-reverse gap-3 border-line border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="rounded text-center font-medium text-[0.875rem] text-slate-600 transition-colors hover:text-azure-700 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2 sm:text-left"
          >
            Já tenho acesso
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || carregandoTreinamentos}
            className="sm:w-auto sm:min-w-44"
          >
            {isSubmitting ? "Enviando..." : "Criar cadastro"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
