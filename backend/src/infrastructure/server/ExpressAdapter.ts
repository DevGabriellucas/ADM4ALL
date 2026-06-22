import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";
import { asyncHandler } from "../middleware/asyncHandler";
import { errorMiddleware } from "../middleware/errorMiddleware";

export class ExpressAdapter {
  private app = express();

  constructor(private alunoUseCase: AlunoUseCase) {
    this.app.use(express.json());
    this.app.use(cors({ origin: "http://localhost:3000" }));
    this.configurarRotas();
    this.app.use(errorMiddleware);
  }

  private configurarRotas() {
    // Login
    this.app.post("/auth/login", asyncHandler(async (req: Request, res: Response) => {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        throw { status: 400, message: "Identificador e senha são obrigatórios." };
      }

      try {
        const aluno = await this.alunoUseCase.login(identifier, password);
        res.status(200).json({ 
          mensagem: "Login realizado com sucesso!",
          aluno: aluno.toJSON() 
        });
      } catch (error: any) {
        throw { status: 401, message: error.message };
      }
    }));
    
    // Cadastrar Aluno
    this.app.post("/alunos", asyncHandler(async (req: Request, res: Response) => {
      const {
          nome, cpf, telefone, email, dataNascimento,
          senha, treinamento, isAlunoUnipe, rgm, cursoUnipe 
        } = req.body;

      const aluno = await this.alunoUseCase.cadastrar({
        nome, cpf, telefone, email,
        dataNascimento: new Date(dataNascimento), senha, treinamento,
        isAlunoUnipe, rgm, cursoUnipe
      });
      res.status(201).json({ id: aluno.id, nome: aluno.nome, mensagem: "Aluno cadastrado com sucesso!" });
    }));
    
    // Recuperar senha
    this.app.post("/auth/recuperar-senha", asyncHandler(async (req: Request, res: Response) => {
      const { email } = req.body;
      
      if (!email) {
        throw { status: 400, message: "O e-mail é obrigatório." };
      }

      await this.alunoUseCase.recuperarSenha(email);

      res.status(200).json({ 
        mensagem: "Se o e-mail estiver cadastrado, as instruções foram enviadas." 
      });
    }));

    // Listar Alunos
    this.app.get("/alunos", asyncHandler(async (req: Request, res: Response) => {
      const alunos = await this.alunoUseCase.listar();
      res.json(alunos.map(a => a.toJSON()));
    }));

    // Listar aluno por ID
    this.app.get("/alunos/:id", asyncHandler(async (req: Request, res:Response) => {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        throw { status: 400, message: "O ID do aluno fornecido é inválido." };
      }
      const aluno = await this.alunoUseCase.buscarPorId(id);
      return res.json(aluno.toJSON());
    }));

    // Atualizar Aluno
    this.app.put("/alunos/:id", asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;

      // Validação ID
      if (!id || typeof id !== "string") {
        throw { status: 400, message: "O ID do aluno fornecido é inválido." };
      }

      const aluno = await this.alunoUseCase.atualizar(id, req.body);
      res.json({ id: aluno.id, nome: aluno.nome, mensagem: "Cadastro atualizado!" });
    }));

    //Deletar Aluno
    this.app.delete("/alunos/:id", asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;

      // Validação ID
      if (!id || typeof id !== "string") {
        throw { status: 400, message: "O ID do aluno fornecido é inválido." };
      }

      await this.alunoUseCase.deletar(id);
      res.json({ mensagem: "Aluno removido com sucesso." });
    }));
  }

  public iniciar(porta: number) {
    this.app.listen(porta, () => {
      console.log(`Rodando na porta ${porta}`);
    });
  }
}
