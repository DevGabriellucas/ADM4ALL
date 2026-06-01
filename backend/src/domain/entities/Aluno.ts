import { Cpf } from "../value-objects/Cpf";
import { Email } from "../value-objects/Email";
import { Telefone } from "../value-objects/Telefone";

export interface AlunoProps {
  id?: string;
  nome: string;
  cpf: Cpf;
  telefone: Telefone;
  email: Email;
  dataNascimento: Date;
  isAlunoUnipe: boolean;
  cursoUnipe?: string; // Apenas se for aluno da unipê
}

export class Aluno {
  private props: AlunoProps;


  constructor(props: AlunoProps) {
    if (!props.nome || props.nome.trim() === "") throw new Error("O nome é obrigatório.");
    if (!props.dataNascimento || isNaN(props.dataNascimento.getTime())) {
      throw new Error("A data de nascimento é obrigatória ou inválida.");
    }
    
    this.props = {
      ...props,
      id: props.id || crypto.randomUUID(), // Gera um ID
    };
  }

  get id(): string { return this.props.id!; }
  get nome(): string { return this.props.nome; }
  get cpf(): string { return this.props.cpf.value; }
  get telefone(): string { return this.props.telefone.value; }
  get email(): string { return this.props.email.value; }
  get dataNascimento(): Date { return this.props.dataNascimento; }
  get isAlunoUnipe(): boolean { return this.props.isAlunoUnipe; }
  get cursoUnipe(): string | undefined { return this.props.cursoUnipe; }

  public update(novosDados: Partial<Omit<AlunoProps, 'id' | 'cpf'>>) {
    this.props = { ...this.props, ...novosDados };
  }
}