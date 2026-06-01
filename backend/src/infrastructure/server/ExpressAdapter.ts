import express, { Request, Response } from "express";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";

export class ExpressAdapter {
  private app = express();

  constructor(private alunoUseCase: AlunoUseCase) {
    this.app.use(express.json());
    this.configurarRotas();
  }

  private configurarRotas() {
    // Cadastrar Aluno
    this.app.post("/alunos", async (req: Request, res: Response) => {
      try {
        const { nome, cpf, telefone, email, dataNascimento, isAlunoUnipe, cursoUnipe } = req.body;
        const aluno = await this.alunoUseCase.cadastrar({
          nome, cpf, telefone, email,
          dataNascimento: new Date(dataNascimento),
          isAlunoUnipe, cursoUnipe
        });
        res.status(201).json({ id: aluno.id, nome: aluno.nome, mensagem: "Aluno cadastrado com sucesso!" });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    // Listar Alunos
    this.app.get("/alunos", async (req: Request, res: Response) => {
      const alunos = await this.alunoUseCase.listar();
      const resposta = alunos.map(a => ({
        id: a.id, nome: a.nome, cpf: a.cpf, email: a.email, cursoUnipe: a.cursoUnipe
      }));
      res.json(resposta);
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

        return res.json({
            id: aluno.id,
            ...aluno['props']
          });

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