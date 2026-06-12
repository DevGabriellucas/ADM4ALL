import { Aluno } from "../entities/Aluno";

export interface AlunoRepository {
  cadastrar(aluno: Aluno): Promise<Aluno>;
  buscarPorId(id: string): Promise<Aluno | null>;
  buscarPorCpf(cpf: string): Promise<Aluno | null>;
  buscarPorEmail(email: string): Promise<Aluno | null>;
  listarTodos(): Promise<Aluno[]>;
  atualizar(aluno: Aluno): Promise<Aluno>;
  deletar(id: string): Promise<void>;
}