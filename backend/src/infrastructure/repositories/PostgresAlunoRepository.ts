import { Pool } from "pg";
import { Aluno } from "../../domain/entities/Aluno";
import {
  AlunoRepository,
  RecuperacaoSenhaValida,
  RegistrarRecuperacaoSenhaInput,
  UsuarioRecuperacaoSenha,
} from "../../domain/repositories/AlunoRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";

export class PostgresAlunoRepository implements AlunoRepository {
  constructor(private db: Pool) {}

  private readonly selecionarAluno = `
    SELECT
      a.id,
      a.telefone,
      a.data_nascimento,
      a.data_cadastro,
      a.treinamento,
      a.is_aluno_unipe,
      a.rgm,
      a.curso_unipe,
      u.nome,
      u.cpf,
      u.email,
      u.senha
    FROM alunos a
    JOIN usuarios u ON u.id = a.usuario_id
  `;

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
      rgm: linha.rgm ?? undefined,
      cursoUnipe: linha.curso_unipe ?? undefined,
    });
  }

  async buscarPorEmailOuCpf(identificador: string): Promise<Aluno | null> {
    const query = `
      ${this.selecionarAluno}
      WHERE lower(u.email) = lower($1) OR u.cpf = $1
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [identificador]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async buscarPorCpf(cpf: string): Promise<Aluno | null> {
    const query = `${this.selecionarAluno} WHERE u.cpf = $1 LIMIT 1`;
    const resultado = await this.db.query(query, [cpf]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async buscarPorEmail(email: string): Promise<Aluno | null> {
    const query = `
      ${this.selecionarAluno}
      WHERE lower(u.email) = lower($1)
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [email]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacaoSenha | null> {
    const query = `
      SELECT id, nome, email
      FROM usuarios
      WHERE email = $1
        AND status = 'ativo'
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [email]);

    if (resultado.rows.length === 0) return null;

    return {
      id: resultado.rows[0].id,
      nome: resultado.rows[0].nome,
      email: resultado.rows[0].email,
    };
  }

  async existeRecuperacaoSenhaRecente(
    usuarioId: string,
    intervaloMinutos: number,
  ): Promise<boolean> {
    const query = `
      SELECT 1
      FROM recuperacoes_senha
      WHERE usuario_id = $1
        AND solicitado_em > now() - ($2::int * interval '1 minute')
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [usuarioId, intervaloMinutos]);
    return resultado.rows.length > 0;
  }

  async registrarRecuperacaoSenha(dados: RegistrarRecuperacaoSenhaInput): Promise<void> {
    const query = `
      INSERT INTO recuperacoes_senha (
        usuario_id, token_hash, expira_em, ip_solicitante, user_agent
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    await this.db.query(query, [
      dados.usuarioId,
      dados.tokenHash,
      dados.expiraEm,
      dados.ipSolicitante ?? null,
      dados.userAgent ?? null,
    ]);
  }

  async buscarRecuperacaoValidaPorTokenHash(
    tokenHash: string,
  ): Promise<RecuperacaoSenhaValida | null> {
    const query = `
      SELECT id, usuario_id
      FROM recuperacoes_senha
      WHERE token_hash = $1
        AND usado_em IS NULL
        AND expira_em > now()
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [tokenHash]);
    const linha = resultado.rows[0];

    if (!linha) return null;

    return {
      recuperacaoId: linha.id,
      usuarioId: linha.usuario_id,
    };
  }

  async redefinirSenhaUsuario(
    usuarioId: string,
    novaSenhaHash: string,
    recuperacaoId: string,
  ): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const resultadoUsuario = await client.query(
        `UPDATE usuarios SET senha = $2 WHERE id = $1`,
        [usuarioId, novaSenhaHash],
      );

      if (resultadoUsuario.rowCount !== 1) {
        throw new Error("Usuario nao encontrado.");
      }

      const resultadoRecuperacao = await client.query(
        `UPDATE recuperacoes_senha
         SET usado_em = now()
         WHERE id = $1 AND usado_em IS NULL
         RETURNING id`,
        [recuperacaoId],
      );

      if (resultadoRecuperacao.rowCount !== 1) {
        throw new Error("Link de redefinicao ja foi utilizado.");
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async cadastrar(aluno: Aluno): Promise<Aluno> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const inserirUsuario = `
        INSERT INTO usuarios (perfil_id, nome, email, cpf, senha, status)
        SELECT id, $1, $2, $3, $4, 'ativo'
        FROM perfis
        WHERE nome = 'aluno'
        RETURNING id
      `;

      const resultadoUsuario = await client.query(inserirUsuario, [
        aluno.nome,
        aluno.email,
        aluno.cpf,
        aluno.senha,
      ]);

      if (resultadoUsuario.rowCount !== 1) {
        throw new Error("Perfil aluno nao cadastrado.");
      }

      const usuarioId = resultadoUsuario.rows[0].id;
      const inserirAluno = `
        INSERT INTO alunos (
          id, usuario_id, telefone, data_nascimento, treinamento,
          is_aluno_unipe, rgm, curso_unipe
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await client.query(inserirAluno, [
        aluno.id,
        usuarioId,
        aluno.telefone,
        aluno.dataNascimento,
        aluno.treinamento,
        aluno.isAlunoUnipe,
        aluno.rgm ?? null,
        aluno.cursoUnipe ?? null,
      ]);

      const resultado = await client.query(
        `${this.selecionarAluno} WHERE a.id = $1`,
        [aluno.id],
      );

      await client.query("COMMIT");
      return this.mapearLinhaParaAluno(resultado.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id: string): Promise<Aluno | null> {
    const query = `${this.selecionarAluno} WHERE a.id = $1`;
    const resultado = await this.db.query(query, [id]);

    if (resultado.rows.length === 0) return null;
    return this.mapearLinhaParaAluno(resultado.rows[0]);
  }

  async listarTodos(): Promise<Aluno[]> {
    const query = `${this.selecionarAluno} ORDER BY u.nome`;
    const resultado = await this.db.query(query);

    return resultado.rows.map((linha) => this.mapearLinhaParaAluno(linha));
  }

  async atualizar(aluno: Aluno): Promise<Aluno> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const query = `
        UPDATE alunos
        SET telefone = $2, data_nascimento = $3, treinamento = $4,
            is_aluno_unipe = $5, rgm = $6, curso_unipe = $7
        WHERE id = $1
        RETURNING id
      `;
      const valores = [
        aluno.id,
        aluno.telefone,
        aluno.dataNascimento,
        aluno.treinamento,
        aluno.isAlunoUnipe,
        aluno.rgm ?? null,
        aluno.cursoUnipe ?? null,
      ];

      const resultado = await client.query(query, valores);

      await client.query(
        `
          UPDATE usuarios
          SET nome = $2, email = $3, senha = $4
          WHERE id = (SELECT usuario_id FROM alunos WHERE id = $1)
        `,
        [aluno.id, aluno.nome, aluno.email, aluno.senha],
      );

      if (resultado.rows.length === 0) {
        throw new Error("Aluno nao encontrado.");
      }

      const alunoAtualizado = await client.query(
        `${this.selecionarAluno} WHERE a.id = $1`,
        [aluno.id],
      );

      await client.query("COMMIT");
      return this.mapearLinhaParaAluno(alunoAtualizado.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async deletar(id: string): Promise<void> {
    const query = `
      DELETE FROM usuarios
      WHERE id = (SELECT usuario_id FROM alunos WHERE id = $1)
    `;
    await this.db.query(query, [id]);
  }
}
