export const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} nao configurada.`);
  }

  return value;
};

export const getFirstAvailableEnv = (
  primaryName: string,
  fallbackName: string,
): string => {
  const primaryValue = process.env[primaryName]?.trim();
  if (primaryValue) return primaryValue;

  const fallbackValue = process.env[fallbackName]?.trim();
  if (fallbackValue) return fallbackValue;

  throw new Error(`${primaryName} ou ${fallbackName} nao configurada.`);
};
