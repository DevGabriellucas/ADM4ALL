# Modelo entidade-relacionamento - ADM4All

Este documento descreve o modelo de dados para suportar aluno, instrutor,
coordenacao e administrador geral. `usuarios` centraliza autenticacao e cada
tabela de perfil guarda os dados especificos da sua funcao.

```mermaid
erDiagram
    PERFIS ||--o{ USUARIOS : define
    USUARIOS ||--o{ RECUPERACOES_SENHA : solicita
    USUARIOS ||--o| ALUNOS : representa
    USUARIOS ||--o| INSTRUTORES : representa
    USUARIOS ||--o| COORDENADORES : representa

    TREINAMENTOS ||--o{ TURMAS : abre
    INSTRUTORES ||--o{ TURMAS : ministra
    COORDENADORES ||--o{ TURMAS : coordena
    TURMAS ||--o{ AULAS : possui

    ALUNOS ||--o{ MATRICULAS : realiza
    TREINAMENTOS ||--o{ MATRICULAS : possui
    TURMAS ||--o{ MATRICULAS : agrupa

    MATRICULAS ||--o{ FREQUENCIAS : registra
    AULAS ||--o{ FREQUENCIAS : recebe
    MATRICULAS ||--o{ AVALIACOES : recebe
    AULAS ||--o{ AVALIACOES : relaciona

    TURMAS ||--o{ MATERIAIS : disponibiliza
    USUARIOS ||--o{ MATERIAIS : publica

    ALUNOS ||--o{ DOCUMENTOS_ALUNO : entrega
    MATRICULAS ||--o| CERTIFICADOS : gera
    USUARIOS ||--o{ CERTIFICADOS : emite

    PERFIS {
        uuid id PK
        varchar nome UK
        text descricao
        smallint nivel_acesso
        boolean ativo
    }

    USUARIOS {
        uuid id PK
        uuid perfil_id FK
        varchar nome
        varchar email UK
        varchar cpf UK
        varchar senha
        varchar status
        timestamptz data_criacao
        timestamptz ultimo_login
    }

    RECUPERACOES_SENHA {
        uuid id PK
        uuid usuario_id FK
        varchar token_hash UK
        timestamptz solicitado_em
        timestamptz expira_em
        timestamptz usado_em
        varchar ip_solicitante
        text user_agent
    }

    ALUNOS {
        uuid id PK
        uuid usuario_id FK
        varchar telefone
        date data_nascimento
        boolean is_aluno_unipe
        varchar curso_unipe
        varchar treinamento
        varchar rgm UK
        timestamptz data_cadastro
    }

    INSTRUTORES {
        uuid id PK
        uuid usuario_id FK
        varchar telefone
        varchar area_atuacao
        varchar formacao
        boolean ativo
    }

    COORDENADORES {
        uuid id PK
        uuid usuario_id FK
        varchar telefone
        varchar area_coordenacao
        boolean ativo
    }

    TREINAMENTOS {
        uuid id PK
        varchar nome UK
        text descricao
        integer carga_horaria
        boolean ativo
    }

    TURMAS {
        uuid id PK
        uuid treinamento_id FK
        uuid instrutor_id FK
        uuid coordenador_id FK
        varchar codigo UK
        varchar nome
        varchar turno
        varchar local
        varchar status
        integer capacidade
        date data_inicio
        date data_fim
    }

    MATRICULAS {
        uuid id PK
        uuid aluno_id FK
        uuid treinamento_id FK
        uuid turma_id FK
        varchar status
        integer progresso
        date data_matricula
        date data_conclusao
    }

    AULAS {
        uuid id PK
        uuid turma_id FK
        integer numero_aula
        varchar titulo
        text conteudo
        date data_aula
        time hora_inicio
        time hora_fim
        varchar status
    }

    FREQUENCIAS {
        uuid id PK
        uuid matricula_id FK
        uuid aula_id FK
        date data_aula
        boolean presente
        text observacao
    }

    AVALIACOES {
        uuid id PK
        uuid matricula_id FK
        uuid aula_id FK
        varchar descricao
        numeric nota
        date data_avaliacao
    }

    MATERIAIS {
        uuid id PK
        uuid turma_id FK
        uuid publicado_por_id FK
        varchar titulo
        varchar tipo
        text url_arquivo
        integer tamanho_bytes
        varchar status
    }

    DOCUMENTOS_ALUNO {
        uuid id PK
        uuid aluno_id FK
        varchar tipo
        varchar status
        date data_envio
        date data_validacao
        text observacao
    }

    CERTIFICADOS {
        uuid id PK
        uuid matricula_id FK
        varchar codigo UK
        varchar status
        date data_emissao
        text url_arquivo
        uuid emitido_por_id FK
    }
```

## Perfis do sistema

| Perfil | Uso previsto |
|---|---|
| `aluno` | Acessar dashboard pessoal, curso, faltas, notas, documentos e certificado |
| `instrutor` | Gerenciar turmas, presencas, aulas e materiais |
| `coordenador` | Acompanhar cursos, turmas, alunos, documentos e relatorios |
| `admin` | Gerenciar usuarios, permissoes e configuracoes gerais |

## Status padronizados

`usuarios.status`:

- `ativo`
- `inativo`
- `bloqueado`
- `pendente_ativacao`

`turmas.status`:

- `planejada`
- `em_andamento`
- `concluida`
- `cancelada`

`matriculas.status`:

- `em_andamento`
- `aprovado`
- `reprovado_falta`
- `cancelado`

`aulas.status`:

- `planejada`
- `realizada`
- `cancelada`

`documentos_aluno.status`:

- `pendente`
- `enviado`
- `aprovado`
- `recusado`

`certificados.status`:

- `pendente`
- `emitido`
- `cancelado`

## Observacoes para integracao

- Todo usuario possui CPF unico. O login universal consulta e-mail ou CPF em `usuarios`, valida
  `usuarios.senha` e usa `perfis.nome` para determinar a area de destino.
- `alunos`, `instrutores` e `coordenadores` apontam para `usuarios` por
  `usuario_id`; o contrato de login retorna tambem o ID do perfil especifico.
- `recuperacoes_senha` deve armazenar apenas o hash do token. O token puro
  deve existir somente no link enviado ao usuario.
- A expiracao padrao de recuperacao de senha e de 15 minutos. O backend deve
  consultar a ultima solicitacao do usuario antes de criar um novo token.
- `matriculas.turma_id` permite alimentar a tela do aluno e as telas do
  instrutor/coordenador com a mesma fonte de dados.
- `aulas`, `frequencias` e `materiais` sustentam a tela do instrutor.
- `certificados` permite gerar e consultar certificado quando a matricula for
  aprovada.
