import { Pool } from "pg";
import { Aluno } from "../../domain/entities/Aluno";
import {
  AlunoDashboard,
  AlunoRepository,
  CertificadoEmitidoDoAluno,
  DadosPessoaisDoAluno,
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
import {
  chamadasLancadas,
  faltasNaoJustificadas,
  frequenciaPorMatricula,
  presencasEfetivas,
} from "./sql/frequencia";
import { hashCpf } from "../security/hashCpf";
import { periodoDoCronograma } from "./sql/turma";

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

  // O bloqueio vale so para o cadastro publico. A coordenacao continua podendo
  // cadastrar o mesmo CPF, e esse cadastro tira o CPF da lista.
  //
  // A tabela guarda o hash do CPF, nao o CPF: o valor digitado no cadastro e
  // hasheado aqui e comparado com o que esta gravado. Ver hashCpf.ts.
  async cpfBloqueado(cpf: string): Promise<boolean> {
    const resultado = await this.db.query(
      "SELECT 1 FROM cpfs_bloqueados WHERE cpf_hash = $1 LIMIT 1",
      [hashCpf(cpf)],
    );

    return resultado.rows.length > 0;
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

  /**
   * Tudo que o sistema guarda sobre este aluno, para ele mesmo baixar.
   *
   * Sao quatro consultas em vez de uma so com JOIN: juntar matriculas,
   * frequencias e certificados na mesma linha multiplicaria os resultados entre
   * si, e a lista de frequencias sairia repetida uma vez por certificado.
   *
   * Hash de senha, token de recuperacao e ids internos ficam de fora: o aluno
   * pediu os dados dele, nao o conteudo das tabelas.
   */
  async buscarDadosPessoaisDoAluno(
    alunoId: string,
  ): Promise<DadosPessoaisDoAluno | null> {
    const cadastro = await this.db.query(
      `SELECT u.nome, u.email, u.cpf, u.status,
              a.telefone, a.rgm, a.curso_unipe, a.is_aluno_unipe,
              to_char(a.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
              to_char(a.data_cadastro, 'YYYY-MM-DD') AS data_cadastro,
              to_char(u.ultimo_login, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS ultimo_login
       FROM alunos a
       JOIN usuarios u ON u.id = a.usuario_id
       WHERE a.id = $1
       LIMIT 1`,
      [alunoId],
    );
    const linha = cadastro.rows[0];
    if (!linha) return null;

    const matriculas = await this.db.query(
      `SELECT tr.nome AS curso, tu.nome AS turma, tu.periodo_letivo, m.status,
              to_char(m.data_matricula, 'YYYY-MM-DD') AS data_matricula,
              to_char(m.data_conclusao, 'YYYY-MM-DD') AS data_conclusao
       FROM matriculas m
       LEFT JOIN treinamentos tr ON tr.id = m.treinamento_id
       LEFT JOIN turmas tu ON tu.id = m.turma_id
       WHERE m.aluno_id = $1
       ORDER BY m.data_matricula DESC, m.id`,
      [alunoId],
    );

    const frequencias = await this.db.query(
      `SELECT tu.nome AS turma, au.titulo AS aula, f.presente, f.justificada,
              f.observacao,
              to_char(f.data_aula, 'YYYY-MM-DD') AS data_aula
       FROM frequencias f
       JOIN matriculas m ON m.id = f.matricula_id
       LEFT JOIN turmas tu ON tu.id = m.turma_id
       LEFT JOIN aulas au ON au.id = f.aula_id
       WHERE m.aluno_id = $1
       ORDER BY f.data_aula, au.numero_aula`,
      [alunoId],
    );

    const certificados = await this.db.query(
      `SELECT c.codigo, c.status, tr.nome AS curso,
              to_char(c.data_emissao, 'YYYY-MM-DD') AS data_emissao
       FROM certificados c
       JOIN matriculas m ON m.id = c.matricula_id
       LEFT JOIN treinamentos tr ON tr.id = m.treinamento_id
       WHERE m.aluno_id = $1
       ORDER BY c.data_emissao DESC`,
      [alunoId],
    );

    return {
      geradoEm: new Date().toISOString(),
      cadastro: {
        nome: linha.nome,
        email: linha.email,
        cpf: linha.cpf,
        telefone: linha.telefone ?? null,
        dataNascimento: linha.data_nascimento ?? null,
        rgm: linha.rgm ?? null,
        cursoUnipe: linha.curso_unipe ?? null,
        alunoDaUnipe: Boolean(linha.is_aluno_unipe),
        statusDaConta: linha.status,
        dataDeCadastro: linha.data_cadastro ?? null,
        ultimoLogin: linha.ultimo_login ?? null,
      },
      matriculas: matriculas.rows.map((m) => ({
        curso: m.curso ?? null,
        turma: m.turma ?? null,
        periodoLetivo: m.periodo_letivo ?? null,
        status: m.status,
        dataMatricula: m.data_matricula ?? null,
        dataConclusao: m.data_conclusao ?? null,
      })),
      frequencias: frequencias.rows.map((f) => ({
        turma: f.turma ?? null,
        aula: f.aula ?? null,
        data: f.data_aula,
        presente: Boolean(f.presente),
        justificada: Boolean(f.justificada),
        observacao: f.observacao ?? null,
      })),
      certificados: certificados.rows.map((c) => ({
        codigo: c.codigo ?? null,
        curso: c.curso ?? null,
        status: c.status,
        dataEmissao: c.data_emissao ?? null,
      })),
    };
  }

  async buscarDashboardPorAlunoId(
    alunoId: string,
  ): Promise<AlunoDashboard | null> {
    const query = `
      -- O painel mostra UMA matricula, e esta CTE escolhe qual.
      --
      -- A escolha precisa ser estavel. Enquanto o desempate era so
      -- data_matricula DESC, duas matriculas do mesmo dia empatavam e o
      -- Postgres devolvia qualquer uma das duas: o aluno matriculado em duas
      -- turmas via o andamento de uma turma que nao era a dele — 10 de 10 na
      -- turma antiga enquanto a nova tinha uma aula so. A regra de uma turma
      -- por periodo (CoordenadorUseCase.vincularAlunoTurma) impede o caso de
      -- se repetir, mas o painel nao pode depender disso para os cadastros
      -- que ja existem.
      --
      -- 'cancelado' sai fora: e o status que a coordenacao grava ao
      -- desvincular o aluno, e ate 18/09 o painel continuava mostrando a turma
      -- de onde ele acabara de sair. Sem nenhuma matricula valida o painel cai
      -- no mesmo caminho do aluno recem-cadastrado (sem_matricula).
      WITH matricula_selecionada AS (
        SELECT m.*
        FROM matriculas m
        LEFT JOIN turmas tu_sel ON tu_sel.id = m.turma_id
        WHERE m.aluno_id = $1
          AND m.status <> 'cancelado'
        ORDER BY
          CASE m.status
            WHEN 'em_andamento' THEN 0
            WHEN 'aprovado' THEN 1
            WHEN 'reprovado_falta' THEN 2
            ELSE 3
          END,
          tu_sel.periodo_letivo DESC NULLS LAST,
          m.data_matricula DESC,
          m.id
        LIMIT 1
      ),
      -- As duas CTEs abaixo sao agregacoes sem GROUP BY, entao devolvem uma
      -- linha mesmo quando a matricula ainda nao tem turma (turma_id NULL) ou
      -- quando nenhuma chamada foi registrada. E o que mantem o painel de pe
      -- para o aluno recem-cadastrado.
      aulas_turma AS (
        SELECT
          COUNT(*) FILTER (WHERE au.status <> 'cancelada')::INTEGER AS total,
          COUNT(*) FILTER (WHERE au.status = 'realizada')::INTEGER AS realizadas
        FROM aulas au
        JOIN matricula_selecionada m ON m.turma_id = au.turma_id
      ),
      faltas_aluno AS (
        -- Falta justificada e aceita nao conta e nao desconta progresso.
        SELECT
          ${faltasNaoJustificadas("f")}::INTEGER AS qtd,
          ${presencasEfetivas("f")}::INTEGER AS presencas,
          -- Quantas chamadas existem para esta matricula. Sem este numero a
          -- tela nao tem como distinguir "0% porque faltou a tudo" de "0%
          -- porque a primeira chamada ainda nao foi lancada".
          ${chamadasLancadas("f")}::INTEGER AS chamadas,
          -- A MESMA conta das outras telas, vinda do helper: creditos sobre
          -- chamadas. Escrever a formula aqui ja produziu uma versao
          -- divergente — o aluno que faltasse na primeira aula via 0% e
          -- "Reprovado por falta" enquanto o instrutor via 90%.
          ${frequenciaPorMatricula("f")}::INTEGER AS frequencia
        FROM frequencias f
        JOIN matricula_selecionada m ON m.id = f.matricula_id
      ),
      painel AS (
        SELECT
          fa.qtd AS qtd_faltas,
          fa.presencas AS qtd_presencas,
          fa.chamadas AS qtd_chamadas_lancadas,
          fa.frequencia,
          au.total AS qtd_total_aulas,
          au.realizadas AS qtd_aulas_concluidas,
          CASE
            WHEN au.total > 0
              THEN ROUND((au.realizadas * 100.0) / au.total)
            ELSE 0
          END AS progresso,
          (au.total > 0 AND au.realizadas >= au.total) AS curso_concluido
        FROM faltas_aluno fa
        CROSS JOIN aulas_turma au
      )
      SELECT
        u.nome,
        a.rgm AS matricula,
        a.avatar_url,
        (m.id IS NULL) AS sem_matricula,
        COALESCE(tr.nome, '') AS nome_curso,
        p.qtd_faltas,
        p.qtd_chamadas_lancadas,
        p.qtd_total_aulas,
        p.qtd_aulas_concluidas,
        p.progresso,
        p.curso_concluido,
        -- Quem manda e o status da matricula, que o backend ja reavalia a cada
        -- chamada. Recalcular aqui era o que fazia o painel do aluno discordar
        -- do painel do instrutor sobre o mesmo aluno.
        COALESCE(m.status = 'aprovado', FALSE) AS certificado_liberado,
        COALESCE(m.status, 'em_andamento') AS status,
        -- A linha da tabela certificados e a fonte da verdade: se esta emitida,
        -- o aluno baixa. As condicoes extras que existiam aqui podiam esconder
        -- um certificado valido do dono dele.
        COALESCE(c.status = 'emitido', FALSE) AS certificado_disponivel,
        CASE WHEN c.status = 'emitido' THEN c.url_arquivo ELSE NULL END
        AS certificado_url,
        p.frequencia,
        -- A aula que o aluno precisa ver no cartao. Primeiro a proxima
        -- planejada; quando o cronograma acabou, a ultima que aconteceu.
        --
        -- So a primeira metade existia, e o cartao ficava vazio com o curso
        -- inteiro cadastrado — a turma que terminou nao tem aula futura, e a
        -- tela dizia "nenhuma aula publicada" para quem tinha dez.
        COALESCE(
          (
          SELECT json_build_object(
            'titulo', proxima.titulo,
            'data', to_char(proxima.data_aula, 'YYYY-MM-DD'),
            'horaInicio', to_char(proxima.hora_inicio, 'HH24:MI'),
            'horaFim', to_char(proxima.hora_fim, 'HH24:MI'),
            'momento', 'proxima'
          )
          FROM aulas proxima
          JOIN matricula_selecionada mp ON mp.turma_id = proxima.turma_id
          WHERE proxima.status = 'planejada'
            AND proxima.data_aula >= CURRENT_DATE
          ORDER BY proxima.data_aula, proxima.hora_inicio NULLS LAST
          LIMIT 1
          ),
          (
          SELECT json_build_object(
            'titulo', ultima.titulo,
            'data', to_char(ultima.data_aula, 'YYYY-MM-DD'),
            'horaInicio', to_char(ultima.hora_inicio, 'HH24:MI'),
            'horaFim', to_char(ultima.hora_fim, 'HH24:MI'),
            'momento', 'ultima'
          )
          FROM aulas ultima
          JOIN matricula_selecionada mu ON mu.turma_id = ultima.turma_id
          WHERE ultima.status <> 'cancelada'
          ORDER BY ultima.data_aula DESC, ultima.hora_inicio DESC NULLS LAST
          LIMIT 1
          )
        ) AS proxima_aula
        ,(
          -- Crescente, como o calendario da turma logo ao lado: as duas listas
          -- mostram as mesmas aulas e liam em sentidos opostos. O LIMIT de
          -- dentro continua pegando as dez mais recentes.
          SELECT COALESCE(json_agg(historico ORDER BY historico.data ASC), '[]'::json)
          FROM (
            SELECT
              au.titulo AS aula,
              to_char(au.data_aula, 'YYYY-MM-DD') AS data,
              CASE
                WHEN f.id IS NULL THEN 'pendente'
                WHEN f.justificada THEN 'justificada'
                WHEN f.presente THEN 'presente'
                ELSE 'falta'
              END AS situacao
            FROM aulas au
            JOIN matricula_selecionada mh ON mh.turma_id = au.turma_id
            LEFT JOIN frequencias f
              ON f.aula_id = au.id AND f.matricula_id = mh.id
            ORDER BY au.data_aula DESC, au.numero_aula DESC
            LIMIT 10
          ) historico
        ) AS historico_presencas
        ,(
          SELECT COALESCE(json_agg(calendario ORDER BY calendario.data ASC), '[]'::json)
          FROM (
            SELECT
              au.titulo AS aula,
              to_char(au.data_aula, 'YYYY-MM-DD') AS data,
              au.status
            FROM aulas au
            JOIN matricula_selecionada mc ON mc.turma_id = au.turma_id
            ORDER BY au.data_aula ASC, au.numero_aula ASC
          ) calendario
        ) AS calendario_turma
        ,'[]'::json AS comunicados
      FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      -- LEFT, e nao JOIN: aluno cadastrado que ainda nao foi vinculado a uma
      -- turma existe e precisa de painel. Com JOIN a consulta devolvia zero
      -- linhas, o use case virava 400 e a tela caia no boundary de erro
      -- dizendo "nao possui matricula disponivel" — e sao ~150 ex-alunos
      -- entrando assim antes do go-live.
      LEFT JOIN matricula_selecionada m ON m.aluno_id = a.id
      LEFT JOIN treinamentos tr ON tr.id = m.treinamento_id
      CROSS JOIN painel p
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
      avatarUrl: linha.avatar_url ?? null,
      semMatricula: linha.sem_matricula,
      cursoDeExtensao: {
        nomeCurso: linha.nome_curso,
        qtdFaltas: Number(linha.qtd_faltas),
        qtdChamadasLancadas: Number(linha.qtd_chamadas_lancadas ?? 0),
        qtdTotalAulas: Number(linha.qtd_total_aulas),
        qtdAulasConcluidas: Number(linha.qtd_aulas_concluidas),
        progresso: Number(linha.progresso),
        status: linha.status,
        cursoConcluido: linha.curso_concluido,
        certificadoLiberado: linha.certificado_liberado,
      },
      certificadoDisponivel: linha.certificado_disponivel,
      certificadoUrl: linha.certificado_url ?? null,
      frequencia: Number(linha.frequencia),
      proximaAula: linha.proxima_aula ?? null,
      historicoPresencas: linha.historico_presencas ?? [],
      calendarioTurma: linha.calendario_turma ?? [],
      comunicados: linha.comunicados ?? [],
    };
  }

  async atualizarAvatar(
    alunoId: string,
    avatarUrl: string | null,
  ): Promise<void> {
    const resultado = await this.db.query(
      "UPDATE alunos SET avatar_url = $1 WHERE id = $2",
      [avatarUrl, alunoId],
    );

    if (resultado.rowCount === 0) {
      throw new BadRequestError("Aluno nao encontrado.");
    }
  }

  async listarMateriaisVisiveis(
    alunoId: string,
  ): Promise<MaterialVisivelAluno[]> {
    const query = `
      WITH materiais_visiveis AS (
        SELECT DISTINCT ON (mat.id)
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
        ORDER BY mat.id, mat.data_publicacao DESC
      )
      SELECT *
      FROM materiais_visiveis
      ORDER BY data_publicacao DESC, titulo ASC
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

  async removerRecuperacaoSenhaPorTokenHash(tokenHash: string): Promise<void> {
    await this.db.query(
      `
        DELETE FROM recuperacoes_senha
        WHERE token_hash = $1
          AND usado_em IS NULL
      `,
      [tokenHash],
    );
  }

  async buscarRecuperacaoValidaPorTokenHash(
    tokenHash: string,
  ): Promise<RecuperacaoSenhaValida | null> {
    // A senha atual vem junto para que a redefinicao consiga recusar quem
    // digita a mesma senha de novo. Ver AlunoUseCase.redefinirSenha.
    const query = `
      SELECT r.id, r.usuario_id, u.senha
      FROM recuperacoes_senha r
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.token_hash = $1
        AND r.usado_em IS NULL
        AND r.expira_em > now()
      LIMIT 1
    `;
    const resultado = await this.db.query(query, [tokenHash]);
    const linha = resultado.rows[0];

    if (!linha) return null;

    return {
      recuperacaoId: linha.id,
      usuarioId: linha.usuario_id,
      senhaHashAtual: linha.senha ?? null,
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
      WITH materiais_aluno AS (
        SELECT DISTINCT ON (m.id)
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
          AND m.visibilidade = 'visivel'
          AND m.turma_id IN (
            SELECT mat.turma_id
            FROM matriculas mat
            WHERE mat.aluno_id = $1
              AND mat.turma_id IS NOT NULL
              AND mat.status <> 'cancelado'
          )
        ORDER BY m.id, m.data_publicacao DESC
      )
      SELECT *
      FROM materiais_aluno
      ORDER BY data_publicacao DESC, titulo ASC
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
        AND m.visibilidade = 'visivel'
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
    const periodo = periodoDoCronograma("tu");
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
        -- Periodo pelo cronograma; a data da turma so entra se nao houver aula
        -- lancada. Ver periodoDoCronograma em sql/turma.ts.
        to_char(
          COALESCE(${periodo.inicio}, tu.data_inicio),
          'YYYY-MM-DD'
        ) AS data_inicio,
        to_char(
          COALESCE(${periodo.fim}, tu.data_fim, m.data_conclusao, tu.data_inicio),
          'YYYY-MM-DD'
        ) AS data_fim,
        to_char(c.data_emissao, 'YYYY-MM-DD') AS data_emissao,
        COALESCE(emissor.nome, 'Coordenacao do Projeto') AS nome_coordenadora,
        -- Numeros reais da matricula do PROPRIO certificado. O caminho de
        -- fallback, que regera o PDF quando o arquivo sumiu do disco, montava
        -- o detalhe com faltas = 0 e frequencia = 100 fixos.
        (
          SELECT ${faltasNaoJustificadas("f")}
          FROM frequencias f
          WHERE f.matricula_id = m.id
        ) AS faltas,
        COALESCE((
          SELECT ${frequenciaPorMatricula("f2")}
          FROM frequencias f2
          WHERE f2.matricula_id = m.id
        ), 100) AS frequencia
      FROM certificados c
      JOIN matriculas m ON m.id = c.matricula_id
      JOIN alunos a ON a.id = m.aluno_id
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN treinamentos tr ON tr.id = m.treinamento_id
      LEFT JOIN turmas tu ON tu.id = m.turma_id
      LEFT JOIN usuarios emissor ON emissor.id = c.emitido_por_id
      WHERE c.status = 'emitido'
        AND a.id = $1
        -- Matricula desvinculada nao rende certificado para baixar. O status
        -- 'cancelado' e o que a coordenacao grava ao tirar o aluno da turma.
        AND m.status <> 'cancelado'
      -- O desempate precisa ser total.
      --
      -- Com ORDER BY c.data_emissao DESC sozinho, o aluno que tinha dois
      -- certificados emitidos no MESMO dia recebia qualquer um dos dois: quem
      -- concluiu o curso de RH baixava o certificado de Assistente
      -- Administrativo, com o nome do outro curso impresso. A regra de uma
      -- turma por periodo (CoordenadorUseCase.vincularAlunoTurma) impede o
      -- caso de nascer de novo, mas o download nao pode depender disso para os
      -- cadastros que ja existem.
      --
      -- A ultima chave e m.id, a mesma que desempata a escolha da matricula no
      -- painel (buscarDashboardPorAlunoId): assim a tela e o PDF concordam
      -- sobre qual curso e o do aluno.
      ORDER BY
        tu.periodo_letivo DESC NULLS LAST,
        c.data_emissao DESC,
        m.data_matricula DESC,
        m.id
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
      faltas: Number(linha.faltas ?? 0),
      frequencia: Number(linha.frequencia ?? 100),
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
