import path from "path";
import fs from "fs/promises";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";

const RELATORIOS_DIR = path.resolve(process.cwd(), "storage", "relatorios");
const RELATORIOS_PREFIX = `${RELATORIOS_DIR}${path.sep}`;
const RELATORIOS_RELATIVE_PREFIX = "relatorios/";

function getRelatorioFilename(relativePath: string): string | null {
  if (!relativePath.trim()) return null;
  if (path.isAbsolute(relativePath)) return null;
  if (relativePath.includes("..")) return null;
  if (relativePath.includes("\\")) return null;

  const normalizedPath = relativePath.replace(/\/+/g, "/");
  const filename = normalizedPath.startsWith(RELATORIOS_RELATIVE_PREFIX)
    ? normalizedPath.slice(RELATORIOS_RELATIVE_PREFIX.length)
    : normalizedPath;

  if (!filename || filename.includes("/")) return null;
  if (filename !== path.basename(filename)) return null;

  return filename;
}

export async function ensureRelatoriosDir(): Promise<void> {
  await fs.mkdir(RELATORIOS_DIR, { recursive: true });
}

export function buildRelatorioPath(filename: string): string {
  const safeFilename = getRelatorioFilename(filename);
  if (!safeFilename) {
    throw new BadRequestError("Nome de arquivo de relatorio invalido.");
  }

  return path.join(RELATORIOS_DIR, safeFilename);
}

export function buildRelatorioRelativePath(filename: string): string {
  const safeFilename = getRelatorioFilename(filename);
  if (!safeFilename) {
    throw new BadRequestError("Nome de arquivo de relatorio invalido.");
  }

  return `${RELATORIOS_RELATIVE_PREFIX}${safeFilename}`;
}

export function resolveRelatorioPathOrThrow(
  relativePath: string | null,
): { caminho: string; nomeArquivo: string } {
  if (!relativePath) {
    throw new NotFoundError("Arquivo do relatorio nao encontrado.");
  }

  const filename = getRelatorioFilename(relativePath);
  if (!filename) {
    throw new BadRequestError("Caminho de arquivo invalido.");
  }

  const fullPath = path.resolve(RELATORIOS_DIR, filename);

  if (!fullPath.startsWith(RELATORIOS_PREFIX)) {
    throw new BadRequestError("Caminho de arquivo invalido.");
  }

  return { caminho: fullPath, nomeArquivo: filename };
}

export async function removeRelatorioFile(
  relativePath: string | null,
): Promise<void> {
  if (!relativePath) return;

  const filename = getRelatorioFilename(relativePath);
  if (!filename) {
    throw new BadRequestError("Caminho de arquivo invalido.");
  }

  const fullPath = path.resolve(RELATORIOS_DIR, filename);
  if (!fullPath.startsWith(RELATORIOS_PREFIX)) {
    throw new BadRequestError("Caminho de arquivo invalido.");
  }

  try {
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error?.code === "ENOENT") return;
    console.error("Falha ao remover arquivo de relatorio:", error);
  }
}
