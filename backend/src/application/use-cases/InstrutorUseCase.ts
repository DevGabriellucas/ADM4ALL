import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
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

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class InstrutorUseCase {
  constructor(private instrutorRepository: InstrutorRepository) {}

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
    });
  }

  async removerMaterial(materialId: string, turmaId: string): Promise<void> {
    if (!materialId || !turmaId) {
      throw new BadRequestError("Material e turma sao obrigatorios.");
    }

    await this.instrutorRepository.removerMaterial(materialId, turmaId);
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
}
