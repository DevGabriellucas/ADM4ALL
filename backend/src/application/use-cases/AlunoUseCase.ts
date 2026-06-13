import { Aluno, AlunoProps } from "../../domain/entities/Aluno";
import { AlunoRepository } from "../../domain/repositories/AlunoRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import bcrypt from "bcrypt";
export interface CadastrarAlunoInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: Date;
  isAlunoUnipe: boolean;
  cursoUnipe?: string;
  senha: string;        
  treinamento: string;   
  rgm?: string;          
}

export class AlunoUseCase {
  constructor(private alunoRepository: AlunoRepository) {}

  async login(identificador: string, senhaBruta: string): Promise<Aluno> {
    let idLimpo = identificador.trim().toLowerCase();
    const aluno = await this.alunoRepository.buscarPorEmailOuCpf(idLimpo);

    if (!idLimpo.includes("@")) {
      idLimpo = idLimpo.replace(/\D/g, "");
    }
    if (!aluno) {
      throw new Error("Credenciais inválidas.");
    }
    const senhaCorreta = await bcrypt.compare(senhaBruta, aluno.senha);
    
    if (!senhaCorreta) {
      throw new Error("Credenciais inválidas.");
    }
    return aluno;
  }

  async cadastrar(dados: CadastrarAlunoInput): Promise<Aluno> {
    const cpfVo = new Cpf(dados.cpf);
    const telefoneVo = new Telefone(dados.telefone);
    const emailVo = new Email(dados.email);

    const cpfExistente = await this.alunoRepository.buscarPorCpf(cpfVo.value);
    if (cpfExistente) {
      throw new Error("Já existe um aluno cadastrado com este CPF.");
    }

    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(dados.senha, saltRounds);

    const novoAluno = new Aluno({
      ...dados,
      cpf: cpfVo,
      telefone: telefoneVo,
      email: emailVo,
      senha: senhaCriptografada
    });

    return await this.alunoRepository.cadastrar(novoAluno);
  }

  // Listar alunos
  async listar(): Promise<Aluno[]> {
    return await this.alunoRepository.listarTodos();
  }

  // Buscar aluno por ID
  async buscarPorId(id: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.buscarPorId(id);
    if (!aluno) throw new Error("Aluno não encontrado.");
    return aluno;
  }

  // Atualizar dados do aluno
  async atualizar(id: string, dadosAtualizados: Partial<AlunoProps>): Promise<Aluno> {
    const aluno = await this.buscarPorId(id);
    aluno.update(dadosAtualizados);
    return await this.alunoRepository.atualizar(aluno);
  }

  // Deletar aluno
  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id); // Garante que existe antes de deletar
    await this.alunoRepository.deletar(id);
  }

  async recuperarSenha(emailBruto: string): Promise<void> {

    const emailVo = new Email(emailBruto); 
    const aluno = await this.alunoRepository.buscarPorEmail(emailVo.value);

    if (!aluno) {
      return; 
    }

    const tokenDeRecuperacao = crypto.randomUUID();

    console.log(`Para: ${aluno.email}`);
    console.log(`Assunto: Recuperação de Senha - ADM Para Todos`);
    console.log(`Link: http://localhost:3000/redefinir-senha?token=${tokenDeRecuperacao}\n`);
  }
}