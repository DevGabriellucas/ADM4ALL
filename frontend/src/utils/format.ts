// Converte "YYYY-MM-DD" em "dd/mm/aaaa" sem depender de timezone.
export const formatData = (iso: string | null | undefined): string => {
  if (!iso) {
    return "-";
  }

  const [ano, mes, dia] = iso.slice(0, 10).split("-");

  if (!ano || !mes || !dia) {
    return iso;
  }

  return `${dia}/${mes}/${ano}`;
};

export const formatTamanho = (bytes: number | null | undefined): string => {
  if (!bytes || bytes <= 0) {
    return "-";
  }

  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
};

const EXTENSAO_POR_TIPO: Record<string, string> = {
  pdf: "PDF",
  video: "MP4",
  imagem: "IMG",
  documento: "DOCX",
  link: "LINK",
  outro: "ARQ",
};

export const formatTipoMaterial = (tipo: string): string => {
  return EXTENSAO_POR_TIPO[tipo] ?? tipo.toUpperCase();
};
