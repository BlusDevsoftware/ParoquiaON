# 📊 Análise Completa do Sistema ParóquiaON

## 🎯 Visão Geral

O **ParóquiaON** é um sistema completo de gestão paroquial desenvolvido para gerenciar comunidades, pastorais, eventos, agendamentos, pessoas, usuários e relatórios. O sistema utiliza uma arquitetura moderna com separação entre frontend e backend, utilizando Supabase como banco de dados e plataforma de autenticação.

---

## 🏗️ Arquitetura do Sistema

### Estrutura Geral

```
ParoquiaON/
├── frontend/              # Interface do usuário (HTML/CSS/JS)
│   ├── src/              # Código fonte do frontend
│   │   ├── *.html        # Páginas do sistema
│   │   ├── scripts/      # JavaScript modular
│   │   ├── styles/       # Arquivos CSS
│   │   └── assets/       # Imagens e recursos
│   └── package.json      # Dependências do frontend
├── backend/              # APIs do sistema
│   ├── api-paroquiaon/  # API principal (ativa)
│   │   ├── src/
│   │   │   ├── controllers/  # Lógica de negócio
│   │   │   ├── routes/       # Definição de rotas
│   │   │   ├── middleware/   # Middlewares (auth, cors, etc)
│   │   │   └── config/       # Configurações (Supabase)
│   │   └── package.json
│   └── gateway/          # Gateway (legado, não usado)
├── database_migrations/  # Scripts de migração SQL
└── vercel.json          # Configuração de deploy
```

### Stack Tecnológica

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Vite (build tool)
- Font Awesome (ícones)
- Supabase Client SDK
- Chart.js (gráficos)

**Backend:**
- Node.js 18+
- Express.js
- Supabase (PostgreSQL + Auth + Storage)
- JWT (autenticação)
- bcryptjs (criptografia de senhas)

**Infraestrutura:**
- Vercel (deploy frontend e backend)
- Supabase (banco de dados, autenticação, storage)
- GitHub (controle de versão)

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login:**
   - Usuário informa email e senha
   - Backend valida credenciais no Supabase
   - Se senha temporária: retorna status 428 (requer troca)
   - Se senha válida: gera JWT token (24h de validade)
   - Token armazenado em `sessionStorage`

2. **Proteção de Rotas:**
   - `AuthGuard` verifica autenticação em todas as páginas
   - Valida token com backend via `/api/auth/verify`
   - Redireciona para login se não autenticado
   - Verifica permissões por página

3. **Permissões:**
   - Sistema baseado em perfis (`perfis` table)
   - Cada perfil tem colunas booleanas de permissões
   - Mapeamento página → permissão necessária
   - UI oculta elementos sem permissão

### Arquivos de Autenticação

**Frontend:**
- `frontend/src/scripts/auth-guard.js` - Proteção de rotas
- `frontend/src/scripts/apply-auth-protection.js` - Aplicação de permissões na UI
- `frontend/src/login.html` - Página de login

**Backend:**
- `backend/api-paroquiaon/src/controllers/authController.js` - Lógica de autenticação
- `backend/api-paroquiaon/src/middleware/auth.js` - Middleware de autenticação
- `backend/api-paroquiaon/src/routes/authRoutes.js` - Rotas de autenticação

### Endpoints de Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Trocar senha

---

## 📅 Sistema de Agenda

### Visão Geral

O módulo de Agenda é o mais complexo do sistema, oferecendo:
- Múltiplas visualizações (Dia, Semana, Mês, Ano)
- Criação de eventos com múltiplos períodos
- Agendamento dinâmico (seleção múltipla de dias)
- Filtros por comunidade
- Integração com todas as entidades do sistema

### Estrutura de Dados

**Tabela `agendamentos`:**
- `id` - ID único
- `titulo` - Título do evento
- `objetivo` - Descrição/objetivo
- `data_inicio` - Data/hora de início
- `data_fim` - Data/hora de fim
- `local_id` - FK para `locais`
- `acao_id` - FK para `acoes`
- `responsavel_id` - FK para `pessoas`
- `comunidade_id` - FK para `comunidades`
- `pastoral_id` - FK para `pastorais`
- `pilar_id` - FK para `pilares`
- `status_id` - FK para `status_agendamento`
- `usuario_lancamento_id` - FK para `usuarios`
- `evento_paroquial` - Boolean
- `visibilidade` - Enum (Publico, Privado, Restrito)

### Funcionalidades

#### 1. Visualizações

**Semanal (Padrão):**
- Grid 7 colunas (Domingo a Sábado)
- Coluna de horários (00:00 - 23:00)
- Eventos posicionados por horário
- Navegação por setas (semana anterior/próxima)
- Botão "Hoje"

**Mensal:**
- Calendário mensal completo
- Eventos exibidos nos dias
- Navegação por mês

**Anual:**
- Visão de 12 meses
- Estatísticas por mês

**Diária:**
- Lista de eventos do dia
- Ordenação por horário

#### 2. Criação de Eventos

**Modo Simples:**
- Formulário com campos básicos
- Adiciona um período por vez
- Suporte a múltiplos dias (data início e fim)

**Modo Dinâmico:**
- Mini calendário interativo
- Seleção múltipla de dias
- Um horário aplicado a todos os dias
- Criação em massa de períodos

#### 3. Filtros

- Filtro por comunidade (dropdown)
- Persistência da seleção
- Opção "Todas as Comunidades"

### Arquivos da Agenda

**Frontend:**
- `frontend/src/agenda.html` - Página principal (8141 linhas)
- `frontend/src/modais_agenda.html` - Modais de criação/edição
- `frontend/src/scripts/agenda/api.js` - Wrapper da API
- `frontend/src/scripts/agenda/data-cache.js` - Cache de dados
- `frontend/src/scripts/agenda/ui-utils.js` - Utilitários de UI
- `frontend/src/scripts/agenda/selects.js` - População de selects
- `frontend/src/scripts/agenda/date-utils.js` - Utilitários de data

**Backend:**
- `backend/api-paroquiaon/src/controllers/agendaController.js` - Lógica de negócio
- `backend/api-paroquiaon/src/routes/agendaRoutes.js` - Rotas da API

### Endpoints da Agenda

- `GET /api/agenda` - Listar todos os eventos
- `GET /api/agenda/:id` - Buscar evento específico
- `POST /api/agenda` - Criar evento
- `PUT /api/agenda/:id` - Atualizar evento
- `DELETE /api/agenda/:id` - Excluir evento
- `GET /api/agenda/estatisticas` - Estatísticas
- `GET /api/agenda/graficos` - Dados para gráficos

---

## 👥 Módulos de Gestão

### 1. Comunidades

**Funcionalidades:**
- CRUD completo
- Upload de fotos (Supabase Storage)
- Campos: nome, telefone, endereço, data fundação, status, conselho membros, responsáveis, foto, cor

**Arquivos:**
- Frontend: `frontend/src/comunidades.html`
- Backend: `backend/api-paroquiaon/src/controllers/comunidadeController.js`
- Rotas: `backend/api-paroquiaon/src/routes/comunidadeRoutes.js`

**Endpoints:**
- `GET /api/comunidades` - Listar
- `GET /api/comunidades/:id` - Buscar
- `POST /api/comunidades` - Criar
- `PUT /api/comunidades/:id` - Atualizar
- `DELETE /api/comunidades/:id` - Excluir

### 2. Pastorais

**Funcionalidades:**
- CRUD completo
- Campos: nome, descrição, status, usuario_id (autoria)

**Arquivos:**
- Frontend: `frontend/src/pastorais.html`
- Backend: `backend/api-paroquiaon/src/controllers/pastoralController.js`
- Rotas: `backend/api-paroquiaon/src/routes/pastoralRoutes.js`

**Endpoints:**
- `GET /api/pastorais` - Listar
- `GET /api/pastorais/:id` - Buscar
- `POST /api/pastorais` - Criar
- `PUT /api/pastorais/:id` - Atualizar
- `DELETE /api/pastorais/:id` - Excluir

### 3. Pilares

**Funcionalidades:**
- CRUD completo
- Campos: nome, descrição, status, status_text, usuario_id (autoria)

**Arquivos:**
- Frontend: `frontend/src/pilares.html`
- Backend: `backend/api-paroquiaon/src/controllers/pilarController.js`
- Rotas: `backend/api-paroquiaon/src/routes/pilarRoutes.js`

**Endpoints:**
- `GET /api/pilares` - Listar
- `GET /api/pilares/:id` - Buscar
- `POST /api/pilares` - Criar
- `PUT /api/pilares/:id` - Atualizar
- `DELETE /api/pilares/:id` - Excluir

### 4. Locais

**Funcionalidades:**
- CRUD completo
- Campos: nome, endereço, capacidade, descrição, status, usuario_id (autoria)

**Arquivos:**
- Frontend: `frontend/src/locais.html`
- Backend: `backend/api-paroquiaon/src/controllers/localController.js`
- Rotas: `backend/api-paroquiaon/src/routes/localRoutes.js`

**Endpoints:**
- `GET /api/locais` - Listar
- `GET /api/locais/:id` - Buscar
- `POST /api/locais` - Criar
- `PUT /api/locais/:id` - Atualizar
- `DELETE /api/locais/:id` - Excluir

### 5. Ações

**Funcionalidades:**
- CRUD completo
- Campos: nome, descrição, status, usuario_id (autoria)

**Arquivos:**
- Frontend: `frontend/src/acoes.html`
- Backend: `backend/api-paroquiaon/src/controllers/acaoController.js`
- Rotas: `backend/api-paroquiaon/src/routes/acaoRoutes.js`

**Endpoints:**
- `GET /api/acoes` - Listar
- `GET /api/acoes/:id` - Buscar
- `POST /api/acoes` - Criar
- `PUT /api/acoes/:id` - Atualizar
- `DELETE /api/acoes/:id` - Excluir

### 6. Pessoas

**Funcionalidades:**
- CRUD completo
- Upload de fotos (Supabase Storage - bucket "pessoas")
- Campos: nome, telefone, endereço, status, foto, usuario_id (autoria)

**Arquivos:**
- Frontend: `frontend/src/pessoas.html`
- Backend: `backend/api-paroquiaon/src/controllers/pessoaController.js`
- Rotas: `backend/api-paroquiaon/src/routes/pessoaRoutes.js`

**Endpoints:**
- `GET /api/pessoas` - Listar
- `GET /api/pessoas/:id` - Buscar
- `POST /api/pessoas` - Criar
- `PUT /api/pessoas/:id` - Atualizar
- `DELETE /api/pessoas/:id` - Excluir

### 7. Usuários

**Funcionalidades:**
- CRUD completo
- Gestão de senhas (temporárias, troca obrigatória)
- Vinculação com pessoas
- Atribuição de perfis
- Campos: email, senha, senha_temporaria, ativo, perfil_id, pessoa_id, ultimo_login

**Arquivos:**
- Frontend: `frontend/src/usuarios.html`
- Backend: `backend/api-paroquiaon/src/controllers/usuarioController.js`
- Rotas: `backend/api-paroquiaon/src/routes/usuarioRoutes.js`

**Endpoints:**
- `GET /api/usuarios` - Listar
- `GET /api/usuarios/:id` - Buscar
- `POST /api/usuarios` - Criar
- `PUT /api/usuarios/:id` - Atualizar
- `DELETE /api/usuarios/:id` - Excluir
- `POST /api/usuarios/:id/reset-password` - Resetar senha

### 8. Perfis

**Funcionalidades:**
- CRUD completo
- Matriz de permissões (colunas booleanas)
- Campos: nome, status, + colunas de permissões (pastorais_ver, pastorais_criar, etc.)

**Arquivos:**
- Frontend: `frontend/src/perfil.html`
- Backend: `backend/api-paroquiaon/src/controllers/perfilController.js`
- Rotas: `backend/api-paroquiaon/src/routes/perfilRoutes.js`

**Endpoints:**
- `GET /api/perfis` - Listar
- `GET /api/perfis/:id` - Buscar
- `POST /api/perfis` - Criar
- `PUT /api/perfis/:id` - Atualizar
- `DELETE /api/perfis/:id` - Excluir

### 9. Status de Agendamento

**Funcionalidades:**
- Listagem de status disponíveis
- Campos: id, nome, descrição

**Arquivos:**
- Backend: `backend/api-paroquiaon/src/controllers/statusController.js`
- Rotas: `backend/api-paroquiaon/src/routes/statusRoutes.js`

**Endpoints:**
- `GET /api/status-agendamento` - Listar todos

---

## 📊 Relatórios e Dashboard

### Dashboard

**Funcionalidades:**
- Visão geral do sistema
- Estatísticas de comunidades
- Gráficos e métricas

**Arquivos:**
- Frontend: `frontend/src/index.html`
- Backend: `backend/api-paroquiaon/src/controllers/dashboardController.js`
- Rotas: `backend/api-paroquiaon/src/routes/dashboardRoutes.js`

**Endpoints:**
- `GET /api/dashboard` - Dados do dashboard

### Relatórios

**Funcionalidades:**
- Relatórios dinâmicos
- Filtros avançados
- Exportação de dados

**Arquivos:**
- Frontend: `frontend/src/relatorios.html`
- Backend: `backend/api-paroquiaon/src/controllers/relatorioController.js`
- Rotas: `backend/api-paroquiaon/src/routes/relatorioRoutes.js`

**Endpoints:**
- `GET /api/relatorios` - Listar relatórios
- `POST /api/relatorios` - Gerar relatório

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

1. **usuarios** - Usuários do sistema
   - id, email, senha, senha_temporaria, ativo, perfil_id, pessoa_id, ultimo_login

2. **pessoas** - Pessoas físicas
   - id, nome, telefone, endereco, status, foto, usuario_id

3. **comunidades** - Comunidades paroquiais
   - id, codigo, nome, telefone, endereco, data_fundacao, status, foto, cor, conselho_membros, responsaveis

4. **pastorais** - Pastorais
   - id, nome, descricao, status, usuario_id, criado_por_email, criado_por_nome

5. **pilares** - Pilares
   - id, nome, descricao, status, status_text, usuario_id, criado_por_email, criado_por_nome

6. **locais** - Locais de eventos
   - id, nome, endereco, capacidade, descricao, status, usuario_id, criado_por_email, criado_por_nome

7. **acoes** - Ações/atividades
   - id, nome, descricao, status, usuario_id, criado_por_email, criado_por_nome

8. **agendamentos** - Eventos/agendamentos
   - id, titulo, objetivo, data_inicio, data_fim, local_id, acao_id, responsavel_id, comunidade_id, pastoral_id, pilar_id, status_id, usuario_lancamento_id, evento_paroquial, visibilidade

9. **status_agendamento** - Status dos agendamentos
   - id, nome, descricao

10. **perfis** - Perfis de acesso
    - id, nome, status, + colunas de permissões (pastorais_ver, pastorais_criar, etc.)

### Relacionamentos

- `usuarios.pessoa_id` → `pessoas.id`
- `usuarios.perfil_id` → `perfis.id`
- `agendamentos.local_id` → `locais.id`
- `agendamentos.acao_id` → `acoes.id`
- `agendamentos.responsavel_id` → `pessoas.id`
- `agendamentos.comunidade_id` → `comunidades.id`
- `agendamentos.pastoral_id` → `pastorais.id`
- `agendamentos.pilar_id` → `pilares.id`
- `agendamentos.status_id` → `status_agendamento.id`
- `agendamentos.usuario_lancamento_id` → `usuarios.id`

### Storage (Supabase)

- **Bucket "comunidade"** - Fotos de comunidades
- **Bucket "pessoas"** - Fotos de pessoas

---

## 🔧 Configuração e Deploy

### Variáveis de Ambiente

**Backend (.env):**
- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_KEY` - Service role key do Supabase
- `JWT_SECRET` - Chave secreta para JWT
- `PORT` - Porta do servidor (padrão: 3000)

**Frontend (.env ou Vercel):**
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `VITE_API_URL` - URL da API backend

### Deploy

**Vercel:**
- Frontend e backend deployados na Vercel
- Configuração em `vercel.json`
- Rotas `/api/*` → backend
- Rotas `/*` → frontend

**Build:**
- Frontend: `npm run build` (Vite)
- Backend: Node.js serverless functions

---

## 🔄 Fluxos Principais

### 1. Fluxo de Login

1. Usuário acessa qualquer página
2. `AuthGuard` verifica autenticação
3. Se não autenticado → redireciona para `/login.html`
4. Usuário informa email e senha
5. Frontend envia para `POST /api/auth/login`
6. Backend valida no Supabase
7. Se válido → retorna JWT token
8. Frontend armazena token em `sessionStorage`
9. Redireciona para página original ou dashboard

### 2. Fluxo de Criação de Evento

1. Usuário clica em "Novo Agendamento"
2. Modal abre com formulário
3. Usuário preenche dados (título, comunidade, etc.)
4. Adiciona períodos (simples ou dinâmico)
5. Validação frontend
6. Envia para `POST /api/agenda` (um evento por período)
7. Backend valida e insere no Supabase
8. Frontend recarrega eventos
9. Atualiza visualização

### 3. Fluxo de Upload de Foto

1. Usuário seleciona imagem (base64)
2. Frontend envia para backend (campo `foto` como base64)
3. Backend detecta base64
4. Converte para Buffer
5. Faz upload para Supabase Storage
6. Obtém URL pública
7. Atualiza registro com URL
8. Retorna dados atualizados

---

## 🛡️ Segurança

### Implementações

1. **Autenticação JWT:**
   - Tokens com expiração (24h)
   - Validação em todas as rotas protegidas
   - Refresh automático

2. **Criptografia:**
   - Senhas com bcryptjs
   - Hash antes de armazenar

3. **Rate Limiting:**
   - 1000 requisições por IP a cada 15 minutos
   - Prevenção de DDoS

4. **CORS:**
   - Configurado para permitir apenas origens específicas
   - Middleware customizado

5. **Helmet:**
   - Headers de segurança HTTP
   - Proteção contra XSS, clickjacking, etc.

6. **Validação:**
   - Validação de dados no backend
   - Sanitização de inputs
   - Validação de foreign keys

7. **Permissões:**
   - Sistema baseado em perfis
   - Verificação de permissões por ação
   - UI oculta elementos sem permissão

---

## 📱 Interface do Usuário

### Componentes Principais

1. **Menu Superior:**
   - Logo
   - Navegação principal
   - Menu hamburger (mobile)
   - Perfil do usuário

2. **Sidebar:**
   - Menu lateral (desktop)
   - Links para todas as páginas
   - Filtros (na agenda)

3. **Modais:**
   - Criação/edição de registros
   - Confirmações
   - Formulários complexos

4. **Toasts:**
   - Notificações de sucesso/erro
   - Feedback visual

### Responsividade

- Design responsivo
- Menu hamburger em mobile
- Sidebar colapsável
- Grid adaptativo

---

## 🔍 Detalhes Técnicos

### API Client (Frontend)

**Arquivo:** `frontend/src/scripts/config/api.js`

- Wrapper para requisições HTTP
- Adiciona headers de autenticação automaticamente
- Tratamento de erros
- Endpoints pré-definidos

### Cache de Dados

**Arquivo:** `frontend/src/scripts/agenda/data-cache.js`

- Cache em memória de listas (comunidades, pastorais, etc.)
- Evita requisições repetidas
- Atualização sob demanda

### Utilitários de Data

**Arquivo:** `frontend/src/scripts/agenda/date-utils.js`

- Normalização de datas
- Conversão de timezones
- Formatação para exibição

### Middlewares (Backend)

1. **auth.js** - Autenticação JWT
2. **cors.js** - Configuração CORS
3. **errorHandler.js** - Tratamento de erros
4. **validation.js** - Validação de dados

---

## 📈 Melhorias e Recursos Futuros

### Identificados no Código

1. **Realtime:**
   - Arquivos `realtime-global.js`, `realtime-bus.js` existem mas são stubs
   - Possível implementação futura de atualizações em tempo real

2. **Testes:**
   - Estrutura de testes preparada (`frontend/js/tests/`)
   - Não implementado completamente

3. **Documentação:**
   - READMEs existentes
   - Análise da agenda já documentada
   - Falta documentação técnica completa

---

## 🐛 Pontos de Atenção

1. **Gateway Legado:**
   - Pasta `backend/gateway/` existe mas não é usada
   - API principal está em `backend/api-paroquiaon/`

2. **Duplicação de Código:**
   - Alguns arquivos duplicados entre `frontend/js/` e `frontend/src/scripts/`
   - Possível refatoração necessária

3. **Tamanho do arquivo agenda.html:**
   - 8141 linhas em um único arquivo
   - Considerar modularização

4. **Timezone:**
   - Múltiplas migrações relacionadas a timezone
   - Garantir consistência

---

## 📝 Conclusão

O sistema ParóquiaON é uma aplicação completa e bem estruturada para gestão paroquial. Possui:

✅ **Pontos Fortes:**
- Arquitetura moderna e escalável
- Separação clara frontend/backend
- Sistema de autenticação robusto
- Módulo de agenda completo e funcional
- Integração com Supabase (banco, auth, storage)
- Sistema de permissões flexível

⚠️ **Áreas de Melhoria:**
- Modularização de arquivos grandes
- Implementação completa de testes
- Documentação técnica mais detalhada
- Limpeza de código legado
- Implementação de realtime (se necessário)

O sistema está pronto para produção e pode ser expandido conforme necessário.

---

**Data da Análise:** 23 de Janeiro de 2026
**Versão do Sistema:** 1.0.0
**Analista:** AI Assistant
