import PDFDocument from "pdfkit";
import type {
  FiltrosRelatorioCoordenador,
  RelatorioCoordenador,
} from "../../domain/repositories/CoordenadorRepository";

const PDF_WIDTH = 841.89;
const PDF_HEIGHT = 595.28;
const PDF_MARGIN = 40;
const BRAND_COLOR = "#20275f";

const valueToText = (value: string | number | undefined): string =>
  value === undefined || value === "" ? "-" : String(value);

const formatFiltersToText = (filters: FiltrosRelatorioCoordenador): string[] => {
  const values: string[] = [];
  if (filters.dataInicio) values.push(`Data inicial: ${filters.dataInicio}`);
  if (filters.dataFim) values.push(`Data final: ${filters.dataFim}`);
  if (filters.curso) values.push(`Curso: ${filters.curso}`);
  if (filters.turma) values.push(`Turma: ${filters.turma}`);
  return values.length > 0 ? values : ["Sem filtros adicionais"];
};

const metricText = (report: RelatorioCoordenador): string =>
  `${report.metricValue ?? 0}${report.metricSuffix ?? ""}`;

const escapeCsvValue = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return "";
  const text = String(value);
  if (text.includes(";") || text.includes("\n") || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const csvLine = (values: (string | number | undefined)[]): string =>
  values.map(escapeCsvValue).join(";") + "\r\n";

export const gerarRelatorioPdf = (
  report: RelatorioCoordenador,
  filters: FiltrosRelatorioCoordenador,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: [PDF_WIDTH, PDF_HEIGHT],
      margin: PDF_MARGIN,
      compress: true,
      info: { Title: report.title, Author: "Adm4All" },
    });
    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    const contentWidth = PDF_WIDTH - PDF_MARGIN * 2;
    const columnWidth = contentWidth / Math.max(report.columns.length, 1);

    const drawPageHeader = () => {
      document
        .font("Helvetica-Bold")
        .fontSize(17)
        .fillColor(BRAND_COLOR)
        .text(report.title, PDF_MARGIN, PDF_MARGIN, {
          width: contentWidth,
        });
      document
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#475569")
        .text(report.description, PDF_MARGIN, document.y + 4, {
          width: contentWidth,
        });
      document
        .fontSize(8)
        .text(
          `Gerado em: ${new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "medium",
            timeZone: "America/Sao_Paulo",
          }).format(new Date())}`,
          PDF_MARGIN,
          document.y + 8,
        );
      document.text(formatFiltersToText(filters).join(" | "), PDF_MARGIN, document.y + 3, {
        width: contentWidth,
      });
      document
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#0f172a")
        .text(
          `${report.metricLabel}: ${metricText(report)}`,
          PDF_MARGIN,
          document.y + 7,
        );
      document.moveDown(0.8);
    };

    const drawTableHeader = () => {
      const y = document.y;
      document.rect(PDF_MARGIN, y, contentWidth, 22).fill(BRAND_COLOR);
      report.columns.forEach((column, index) => {
        document
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("#ffffff")
          .text(column.label, PDF_MARGIN + index * columnWidth + 4, y + 7, {
            width: columnWidth - 8,
            lineBreak: false,
          });
      });
      document.y = y + 22;
    };

    const addPage = () => {
      document.addPage({
        size: [PDF_WIDTH, PDF_HEIGHT],
        margin: PDF_MARGIN,
      });
      drawPageHeader();
      drawTableHeader();
    };

    drawPageHeader();
    drawTableHeader();

    if (report.rows.length === 0) {
      document
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#64748b")
        .text("Nenhum registro encontrado.", PDF_MARGIN, document.y + 14, {
          width: contentWidth,
          align: "center",
        });
    } else {
      report.rows.forEach((row, rowIndex) => {
        if (document.y + 24 > PDF_HEIGHT - PDF_MARGIN) addPage();

        const y = document.y;
        if (rowIndex % 2 === 1) {
          document.rect(PDF_MARGIN, y, contentWidth, 22).fill("#f1f5f9");
        }
        report.columns.forEach((column, columnIndex) => {
          const text = valueToText(row.values[column.key]);
          document
            .font("Helvetica")
            .fontSize(7.5)
            .fillColor("#1e293b")
            .text(
              text.length > 48 ? `${text.slice(0, 45)}...` : text,
              PDF_MARGIN + columnIndex * columnWidth + 4,
              y + 7,
              {
                width: columnWidth - 8,
                lineBreak: false,
              },
            );
        });
        document.y = y + 22;
      });
    }

    document.end();
  });

export const gerarRelatorioCsv = (
  report: RelatorioCoordenador,
  filters: FiltrosRelatorioCoordenador,
): Buffer => {
  const formatDate = () =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());

  const lines: string[] = [];

  lines.push(`\uFEFFRelatório: ${escapeCsvValue(report.title)}`);
  lines.push(`Descrição;${escapeCsvValue(report.description)}`);
  lines.push(`Gerado em;${escapeCsvValue(formatDate())}`);
  lines.push(`Filtros;${escapeCsvValue(formatFiltersToText(filters).join("; "))}`);
  lines.push(`Métrica;${escapeCsvValue(`${report.metricLabel}: ${metricText(report)}`)}`);
  lines.push("");

  const header = report.columns.map((column) => escapeCsvValue(column.label));
  lines.push(header.join(";"));

  if (report.rows.length === 0) {
    lines.push("Nenhum registro encontrado.");
  } else {
    for (const row of report.rows) {
      const values = report.columns.map((column) =>
        escapeCsvValue(row.values[column.key]),
      );
      lines.push(values.join(";"));
    }
  }

  return Buffer.from(lines.join("\r\n") + "\r\n", "utf-8");
};
