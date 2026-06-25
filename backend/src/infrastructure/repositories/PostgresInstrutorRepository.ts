import { Pool } from "pg";
import {
  AdicionarMaterialInput,
  AlunoPresenca,
  AulaResumo,
  InstrutorDashboard,
  InstrutorRepository,
  InstrutorResumo,
  MaterialResumo,
  RegistrarPresencasInput,
  StatusPresenca,
  TurmaResumo,
} from "../../domain/repositories/InstrutorRepository";

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
        this.listarMateriais(turma.id),
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
      "SELECT 1 FROM turmas WHERE id = $1 AND instrutor_id = $2 LIMIT 1",
      [turmaId, instrutorId],
    );

    return Boolean(resultado.rows[0]);
  }

  private async buscarInstrutor(
    instrutorId: string,
  ): Promise<InstrutorResumo | null> {
    const query = `
      SELECT id, usuario_id, nome, area_atuacao
      FROM instrutores
      WHERE id = $1
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
    };
  }

  private async buscarTurmaAtual(
    instrutorId: string,
  ): Promise<TurmaResumo | null> {
    const query = `
      SELECT t.id, t.codigo, t.nome, t.turno, t.local, tr.nome AS curso
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      WHERE t.instrutor_id = $1
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

  private async listarMateriais(turmaId: string): Promise<MaterialResumo[]> {
    const query = `
      SELECT
        id,
        titulo,
        tipo,
        tamanho_bytes,
        to_char(data_publicacao, 'YYYY-MM-DD') AS data_publicacao,
        url_arquivo
      FROM materiais
      WHERE turma_id = $1 AND status = 'ativo'
      ORDER BY data_publicacao ASC
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
        a.nome,
        f.presente,
        f.observacao
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      LEFT JOIN frequencias f
        ON f.matricula_id = m.id
       AND f.aula_id = $2
      WHERE m.turma_id = $1
      ORDER BY a.nome ASC
    `;
    const resultado = await this.db.query(query, [turmaId, aulaReferenciaId]);

    return resultado.rows.map((linha) => ({
      matriculaId: linha.matricula_id,
      alunoId: linha.aluno_id,
      nome: linha.nome,
      statusPresenca: this.mapearStatusPresenca(linha.presente, linha.observacao),
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
    const query = `
      INSERT INTO materiais (turma_id, publicado_por_id, titulo, tipo, url_arquivo, tamanho_bytes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        titulo,
        tipo,
        tamanho_bytes,
        to_char(data_publicacao, 'YYYY-MM-DD') AS data_publicacao,
        url_arquivo
    `;

    const resultado = await this.db.query(query, [
      input.turmaId,
      input.publicadoPorId ?? null,
      input.titulo,
      input.tipo,
      input.urlArquivo ?? null,
      input.tamanhoBytes ?? null,
    ]);

    return this.mapearMaterial(resultado.rows[0]);
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
      tipo: linha.tipo,
      tamanhoBytes: linha.tamanho_bytes ?? null,
      dataPublicacao: linha.data_publicacao,
      urlArquivo: linha.url_arquivo ?? null,
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
