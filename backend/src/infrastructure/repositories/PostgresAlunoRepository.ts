import { Pool } from "pg";
import { Aluno } from "../../domain/entities/Aluno";
import {
  AlunoDashboard,
  AlunoRepository,
  CertificadoEmitidoDoAluno,
  MaterialAluno,
  MaterialAlunoDownload,
  MaterialVisivelAluno,
  RecuperacaoSenhaValida,
  RegistrarRecuperacaoSenhaInput,
  UsuarioRecuperacaoSenha,
} from "../../domain/repositories/AlunoRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import { BadRequestError } from "../errors/BadRequestError";

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

  async buscarUsuarioIdPorAlunoId(alunoId: string): Promise<string | null> {
    const resultado = await this.db.query(
      "SELECT usuario_id FROM alunos WHERE id = $1 LIMIT 1",
      [alunoId],
    );
    return resultado.rows[0]?.usuario_id ?? null;
  }

  async buscarDashboardPorAlunoId(
    alunoId: string,
  ): Promise<AlunoDashboard | null> {
    const query = `
      WITH matricula_selecionada AS (
        SELECT m.*
        FROM matriculas m
        WHERE m.aluno_id = $1
        ORDER BY
          CASE m.status
            WHEN 'em_andamento' THEN 0
            WHEN 'aprovado' THEN 1
            WHEN 'reprovado_falta' THEN 2
            ELSE 3
          END,
          m.data_matricula DESC
        LIMIT 1
      )
      SELECT
        u.nome,
        a.rgm AS matricula,
        tr.nome AS nome_curso,
        (
          SELECT COUNT(*)::INTEGER
          FROM frequencias f
          WHERE f.matricula_id = m.id
            AND f.presente = FALSE
        ) AS qtd_faltas,
        (
          SELECT COUNT(*)::INTEGER
          FROM aulas au
          WHERE au.turma_id = m.turma_id
            AND au.status <> 'cancelada'
        ) AS qtd_total_aulas,
        (
          SELECT COUNT(*)::INTEGER
          FROM aulas au
          WHERE au.turma_id = m.turma_id
            AND au.status = 'realizada'
        ) AS qtd_aulas_concluidas,
        m.progresso,
        m.status,
        COALESCE(c.status = 'emitido', FALSE) AS certificado_disponivel,
        CASE WHEN c.status = 'emitido' THEN c.url_arquivo ELSE NULL END
          AS certificado_url
      FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN matricula_selecionada m ON m.aluno_id = a.id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      LEFT JOIN certificados c ON c.matricula_id = m.id
      WHERE a.id = $1
      LIMIT 1
    `;

    const resultado = await this.db.query(query, [alunoId]);
    const linha = resultado.rows[0];

    if (!linha) {
      return null;
    }

    return {
      nome: linha.nome,
      matricula: linha.matricula ?? null,
      cursoDeExtensao: {
        nomeCurso: linha.nome_curso,
        qtdFaltas: Number(linha.qtd_faltas),
        qtdTotalAulas: Number(linha.qtd_total_aulas),
        qtdAulasConcluidas: Number(linha.qtd_aulas_concluidas),
        progresso: Number(linha.progresso),
        status: linha.status,
      },
      certificadoDisponivel: linha.certificado_disponivel,
      certificadoUrl: linha.certificado_url ?? null,
    };
  }

  async listarMateriaisVisiveis(
    alunoId: string,
  ): Promise<MaterialVisivelAluno[]> {
    const query = `
      SELECT
        mat.id,
        t.id AS turma_id,
        t.nome AS turma,
        tr.nome AS curso,
        au.id AS aula_id,
        au.titulo AS aula_titulo,
        mat.titulo,
        mat.descricao,
        mat.tipo,
        mat.url_arquivo,
        mat.tamanho_bytes,
        to_char(mat.data_publicacao, 'YYYY-MM-DD') AS data_publicacao
      FROM matriculas m
      JOIN turmas t ON t.id = m.turma_id
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      JOIN materiais mat ON mat.turma_id = t.id
      LEFT JOIN aulas au ON au.id = mat.aula_id
      WHERE m.aluno_id = $1
        AND m.status <> 'cancelado'
        AND mat.status = 'ativo'
        AND mat.visibilidade = 'visivel'
      ORDER BY mat.data_publicacao DESC, mat.titulo ASC
    `;
    const resultado = await this.db.query(query, [alunoId]);

    return resultado.rows.map((linha) => ({
      id: linha.id,
      turmaId: linha.turma_id,
      turma: linha.turma,
      curso: linha.curso,
      aulaId: linha.aula_id ?? null,
      aulaTitulo: linha.aula_titulo ?? null,
      titulo: linha.titulo,
      descricao: linha.descricao ?? null,
      tipo: linha.tipo,
      urlArquivo: linha.url_arquivo ?? null,
      tamanhoBytes: linha.tamanho_bytes ?? null,
      dataPublicacao: linha.data_publicacao,
    }));
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
    } catch (error: any) {
      await client.query("ROLLBACK");

      if (error?.code === "23505") {
        const constraint = String(error.constraint ?? "");

        if (constraint.includes("rgm")) {
          throw new BadRequestError("Ja existe um aluno cadastrado com este RGM.");
        }

        if (constraint.includes("cpf")) {
          throw new BadRequestError("Ja existe um aluno cadastrado com este CPF.");
        }

        if (constraint.includes("email")) {
          throw new BadRequestError(
            "Ja existe um aluno cadastrado com este e-mail.",
          );
        }
      }

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
        SELECT id, $1, $2, $3, $4, 'pendente_ativacao'
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

      const referenciaTreinamento = await client.query(
        `
          SELECT
            tr.id AS treinamento_id,
            turma_disponivel.id AS turma_id
          FROM treinamentos tr
          LEFT JOIN LATERAL (
            SELECT t.id
            FROM turmas t
            WHERE t.treinamento_id = tr.id
              AND t.status IN ('planejada', 'em_andamento')
              AND (
                SELECT COUNT(*)
                FROM matriculas m
                WHERE m.turma_id = t.id
                  AND m.status <> 'cancelado'
              ) < t.capacidade
            ORDER BY
              CASE t.status WHEN 'em_andamento' THEN 0 ELSE 1 END,
              t.data_inicio ASC
            LIMIT 1
          ) turma_disponivel ON TRUE
          WHERE tr.nome = $1
            AND tr.ativo = TRUE
            AND tr.status <> 'encerrado'
          LIMIT 1
        `,
        [aluno.treinamento],
      );

      const referencia = referenciaTreinamento.rows[0];

      if (!referencia) {
        throw new BadRequestError("Treinamento selecionado nao esta disponivel.");
      }

      await client.query(
        `
          INSERT INTO matriculas (
            aluno_id, treinamento_id, turma_id, status, progresso
          )
          VALUES ($1, $2, $3, 'em_andamento', 0)
        `,
        [aluno.id, referencia.treinamento_id, referencia.turma_id ?? null],
      );

      const resultado = await client.query(
        `${this.selecionarAluno} WHERE a.id = $1`,
        [aluno.id],
      );

      await client.query("COMMIT");
      return this.mapearLinhaParaAluno(resultado.rows[0]);
    } catch (error: any) {
      await client.query("ROLLBACK");

      if (error?.code === "23505") {
        const constraint = String(error.constraint ?? "");
        const detail = String(error.detail ?? "");

        if (constraint.includes("rgm") || detail.includes("(rgm)=")) {
          throw new BadRequestError(
            "Este RGM ja existe. Informe outro RGM para continuar.",
          );
        }

        if (constraint.includes("cpf") || detail.includes("(cpf)=")) {
          throw new BadRequestError("Ja existe um aluno cadastrado com este CPF.");
        }

        if (constraint.includes("email") || detail.includes("(email)=")) {
          throw new BadRequestError(
            "Ja existe um aluno cadastrado com este e-mail.",
          );
        }
      }

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

  async listarMateriaisVisiveisPorAluno(
    alunoId: string,
  ): Promise<MaterialAluno[]> {
    const query = `
      SELECT
        m.id,
        m.titulo,
        m.tipo,
        m.url_arquivo,
        m.data_publicacao,
        t.id AS turma_id,
        t.nome AS turma_nome
      FROM materiais m
      JOIN turmas t ON t.id = m.turma_id
      WHERE m.status = 'ativo'
        AND m.visivel_aluno = TRUE
        AND m.turma_id IN (
          SELECT mat.turma_id
          FROM matriculas mat
          WHERE mat.aluno_id = $1
            AND mat.turma_id IS NOT NULL
            AND mat.status <> 'cancelado'
        )
      ORDER BY m.data_publicacao DESC
    `;

    const resultado = await this.db.query(query, [alunoId]);

    return resultado.rows.map((linha) => ({
      id: linha.id,
      titulo: linha.titulo,
      tipo: linha.tipo,
      urlArquivo: linha.url_arquivo ?? null,
      turmaId: linha.turma_id,
      turmaNome: linha.turma_nome,
      criadoEm: linha.data_publicacao,
    }));
  }

  async buscarMaterialVisivelParaDownload(
    alunoId: string,
    materialId: string,
  ): Promise<MaterialAlunoDownload | null> {
    const query = `
      SELECT
        m.id,
        m.titulo,
        m.tipo,
        m.url_arquivo,
        t.id AS turma_id,
        t.nome AS turma_nome
      FROM materiais m
      JOIN turmas t ON t.id = m.turma_id
      JOIN matriculas mat ON mat.turma_id = m.turma_id
      WHERE m.id = $1
        AND mat.aluno_id = $2
        AND mat.turma_id IS NOT NULL
        AND mat.status <> 'cancelado'
        AND m.status = 'ativo'
        AND m.visivel_aluno = TRUE
      LIMIT 1
    `;

    const resultado = await this.db.query(query, [materialId, alunoId]);
    const linha = resultado.rows[0];

    if (!linha) return null;

    return {
      id: linha.id,
      titulo: linha.titulo,
      tipo: linha.tipo,
      urlArquivo: linha.url_arquivo ?? null,
      turmaId: linha.turma_id,
      turmaNome: linha.turma_nome,
    };
  }

  async buscarCertificadoEmitidoPorAlunoId(
    alunoId: string,
  ): Promise<CertificadoEmitidoDoAluno | null> {
    const resultado = await this.db.query(
      `
      SELECT
        c.id AS certificado_id,
        c.codigo,
        c.url_arquivo,
        u.nome AS nome_aluno,
        u.cpf AS cpf_aluno,
        tr.nome AS nome_curso,
        tr.carga_horaria,
        to_char(tu.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(
          COALESCE(tu.data_fim, m.data_conclusao, tu.data_inicio),
          'YYYY-MM-DD'
        ) AS data_fim,
        to_char(c.data_emissao, 'YYYY-MM-DD') AS data_emissao,
        COALESCE(emissor.nome, 'Coordenacao do Projeto') AS nome_coordenadora
      FROM certificados c
      JOIN matriculas m ON m.id = c.matricula_id
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      LEFT JOIN turmas tu ON tu.id = m.turma_id
      LEFT JOIN usuarios emissor ON emissor.id = c.emitido_por_id
      WHERE c.status = 'emitido'
        AND a.id = $1
      ORDER BY c.data_emissao DESC
      LIMIT 1
      `,
      [alunoId],
    );
    const linha = resultado.rows[0];
    if (!linha) return null;

    return {
      certificadoId: linha.certificado_id,
      codigo: linha.codigo ?? null,
      urlArquivo: linha.url_arquivo ?? null,
      nomeAluno: linha.nome_aluno,
      cpfAluno: linha.cpf_aluno,
      nomeCurso: linha.nome_curso,
      cargaHoraria: Number(linha.carga_horaria),
      dataInicio: linha.data_inicio,
      dataFim: linha.data_fim,
      dataEmissao: linha.data_emissao ?? null,
      cidade: "Joao Pessoa - PB",
      nomeCoordenadora: linha.nome_coordenadora,
      nomeProjeto: "Projeto de Extensao Administracao para Todos",
      textoDescritivo:
        "concluiu o curso de extensao, desenvolvendo conhecimentos e habilidades para atuacao em rotinas administrativas e no ambiente profissional.",
    };
  }

  async atualizarUrlArquivoCertificado(
    certificadoId: string,
    urlArquivo: string,
  ): Promise<void> {
    await this.db.query(
      `UPDATE certificados SET url_arquivo = $1 WHERE id = $2`,
      [urlArquivo, certificadoId],
    );
  }

  async deletar(id: string): Promise<void> {
    const query = `
      DELETE FROM usuarios
      WHERE id = (SELECT usuario_id FROM alunos WHERE id = $1)
    `;
    await this.db.query(query, [id]);
  }
}
