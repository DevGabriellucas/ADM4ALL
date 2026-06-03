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

  private validar(cpf: string): boolean {
    if (!cpf) return false;
    
    const cpfNums = cpf.replace(/\D/g, "");
    
    if (cpfNums.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpfNums)) return false;
    
    return true;
  }
}