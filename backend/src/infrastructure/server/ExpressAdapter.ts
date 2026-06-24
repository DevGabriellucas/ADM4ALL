import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";
import { InstrutorUseCase } from "../../application/use-cases/InstrutorUseCase";
import { JwtService, TokenPayload } from "../../application/security/JwtService";

type Perfil = "aluno" | "instrutor" | "coordenador" | "admin";

interface ArquivoUploadJson {
  nome: string;
  tipoMime: string;
  conteudoBase64: string;
}

export class ExpressAdapter {
  private app = express();
  private uploadsDir = path.resolve(process.cwd(), "uploads", "materiais");

  constructor(
    private authUseCase: AuthUseCase,
    private alunoUseCase: AlunoUseCase,
    private instrutorUseCase: InstrutorUseCase,
    private jwtService: JwtService,
  ) {
    this.app.use(express.json({ limit: "60mb" }));
    this.app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
    this.app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
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

  private autenticar(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;

    if (!token) {
      res.status(401).json({ erro: "Token de acesso nao informado." });
      return;
    }

    try {
      (req as Request & { usuario: TokenPayload }).usuario =
        this.jwtService.verificar(token);
      next();
    } catch (error: any) {
      res.status(401).json({ erro: error.message ?? "Token invalido." });
    }
  }

  private exigirPerfis(perfis: Perfil[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      this.autenticar(req, res, () => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!perfis.includes(usuario.perfil as Perfil)) {
          res.status(403).json({ erro: "Perfil sem permissao para esta rota." });
          return;
        }

        next();
      });
    };
  }

  private async salvarArquivoMaterial(
    arquivo: ArquivoUploadJson | null | undefined,
  ): Promise<{ urlArquivo: string | null; tamanhoBytes: number | null }> {
    if (!arquivo) {
      return { urlArquivo: null, tamanhoBytes: null };
    }

    const tiposPermitidos = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]);

    if (!tiposPermitidos.has(arquivo.tipoMime)) {
      throw new Error("Tipo de arquivo nao permitido.");
    }

    const conteudo = Buffer.from(arquivo.conteudoBase64, "base64");
    const limiteBytes = 50 * 1024 * 1024;

    if (conteudo.length === 0 || conteudo.length > limiteBytes) {
      throw new Error("O arquivo deve ter ate 50MB.");
    }

    await fs.mkdir(this.uploadsDir, { recursive: true });

    const extensaoOriginal = path.extname(arquivo.nome).toLowerCase();
    const extensao = extensaoOriginal.replace(/[^a-z0-9.]/g, "") || ".bin";
    const nomeArquivo = `${randomUUID()}${extensao}`;
    const destino = path.join(this.uploadsDir, nomeArquivo);

    await fs.writeFile(destino, conteudo);

    return {
      urlArquivo: `/uploads/materiais/${nomeArquivo}`,
      tamanhoBytes: conteudo.length,
    };
  }

  private configurarRotas() {
    this.app.post("/auth/login", async (req: Request, res: Response) => {
      try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
          res.status(400).json({ erro: "Identificador e senha sao obrigatorios." });
          return;
        }

        const resultado = await this.authUseCase.login(identifier, password);

        res.status(200).json(resultado);
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

    this.app.get(
      "/instrutores/:id/dashboard",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const usuario = (req as Request & { usuario: TokenPayload }).usuario;

          if (!id || typeof id !== "string") {
            res.status(400).json({ erro: "O ID do instrutor e invalido." });
            return;
          }

          if (usuario.perfil === "instrutor" && usuario.instrutorId !== id) {
            res.status(403).json({ erro: "Instrutor sem acesso a esta turma." });
            return;
          }

          const dashboard = await this.instrutorUseCase.obterDashboard(id);
          res.json(dashboard);
        } catch (error: any) {
          res.status(400).json({ erro: error.message });
        }
      },
    );

    this.app.post(
      "/turmas/:turmaId/presencas",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      async (req: Request, res: Response) => {
        try {
          const { turmaId } = req.params;
          const { aulaId, registros } = req.body;
          const usuario = (req as Request & { usuario: TokenPayload }).usuario;

          if (!turmaId || typeof turmaId !== "string") {
            res.status(400).json({ erro: "O ID da turma e invalido." });
            return;
          }

          if (usuario.perfil === "instrutor") {
            await this.instrutorUseCase.validarAcessoTurmaDoInstrutor(
              turmaId,
              usuario.instrutorId,
            );
          }

          await this.instrutorUseCase.registrarPresencas({
            turmaId,
            aulaId,
            registros,
          });

          res.status(200).json({ mensagem: "Presencas registradas com sucesso." });
        } catch (error: any) {
          res.status(400).json({ erro: error.message });
        }
      },
    );

    this.app.post(
      "/turmas/:turmaId/materiais",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      async (req: Request, res: Response) => {
        try {
          const { turmaId } = req.params;
          const { titulo, tipo, urlArquivo, tamanhoBytes, publicadoPorId, arquivo } =
            req.body;
          const usuario = (req as Request & { usuario: TokenPayload }).usuario;

          if (!turmaId || typeof turmaId !== "string") {
            res.status(400).json({ erro: "O ID da turma e invalido." });
            return;
          }

          if (usuario.perfil === "instrutor") {
            await this.instrutorUseCase.validarAcessoTurmaDoInstrutor(
              turmaId,
              usuario.instrutorId,
            );
          }

          const arquivoSalvo = await this.salvarArquivoMaterial(arquivo);

          const material = await this.instrutorUseCase.adicionarMaterial({
            turmaId,
            titulo,
            tipo,
            urlArquivo: arquivoSalvo.urlArquivo ?? urlArquivo,
            tamanhoBytes: arquivoSalvo.tamanhoBytes ?? tamanhoBytes,
            publicadoPorId: publicadoPorId ?? usuario.sub,
          });

          res.status(201).json(material);
        } catch (error: any) {
          res.status(400).json({ erro: error.message });
        }
      },
    );
  }

  public iniciar(porta: number) {
    this.app.listen(porta, () => {
      console.log(`Rodando na porta ${porta}`);
    });
  }
}
