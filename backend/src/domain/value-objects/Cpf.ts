export class Cpf {
  private readonly valor: string;

  constructor(cpf: string) {
    if (!this.validar(cpf)) {
      throw new Error("O CPF fornecido é inválido. Use o formato 000.000.000-00 ou apenas números.");
    }
    this.valor = cpf.replace(/\D/g, "");
  }

  get value(): string {
    return this.valor;
  }

  // Calcula um digito verificador de CPF pelo modulo 11: cada digito da base e
  // multiplicado por um peso decrescente que comeca em base.length + 1.
  private calcularDigito(base: number[]): number {
    const soma = base.reduce(
      (acumulado, digito, indice) =>
        acumulado + digito * (base.length + 1 - indice),
      0,
    );

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  }

  private validar(cpf: string): boolean {
    if (!cpf) return false;

    const cpfNums = cpf.replace(/\D/g, "");

    if (cpfNums.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpfNums)) return false;

    // Confere os dois digitos verificadores. Sem isso qualquer sequencia de 11
    // digitos passava, e o CPF e um dos identificadores de login.
    const base = cpfNums.slice(0, 9).split("").map(Number);
    const primeiroDigito = this.calcularDigito(base);

    if (primeiroDigito !== Number(cpfNums[9])) return false;

    const segundoDigito = this.calcularDigito([...base, primeiroDigito]);

    return segundoDigito === Number(cpfNums[10]);
  }
}