import type { LoginResponse } from "@/services/authService";

export const alunoLoginResponseMock: LoginResponse = {
  mensagem: "Login realizado com sucesso!",
  token: "jwt-aluno-mock",
  usuario: {
    id: "ec9c6235-8532-47e6-bca7-6b58ba85a51f",
    nome: "Priscilla Cahino",
    email: "priscilla.cahino@example.com",
    perfil: "aluno",
    alunoId: "ab34ec25-af9f-4e66-8e3d-48b38178f545",
    instrutorId: null,
    coordenadorId: null,
  },
};

export const instrutorLoginResponseMock: LoginResponse = {
  mensagem: "Login realizado com sucesso!",
  token: "jwt-instrutor-mock",
  usuario: {
    id: "ddba5066-6c5f-4989-b715-638a0b9a8d58",
    nome: "Eduardo Lima",
    email: "eduardo.lima@example.com",
    perfil: "instrutor",
    alunoId: null,
    instrutorId: "9ab264bc-036b-4e62-ba6b-6a93d2da94c2",
    coordenadorId: null,
  },
};

export const coordenadorLoginResponseMock: LoginResponse = {
  mensagem: "Login realizado com sucesso!",
  token: "jwt-coordenador-mock",
  usuario: {
    id: "0befab74-8720-40e2-8a9a-14530f9f7f08",
    nome: "Amanda Souza",
    email: "amanda.souza@example.com",
    perfil: "coordenador",
    alunoId: null,
    instrutorId: null,
    coordenadorId: "99fa3cbc-5367-4911-a6d2-dba72e50d6c0",
  },
};

export const loginErrorResponseMock = {
  erro: "Credenciais invalidas.",
};
