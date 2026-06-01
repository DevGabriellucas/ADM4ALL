export class Telefone {
  private readonly valor: string;

  constructor(telefone: string) {
    if (!this.validar(telefone)) {
      throw new Error("O telefone fornecido é inválido. Deve conter o DDD e um número válido.");
    }
    this.valor = telefone.replace(/\D/g, "");
  }

  get value(): string {
    return this.valor;
  }

  private validar(telefone: string): boolean {
    if (!telefone) return false;

    const telefoneNums = telefone.replace(/\D/g, "");
    
    return telefoneNums.length === 10 || telefoneNums.length === 11;
  }
}