import path from "path";

const resolverDiretorio = (envName: string, fallback: string) => {
  const valor = process.env[envName]?.trim();
  return path.resolve(valor || path.join(process.cwd(), fallback));
};

export const getUploadsDir = () => resolverDiretorio("UPLOADS_DIR", "uploads");

export const getMateriaisUploadsDir = () =>
  path.join(getUploadsDir(), "materiais");

export const getAvataresUploadsDir = () =>
  path.join(getUploadsDir(), "avatares");

export const getStorageDir = () => resolverDiretorio("STORAGE_DIR", "storage");

export const getCertificadosStorageDir = () =>
  path.join(getStorageDir(), "certificados");
