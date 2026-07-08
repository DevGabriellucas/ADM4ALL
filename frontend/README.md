# ADM4All Frontend

Frontend Next.js do ADM4All.

## Ambiente

Crie um `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_API_URL=https://api.seu-dominio.edu.br
```

Em desenvolvimento local, aponte `NEXT_PUBLIC_API_URL` para a API local.

## Comandos

```bash
npm ci
npm run dev
npm run build
npm start
```

## Docker

O build Docker recebe a URL publica da API por argumento:

```bash
docker compose --env-file ../.env.example build frontend
```
