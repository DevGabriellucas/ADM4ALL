export class Email {
  private readonly valor: string;

  constructor(emailBruto: string) {
    if (!this.validar(emailBruto)) {
      throw new Error("O e-mail fornecido é inválido.");
    }
    this.valor = emailBruto.trim().toLowerCase();
  }

  get value(): string {
    return this.valor;
  }

  private validar(email: string): boolean {
    if (!email || email.trim() === "") return false;

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }
}