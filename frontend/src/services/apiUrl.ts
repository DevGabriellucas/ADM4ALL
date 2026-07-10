const normalizeApiUrl = (url: string) => url.replace(/\/$/, "");

const isDockerRuntime = () => process.env.ADM4ALL_RUNTIME === "docker";

const isDockerServiceUrl = (url: string) => {
  try {
    return new URL(url).hostname === "backend";
  } catch {
    return false;
  }
};

export const getPublicApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return normalizeApiUrl(apiUrl);
};

export const getApiUrl = () => {
  const internalApiUrl = process.env.API_INTERNAL_URL?.trim();
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const shouldUseInternalApiUrl =
    typeof window === "undefined" &&
    internalApiUrl &&
    (isDockerRuntime() || !isDockerServiceUrl(internalApiUrl));

  const apiUrl = shouldUseInternalApiUrl ? internalApiUrl : publicApiUrl;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return normalizeApiUrl(apiUrl);
};
