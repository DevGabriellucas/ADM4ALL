import nodemailer, { type Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter;

  constructor(
    private usuario: string,
    senhaApp: string,
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
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
