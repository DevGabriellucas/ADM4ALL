/**
 * Os e-mails do projeto, em um lugar so.
 *
 * Antes cada caso montava o proprio HTML no meio do use case: tres deles eram
 * quatro `<p>` sem assinatura, sem explicacao do que e o projeto e sem nada que
 * dissesse ao aluno de onde veio aquela mensagem. Quem recebe o convite muitas
 * vezes nunca ouviu falar do sistema, e um e-mail cru com um link e exatamente
 * o formato de que as pessoas desconfiam.
 *
 * Todas as mensagens saem do mesmo `layout()`: cabecalho com o nome do projeto,
 * corpo, botao unico e rodape institucional. As cores sao as da marca
 * (`frontend/src/app/globals.css`): marinho #12294e e azul #1877d6.
 *
 * HTML de e-mail e limitado de proposito — tabela, estilo inline e nada de
 * classe ou flexbox: e o que o Gmail, o Outlook e os webmails de celular
 * renderizam igual.
 */

import fs from "fs";
import path from "path";

const MARINHO = "#12294e";
const AZUL = "#1877d6";
const TEXTO = "#1f2937";
const TEXTO_SUAVE = "#5b6b82";
const LINHA = "#dbe3f0";
const PAPEL = "#f4f7fc";

export const NOME_DO_PROJETO = "ADM Para Todos";
const ASSINATURA = "Coordenação do ADM Para Todos";
const INSTAGRAM = "https://www.instagram.com/admparatodos_unipe";

// A marca vai como anexo embutido (`cid:`), e nao como link para o site: o
// Gmail bloqueia imagem remota ate o leitor liberar, e em desenvolvimento o
// endereco e localhost, que so existiria na maquina de quem rodou o sistema.
//
// Usa o simbolo, e nao a marca por extenso: o arquivo grande tem 370 KB e iria
// junto em cada mensagem enviada. O nome do projeto vem escrito ao lado, no
// proprio cabecalho.
const LOGO_CID = "marca-adm-para-todos";
const LOGO_ARQUIVO = path.resolve(
  process.cwd(),
  "assets",
  "email",
  "simbolo-adm-para-todos.png",
);

// Lido uma vez so, na primeira mensagem. Sem o arquivo (build sem a pasta
// assets, por exemplo), o e-mail sai sem a imagem em vez de falhar.
let logoEmMemoria: Buffer | null | undefined;

const carregarLogo = (): Buffer | null => {
  if (logoEmMemoria === undefined) {
    try {
      logoEmMemoria = fs.readFileSync(LOGO_ARQUIVO);
    } catch {
      console.warn(`Marca do e-mail nao encontrada em ${LOGO_ARQUIVO}.`);
      logoEmMemoria = null;
    }
  }

  return logoEmMemoria;
};

/** Anexos que acompanham toda mensagem. Vazio quando a marca nao foi lida. */
export const anexosDoEmail = () => {
  const logo = carregarLogo();

  if (!logo) {
    return [];
  }

  return [
    {
      filename: "adm-para-todos.png",
      content: logo,
      cid: LOGO_CID,
    },
  ];
};

export const escaparHtml = (valor: string) =>
  valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const formatarDataPtBr = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
};

interface OpcoesDeLayout {
  /** Frase curta acima do titulo, no cabecalho marinho. */
  chapeu: string;
  titulo: string;
  /** Paragrafos do corpo, ja escapados quando vierem de dado do usuario. */
  paragrafos: string[];
  botao?: { texto: string; link: string };
  /** Bloco destacado (dados da aula, por exemplo), em HTML ja escapado. */
  destaque?: string;
  /** Observacoes em letra menor, no fim do corpo. */
  rodapeDoCorpo?: string[];
}

const layout = ({
  chapeu,
  titulo,
  paragrafos,
  botao,
  destaque,
  rodapeDoCorpo,
}: OpcoesDeLayout): string => `
<div style="margin:0;padding:24px 12px;background-color:${PAPEL};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid ${LINHA};border-radius:12px;overflow:hidden;">
    <tr>
      <td style="background-color:${MARINHO};padding:26px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#ffffff;border-radius:8px;padding:8px 10px;" valign="middle">
              <img src="cid:${LOGO_CID}" width="64" alt="${escaparHtml(NOME_DO_PROJETO)}" style="display:block;width:64px;height:auto;border:0;">
            </td>
            <td style="padding-left:14px;" valign="middle">
              <p style="margin:0;color:#a9cdf2;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${escaparHtml(chapeu)}</p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0 0;color:#ffffff;font-size:21px;font-weight:bold;line-height:1.35;">${escaparHtml(titulo)}</p>
        <p style="margin:14px 0 0 0;height:3px;width:44px;background-color:${AZUL};font-size:0;line-height:0;">&nbsp;</p>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 32px 8px 32px;color:${TEXTO};font-size:15px;line-height:1.65;">
        ${paragrafos.map((paragrafo) => `<p style="margin:0 0 16px 0;">${paragrafo}</p>`).join("")}
        ${
          destaque
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 20px 0;background-color:${PAPEL};border:1px solid ${LINHA};border-radius:8px;">
                 <tr><td style="padding:16px 18px;color:${TEXTO};font-size:14px;line-height:1.7;">${destaque}</td></tr>
               </table>`
            : ""
        }
        ${
          botao
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px 0;">
                 <tr><td style="background-color:${AZUL};border-radius:8px;">
                   <a href="${botao.link}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">${escaparHtml(botao.texto)}</a>
                 </td></tr>
               </table>`
            : ""
        }
        ${
          rodapeDoCorpo
            ? rodapeDoCorpo
                .map(
                  (linha) =>
                    `<p style="margin:0 0 10px 0;color:${TEXTO_SUAVE};font-size:13px;line-height:1.6;">${linha}</p>`,
                )
                .join("")
            : ""
        }
        <p style="margin:22px 0 0 0;color:${TEXTO};font-size:15px;">${ASSINATURA}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:22px 32px 26px 32px;border-top:1px solid ${LINHA};">
        <p style="margin:0;color:${TEXTO_SUAVE};font-size:12px;line-height:1.7;">
          <strong style="color:${MARINHO};">${NOME_DO_PROJETO}</strong> · Projeto de extensão do UNIPÊ<br>
          Curso gratuito de rotinas administrativas · João Pessoa, PB<br>
          Instagram: <a href="${INSTAGRAM}" style="color:${AZUL};text-decoration:none;">@admparatodos_unipe</a>
        </p>
        <p style="margin:12px 0 0 0;color:#93a1b5;font-size:11px;line-height:1.6;">
          Mensagem automática — não é preciso responder a este e-mail.
        </p>
      </td>
    </tr>
  </table>
</div>`;

interface EmailDeAtivacao {
  nome: string;
  link: string;
  diasParaExpirar: number;
  /** Muda so a frase que explica por que a pessoa recebeu o e-mail. */
  motivo: "cadastro-publico" | "reenvio" | "convite-coordenador";
}

const EXPLICACAO_POR_MOTIVO: Record<EmailDeAtivacao["motivo"], string> = {
  "cadastro-publico":
    "Sua inscrição no curso foi registrada. Falta só confirmar o e-mail e criar a sua senha para acessar o painel do aluno.",
  reenvio:
    "Você (ou a coordenação) pediu um novo link de ativação. O link anterior deixou de valer.",
  "convite-coordenador":
    "A coordenação cadastrou você na equipe de coordenação do projeto. Ative a conta para acompanhar cursos, turmas, alunos e certificados.",
};

export const gerarEmailAtivacaoConta = ({
  nome,
  link,
  diasParaExpirar,
  motivo,
}: EmailDeAtivacao): string =>
  layout({
    chapeu: NOME_DO_PROJETO,
    titulo: "Ative o seu acesso",
    paragrafos: [
      `Olá, <strong>${escaparHtml(nome)}</strong>!`,
      EXPLICACAO_POR_MOTIVO[motivo],
      "É rápido: o botão abaixo abre a página de ativação, onde você cria a sua senha.",
    ],
    botao: { texto: "Ativar minha conta", link },
    rodapeDoCorpo: [
      `Este link vale por <strong>${diasParaExpirar} dias</strong> e só pode ser usado uma vez.`,
      "Se você não se inscreveu no curso e não conhece o projeto, ignore este e-mail: sem a ativação, nenhuma conta é criada.",
    ],
  });

export const gerarEmailRecuperacaoSenha = (
  link: string,
  minutosExpira: number,
): string =>
  layout({
    chapeu: NOME_DO_PROJETO,
    titulo: "Redefinição de senha",
    paragrafos: [
      "Olá!",
      "Recebemos um pedido para redefinir a senha da sua conta no painel do projeto.",
      "Use o botão abaixo para criar uma senha nova.",
    ],
    botao: { texto: "Redefinir minha senha", link },
    rodapeDoCorpo: [
      `Por segurança, o link expira em <strong>${minutosExpira} minutos</strong>.`,
      "Se não foi você que pediu, pode ignorar esta mensagem — a senha atual continua valendo.",
    ],
  });

interface EmailDeAulaCancelada {
  nome: string;
  curso: string;
  turma: string;
  aula: string;
  data: string;
}

export const gerarEmailAulaCancelada = ({
  nome,
  curso,
  turma,
  aula,
  data,
}: EmailDeAulaCancelada): string =>
  layout({
    chapeu: `${NOME_DO_PROJETO} · Aviso de cronograma`,
    titulo: "Aula cancelada",
    paragrafos: [
      `Olá, <strong>${escaparHtml(nome)}</strong>!`,
      "A aula abaixo foi cancelada pela coordenação do curso.",
    ],
    destaque: `
      <strong style="color:${MARINHO};">Curso:</strong> ${escaparHtml(curso)}<br>
      <strong style="color:${MARINHO};">Turma:</strong> ${escaparHtml(turma)}<br>
      <strong style="color:${MARINHO};">Aula:</strong> ${escaparHtml(aula)}<br>
      <strong style="color:${MARINHO};">Data prevista:</strong> ${formatarDataPtBr(data)}
    `,
    rodapeDoCorpo: [
      "Aula cancelada <strong>não conta como falta</strong> e não afeta a sua frequência.",
      "A reposição, quando houver, aparece no cronograma da turma no seu painel.",
    ],
  });
