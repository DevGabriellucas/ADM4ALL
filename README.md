# ADM4All

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

Sistema web completo para **Administração para Todos** — gestão de cursos de extensão, matrículas, frequência, certificados e relatórios acadêmicos.

[🚀 Funcionalidades](#-funcionalidades) • [📋 Perfis](#-perfis-do-sistema) • [🛠️ Stack Técnica](#-stack-técnica) • [💻 Como Rodar](#-como-rodar-localmente) • [📖 Documentação](#-documentação)

</div>

---

## 📖 Sobre

ADM4All é uma plataforma web robusta para gestão completa do ciclo acadêmico de cursos de extensão. Oferece funcionalidades de matrícula, cronograma de aulas, registro de frequência, emissão de certificados e geração de relatórios gerenciais.

O sistema implementa autenticação JWT com suporte a múltiplos perfis de usuário (Coordenador, Instrutor e Aluno), cada um com um conjunto específico de permissões e interfaces dedicadas.

---

## 🚀 Funcionalidades

### ✅ MVP (Versão 1.0)

- **🔐 Autenticação**
  - Login por e-mail ou CPF
  - Autenticação JWT
  - Redirecionamento automático por perfil

- **📊 Dashboard Coordenador**
  - Indicadores em tempo real
  - Gestão de cursos e turmas
  - Gestão de alunos e instrutores
  - Relatórios acadêmicos com filtros
  - Exportação em PDF e CSV

- **📅 Gestão Acadêmica**
  - Período letivo dinâmico/editável
  - Cronograma de aulas
  - Registro de frequência
  - Materiais didáticos

- **🏅 Certificados**
  - Emissão manual de certificados
  - Download autenticado

- **👨‍🏫 Funcionalidades Instrutor**
  - Dashboard da turma
  - Controle de frequência
  - Gerenciamento de materiais

- **👨‍🎓 Funcionalidades Aluno**
  - Dashboard pessoal
  - Acompanhamento de progresso
  - Download de materiais e certificado

### 🔄 Em Desenvolvimento

- Cronograma geral
- Processos administrativos
- Gestão avançada de usuários
- Configurações completas

---

## 👥 Perfis do Sistema

| Perfil | Acesso |
|--------|--------|
| **👑 Coordenador/Admin** | Dashboard com indicadores, gestão de cursos, turmas, alunos, instrutores, frequência, certificados, relatórios e período letivo |
| **👨‍🏫 Instrutor** | Dashboard da turma, cronograma de aulas, registro de presença, materiais didáticos e perfil |
| **👨‍🎓 Aluno** | Dashboard pessoal com progresso e frequência, download de materiais e certificado |

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **Banco de Dados** | PostgreSQL 16 |
| **Infraestrutura** | Docker, Docker Compose |

---

## 💻 Como Rodar Localmente

### Pré-requisitos

- **Node.js** ≥ 18.0.0
- **Docker** e **Docker Compose**
- **npm** ou **yarn**

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/DevGabriellucas/ADM4ALL.git
cd ADM4ALL
```

### 2️⃣ Configuração do Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas variáveis de ambiente
# (banco de dados, JWT secret, etc)
```

### 3️⃣ Inicie os Serviços com Docker

```bash
docker compose up -d --build
```

Isso inicia:
- PostgreSQL 16 (porta 5432)
- Adminer (porta 8080) — opcional para gerenciar o banco

### 4️⃣ Backend

```bash
cd backend

# Instale as dependências
npm install

# Inicie o servidor em modo desenvolvimento
npm run start:dev

# Ou modo produção
npm run build && npm run start
```

O backend estará disponível em `http://localhost:8000`

### 5️⃣ Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Inicie em modo desenvolvimento
npm run dev

# Ou build para produção
npm run build
npm run start
```

O frontend estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
ADM4ALL/
├── backend/              # API REST (Node.js + Express)
│   ├── src/
│   ├── package.json
│   └── README.md
├── frontend/             # Interface Web (Next.js + React)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── database/             # Banco de dados e migrations
│   ├── migrations/
│   ├── seeds/
│   ├── docs/
│   └── README.md
├── docker-compose.yml    # Configuração Docker
├── .env.example          # Variáveis de ambiente (exemplo)
└── README.md
```

---

## 🔗 Documentação

- **[Backend](backend/README.md)** — Setup, APIs, autenticação
- **[Frontend](frontend/README.md)** — Setup, estrutura de componentes
- **[Banco de Dados](database/README.md)** — Migrations, seeds, schema
- **[Modelo ER](database/docs/modelo-entidade-relacionamento.md)** — Diagrama entidade-relacionamento
- **[Dados de Produção](database/seeds/producao/README.md)** — Seeds para ambiente de produção

---

## 🚀 Deploy

### Variáveis de Ambiente Obrigatórias

Consulte `.env.example` para a lista completa. As principais são:

```env
# Backend
DATABASE_URL=postgresql://user:password@db:5432/adm4all
JWT_SECRET=seu_secret_aqui
BACKEND_PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_PORT=3000
```

### Docker Compose em Produção

Para ambiente de produção, ajuste:
- Senhas do banco de dados
- JWT_SECRET com um valor seguro e aleatório
- Variáveis de ambiente específicas

```bash
docker compose -f docker-compose.yml up -d
```

---

## 📝 Padrões de Código

- **Linguagem**: TypeScript (obrigatório)
- **Formatação**: Prettier
- **Linting**: ESLint
- **Commits**: Mensagens descritivas em português

---

## 🐛 Troubleshooting

**Erro de conexão com banco de dados?**
```bash
# Verifique se o PostgreSQL está rodando
docker compose ps

# Recrie os containers
docker compose down
docker compose up -d --build
```

**Porta já em uso?**
```bash
# Mude as portas no docker-compose.yml ou .env
```

**Erro ao instalar dependências?**
```bash
# Limpe o cache do npm e reinstale
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contribuindo

1. Faça um **fork** do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

---

## 📄 Licença

Este projeto está licenciado sob a MIT License — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Jônatas Araújo**

- GitHub: [@DevGabriellucas](https://github.com/DevGabriellucas)

---

## 📞 Suporte

Encontrou um bug? Abra uma [issue](https://github.com/DevGabriellucas/ADM4ALL/issues) no GitHub.

---

<div align="center">

Feito com ❤️ por [Jônatas Araújo](https://github.com/DevGabriellucas)

</div>
