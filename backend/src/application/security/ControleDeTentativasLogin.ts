/**
 * Trava de forca bruta no login.
 *
 * O login era a unica porta sem limite de tentativas — a recuperacao de senha ja
 * tinha a dela desde 11/09. Como o sistema aceita CPF como identificador, um
 * atacante podia martelar o formulario sem nada no caminho. E medida de
 * seguranca no sentido do Art. 46 da LGPD.
 *
 * ## Conta por IDENTIFICADOR, nunca por IP
 *
 * O caminho do login e navegador -> rota /api/auth/login do Next (que roda no
 * servidor) -> backend. O backend enxerga sempre o IP do container do frontend,
 * o mesmo para todo mundo. Um limite por IP, aqui, derrubaria o sistema inteiro
 * depois de N senhas erradas somadas entre todos os usuarios — e nao seguraria
 * atacante nenhum, porque ele chega pelo mesmo IP dos demais.
 *
 * Para limitar por IP de verdade, a rota do Next precisaria repassar o IP do
 * cliente e o Express confiar nesse cabecalho (`trust proxy`). Hoje a porta 8000
 * esta publicada, entao o cabecalho seria falsificavel e a trava viraria
 * enfeite. Fica para quando o backend estiver so atras do proxy.
 *
 * A contagem por identificador ja cobre o ataque que importa: tentar varias
 * senhas contra uma conta. Varrer CPFs para descobrir quem tem cadastro nao
 * funciona por outro motivo — o login responde exatamente a mesma mensagem para
 * "conta nao existe" e "senha errada".
 *
 * ## O que esta trava nao resolve
 *
 * Quem souber o e-mail de alguem consegue deixar essa pessoa 15 minutos sem
 * entrar, errando a senha de proposito. E o preco conhecido de qualquer limite
 * por identificador, e a janela e curta por causa disso.
 *
 * ## Memoria, nao banco
 *
 * O estado vive no processo. Reiniciar o backend zera as contagens, e com mais
 * de uma instancia cada uma conta a sua parte. Para o tamanho deste sistema (um
 * container) isso basta, e evita escrever no banco a cada senha errada. Se um
 * dia houver varias instancias, a contagem precisa sair daqui para um lugar
 * compartilhado.
 */

/** Erros seguidos no mesmo identificador antes de fechar a porta. */
export const LIMITE_DE_ERROS = 5;

/** Quanto tempo a contagem dura, e quanto tempo a porta fica fechada. */
export const JANELA_MINUTOS = 15;

const JANELA_MS = JANELA_MINUTOS * 60 * 1000;

interface Contagem {
  erros: number;
  expiraEm: number;
}

export class ControleDeTentativasLogin {
  private contagens = new Map<string, Contagem>();

  constructor(private agora: () => number = () => Date.now()) {}

  /**
   * Minutos que faltam para liberar, ou `null` quando a tentativa pode seguir.
   *
   * Arredonda para cima: dizer "0 minutos" a quem ainda esta preso faria a
   * pessoa tentar de novo na hora e levar outra recusa.
   */
  minutosBloqueado(identificador: string): number | null {
    const contagem = this.ler(this.chave(identificador));

    if (!contagem || contagem.erros < LIMITE_DE_ERROS) {
      return null;
    }

    return Math.ceil((contagem.expiraEm - this.agora()) / 60000);
  }

  /**
   * Cada erro empurra a expiracao para a frente: errar de novo no minuto 14
   * renova os 15, senao bastaria esperar a janela vencer e recomecar.
   */
  registrarErro(identificador: string): void {
    const chave = this.chave(identificador);
    const atual = this.ler(chave);

    this.contagens.set(chave, {
      erros: (atual?.erros ?? 0) + 1,
      expiraEm: this.agora() + JANELA_MS,
    });

    this.limparVencidas();
  }

  registrarAcerto(identificador: string): void {
    this.contagens.delete(this.chave(identificador));
  }

  private chave(identificador: string): string {
    return identificador.trim().toLowerCase();
  }

  private ler(chave: string): Contagem | null {
    const contagem = this.contagens.get(chave);
    if (!contagem) return null;

    if (contagem.expiraEm <= this.agora()) {
      this.contagens.delete(chave);
      return null;
    }

    return contagem;
  }

  /**
   * O Map so cresce se ninguem varrer: cada identificador tentado deixa uma
   * entrada. A limpeza roda junto com a escrita, que e o unico momento em que o
   * mapa cresce.
   */
  private limparVencidas(): void {
    const agora = this.agora();
    for (const [chave, contagem] of this.contagens) {
      if (contagem.expiraEm <= agora) {
        this.contagens.delete(chave);
      }
    }
  }
}
