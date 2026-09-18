import nodemailer, { type Transporter } from "nodemailer";
import { anexosDoEmail } from "./emailTemplates";

export class EmailService {
  private transporter: Transporter;
  private configurado: boolean;
  private remetente: string;

  constructor(
    usuario: string,
    senhaApp: string,
    host?: string,
    port?: number,
    rejectUnauthorized = true,
    fromName = "ADM Para Todos",
    fromAddress?: string,
  ) {
    const smtpPort = port ?? 587;
    this.configurado = Boolean(usuario && senhaApp);
    this.remetente = `${fromName} <${fromAddress?.trim() || usuario}>`;

    this.transporter = nodemailer.createTransport({
      host: host ?? "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: this.configurado ? { user: usuario, pass: senhaApp } : undefined,
      tls: { rejectUnauthorized },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });
  }

  isConfigurado(): boolean {
    return this.configurado;
  }

  async verificar(): Promise<void> {
    if (!this.configurado) {
      throw new Error(
        "Servico de e-mail nao configurado. Defina GMAIL_USER e GMAIL_APP_PASSWORD no .env.",
      );
    }

    await this.transporter.verify();
  }

  async enviar(
    destinatario: string,
    assunto: string,
    html: string,
  ): Promise<void> {
    if (!this.configurado) {
      throw new Error(
        "Servico de e-mail nao configurado. Defina GMAIL_USER e GMAIL_APP_PASSWORD no .env.",
      );
    }

    // A marca vai anexada e embutida por `cid`, e nao por URL: imagem
    // hospedada depende do servidor estar publico e o Gmail ainda a bloqueia
    // ate o leitor clicar em "exibir imagens". Anexada, ela aparece sempre —
    // inclusive com o sistema rodando em localhost.
    await this.transporter.sendMail({
      from: this.remetente,
      to: destinatario,
      subject: assunto,
      html,
      attachments: anexosDoEmail(),
    });
  }
}
