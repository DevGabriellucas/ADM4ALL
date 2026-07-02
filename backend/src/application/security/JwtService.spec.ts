import { JwtService, TokenPayload } from "./JwtService";

describe("JwtService", () => {
  const secret = "super-secret-key-123456789";
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService(secret);
  });

  it("deve lançar erro se o segredo for curto", () => {
    expect(() => new JwtService("short")).toThrow("JWT_SECRET precisa ter pelo menos 16 caracteres.");
  });

  it("deve gerar um token válido", () => {
    const payload: Omit<TokenPayload, "exp"> = {
      sub: "1",
      nome: "User",
      email: "user@email.com",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };

    const token = jwtService.gerar(payload);
    expect(token.split(".")).toHaveLength(3);
  });

  it("deve verificar um token válido", () => {
    const payload: Omit<TokenPayload, "exp"> = {
      sub: "1",
      nome: "User",
      email: "user@email.com",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };

    const token = jwtService.gerar(payload);
    const decoded = jwtService.verificar(token);
    expect(decoded.sub).toBe(payload.sub);
  });

  it("deve lançar erro para token expirado", () => {
    const payload: Omit<TokenPayload, "exp"> = {
      sub: "1",
      nome: "User",
      email: "user@email.com",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };

    // Gera um token que expira imediatamente (-1 segundo)
    const token = jwtService.gerar(payload, -1);
    expect(() => jwtService.verificar(token)).toThrow("Token expirado.");
  });

  it("deve lançar erro para token malformado", () => {
    expect(() => jwtService.verificar("malformado")).toThrow("Token invalido.");
  });

  it("deve lançar erro para assinatura adulterada", () => {
    const payload: Omit<TokenPayload, "exp"> = {
      sub: "1",
      nome: "User",
      email: "user@email.com",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };
    const token = jwtService.gerar(payload);
    const parts = token.split(".");
    // Adulterar a assinatura (3ª parte)
    const tamperedToken = `${parts[0]}.${parts[1]}.tampered`;
    expect(() => jwtService.verificar(tamperedToken)).toThrow("Token invalido.");
  });
});
