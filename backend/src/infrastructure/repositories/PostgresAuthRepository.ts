import { Pool } from "pg";
import {
  AuthRepository,
  UsuarioAutenticacao,
} from "../../domain/repositories/AuthRepository";

export class PostgresAuthRepository implements AuthRepository {
  constructor(private db: Pool) {}

  async buscarUsuarioPorIdentificador(
    identificador: string,
  ): Promise<UsuarioAutenticacao | null> {
    const query = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.senha AS senha_hash,
        u.status,
        p.nome AS perfil,
        u.aluno_id,
        i.id AS instrutor_id,
        c.id AS coordenador_id
      FROM usuarios u
      JOIN perfis p ON p.id = u.perfil_id
      LEFT JOIN alunos a ON a.id = u.aluno_id
      LEFT JOIN instrutores i ON i.usuario_id = u.id
      LEFT JOIN coordenadores c ON c.usuario_id = u.id
      WHERE lower(u.email) = lower($1)
         OR regexp_replace(coalesce(a.cpf, ''), '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
      LIMIT 1
    `;

    const resultado = await this.db.query(query, [identificador]);
    const linha = resultado.rows[0];

    if (!linha) {
      return null;
    }

    return {
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      senhaHash: linha.senha_hash,
      status: linha.status,
      perfil: linha.perfil,
      alunoId: linha.aluno_id ?? null,
      instrutorId: linha.instrutor_id ?? null,
      coordenadorId: linha.coordenador_id ?? null,
    };
  }

  async registrarUltimoLogin(usuarioId: string): Promise<void> {
    await this.db.query("UPDATE usuarios SET ultimo_login = now() WHERE id = $1", [
      usuarioId,
    ]);
  }
}
