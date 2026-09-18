import {
  ControleDeTentativasLogin,
  JANELA_MINUTOS,
  LIMITE_DE_ERROS,
} from "./ControleDeTentativasLogin";

describe("ControleDeTentativasLogin", () => {
  let agora: number;
  let controle: ControleDeTentativasLogin;

  const errar = (vezes: number, identificador = "aluno@teste.com") => {
    for (let i = 0; i < vezes; i++) controle.registrarErro(identificador);
  };

  const avancarMinutos = (minutos: number) => {
    agora += minutos * 60 * 1000;
  };

  beforeEach(() => {
    agora = Date.UTC(2026, 8, 18, 12, 0, 0);
    controle = new ControleDeTentativasLogin(() => agora);
  });

  it("deixa passar enquanto os erros nao alcancam o limite", () => {
    errar(LIMITE_DE_ERROS - 1);

    expect(controle.minutosBloqueado("aluno@teste.com")).toBeNull();
  });

  it("fecha a porta no limite e diz quantos minutos faltam", () => {
    errar(LIMITE_DE_ERROS);

    expect(controle.minutosBloqueado("aluno@teste.com")).toBe(JANELA_MINUTOS);
  });

  it("libera sozinho quando a janela vence", () => {
    errar(LIMITE_DE_ERROS);
    avancarMinutos(JANELA_MINUTOS + 1);

    expect(controle.minutosBloqueado("aluno@teste.com")).toBeNull();
  });

  // Sem isto bastaria esperar a janela quase vencer, errar de novo e recomecar
  // a contagem do zero sem nunca ser bloqueado.
  it("renova a janela a cada erro novo", () => {
    errar(LIMITE_DE_ERROS - 1);
    avancarMinutos(JANELA_MINUTOS - 1);
    errar(1);

    expect(controle.minutosBloqueado("aluno@teste.com")).toBe(JANELA_MINUTOS);
  });

  it("acertar a senha zera a contagem", () => {
    errar(LIMITE_DE_ERROS - 1);
    controle.registrarAcerto("aluno@teste.com");
    errar(LIMITE_DE_ERROS - 1);

    expect(controle.minutosBloqueado("aluno@teste.com")).toBeNull();
  });

  it("nao prende um identificador por causa do erro de outro", () => {
    errar(LIMITE_DE_ERROS, "aluno@teste.com");

    expect(controle.minutosBloqueado("outro@teste.com")).toBeNull();
  });

  // O mesmo e-mail digitado com caixa diferente e a mesma conta: sem normalizar,
  // alternar maiusculas daria tentativas infinitas.
  it("trata o identificador sem diferenciar caixa nem espacos", () => {
    errar(LIMITE_DE_ERROS, "  Aluno@Teste.com ");

    expect(controle.minutosBloqueado("aluno@teste.com")).toBe(JANELA_MINUTOS);
  });

  it("arredonda os minutos para cima", () => {
    errar(LIMITE_DE_ERROS);
    avancarMinutos(JANELA_MINUTOS - 1);

    // Falta pouco menos de 1 minuto: dizer "0" faria a pessoa tentar na hora e
    // levar outra recusa.
    agora += 30 * 1000;
    expect(controle.minutosBloqueado("aluno@teste.com")).toBe(1);
  });
});
