import { Cpf } from "../value-objects/Cpf";
import { Email } from "../value-objects/Email";
import { Telefone } from "../value-objects/Telefone";
import crypto from "crypto";

export interface AlunoProps {
  id?: string;
  nome: string;
  cpf: Cpf;
  telefone: Telefone;
  email: Email;
  dataNascimento: Date;
  isAlunoUnipe: boolean;
  cursoUnipe?: string;
  senha: string;       
  treinamento: string;   
  rgm?: string;          
  dataCadastro?: Date;   
}

export class Aluno {
  private props: AlunoProps;

  constructor(props: AlunoProps) {
    if (!props.nome || props.nome.trim() === "") throw new Error("O nome é obrigatório.");
    if (!props.dataNascimento || isNaN(props.dataNascimento.getTime())) {
      throw new Error("A data de nascimento é obrigatória ou inválida.");
    }
    if (!props.senha || props.senha.trim() === "") throw new Error("A senha é obrigatória.");
    if (!props.treinamento || props.treinamento.trim() === "") throw new Error("O treinamento é obrigatório.");
    if (props.isAlunoUnipe) {
      if (!props.cursoUnipe || props.cursoUnipe.trim() === "") {
        throw new Error("Alunos do Unipê precisam informar o curso de graduação.");
      }
      if (!props.rgm || props.rgm.trim() === "") {
        throw new Error("Alunos do Unipê precisam informar o RGM.");
      }

      if (props.rgm.length !== 8 || !/^\d+$/.test(props.rgm)) {
      throw new Error("O RGM fornecido é inválido. Ele deve conter exatamente 8 dígitos numéricos.");
    }
    }

    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(),
      dataCadastro: props.dataCadastro || new Date() 
    };
  }

  // Getters
  get id(): string { return this.props.id!; }
  get nome(): string { return this.props.nome; }
  get cpf(): string { return this.props.cpf.value; }
  get telefone(): string { return this.props.telefone.value; }
  get email(): string { return this.props.email.value; }
  get dataNascimento(): Date { return this.props.dataNascimento; }
  get isAlunoUnipe(): boolean { return this.props.isAlunoUnipe; }
  get cursoUnipe(): string | undefined { return this.props.cursoUnipe; }
  get senha(): string { return this.props.senha; }
  get treinamento(): string { return this.props.treinamento; }
  get rgm(): string | undefined { return this.props.rgm; }
  get dataCadastro(): Date { return this.props.dataCadastro!; }

  public update(novosDados: Partial<Omit<AlunoProps, 'id' | 'cpf'>>) {
    this.props = { ...this.props, ...novosDados };
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
      dataCadastro: this.dataCadastro
    };
  }
}