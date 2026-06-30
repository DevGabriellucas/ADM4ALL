export const gerarEmailRecuperacaoSenha = (link: string, minutosExpira: number): string => {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
    <h2 style="color: #007bff; margin-bottom: 20px;">Recuperação de Senha</h2>
    <p style="margin: 0 0 15px 0;">Olá,</p>
    <p style="margin: 0 0 20px 0;">Recebemos uma solicitação para redefinir a sua senha no sistema <strong>ADM Para Todos</strong>.</p>
    <p style="margin: 0 0 25px 0;">Clique no botão abaixo para criar uma nova senha:</p>
    <div style="margin: 30px 0;">
      <a href="${link}" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Redefinir minha senha</a>
    </div>
    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Este link é seguro e expira em <strong>${minutosExpira} minutos</strong>.</p>
    <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">ADM Para Todos &copy; ${new Date().getFullYear()}</p>
  </div>`;
};
