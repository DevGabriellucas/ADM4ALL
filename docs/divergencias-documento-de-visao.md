# Divergências — Documento de Visão vs Implementação Atual

> O Documento de Visão original está no arquivo
> `docs/documento-de-visão-administração-para-todos-2026.docx`.
> Esta análise é baseada em referência e inspeção do código atual.
> Itens marcados como "inferido" ou "pendente" ainda precisam de confirmação
> do PO.

| Tema | Documento de Visão original | Implementação atual | Decisão recomendada | Status |
|---|---|---|---|---|
| Instrutores no MVP | Não explicitamente incluídos | Incluídos com dashboard, aulas, presença e materiais | Manter no MVP (já implementado) | Resolvido |
| Materiais didáticos | Mencionados como conteúdo | Implementados com publicação, visibilidade e download autenticado | Manter no MVP (já implementado) | Resolvido |
| Certificado automático | Inferido como automático ao concluir | Manual — coordenador emite pelo painel | Automatizar na V2 | Pendente confirmação PO |
| Elegibilidade do certificado | Frequência >= 80% (inferido) | Faltas < 3 (implementado) | Pendente de confirmação com PO | Pendente |
| Mensagens internas | Previsto | Não implementado | V2 | Resolvido |
| Ex-alunos | Previsto | Não implementado | V2 | Resolvido |
| Processos administrativos | Previsto | Página "Em desenvolvimento" (sem mock) | V2 | Resolvido |
| Gestão de usuários | Previsto | Página "Em desenvolvimento" (sem mock) | V2 | Resolvido |
| Configurações | Previsto | Página "Em desenvolvimento" (sem mock); período letivo implementado | V2 para o restante | Parcialmente resolvido |
| Login por CPF | Previsto | Implementado (login aceita e-mail ou CPF) | Manter | Resolvido |
| Recuperação de senha | Previsto | Implementado com token hash, expiração de 15 min | Manter | Resolvido |
| Dashboard do aluno | Previsto | Implementado com dados reais (em andamento, aprovado, reprovado) | Manter | Resolvido |
| Dashboard do coordenador | Previsto com indicadores | Implementado sem dados mockados, com período letivo dinâmico | Manter | Resolvido |
| Relatórios | Previsto | Implementado com 6 tipos, filtros, PDF e CSV | Manter | Resolvido |
| Cronograma do coordenador | Previsto | Página "Em desenvolvimento" (depende de integração real) | V2 | Resolvido |
| Área do instrutor | Não explicitamente detalhada | Implementada com dashboard, cronograma, presença, materiais e avatar | Manter | Resolvido |
| Período letivo | Não especificado | Calculado automaticamente + editável pelo coordenador | Manter | Resolvido |
| Segurança — CPF | Não especificado | CPF nunca exposto em JSON; aparece apenas no PDF do certificado | Manter | Resolvido |
| Segurança — certificados | Não especificado | PDF em storage privado, download apenas via endpoint autenticado | Manter | Resolvido |
