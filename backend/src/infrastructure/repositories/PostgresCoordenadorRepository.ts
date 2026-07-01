import { Pool } from "pg";
import {
  AlunoDetalheCoordenador,
  AlunoListagemCoordenador,
  AtualizarAlunoCoordenadorInput,
  AulaResumo,
  ConvidarAlunoInput,
  ConvidarInstrutorInput,
  ConviteCriado,
  CoordenadorRepository,
  CriarCursoInput,
  CriarTurmaInput,
  CursoResumo,
  DashboardResumo,
  IdentificadorPorNome,
  InstrutorListagem,
  TurmaDetalhe,
  TurmaListagem,
} from "../../domain/repositories/CoordenadorRepository";

const CODIGO_VIOLACAO_UNICIDADE = "23505";

export class PostgresCoordenadorRepository implements CoordenadorRepository {
  constructor(private db: Pool) {}

  async buscarDashboard(): Promise<DashboardResumo> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM treinamentos) AS total_cursos,
        (SELECT COUNT(*) FROM turmas) AS total_turmas,
        (SELECT COUNT(*) FROM alunos) AS total_alunos,
        (SELECT COUNT(*) FROM instrutores WHERE ativo) AS total_instrutores,
        (SELECT COUNT(*) FROM certificados WHERE status = 'pendente') AS certificados_pendentes,
        (SELECT COUNT(*) FROM usuarios WHERE status = 'pendente_ativacao') AS usuarios_pendentes,
        (
          SELECT COALESCE(ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)), 0)
          FROM frequencias f
        ) AS frequencia_media
    `;
    const resultado = await this.db.query(query);
    const linha = resultado.rows[0];

    return {
      totalCursos: Number(linha.total_cursos),
      totalTurmas: Number(linha.total_turmas),
      totalAlunos: Number(linha.total_alunos),
      totalInstrutores: Number(linha.total_instrutores),
      frequenciaMedia: Number(linha.frequencia_media),
      certificadosPendentes: Number(linha.certificados_pendentes),
      processosAbertos: 0,
      usuariosPendentes: Number(linha.usuarios_pendentes),
    };
  }

  async listarCursos(): Promise<CursoResumo[]> {
    const query = `
      SELECT
        t.id,
        t.nome,
        t.descricao,
        t.carga_horaria,
        t.status,
        COUNT(tu.id) AS quantidade_turmas
      FROM treinamentos t
      LEFT JOIN turmas tu ON tu.treinamento_id = t.id
      GROUP BY t.id, t.nome, t.descricao, t.carga_horaria, t.status
      ORDER BY t.nome ASC
    `;
    const resultado = await this.db.query(query);
    return resultado.rows.map((linha) => this.mapearCurso(linha));
  }

  async criarCurso(input: CriarCursoInput): Promise<CursoResumo> {
    const query = `
      INSERT INTO treinamentos (nome, descricao, carga_horaria, status, ativo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, descricao, carga_horaria, status
    `;

    try {
      const resultado = await this.db.query(query, [
        input.nome,
        input.descricao,
        input.cargaHoraria,
        input.status,
        input.status === "ativo",
      ]);
      return this.mapearCurso({ ...resultado.rows[0], quantidade_turmas: 0 });
    } catch (error: any) {
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error("Ja existe um curso cadastrado com este nome.");
      }
      throw error;
    }
  }

  async listarInstrutores(): Promise<InstrutorListagem[]> {
    const query = `
      SELECT
        i.id,
        u.nome,
        u.email,
        i.telefone,
        u.status,
        to_char(i.data_cadastro, 'YYYY-MM-DD') AS data_criacao,
        COUNT(tu.id) AS turmas_vinculadas
      FROM instrutores i
      JOIN usuarios u ON u.id = i.usuario_id
      LEFT JOIN turmas tu ON tu.instrutor_id = i.id
      GROUP BY i.id, u.nome, u.email, i.telefone, u.status, i.data_cadastro
      ORDER BY u.nome ASC
    `;
    const resultado = await this.db.query(query);

    return resultado.rows.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      telefone: linha.telefone ?? null,
      status: linha.status,
      turmasVinculadas: Number(linha.turmas_vinculadas),
      dataCriacao: linha.data_criacao,
    }));
  }

  async listarAlunos(): Promise<AlunoListagemCoordenador[]> {
    const query = `
      SELECT
        a.id,
        u.nome,
        u.email,
        a.telefone,
        matricula.turma,
        matricula.curso,
        COALESCE(frequencia.percentual, 0) AS frequencia,
        u.status AS status_conta,
        matricula.status AS status_matricula,
        to_char(a.data_cadastro, 'YYYY-MM-DD') AS data_criacao
      FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      LEFT JOIN LATERAL (
        SELECT
          m.id,
          m.status,
          t.nome AS turma,
          tr.nome AS curso
        FROM matriculas m
        JOIN treinamentos tr ON tr.id = m.treinamento_id
        LEFT JOIN turmas t ON t.id = m.turma_id
        WHERE m.aluno_id = a.id
        ORDER BY
          CASE WHEN m.status = 'em_andamento' THEN 0 ELSE 1 END,
          m.data_matricula DESC,
          m.id DESC
        LIMIT 1
      ) matricula ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COALESCE(
            ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)),
            0
          ) AS percentual
        FROM frequencias f
        WHERE f.matricula_id = matricula.id
      ) frequencia ON TRUE
      ORDER BY u.nome ASC
    `;
    const resultado = await this.db.query(query);

    return resultado.rows.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      telefone: linha.telefone ?? null,
      turma: linha.turma ?? null,
      curso: linha.curso ?? null,
      frequencia: Number(linha.frequencia),
      statusConta: linha.status_conta,
      statusMatricula: linha.status_matricula ?? null,
      dataCriacao: linha.data_criacao,
    }));
  }

  async buscarAlunoDetalhe(
    id: string,
  ): Promise<AlunoDetalheCoordenador | null> {
    const alunoResultado = await this.db.query(
      `
      SELECT
        a.id,
        a.usuario_id,
        u.nome,
        u.email,
        u.cpf,
        a.telefone,
        to_char(a.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
        a.rgm,
        a.curso_unipe,
        u.status AS status_conta,
        to_char(a.data_cadastro, 'YYYY-MM-DD') AS data_criacao
      FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = $1
      `,
      [id],
    );
    const linha = alunoResultado.rows[0];

    if (!linha) {
      return null;
    }

    const matriculasResultado = await this.db.query(
      `
      SELECT
        m.id,
        m.turma_id,
        t.nome AS turma,
        tr.nome AS curso,
        m.status,
        COALESCE(
          ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)),
          0
        ) AS frequencia,
        to_char(m.data_matricula, 'YYYY-MM-DD') AS data_matricula
      FROM matriculas m
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      LEFT JOIN turmas t ON t.id = m.turma_id
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      WHERE m.aluno_id = $1
      GROUP BY
        m.id,
        m.turma_id,
        t.nome,
        tr.nome,
        m.status,
        m.data_matricula
      ORDER BY m.data_matricula DESC, m.id DESC
      `,
      [id],
    );

    return {
      id: linha.id,
      usuarioId: linha.usuario_id,
      nome: linha.nome,
      email: linha.email,
      cpf: linha.cpf ?? null,
      telefone: linha.telefone ?? null,
      dataNascimento: linha.data_nascimento ?? null,
      rgm: linha.rgm ?? null,
      cursoUnipe: linha.curso_unipe ?? null,
      statusConta: linha.status_conta,
      dataCriacao: linha.data_criacao,
      matriculas: matriculasResultado.rows.map((matricula) => ({
        id: matricula.id,
        turmaId: matricula.turma_id ?? null,
        turma: matricula.turma ?? null,
        curso: matricula.curso ?? null,
        status: matricula.status,
        frequencia: Number(matricula.frequencia),
        dataMatricula: matricula.data_matricula,
      })),
    };
  }

  async atualizarAluno(
    id: string,
    input: AtualizarAlunoCoordenadorInput,
  ): Promise<AlunoDetalheCoordenador | null> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const alunoResultado = await cliente.query(
        "SELECT usuario_id FROM alunos WHERE id = $1 FOR UPDATE",
        [id],
      );
      const usuarioId = alunoResultado.rows[0]?.usuario_id;
      if (!usuarioId) {
        await cliente.query("ROLLBACK");
        return null;
      }

      await cliente.query(
        `UPDATE usuarios
         SET nome = $1, email = $2, status = $3
         WHERE id = $4`,
        [input.nome, input.email, input.statusConta, usuarioId],
      );
      await cliente.query("UPDATE alunos SET telefone = $1 WHERE id = $2", [
        input.telefone,
        id,
      ]);

      await cliente.query("COMMIT");
    } catch (error: any) {
      await cliente.query("ROLLBACK");
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error("Ja existe um usuario com este e-mail.");
      }
      throw error;
    } finally {
      cliente.release();
    }

    return await this.buscarAlunoDetalhe(id);
  }

  async buscarInstrutorAtivoPorNome(
    nome: string,
  ): Promise<IdentificadorPorNome | null> {
    const resultado = await this.db.query(
      `SELECT i.id
       FROM instrutores i
       JOIN usuarios u ON u.id = i.usuario_id
       WHERE u.nome = $1 AND i.ativo = TRUE
       LIMIT 1`,
      [nome],
    );
    return resultado.rows[0] ? { id: resultado.rows[0].id } : null;
  }

  async buscarUsuarioPorEmail(email: string): Promise<{ id: string } | null> {
    const resultado = await this.db.query(
      "SELECT id FROM usuarios WHERE lower(email) = lower($1) LIMIT 1",
      [email],
    );
    return resultado.rows[0] ? { id: resultado.rows[0].id } : null;
  }

  async buscarUsuarioPorCpf(cpf: string): Promise<{ id: string } | null> {
    const resultado = await this.db.query(
      "SELECT id FROM usuarios WHERE cpf = $1 LIMIT 1",
      [cpf],
    );
    return resultado.rows[0] ? { id: resultado.rows[0].id } : null;
  }

  async convidarInstrutor(
    input: ConvidarInstrutorInput,
  ): Promise<ConviteCriado> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const perfilResultado = await cliente.query(
        "SELECT id FROM perfis WHERE nome = 'instrutor' LIMIT 1",
      );
      const perfilId = perfilResultado.rows[0]?.id;
      if (!perfilId) {
        throw new Error("Perfil 'instrutor' nao encontrado.");
      }

      let usuarioId: string;
      try {
        const usuarioResultado = await cliente.query(
          `INSERT INTO usuarios (perfil_id, nome, email, cpf, senha, status)
           VALUES ($1, $2, $3, $4, $5, 'pendente_ativacao')
           RETURNING id`,
          [
            perfilId,
            input.nome,
            input.email,
            input.cpf,
            input.senhaTemporariaCriptografada,
          ],
        );
        usuarioId = usuarioResultado.rows[0].id;
      } catch (error: any) {
        if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
          throw new Error("Ja existe um usuario cadastrado com este e-mail ou CPF.");
        }
        throw error;
      }

      const instrutorResultado = await cliente.query(
        `INSERT INTO instrutores (usuario_id, telefone)
         VALUES ($1, $2)
         RETURNING id`,
        [usuarioId, input.telefone ?? null],
      );
      const instrutorId = instrutorResultado.rows[0].id;

      await cliente.query("COMMIT");

      return {
        usuarioId,
        instrutorId,
        nome: input.nome,
        email: input.email,
      };
    } catch (error) {
      await cliente.query("ROLLBACK");
      throw error;
    } finally {
      cliente.release();
    }
  }

  async convidarAluno(input: ConvidarAlunoInput): Promise<ConviteCriado> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");
      const referencias = await cliente.query(
        `SELECT
           (SELECT id FROM perfis WHERE nome = 'aluno' LIMIT 1) AS perfil_id,
           t.id AS treinamento_id,
           tu.id AS turma_id
         FROM treinamentos t
         JOIN turmas tu ON tu.treinamento_id = t.id
         WHERE t.nome = $1 AND tu.nome = $2
         LIMIT 1`,
        [input.treinamento, input.turma],
      );
      const referencia = referencias.rows[0];
      if (!referencia?.perfil_id || !referencia?.turma_id) {
        throw new Error("Curso ou turma nao encontrado.");
      }

      const usuario = await cliente.query(
        `INSERT INTO usuarios (perfil_id, nome, email, cpf, senha, status)
         VALUES ($1, $2, $3, $4, $5, 'pendente_ativacao')
         RETURNING id`,
        [
          referencia.perfil_id,
          input.nome,
          input.email,
          input.cpf,
          input.senhaTemporariaCriptografada,
        ],
      );
      const usuarioId = usuario.rows[0].id;
      const aluno = await cliente.query(
        `INSERT INTO alunos (
           usuario_id, telefone, data_nascimento, is_aluno_unipe, treinamento
         )
         VALUES ($1, $2, $3, FALSE, $4)
         RETURNING id`,
        [
          usuarioId,
          input.telefone ?? null,
          input.dataNascimento,
          input.treinamento,
        ],
      );
      const alunoId = aluno.rows[0].id;

      await cliente.query(
        `INSERT INTO matriculas (
           aluno_id, treinamento_id, turma_id, status, progresso
         )
         VALUES ($1, $2, $3, 'em_andamento', 0)`,
        [alunoId, referencia.treinamento_id, referencia.turma_id],
      );

      await cliente.query("COMMIT");
      return {
        usuarioId,
        instrutorId: alunoId,
        nome: input.nome,
        email: input.email,
      };
    } catch (error: any) {
      await cliente.query("ROLLBACK");
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error("Ja existe um usuario com este e-mail ou CPF.");
      }
      throw error;
    } finally {
      cliente.release();
    }
  }

  async listarTurmas(): Promise<TurmaListagem[]> {
    const query = `
      SELECT
        t.id,
        t.nome,
        tr.nome AS curso,
        ui.nome AS instrutor,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.data_fim, 'YYYY-MM-DD') AS data_termino,
        COUNT(m.id) AS alunos,
        COALESCE(ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)), 0) AS frequencia_media
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      LEFT JOIN instrutores i ON i.id = t.instrutor_id
      LEFT JOIN usuarios ui ON ui.id = i.usuario_id
      LEFT JOIN matriculas m ON m.turma_id = t.id
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      GROUP BY t.id, t.nome, tr.nome, ui.nome, t.status, t.data_inicio, t.data_fim
      ORDER BY t.data_inicio DESC
    `;
    const resultado = await this.db.query(query);
    return resultado.rows.map((linha) => this.mapearTurma(linha));
  }

  async buscarTurmaDetalhe(id: string): Promise<TurmaDetalhe | null> {
    const turmaResultado = await this.db.query(
      `
      SELECT
        t.id,
        t.nome,
        tr.nome AS curso,
        ui.nome AS instrutor,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.data_fim, 'YYYY-MM-DD') AS data_termino,
        COUNT(m.id) AS alunos,
        COALESCE(ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)), 0) AS frequencia_media
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      LEFT JOIN instrutores i ON i.id = t.instrutor_id
      LEFT JOIN usuarios ui ON ui.id = i.usuario_id
      LEFT JOIN matriculas m ON m.turma_id = t.id
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      WHERE t.id = $1
      GROUP BY t.id, t.nome, tr.nome, ui.nome, t.status, t.data_inicio, t.data_fim
      `,
      [id],
    );

    const linhaTurma = turmaResultado.rows[0];
    if (!linhaTurma) {
      return null;
    }

    const [alunosResultado, aulasResultado] = await Promise.all([
      this.db.query(
        `
        SELECT
          a.id,
          u.nome,
          u.email,
          a.telefone,
          m.status,
          COALESCE(ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)), 0) AS frequencia
        FROM matriculas m
        JOIN alunos a ON a.id = m.aluno_id
        JOIN usuarios u ON u.id = a.usuario_id
        LEFT JOIN frequencias f ON f.matricula_id = m.id
        WHERE m.turma_id = $1
        GROUP BY a.id, u.nome, u.email, a.telefone, m.status
        ORDER BY u.nome ASC
        `,
        [id],
      ),
      this.db.query(
        `
        SELECT id, numero_aula, titulo, to_char(data_aula, 'YYYY-MM-DD') AS data_aula, status
        FROM aulas
        WHERE turma_id = $1
        ORDER BY numero_aula ASC
        `,
        [id],
      ),
    ]);

    return {
      turma: this.mapearTurma(linhaTurma),
      alunos: alunosResultado.rows.map((linha) => ({
        id: linha.id,
        nome: linha.nome,
        email: linha.email,
        telefone: linha.telefone ?? null,
        frequencia: Number(linha.frequencia),
        status: linha.status,
      })),
      cronograma: aulasResultado.rows.map((linha) => this.mapearAula(linha)),
    };
  }

  async criarTurma(input: CriarTurmaInput): Promise<TurmaListagem> {
    const query = `
      INSERT INTO turmas (
        treinamento_id, instrutor_id, coordenador_id, codigo, nome,
        horario, status, capacidade, data_inicio, data_fim
      )
      VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    try {
      const resultado = await this.db.query(query, [
        input.treinamentoId,
        input.instrutorId,
        input.coordenadorId ?? null,
        input.nome,
        input.horario,
        input.status,
        input.limiteAlunos,
        input.dataInicio,
        input.dataTermino,
      ]);

      const turma = await this.buscarTurmaDetalhe(resultado.rows[0].id);
      return turma!.turma;
    } catch (error: any) {
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error("Ja existe uma turma cadastrada com este nome.");
      }
      throw error;
    }
  }

  async buscarTreinamentoPorNome(
    nome: string,
  ): Promise<IdentificadorPorNome | null> {
    const resultado = await this.db.query(
      "SELECT id FROM treinamentos WHERE nome = $1 LIMIT 1",
      [nome],
    );
    return resultado.rows[0] ? { id: resultado.rows[0].id } : null;
  }

  private mapearCurso(linha: any): CursoResumo {
    return {
      id: linha.id,
      nome: linha.nome,
      descricao: linha.descricao ?? null,
      cargaHoraria: Number(linha.carga_horaria),
      status: linha.status,
      quantidadeTurmas: Number(linha.quantidade_turmas),
    };
  }

  private mapearTurma(linha: any): TurmaListagem {
    return {
      id: linha.id,
      nome: linha.nome,
      curso: linha.curso,
      instrutor: linha.instrutor ?? null,
      alunos: Number(linha.alunos),
      dataInicio: linha.data_inicio,
      dataTermino: linha.data_termino ?? null,
      status: linha.status === "concluida" ? "encerrada" : linha.status,
      frequenciaMedia: Number(linha.frequencia_media),
    };
  }

  private mapearAula(linha: any): AulaResumo {
    return {
      id: linha.id,
      numeroAula: Number(linha.numero_aula),
      titulo: linha.titulo,
      data: linha.data_aula,
      status: linha.status,
    };
  }
}
