import nodemailer, { type Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter;

  constructor(
    private usuario: string,
    senhaApp: string,
    host?: string,
    port?: number,
  ) {
    this.transporter = nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port: port ? Number(port) : 587,
      secure: port ? Number(port) === 465 : false,
      auth: { user: usuario, pass: senhaApp },
      tls: {
        rejectUnauthorized: false,
      },
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
