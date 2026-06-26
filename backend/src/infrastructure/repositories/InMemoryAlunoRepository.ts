import crypto from "crypto";
import { Aluno } from "../../domain/entities/Aluno";
import {
  AlunoRepository,
  RecuperacaoSenhaValida,
  RegistrarRecuperacaoSenhaInput,
  UsuarioRecuperacaoSenha,
} from "../../domain/repositories/AlunoRepository";

export class InMemoryAlunoRepository implements AlunoRepository {
  private alunos: Aluno[] = [];
  private recuperacoesSenha: Array<{
    id: string;
    usuarioId: string;
    tokenHash: string;
    solicitadoEm: Date;
    expiraEm: Date;
    usadoEm: Date | null;
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
      id: crypto.randomUUID(),
      usuarioId: dados.usuarioId,
      tokenHash: dados.tokenHash,
      solicitadoEm: new Date(),
      expiraEm: dados.expiraEm,
      usadoEm: null,
    });
  }

  async buscarRecuperacaoValidaPorTokenHash(
    tokenHash: string,
  ): Promise<RecuperacaoSenhaValida | null> {
    const recuperacao = this.recuperacoesSenha.find(
      (item) =>
        item.tokenHash === tokenHash &&
        item.usadoEm === null &&
        item.expiraEm.getTime() > Date.now(),
    );

    if (!recuperacao) return null;

    return {
      recuperacaoId: recuperacao.id,
      usuarioId: recuperacao.usuarioId,
    };
  }

  async redefinirSenhaUsuario(
    usuarioId: string,
    novaSenhaHash: string,
    recuperacaoId: string,
  ): Promise<void> {
    const aluno = this.alunos.find((a) => a.id === usuarioId);
    if (aluno) {
      aluno.update({ senha: novaSenhaHash });
    }

    const recuperacao = this.recuperacoesSenha.find(
      (item) => item.id === recuperacaoId,
    );
    if (recuperacao) {
      recuperacao.usadoEm = new Date();
    }
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
