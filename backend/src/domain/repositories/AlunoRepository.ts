import { Aluno } from "../entities/Aluno";

/**
 * Tudo que o sistema guarda sobre um aluno, para ele mesmo baixar.
 *
 * Atende os incisos II e V do Art. 18 da LGPD (confirmacao/acesso e
 * portabilidade). O formato e JSON de proposito: e legivel por pessoa e
 * carregavel por outro sistema, que e o que a portabilidade pede.
 *
 * Nao entra aqui nada que nao seja dado DELE: hash de senha, token de sessao e
 * identificadores internos de outras pessoas ficam de fora.
 */
export interface DadosPessoaisDoAluno {
  geradoEm: string;
  cadastro: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string | null;
    dataNascimento: string | null;
    rgm: string | null;
    cursoUnipe: string | null;
    alunoDaUnipe: boolean;
    statusDaConta: string;
    dataDeCadastro: string | null;
    ultimoLogin: string | null;
  };
  matriculas: {
    curso: string | null;
    turma: string | null;
    periodoLetivo: string | null;
    status: string;
    dataMatricula: string | null;
    dataConclusao: string | null;
  }[];
  frequencias: {
    turma: string | null;
    aula: string | null;
    data: string;
    presente: boolean;
    justificada: boolean;
    observacao: string | null;
  }[];
  certificados: {
    codigo: string | null;
    curso: string | null;
    status: string;
    dataEmissao: string | null;
  }[];
}

export interface UsuarioRecuperacaoSenha {
  id: string;
  nome: string;
  email: string;
}

export interface RegistrarRecuperacaoSenhaInput {
  usuarioId: string;
  tokenHash: string;
  expiraEm: Date;
  ipSolicitante?: string | undefined;
  userAgent?: string | undefined;
}

export interface RecuperacaoSenhaValida {
  recuperacaoId: string;
  usuarioId: string;
  /**
   * Hash da senha em uso. Vem junto porque a redefinicao precisa recusar a
   * propria senha atual, e sem o hash nao ha como comparar.
   */
  senhaHashAtual: string | null;
}

export type AlunoMatriculaStatus =
  | "em_andamento"
  | "aprovado"
  | "reprovado_falta"
  | "cancelado";

export interface AlunoDashboard {
  nome: string;
  matricula: string | null;
  avatarUrl: string | null;
  /** Aluno cadastrado que ainda nao foi vinculado a nenhuma turma. */
  semMatricula: boolean;
  cursoDeExtensao: {
    nomeCurso: string;
    qtdFaltas: number;
    /**
     * Chamadas ja lancadas para esta matricula. A frequencia parte de 100 e so
     * cai com falta: com zero chamadas ela vale 100 sem que o aluno tenha
     * assistido nada, e a tela precisa deste numero para nao anunciar isso
     * como desempenho.
     */
    qtdChamadasLancadas: number;
    qtdTotalAulas: number;
    qtdAulasConcluidas: number;
    progresso: number;
    status: AlunoMatriculaStatus;
    /** Todas as aulas nao canceladas da turma ja foram marcadas como realizadas. */
    cursoConcluido: boolean;
    /** Curso concluido e progresso suficiente para o aluno pedir o certificado. */
    certificadoLiberado: boolean;
  };
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
  frequencia: number;
  /**
   * A aula em foco para o aluno: a proxima planejada ou, se o cronograma ja
   * acabou, a ultima que aconteceu. `momento` diz qual das duas e, para a tela
   * nao anunciar como "proxima" uma aula que ja passou.
   */
  proximaAula: {
    titulo: string;
    data: string;
    horaInicio: string | null;
    horaFim: string | null;
    momento: "proxima" | "ultima";
  } | null;
  historicoPresencas: {
    aula: string;
    data: string;
    situacao: "presente" | "falta" | "justificada" | "pendente";
  }[];
  calendarioTurma: {
    aula: string;
    data: string;
    status: "planejada" | "realizada" | "cancelada";
  }[];
  comunicados: {
    titulo: string;
    mensagem: string;
    tipo: "informacao" | "atencao" | "importante";
  }[];
}

export interface CertificadoEmitidoDoAluno {
  certificadoId: string;
  codigo: string | null;
  urlArquivo: string | null;
  nomeAluno: string;
  cpfAluno: string;
  nomeCurso: string;
  cargaHoraria: number;
  dataInicio: string;
  dataFim: string;
  dataEmissao: string | null;
  cidade: string;
  nomeCoordenadora: string;
  nomeProjeto: string;
  textoDescritivo: string;
  faltas: number;
  frequencia: number;
}

export interface MaterialAluno {
  id: string;
  titulo: string;
  tipo: string;
  urlArquivo: string | null;
  turmaId: string;
  turmaNome: string;
  criadoEm: Date;
}

export interface MaterialAlunoDownload {
  id: string;
  titulo: string;
  tipo: string;
  urlArquivo: string | null;
  turmaId: string;
  turmaNome: string;
}

export interface MaterialVisivelAluno {
  id: string;
  turmaId: string;
  turma: string;
  curso: string;
  aulaId: string | null;
  aulaTitulo: string | null;
  titulo: string;
  descricao: string | null;
  tipo: string;
  urlArquivo: string | null;
  tamanhoBytes: number | null;
  dataPublicacao: string;
}

export interface AlunoRepository {
  cadastrar(aluno: Aluno): Promise<Aluno>;
  buscarPorId(id: string): Promise<Aluno | null>;
  buscarPorCpf(cpf: string): Promise<Aluno | null>;
  /** CPF na lista de bloqueio: aluno excluido pela coordenacao. */
  cpfBloqueado(cpf: string): Promise<boolean>;
  buscarPorEmail(email: string): Promise<Aluno | null>;
  buscarUsuarioIdPorAlunoId(alunoId: string): Promise<string | null>;
  buscarDadosPessoaisDoAluno(
    alunoId: string,
  ): Promise<DadosPessoaisDoAluno | null>;
  buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacaoSenha | null>;
  existeRecuperacaoSenhaRecente(usuarioId: string, intervaloMinutos: number): Promise<boolean>;
  registrarRecuperacaoSenha(dados: RegistrarRecuperacaoSenhaInput): Promise<void>;
  removerRecuperacaoSenhaPorTokenHash(tokenHash: string): Promise<void>;
  buscarRecuperacaoValidaPorTokenHash(tokenHash: string): Promise<RecuperacaoSenhaValida | null>;
  buscarDashboardPorAlunoId(alunoId: string): Promise<AlunoDashboard | null>;
  atualizarAvatar(alunoId: string, avatarUrl: string | null): Promise<void>;
  listarMateriaisVisiveis(alunoId: string): Promise<MaterialVisivelAluno[]>;
  redefinirSenhaUsuario(
    usuarioId: string,
    novaSenhaHash: string,
    recuperacaoId: string,
  ): Promise<void>;
  listarTodos(): Promise<Aluno[]>;
  atualizar(aluno: Aluno): Promise<Aluno>;
  listarMateriaisVisiveisPorAluno(alunoId: string): Promise<MaterialAluno[]>;
  buscarMaterialVisivelParaDownload(
    alunoId: string,
    materialId: string,
  ): Promise<MaterialAlunoDownload | null>;
  buscarCertificadoEmitidoPorAlunoId(
    alunoId: string,
  ): Promise<CertificadoEmitidoDoAluno | null>;
  atualizarUrlArquivoCertificado(
    certificadoId: string,
    urlArquivo: string,
  ): Promise<void>;
  deletar(id: string): Promise<void>;
}
