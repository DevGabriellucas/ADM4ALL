import type { LoginResponse } from "@/services/authService";

export const alunoLoginResponseMock: LoginResponse = {
  mensagem: "Login realizado com sucesso!",
  token: "jwt-aluno-mock",
  usuario: {
    id: "10000000-0000-0000-0000-000000000001",
    nome: "Priscilla Cahino",
    email: "priscilla.cahino@example.com",
    perfil: "aluno",
    alunoId: "20000000-0000-0000-0000-000000000001",
    instrutorId: null,
    coordenadorId: null,
  },
};

export const instrutorLoginResponseMock: LoginResponse = {
  mensagem: "Login realizado com sucesso!",
  token: "jwt-instrutor-mock",
  usuario: {
    id: "10000000-0000-0000-0000-000000000004",
    nome: "Eduardo Lima",
    email: "eduardo.lima@example.com",
    perfil: "instrutor",
    alunoId: null,
    instrutorId: "20000000-0000-0000-0000-000000000004",
    coordenadorId: null,
  },
};

export const coordenadorLoginResponseMock: LoginResponse = {
  mensagem: "Login realizado com sucesso!",
  token: "jwt-coordenador-mock",
  usuario: {
    id: "10000000-0000-0000-0000-000000000007",
    nome: "Marina Araujo",
    email: "marina.araujo@example.com",
    perfil: "coordenador",
    alunoId: null,
    instrutorId: null,
    coordenadorId: "30000000-0000-0000-0000-000000000001",
  },
};

export const loginErrorResponseMock = {
  erro: "Credenciais invalidas.",
};
