import { Aluno, AlunoProps } from "../../domain/entities/Aluno";
import { AlunoRepository } from "../../domain/repositories/AlunoRepository";


export class AlunoUseCase {
  constructor(private alunoRepository: AlunoRepository) {}

  // Cadastrar Aluno
  async cadastrar(dados: AlunoProps): Promise<Aluno> {
    const cpfExistente = await this.alunoRepository.buscarPorCpf(dados.cpf);
    if (cpfExistente) {
      throw new Error("Já existe um aluno cadastrado com este CPF.");
    }
    const novoAluno = new Aluno(dados);
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
}