import PDFDocument from "pdfkit";
import path from "path";
import type {
  CertificadoAlunoDetalhe,
  CertificadoDetalhe,
} from "../../domain/repositories/CoordenadorRepository";

const TEMPLATES_DIR = path.resolve(
  process.cwd(),
  "assets",
  "certificates",
  "templates",
);

const STUDENT_TEMPLATE = path.join(
  TEMPLATES_DIR,
  "certificado-aluno-template-limpo.png",
);

// Os PDFs oficiais e os PNGs limpos têm proporção A4 horizontal.
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const TEXT_COLOR = "#111111";

// Retangulo que apaga o paragrafo final impresso no PNG ("...voltados para a
// area de administracao..."). A area de atuacao esta escrita no fundo, mas o
// projeto oferece varios cursos, entao o paragrafo e redesenhado logo abaixo
// com o nome do curso do proprio certificado.
//
// As medidas saem da caixa do texto no template (3509x2481 px, escala
// 841.89/3509 = 0.2399): x 298..3221 -> 71.5..772.8 pt, y 1368..1497 ->
// 328.2..359.2 pt. A folga em volta e branca no template, conferida pixel a
// pixel, entao a tarja nao come nada que va ficar visivel.
const PARAGRAPH_PATCH = { x: 54, y: 318, width: 734, height: 54 };
const PARAGRAPH_TOP = 330;

const formatDate = (value: string | null): string =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "data não informada";

const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : value;
};

const createDocument = (
  draw: (document: PDFKit.PDFDocument) => void,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: 0,
      compress: true,
    });
    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    try {
      draw(document);
      document.end();
    } catch (error) {
      document.destroy();
      reject(error);
    }
  });

const drawFullPageTemplate = (
  document: PDFKit.PDFDocument,
  templatePath: string,
) => {
  document.image(templatePath, 0, 0, {
    fit: [PAGE_WIDTH, PAGE_HEIGHT],
    align: "center",
    valign: "center",
  });
};

const gerarCertificadoAlunoPdf = (
  certificate: CertificadoAlunoDetalhe,
): Promise<Buffer> =>
  createDocument((document) => {
    drawFullPageTemplate(document, STUDENT_TEMPLATE);

    // O fundo já contém título, texto institucional, parágrafo, assinatura,
    // logos e rodapé. Somente os dados personalizados são sobrepostos.
    document.font("Times-Italic");
    let studentNameFontSize = 31;
    document.fontSize(studentNameFontSize);
    while (
      document.widthOfString(certificate.nomeAluno) > PAGE_WIDTH - 180 &&
      studentNameFontSize > 22
    ) {
      studentNameFontSize -= 0.5;
      document.fontSize(studentNameFontSize);
    }

    document
      .fillColor("#073878")
      .text(certificate.nomeAluno, 90, 225, {
        align: "center",
        width: PAGE_WIDTH - 180,
        lineBreak: false,
      });

    document
      .rect(
        PARAGRAPH_PATCH.x,
        PARAGRAPH_PATCH.y,
        PARAGRAPH_PATCH.width,
        PARAGRAPH_PATCH.height,
      )
      .fill("#FFFFFF");

    const completionText =
      `CPF ${formatCpf(certificate.cpfAluno)}, concluiu o Curso de ` +
      `${certificate.nomeCurso}, com carga horária de ` +
      `${certificate.cargaHoraria} horas, realizado no período de ` +
      `${formatDate(certificate.dataInicio)} a ` +
      `${formatDate(certificate.dataFim)}.`;

    const textWidth = PAGE_WIDTH - 144;

    document
      .font("Helvetica")
      .fontSize(13.5)
      .fillColor(TEXT_COLOR)
      .text(completionText, 72, 272, {
        align: "center",
        width: textWidth,
        lineGap: 2,
      });

    // Reposicao do paragrafo apagado, agora com o curso do certificado no
    // lugar do "administracao" fixo do template.
    const areaText =
      `Este curso proporcionou ao participante o desenvolvimento de ` +
      `habilidades e conhecimentos voltados para a área de ` +
      `${certificate.nomeCurso}, capacitando-o(a) a aplicar conceitos e ` +
      `práticas relevantes no contexto organizacional.`;

    // O bloco de cima cresce para tres linhas com nome de curso comprido. Sem
    // o piso do y, os dois paragrafos se sobrepunham.
    const areaTop = Math.max(PARAGRAPH_TOP, document.y + 6);

    document
      .font("Helvetica")
      .fontSize(13.5)
      .fillColor(TEXT_COLOR)
      .text(areaText, 72, areaTop, {
        align: "center",
        width: textWidth,
        lineGap: 2,
      });

    document
      .font("Helvetica")
      .fontSize(13.5)
      .fillColor(TEXT_COLOR)
      .text(`${certificate.cidade}, ${formatDate(certificate.dataEmissao)}`, 500, 401, {
        align: "center",
        width: 250,
        lineBreak: false,
      });

    // Codigo de autenticidade. Sem ele impresso, um terceiro (empregador,
    // secretaria) nao tem como conferir o documento contra o sistema.
    if (certificate.codigo) {
      // Canto esquerdo, na mesma altura da data (que fica a direita). O rodape
      // esta ocupado: logos ate ~y=513 e as portarias a partir de ~y=545.
      document
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#555555")
        .text(`Código de autenticidade: ${certificate.codigo}`, 72, 405, {
          align: "left",
          width: 320,
          lineBreak: false,
        });
    }
  });

export const gerarCertificadoPdf = (
  certificate: CertificadoDetalhe,
): Promise<Buffer> => gerarCertificadoAlunoPdf(certificate);
