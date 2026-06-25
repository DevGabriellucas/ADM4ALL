// Repositorio de leitura/escrita usado pela tela do instrutor.
// Como o painel e majoritariamente de leitura (agregacao de varias tabelas),
// trabalhamos com DTOs simples em vez de entidades ricas.

export type StatusPresenca = "presente" | "falta" | "justificada";

export const TIPOS_MATERIAL = [
  "pdf",
  "video",
  "imagem",
  "documento",
  "link",
  "outro",
] as const;

export type TipoMaterial = (typeof TIPOS_MATERIAL)[number];

export interface InstrutorResumo {
  id: string;
  usuarioId: string;
  nome: string;
  areaAtuacao: string | null;
}

export interface TurmaResumo {
  id: string;
  codigo: string;
  nome: string;
  curso: string;
  turno: string;
  local: string | null;
}

export interface AulaResumo {
  id: string;
  numero: number;
  titulo: string;
  data: string; // YYYY-MM-DD
  status: string;
}

export interface AlunoPresenca {
  matriculaId: string;
  alunoId: string;
  nome: string;
  statusPresenca: StatusPresenca | null;
}

export interface MaterialResumo {
  id: string;
  titulo: string;
  tipo: string;
  tamanhoBytes: number | null;
  dataPublicacao: string; // YYYY-MM-DD
  urlArquivo: string | null;
}

export interface InstrutorDashboard {
  instrutor: InstrutorResumo;
  turma: TurmaResumo | null;
  aulaReferencia: AulaResumo | null;
  proximaAula: AulaResumo | null;
  metricas: {
    totalAlunos: number;
    presentesHoje: number;
    frequenciaMedia: number; // 0-100
  };
  alunos: AlunoPresenca[];
  cronograma: AulaResumo[];
  materiais: MaterialResumo[];
}

export interface RegistroPresenca {
  matriculaId: string;
  status: StatusPresenca;
}

export interface RegistrarPresencasInput {
  turmaId: string;
  aulaId: string;
  registros: RegistroPresenca[];
}

export interface AdicionarMaterialInput {
  turmaId: string;
  titulo: string;
  tipo: TipoMaterial;
  urlArquivo?: string | null;
  tamanhoBytes?: number | null;
  publicadoPorId?: string | null;
}

export interface InstrutorRepository {
  buscarDashboard(instrutorId: string): Promise<InstrutorDashboard | null>;
  turmaPertenceAoInstrutor(
    turmaId: string,
    instrutorId: string,
  ): Promise<boolean>;
  registrarPresencas(input: RegistrarPresencasInput): Promise<void>;
  adicionarMaterial(input: AdicionarMaterialInput): Promise<MaterialResumo>;
}
