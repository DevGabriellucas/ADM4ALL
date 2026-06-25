import { createHmac, timingSafeEqual } from "crypto";

export interface TokenPayload {
  sub: string;
  nome: string;
  email: string;
  perfil: string;
  alunoId: string | null;
  instrutorId: string | null;
  coordenadorId: string | null;
  exp: number;
}

const base64Url = (valor: Buffer | string) =>
  Buffer.from(valor)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const assinar = (conteudo: string, segredo: string) =>
  base64Url(createHmac("sha256", segredo).update(conteudo).digest());

export class JwtService {
  constructor(private segredo: string) {
    if (!segredo || segredo.trim().length < 16) {
      throw new Error("JWT_SECRET precisa ter pelo menos 16 caracteres.");
    }
  }

  gerar(
    payload: Omit<TokenPayload, "exp">,
    expiraEmSegundos = 60 * 60 * 8,
  ): string {
    const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64Url(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + expiraEmSegundos,
      }),
    );
    const conteudo = `${header}.${body}`;
    return `${conteudo}.${assinar(conteudo, this.segredo)}`;
  }

  verificar(token: string): TokenPayload {
    const partes = token.split(".");
    if (partes.length !== 3 || !partes[0] || !partes[1] || !partes[2]) {
      throw new Error("Token invalido.");
    }

    const conteudo = `${partes[0]}.${partes[1]}`;
    const assinaturaEsperada = assinar(conteudo, this.segredo);
    const assinaturaRecebida = partes[2];

    const esperado = Buffer.from(assinaturaEsperada);
    const recebido = Buffer.from(assinaturaRecebida);

    if (
      esperado.length !== recebido.length ||
      !timingSafeEqual(esperado, recebido)
    ) {
      throw new Error("Token invalido.");
    }

    const payload = JSON.parse(
      Buffer.from(partes[1], "base64url").toString("utf8"),
    ) as TokenPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expirado.");
    }

    return payload;
  }
}
