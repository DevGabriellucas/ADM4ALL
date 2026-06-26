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
        `UPDATE usuarios SET senha = $2 WHERE id = $1 RETURNING aluno_id`,
        [usuarioId, novaSenhaHash],
      );

      if (resultadoUsuario.rowCount !== 1) {
        throw new Error("Usuario nao encontrado.");
      }

      const alunoId = resultadoUsuario.rows[0].aluno_id;

      if (alunoId) {
        await client.query(`UPDATE alunos SET senha = $2 WHERE id = $1`, [
          alunoId,
          novaSenhaHash,
        ]);
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

      const inserirAluno = `
        INSERT INTO alunos (
          id, nome, cpf, telefone, email, data_nascimento,
          senha, treinamento, is_aluno_unipe, rgm, curso_unipe
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const valoresAluno = [
        aluno.id,
        aluno.nome,
        aluno.cpf,
        aluno.telefone,
        aluno.email,
        aluno.dataNascimento,
        aluno.senha,
        aluno.treinamento,
        aluno.isAlunoUnipe,
        aluno.rgm ?? null,
        aluno.cursoUnipe ?? null,
      ];

      const resultado = await client.query(inserirAluno, valoresAluno);

      const inserirUsuario = `
        INSERT INTO usuarios (perfil_id, aluno_id, nome, email, senha, status)
        SELECT id, $1, $2, $3, $4, 'ativo'
        FROM perfis
        WHERE nome = 'aluno'
      `;

      const resultadoUsuario = await client.query(inserirUsuario, [
        aluno.id,
        aluno.nome,
        aluno.email,
        aluno.senha,
      ]);

      if (resultadoUsuario.rowCount !== 1) {
        throw new Error("Perfil aluno nao cadastrado.");
      }

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
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const query = `
        UPDATE alunos
        SET nome = $2, cpf = $3, telefone = $4, email = $5, data_nascimento = $6,
            senha = $7, treinamento = $8, is_aluno_unipe = $9, rgm = $10, curso_unipe = $11
        WHERE id = $1
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
        aluno.rgm ?? null,
        aluno.cursoUnipe ?? null,
      ];

      const resultado = await client.query(query, valores);

      await client.query(
        `
          UPDATE usuarios
          SET nome = $2, email = $3, senha = $4
          WHERE aluno_id = $1
        `,
        [aluno.id, aluno.nome, aluno.email, aluno.senha],
      );

      await client.query("COMMIT");

      if (resultado.rows.length === 0) {
        throw new Error("Aluno nao encontrado.");
      }

      return this.mapearLinhaParaAluno(resultado.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async deletar(id: string): Promise<void> {
    const query = `DELETE FROM alunos WHERE id = $1`;
    await this.db.query(query, [id]);
  }
}
