import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { JwtService, TokenPayload } from "../../application/security/JwtService";
import { normalizarPaginacao } from "../../domain/paginacao";

// Query string entrega string, string[] ou undefined. So texto simples serve
// como filtro; o resto vira "sem filtro".
const textoDaQuery = (valor: unknown): string | null =>
  typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
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
import {
  getAvataresUploadsDir,
  getMateriaisUploadsDir,
  getUploadsDir,
} from "../config/storage";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { asyncHandler } from "../middleware/asyncHandler";
import { errorMiddleware } from "../middleware/errorMiddleware";
import { gerarCertificadoPdf } from "../pdf/CertificatePdfService";
import {
  gerarRelatorioCsv,
  gerarRelatorioPdf,
} from "../reports/CoordinatorReportExportService";
import { resolveRelatorioPathOrThrow } from "../storage/relatoriosStorage";

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

const criarCorsOptions = () => {
  const frontendUrl = getRequiredEnv("FRONTEND_URL");
  const allowedOrigins = new Set([
    frontendUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);

  return {
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      const isLocalDev =
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (isLocalDev) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
    },
  };
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
  private uploadsRootDir = getUploadsDir();
  private uploadsDir = getMateriaisUploadsDir();

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
    this.app.use(cors(criarCorsOptions()));
    // Apenas os avatares sao publicos: eles aparecem em <img>, que nao envia
    // cabecalho de autorizacao. Material de turma NAO entra aqui — servir
    // /uploads inteiro deixava qualquer PDF de qualquer turma baixavel por
    // quem tivesse a URL, sem login. Material sai pelas rotas autenticadas
    // (.../materiais/:materialId/download), que conferem o vinculo do usuario.
    this.app.use(
      "/uploads/avatares",
      express.static(path.join(this.uploadsRootDir, "avatares")),
    );
    this.configurarRotas();
    this.app.use(errorMiddleware);
  }

  // Assinatura valida nao basta: a conta precisa existir e estar ativa agora.
  // Ver AuthUseCase.validarSessao.
  private async autenticar(req: Request): Promise<void> {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;

    if (!token) {
      throw new UnauthorizedError("Token de acesso não informado.");
    }

    let payload: TokenPayload;

    try {
      payload = this.jwtService.verificar(token);
    } catch (error: any) {
      throw new UnauthorizedError(error.message ?? "Token invalido.");
    }

    const sessao = await this.authUseCase.validarSessao(payload.sub);

    (req as Request & { usuario: TokenPayload }).usuario = {
      ...payload,
      perfil: sessao.perfil,
      alunoId: sessao.alunoId,
      instrutorId: sessao.instrutorId,
      coordenadorId: sessao.coordenadorId,
    };
  }

  private exigirPerfis(perfis: Perfil[]) {
    // O next() explicito e obrigatorio: asyncHandler so encaminha erro, entao
    // sem ele todo request autenticado ficaria pendurado.
    return asyncHandler(
      async (req: Request, _res: Response, next: NextFunction) => {
        await this.autenticar(req);

        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!perfis.includes(usuario.perfil as Perfil)) {
          throw new UnauthorizedError("Perfil sem permissao para esta rota.");
        }

        next();
      },
    );
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

  // Entrega o arquivo de um material ja autorizado pela rota que chamou.
  // Quem decide SE o usuario pode baixar e a rota (vinculo aluno/turma ou
  // instrutor/turma); aqui so resolvemos o caminho com seguranca e enviamos.
  private async enviarArquivoDeMaterial(
    res: Response,
    material: { titulo: string; urlArquivo: string | null },
  ): Promise<void> {
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

    const uploadsBase = this.uploadsDir;
    const caminhoRelativo = material.urlArquivo.replace(
      /^\/uploads\/materiais\//,
      "",
    );
    const caminhoAbsoluto = path.resolve(uploadsBase, caminhoRelativo);

    // Barra path traversal: o caminho resolvido tem de continuar dentro da
    // pasta de materiais.
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
  }

  private async salvarAvatar(
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

    const avataresDir = getAvataresUploadsDir();
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
          throw new BadRequestError("Informe o e-mail (ou CPF) e a senha.");
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
            : "Cadastro realizado, mas não foi possível enviar o e-mail de ativação. Use o link abaixo para ativar a conta.",
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
        // Sem filtro por status: o status do curso passou a ser derivado das
        // turmas, entao "desativado" quer dizer apenas que as turmas de agora
        // foram canceladas — o curso continua sendo oferecido, e o inscrito
        // entra na proxima turma. Filtrar por isso esvaziaria o combo do
        // cadastro publico e travaria a inscricao.
        const cursos = await this.coordenadorUseCase.listarCursos();
        const cursosAtivos = cursos
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
          mensagem: "Se o e-mail estiver cadastrado, as instruções foram enviadas.",
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

    // Art. 18, II e V da LGPD: o aluno baixa tudo que o sistema guarda sobre
    // ele. O id sai do token, nunca da URL.
    this.app.get(
      "/alunos/me/dados",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        const dados = await this.alunoUseCase.obterDadosPessoais(
          usuario.alunoId,
        );

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="meus-dados.json"',
        );
        res.send(JSON.stringify(dados, null, 2));
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

        await this.enviarArquivoDeMaterial(res, material);
      }),
    );

    // Download de material para quem administra a turma. Espelha a rota do
    // aluno: o vinculo e conferido antes de tocar no arquivo — instrutor so
    // baixa material de turma sua; coordenador e admin veem todas.
    this.app.get(
      "/turmas/:turmaId/materiais/:materialId/download",
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

        const materiais =
          await this.instrutorUseCase.listarMateriaisTurma(turmaId);
        const material = materiais.find((item) => item.id === materialId);

        if (!material) {
          res.status(404).json({ erro: "Material nao encontrado." });
          return;
        }

        await this.enviarArquivoDeMaterial(res, material);
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
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (_req: Request, res: Response) => {
        const alunos = await this.alunoUseCase.listar();
        res.json(alunos.map((aluno) => aluno.toJSON()));
      }),
    );

    this.app.get(
      "/alunos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
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
      this.exigirPerfis(["coordenador", "admin"]),
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

    // Exclusao real: apaga o usuario e, em cascata, matricula, frequencia e
    // certificado. O CPF NAO vai para cpfs_bloqueados — excluir tira do
    // sistema, e quem impede de voltar e o botao "Bloquear".
    this.app.delete(
      "/alunos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do aluno fornecido e invalido.");
        }

        await this.coordenadorUseCase.excluirAluno(id);
        res.json({ mensagem: "Aluno excluido com sucesso." });
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

    // Painel completo de uma turma: cronograma, alunos com presenca, materiais
    // e metricas. O instrutor chega por /instrutores/:id/dashboard, que resolve
    // a turma dele; a coordenacao escolhe a turma e chama esta rota.
    this.app.get(
      "/turmas/:turmaId/painel",
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

        const painel = await this.instrutorUseCase.obterDashboardDaTurma(turmaId);
        res.json(painel);
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

    // POST /auth/ativar-conta saiu em 18/09: era uma segunda porta de ativacao,
    // sem chamada em lugar nenhum, que reaproveitava a mesma senha como
    // confirmacao (senha === confirmarSenha por construcao) e nao pedia os
    // campos que o ActivationUseCase exige. A ativacao de verdade e
    // POST /auth/ativacoes/:token, a que a tela usa.

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
        const filtros = {
          ...(curso ? { curso } : {}),
          ...(turma ? { turma } : {}),
          ...(aluno ? { aluno } : {}),
          ...(periodo ? { periodo } : {}),
        };

        // Esta rota continua devolvendo o array puro: o painel e a tela de
        // detalhe da turma somam sobre a lista inteira. A versao paginada e
        // /listagens/frequencias.
        const pagina = await this.coordenadorUseCase.listarFrequencias(filtros);
        res.json(pagina.itens);
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
        await this.configuracoeUseCase
          .atualizarPeriodoLetivo(periodoLetivo, usuario.sub)
          .catch(() => {});
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

    this.app.post(
      "/coordenador/relatorios/gerados",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;
        const { tipo, filtros } = req.body ?? {};
        const relatorio =
          await this.coordenadorUseCase.gerarRelatorioPersistido({
            tipo,
            filtros: filtros ?? {},
            geradoPorId: usuario.sub,
          });

        res.status(201).json(relatorio);
      }),
    );

    this.app.get(
      "/coordenador/relatorios/gerados",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const limite =
          typeof req.query.limite === "string"
            ? Number(req.query.limite)
            : undefined;
        const relatorios =
          await this.coordenadorUseCase.listarRelatoriosGerados(limite);

        res.json({ relatorios });
      }),
    );

    this.app.get(
      "/coordenador/relatorios/gerados/:id/csv",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const relatorio = await this.coordenadorUseCase.obterRelatorioGerado(
          id,
        );
        const { caminho, nomeArquivo } = resolveRelatorioPathOrThrow(
          relatorio.arquivoCsv,
        );
        const arquivo = await fs.readFile(caminho).catch(() => {
          throw new NotFoundError("Arquivo CSV do relatorio nao encontrado.");
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${nomeArquivo}"`,
        );
        res.status(200).send(arquivo);
      }),
    );

    this.app.get(
      "/coordenador/relatorios/gerados/:id/pdf",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const relatorio = await this.coordenadorUseCase.obterRelatorioGerado(
          id,
        );
        const { caminho, nomeArquivo } = resolveRelatorioPathOrThrow(
          relatorio.arquivoPdf,
        );
        const arquivo = await fs.readFile(caminho).catch(() => {
          throw new NotFoundError("Arquivo PDF do relatorio nao encontrado.");
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${nomeArquivo}"`,
        );
        res.status(200).send(arquivo);
      }),
    );

    this.app.delete(
      "/coordenador/relatorios/gerados/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        await this.coordenadorUseCase.deletarRelatorioGerado(id);
        res.status(204).send();
      }),
    );

    // As rotas de /listagens/* devolvem uma pagina: { itens, total, pagina,
    // porPagina }. Ficam num prefixo proprio porque as rotas simples continuam
    // existindo e entregando a colecao inteira — elas alimentam os combos das
    // telas (curso e turma no cadastro de aluno, nos filtros de certificado e
    // de relatorio), que precisam de todas as opcoes, nao da primeira pagina.
    //
    // O prefixo tambem evita colidir com as rotas de /cursos/:id e /turmas/:id.
    this.app.get(
      "/listagens/cursos",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const pagina = await this.coordenadorUseCase.listarCursosPaginado(
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
        );
        res.json(pagina);
      }),
    );

    this.app.get(
      "/listagens/alunos",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const pagina = await this.coordenadorUseCase.listarAlunosPaginado(
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
        );
        res.json(pagina);
      }),
    );

    this.app.get(
      "/listagens/turmas",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const pagina = await this.coordenadorUseCase.listarTurmasPaginado(
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
        );
        res.json(pagina);
      }),
    );

    this.app.get(
      "/listagens/instrutores",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const pagina = await this.coordenadorUseCase.listarInstrutoresPaginado(
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
        );
        res.json(pagina);
      }),
    );

    this.app.get(
      "/listagens/usuarios",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const pagina = await this.coordenadorUseCase.listarUsuariosPaginado(
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
          {
            busca: textoDaQuery(req.query.busca),
            perfil: textoDaQuery(req.query.perfil),
            status: textoDaQuery(req.query.status),
            ordenacao: textoDaQuery(req.query.ordenacao),
          },
        );
        res.json(pagina);
      }),
    );

    this.app.get(
      "/listagens/certificados",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const pagina = await this.coordenadorUseCase.listarCertificadosPaginado(
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
          {
            curso: textoDaQuery(req.query.curso),
            turma: textoDaQuery(req.query.turma),
            status: textoDaQuery(req.query.status),
          },
        );
        res.json(pagina);
      }),
    );

    this.app.get(
      "/listagens/frequencias",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const curso = textoDaQuery(req.query.curso);
        const turma = textoDaQuery(req.query.turma);
        const aluno = textoDaQuery(req.query.aluno);
        const periodo = textoDaQuery(req.query.periodo);

        const pagina = await this.coordenadorUseCase.listarFrequencias(
          {
            ...(curso ? { curso } : {}),
            ...(turma ? { turma } : {}),
            ...(aluno ? { aluno } : {}),
            ...(periodo ? { periodo } : {}),
          },
          normalizarPaginacao(req.query.pagina, req.query.porPagina),
        );
        res.json(pagina);
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
        const { nome, descricao, cargaHoraria, periodoLetivo } = req.body;

        const curso = await this.coordenadorUseCase.criarCurso({
          nome,
          descricao,
          cargaHoraria: Number(cargaHoraria),
          periodoLetivo,
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

    this.app.delete(
      "/cursos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        await this.coordenadorUseCase.excluirCurso(id);
        res.json({ mensagem: "Curso excluido com sucesso." });
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
        const { nome, descricao, cargaHoraria, periodoLetivo } = req.body;

        const curso = await this.coordenadorUseCase.atualizarCurso(id, {
          nome,
          descricao,
          cargaHoraria: Number(cargaHoraria),
          periodoLetivo,
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
          mensagem:
            "Instrutor cadastrado. Nenhum e-mail foi enviado: use Reenviar ativacao quando ele precisar acessar o sistema.",
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

    this.app.delete(
      "/coordenador/instrutores/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        await this.coordenadorUseCase.excluirInstrutor(id);
        res.json({ mensagem: "Instrutor excluido com sucesso." });
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
          mensagem:
            "Aluno cadastrado. Nenhum e-mail foi enviado: use Reenviar ativacao quando ele precisar acessar o sistema.",
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

    this.app.delete(
      "/coordenador/usuarios/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        await this.coordenadorUseCase.excluirUsuario(
          id,
          usuario.sub,
          usuario.perfil,
        );
        res.json({ mensagem: "Usuario excluido com sucesso." });
      }),
    );

    this.app.patch(
      "/coordenador/usuarios/:id/status",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { status } = req.body ?? {};
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        const resultado =
          await this.coordenadorUseCase.atualizarStatusUsuario(
            id,
            status,
            usuario.sub,
            usuario.perfil,
          );

        res.json(resultado);
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

    // PATCH /coordenador/matriculas/:id saiu em 18/09: o status da matricula e
    // derivado da frequencia e do cronograma (reavaliarSituacaoMatricula, no
    // repositorio do instrutor) e era reescrito na chamada seguinte. A rota so
    // servia ao seletor "Alterar status" da ficha do aluno, que tambem saiu.

    this.app.patch(
      "/coordenador/alunos/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { nome, email, telefone, statusConta } = req.body ?? {};
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;
        const aluno = await this.coordenadorUseCase.atualizarAluno(
          id,
          { nome, email, telefone, statusConta },
          usuario.sub,
        );
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
        const { curso, nome, instrutores, periodoLetivo, horarios, limiteAlunos } =
          req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        // `status` nao entra: turma nova nasce planejada e dali em diante o
        // status e calculado pelos alunos e pelas aulas.
        const turma = await this.coordenadorUseCase.criarTurma({
          curso,
          nome,
          instrutores: Array.isArray(instrutores) ? instrutores : [],
          periodoLetivo,
          horario: horarios,
          limiteAlunos: Number(limiteAlunos),
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
        const { nome, curso, instrutores, periodoLetivo, capacidade } = req.body;

        const turma = await this.coordenadorUseCase.atualizarTurma(id, {
          nome,
          curso,
          instrutores: Array.isArray(instrutores) ? instrutores : [],
          periodoLetivo,
          capacidade: Number(capacidade),
        });

        res.json(turma);
      }),
    );

    // Cancelar/reativar tem rota propria porque e a unica mudanca de status que
    // parte da coordenacao; o PATCH de cima cuida so dos dados da turma.
    this.app.patch(
      "/turmas/:id/cancelamento",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { cancelada } = req.body ?? {};

        const turma = await this.coordenadorUseCase.definirCancelamentoDaTurma(
          id,
          cancelada,
        );

        res.json(turma);
      }),
    );

    this.app.delete(
      "/turmas/:id",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        await this.coordenadorUseCase.excluirTurma(id);
        res.json({ mensagem: "Turma excluida com sucesso." });
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

        const avatarUrl = await this.salvarAvatar(arquivo);
        await this.instrutorUseCase.atualizarAvatar(id, avatarUrl);

        res.status(200).json({ avatarUrl });
      }),
    );

    this.app.get(
      "/coordenadores/me/perfil",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;
        const perfil = await this.coordenadorUseCase.obterPerfil(usuario.sub);

        res.status(200).json(perfil);
      }),
    );

    this.app.post(
      "/coordenadores/me/avatar",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { arquivo } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!arquivo) {
          throw new BadRequestError("Envie uma foto.");
        }

        const avatarUrl = await this.salvarAvatar(arquivo);
        await this.coordenadorUseCase.atualizarAvatarCoordenador(
          usuario.sub,
          avatarUrl,
        );

        res.status(200).json({ avatarUrl });
      }),
    );

    this.app.delete(
      "/coordenadores/me/avatar",
      this.exigirPerfis(["coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;
        await this.coordenadorUseCase.removerAvatarCoordenador(usuario.sub);

        res.status(200).json({ mensagem: "Foto de perfil removida." });
      }),
    );

    this.app.post(
      "/alunos/me/avatar",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { arquivo } = req.body;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        if (!arquivo) {
          throw new BadRequestError("Envie uma foto.");
        }

        const avatarUrl = await this.salvarAvatar(arquivo);
        await this.alunoUseCase.atualizarAvatar(usuario.alunoId, avatarUrl);

        res.status(200).json({ avatarUrl });
      }),
    );

    this.app.delete(
      "/alunos/me/avatar",
      this.exigirPerfis(["aluno"]),
      asyncHandler(async (req: Request, res: Response) => {
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!usuario.alunoId) {
          throw new UnauthorizedError(
            "O usuario autenticado nao possui perfil de aluno.",
          );
        }

        await this.alunoUseCase.removerAvatar(usuario.alunoId);

        res.status(200).json({ mensagem: "Foto de perfil removida." });
      }),
    );

    this.app.delete(
      "/instrutores/:id/avatar",
      this.exigirPerfis(["instrutor", "coordenador", "admin"]),
      asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const usuario = (req as Request & { usuario: TokenPayload }).usuario;

        if (!id || typeof id !== "string") {
          throw new BadRequestError("O ID do instrutor e invalido.");
        }

        if (usuario.perfil === "instrutor" && usuario.instrutorId !== id) {
          throw new UnauthorizedError(
            "Instrutor sem permissao para alterar este perfil.",
          );
        }

        await this.instrutorUseCase.removerAvatar(id);

        res.status(200).json({ mensagem: "Foto de perfil removida." });
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
          usuario.sub,
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
          usuario.sub,
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
          usuario.sub,
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
          usuario.sub,
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
