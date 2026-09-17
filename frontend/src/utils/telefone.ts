export const somenteDigitosTelefone = (valor: string) =>
  valor.replace(/\D/g, "").slice(0, 11);

export const formatarTelefone = (valor: string) => {
  const digitos = somenteDigitosTelefone(valor);

  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};
