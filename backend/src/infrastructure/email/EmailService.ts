import nodemailer, { type Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter;
  private configurado: boolean;

  constructor(
    private usuario: string,
    senhaApp: string,
    host?: string,
    port?: number,
    rejectUnauthorized = true,
  ) {
    const smtpPort = port ?? 587;
    this.configurado = Boolean(usuario && senhaApp);

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

    await this.transporter.sendMail({
      from: `ADM Para Todos <${this.usuario}>`,
      to: destinatario,
      subject: assunto,
      html,
    });
  }
}
