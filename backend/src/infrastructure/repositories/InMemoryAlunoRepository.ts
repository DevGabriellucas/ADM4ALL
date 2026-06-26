import { Aluno } from "../../domain/entities/Aluno";
import {
  AlunoRepository,
  RegistrarRecuperacaoSenhaInput,
  UsuarioRecuperacaoSenha,
} from "../../domain/repositories/AlunoRepository";

export class InMemoryAlunoRepository implements AlunoRepository {
  private alunos: Aluno[] = [];
  private recuperacoesSenha: Array<{
    usuarioId: string;
    tokenHash: string;
    solicitadoEm: Date;
    expiraEm: Date;
  }> = [];

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

  async buscarPorEmail(email: string): Promise<Aluno | null> {
    return this.alunos.find(a => a.email === email) || null;
  }

  async buscarPorEmailOuCpf(identificador: string): Promise<Aluno | null> {
    return this.alunos.find(a => a.email === identificador || a.cpf === identificador) || null;
  }

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacaoSenha | null> {
    const aluno = await this.buscarPorEmail(email);
    if (!aluno) return null;

    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
    };
  }

  async existeRecuperacaoSenhaRecente(usuarioId: string, intervaloMinutos: number): Promise<boolean> {
    const limite = Date.now() - intervaloMinutos * 60 * 1000;

    return this.recuperacoesSenha.some(
      recuperacao =>
        recuperacao.usuarioId === usuarioId &&
        recuperacao.solicitadoEm.getTime() > limite,
    );
  }

  async registrarRecuperacaoSenha(dados: RegistrarRecuperacaoSenhaInput): Promise<void> {
    this.recuperacoesSenha.push({
      usuarioId: dados.usuarioId,
      tokenHash: dados.tokenHash,
      solicitadoEm: new Date(),
      expiraEm: dados.expiraEm,
    });
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
