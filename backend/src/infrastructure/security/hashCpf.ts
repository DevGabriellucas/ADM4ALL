import { createHmac } from "crypto";
import { getRequiredEnv } from "../config/env";

/**
 * Hash do CPF guardado em `cpfs_bloqueados`.
 *
 * A tabela existe para impedir que quem foi excluido se recadastre pelo
 * formulario publico. Ate 18/09 ela guardava o CPF, o nome e o e-mail em texto
 * puro, para sempre, DEPOIS de a pessoa ter sido apagada do sistema — a
 * exclusao nao excluia. Nome e e-mail nao bloqueiam nada e sairam; o CPF virou
 * hash, que responde a unica pergunta que a tabela precisa responder: "este CPF
 * esta bloqueado?".
 *
 * ## Por que HMAC e nao SHA-256 puro
 *
 * CPF tem 11 digitos e os dois ultimos sao verificadores: sao ~10^9 valores
 * possiveis. Um SHA-256 simples seria quebrado por forca bruta em minutos, e a
 * tabela continuaria entregando os CPFs de quem saiu. O HMAC entra com um
 * segredo que nao mora no banco (CPF_HASH_SECRET), entao quem levar so o dump
 * nao consegue montar a tabela de comparacao.
 *
 * ## O preco do segredo
 *
 * Trocar CPF_HASH_SECRET invalida os bloqueios ja gravados: os hashes antigos
 * deixam de bater e quem estava bloqueado consegue se cadastrar de novo. Nao ha
 * como reverter isso a partir do banco, porque o CPF de origem nao existe mais
 * em lugar nenhum — de proposito. Rotacionar o segredo significa aceitar zerar
 * a lista.
 *
 * As consultas que calculam o hash em SQL (PostgresCoordenadorRepository) usam
 * `encode(hmac(cpf, $segredo, 'sha256'), 'hex')` do pgcrypto, que produz
 * exatamente o mesmo valor desta funcao.
 */
export const segredoDoHashCpf = (): string => getRequiredEnv("CPF_HASH_SECRET");

export const hashCpf = (cpf: string): string =>
  createHmac("sha256", segredoDoHashCpf())
    .update(cpf.replace(/\D/g, ""))
    .digest("hex");
