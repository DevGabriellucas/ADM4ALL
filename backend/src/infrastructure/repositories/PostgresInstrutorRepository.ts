import { Pool } from "pg";
import { BadRequestError } from "../errors/BadRequestError";
import {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  AlunoNotificacaoAula,
  AtualizarAulaInput,
  AulaDetalheNotificacao,
  AulaResumo,
  InstrutorDashboard,
  InstrutorRepository,
  InstrutorResumo,
  MaterialResumo,
  RegistrarPresencasInput,
  StatusPresenca,
  TurmaResumo,
} from "../../domain/repositories/InstrutorRepository";

const CODIGO_VIOLACAO_UNICIDADE = "23505";

export class PostgresInstrutorRepository implements InstrutorRepository {
  constructor(private db: Pool) {}

  async buscarDashboard(instrutorId: string): Promise<InstrutorDashboard | null> {
    const instrutor = await this.buscarInstrutor(instrutorId);
    if (!instrutor) {
      return null;
    }

    const turma = await this.buscarTurmaAtual(instrutorId);

    if (!turma) {
      return {
        instrutor,
        turma: null,
        aulaReferencia: null,
        proximaAula: null,
        metricas: { totalAlunos: 0, presentesHoje: 0, frequenciaMedia: 0 },
        alunos: [],
        cronograma: [],
        materiais: [],
      };
    }

    const [aulaReferencia, proximaAula, cronograma, materiais, frequenciaMedia] =
      await Promise.all([
        this.buscarAulaReferencia(turma.id),
        this.buscarProximaAula(turma.id),
        this.listarCronograma(turma.id),
        this.listarMateriaisTurma(turma.id),
        this.calcularFrequenciaMedia(turma.id),
      ]);

    const alunos = await this.listarAlunosComPresenca(
      turma.id,
      aulaReferencia?.id ?? null,
    );

    const presentesHoje = alunos.filter(
      (aluno) => aluno.statusPresenca === "presente",
    ).length;

    return {
      instrutor,
      turma,
      aulaReferencia,
      proximaAula,
      metricas: {
        totalAlunos: alunos.length,
        presentesHoje,
        frequenciaMedia,
      },
      alunos,
      cronograma,
      materiais,
    };
  }

  async turmaPertenceAoInstrutor(
    turmaId: string,
    instrutorId: string,
  ): Promise<boolean> {
    const resultado = await this.db.query(
      "SELECT 1 FROM turma_instrutores WHERE turma_id = $1 AND instrutor_id = $2 LIMIT 1",
      [turmaId, instrutorId],
    );

    return Boolean(resultado.rows[0]);
  }

  private async buscarInstrutor(
    instrutorId: string,
  ): Promise<InstrutorResumo | null> {
    const query = `
      SELECT i.id, i.usuario_id, u.nome, i.area_atuacao, i.avatar_url
      FROM instrutores i
      JOIN usuarios u ON u.id = i.usuario_id
      WHERE i.id = $1
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [instrutorId]);
    const linha = resultado.rows[0];

    if (!linha) {
      return null;
    }

    return {
      id: linha.id,
      usuarioId: linha.usuario_id,
      nome: linha.nome,
      areaAtuacao: linha.area_atuacao ?? null,
      avatarUrl: linha.avatar_url ?? null,
    };
  }

  private async buscarTurmaAtual(
    instrutorId: string,
  ): Promise<TurmaResumo | null> {
    const query = `
      SELECT t.id, t.codigo, t.nome, t.turno, t.local, tr.nome AS curso
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      JOIN turma_instrutores ti ON ti.turma_id = t.id
      WHERE ti.instrutor_id = $1
      ORDER BY (t.status = 'em_andamento') DESC, t.data_inicio DESC
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [instrutorId]);
    const linha = resultado.rows[0];

    if (!linha) {
      return null;
    }

    return {
      id: linha.id,
      codigo: linha.codigo,
      nome: linha.nome,
      curso: linha.curso,
      turno: linha.turno,
      local: linha.local ?? null,
    };
  }

  // Aula de referencia para a marcacao de presenca do dia:
  // prioriza a aula de hoje, depois a proxima futura e por fim a mais recente.
  private async buscarAulaReferencia(
    turmaId: string,
  ): Promise<AulaResumo | null> {
    const query = `
      SELECT id, numero_aula, titulo, to_char(data_aula, 'YYYY-MM-DD') AS data_aula, status
      FROM aulas
      WHERE turma_id = $1
      ORDER BY
        (data_aula = CURRENT_DATE) DESC,
        (data_aula >= CURRENT_DATE) DESC,
        ABS(data_aula - CURRENT_DATE) ASC
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [turmaId]);
    return this.mapearAula(resultado.rows[0]);
  }

  private async buscarProximaAula(turmaId: string): Promise<AulaResumo | null> {
    const query = `
      SELECT id, numero_aula, titulo, to_char(data_aula, 'YYYY-MM-DD') AS data_aula, status
      FROM aulas
      WHERE turma_id = $1 AND data_aula > CURRENT_DATE
      ORDER BY data_aula ASC
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [turmaId]);
    return this.mapearAula(resultado.rows[0]);
  }

  private async listarCronograma(turmaId: string): Promise<AulaResumo[]> {
    const query = `
      SELECT id, numero_aula, titulo, to_char(data_aula, 'YYYY-MM-DD') AS data_aula, status
      FROM aulas
      WHERE turma_id = $1
      ORDER BY numero_aula ASC
    `;
    const resultado = await this.db.query(query, [turmaId]);
    return resultado.rows.map((linha) => this.mapearAula(linha)!);
  }

  async listarMateriaisTurma(turmaId: string): Promise<MaterialResumo[]> {
    const query = `
      SELECT
        m.id,
        m.titulo,
        m.descricao,
        m.tipo,
        m.tamanho_bytes,
        to_char(m.data_publicacao, 'YYYY-MM-DD') AS data_publicacao,
        m.url_arquivo,
        m.aula_id,
        m.visibilidade,
        a.titulo AS aula_titulo
      FROM materiais m
      LEFT JOIN aulas a ON a.id = m.aula_id
      WHERE m.turma_id = $1 AND m.status = 'ativo'
      ORDER BY m.data_publicacao ASC
    `;
    const resultado = await this.db.query(query, [turmaId]);
    return resultado.rows.map((linha) => this.mapearMaterial(linha));
  }

  private async listarAlunosComPresenca(
    turmaId: string,
    aulaReferenciaId: string | null,
  ): Promise<AlunoPresenca[]> {
    const query = `
      SELECT
        m.id AS matricula_id,
        a.id AS aluno_id,
        u.nome,
        f.presente,
        f.observacao,
        COALESCE(freq.presencas, 0) AS presencas,
        COALESCE(freq.faltas, 0) AS faltas,
        COALESCE(freq.aulas_registradas, 0) AS aulas_registradas,
        CASE
          WHEN COALESCE(freq.aulas_registradas, 0) = 0 THEN 0
          ELSE ROUND((freq.presencas::numeric / freq.aulas_registradas::numeric) * 100)
        END AS frequencia
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      LEFT JOIN frequencias f
        ON f.matricula_id = m.id
       AND f.aula_id = $2
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE f2.presente) AS presencas,
          COUNT(*) FILTER (WHERE NOT f2.presente) AS faltas,
          COUNT(*) AS aulas_registradas
        FROM frequencias f2
        WHERE f2.matricula_id = m.id
      ) freq ON TRUE
      WHERE m.turma_id = $1
      ORDER BY u.nome ASC
    `;
    const resultado = await this.db.query(query, [turmaId, aulaReferenciaId]);

    return resultado.rows.map((linha) => ({
      matriculaId: linha.matricula_id,
      alunoId: linha.aluno_id,
      nome: linha.nome,
      statusPresenca: this.mapearStatusPresenca(linha.presente, linha.observacao),
      presencas: Number(linha.presencas),
      faltas: Number(linha.faltas),
      aulasRegistradas: Number(linha.aulas_registradas),
      frequencia: Number(linha.frequencia),
    }));
  }

  private async calcularFrequenciaMedia(turmaId: string): Promise<number> {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE f.presente) AS presentes,
        COUNT(*) AS total
      FROM frequencias f
      JOIN matriculas m ON m.id = f.matricula_id
      WHERE m.turma_id = $1
    `;
    const resultado = await this.db.query(query, [turmaId]);
    const linha = resultado.rows[0];

    const total = Number(linha?.total ?? 0);
    if (total === 0) {
      return 0;
    }

    const presentes = Number(linha?.presentes ?? 0);
    return Math.round((presentes / total) * 100);
  }

  async registrarPresencas(input: RegistrarPresencasInput): Promise<void> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const aulaResultado = await cliente.query(
        `SELECT to_char(data_aula, 'YYYY-MM-DD') AS data_aula
         FROM aulas
         WHERE id = $1 AND turma_id = $2`,
        [input.aulaId, input.turmaId],
      );

      const aula = aulaResultado.rows[0];
      if (!aula) {
        throw new Error("Aula nao encontrada para esta turma.");
      }

      const upsert = `
        INSERT INTO frequencias (matricula_id, aula_id, data_aula, presente, observacao)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (matricula_id, data_aula)
        DO UPDATE SET
          presente = EXCLUDED.presente,
          observacao = EXCLUDED.observacao,
          aula_id = EXCLUDED.aula_id,
          data_registro = now()
      `;

      for (const registro of input.registros) {
        const { presente, observacao } = this.traduzirStatus(registro.status);

        await cliente.query(upsert, [
          registro.matriculaId,
          input.aulaId,
          aula.data_aula,
          presente,
          observacao,
        ]);
      }

      await cliente.query("COMMIT");
    } catch (error) {
      await cliente.query("ROLLBACK");
      throw error;
    } finally {
      cliente.release();
    }
  }

  async adicionarMaterial(
    input: AdicionarMaterialInput,
  ): Promise<MaterialResumo> {
    if (input.aulaId) {
      const aulaResultado = await this.db.query(
        "SELECT 1 FROM aulas WHERE id = $1 AND turma_id = $2 LIMIT 1",
        [input.aulaId, input.turmaId],
      );

      if (!aulaResultado.rows[0]) {
        throw new BadRequestError("Aula nao encontrada para esta turma.");
      }
    }

    const query = `
      INSERT INTO materiais (
        turma_id, aula_id, publicado_por_id, titulo, descricao,
        tipo, url_arquivo, tamanho_bytes, visibilidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        titulo,
        descricao,
        tipo,
        tamanho_bytes,
        to_char(data_publicacao, 'YYYY-MM-DD') AS data_publicacao,
        url_arquivo,
        aula_id,
        visibilidade,
        (
          SELECT titulo FROM aulas WHERE aulas.id = materiais.aula_id
        ) AS aula_titulo
    `;

    const resultado = await this.db.query(query, [
      input.turmaId,
      input.aulaId ?? null,
      input.publicadoPorId ?? null,
      input.titulo,
      input.descricao ?? null,
      input.tipo,
      input.urlArquivo ?? null,
      input.tamanhoBytes ?? null,
      input.visibilidade ?? "visivel",
    ]);

    return this.mapearMaterial(resultado.rows[0]);
  }

  async removerMaterial(materialId: string, turmaId: string): Promise<void> {
    const resultado = await this.db.query(
      `UPDATE materiais
       SET status = 'arquivado'
       WHERE id = $1 AND turma_id = $2 AND status = 'ativo'`,
      [materialId, turmaId],
    );

    if (resultado.rowCount === 0) {
      throw new BadRequestError("Material nao encontrado para esta turma.");
    }
  }

  async atualizarMaterialVisibilidade(
    materialId: string,
    turmaId: string,
    visibilidade: "visivel" | "oculto",
  ): Promise<MaterialResumo> {
    const resultado = await this.db.query(
      `
      UPDATE materiais
      SET visibilidade = $1
      WHERE id = $2 AND turma_id = $3 AND status = 'ativo'
      RETURNING
        id,
        titulo,
        descricao,
        tipo,
        tamanho_bytes,
        to_char(data_publicacao, 'YYYY-MM-DD') AS data_publicacao,
        url_arquivo,
        aula_id,
        visibilidade,
        (
          SELECT titulo FROM aulas WHERE aulas.id = materiais.aula_id
        ) AS aula_titulo
      `,
      [visibilidade, materialId, turmaId],
    );

    const material = resultado.rows[0];
    if (!material) {
      throw new BadRequestError("Material nao encontrado para esta turma.");
    }

    return this.mapearMaterial(material);
  }

  async adicionarAula(input: AdicionarAulaInput): Promise<AulaResumo> {
    const query = `
      INSERT INTO aulas (turma_id, numero_aula, titulo, data_aula, hora_inicio, hora_fim)
      SELECT $1, COALESCE(MAX(numero_aula), 0) + 1, $2, $3, $4, $5
      FROM aulas
      WHERE turma_id = $1
      RETURNING id, numero_aula, titulo, to_char(data_aula, 'YYYY-MM-DD') AS data_aula, status
    `;

    try {
      const resultado = await this.db.query(query, [
        input.turmaId,
        input.titulo,
        input.data,
        input.horaInicio ?? null,
        input.horaFim ?? null,
      ]);

      return this.mapearAula(resultado.rows[0])!;
    } catch (error: any) {
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new BadRequestError("Ja existe uma aula cadastrada para esta data.");
      }
      throw error;
    }
  }

  async buscarAulaParaNotificacao(
    turmaId: string,
    aulaId: string,
  ): Promise<AulaDetalheNotificacao | null> {
    const resultado = await this.db.query(
      `
      SELECT
        a.id,
        a.numero_aula,
        a.titulo,
        to_char(a.data_aula, 'YYYY-MM-DD') AS data_aula,
        a.status,
        t.id AS turma_id,
        t.nome AS turma,
        tr.nome AS curso
      FROM aulas a
      JOIN turmas t ON t.id = a.turma_id
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      WHERE a.id = $1 AND a.turma_id = $2
      LIMIT 1
      `,
      [aulaId, turmaId],
    );

    const aula = this.mapearAula(resultado.rows[0]);
    if (!aula) {
      return null;
    }

    return {
      ...aula,
      turmaId: resultado.rows[0].turma_id,
      turma: resultado.rows[0].turma,
      curso: resultado.rows[0].curso,
    };
  }

  async listarAlunosParaNotificacaoAula(
    turmaId: string,
  ): Promise<AlunoNotificacaoAula[]> {
    const resultado = await this.db.query(
      `
      SELECT DISTINCT
        a.id AS aluno_id,
        u.nome,
        u.email
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE m.turma_id = $1
        AND m.status <> 'cancelado'
        AND u.status = 'ativo'
        AND u.email IS NOT NULL
      ORDER BY u.nome ASC
      `,
      [turmaId],
    );

    return resultado.rows.map((linha) => ({
      alunoId: linha.aluno_id,
      nome: linha.nome,
      email: linha.email,
    }));
  }

  async removerAula(aulaId: string, turmaId: string): Promise<void> {
    const frequenciasResultado = await this.db.query(
      "SELECT 1 FROM frequencias WHERE aula_id = $1 LIMIT 1",
      [aulaId],
    );

    if (frequenciasResultado.rows[0]) {
      throw new BadRequestError(
        "Esta aula ja possui presenca registrada e nao pode ser removida.",
      );
    }

    const resultado = await this.db.query(
      "DELETE FROM aulas WHERE id = $1 AND turma_id = $2",
      [aulaId, turmaId],
    );

    if (resultado.rowCount === 0) {
      throw new BadRequestError("Aula nao encontrada para esta turma.");
    }
  }

  async atualizarAula(input: AtualizarAulaInput): Promise<AulaResumo> {
    const campos: string[] = [];
    const valores: unknown[] = [];

    const adicionarCampo = (sql: string, valor: unknown) => {
      valores.push(valor);
      campos.push(`${sql} = $${valores.length}`);
    };

    if (input.titulo !== undefined) adicionarCampo("titulo", input.titulo);
    if (input.data !== undefined) adicionarCampo("data_aula", input.data);
    if (input.horaInicio !== undefined) {
      adicionarCampo("hora_inicio", input.horaInicio);
    }
    if (input.horaFim !== undefined) adicionarCampo("hora_fim", input.horaFim);
    if (input.status !== undefined) adicionarCampo("status", input.status);

    if (campos.length === 0) {
      throw new BadRequestError("Informe ao menos um campo para atualizar.");
    }

    valores.push(input.aulaId, input.turmaId);

    try {
      const resultado = await this.db.query(
        `
        UPDATE aulas
        SET ${campos.join(", ")}
        WHERE id = $${valores.length - 1} AND turma_id = $${valores.length}
        RETURNING id, numero_aula, titulo, to_char(data_aula, 'YYYY-MM-DD') AS data_aula, status
        `,
        valores,
      );

      const aula = resultado.rows[0];
      if (!aula) {
        throw new BadRequestError("Aula nao encontrada para esta turma.");
      }

      return this.mapearAula(aula)!;
    } catch (error: any) {
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new BadRequestError("Ja existe uma aula cadastrada para esta data.");
      }
      throw error;
    }
  }

  async buscarPresencasPorAula(
    turmaId: string,
    aulaId: string,
  ): Promise<AlunoPresenca[]> {
    const aulaResultado = await this.db.query(
      "SELECT 1 FROM aulas WHERE id = $1 AND turma_id = $2 LIMIT 1",
      [aulaId, turmaId],
    );

    if (!aulaResultado.rows[0]) {
      throw new BadRequestError("Aula nao encontrada para esta turma.");
    }

    return this.listarAlunosComPresenca(turmaId, aulaId);
  }

  async atualizarAvatar(instrutorId: string, avatarUrl: string): Promise<void> {
    await this.db.query(
      "UPDATE instrutores SET avatar_url = $1 WHERE id = $2",
      [avatarUrl, instrutorId],
    );
  }

  private mapearAula(linha: any): AulaResumo | null {
    if (!linha) {
      return null;
    }

    return {
      id: linha.id,
      numero: Number(linha.numero_aula),
      titulo: linha.titulo,
      data: linha.data_aula,
      status: linha.status,
    };
  }

  private mapearMaterial(linha: any): MaterialResumo {
    return {
      id: linha.id,
      titulo: linha.titulo,
      descricao: linha.descricao ?? null,
      tipo: linha.tipo,
      tamanhoBytes: linha.tamanho_bytes ?? null,
      dataPublicacao: linha.data_publicacao,
      urlArquivo: linha.url_arquivo ?? null,
      aulaId: linha.aula_id ?? null,
      aulaTitulo: linha.aula_titulo ?? null,
      visibilidade: linha.visibilidade ?? "visivel",
    };
  }

  private mapearStatusPresenca(
    presente: boolean | null,
    observacao: string | null,
  ): StatusPresenca | null {
    if (presente === null || presente === undefined) {
      return null;
    }

    if (presente) {
      return "presente";
    }

    return observacao ? "justificada" : "falta";
  }

  private traduzirStatus(status: StatusPresenca): {
    presente: boolean;
    observacao: string | null;
  } {
    if (status === "presente") {
      return { presente: true, observacao: null };
    }

    if (status === "justificada") {
      return { presente: false, observacao: "Falta justificada" };
    }

    return { presente: false, observacao: null };
  }
}
