import { Aluno } from "../../domain/entities/Aluno";
import { AlunoRepository } from "../../domain/repositories/AlunoRepository";

export class InMemoryAlunoRepository implements AlunoRepository {
  private alunos: Aluno[] = [];

  async cadastrar(aluno: Aluno): Promise<Aluno> {
    this.alunos.push(aluno);
    return aluno;
  }

  async buscarPorId(id: string): Promise<Aluno | null> {
    return this.alunos.find(a => a.id === id) || null;
  }

  async buscarPorCpf(cpf: string): Promise<Aluno | null> {
    return this.alunos.find(a => a.cpf === cpf) || null;
  }

  async listarTodos(): Promise<Aluno[]> {
    return this.alunos;
  }

  async atualizar(aluno: Aluno): Promise<Aluno> {
    const index = this.alunos.findIndex(a => a.id === aluno.id);
    if (index !== -1) this.alunos[index] = aluno;
    return aluno;
  }

  async deletar(id: string): Promise<void> {
    this.alunos = this.alunos.filter(a => a.id !== id);
  }
}