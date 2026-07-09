import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { JwtService, TokenPayload } from "../../application/security/JwtService";
import { AlunoUseCase } from "../../application/use-cases/AlunoUseCase";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { ActivationUseCase } from "../../application/use-cases/ActivationUseCase";
import { ConfiguracoesUseCase } from "../../application/use-cases/ConfiguracoesUseCase";
import { CoordenadorUseCase } from "../../application/use-cases/CoordenadorUseCase";
import { InstrutorUseCase } from "../../application/use-cases/InstrutorUseCase";
import type {
  CertificadoDetalhe,
  FiltrosRelatorioCoordenador,
} from "../../domain/repositories/CoordenadorRepository";
import { getRequiredEnv } from "../config/env";
import { BadRequestError } from "../errors/BadRequestError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { asyncHandler } from "../middleware/asyncHandler";
import { errorMiddleware } from "../middleware/errorMiddleware";
import { gerarCertificadoPdf } from "../pdf/CertificatePdfService";
import {
  gerarRelatorioCsv,
  gerarRelatorioPdf,
} from "../reports/CoordinatorReportExportService";

type Perfil = "aluno" | "instrutor" | "coordenador" | "admin";

interface ArquivoUploadJson {
  nome: string;
  tipoMime: string;
  conteudoBase64: string;
}

const obterFiltrosRelatorio = (req: Request): FiltrosRelatorioCoordenador => {
  const filtros: FiltrosRelatorioCoordenador = {};
  if (typeof req.query.dataInicio === "string" && req.query.dataInicio) {
    filtros.dataInicio = req.query.dataInicio;
  }
  if (typeof req.query.dataFim === "string" && req.query.dataFim) {
    filtros.dataFim = req.query.dataFim;
  }
  if (typeof req.query.curso === "string" && req.query.curso) {
    filtros.curso = req.query.curso;
  }
  if (typeof req.query.turma === "string" && req.query.turma) {
    filtros.turma = req.query.turma;
  }
  return filtros;
};

// Remove o CPF do payload enviado ao frontend. O PDF continua usando o
// certificado completo (com cpfAluno) internamente, pois o CPF e parte do
// documento oficial. Apenas as respostas JSON sao sanitizadas.
const toPublicCertificadoDetalhe = (
  certificado: CertificadoDetalhe,
): Omit<CertificadoDetalhe, "cpfAluno"> => {
  const { cpfAluno: _cpfAluno, ...publico } = certificado;
  return publico;
};

export class ExpressAdapter {
  private app = express();
  private uploadsDir = path.resolve(process.cwd(), "uploads", "materiais");

  constructor(
    private authUseCase: AuthUseCase,
    private activationUseCase: ActivationUseCase,
    private alunoUseCase: AlunoUseCase,
    private instrutorUseCase: InstrutorUseCase,
    private coordenadorUseCase: CoordenadorUseCase,
    private configuracoeUseCase: ConfiguracoesUseCase,
    private jwtService: JwtService,
  ) {
    this.app.use(express.json({ limit: "60mb" }));
    this.app.use(cors({ origin: getRequiredEnv("FRONTEND_URL") }));
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
    this.app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });

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

        const cadastro = await this.alunoUseCase.cadastrar({
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
        const deveExporLinkAtivacao =
          !cadastro.emailEnviado &&
          (process.env.NODE_ENV !== "production" ||
            process.env.EXPOSE_ACTIVATION_LINK === "true");

        res.status(201).json({
          id: cadastro.aluno.id,
          nome: cadastro.aluno.nome,
          mensagem: cadastro.emailEnviado
            ? "Cadastro realizado. Verifique seu e-mail para ativar sua conta."
            : "Cadastro realizado, mas nao foi possivel enviar o e-mail de ativacao. Use o link abaixo para ativar a conta.",
          emailEnviado: cadastro.emailEnviado,
          linkAtivacao: deveExporLinkAtivacao
            ? cadastro.linkAtivacao
            : undefined,
        });
      }),
    );

    this.app.get(
      "/treinamentos/publicos",
      asyncHandler(async (_req: Request, res: Response) => {
        const cursos = await this.coordenadorUseCase.listarCursos();
        const cursosAtivos = cursos
          .filter((curso) => curso.status !== "encerrado")
          .map((curso) => ({
            id: curso.id,
            nome: curso.nome,
            descricao: curso.descricao,
            cargaHoraria: curso.cargaHoraria,
          }));

        res.status(200).json(cursosAtivos);
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
      "/alunos/me/materiais",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        const materiais = await this.alunoUseCase.listarMateriaisVisiveis(
          usuario.alunoId,
        );
        res.json({ materiais });
      }),
    );

    this.app.get(
      "/alunos/me/materiais/:materialId/download",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { materialId } = req.params as { materialId: string };
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        const material = await this.alunoUseCase.buscarMaterialParaDownload(
          usuario.alunoId,
          materialId,
        );

        if (!material) {
          res.status(404).json({ erro: "Material nao encontrado." });
          return;
        }

        if (!material.urlArquivo) {
          res
            .status(404)
            .json({ erro: "Material nao possui arquivo para download." });
          return;
        }

        if (
          material.urlArquivo.startsWith("http://") ||
          material.urlArquivo.startsWith("https://")
        ) {
          res.redirect(material.urlArquivo);
          return;
        }

        const uploadsBase = path.resolve(process.cwd(), "uploads", "materiais");
        const caminhoRelativo = material.urlArquivo.replace(
          /^\/uploads\/materiais\//,
          "",
        );
        const caminhoAbsoluto = path.resolve(uploadsBase, caminhoRelativo);

        if (!caminhoAbsoluto.startsWith(uploadsBase + path.sep)) {
          res.status(404).json({ erro: "Material nao encontrado." });
          return;
        }

        try {
          await fs.access(caminhoAbsoluto);
        } catch {
          res.status(404).json({ erro: "Arquivo do material nao encontrado." });
          return;
        }

        const extensao = path.extname(caminhoAbsoluto).toLowerCase();
        const nomeArquivo = `${material.titulo.replace(/[^a-zA-Z0-9_-]/g, "_")}${extensao}`;

        res.download(caminhoAbsoluto, nomeArquivo);
      }),
    );

    this.app.get(
      "/alunos/me/certificado/pdf",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        const { buffer, nomeArquivo } =
          await this.alunoUseCase.baixarCertificado(usuario.alunoId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${nomeArquivo}"`,
        );
        res.status(200).send(buffer);
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
        const {
          titulo,
          descricao,
          tipo,
          urlArquivo,
          tamanhoBytes,
          publicadoPorId,
          arquivo,
          aulaId,
          visibilidade,
        } = req.body;
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
          descricao,
          tipo,
          urlArquivo: arquivoSalvo.urlArquivo ?? urlArquivo,
          tamanhoBytes: arquivoSalvo.tamanhoBytes ?? tamanhoBytes,
          publicadoPorId: publicadoPorId ?? usuario.sub,
          aulaId: aulaId ?? null,
          visibilidade: visibilidade ?? "visivel",
        });

        res.status(201).json(material);
      }),
    );

    this.app.get(
      "/turmas/:turmaId/materiais",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId } = req.params;
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

        const materiais =
          await this.instrutorUseCase.listarMateriaisTurma(turmaId);
        res.json({ materiais });
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
      "/coordenador/frequencias",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const getQueryValue = (value: unknown) =>
          typeof value === "string" ? value : undefined;
        const curso = getQueryValue(req.query.curso);
        const turma = getQueryValue(req.query.turma);
        const aluno = getQueryValue(req.query.aluno);
        const periodo = getQueryValue(req.query.periodo);
        const frequencias = await this.coordenadorUseCase.listarFrequencias({
          ...(curso ? { curso } : {}),
          ...(turma ? { turma } : {}),
          ...(aluno ? { aluno } : {}),
          ...(periodo ? { periodo } : {}),
        });
        res.json(frequencias);
      }),
    );

    this.app.get(
      "/coordenador/certificados",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const certificados =
          await this.coordenadorUseCase.listarCertificados();
        res.json(certificados);
      }),
    );

    this.app.get(
      "/coordenador/certificados/:tipo/:referenciaId",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { tipo, referenciaId } = req.params as {
          tipo: string;
          referenciaId: string;
        };
        const certificado = await this.coordenadorUseCase.buscarCertificado(
          tipo,
          referenciaId,
        );
        res.json(toPublicCertificadoDetalhe(certificado));
      }),
    );

    this.app.get(
      "/coordenador/certificados/:tipo/:referenciaId/pdf",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { tipo, referenciaId } = req.params as {
          tipo: string;
          referenciaId: string;
        };
        const disposition =
          (req.query.disposition as string | undefined) === "inline"
            ? "inline"
            : "attachment";

        const certificado = await this.coordenadorUseCase.buscarCertificado(
          tipo,
          referenciaId,
        );
        const pdf = await gerarCertificadoPdf(certificado);
        const codigoSeguro = (certificado.codigo ?? "certificado").replace(
          /[^a-zA-Z0-9_-]/g,
          "-",
        );

        const fileName = `certificado-${tipo}-${codigoSeguro}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          disposition === "inline"
            ? "inline"
            : `attachment; filename="${fileName}"`,
        );
        res.status(200).send(pdf);
      }),
    );

    this.app.post(
      "/coordenador/certificados/alunos",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { matriculaId } = req.body ?? {};
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;
        const certificado =
          await this.coordenadorUseCase.emitirCertificadoAluno(
            matriculaId,
            usuario.sub,
          );
        res.status(201).json(toPublicCertificadoDetalhe(certificado));
      }),
    );

    this.app.patch(
      "/coordenador/certificados/:tipo/:id/cancelar",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { tipo, id } = req.params as { tipo: string; id: string };
        await this.coordenadorUseCase.cancelarCertificado(tipo, id);
        res.json({ mensagem: "Certificado cancelado com sucesso." });
      }),
    );

    this.app.get(
      "/coordenador/periodo-letivo",
      this.exigirPerfis(["coordenador", "admin", "instrutor", "aluno"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const periodo =
          await this.coordenadorUseCase.obterPeriodoLetivo();
        res.json(periodo);
      }),
    );

    this.app.patch(
      "/coordenador/periodo-letivo",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { periodoLetivo } = req.body ?? {};
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        const periodo =
          await this.coordenadorUseCase.atualizarPeriodoLetivo(
            periodoLetivo,
            usuario.sub,
          );
        res.json(periodo);
      }),
    );

    this.app.get(
      "/coordenador/relatorios",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const relatorios = await this.coordenadorUseCase.listarRelatorios();
        res.json({ relatorios });
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
      "/cursos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const curso = await this.coordenadorUseCase.buscarCursoPorId(id);
        res.json(curso);
      }),
    );

    this.app.get(
      "/cursos/:id/turmas",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const turmas = await this.coordenadorUseCase.listarTurmasPorCurso(id);
        res.json(turmas);
      }),
    );

    this.app.patch(
      "/cursos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { nome, descricao, cargaHoraria, status } = req.body;

        const curso = await this.coordenadorUseCase.atualizarCurso(id, {
          nome,
          descricao,
          cargaHoraria: Number(cargaHoraria),
          status,
        });

        res.json(curso);
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

    this.app.get(
      "/coordenador/instrutores/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const instrutor =
          await this.coordenadorUseCase.buscarInstrutorDetalhe(id);
        res.json(instrutor);
      }),
    );

    this.app.patch(
      "/coordenador/instrutores/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { nome, email, telefone, areaAtuacao, formacao } =
          req.body ?? {};
        const instrutor = await this.coordenadorUseCase.atualizarInstrutor(id, {
          nome,
          email,
          telefone,
          areaAtuacao,
          formacao,
        });
        res.json(instrutor);
      }),
    );

    this.app.patch(
      "/coordenador/instrutores/:id/status",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { statusConta } = req.body ?? {};
        const instrutor =
          await this.coordenadorUseCase.atualizarStatusInstrutor(
            id,
            statusConta,
          );
        res.json(instrutor);
      }),
    );

    this.app.post(
      "/coordenador/instrutores/:id/reenviar-ativacao",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        await this.coordenadorUseCase.reenviarAtivacaoInstrutor(id);
        res.json({ mensagem: "Link de ativacao reenviado com sucesso." });
      }),
    );

    this.app.get(
      "/coordenador/relatorios/:tipo/pdf",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { tipo } = req.params as { tipo: string };
        const filtros = obterFiltrosRelatorio(req);
        const relatorio = await this.coordenadorUseCase.obterRelatorioFiltrado(
          tipo,
          filtros,
        );
        const pdf = await gerarRelatorioPdf(relatorio, filtros);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="relatorio-${tipo}.pdf"`,
        );
        res.status(200).send(pdf);
      }),
    );

    this.app.get(
      "/coordenador/relatorios/:tipo/csv",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { tipo } = req.params as { tipo: string };
        const filtros = obterFiltrosRelatorio(req);
        const relatorio = await this.coordenadorUseCase.obterRelatorioFiltrado(
          tipo,
          filtros,
        );
        const csv = gerarRelatorioCsv(relatorio, filtros);

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="relatorio-${tipo}.csv"`,
        );
        res.status(200).send(csv);
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
      "/coordenador/usuarios",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const usuarios = await this.coordenadorUseCase.listarUsuarios();
        res.json(usuarios);
      }),
    );

    this.app.patch(
      "/coordenador/usuarios/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { nome, email, cpf } = req.body ?? {};

        const usuario = await this.coordenadorUseCase.atualizarUsuario(id, {
          nome,
          email,
          cpf,
        });

        res.json(usuario);
      }),
    );

    this.app.post(
      "/coordenador/coordenadores",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { nome, email, cpf, telefone, areaCoordenacao } = req.body;

        const convite = await this.coordenadorUseCase.convidarCoordenador({
          nome,
          email,
          cpf,
          telefone,
          areaCoordenacao,
        });

        res.status(201).json({
          id: convite.instrutorId,
          nome: convite.nome,
          mensagem: "Convite de ativacao enviado por e-mail.",
        });
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

    this.app.post(
      "/coordenador/alunos/:id/reenviar-ativacao",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        await this.coordenadorUseCase.reenviarAtivacao(id);
        res.json({ mensagem: "Link de ativacao reenviado com sucesso." });
      }),
    );

    this.app.patch(
      "/coordenador/matriculas/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { status } = req.body ?? {};
        const matricula =
          await this.coordenadorUseCase.atualizarStatusMatricula(id, status);
        res.json(matricula);
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
          instrutores,
          periodoLetivo,
          horarios,
          limiteAlunos,
          status,
        } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        const turma = await this.coordenadorUseCase.criarTurma({
          curso,
          nome,
          instrutores: Array.isArray(instrutores) ? instrutores : [],
          periodoLetivo,
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

    this.app.patch(
      "/turmas/:turmaId/materiais/:materialId",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId, materialId } = req.params as {
          turmaId: string;
          materialId: string;
        };
        const { visibilidade } = req.body ?? {};
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

        const material =
          await this.instrutorUseCase.atualizarMaterialVisibilidade(
            materialId,
            turmaId,
            visibilidade,
          );

        res.status(200).json(material);
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

    this.app.patch(
      "/turmas/:turmaId/aulas/:aulaId",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { turmaId, aulaId } = req.params as {
          turmaId: string;
          aulaId: string;
        };
        const { titulo, data, horaInicio, horaFim, status } = req.body ?? {};
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

        const aula = await this.instrutorUseCase.atualizarAula({
          turmaId,
          aulaId,
          titulo,
          data,
          horaInicio,
          horaFim,
          status,
        });

        res.status(200).json(aula);
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

    this.app.patch(
      "/turmas/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { nome, curso, instrutores, periodoLetivo, capacidade, status } = req.body;

        const turma = await this.coordenadorUseCase.atualizarTurma(id, {
          nome,
          curso,
          instrutores: Array.isArray(instrutores) ? instrutores : [],
          periodoLetivo,
          capacidade: Number(capacidade),
          status,
        });

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

    // Configurações do sistema
    this.app.get(
      "/configuracoes",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const configuracoes = await this.configuracoeUseCase.obter();
        res.status(200).json(configuracoes);
      }),
    );

    this.app.patch(
      "/configuracoes/instituicao",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { nome, email, telefone, cidade, uf } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        await this.configuracoeUseCase.atualizarInstituicao(
          { nome, email, telefone, cidade, uf },
          usuario.coordenadorId || usuario.sub,
        );

        res.status(200).json({ mensagem: "Dados da instituição atualizados com sucesso." });
      }),
    );

    this.app.patch(
      "/configuracoes/periodo-letivo",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { valor } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        await this.configuracoeUseCase.atualizarPeriodoLetivo(
          valor,
          usuario.coordenadorId || usuario.sub,
        );

        res.status(200).json({ mensagem: "Período letivo atualizado com sucesso." });
      }),
    );

    this.app.patch(
      "/configuracoes/certificado",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { maximoFaltas, apenasEncerrada } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        await this.configuracoeUseCase.atualizarRegrassCertificado(
          { maximoFaltas, apenasEncerrada },
          usuario.coordenadorId || usuario.sub,
        );

        res.status(200).json({ mensagem: "Regras de certificado atualizadas com sucesso." });
      }),
    );

    this.app.patch(
      "/configuracoes/preferencias",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { capacidadePadrao, statusPadrao, nomeExibido } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        await this.configuracoeUseCase.atualizarPreferenciasGerais(
          { capacidadePadrao, statusPadrao, nomeExibido },
          usuario.coordenadorId || usuario.sub,
        );

        res.status(200).json({ mensagem: "Preferências atualizadas com sucesso." });
      }),
    );
  }

  public iniciar(porta: number) {
    this.app.listen(porta, () => {
      console.info(`Rodando na porta ${porta}`);
    });
  }
}
