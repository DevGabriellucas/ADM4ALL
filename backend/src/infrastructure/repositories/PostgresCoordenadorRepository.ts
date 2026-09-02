import { Pool } from "pg";
import { calcularPeriodoLetivoAtual } from "../../application/utils/calcularPeriodoLetivo";
import {
  AlunoDetalheCoordenador,
  AlunoListagemCoordenador,
  AlunoParaReenvioAtivacao,
  AtualizarAlunoCoordenadorInput,
  AtualizarCursoInput,
  AtualizarInstrutorCoordenadorInput,
  AtualizarTurmaInput,
  AtualizarStatusMatriculaInput,
  AtualizarUsuarioInput,
  AulaResumo,
  CertificadoAlunoDetalhe,
  CertificadoListagemCoordenador,
  ConvidarAlunoInput,
  ConvidarCoordenadorInput,
  ConvidarInstrutorInput,
  ConviteCriado,
  CoordenadorRepository,
  CriarRelatorioGeradoInput,
  CriarCursoInput,
  CriarTurmaInput,
  CursoResumo,
  DashboardResumo,
  EmitirCertificadoAlunoInput,
  FiltrosFrequenciaCoordenador,
  FrequenciaCoordenador,
  IdentificadorPorNome,
  InstrutorDetalheCoordenador,
  InstrutorListagem,
  InstrutorParaReenvioAtivacao,
  MatriculaCriada,
  MatriculaEncontrada,
  MatriculaStatusAtualizado,
  PeriodoLetivoResponse,
  RelatorioCoordenador,
  RelatorioGerado,
  ReportDataRow,
  TurmaDetalhe,
  TurmaListagem,
  TurmaParaMatricula,
  UsuarioListagemCoordenador,
  VincularAlunoInput,
} from "../../domain/repositories/CoordenadorRepository";

const CODIGO_VIOLACAO_UNICIDADE = "23505";

// O periodo letivo e guardado em duas chaves. `periodo_letivo` e a canonica
// (criada pelo seed e usada pela tela de Configuracoes); `periodo_letivo_atual`
// e a legada, que o painel gravava sozinho. A ordem importa: na leitura vale a
// primeira encontrada, e na escrita as duas sao atualizadas juntas.
const PERIODO_LETIVO_CHAVES = ["periodo_letivo", "periodo_letivo_atual"];

export class PostgresCoordenadorRepository implements CoordenadorRepository {
  constructor(private db: Pool) {}

  async buscarDashboard(): Promise<DashboardResumo> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM treinamentos) AS total_cursos,
        (SELECT COUNT(*) FROM turmas) AS total_turmas,
        (SELECT COUNT(*) FROM alunos) AS total_alunos,
        (SELECT COUNT(*) FROM instrutores WHERE ativo) AS total_instrutores,
        (SELECT COUNT(*) FROM certificados WHERE status = 'pendente')
          AS certificados_pendentes,
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

  async buscarCursoPorId(id: string): Promise<CursoResumo | null> {
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
      WHERE t.id = $1
      GROUP BY t.id, t.nome, t.descricao, t.carga_horaria, t.status
    `;
    const resultado = await this.db.query(query, [id]);
    return resultado.rows[0] ? this.mapearCurso(resultado.rows[0]) : null;
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

  async atualizarCurso(id: string, input: AtualizarCursoInput): Promise<CursoResumo | null> {
    const query = `
      UPDATE treinamentos
      SET nome = $1, descricao = $2, carga_horaria = $3, status = $4, ativo = $5
      WHERE id = $6
      RETURNING id, nome, descricao, carga_horaria, status
    `;

    try {
      const resultado = await this.db.query(query, [
        input.nome,
        input.descricao,
        input.cargaHoraria,
        input.status,
        input.status === "ativo",
        id,
      ]);

      if (resultado.rows.length === 0) return null;

      const countResult = await this.db.query(
        "SELECT COUNT(id) AS quantidade_turmas FROM turmas WHERE treinamento_id = $1",
        [id],
      );

      return this.mapearCurso({
        ...resultado.rows[0],
        quantidade_turmas: Number(countResult.rows[0].quantidade_turmas),
      });
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
      LEFT JOIN turma_instrutores ti ON ti.instrutor_id = i.id
      LEFT JOIN turmas tu ON tu.id = ti.turma_id
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

  async buscarInstrutorDetalhe(
    id: string,
  ): Promise<InstrutorDetalheCoordenador | null> {
    const instrutorResultado = await this.db.query(
      `
      SELECT
        i.id,
        i.usuario_id,
        u.nome,
        u.email,
        i.telefone,
        i.area_atuacao,
        i.formacao,
        i.ativo,
        u.status,
        to_char(i.data_cadastro, 'YYYY-MM-DD') AS data_criacao,
        COUNT(tu.id) AS turmas_vinculadas
      FROM instrutores i
      JOIN usuarios u ON u.id = i.usuario_id
      LEFT JOIN turma_instrutores ti ON ti.instrutor_id = i.id
      LEFT JOIN turmas tu ON tu.id = ti.turma_id
      WHERE i.id = $1
      GROUP BY
        i.id,
        i.usuario_id,
        u.nome,
        u.email,
        i.telefone,
        i.area_atuacao,
        i.formacao,
        i.ativo,
        u.status,
        i.data_cadastro
      `,
      [id],
    );
    const linha = instrutorResultado.rows[0];

    if (!linha) {
      return null;
    }

    const turmasResultado = await this.db.query(
      `
      SELECT
        t.id,
        t.nome,
        t.codigo,
        tr.nome AS curso,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.data_fim, 'YYYY-MM-DD') AS data_termino,
        COUNT(m.id) AS alunos
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      LEFT JOIN turma_instrutores ti ON ti.turma_id = t.id
      LEFT JOIN matriculas m
        ON m.turma_id = t.id
       AND m.status <> 'cancelado'
      WHERE ti.instrutor_id = $1
      GROUP BY
        t.id,
        t.nome,
        tr.nome,
        t.status,
        t.data_inicio,
        t.data_fim
      ORDER BY t.data_inicio DESC, t.nome ASC
      `,
      [id],
    );

    return {
      id: linha.id,
      usuarioId: linha.usuario_id,
      nome: linha.nome,
      email: linha.email,
      telefone: linha.telefone ?? null,
      status: linha.status,
      turmasVinculadas: Number(linha.turmas_vinculadas),
      dataCriacao: linha.data_criacao,
      areaAtuacao: linha.area_atuacao ?? null,
      formacao: linha.formacao ?? null,
      ativo: Boolean(linha.ativo),
      turmas: turmasResultado.rows.map((turma) => ({
        id: turma.id,
        nome: turma.nome,
        curso: turma.curso,
        status: turma.status,
        dataInicio: turma.data_inicio,
        dataTermino: turma.data_termino ?? null,
        alunos: Number(turma.alunos),
      })),
    };
  }

  async atualizarInstrutor(
    id: string,
    input: AtualizarInstrutorCoordenadorInput,
  ): Promise<InstrutorDetalheCoordenador | null> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const instrutorResultado = await cliente.query(
        "SELECT usuario_id FROM instrutores WHERE id = $1 FOR UPDATE",
        [id],
      );
      const usuarioId = instrutorResultado.rows[0]?.usuario_id;
      if (!usuarioId) {
        await cliente.query("ROLLBACK");
        return null;
      }

      await cliente.query(
        `UPDATE usuarios
         SET nome = $1, email = $2
         WHERE id = $3`,
        [input.nome, input.email, usuarioId],
      );
      await cliente.query(
        `UPDATE instrutores
         SET telefone = $1,
             area_atuacao = $2,
             formacao = $3
         WHERE id = $4`,
        [input.telefone, input.areaAtuacao, input.formacao, id],
      );

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

    return await this.buscarInstrutorDetalhe(id);
  }

  async atualizarStatusInstrutor(
    id: string,
    statusConta: InstrutorDetalheCoordenador["status"],
  ): Promise<InstrutorDetalheCoordenador | null> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const instrutorResultado = await cliente.query(
        "SELECT usuario_id FROM instrutores WHERE id = $1 FOR UPDATE",
        [id],
      );
      const usuarioId = instrutorResultado.rows[0]?.usuario_id;
      if (!usuarioId) {
        await cliente.query("ROLLBACK");
        return null;
      }

      await cliente.query("UPDATE usuarios SET status = $1 WHERE id = $2", [
        statusConta,
        usuarioId,
      ]);
      await cliente.query("UPDATE instrutores SET ativo = $1 WHERE id = $2", [
        statusConta === "ativo",
        id,
      ]);

      await cliente.query("COMMIT");
    } catch (error) {
      await cliente.query("ROLLBACK");
      throw error;
    } finally {
      cliente.release();
    }

    return await this.buscarInstrutorDetalhe(id);
  }

  async buscarUsuarioPorInstrutorId(
    instrutorId: string,
  ): Promise<InstrutorParaReenvioAtivacao | null> {
    const resultado = await this.db.query(
      `SELECT
         u.id AS usuario_id,
         u.nome,
         u.email,
         u.status,
         ativacao.origem,
         ativacao.campos_pendentes
       FROM instrutores i
       JOIN usuarios u ON u.id = i.usuario_id
       LEFT JOIN LATERAL (
         SELECT origem, campos_pendentes
         FROM ativacoes_conta
         WHERE usuario_id = u.id AND tipo = 'ativacao'
         ORDER BY criado_em DESC
         LIMIT 1
       ) ativacao ON TRUE
       WHERE i.id = $1`,
      [instrutorId],
    );
    const linha = resultado.rows[0];

    return linha
      ? {
          usuarioId: linha.usuario_id,
          nome: linha.nome,
          email: linha.email,
          status: linha.status,
          origem: linha.origem ?? null,
          camposPendentes: linha.campos_pendentes ?? [],
        }
      : null;
  }

  async atualizarStatusUsuario(
    id: string,
    status: "ativo" | "inativo",
  ): Promise<UsuarioListagemCoordenador | null> {
    const resultado = await this.db.query(
      `UPDATE usuarios SET status = $1 WHERE id = $2 RETURNING id`,
      [status, id],
    );

    if (resultado.rows.length === 0) return null;

    return await this.buscarUsuarioListagemPorId(id);
  }

  async buscarUsuarioPorId(
    id: string,
  ): Promise<UsuarioListagemCoordenador | null> {
    return await this.buscarUsuarioListagemPorId(id);
  }

  // Usado antes de desativar um administrador, para nao deixar o sistema sem
  // nenhum: a interface nao tem como reverter uma conta admin desativada.
  async contarAdministradoresAtivos(): Promise<number> {
    const resultado = await this.db.query(
      `SELECT COUNT(*)::int AS total
         FROM usuarios u
         JOIN perfis p ON p.id = u.perfil_id
        WHERE p.nome = 'admin'
          AND u.status = 'ativo'`,
    );

    return Number(resultado.rows[0]?.total ?? 0);
  }

  async listarUsuarios(): Promise<UsuarioListagemCoordenador[]> {
    const query = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.cpf,
        CASE
          WHEN p.nome = 'admin' THEN 'administrador'
          ELSE p.nome
        END AS role,
        u.status,
        u.data_criacao,
        u.ultimo_login
      FROM usuarios u
      JOIN perfis p ON p.id = u.perfil_id
      ORDER BY u.nome ASC
    `;
    const resultado = await this.db.query(query);

    return resultado.rows.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      cpf: linha.cpf,
      role: linha.role,
      status: linha.status,
      dataCriacao: linha.data_criacao.toISOString(),
      ultimoAcesso: linha.ultimo_login
        ? linha.ultimo_login.toISOString()
        : null,
    }));
  }

  async atualizarUsuario(
    id: string,
    input: AtualizarUsuarioInput,
  ): Promise<UsuarioListagemCoordenador | null> {
    const query = `
      UPDATE usuarios
      SET nome = $1, email = $2, cpf = $3
      WHERE id = $4
      RETURNING id
    `;

    try {
      const resultado = await this.db.query(query, [
        input.nome,
        input.email,
        input.cpf,
        id,
      ]);

      if (resultado.rows.length === 0) return null;

      const usuario = await this.buscarUsuarioListagemPorId(id);
      return usuario;
    } catch (error: any) {
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        if (error?.constraint === "usuarios_cpf_key") {
          throw new Error("Ja existe um usuario com este CPF.");
        }
        throw new Error("Ja existe um usuario com este e-mail.");
      }
      throw error;
    }
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

  async buscarUsuarioPorAlunoId(
    alunoId: string,
  ): Promise<AlunoParaReenvioAtivacao | null> {
    const resultado = await this.db.query(
      `SELECT
         u.id AS usuario_id,
         u.nome,
         u.email,
         u.status,
         ativacao.origem,
         ativacao.campos_pendentes
       FROM alunos a
       JOIN usuarios u ON u.id = a.usuario_id
       LEFT JOIN LATERAL (
         SELECT origem, campos_pendentes
         FROM ativacoes_conta
         WHERE usuario_id = u.id AND tipo = 'ativacao'
         ORDER BY criado_em DESC
         LIMIT 1
       ) ativacao ON TRUE
       WHERE a.id = $1`,
      [alunoId],
    );
    const linha = resultado.rows[0];

    return linha
      ? {
          usuarioId: linha.usuario_id,
          nome: linha.nome,
          email: linha.email,
          status: linha.status,
          origem: linha.origem ?? null,
          camposPendentes: linha.campos_pendentes ?? [],
        }
      : null;
  }

  async invalidarAtivacoesPendentes(usuarioId: string): Promise<void> {
    await this.db.query(
      `UPDATE ativacoes_conta
       SET usado_em = now()
       WHERE usuario_id = $1
         AND tipo = 'ativacao'
         AND usado_em IS NULL`,
      [usuarioId],
    );
  }

  async buscarTurmaPorId(id: string): Promise<TurmaParaMatricula | null> {
    const resultado = await this.db.query(
      `SELECT id, treinamento_id, status, capacidade
       FROM turmas
       WHERE id = $1`,
      [id],
    );
    const linha = resultado.rows[0];

    return linha
      ? {
          id: linha.id,
          treinamentoId: linha.treinamento_id,
          status: linha.status,
          capacidade:
            linha.capacidade === null ? null : Number(linha.capacidade),
        }
      : null;
  }

  async verificarAlunoExiste(alunoId: string): Promise<boolean> {
    const resultado = await this.db.query(
      "SELECT 1 FROM alunos WHERE id = $1",
      [alunoId],
    );
    return (resultado.rowCount ?? 0) > 0;
  }

  async contarMatriculasAtivas(turmaId: string): Promise<number> {
    const resultado = await this.db.query(
      `SELECT COUNT(*) AS total
       FROM matriculas
       WHERE turma_id = $1 AND status = 'em_andamento'`,
      [turmaId],
    );
    return Number(resultado.rows[0]?.total ?? 0);
  }

  async buscarMatriculaAlunoTurma(
    alunoId: string,
    turmaId: string,
  ): Promise<MatriculaEncontrada | null> {
    const resultado = await this.db.query(
      `SELECT id, turma_id, status
       FROM matriculas
       WHERE aluno_id = $1 AND turma_id = $2
       LIMIT 1`,
      [alunoId, turmaId],
    );
    const linha = resultado.rows[0];

    return linha
      ? { id: linha.id, turmaId: linha.turma_id, status: linha.status }
      : null;
  }

  async buscarMatriculaAtivaNoTreinamento(
    alunoId: string,
    treinamentoId: string,
  ): Promise<MatriculaEncontrada | null> {
    const resultado = await this.db.query(
      `SELECT id, turma_id, status
       FROM matriculas
       WHERE aluno_id = $1
         AND treinamento_id = $2
         AND status = 'em_andamento'
       LIMIT 1`,
      [alunoId, treinamentoId],
    );
    const linha = resultado.rows[0];

    return linha
      ? { id: linha.id, turmaId: linha.turma_id, status: linha.status }
      : null;
  }

  async vincularAluno(input: VincularAlunoInput): Promise<MatriculaCriada> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");
      const existente = await cliente.query(
        `SELECT id, status
         FROM matriculas
         WHERE aluno_id = $1 AND turma_id = $2
         FOR UPDATE`,
        [input.alunoId, input.turmaId],
      );

      let resultado;
      if (existente.rows[0]) {
        if (existente.rows[0].status !== "cancelado") {
          throw new Error("O aluno ja possui matricula nesta turma.");
        }

        resultado = await cliente.query(
          `UPDATE matriculas
           SET
             status = 'em_andamento',
             progresso = 0,
             data_matricula = CURRENT_DATE,
             data_conclusao = NULL
           WHERE id = $1
           RETURNING
             id,
             aluno_id,
             turma_id,
             treinamento_id,
             status,
             to_char(data_matricula, 'YYYY-MM-DD') AS data_matricula`,
          [existente.rows[0].id],
        );
      } else {
        resultado = await cliente.query(
          `INSERT INTO matriculas (
             aluno_id,
             turma_id,
             treinamento_id,
             status,
             progresso,
             data_matricula
           )
           VALUES ($1, $2, $3, 'em_andamento', 0, CURRENT_DATE)
           RETURNING
             id,
             aluno_id,
             turma_id,
             treinamento_id,
             status,
             to_char(data_matricula, 'YYYY-MM-DD') AS data_matricula`,
          [input.alunoId, input.turmaId, input.treinamentoId],
        );
      }

      await cliente.query("COMMIT");
      const linha = resultado.rows[0];
      return {
        id: linha.id,
        alunoId: linha.aluno_id,
        turmaId: linha.turma_id,
        treinamentoId: linha.treinamento_id,
        status: linha.status,
        dataMatricula: linha.data_matricula,
      };
    } catch (error: any) {
      await cliente.query("ROLLBACK");
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error(
          "O aluno ja possui matricula nesta turma ou neste curso.",
        );
      }
      throw error;
    } finally {
      cliente.release();
    }
  }

  async removerMatricula(
    turmaId: string,
    matriculaId: string,
  ): Promise<boolean> {
    const resultado = await this.db.query(
      `UPDATE matriculas
       SET status = 'cancelado'
       WHERE id = $1 AND turma_id = $2
       RETURNING id`,
      [matriculaId, turmaId],
    );
    return (resultado.rowCount ?? 0) > 0;
  }

  async buscarMatriculaPorId(
    id: string,
  ): Promise<{ id: string; status: string } | null> {
    const resultado = await this.db.query(
      "SELECT id, status FROM matriculas WHERE id = $1",
      [id],
    );
    const linha = resultado.rows[0];
    return linha ? { id: linha.id, status: linha.status } : null;
  }

  async atualizarStatusMatricula(
    id: string,
    input: AtualizarStatusMatriculaInput,
  ): Promise<MatriculaStatusAtualizado | null> {
    const resultado = await this.db.query(
      `UPDATE matriculas
       SET
         status = $1::varchar,
         data_conclusao = CASE
           WHEN $1::varchar IN ('aprovado', 'reprovado_falta') THEN CURRENT_DATE
           WHEN $1::varchar = 'em_andamento' THEN NULL
         END
       WHERE id = $2
       RETURNING
         id,
         status,
         to_char(data_conclusao, 'YYYY-MM-DD') AS data_conclusao`,
      [input.status, id],
    );
    const linha = resultado.rows[0];

    return linha
      ? {
          id: linha.id,
          status: linha.status,
          dataConclusao: linha.data_conclusao ?? null,
        }
      : null;
  }

  async listarFrequencias(
    filtros: FiltrosFrequenciaCoordenador,
  ): Promise<FrequenciaCoordenador[]> {
    const resultado = await this.db.query(
      `
      WITH resumo AS (
        SELECT
          u.nome AS aluno,
          t.nome AS turma,
          m.status AS status_matricula,
          COUNT(f.id) FILTER (WHERE f.presente) AS presencas,
          COUNT(f.id) FILTER (WHERE NOT f.presente) AS faltas,
          COUNT(f.id) AS registros,
          COALESCE(
            ROUND(
              100.0 * COUNT(f.id) FILTER (WHERE f.presente)
              / NULLIF(COUNT(f.id), 0)
            ),
            0
          ) AS frequencia
        FROM matriculas m
        JOIN alunos a ON a.id = m.aluno_id
        JOIN usuarios u ON u.id = a.usuario_id
        JOIN treinamentos tr ON tr.id = m.treinamento_id
        JOIN turmas t ON t.id = m.turma_id
        LEFT JOIN frequencias f ON f.matricula_id = m.id
        WHERE m.status IN ('em_andamento', 'aprovado', 'reprovado_falta')
          AND ($1::text IS NULL OR tr.nome = $1)
          AND ($2::text IS NULL OR t.nome = $2)
          AND ($3::text IS NULL OR u.nome = $3)
          AND (
            $4::text IS NULL
            OR (
              EXTRACT(YEAR FROM t.data_inicio)::text
              || '.'
              || CASE
                WHEN EXTRACT(MONTH FROM t.data_inicio) <= 6 THEN '1'
                ELSE '2'
              END
            ) = $4
          )
        GROUP BY m.id, u.nome, t.nome, m.status
      )
      SELECT
        aluno,
        turma,
        presencas,
        faltas,
        frequencia,
        CASE
          WHEN status_matricula = 'reprovado_falta' THEN 'reprovado_falta'
          -- Sem nenhuma chamada registrada a frequencia e 0 por ausencia de
          -- dado, nao por falta. Antes esses alunos (inclusive quem nunca
          -- ativou a conta) caiam direto em 'risco' e enchiam o painel da
          -- coordenacao de alerta antes da primeira aula.
          WHEN registros = 0 THEN 'sem_registro'
          WHEN frequencia >= 80 THEN 'regular'
          WHEN frequencia >= 75 THEN 'atencao'
          ELSE 'risco'
        END AS situacao
      FROM resumo
      ORDER BY aluno ASC, turma ASC
      `,
      [
        filtros.curso ?? null,
        filtros.turma ?? null,
        filtros.aluno ?? null,
        filtros.periodo ?? null,
      ],
    );

    return resultado.rows.map((linha) => ({
      aluno: linha.aluno,
      turma: linha.turma,
      presencas: Number(linha.presencas),
      faltas: Number(linha.faltas),
      frequencia: Number(linha.frequencia),
      situacao: linha.situacao,
    }));
  }

  async listarRelatorios(): Promise<RelatorioCoordenador[]> {
    const [
      frequenciaTurma,
      reprovadosFalta,
      elegiveisCertificado,
      certificadosEmitidos,
      matriculasCurso,
      turmasAndamento,
    ] = await Promise.all([
      this.relatorioFrequenciaTurma(),
      this.relatorioReprovadosFalta(),
      this.relatorioElegiveisCertificado(),
      this.relatorioCertificadosEmitidos(),
      this.relatorioMatriculasCurso(),
      this.relatorioTurmasAndamento(),
    ]);

    return [
      frequenciaTurma,
      reprovadosFalta,
      elegiveisCertificado,
      certificadosEmitidos,
      matriculasCurso,
      turmasAndamento,
    ];
  }

  async criarRelatorioGerado(
    input: CriarRelatorioGeradoInput,
  ): Promise<RelatorioGerado> {
    const resultado = await this.db.query(
      `INSERT INTO relatorios_gerados (
         tipo, titulo, arquivo_csv, arquivo_pdf, filtros_json, gerado_por_id
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         tipo,
         titulo,
         arquivo_csv,
         arquivo_pdf,
         filtros_json,
         gerado_por_id,
         criado_em`,
      [
        input.tipo,
        input.titulo,
        input.arquivoCsv,
        input.arquivoPdf,
        JSON.stringify(input.filtros),
        input.geradoPorId,
      ],
    );

    return this.mapearRelatorioGerado(resultado.rows[0]);
  }

  async listarRelatoriosGerados(limite?: number): Promise<RelatorioGerado[]> {
    const limiteSeguro =
      typeof limite === "number" && Number.isFinite(limite) && limite > 0
        ? Math.min(Math.floor(limite), 50)
        : null;

    const resultado = await this.db.query(
      `SELECT
         id,
         tipo,
         titulo,
         arquivo_csv,
         arquivo_pdf,
         filtros_json,
         gerado_por_id,
         criado_em
       FROM relatorios_gerados
       ORDER BY criado_em DESC
       ${limiteSeguro ? "LIMIT $1" : ""}`,
      limiteSeguro ? [limiteSeguro] : [],
    );

    return resultado.rows.map((linha) => this.mapearRelatorioGerado(linha));
  }

  async buscarRelatorioGeradoPorId(
    id: string,
  ): Promise<RelatorioGerado | null> {
    const resultado = await this.db.query(
      `SELECT
         id,
         tipo,
         titulo,
         arquivo_csv,
         arquivo_pdf,
         filtros_json,
         gerado_por_id,
         criado_em
       FROM relatorios_gerados
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    return resultado.rows[0]
      ? this.mapearRelatorioGerado(resultado.rows[0])
      : null;
  }

  async removerRelatorioGerado(id: string): Promise<boolean> {
    const resultado = await this.db.query(
      "DELETE FROM relatorios_gerados WHERE id = $1",
      [id],
    );
    return (resultado.rowCount ?? 0) > 0;
  }

  private async relatorioFrequenciaTurma(): Promise<RelatorioCoordenador> {
    const resultado = await this.db.query(`
      SELECT
        tu.id AS turma_id,
        tu.nome AS turma,
        tu.codigo AS turma_codigo,
        tr.nome AS curso,
        to_char(tu.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        COALESCE(
          ROUND(
            100.0 * COUNT(f.id) FILTER (WHERE f.presente)
            / NULLIF(COUNT(f.id), 0)
          ),
          0
        ) AS frequencia,
        COUNT(f.id) FILTER (WHERE f.presente) AS presencas,
        COUNT(f.id) AS registros
      FROM turmas tu
      JOIN treinamentos tr ON tr.id = tu.treinamento_id
      LEFT JOIN matriculas m
        ON m.turma_id = tu.id AND m.status IN ('em_andamento', 'aprovado', 'reprovado_falta')
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      GROUP BY tu.id, tu.nome, tr.nome, tu.data_inicio
      ORDER BY tu.data_inicio ASC, tu.nome ASC
    `);

    const rows: ReportDataRow[] = resultado.rows.map((linha) => {
      const frequenciaNumero = Number(linha.frequencia);
      const registros = Number(linha.registros);
      const turma = linha.turma ?? "";
      const curso = linha.curso ?? "";
      return {
        id: `freq-turma-${linha.turma_id}`,
        data: linha.data_inicio ?? "",
        curso,
        turma,
        chartLabel: turma,
        chartValue: frequenciaNumero,
        metricNumerator: Number(linha.presencas),
        metricDenominator: registros,
        values: {
          turma,
          codigo: linha.turma_codigo ?? "",
          curso,
          // Turma sem chamada nao tem 0% de presenca — nao tem dado. Exibir
          // "0%" fazia a tabela parecer contradizer a metrica do topo, que e
          // calculada so sobre as chamadas efetivamente registradas.
          frequencia: registros > 0 ? `${frequenciaNumero}%` : "Sem chamada",
        },
      };
    });

    const totalPresencas = rows.reduce(
      (total, row) => total + (row.metricNumerator ?? 0),
      0,
    );
    const totalRegistros = rows.reduce(
      (total, row) => total + (row.metricDenominator ?? 0),
      0,
    );

    return {
      type: "frequencia_turma",
      title: "Frequência por turma",
      description:
        "Frequência por turma. A métrica geral considera todas as presenças sobre as chamadas registradas; turmas sem chamada não entram no cálculo.",
      metricLabel: "Frequência média",
      metricSuffix: "%",
      metricValue:
        totalRegistros > 0
          ? Math.round((totalPresencas / totalRegistros) * 100)
          : 0,
      aggregation: "average",
      columns: [
        { key: "turma", label: "Turma" },
        { key: "codigo", label: "Código" },
        { key: "curso", label: "Curso" },
        { key: "frequencia", label: "Frequência" },
      ],
      rows,
    };
  }

  private async relatorioReprovadosFalta(): Promise<RelatorioCoordenador> {
    const resultado = await this.db.query(`
      SELECT
        m.id AS matricula_id,
        u.nome AS aluno,
        tu.nome AS turma,
        tr.nome AS curso,
        to_char(
          COALESCE(m.data_conclusao, tu.data_inicio),
          'YYYY-MM-DD'
        ) AS data_ref,
        COALESCE(
          ROUND(
            100.0 * COUNT(f.id) FILTER (WHERE f.presente)
            / NULLIF(COUNT(f.id), 0)
          ),
          0
        ) AS frequencia
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN turmas tu ON tu.id = m.turma_id
      JOIN treinamentos tr ON tr.id = tu.treinamento_id
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      WHERE m.status IN ('em_andamento', 'aprovado', 'reprovado_falta')
      GROUP BY
        m.id, u.nome, tu.nome, tr.nome,
        m.data_conclusao, tu.data_inicio, m.status
      HAVING
        m.status = 'reprovado_falta'
        OR COUNT(f.id) FILTER (WHERE NOT f.presente) >= 3
      ORDER BY aluno ASC, turma ASC
    `);

    const rows: ReportDataRow[] = resultado.rows.map((linha) => {
      const frequenciaNumero = Number(linha.frequencia);
      const aluno = linha.aluno ?? "";
      const turma = linha.turma ?? "";
      const curso = linha.curso ?? "";
      return {
        id: `rep-${linha.matricula_id}`,
        data: linha.data_ref ?? "",
        curso,
        turma,
        chartLabel: aluno,
        chartValue: 1,
        values: {
          aluno,
          turma,
          frequencia: `${frequenciaNumero}%`,
        },
      };
    });

    return {
      type: "reprovados_falta",
      title: "Alunos reprovados por falta",
      description:
        "Alunos com reprovação consolidada ou com 3 ou mais faltas.",
      metricLabel: "Alunos reprovados",
      aggregation: "count",
      columns: [
        { key: "aluno", label: "Aluno" },
        { key: "turma", label: "Turma" },
        { key: "frequencia", label: "Frequência" },
      ],
      rows,
    };
  }

  private async relatorioElegiveisCertificado(): Promise<RelatorioCoordenador> {
    const resultado = await this.db.query(`
      SELECT
        m.id AS matricula_id,
        u.nome AS aluno,
        tr.nome AS curso,
        tu.nome AS turma,
        to_char(
          COALESCE(m.data_conclusao, tu.data_fim, tu.data_inicio),
          'YYYY-MM-DD'
        ) AS data_ref,
        COALESCE(
          ROUND(
            100.0 * COUNT(f.id) FILTER (WHERE f.presente)
            / NULLIF(COUNT(f.id), 0)
          ),
          0
        ) AS frequencia
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      JOIN turmas tu ON tu.id = m.turma_id
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      LEFT JOIN certificados c ON c.matricula_id = m.id
      WHERE m.status = 'aprovado'
        AND (tu.status = 'concluida' OR tu.status = 'encerrada')
        AND u.status = 'ativo'
        AND (c.status IS NULL OR c.status NOT IN ('pendente', 'emitido'))
      GROUP BY
        m.id, u.nome, tr.nome, tu.nome,
        m.data_conclusao, tu.data_fim, tu.data_inicio
      HAVING COUNT(f.id) FILTER (WHERE NOT f.presente) < 3
      ORDER BY aluno ASC, turma ASC
    `);

    const rows: ReportDataRow[] = resultado.rows.map((linha) => {
      const frequenciaNumero = Number(linha.frequencia);
      const aluno = linha.aluno ?? "";
      const curso = linha.curso ?? "";
      const turma = linha.turma ?? "";
      return {
        id: `eleg-${linha.matricula_id}`,
        data: linha.data_ref ?? "",
        curso,
        turma,
        chartLabel: aluno,
        chartValue: 1,
        values: {
          aluno,
          curso,
          frequencia: `${frequenciaNumero}%`,
          status: "Apto à emissão",
        },
      };
    });

    return {
      type: "elegiveis_certificado",
      title: "Alunos elegíveis para certificado",
      description: "Alunos que atendem aos critérios de elegibilidade.",
      metricLabel: "Alunos elegíveis",
      aggregation: "count",
      columns: [
        { key: "aluno", label: "Aluno" },
        { key: "curso", label: "Curso" },
        { key: "frequencia", label: "Frequência" },
        { key: "status", label: "Status" },
      ],
      rows,
    };
  }

  private async relatorioCertificadosEmitidos(): Promise<RelatorioCoordenador> {
    const resultado = await this.db.query(`
      SELECT
        c.id AS certificado_id,
        c.codigo,
        to_char(c.data_emissao, 'YYYY-MM-DD') AS data_emissao,
        u.nome AS aluno,
        tr.nome AS curso,
        tu.nome AS turma
      FROM certificados c
      JOIN matriculas m ON m.id = c.matricula_id
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      LEFT JOIN turmas tu ON tu.id = m.turma_id
      WHERE c.status = 'emitido'
      ORDER BY c.data_emissao DESC, aluno ASC
    `);

    const rows: ReportDataRow[] = resultado.rows.map((linha) => {
      const aluno = linha.aluno ?? "";
      const curso = linha.curso ?? "";
      const turma = linha.turma ?? "";
      const codigo = linha.codigo ?? "";
      return {
        id: `cert-${linha.certificado_id}`,
        data: linha.data_emissao ?? "",
        curso,
        turma,
        chartLabel: aluno,
        chartValue: 1,
        values: {
          aluno,
          curso,
          turma,
          certificado: codigo,
        },
      };
    });

    return {
      type: "certificados_emitidos",
      title: "Certificados emitidos",
      description: "Certificados concluídos e disponíveis para os alunos.",
      metricLabel: "Certificados emitidos",
      aggregation: "count",
      columns: [
        { key: "aluno", label: "Aluno" },
        { key: "curso", label: "Curso" },
        { key: "turma", label: "Turma" },
        { key: "certificado", label: "Certificado" },
      ],
      rows,
    };
  }

  private async relatorioMatriculasCurso(): Promise<RelatorioCoordenador> {
    const resultado = await this.db.query(`
      SELECT
        tr.id AS treinamento_id,
        tr.nome AS curso,
        COUNT(DISTINCT tu.id) AS turmas,
        COUNT(m.id) AS matriculas,
        MIN(to_char(tu.data_inicio, 'YYYY-MM-DD')) AS data_inicio
      FROM treinamentos tr
      LEFT JOIN turmas tu ON tu.treinamento_id = tr.id
      LEFT JOIN matriculas m
        ON m.turma_id = tu.id
        AND m.status IN ('em_andamento', 'aprovado', 'reprovado_falta')
      GROUP BY tr.id, tr.nome
      ORDER BY tr.nome ASC
    `);

    const rows: ReportDataRow[] = resultado.rows.map((linha) => {
      const curso = linha.curso ?? "";
      const turmas = Number(linha.turmas);
      const matriculas = Number(linha.matriculas);
      return {
        id: `mat-curso-${linha.treinamento_id}`,
        data: linha.data_inicio ?? "",
        curso,
        turma: "",
        chartLabel: curso,
        chartValue: matriculas,
        values: {
          curso,
          turmas,
          matriculas,
        },
      };
    });

    return {
      type: "matriculas_curso",
      title: "Matrículas por curso",
      description: "Distribuição de alunos matriculados entre os cursos.",
      metricLabel: "Total de matrículas",
      aggregation: "sum",
      columns: [
        { key: "curso", label: "Curso" },
        { key: "turmas", label: "Turmas" },
        { key: "matriculas", label: "Matrículas" },
      ],
      rows,
    };
  }

  private async relatorioTurmasAndamento(): Promise<RelatorioCoordenador> {
    const resultado = await this.db.query(`
      SELECT
        tu.id AS turma_id,
        tu.nome AS turma,
        tr.nome AS curso,
        to_char(tu.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        COALESCE(usuario_instrutor.nome, '-') AS instrutor,
        COUNT(m.id) FILTER (
          WHERE m.status IN ('em_andamento', 'aprovado', 'reprovado_falta')
        ) AS alunos_ativos
      FROM turmas tu
      JOIN treinamentos tr ON tr.id = tu.treinamento_id
      LEFT JOIN turma_instrutores ti ON ti.turma_id = tu.id
      LEFT JOIN instrutores i ON i.id = ti.instrutor_id
      LEFT JOIN usuarios usuario_instrutor ON usuario_instrutor.id = i.usuario_id
      LEFT JOIN matriculas m ON m.turma_id = tu.id
      WHERE tu.status = 'em_andamento'
      GROUP BY
        tu.id, tu.nome, tr.nome, tu.data_inicio,
        usuario_instrutor.nome
      ORDER BY tu.data_inicio ASC, tu.nome ASC
    `);

    const rows: ReportDataRow[] = resultado.rows.map((linha) => {
      const turma = linha.turma ?? "";
      const curso = linha.curso ?? "";
      const instrutor = linha.instrutor ?? "-";
      const alunos = Number(linha.alunos_ativos);
      return {
        id: `turma-${linha.turma_id}`,
        data: linha.data_inicio ?? "",
        curso,
        turma,
        chartLabel: turma,
        chartValue: alunos,
        values: {
          turma,
          curso,
          instrutor,
          alunos,
        },
      };
    });

    return {
      type: "turmas_andamento",
      title: "Turmas em andamento",
      description: "Turmas ativas no período selecionado.",
      metricLabel: "Turmas em andamento",
      aggregation: "count",
      columns: [
        { key: "turma", label: "Turma" },
        { key: "curso", label: "Curso" },
        { key: "instrutor", label: "Instrutor" },
        { key: "alunos", label: "Alunos" },
      ],
      rows,
    };
  }

  async listarCertificados(): Promise<CertificadoListagemCoordenador[]> {
    const { maximoFaltas, apenasEncerrada } =
      await this.obterConfigCertificado();

    const maxFaltas = maximoFaltas;
    const turmaFinalizada =
      "(tu.status = 'concluida' OR tu.status = 'encerrada')";
    const turmaStatusElegivel = apenasEncerrada
      ? `AND ${turmaFinalizada}`
      : "";
    const turmaStatusMotivo = apenasEncerrada
      ? `WHEN tu.status <> 'concluida' AND tu.status <> 'encerrada' THEN 'Turma ainda nao finalizada.'`
      : "";

    const resultado = await this.db.query(`
      SELECT
        m.id AS referencia_id,
        c.id AS certificado_id,
        'aluno'::text AS tipo,
        u.nome,
        tr.nome AS curso,
        tu.nome AS turma,
        COALESCE(
          ROUND(
            100.0 * COUNT(f.id) FILTER (WHERE f.presente)
            / NULLIF(COUNT(f.id), 0)
          ),
          0
        ) AS frequencia,
        (
          m.status = 'aprovado'
          ${turmaStatusElegivel}
          AND u.status = 'ativo'
          AND COUNT(f.id) FILTER (WHERE NOT f.presente) <= ${maxFaltas}
          AND c.status IS NULL
        ) AS elegivel,
        CASE
          WHEN m.status <> 'aprovado' THEN 'Matrícula ainda não aprovada.'
          ${turmaStatusMotivo}
          WHEN u.status <> 'ativo' THEN 'Conta do aluno não está ativa.'
          WHEN COUNT(f.id) FILTER (WHERE NOT f.presente) > ${maxFaltas}
            THEN 'Aluno excede o máximo permitido de ${maxFaltas} falta(s).'
          WHEN c.status IS NOT NULL
            THEN 'A matrícula já possui certificado pendente ou emitido.'
          ELSE NULL
        END AS motivo_inelegibilidade,
        c.status,
        c.codigo,
        to_char(c.data_emissao, 'YYYY-MM-DD') AS data_emissao,
        to_char(tu.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(
          COALESCE(tu.data_fim, m.data_conclusao, tu.data_inicio),
          'YYYY-MM-DD'
        ) AS data_fim,
        tr.carga_horaria
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      JOIN turmas tu ON tu.id = m.turma_id
      LEFT JOIN frequencias f ON f.matricula_id = m.id
      LEFT JOIN certificados c ON c.matricula_id = m.id
      WHERE m.status <> 'cancelado'
      GROUP BY
        m.id,
        c.id,
        u.nome,
        tr.nome,
        tu.nome,
        tu.data_inicio,
        tu.data_fim,
        tr.carga_horaria,
        tu.status,
        u.status
      ORDER BY u.nome ASC
    `);

    return resultado.rows.map((linha) => ({
      referenciaId: linha.referencia_id,
      certificadoId: linha.certificado_id ?? null,
      tipo: "aluno",
      nome: linha.nome,
      curso: linha.curso,
      turma: linha.turma ?? null,
      frequencia: Number(linha.frequencia),
      elegivel: linha.elegivel,
      motivoInelegibilidade: linha.motivo_inelegibilidade ?? null,
      status: linha.status ?? null,
      codigo: linha.codigo ?? null,
      dataEmissao: linha.data_emissao ?? null,
      dataInicio: linha.data_inicio ?? null,
      dataFim: linha.data_fim ?? null,
      cargaHoraria:
        linha.carga_horaria === null ? null : Number(linha.carga_horaria),
    }));
  }

  private async obterConfigCertificado(): Promise<{
    maximoFaltas: number;
    apenasEncerrada: boolean;
  }> {
    const faltaRes = await this.db.query(
      `SELECT valor FROM configuracoes_sistema WHERE chave = 'certificado_maximo_faltas'`,
    );
    const maximoFaltas = parseInt(faltaRes.rows[0]?.valor ?? "2", 10);

    const encerradaRes = await this.db.query(
      `SELECT valor FROM configuracoes_sistema WHERE chave = 'certificado_apenas_encerrada'`,
    );
    const apenasEncerrada = encerradaRes.rows[0]?.valor === "true";

    return { maximoFaltas, apenasEncerrada };
  }

  async buscarCertificadoAluno(
    matriculaId: string,
  ): Promise<CertificadoAlunoDetalhe | null> {
    const resultado = await this.db.query(
      `
      SELECT
        m.id AS referencia_id,
        c.id AS certificado_id,
        c.status,
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
        COALESCE(emissor.nome, 'Coordenação do Projeto') AS nome_coordenadora,
        c.codigo,
        c.url_arquivo,
        m.status AS status_matricula,
        tu.status AS status_turma,
        u.status AS status_usuario,
        (
          SELECT COUNT(*)
          FROM frequencias f
          WHERE f.matricula_id = m.id AND NOT f.presente
        ) AS faltas
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      JOIN turmas tu ON tu.id = m.turma_id
      LEFT JOIN certificados c ON c.matricula_id = m.id
      LEFT JOIN usuarios emissor ON emissor.id = c.emitido_por_id
      WHERE m.id = $1
      LIMIT 1
      `,
      [matriculaId],
    );
    const linha = resultado.rows[0];
    if (!linha) return null;

    return {
      tipo: "aluno",
      certificadoId: linha.certificado_id ?? null,
      referenciaId: linha.referencia_id,
      status: linha.status ?? null,
      urlArquivo: linha.url_arquivo ?? null,
      nomeAluno: linha.nome_aluno,
      cpfAluno: linha.cpf_aluno,
      nomeCurso: linha.nome_curso,
      cargaHoraria: Number(linha.carga_horaria),
      dataInicio: linha.data_inicio,
      dataFim: linha.data_fim,
      dataEmissao: linha.data_emissao ?? null,
      cidade: "João Pessoa",
      nomeCoordenadora: linha.nome_coordenadora,
      nomeProjeto: "Projeto de Extensão Administração para Todos",
      textoDescritivo:
        "concluiu o curso de extensão, desenvolvendo conhecimentos e habilidades para atuação em rotinas administrativas e no ambiente profissional.",
      codigo: linha.codigo ?? null,
      statusMatricula: linha.status_matricula,
      statusTurma: linha.status_turma,
      statusUsuario: linha.status_usuario,
      faltas: Number(linha.faltas),
    };
  }

  async emitirCertificadoAluno(
    input: EmitirCertificadoAlunoInput,
  ): Promise<CertificadoAlunoDetalhe | null> {
    await this.db.query(
      `INSERT INTO certificados
         (matricula_id, codigo, status, data_emissao, emitido_por_id, observacao)
       VALUES ($1, $2, 'emitido', CURRENT_DATE, $3, $4)
       ON CONFLICT (matricula_id) DO UPDATE SET
         status = 'emitido',
         codigo = $2,
         data_emissao = CURRENT_DATE,
         emitido_por_id = $3,
         observacao = $4,
         url_arquivo = NULL`,
      [
        input.matriculaId,
        input.codigo,
        input.emitidoPorId,
        "Certificado emitido pelo painel do coordenador.",
      ],
    );

    return await this.buscarCertificadoAluno(input.matriculaId);
  }

  async cancelarCertificado(certificadoId: string): Promise<boolean> {
    const resultado = await this.db.query(
      `UPDATE certificados
       SET status = 'cancelado'
       WHERE id = $1 AND status <> 'cancelado'
       RETURNING id`,
      [certificadoId],
    );
    return (resultado.rowCount ?? 0) > 0;
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

  async buscarInstrutorAtivoPorNome(
    nome: string,
  ): Promise<IdentificadorPorNome | null> {
    const resultado = await this.db.query(
      `SELECT i.id
       FROM instrutores i
       JOIN usuarios u ON u.id = i.usuario_id
       WHERE u.nome = $1 AND i.ativo = TRUE AND u.status = 'ativo'
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

  private async buscarUsuarioListagemPorId(
    id: string,
  ): Promise<UsuarioListagemCoordenador | null> {
    const query = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.cpf,
        CASE
          WHEN p.nome = 'admin' THEN 'administrador'
          ELSE p.nome
        END AS role,
        u.status,
        u.data_criacao,
        u.ultimo_login
      FROM usuarios u
      JOIN perfis p ON p.id = u.perfil_id
      WHERE u.id = $1
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [id]);
    const linha = resultado.rows[0];

    return linha
      ? {
          id: linha.id,
          nome: linha.nome,
          email: linha.email,
          cpf: linha.cpf,
          role: linha.role,
          status: linha.status,
          dataCriacao: linha.data_criacao.toISOString(),
          ultimoAcesso: linha.ultimo_login
            ? linha.ultimo_login.toISOString()
            : null,
        }
      : null;
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

  async convidarCoordenador(
    input: ConvidarCoordenadorInput,
  ): Promise<ConviteCriado> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const perfilResultado = await cliente.query(
        "SELECT id FROM perfis WHERE nome = 'coordenador' LIMIT 1",
      );
      const perfilId = perfilResultado.rows[0]?.id;
      if (!perfilId) {
        throw new Error("Perfil 'coordenador' nao encontrado.");
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

      const coordenadorResultado = await cliente.query(
        `INSERT INTO coordenadores (usuario_id, telefone, area_coordenacao)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [usuarioId, input.telefone ?? null, input.areaCoordenacao ?? null],
      );
      const coordenadorId = coordenadorResultado.rows[0].id;

      await cliente.query("COMMIT");

      return {
        usuarioId,
        instrutorId: coordenadorId,
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

  async listarTurmas(): Promise<TurmaListagem[]> {
    const query = `
      SELECT
        t.id,
        t.nome,
        t.codigo,
        tr.nome AS curso,
        STRING_AGG(DISTINCT ui.nome, ', ' ORDER BY ui.nome) AS instrutores,
        t.periodo_letivo,
        t.capacidade,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.data_fim, 'YYYY-MM-DD') AS data_termino,
        COUNT(DISTINCT m.id) AS alunos,
        COALESCE((
          SELECT ROUND(AVG(CASE WHEN fr.presente THEN 100 ELSE 0 END))
            FROM frequencias fr
            JOIN matriculas mf ON mf.id = fr.matricula_id
           WHERE mf.turma_id = t.id
        ), 0) AS frequencia_media,
        (
          SELECT COUNT(*)
            FROM frequencias fr
            JOIN matriculas mf ON mf.id = fr.matricula_id
           WHERE mf.turma_id = t.id
        ) AS registros_frequencia
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      LEFT JOIN turma_instrutores ti ON ti.turma_id = t.id
      LEFT JOIN instrutores i ON i.id = ti.instrutor_id
      LEFT JOIN usuarios ui ON ui.id = i.usuario_id
      LEFT JOIN matriculas m ON m.turma_id = t.id
      GROUP BY t.id, t.nome, tr.nome, t.periodo_letivo, t.capacidade, t.status, t.data_inicio, t.data_fim
      ORDER BY t.data_inicio DESC
    `;
    const resultado = await this.db.query(query);
    return resultado.rows.map((linha) => this.mapearTurma(linha));
  }

  async listarTurmasPorCurso(cursoId: string): Promise<TurmaListagem[]> {
    const query = `
      SELECT
        t.id,
        t.nome,
        t.codigo,
        tr.nome AS curso,
        STRING_AGG(DISTINCT ui.nome, ', ' ORDER BY ui.nome) AS instrutores,
        t.periodo_letivo,
        t.capacidade,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.data_fim, 'YYYY-MM-DD') AS data_termino,
        COUNT(DISTINCT m.id) AS alunos,
        COALESCE((
          SELECT ROUND(AVG(CASE WHEN fr.presente THEN 100 ELSE 0 END))
            FROM frequencias fr
            JOIN matriculas mf ON mf.id = fr.matricula_id
           WHERE mf.turma_id = t.id
        ), 0) AS frequencia_media,
        (
          SELECT COUNT(*)
            FROM frequencias fr
            JOIN matriculas mf ON mf.id = fr.matricula_id
           WHERE mf.turma_id = t.id
        ) AS registros_frequencia
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      LEFT JOIN turma_instrutores ti ON ti.turma_id = t.id
      LEFT JOIN instrutores i ON i.id = ti.instrutor_id
      LEFT JOIN usuarios ui ON ui.id = i.usuario_id
      LEFT JOIN matriculas m ON m.turma_id = t.id
      WHERE t.treinamento_id = $1
      GROUP BY t.id, t.nome, tr.nome, t.periodo_letivo, t.capacidade, t.status, t.data_inicio, t.data_fim
      ORDER BY t.data_inicio DESC
    `;
    const resultado = await this.db.query(query, [cursoId]);
    return resultado.rows.map((linha) => this.mapearTurma(linha));
  }

  async buscarTurmaDetalhe(id: string): Promise<TurmaDetalhe | null> {
    const turmaResultado = await this.db.query(
      `
      SELECT
        t.id,
        t.nome,
        t.codigo,
        tr.nome AS curso,
        STRING_AGG(DISTINCT ui.nome, ', ' ORDER BY ui.nome) AS instrutores,
        t.periodo_letivo,
        t.capacidade,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.data_fim, 'YYYY-MM-DD') AS data_termino,
        COUNT(DISTINCT m.id) AS alunos,
        COALESCE((
          SELECT ROUND(AVG(CASE WHEN fr.presente THEN 100 ELSE 0 END))
            FROM frequencias fr
            JOIN matriculas mf ON mf.id = fr.matricula_id
           WHERE mf.turma_id = t.id
        ), 0) AS frequencia_media,
        (
          SELECT COUNT(*)
            FROM frequencias fr
            JOIN matriculas mf ON mf.id = fr.matricula_id
           WHERE mf.turma_id = t.id
        ) AS registros_frequencia
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      LEFT JOIN turma_instrutores ti ON ti.turma_id = t.id
      LEFT JOIN instrutores i ON i.id = ti.instrutor_id
      LEFT JOIN usuarios ui ON ui.id = i.usuario_id
      LEFT JOIN matriculas m ON m.turma_id = t.id
      WHERE t.id = $1
      GROUP BY t.id, t.nome, tr.nome, t.periodo_letivo, t.capacidade, t.status, t.data_inicio, t.data_fim
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
          m.id AS matricula_id,
          m.status,
          COALESCE(ROUND(AVG(CASE WHEN f.presente THEN 100 ELSE 0 END)), 0) AS frequencia
        FROM matriculas m
        JOIN alunos a ON a.id = m.aluno_id
        JOIN usuarios u ON u.id = a.usuario_id
        LEFT JOIN frequencias f ON f.matricula_id = m.id
        WHERE m.turma_id = $1
        GROUP BY a.id, u.nome, u.email, a.telefone, m.id, m.status
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
        matriculaId: linha.matricula_id,
      })),
      cronograma: aulasResultado.rows.map((linha) => this.mapearAula(linha)),
    };
  }

  async criarTurma(input: CriarTurmaInput): Promise<TurmaListagem> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const query = `
        INSERT INTO turmas (
          treinamento_id, coordenador_id, codigo, nome,
          periodo_letivo, data_inicio, data_fim, horario, status, capacidade
        )
        VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;

      const resultado = await client.query(query, [
        input.treinamentoId,
        input.coordenadorId ?? null,
        input.nome,
        input.periodoLetivo,
        input.dataInicio,
        input.dataFim,
        input.horario,
        input.status,
        input.limiteAlunos,
      ]);

      const turmaId = resultado.rows[0].id;

      for (const instrutorId of input.instrutorIds) {
        await client.query(
          "INSERT INTO turma_instrutores (turma_id, instrutor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [turmaId, instrutorId],
        );
      }

      await client.query("COMMIT");

      const turma = await this.buscarTurmaDetalhe(turmaId);
      return turma!.turma;
    } catch (error: any) {
      await client.query("ROLLBACK");

      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error("Ja existe uma turma cadastrada com este nome.");
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async atualizarTurma(id: string, input: AtualizarTurmaInput): Promise<TurmaListagem | null> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const resultado = await client.query(
        `UPDATE turmas
         SET nome = $1, treinamento_id = $2, capacidade = $3,
             periodo_letivo = $4, data_inicio = $5, data_fim = $6, status = $7
         WHERE id = $8
         RETURNING id`,
        [input.nome, input.treinamentoId, input.capacidade, input.periodoLetivo, input.dataInicio, input.dataFim, input.status, id],
      );

      if (resultado.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query("DELETE FROM turma_instrutores WHERE turma_id = $1", [id]);

      for (const instrutorId of input.instrutorIds) {
        await client.query(
          "INSERT INTO turma_instrutores (turma_id, instrutor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, instrutorId],
        );
      }

      await client.query("COMMIT");

      const turma = await this.buscarTurmaDetalhe(id);
      return turma?.turma ?? null;
    } catch (error: any) {
      await client.query("ROLLBACK");

      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new Error("Ja existe uma turma cadastrada com este nome.");
      }
      throw error;
    } finally {
      client.release();
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
      codigo: linha.codigo ?? "",
      curso: linha.curso,
      instrutores: linha.instrutores ?? "",
      alunos: Number(linha.alunos),
      capacidade: Number(linha.capacidade),
      dataInicio: linha.data_inicio,
      dataTermino: linha.data_termino ?? null,
      periodoLetivo: linha.periodo_letivo ?? "",
      status: linha.status,
      frequenciaMedia: Number(linha.frequencia_media),
      // Quantas chamadas a turma tem registradas. Serve para distinguir "0% de
      // presenca" de "turma que ainda nao teve chamada" — sem isso, turmas sem
      // registro entravam como 0% e derrubavam a media geral.
      registrosFrequencia: Number(linha.registros_frequencia ?? 0),
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

  private mapearRelatorioGerado(linha: any): RelatorioGerado {
    return {
      id: linha.id,
      tipo: linha.tipo,
      titulo: linha.titulo,
      arquivoCsv: linha.arquivo_csv ?? null,
      arquivoPdf: linha.arquivo_pdf ?? null,
      filtros: linha.filtros_json ?? null,
      geradoPorId: linha.gerado_por_id ?? null,
      criadoEm:
        linha.criado_em instanceof Date
          ? linha.criado_em.toISOString()
          : String(linha.criado_em),
    };
  }

  async buscarPeriodoLetivo(): Promise<PeriodoLetivoResponse> {
    try {
      // O periodo letivo mora em duas chaves: `periodo_letivo` e a legada
      // `periodo_letivo_atual`. Ler so uma delas fazia o painel e a tela de
      // Configuracoes exibirem periodos diferentes — o painel caia no calculo
      // por data porque a chave que ele lia nao existia no seed. Aqui a
      // canonica tem prioridade e a legada e o fallback.
      const resultado = await this.db.query(
        `SELECT chave, valor, descricao,
                to_char(atualizado_em, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS atualizado_em,
                atualizado_por_id
           FROM configuracoes_sistema
          WHERE chave = ANY($1::text[])
          ORDER BY array_position($1::text[], chave)
          LIMIT 1`,
        [PERIODO_LETIVO_CHAVES],
      );

      const linha = resultado.rows[0];

      if (!linha) {
        return {
          periodoLetivo: calcularPeriodoLetivoAtual(),
          origem: "automatico",
          atualizadoEm: null,
          atualizadoPor: null,
        };
      }

      let atualizadoPorNome: string | null = null;
      if (linha.atualizado_por_id) {
        const usuarioRes = await this.db.query(
          `SELECT nome FROM usuarios WHERE id = $1 LIMIT 1`,
          [linha.atualizado_por_id],
        );
        atualizadoPorNome = usuarioRes.rows[0]?.nome ?? null;
      }

      return {
        periodoLetivo: linha.valor,
        origem: "manual",
        atualizadoEm: linha.atualizado_em ?? null,
        atualizadoPor: atualizadoPorNome,
      };
    } catch {
      return {
        periodoLetivo: calcularPeriodoLetivoAtual(),
        origem: "automatico",
        atualizadoEm: null,
        atualizadoPor: null,
      };
    }
  }

  async salvarPeriodoLetivo(
    periodoLetivo: string,
    usuarioId: string,
  ): Promise<PeriodoLetivoResponse> {
    try {
      // Grava as duas chaves para o painel e a tela de Configuracoes nunca
      // divergirem, seja qual for a tela usada para editar.
      await this.db.query(
        `INSERT INTO configuracoes_sistema (chave, valor, descricao, atualizado_por_id, atualizado_em)
         SELECT chave, $2, 'Periodo letivo definido manualmente pelo coordenador.', $3, now()
           FROM unnest($1::text[]) AS chave
         ON CONFLICT (chave) DO UPDATE
           SET valor = EXCLUDED.valor,
               atualizado_por_id = EXCLUDED.atualizado_por_id,
               atualizado_em = now()`,
        [PERIODO_LETIVO_CHAVES, periodoLetivo, usuarioId],
      );

      return await this.buscarPeriodoLetivo();
    } catch {
      throw new Error(
        "A tabela de configuracoes do sistema nao esta disponivel. Execute a migration 12-criar-configuracoes-sistema.sql no banco de dados.",
      );
    }
  }

  async excluirPeriodoLetivoManual(): Promise<void> {
    try {
      await this.db.query(
        `DELETE FROM configuracoes_sistema WHERE chave = ANY($1::text[])`,
        [PERIODO_LETIVO_CHAVES],
      );
    } catch {
      // Tabela nao existe = ja esta em modo automatico.
    }
  }
}
