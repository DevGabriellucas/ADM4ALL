import express, { Request, Response } from "express";
import cors from "cors";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";

export class ExpressAdapter {
  private app = express();

  constructor(private alunoUseCase: AlunoUseCase) {
    this.app.use(express.json());
    this.app.use(cors({ origin: "http://localhost:3000" }));
    this.configurarRotas();
  }

  private configurarRotas() {
    // Login
    this.app.post("/alunos/login", async (req: Request, res: Response) => {
      try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
          res.status(400).json({ erro: "Identificador e senha são obrigatórios." });
          return;
        }

        const aluno = await this.alunoUseCase.login(identifier, password);

        res.status(200).json({ 
          mensagem: "Login realizado com sucesso!",
          aluno: aluno.toJSON() 
        });

      } catch (error: any) {
        res.status(401).json({ erro: error.message });
      }
    });
    // Cadastrar Aluno
    this.app.post("/alunos", async (req: Request, res: Response) => {
      try {
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
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });
    // Recuperar senha
    this.app.post("/alunos/recuperar-senha", async (req: Request, res: Response) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          res.status(400).json({ erro: "O e-mail é obrigatório." });
          return;
        }

        await this.alunoUseCase.recuperarSenha(email);

        res.status(200).json({ 
          mensagem: "Se o e-mail estiver cadastrado, as instruções foram enviadas." 
        });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    // Listar Alunos
    this.app.get("/alunos", async (req: Request, res: Response) => {
      const alunos = await this.alunoUseCase.listar();
      res.json(alunos.map(a => a.toJSON()));
    });

    // Listar aluno por ID
    this.app.get("/alunos/:id", async (req: Request, res:Response) => {
      try{
        const { id } = req.params;
        if (!id || typeof id !== "string") {
          res.status(400).json({ erro: "O ID do aluno fornecido é inválido." });
          return;
        }
        const aluno = await this.alunoUseCase.buscarPorId(id);

        return res.json(aluno.toJSON());

      } catch (error:any) {
        res.status(400).json({ erro: error.message });
      }
    });

    // Atualizar Aluno
    this.app.put("/alunos/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // Validação ID
        if (!id || typeof id !== "string") {
          res.status(400).json({ erro: "O ID do aluno fornecido é inválido." });
          return;
        }

        const aluno = await this.alunoUseCase.atualizar(id, req.body);
        res.json({ id: aluno.id, nome: aluno.nome, mensagem: "Cadastro atualizado!" });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    //Deletar Aluno
    this.app.delete("/alunos/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // Validação ID
        if (!id || typeof id !== "string") {
          res.status(400).json({ erro: "O ID do aluno fornecido é inválido." });
          return;
        }

        await this.alunoUseCase.deletar(id);
        res.json({ mensagem: "Aluno removido com sucesso." });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });
  }

  public iniciar(porta: number) {
    this.app.listen(porta, () => {
      console.log(`Rodando na porta ${porta}`);
    });
  }
}