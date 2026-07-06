import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  AlunoNotificacaoAula,
  AtualizarAulaInput,
  AulaDetalheNotificacao,
  AulaResumo,
  InstrutorDashboard,
  InstrutorRepository,
  MaterialResumo,
  RegistrarPresencasInput,
  StatusPresenca,
  TIPOS_MATERIAL,
  TipoMaterial,
} from "../../domain/repositories/InstrutorRepository";

const STATUS_PRESENCA_VALIDOS: StatusPresenca[] = [
  "presente",
  "falta",
  "justificada",
];
const STATUS_AULA_VALIDOS = ["planejada", "realizada", "cancelada"];
const VISIBILIDADES_MATERIAL = ["visivel", "oculto"];

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface EmailSender {
  enviar(destinatario: string, assunto: string, html: string): Promise<void>;
}

const escaparHtml = (valor: string) =>
  valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatarDataPtBr = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
};

export class InstrutorUseCase {
  constructor(
    private instrutorRepository: InstrutorRepository,
    private emailService?: EmailSender,
  ) {}

  async obterDashboard(instrutorId: string): Promise<InstrutorDashboard> {
    if (!instrutorId || instrutorId.trim() === "") {
      throw new Error("O ID do instrutor e obrigatorio.");
    }

    const dashboard = await this.instrutorRepository.buscarDashboard(instrutorId);

    if (!dashboard) {
      throw new Error("Instrutor nao encontrado.");
    }

    return dashboard;
  }

  async validarAcessoTurmaDoInstrutor(
    turmaId: string,
    instrutorId: string | null,
  ): Promise<void> {
    if (!instrutorId) {
      throw new Error("Instrutor autenticado nao encontrado.");
    }

    const permitido = await this.instrutorRepository.turmaPertenceAoInstrutor(
      turmaId,
      instrutorId,
    );

    if (!permitido) {
      throw new Error("Instrutor sem acesso a esta turma.");
    }
  }

  async listarMateriaisTurma(turmaId: string): Promise<MaterialResumo[]> {
    if (!turmaId) {
      throw new BadRequestError("A turma e obrigatoria.");
    }

    return await this.instrutorRepository.listarMateriaisTurma(turmaId);
  }

  async registrarPresencas(input: RegistrarPresencasInput): Promise<void> {
    if (!input.turmaId || !input.aulaId) {
      throw new Error("Turma e aula sao obrigatorias.");
    }

    if (!Array.isArray(input.registros) || input.registros.length === 0) {
      throw new Error("Informe ao menos um registro de presenca.");
    }

    for (const registro of input.registros) {
      if (!registro.matriculaId) {
        throw new Error("Cada registro precisa de uma matricula valida.");
      }

      if (!STATUS_PRESENCA_VALIDOS.includes(registro.status)) {
        throw new Error(
          `Status de presenca invalido: ${registro.status}. Use presente, falta ou justificada.`,
        );
      }
    }

    await this.instrutorRepository.registrarPresencas(input);
  }

  async adicionarMaterial(
    input: AdicionarMaterialInput,
  ): Promise<MaterialResumo> {
    if (!input.turmaId) {
      throw new Error("A turma e obrigatoria.");
    }

    if (!input.titulo || input.titulo.trim() === "") {
      throw new Error("O titulo do material e obrigatorio.");
    }

    if (!TIPOS_MATERIAL.includes(input.tipo as TipoMaterial)) {
      throw new Error(
        `Tipo de material invalido. Use: ${TIPOS_MATERIAL.join(", ")}.`,
      );
    }

    if (input.tamanhoBytes != null && input.tamanhoBytes <= 0) {
      throw new Error("O tamanho do material deve ser maior que zero.");
    }

    return await this.instrutorRepository.adicionarMaterial({
      ...input,
      titulo: input.titulo.trim(),
      descricao: input.descricao?.trim() || null,
      aulaId: input.aulaId || null,
      visibilidade: input.visibilidade ?? "visivel",
    });
  }

  async removerMaterial(materialId: string, turmaId: string): Promise<void> {
    if (!materialId || !turmaId) {
      throw new BadRequestError("Material e turma sao obrigatorios.");
    }

    await this.instrutorRepository.removerMaterial(materialId, turmaId);
  }

  async atualizarMaterialVisibilidade(
    materialId: string,
    turmaId: string,
    visibilidade: string,
  ): Promise<MaterialResumo> {
    if (!materialId || !turmaId) {
      throw new BadRequestError("Material e turma sao obrigatorios.");
    }

    if (!VISIBILIDADES_MATERIAL.includes(visibilidade)) {
      throw new BadRequestError("Visibilidade invalida. Use: visivel ou oculto.");
    }

    return await this.instrutorRepository.atualizarMaterialVisibilidade(
      materialId,
      turmaId,
      visibilidade as "visivel" | "oculto",
    );
  }

  async adicionarAula(input: AdicionarAulaInput): Promise<AulaResumo> {
    if (!input.turmaId) {
      throw new BadRequestError("A turma e obrigatoria.");
    }

    if (!input.titulo || input.titulo.trim() === "") {
      throw new BadRequestError("O titulo da aula e obrigatorio.");
    }

    if (!input.data || !DATA_REGEX.test(input.data)) {
      throw new BadRequestError("Informe uma data valida (AAAA-MM-DD).");
    }

    if (
      input.horaInicio &&
      input.horaFim &&
      input.horaFim <= input.horaInicio
    ) {
      throw new BadRequestError(
        "O horario de termino deve ser depois do horario de inicio.",
      );
    }

    return await this.instrutorRepository.adicionarAula({
      ...input,
      titulo: input.titulo.trim(),
    });
  }

  async atualizarAula(input: AtualizarAulaInput): Promise<AulaResumo> {
    if (!input.turmaId || !input.aulaId) {
      throw new BadRequestError("Turma e aula sao obrigatorias.");
    }

    if (input.titulo !== undefined && input.titulo.trim() === "") {
      throw new BadRequestError("O titulo da aula nao pode ficar vazio.");
    }

    if (input.data !== undefined && !DATA_REGEX.test(input.data)) {
      throw new BadRequestError("Informe uma data valida (AAAA-MM-DD).");
    }

    if (input.status && !STATUS_AULA_VALIDOS.includes(input.status)) {
      throw new BadRequestError(
        "Status de aula invalido. Use: planejada, realizada ou cancelada.",
      );
    }

    if (
      input.horaInicio &&
      input.horaFim &&
      input.horaFim <= input.horaInicio
    ) {
      throw new BadRequestError(
        "O horario de termino deve ser depois do horario de inicio.",
      );
    }

    const aulaAnterior =
      input.status === "cancelada"
        ? await this.instrutorRepository.buscarAulaParaNotificacao(
            input.turmaId,
            input.aulaId,
          )
        : null;

    const dadosAtualizacao: AtualizarAulaInput = {
      ...input,
    };

    if (input.titulo !== undefined) {
      dadosAtualizacao.titulo = input.titulo.trim();
    }

    const aulaAtualizada =
      await this.instrutorRepository.atualizarAula(dadosAtualizacao);

    if (
      input.status === "cancelada" &&
      aulaAnterior &&
      aulaAnterior.status !== "cancelada"
    ) {
      await this.notificarCancelamentoAula(aulaAnterior, aulaAtualizada);
    }

    return aulaAtualizada;
  }

  async removerAula(aulaId: string, turmaId: string): Promise<void> {
    if (!aulaId || !turmaId) {
      throw new BadRequestError("Aula e turma sao obrigatorias.");
    }

    await this.instrutorRepository.removerAula(aulaId, turmaId);
  }

  async obterPresencasPorAula(
    turmaId: string,
    aulaId: string,
  ): Promise<AlunoPresenca[]> {
    if (!turmaId || !aulaId) {
      throw new BadRequestError("Turma e aula sao obrigatorias.");
    }

    return await this.instrutorRepository.buscarPresencasPorAula(
      turmaId,
      aulaId,
    );
  }

  async atualizarAvatar(
    instrutorId: string,
    avatarUrl: string,
  ): Promise<void> {
    if (!instrutorId) {
      throw new BadRequestError("O ID do instrutor e obrigatorio.");
    }

    if (!avatarUrl || avatarUrl.trim() === "") {
      throw new BadRequestError("A foto enviada e invalida.");
    }

    await this.instrutorRepository.atualizarAvatar(instrutorId, avatarUrl);
  }

  private async notificarCancelamentoAula(
    aulaAnterior: AulaDetalheNotificacao,
    aulaAtualizada: AulaResumo,
  ): Promise<void> {
    if (!this.emailService) {
      return;
    }

    const alunos =
      await this.instrutorRepository.listarAlunosParaNotificacaoAula(
        aulaAnterior.turmaId,
      );

    if (alunos.length === 0) {
      return;
    }

    const titulo = aulaAtualizada.titulo || aulaAnterior.titulo;
    const data = aulaAtualizada.data || aulaAnterior.data;
    const assunto = `Aula cancelada - ${titulo}`;
    const htmlPorAluno = (aluno: AlunoNotificacaoAula) => `
      <p>Olá, ${escaparHtml(aluno.nome)}!</p>
      <p>A aula abaixo foi cancelada:</p>
      <ul>
        <li><strong>Curso:</strong> ${escaparHtml(aulaAnterior.curso)}</li>
        <li><strong>Turma:</strong> ${escaparHtml(aulaAnterior.turma)}</li>
        <li><strong>Aula:</strong> ${escaparHtml(titulo)}</li>
        <li><strong>Data:</strong> ${formatarDataPtBr(data)}</li>
      </ul>
      <p>Fique atento ao cronograma da turma para acompanhar novas atualizações.</p>
      <p>ADM Para Todos</p>
    `;

    const envios = await Promise.allSettled(
      alunos.map((aluno) =>
        this.emailService!.enviar(aluno.email, assunto, htmlPorAluno(aluno)),
      ),
    );

    const falhas = envios.filter((envio) => envio.status === "rejected");
    if (falhas.length > 0) {
      console.warn(
        `Falha ao enviar notificacao de cancelamento para ${falhas.length} aluno(s).`,
      );
    }
  }
}
