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

    const completionText =
      `CPF ${formatCpf(certificate.cpfAluno)}, concluiu o Curso de ` +
      `${certificate.nomeCurso}, com carga horária de ` +
      `${certificate.cargaHoraria} horas, realizado no período de ` +
      `${formatDate(certificate.dataInicio)} a ` +
      `${formatDate(certificate.dataFim)}.`;

    document
      .font("Helvetica")
      .fontSize(13.5)
      .fillColor(TEXT_COLOR)
      .text(completionText, 72, 272, {
        align: "center",
        width: PAGE_WIDTH - 144,
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
