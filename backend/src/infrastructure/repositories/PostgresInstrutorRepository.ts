import { Pool, PoolClient } from "pg";
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
  SituacaoAula,
  StatusPresenca,
  TurmaDashboard,
  TurmaResumo,
} from "../../domain/repositories/InstrutorRepository";
import {
  AULAS_POR_PERIODO,
  FREQUENCIA_MAXIMA_REPROVACAO,
  FREQUENCIA_MINIMA_APROVACAO,
} from "../../domain/regras-academicas";
import {
  chamadasLancadas,
  faltasNaoJustificadas,
  frequenciaPorMatricula,
  presencasEfetivas,
} from "./sql/frequencia";
import {
  atualizarStatusDerivadoDaTurma,
  cursoConcluido,
} from "./sql/turma";

const CODIGO_VIOLACAO_UNICIDADE = "23505";

// Marca das presencas que o sistema lanca sozinho na aula de encerramento.
// Serve para reconhecer e desfazer o lancamento automatico se a aula voltar a
// ser planejada, sem tocar em chamada que alguem fez a mao.
const OBSERVACAO_PRESENCA_DE_ENCERRAMENTO =
  "Presenca confirmada automaticamente na aula de encerramento.";

// invalid_text_representation. O id da turma escolhida pela coordenacao chega
// pela query string, entao um valor que nao e UUID e entrada invalida (404) e
// nao falha do servidor (500).
const CODIGO_TEXTO_INVALIDO = "22P02";

// check_violation. Acusa banco sem a migration que liberou presenca justificada.
const CODIGO_VIOLACAO_CHECK = "23514";

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
        aulaAtual: null,
        proximaAula: null,
        metricas: { totalAlunos: 0, presentesHoje: 0, frequenciaMedia: 0 },
        alunos: [],
        cronograma: [],
        materiais: [],
      };
    }

    return { instrutor, ...(await this.montarPainelDaTurma(turma)) };
  }

  // A coordenacao escolhe a turma no seletor e cai aqui; o instrutor chega pela
  // turma vinculada a ele. O calculo e o mesmo nos dois caminhos de proposito:
  // frequencia divergente entre as duas telas ja foi bug neste projeto.
  async buscarDashboardDaTurma(
    turmaId: string,
  ): Promise<TurmaDashboard | null> {
    const turma = await this.buscarTurmaPorId(turmaId);

    if (!turma) {
      return null;
    }

    return await this.montarPainelDaTurma(turma);
  }

  private async montarPainelDaTurma(
    turma: TurmaResumo,
  ): Promise<TurmaDashboard> {
    const [
      aulaReferencia,
      aulasPendentes,
      cronograma,
      materiais,
      frequenciaMedia,
    ] = await Promise.all([
      this.buscarAulaReferencia(turma.id),
      this.listarAulasPendentes(turma.id, 2),
      this.listarCronograma(turma.id),
      this.listarMateriaisTurma(turma.id),
      this.calcularFrequenciaMedia(turma.id),
    ]);

    // A primeira pendente e a aula que esta por vir; a segunda e a seguinte.
    const aulaAtual = aulasPendentes[0] ?? null;
    const proximaAula = aulasPendentes[1] ?? null;

    const alunos = await this.listarAlunosComPresenca(
      turma.id,
      aulaReferencia?.id ?? null,
    );

    const presentesHoje = alunos.filter(
      (aluno) => aluno.statusPresenca === "presente",
    ).length;

    return {
      turma,
      aulaReferencia,
      aulaAtual,
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
      SELECT
        t.id, t.codigo, t.nome, t.turno, t.local, t.periodo_letivo,
        t.status,
        tr.nome AS curso
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      JOIN turma_instrutores ti ON ti.turma_id = t.id
      WHERE ti.instrutor_id = $1
      ORDER BY (t.status = 'em_andamento') DESC, t.data_inicio DESC
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [instrutorId]);

    return this.mapearTurma(resultado.rows[0]);
  }

  private async buscarTurmaPorId(turmaId: string): Promise<TurmaResumo | null> {
    const query = `
      SELECT
        t.id, t.codigo, t.nome, t.turno, t.local, t.periodo_letivo,
        t.status,
        tr.nome AS curso
      FROM turmas t
      JOIN treinamentos tr ON tr.id = t.treinamento_id
      WHERE t.id = $1
      LIMIT 1
    `;

    try {
      const resultado = await this.db.query(query, [turmaId]);
      return this.mapearTurma(resultado.rows[0]);
    } catch (error: any) {
      if (error?.code === CODIGO_TEXTO_INVALIDO) {
        return null;
      }

      throw error;
    }
  }

  private mapearTurma(linha: any): TurmaResumo | null {
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
      periodoLetivo: linha.periodo_letivo,
      status: linha.status,
    };
  }

  // Aula de referencia para a marcacao de presenca do dia:
  // prioriza a aula de hoje, depois a proxima futura e por fim a mais recente.
  private async buscarAulaReferencia(
    turmaId: string,
  ): Promise<AulaResumo | null> {
    const query = `
      SELECT
        id,
        numero_aula,
        titulo,
        to_char(data_aula, 'YYYY-MM-DD') AS data_aula,
        to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(hora_fim, 'HH24:MI') AS hora_fim,
        status
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

  /**
   * As aulas que ainda nao aconteceram, da mais proxima para a mais distante.
   *
   * A virada e pelo horario de termino, na hora de Sao Paulo: quando a aula de
   * hoje acaba, ela sai da lista e a agenda anda sozinha — a barra passa a
   * mostrar a proxima e o cartao "Proxima aula", a seguinte. Aula cancelada
   * nunca entra.
   */
  private async listarAulasPendentes(
    turmaId: string,
    limite: number,
  ): Promise<AulaResumo[]> {
    const query = `
      SELECT
        id,
        numero_aula,
        titulo,
        to_char(data_aula, 'YYYY-MM-DD') AS data_aula,
        to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(hora_fim, 'HH24:MI') AS hora_fim,
        status
      FROM aulas
      WHERE turma_id = $1
        AND status <> 'cancelada'
        AND (
          data_aula + COALESCE(hora_fim, TIME '23:59')
        ) > (now() AT TIME ZONE 'America/Sao_Paulo')
      ORDER BY data_aula ASC, numero_aula ASC
      LIMIT $2
    `;
    const resultado = await this.db.query(query, [turmaId, limite]);

    return resultado.rows.map((linha) => this.mapearAula(linha)!);
  }

  private async listarCronograma(turmaId: string): Promise<AulaResumo[]> {
    const query = `
      SELECT
        id,
        numero_aula,
        titulo,
        to_char(data_aula, 'YYYY-MM-DD') AS data_aula,
        to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(hora_fim, 'HH24:MI') AS hora_fim,
        status
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
        m.status AS status_matricula,
        f.presente,
        f.justificada,
        COALESCE(freq.presencas, 0) AS presencas,
        COALESCE(freq.justificadas, 0) AS justificadas,
        COALESCE(freq.faltas, 0) AS faltas,
        COALESCE(freq.aulas_registradas, 0) AS aulas_registradas,
        -- Mesma conta do painel do aluno, vinda do helper: creditos sobre
        -- chamadas lancadas. Quando cada tela escrevia a sua, as duas
        -- mostravam numeros diferentes para o mesmo aluno.
        COALESCE(freq.frequencia, 0) AS frequencia
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      LEFT JOIN frequencias f
        ON f.matricula_id = m.id
       AND f.aula_id = $2
      LEFT JOIN LATERAL (
        SELECT
          -- Presenca justificada e gravada com presente = TRUE, entao um
          -- COUNT FILTER (presente) puro contava a mesma linha aqui e em
          -- "Justificadas", e as colunas da tela nao fechavam com o total de
          -- chamadas.
          ${presencasEfetivas("f2")} AS presencas,
          COUNT(*) FILTER (WHERE f2.justificada) AS justificadas,
          -- Falta justificada nao entra na conta, igual ao painel do aluno.
          ${faltasNaoJustificadas("f2")} AS faltas,
          ${chamadasLancadas("f2")} AS aulas_registradas,
          ${frequenciaPorMatricula("f2")} AS frequencia
        FROM frequencias f2
        WHERE f2.matricula_id = m.id
      ) freq ON TRUE
      -- Matricula cancelada nao e mais aluno da turma: fora da chamada e das
      -- metricas do painel.
      WHERE m.turma_id = $1
        AND m.status <> 'cancelado'
      ORDER BY u.nome ASC
    `;
    const resultado = await this.db.query(query, [turmaId, aulaReferenciaId]);

    return resultado.rows.map((linha) => ({
      matriculaId: linha.matricula_id,
      alunoId: linha.aluno_id,
      nome: linha.nome,
      statusPresenca: this.mapearStatusPresenca(
        linha.presente,
        linha.justificada,
      ),
      presencas: Number(linha.presencas),
      justificadas: Number(linha.justificadas),
      faltas: Number(linha.faltas),
      aulasRegistradas: Number(linha.aulas_registradas),
      frequencia: Number(linha.frequencia),
      statusMatricula: linha.status_matricula,
    }));
  }

  private async calcularFrequenciaMedia(turmaId: string): Promise<number> {
    const query = `
      -- Media das frequencias individuais, e nao das chamadas: cada aluno vale
      -- o mesmo peso, com a mesma conta que ele ve no proprio painel.
      WITH por_aluno AS (
        SELECT ${frequenciaPorMatricula("f")} AS frequencia
        FROM matriculas m
        LEFT JOIN frequencias f ON f.matricula_id = m.id
        WHERE m.turma_id = $1
          AND m.status <> 'cancelado'
        GROUP BY m.id
      )
      SELECT
        COALESCE(ROUND(AVG(frequencia)), 0) AS presentes,
        COUNT(*) AS total
      FROM por_aluno
    `;
    const resultado = await this.db.query(query, [turmaId]);
    const linha = resultado.rows[0];

    const total = Number(linha?.total ?? 0);
    if (total === 0) {
      return 0;
    }

    return Number(linha?.presentes ?? 0);
  }

  async registrarPresencas(input: RegistrarPresencasInput): Promise<void> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      const aulaResultado = await cliente.query(
        `SELECT to_char(data_aula, 'YYYY-MM-DD') AS data_aula, numero_aula
         FROM aulas
         WHERE id = $1 AND turma_id = $2`,
        [input.aulaId, input.turmaId],
      );

      const aula = aulaResultado.rows[0];
      if (!aula) {
        throw new Error("Aula nao encontrada para esta turma.");
      }

      // A aula de encerramento nao tem chamada: a presenca dela e do sistema.
      // Recusar aqui, e nao so esconder o botao, e o que impede uma chamada
      // enviada direto na API de contradizer a regra.
      if (Number(aula.numero_aula) === AULAS_POR_PERIODO) {
        throw new BadRequestError(
          `A aula ${AULAS_POR_PERIODO} e a de encerramento: a presenca dela e confirmada para toda a turma quando a aula e marcada como realizada, sem chamada.`,
        );
      }

      // Upsert atomico pela identidade exata da chamada: (matricula, aula).
      //
      // O par UPDATE-entao-INSERT que existia aqui casava por
      // `(aula_id = $2 OR data_aula = $6)`. Esse OR alcancava a linha de OUTRA
      // aula que por acaso caisse na mesma data e a reescrevia, apagando a
      // chamada dela sem erro nenhum; podia tambem casar duas linhas de uma vez
      // e estourar o indice unico, derrubando a chamada inteira com um 500.
      // O ON CONFLICT tambem e a guarda de concorrencia que o par nao tinha.
      const salvar = `
        INSERT INTO frequencias (
          matricula_id, aula_id, data_aula, presente, justificada, observacao
        )
        VALUES ($1, $2, $6, $3, $4, $5)
        ON CONFLICT (matricula_id, aula_id) WHERE aula_id IS NOT NULL
        DO UPDATE SET
          presente = EXCLUDED.presente,
          justificada = EXCLUDED.justificada,
          observacao = EXCLUDED.observacao,
          data_aula = EXCLUDED.data_aula,
          data_registro = now()
      `;

      for (const registro of input.registros) {
        const { presente, justificada, observacao } = this.traduzirStatus(
          registro.status,
        );

        await cliente.query(salvar, [
          registro.matriculaId,
          input.aulaId,
          presente,
          justificada,
          observacao,
          aula.data_aula,
        ]);
      }

      // Lancar a chamada JA DA A AULA POR REALIZADA (decisao da coordenacao em
      // 18/09). Eram dois passos para a mesma coisa: quem lancou a chamada deu
      // a aula, e quem esquecia o segundo passo deixava a turma sem fechar com
      // o cronograma inteiro cumprido.
      //
      // Sem a trava de horario que o cronograma usa: ali ela protege contra
      // clique errado numa aula futura; aqui a chamada e o proprio registro de
      // quem esteve na sala.
      await cliente.query(
        `UPDATE aulas SET status = 'realizada'
         WHERE id = $1 AND turma_id = $2 AND status = 'planejada'`,
        [input.aulaId, input.turmaId],
      );

      // Com todas as outras aulas dadas, a de encerramento fecha junto — e ela
      // que confirma a presenca da turma inteira e leva a turma a "encerrada".
      await this.fecharAulaDeEncerramentoSePossivel(cliente, input.turmaId);

      // A turma inteira e reavaliada, e nao so quem entrou nesta chamada: a
      // aula que acabou de ser dada por realizada pode ter fechado o curso, e
      // isso decide aprovacao e certificado de todo mundo.
      const matriculasDaTurma = await cliente.query(
        `SELECT id FROM matriculas
         WHERE turma_id = $1 AND status <> 'cancelado'`,
        [input.turmaId],
      );

      await this.reavaliarSituacaoMatricula(
        cliente,
        matriculasDaTurma.rows.map((linha) => linha.id),
      );

      await this.atualizarStatusAutomaticoDaTurma(cliente, input.turmaId);

      await cliente.query("COMMIT");
    } catch (error: any) {
      await cliente.query("ROLLBACK");

      // Banco que ainda carrega a constraint antiga recusa presenca
      // justificada. Sem esta traducao o instrutor recebia "Erro interno do
      // servidor." e perdia a chamada inteira, sem nada que apontasse a causa.
      if (error?.code === CODIGO_VIOLACAO_CHECK) {
        throw new BadRequestError(
          "O banco de dados ainda nao aceita presenca justificada. Aplique a " +
            "migration 20260916_presenca_justificada_como_presente.sql antes " +
            "de lancar esta chamada.",
        );
      }

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
      RETURNING
        id,
        numero_aula,
        titulo,
        to_char(data_aula, 'YYYY-MM-DD') AS data_aula,
        to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(hora_fim, 'HH24:MI') AS hora_fim,
        status
    `;

    try {
      const resultado = await this.db.query(query, [
        input.turmaId,
        input.titulo,
        input.data,
        input.horaInicio ?? null,
        input.horaFim ?? null,
      ]);

      // Aula nova numa turma ja encerrada reabre a turma: o curso voltou a ter
      // aula pendente.
      await this.reavaliarSituacaoTurma(input.turmaId);

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
        to_char(a.hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(a.hora_fim, 'HH24:MI') AS hora_fim,
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

  /**
   * Situacao da aula para as regras do cronograma.
   *
   * `jaTerminou` compara o fim da aula com a hora de Sao Paulo, e nao com o
   * relogio do servidor: o banco e o backend rodam em UTC, entao usar now()
   * direto liberaria "Realizada" tres horas antes de a aula acabar.
   */
  async buscarSituacaoAula(
    turmaId: string,
    aulaId: string,
  ): Promise<SituacaoAula | null> {
    const resultado = await this.db.query(
      `
      SELECT
        numero_aula,
        status,
        (
          data_aula + COALESCE(hora_fim, TIME '23:59')
        ) <= (now() AT TIME ZONE 'America/Sao_Paulo') AS ja_terminou
      FROM aulas
      WHERE id = $1 AND turma_id = $2
      LIMIT 1
      `,
      [aulaId, turmaId],
    );
    const linha = resultado.rows[0];

    if (!linha) {
      return null;
    }

    return {
      numero: Number(linha.numero_aula),
      status: linha.status,
      jaTerminou: linha.ja_terminou,
    };
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

    // Remover a ultima aula pendente fecha o curso; a turma acompanha.
    await this.reavaliarSituacaoTurma(turmaId);
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
        RETURNING
          id,
          numero_aula,
          titulo,
          to_char(data_aula, 'YYYY-MM-DD') AS data_aula,
          to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
          to_char(hora_fim, 'HH24:MI') AS hora_fim,
          status
        `,
        valores,
      );

      const aula = resultado.rows[0];
      if (!aula) {
        throw new BadRequestError("Aula nao encontrada para esta turma.");
      }

      // Remarcar a aula leva junto a data das frequencias dela. Sem isso a
      // chamada ficava com a data antiga, e essa linha desencontrada colidia
      // com o indice (matricula, data_aula) assim que outra aula ocupava a
      // data liberada.
      if (input.data !== undefined) {
        await this.db.query(
          "UPDATE frequencias SET data_aula = $2 WHERE aula_id = $1",
          [input.aulaId, input.data],
        );
      }

      // Marcar uma aula COMUM como realizada nao lanca presenca para ninguem.
      //
      // Ate 18/09 lancava em qualquer aula: quem ficasse sem chamada entrava
      // como presente. Isso dava presenca de graca a turma inteira so por mexer
      // no cronograma. Presenca de aula comum so existe quando alguem lanca a
      // chamada e salva.
      //
      // A aula de encerramento (a decima, AULAS_POR_PERIODO) e a excecao, por
      // decisao da coordenacao em 18/09: nela ninguem faz chamada e todo mundo
      // conta presente. Por isso o lancamento e do sistema, e nao do instrutor.
      if (Number(aula.numero_aula) === AULAS_POR_PERIODO) {
        await this.sincronizarPresencaDeEncerramento(
          input.turmaId,
          input.aulaId,
          aula.data_aula,
          aula.status === "realizada",
        );
      }

      // Mudar o status da aula pode fechar (ou reabrir) o curso, e e o que
      // decide a aprovacao automatica da turma inteira.
      if (input.status !== undefined) {
        await this.reavaliarSituacaoTurma(input.turmaId);
      }

      return this.mapearAula(aula)!;
    } catch (error: any) {
      if (error?.code === CODIGO_VIOLACAO_UNICIDADE) {
        throw new BadRequestError("Ja existe uma aula cadastrada para esta data.");
      }
      throw error;
    }
  }

  /**
   * Marca a aula de encerramento como realizada quando todas as outras aulas da
   * turma ja foram dadas.
   *
   * A aula 10 nao tem chamada, entao nada mais dispararia o "realizada" dela: a
   * coordenacao teria de lembrar de marcar no cronograma para a turma fechar.
   * Com as nove primeiras realizadas, a decima e consequencia — e junto com ela
   * vem a presenca confirmada da turma inteira.
   *
   * Exige ao menos uma outra aula realizada de proposito: numa turma que so tem
   * a aula de encerramento cadastrada, "todas as outras" seria verdade por
   * vacuidade e a turma encerraria sem ter tido aula nenhuma.
   */
  private async fecharAulaDeEncerramentoSePossivel(
    cliente: PoolClient,
    turmaId: string,
  ): Promise<void> {
    const pendente = await cliente.query(
      `
      SELECT a.id, to_char(a.data_aula, 'YYYY-MM-DD') AS data_aula
      FROM aulas a
      WHERE a.turma_id = $1
        AND a.numero_aula = $2
        AND a.status = 'planejada'
        AND EXISTS (
          SELECT 1 FROM aulas outras
          WHERE outras.turma_id = $1
            AND outras.id <> a.id
            AND outras.status = 'realizada'
        )
        AND NOT EXISTS (
          SELECT 1 FROM aulas outras
          WHERE outras.turma_id = $1
            AND outras.id <> a.id
            AND outras.status NOT IN ('realizada', 'cancelada')
        )
      LIMIT 1
      `,
      [turmaId, AULAS_POR_PERIODO],
    );

    const aula = pendente.rows[0];
    if (!aula) {
      return;
    }

    await cliente.query(
      "UPDATE aulas SET status = 'realizada' WHERE id = $1",
      [aula.id],
    );

    await this.confirmarPresencaDeEncerramento(
      cliente,
      turmaId,
      aula.id,
      aula.data_aula,
    );
  }

  /**
   * Lanca (ou desfaz) a presenca automatica da aula de encerramento.
   *
   * Realizada: todo aluno da turma fica presente, inclusive quem tem falta
   * lancada ali — e a regra da aula 10, onde nao ha chamada a fazer.
   *
   * Voltou a planejada: so as linhas que o proprio sistema criou saem, que e
   * para o que serve a observacao. Chamada feita a mao em outra aula nunca e
   * tocada.
   */
  private async sincronizarPresencaDeEncerramento(
    turmaId: string,
    aulaId: string,
    dataAula: string,
    realizada: boolean,
  ): Promise<void> {
    if (!realizada) {
      await this.db.query(
        `DELETE FROM frequencias
         WHERE aula_id = $1 AND observacao = $2`,
        [aulaId, OBSERVACAO_PRESENCA_DE_ENCERRAMENTO],
      );
      return;
    }

    await this.confirmarPresencaDeEncerramento(
      this.db,
      turmaId,
      aulaId,
      dataAula,
    );
  }

  /**
   * O lancamento em si, separado para rodar tanto solto quanto dentro da
   * transacao da chamada — e por isso recebe quem executa a consulta.
   */
  private async confirmarPresencaDeEncerramento(
    executor: Pool | PoolClient,
    turmaId: string,
    aulaId: string,
    dataAula: string,
  ): Promise<void> {
    await executor.query(
      `
      INSERT INTO frequencias (
        matricula_id, aula_id, data_aula, presente, justificada, observacao
      )
      SELECT m.id, $1, $2::date, TRUE, FALSE, $3
      FROM matriculas m
      WHERE m.turma_id = $4 AND m.status <> 'cancelado'
      ON CONFLICT (matricula_id, aula_id) WHERE aula_id IS NOT NULL
      DO UPDATE SET
        presente = TRUE,
        justificada = FALSE,
        observacao = EXCLUDED.observacao,
        data_aula = EXCLUDED.data_aula,
        data_registro = now()
      `,
      [aulaId, dataAula, OBSERVACAO_PRESENCA_DE_ENCERRAMENTO, turmaId],
    );
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

  async removerAvatar(instrutorId: string): Promise<void> {
    await this.db.query(
      "UPDATE instrutores SET avatar_url = NULL WHERE id = $1",
      [instrutorId],
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
      horaInicio: linha.hora_inicio ?? null,
      horaFim: linha.hora_fim ?? null,
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

  /**
   * Recalcula a situacao das matriculas informadas. Roda dentro da transacao
   * do registro de presenca e tambem quando uma aula vira "realizada", porque
   * os dois eventos mudam o desfecho.
   *
   * Sao tres saidas:
   * - frequencia igual ou inferior a 70% reprova, o que na pratica e a terceira
   *   falta nao justificada;
   * - curso terminado com frequencia suficiente aprova sozinho, e e isso que
   *   libera o botao de emitir certificado sem a coordenacao mexer no status;
   * - qualquer outro caso volta para "em andamento", o que faz justificar uma
   *   falta desfazer a reprovacao.
   *
   * A frequencia e a MESMA conta das telas, vinda do helper: creditos
   * (presenca e justificada) sobre chamadas lancadas.
   *
   * OS DOIS desfechos exigem o curso concluido. Para a reprovacao isso nao e
   * detalhe: com poucas chamadas lancadas, uma unica falta ja derruba a
   * proporcao abaixo do limite, e sem esta guarda o aluno seria reprovado na
   * primeira semana.
   *
   * `registros > 0` guarda a aprovacao contra a turma que fecha sem nenhuma
   * chamada lancada.
   *
   * So matricula cancelada nao e tocada, porque o aluno saiu da turma. A
   * aprovacao E revista: lancar falta depois de aprovar tem que reprovar.
   */
  private async reavaliarSituacaoMatricula(
    cliente: PoolClient,
    matriculaIds: string[],
  ): Promise<void> {
    if (matriculaIds.length === 0) {
      return;
    }

    await cliente.query(
      `
      WITH situacao AS (
        SELECT
          m.id,
          m.turma_id,
          ${frequenciaPorMatricula("f")} AS frequencia,
          ${chamadasLancadas("f")} AS registros
        FROM matriculas m
        LEFT JOIN frequencias f ON f.matricula_id = m.id
        WHERE m.id = ANY($1::uuid[])
        GROUP BY m.id, m.turma_id
      ),
      avaliada AS (
        SELECT
          s.id,
          s.registros,
          s.frequencia,
          (
            SELECT ${cursoConcluido("au")}
            FROM turmas tu
            LEFT JOIN aulas au ON au.turma_id = tu.id
            WHERE tu.id = s.turma_id
            GROUP BY tu.id
          ) AS curso_concluido
        FROM situacao s
      ),
      destino AS (
        SELECT
          a.id,
          CASE
            WHEN a.curso_concluido
             AND a.registros > 0
             AND a.frequencia >= $3::INTEGER THEN 'aprovado'
            WHEN a.curso_concluido
             AND a.frequencia <= $2::INTEGER THEN 'reprovado_falta'
            ELSE 'em_andamento'
          END AS status
        FROM avaliada a
      )
      UPDATE matriculas m
      SET
        status = d.status,
        data_conclusao = CASE
          WHEN d.status IN ('aprovado', 'reprovado_falta') THEN CURRENT_DATE
          ELSE NULL
        END
      FROM destino d
      WHERE m.id = d.id
        AND m.status <> 'cancelado'
        AND m.status <> d.status
      `,
      [
        matriculaIds,
        FREQUENCIA_MAXIMA_REPROVACAO,
        FREQUENCIA_MINIMA_APROVACAO,
      ],
    );

    await this.sincronizarCertificados(cliente, matriculaIds);
  }

  /**
   * O certificado segue o desfecho da matricula: aprovado tem certificado
   * emitido, qualquer outro desfecho cancela o que existir. Roda na mesma
   * transacao da reavaliacao, entao encerrar a turma ja emite e corrigir a
   * chamada depois ja cancela.
   *
   * Nao gera PDF aqui de proposito: o download regenera o arquivo a partir da
   * linha quando ele nao existe em disco, entao a linha e a fonte da verdade.
   *
   * O `WHERE certificados.status <> 'emitido'` no ON CONFLICT preserva codigo e
   * arquivo de quem ja esta emitido — reemitir a cada chamada lancada trocaria
   * o codigo de um certificado que o aluno ja baixou.
   */
  private async sincronizarCertificados(
    cliente: PoolClient,
    matriculaIds: string[],
  ): Promise<void> {
    await cliente.query(
      `
      INSERT INTO certificados
        (matricula_id, codigo, status, data_emissao, emitido_por_id, observacao)
      SELECT
        m.id,
        'CERT-ALU-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
          UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FOR 8)),
        'emitido',
        CURRENT_DATE,
        NULL,
        'Certificado emitido automaticamente ao concluir o curso.'
      FROM matriculas m
      WHERE m.id = ANY($1::uuid[])
        AND m.status = 'aprovado'
      ON CONFLICT (matricula_id) DO UPDATE SET
        status = 'emitido',
        data_emissao = CURRENT_DATE,
        url_arquivo = NULL,
        observacao = 'Certificado reemitido automaticamente ao concluir o curso.'
      WHERE certificados.status <> 'emitido'
      `,
      [matriculaIds],
    );

    await cliente.query(
      `
      UPDATE certificados c
      SET
        status = 'cancelado',
        observacao = 'Certificado cancelado automaticamente: o aluno deixou de atender aos criterios.'
      FROM matriculas m
      WHERE m.id = c.matricula_id
        AND m.id = ANY($1::uuid[])
        AND m.status <> 'aprovado'
        AND c.status <> 'cancelado'
      `,
      [matriculaIds],
    );
  }

  /**
   * Reavalia todas as matriculas ativas da turma. Usado quando uma aula muda
   * de status: terminar a ultima aula pode aprovar a turma inteira de uma vez.
   */
  // Tudo aqui commita junto ou nao commita nada. Sao quatro escritas ligadas —
  // situacao das matriculas, emissao de certificado, cancelamento de
  // certificado e status da turma — e sem transacao elas eram autocommits
  // independentes: uma falha no meio deixava o aluno em "em andamento" com o
  // certificado ainda valido para download. Como o botao "Encerrar turma" saiu
  // da tela, desfazer isso exigiria SQL direto no banco de producao.
  //
  // Nao ha transacao aberta em nenhum dos chamadores (adicionarAula,
  // removerAula, atualizarAula); registrarPresencas tem a sua e chama
  // reavaliarSituacaoMatricula direto, sem passar por aqui.
  private async reavaliarSituacaoTurma(turmaId: string): Promise<void> {
    const cliente = await this.db.connect();

    try {
      await cliente.query("BEGIN");

      // Vem primeiro: marcar a ultima aula comum como realizada fecha tambem a
      // de encerramento, e e essa que confirma a presenca da turma e decide a
      // aprovacao logo abaixo.
      await this.fecharAulaDeEncerramentoSePossivel(cliente, turmaId);

      const matriculas = await cliente.query(
        `SELECT id FROM matriculas
         WHERE turma_id = $1 AND status <> 'cancelado'`,
        [turmaId],
      );

      await this.reavaliarSituacaoMatricula(
        cliente,
        matriculas.rows.map((linha) => linha.id),
      );

      await this.atualizarStatusAutomaticoDaTurma(cliente, turmaId);

      await cliente.query("COMMIT");
    } catch (erro) {
      await cliente.query("ROLLBACK");
      throw erro;
    } finally {
      cliente.release();
    }
  }

  // A regra do status derivado mora em sql/turma.ts porque a coordenacao
  // tambem precisa dela: matricular ou desvincular aluno muda a contagem que
  // decide entre "planejada" e "em andamento".
  private async atualizarStatusAutomaticoDaTurma(
    cliente: PoolClient,
    turmaId: string,
  ): Promise<void> {
    await cliente.query(atualizarStatusDerivadoDaTurma(), [turmaId]);
  }

  private mapearStatusPresenca(
    presente: boolean | null,
    justificada: boolean | null,
  ): StatusPresenca | null {
    if (presente === null || presente === undefined) {
      return null;
    }

    if (justificada) {
      return "justificada";
    }

    return presente ? "presente" : "falta";
  }

  private traduzirStatus(status: StatusPresenca): {
    presente: boolean;
    justificada: boolean;
    observacao: string | null;
  } {
    if (status === "presente") {
      return { presente: true, justificada: false, observacao: null };
    }

    if (status === "justificada") {
      return {
        presente: true,
        justificada: true,
        observacao: "Presenca justificada",
      };
    }

    return { presente: false, justificada: false, observacao: null };
  }
}
