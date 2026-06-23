import { Pool } from "pg";
import { Aluno } from "../../domain/entities/Aluno";
import { AlunoRepository } from "../../domain/repositories/AlunoRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";

export class PostgresAlunoRepository implements AlunoRepository {
  constructor(private db: Pool) {}

  private mapearLinhaParaAluno(linha: any): Aluno {
    return new Aluno({
      id: linha.id,
      nome: linha.nome,
      cpf: new Cpf(linha.cpf),
      telefone: new Telefone(linha.telefone),
      email: new Email(linha.email),
      dataNascimento: new Date(linha.data_nascimento),
      dataCadastro: new Date(linha.data_cadastro),
      senha: linha.senha,
      treinamento: linha.treinamento,
      isAlunoUnipe: linha.is_aluno_unipe,   
      rgm: linha.rgm,
      cursoUnipe: linha.curso_unipe          
    });
  }

  async buscarPorEmailOuCpf(identificador: string): Promise<Aluno | null> {
    const query = `SELECT * FROM alunos WHERE email = $1 OR cpf = $1`;
    const resultado = await this.db.query(query, [identificador]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async buscarPorCpf(cpf: string): Promise<Aluno | null> {
    const query = `SELECT * FROM alunos WHERE cpf = $1`;
    const resultado = await this.db.query(query, [cpf]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async buscarPorEmail(email: string): Promise<Aluno | null> {
    const query = `SELECT * FROM alunos WHERE email = $1`;
    const resultado = await this.db.query(query, [email]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async cadastrar(aluno: Aluno): Promise<Aluno> {
    const query = `
      INSERT INTO alunos (
        id, nome, cpf, telefone, email, data_nascimento, 
        senha, treinamento, is_aluno_unipe, rgm, curso_unipe
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const valores = [
      aluno.id, 
      aluno.nome, 
      aluno.cpf, 
      aluno.telefone, 
      aluno.email, 
      aluno.dataNascimento, 
      aluno.senha,         
      aluno.treinamento, 
      aluno.isAlunoUnipe, 
      aluno.rgm, 
      aluno.cursoUnipe
    ];

    const resultado = await this.db.query(query, valores);
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async buscarPorId(id: string): Promise<Aluno | null> {
    const query = `SELECT * FROM alunos WHERE id = $1`;
    const resultado = await this.db.query(query, [id]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async listarTodos(): Promise<Aluno[]> {
    const query = `SELECT * FROM alunos`;
    const resultado = await this.db.query(query);

    return resultado.rows.map((linha) => this.mapearLinhaParaAluno(linha));
  }

  async atualizar(aluno: Aluno): Promise<Aluno> {
    const query = `
      UPDATE alunos 
      SET nome = $2, cpf = $3, telefone = $4, email = $5, data_nascimento = $6, 
          senha = $7, treinamento = $8, is_aluno_unipe = $9, rgm = $10, curso_unipe = $11
      WHERE id = $1
      RETURNING *
    `;
    const valores = [
      aluno.id, aluno.nome, aluno.cpf, aluno.telefone, aluno.email, 
      aluno.dataNascimento, aluno.senha, aluno.treinamento, 
      aluno.isAlunoUnipe, aluno.rgm, aluno.cursoUnipe
    ];

    const resultado = await this.db.query(query, valores);
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async deletar(id: string): Promise<void> {
    const query = `DELETE FROM alunos WHERE id = $1`;
    await this.db.query(query, [id]);
  }
}
