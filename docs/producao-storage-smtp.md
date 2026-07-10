# Producao - Storage e SMTP

## SMTP

O backend envia ativacao de conta, recuperacao de senha e notificacoes de aula
cancelada quando as credenciais SMTP estao configuradas.

Variaveis principais:

```env
EMAIL_HOST=smtp.seu-provedor.com
EMAIL_PORT=587
EMAIL_FROM_NAME=ADM Para Todos
EMAIL_FROM=noreply@seu-dominio.edu.br
EMAIL_TLS_REJECT_UNAUTHORIZED=true
```

Para Gmail em desenvolvimento, tambem funcionam:

```env
GMAIL_USER=conta@gmail.com
GMAIL_APP_PASSWORD=senha_de_aplicativo
```

Para producao, usar conta institucional e configurar SPF, DKIM e DMARC no
dominio do remetente.

## Storage

Uploads de materiais/avatares e PDFs de certificados podem ser apontados para
diretorios persistentes por variavel de ambiente:

```env
UPLOADS_DIR=/usr/src/app/uploads
STORAGE_DIR=/usr/src/app/storage
```

No Docker Compose atual, estes caminhos ja ficam montados em:

```yaml
./backend/uploads:/usr/src/app/uploads
./backend/storage:/usr/src/app/storage
```

Em producao, montar esses caminhos em volume persistente com backup. Se a
infra exigir storage de objeto, como S3 ou MinIO, manter a URL publica
autenticada no backend e substituir apenas a camada de persistencia de arquivo.
