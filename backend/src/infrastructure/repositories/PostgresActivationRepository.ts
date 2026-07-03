import { Pool } from "pg";
import {
  ActivationRepository,
  AtivacaoConta,
  ConfirmarAtivacaoInput,
  PerfilAtivacao,
  RegistrarAtivacaoInput,
} from "../../domain/repositories/ActivationRepository";

export class PostgresActivationRepository implements ActivationRepository {
  constructor(private db: Pool) {}

  async registrar(input: RegistrarAtivacaoInput): Promise<void> {
    await this.db.query(
      `INSERT INTO ativacoes_conta (
         usuario_id, token_hash, tipo, origem, campos_pendentes, expira_em
       )
       VALUES ($1, $2, 'ativacao', $3, $4, $5)`,
      [
        input.usuarioId,
        input.tokenHash,
        input.origem,
        input.camposPendentes,
        input.expiraEm,
      ],
    );
  }

  async buscarPorTokenHash(tokenHash: string): Promise<AtivacaoConta | null> {
    const resultado = await this.db.query(
      `SELECT
         ac.usuario_id,
         ac.origem,
         ac.campos_pendentes,
         ac.expira_em,
         ac.usado_em,
         u.nome,
         u.email,
         p.nome AS perfil
       FROM ativacoes_conta ac
       JOIN usuarios u ON u.id = ac.usuario_id
       JOIN perfis p ON p.id = u.perfil_id
       WHERE ac.token_hash = $1
         AND ac.tipo = 'ativacao'
       LIMIT 1`,
      [tokenHash],
    );
    const linha = resultado.rows[0];

    if (!linha) {
      return null;
    }

    return {
      usuarioId: linha.usuario_id,
      perfil: linha.perfil,
      origem: linha.origem,
      nome: linha.nome,
      email: linha.email,
      camposPendentes: linha.campos_pendentes,
      expiraEm: new Date(linha.expira_em),
      usadoEm: linha.usado_em ? new Date(linha.usado_em) : null,
    };
  }

  async confirmar(
    tokenHash: string,
    perfil: PerfilAtivacao,
    dados: ConfirmarAtivacaoInput,
  ): Promise<boolean> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");
      const token = await client.query(
        `SELECT id, usuario_id
         FROM ativacoes_conta
         WHERE token_hash = $1
           AND tipo = 'ativacao'
           AND usado_em IS NULL
           AND expira_em > now()
         FOR UPDATE`,
        [tokenHash],
      );
      const ativacao = token.rows[0];

      if (!ativacao) {
        await client.query("ROLLBACK");
        return false;
      }

      await client.query(
        `UPDATE usuarios
         SET senha = COALESCE($2, senha), status = 'ativo'
         WHERE id = $1`,
        [ativacao.usuario_id, dados.senhaHash ?? null],
      );

      if (perfil === "aluno") {
        await client.query(
          `UPDATE alunos
           SET telefone = COALESCE($2, telefone),
               rgm = COALESCE($3, rgm),
               curso_unipe = COALESCE($4, curso_unipe),
               is_aluno_unipe = CASE
                 WHEN $3::text IS NOT NULL AND $4::text IS NOT NULL THEN TRUE
                 ELSE is_aluno_unipe
               END
           WHERE usuario_id = $1`,
          [
            ativacao.usuario_id,
            dados.whatsapp ?? null,
            dados.rgm ?? null,
            dados.cursoUnipe ?? null,
          ],
        );
      }

      if (perfil === "instrutor") {
        await client.query(
          `UPDATE instrutores
           SET telefone = COALESCE($2, telefone),
               area_atuacao = COALESCE($3, area_atuacao),
               formacao = COALESCE($4, formacao),
               ativo = TRUE
           WHERE usuario_id = $1`,
          [
            ativacao.usuario_id,
            dados.whatsapp ?? null,
            dados.areaAtuacao ?? null,
            dados.formacao ?? null,
          ],
        );
      }

      await client.query(
        "UPDATE ativacoes_conta SET usado_em = now() WHERE id = $1",
        [ativacao.id],
      );
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
