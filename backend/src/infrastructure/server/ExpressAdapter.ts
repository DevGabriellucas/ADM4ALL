import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { JwtService, TokenPayload } from "../../application/security/JwtService";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { ActivationUseCase } from "../../application/use-cases/ActivationUseCase";
import { CoordenadorUseCase } from "../../application/use-cases/CoordenadorUseCase";
import { InstrutorUseCase } from "../../application/use-cases/InstrutorUseCase";
import { BadRequestError } from "../errors/BadRequestError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { asyncHandler } from "../middleware/asyncHandler";
import { errorMiddleware } from "../middleware/errorMiddleware";

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
    private activationUseCase: ActivationUseCase,
    private alunoUseCase: AlunoUseCase,
    private instrutorUseCase: InstrutorUseCase,
    private coordenadorUseCase: CoordenadorUseCase,
    private jwtService: JwtService,
  ) {
    this.app.use(express.json({ limit: "60mb" }));
    this.app.use(
      cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }),
    );
    this.app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
    this.configurarRotas();
    this.app.use(errorMiddleware);
  }

  private exigirApiKey(req: Request, _res: Response, next: NextFunction) {
    const apiKeyEsperada = process.env.ADMIN_API_KEY;

    if (!apiKeyEsperada) {
      next(new BadRequestError("ADMIN_API_KEY nao configurada."));
      return;
    }

    if (req.header("x-api-key") !== apiKeyEsperada) {
      next(new UnauthorizedError("Nao autorizado."));
      return;
    }

    next();
  }

  private autenticar(req: Request, _res: Response, next: NextFunction) {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;

    if (!token) {
      next(new UnauthorizedError("Token de acesso nao informado."));
      return;
    }

    try {
      (req as Request & { usuario: TokenPayload }).usuario =
        this.jwtService.verificar(token);
      next();
    } catch (error: any) {
      next(new UnauthorizedError(error.message ?? "Token invalido."));
    }
  }

  private exigirPerfis(perfis: Perfil[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      this.autenticar(req, res, (erro?: unknown) => {
        if (erro) {
          next(erro as Error);
          return;
        }

        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!perfis.includes(usuario.perfil as Perfil)) {
          next(new UnauthorizedError("Perfil sem permissao para esta rota."));
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
      throw new BadRequestError("Tipo de arquivo nao permitido.");
    }

    const conteudo = Buffer.from(arquivo.conteudoBase64, "base64");
    const limiteBytes = 50 * 1024 * 1024;

    if (conteudo.length === 0 || conteudo.length > limiteBytes) {
      throw new BadRequestError("O arquivo deve ter ate 50MB.");
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

  private async salvarAvatarInstrutor(
    arquivo: ArquivoUploadJson,
  ): Promise<string> {
    const tiposPermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (!tiposPermitidos.has(arquivo.tipoMime)) {
      throw new BadRequestError("Envie uma imagem em JPG, PNG ou WEBP.");
    }

    const conteudo = Buffer.from(arquivo.conteudoBase64, "base64");
    const limiteBytes = 5 * 1024 * 1024;

    if (conteudo.length === 0 || conteudo.length > limiteBytes) {
      throw new BadRequestError("A foto deve ter ate 5MB.");
    }

    const avataresDir = path.resolve(process.cwd(), "uploads", "avatares");
    await fs.mkdir(avataresDir, { recursive: true });

    const extensaoOriginal = path.extname(arquivo.nome).toLowerCase();
    const extensao = extensaoOriginal.replace(/[^a-z0-9.]/g, "") || ".jpg";
    const nomeArquivo = `${randomUUID()}${extensao}`;
    const destino = path.join(avataresDir, nomeArquivo);

    await fs.writeFile(destino, conteudo);

    return `/uploads/avatares/${nomeArquivo}`;
  }

  private configurarRotas() {
    this.app.get(
      "/auth/ativacoes/:token",
      asyncHandler(async (req: Request, res: Response) => {
        const token = Array.isArray(req.params.token)
          ? req.params.token[0]
          : req.params.token;
        const ativacao = await this.activationUseCase.validar(token ?? "");
        res.status(200).json(ativacao);
      }),
    );

    this.app.post(
      "/auth/ativacoes/:token",
      asyncHandler(async (req: Request, res: Response) => {
        const token = Array.isArray(req.params.token)
          ? req.params.token[0]
          : req.params.token;
        await this.activationUseCase.confirmar(token ?? "", req.body ?? {});
        res.status(200).json({ mensagem: "Conta ativada com sucesso." });
      }),
    );

    this.app.post(
      "/auth/login",
      asyncHandler(async (req: Request, res: Response) => {
        const { identifier, password } = req.body ?? {};

        if (!identifier || !password) {
          throw new BadRequestError("Identificador e senha sao obrigatorios.");
        }

        const resultado = await this.authUseCase.login(identifier, password);
        res.status(200).json(resultado);
      }),
    );

    this.app.post(
      "/alunos",
      asyncHandler(async (req: Request, res: Response) => {
        const {
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
          mensagem:
            "Cadastro realizado. Verifique seu e-mail para ativar sua conta.",
        });
      }),
    );

    this.app.post(
      "/auth/recuperar-senha",
      asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;

        if (!email) {
          throw new BadRequestError("O e-mail e obrigatorio.");
        }

        await this.alunoUseCase.recuperarSenha(email, {
          ipSolicitante: req.ip,
          userAgent: req.get("user-agent"),
        });

        res.status(200).json({
          mensagem: "Se o e-mail estiver cadastrado, as instrucoes foram enviadas.",
        });
      }),
    );

    this.app.post(
      "/auth/redefinir-senha",
      asyncHandler(async (req: Request, res: Response) => {
        const { token, novaSenha } = req.body;

        if (!token || !novaSenha) {
          throw new BadRequestError("Token e nova senha sao obrigatorios.");
        }

        await this.alunoUseCase.redefinirSenha(token, novaSenha);

        res.status(200).json({ mensagem: "Senha redefinida com sucesso." });
      }),
    );

    this.app.get(
      "/alunos/me/dashboard",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        const dashboard = await this.alunoUseCase.obterDashboard(
          usuario.alunoId,
        );
        res.json(dashboard);
      }),
    );

    this.app.get(
      "/alunos",
      this.exigirApiKey,
      asyncHandler(async (_req: Request, res: Response) => {
        const alunos = await this.alunoUseCase.listar();
        res.json(alunos.map((aluno) => aluno.toJSON()));
      }),
    );

    this.app.get(
      "/alunos/:id",
      this.exigirApiKey,
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do aluno fornecido e invalido.");
        }

        const aluno = await this.alunoUseCase.buscarPorId(id);
        res.json(aluno.toJSON());
      }),
    );

    this.app.put(
      "/alunos/:id",
      this.exigirApiKey,
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do aluno fornecido e invalido.");
        }

        const aluno = await this.alunoUseCase.atualizar(id, req.body);
        res.json({
          id: aluno.id,
          nome: aluno.nome,
          mensagem: "Cadastro atualizado!",
        });
      }),
    );

    this.app.delete(
      "/alunos/:id",
      this.exigirApiKey,
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do aluno fornecido e invalido.");
        }

        await this.alunoUseCase.deletar(id);
        res.json({ mensagem: "Aluno removido com sucesso." });
      }),
    );

    this.app.get(
      "/instrutores/:id/dashboard",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do instrutor e invalido.");
        }

        if (usuario.perfil === "instrutor" && usuario.instrutorId !== id) {
          throw new UnauthorizedError("Instrutor sem acesso a esta turma.");
        }

        const dashboard = await this.instrutorUseCase.obterDashboard(id);
        res.json(dashboard);
      }),
    );

    this.app.post(
      "/turmas/:turmaId/presencas",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId } = req.params;
        const { aulaId, registros } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!turmaId || typeof turmaId !== "string") {
          throw new BadRequestError("O ID da turma e invalido.");
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
      }),
    );

    this.app.post(
      "/turmas/:turmaId/materiais",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId } = req.params;
        const { titulo, tipo, urlArquivo, tamanhoBytes, publicadoPorId, arquivo } =
          req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!turmaId || typeof turmaId !== "string") {
          throw new BadRequestError("O ID da turma e invalido.");
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
      }),
    );

    this.app.post(
      "/auth/ativar-conta",
      asyncHandler(async (req: Request, res: Response) => {
        const { token, novaSenha } = req.body ?? {};

        if (!token) {
          throw new BadRequestError("O token de ativacao e obrigatorio.");
        }

        await this.activationUseCase.confirmar(token, {
          senha: novaSenha,
          confirmarSenha: novaSenha,
        });
        res.status(200).json({ mensagem: "Conta ativada com sucesso." });
      }),
    );

    this.app.get(
      "/coordenador/dashboard",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const dashboard = await this.coordenadorUseCase.obterDashboard();
        res.json(dashboard);
      }),
    );

    this.app.get(
      "/cursos",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const cursos = await this.coordenadorUseCase.listarCursos();
        res.json(cursos);
      }),
    );

    this.app.post(
      "/cursos",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { nome, descricao, cargaHoraria, status } = req.body;

        const curso = await this.coordenadorUseCase.criarCurso({
          nome,
          descricao,
          cargaHoraria: Number(cargaHoraria),
          status,
        });

        res.status(201).json(curso);
      }),
    );

    this.app.get(
      "/instrutores",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const instrutores = await this.coordenadorUseCase.listarInstrutores();
        res.json(instrutores);
      }),
    );

    this.app.post(
      "/instrutores",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { nome, email, cpf, telefone } = req.body;

        const convite = await this.coordenadorUseCase.convidarInstrutor({
          nome,
          email,
          cpf,
          telefone,
        });

        res.status(201).json({
          id: convite.instrutorId,
          nome: convite.nome,
          mensagem: "Convite de ativacao enviado por e-mail.",
        });
      }),
    );

    this.app.post(
      "/alunos/convites",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const convite = await this.coordenadorUseCase.convidarAluno(
          req.body ?? {},
        );
        res.status(201).json({
          id: convite.instrutorId,
          nome: convite.nome,
          mensagem: "Convite de ativacao enviado por e-mail.",
        });
      }),
    );

    this.app.get(
      "/coordenador/alunos",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const alunos = await this.coordenadorUseCase.listarAlunos();
        res.json(alunos);
      }),
    );

    this.app.get(
      "/coordenador/alunos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const aluno = await this.coordenadorUseCase.buscarAlunoDetalhe(id);
        res.json(aluno);
      }),
    );

    this.app.patch(
      "/coordenador/alunos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { nome, email, telefone, statusConta } = req.body ?? {};
        const aluno = await this.coordenadorUseCase.atualizarAluno(id, {
          nome,
          email,
          telefone,
          statusConta,
        });
        res.json(aluno);
      }),
    );

    this.app.get(
      "/turmas",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const turmas = await this.coordenadorUseCase.listarTurmas();
        res.json(turmas);
      }),
    );

    this.app.post(
      "/turmas",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const {
          curso,
          nome,
          instrutor,
          dataInicio,
          dataTermino,
          horarios,
          limiteAlunos,
          status,
        } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        const turma = await this.coordenadorUseCase.criarTurma({
          curso,
          nome,
          instrutor,
          dataInicio,
          dataTermino,
          horario: horarios,
          limiteAlunos: Number(limiteAlunos),
          status,
          coordenadorId: usuario.coordenadorId,
        });

        res.status(201).json(turma);
      }),
    );

    this.app.post(
      "/turmas/:turmaId/matriculas",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId } = req.params as { turmaId: string };
        const { alunoId } = req.body ?? {};
        const matricula = await this.coordenadorUseCase.vincularAlunoTurma(
          turmaId,
          alunoId,
        );
        res.status(201).json(matricula);
      }),
    );

    this.app.delete(
      "/turmas/:turmaId/matriculas/:matriculaId",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId, matriculaId } = req.params as {
          turmaId: string;
          matriculaId: string;
        };
        await this.coordenadorUseCase.cancelarMatricula(
          turmaId,
          matriculaId,
        );
        res.json({ mensagem: "Matricula cancelada com sucesso." });
      }),
    );

    this.app.delete(
      "/turmas/:turmaId/materiais/:materialId",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId, materialId } = req.params as {
          turmaId: string;
          materialId: string;
        };
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!turmaId || !materialId) {
          throw new BadRequestError("Turma e material sao obrigatorios.");
        }

        if (usuario.perfil === "instrutor") {
          await this.instrutorUseCase.validarAcessoTurmaDoInstrutor(
            turmaId,
            usuario.instrutorId,
          );
        }

        await this.instrutorUseCase.removerMaterial(materialId, turmaId);

        res.status(200).json({ mensagem: "Material removido com sucesso." });
      }),
    );

    this.app.post(
      "/turmas/:turmaId/aulas",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId } = req.params;
        const { titulo, data, horaInicio, horaFim } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!turmaId || typeof turmaId !== "string") {
          throw new BadRequestError("O ID da turma e invalido.");
        }

        if (usuario.perfil === "instrutor") {
          await this.instrutorUseCase.validarAcessoTurmaDoInstrutor(
            turmaId,
            usuario.instrutorId,
          );
        }

        const aula = await this.instrutorUseCase.adicionarAula({
          turmaId,
          titulo,
          data,
          horaInicio: horaInicio ?? null,
          horaFim: horaFim ?? null,
        });

        res.status(201).json(aula);
      }),
    );

    this.app.delete(
      "/turmas/:turmaId/aulas/:aulaId",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId, aulaId } = req.params as {
          turmaId: string;
          aulaId: string;
        };
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!turmaId || !aulaId) {
          throw new BadRequestError("Turma e aula sao obrigatorias.");
        }

        if (usuario.perfil === "instrutor") {
          await this.instrutorUseCase.validarAcessoTurmaDoInstrutor(
            turmaId,
            usuario.instrutorId,
          );
        }

        await this.instrutorUseCase.removerAula(aulaId, turmaId);

        res.status(200).json({ mensagem: "Aula removida com sucesso." });
      }),
    );

    this.app.get(
      "/turmas/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const turma = await this.coordenadorUseCase.buscarTurmaDetalhe(id);
        res.json(turma);
      }),
    );

    this.app.get(
      "/turmas/:turmaId/aulas/:aulaId/presencas",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId, aulaId } = req.params as {
          turmaId: string;
          aulaId: string;
        };
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!turmaId || !aulaId) {
          throw new BadRequestError("Turma e aula sao obrigatorias.");
        }

        if (usuario.perfil === "instrutor") {
          await this.instrutorUseCase.validarAcessoTurmaDoInstrutor(
            turmaId,
            usuario.instrutorId,
          );
        }

        const alunos = await this.instrutorUseCase.obterPresencasPorAula(
          turmaId,
          aulaId,
        );

        res.json({ alunos });
      }),
    );

    this.app.post(
      "/instrutores/:id/avatar",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { arquivo } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do instrutor e invalido.");
        }

        if (usuario.perfil === "instrutor" && usuario.instrutorId !== id) {
          throw new UnauthorizedError(
            "Instrutor sem permissao para alterar este perfil.",
          );
        }

        if (!arquivo) {
          throw new BadRequestError("Envie uma foto.");
        }

        const avatarUrl = await this.salvarAvatarInstrutor(arquivo);
        await this.instrutorUseCase.atualizarAvatar(id, avatarUrl);

        res.status(200).json({ avatarUrl });
      }),
    );
  }

  public iniciar(porta: number) {
    this.app.listen(porta, () => {
      console.log(`Rodando na porta ${porta}`);
    });
  }
}
