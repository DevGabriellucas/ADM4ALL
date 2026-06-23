import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";

export class ExpressAdapter {
  private app = express();

  constructor(private alunoUseCase: AlunoUseCase) {
    this.app.use(express.json({ limit: "1mb" }));
    this.app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
    this.configurarRotas();
  }

  private exigirApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKeyEsperada = process.env.ADMIN_API_KEY;

    if (!apiKeyEsperada) {
      res.status(500).json({ erro: "ADMIN_API_KEY nao configurada." });
      return;
    }

    if (req.header("x-api-key") !== apiKeyEsperada) {
      res.status(401).json({ erro: "Nao autorizado." });
      return;
    }

    next();
  }

  private configurarRotas() {
    this.app.post("/auth/login", async (req: Request, res: Response) => {
      try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
          res.status(400).json({ erro: "Identificador e senha sao obrigatorios." });
          return;
        }

        const aluno = await this.alunoUseCase.login(identifier, password);

        res.status(200).json({
          mensagem: "Login realizado com sucesso!",
          aluno: aluno.toJSON(),
        });
      } catch (error: any) {
        res.status(401).json({ erro: error.message });
      }
    });

    this.app.post("/alunos", async (req: Request, res: Response) => {
      try {
        const {
          nome, cpf, telefone, email, dataNascimento,
          senha, treinamento, isAlunoUnipe, rgm, cursoUnipe,
        } = req.body;

        const aluno = await this.alunoUseCase.cadastrar({
          nome,
          cpf,
          telefone,
          email,
          dataNascimento,
          senha,
          treinamento,
          isAlunoUnipe,
          rgm,
          cursoUnipe,
        });

        res.status(201).json({
          id: aluno.id,
          nome: aluno.nome,
          mensagem: "Aluno cadastrado com sucesso!",
        });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    this.app.post("/auth/recuperar-senha", async (req: Request, res: Response) => {
      try {
        const { email } = req.body;

        if (!email) {
          res.status(400).json({ erro: "O e-mail e obrigatorio." });
          return;
        }

        await this.alunoUseCase.recuperarSenha(email, {
          ipSolicitante: req.ip,
          userAgent: req.get("user-agent"),
        });

        res.status(200).json({
          mensagem: "Se o e-mail estiver cadastrado, as instrucoes foram enviadas.",
        });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    this.app.get("/alunos", this.exigirApiKey, async (req: Request, res: Response) => {
      try {
        const alunos = await this.alunoUseCase.listar();
        res.json(alunos.map(a => a.toJSON()));
      } catch (error: any) {
        res.status(500).json({ erro: error.message });
      }
    });

    this.app.get("/alunos/:id", this.exigirApiKey, async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
          res.status(400).json({ erro: "O ID do aluno fornecido e invalido." });
          return;
        }

        const aluno = await this.alunoUseCase.buscarPorId(id);
        return res.json(aluno.toJSON());
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    this.app.put("/alunos/:id", this.exigirApiKey, async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
          res.status(400).json({ erro: "O ID do aluno fornecido e invalido." });
          return;
        }

        const aluno = await this.alunoUseCase.atualizar(id, req.body);
        res.json({ id: aluno.id, nome: aluno.nome, mensagem: "Cadastro atualizado!" });
      } catch (error: any) {
        res.status(400).json({ erro: error.message });
      }
    });

    this.app.delete("/alunos/:id", this.exigirApiKey, async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
          res.status(400).json({ erro: "O ID do aluno fornecido e invalido." });
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
