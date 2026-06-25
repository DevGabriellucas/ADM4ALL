import crypto from "crypto";
import { Cpf } from "../value-objects/Cpf";
import { Email } from "../value-objects/Email";
import { Telefone } from "../value-objects/Telefone";

export interface AlunoProps {
  id?: string | undefined;
  nome: string;
  cpf: Cpf;
  telefone: Telefone;
  email: Email;
  dataNascimento: Date;
  isAlunoUnipe: boolean;
  cursoUnipe?: string | undefined;
  senha: string;
  treinamento: string;
  rgm?: string | undefined;
  dataCadastro?: Date | undefined;
}

export class Aluno {
  private props: AlunoProps;

  constructor(props: AlunoProps) {
    Aluno.validar(props);

    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
      dataCadastro: props.dataCadastro || new Date(),
    };
  }

  private static validar(props: AlunoProps) {
    if (!props.nome || props.nome.trim() === "") {
      throw new Error("O nome e obrigatorio.");
    }

    if (!props.dataNascimento || isNaN(props.dataNascimento.getTime())) {
      throw new Error("A data de nascimento e obrigatoria ou invalida.");
    }

    if (!props.senha || props.senha.trim() === "") {
      throw new Error("A senha e obrigatoria.");
    }

    if (!props.treinamento || props.treinamento.trim() === "") {
      throw new Error("O treinamento e obrigatorio.");
    }

    if (props.isAlunoUnipe) {
      if (!props.cursoUnipe || props.cursoUnipe.trim() === "") {
        throw new Error("Alunos do Unipe precisam informar o curso de graduacao.");
      }

      if (!props.rgm || props.rgm.trim() === "") {
        throw new Error("Alunos do Unipe precisam informar o RGM.");
      }

      if (props.rgm.length !== 8 || !/^\d+$/.test(props.rgm)) {
        throw new Error("O RGM fornecido e invalido. Ele deve conter exatamente 8 digitos numericos.");
      }
    }
  }

  get id(): string {
    return this.props.id!;
  }

  get nome(): string {
    return this.props.nome;
  }

  get cpf(): string {
    return this.props.cpf.value;
  }

  get telefone(): string {
    return this.props.telefone.value;
  }

  get email(): string {
    return this.props.email.value;
  }

  get dataNascimento(): Date {
    return this.props.dataNascimento;
  }

  get isAlunoUnipe(): boolean {
    return this.props.isAlunoUnipe;
  }

  get cursoUnipe(): string | undefined {
    return this.props.cursoUnipe;
  }

  get senha(): string {
    return this.props.senha;
  }

  get treinamento(): string {
    return this.props.treinamento;
  }

  get rgm(): string | undefined {
    return this.props.rgm;
  }

  get dataCadastro(): Date {
    return this.props.dataCadastro!;
  }

  public update(novosDados: Partial<Omit<AlunoProps, "id" | "cpf">>) {
    const dadosAtualizados = {
      ...this.props,
      ...novosDados,
    };

    Aluno.validar(dadosAtualizados);
    this.props = dadosAtualizados;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      cpf: this.cpf,
      telefone: this.telefone,
      email: this.email,
      dataNascimento: this.dataNascimento,
      isAlunoUnipe: this.isAlunoUnipe,
      cursoUnipe: this.isAlunoUnipe ? this.cursoUnipe : undefined,
      rgm: this.isAlunoUnipe ? this.rgm : undefined,
      treinamento: this.treinamento,
      dataCadastro: this.dataCadastro,
    };
  }
}
