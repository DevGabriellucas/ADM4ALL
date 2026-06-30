import nodemailer, { type Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter;

  constructor(
    private usuario: string,
    senhaApp: string,
    host?: string,
    port?: number,
  ) {
    const smtpPort = port ?? 587;

    this.transporter = nodemailer.createTransport({
      host: host ?? "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: usuario, pass: senhaApp },
    });
  }

  async enviar(
    destinatario: string,
    assunto: string,
    html: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `ADM Para Todos <${this.usuario}>`,
      to: destinatario,
      subject: assunto,
      html,
    });
  }
}
