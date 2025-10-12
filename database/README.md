# Scripts de Banco de Dados - ParóquiaON

Este diretório contém os scripts SQL necessários para configurar o banco de dados do sistema ParóquiaON.

## 📁 Arquivos Disponíveis

### 1. `create_tables_paroquiaon.sql`
**Script principal para criar todas as tabelas do sistema.**

**O que faz:**
- Cria todas as tabelas necessárias
- Define relacionamentos (foreign keys)
- Cria índices para performance
- Configura triggers para `updated_at`
- Insere dados iniciais (perfis, pilares, usuário admin)

**Como executar:**
```sql
-- No Supabase SQL Editor ou pgAdmin
\i create_tables_paroquiaon.sql
```

### 2. `seed_data_paroquiaon.sql`
**Script para inserir dados de exemplo no sistema.**

**O que faz:**
- Insere comunidades de exemplo
- Insere pessoas de exemplo
- Insere locais e ações
- Insere eventos na agenda
- Insere recebimentos financeiros
- Insere conferências

**Como executar:**
```sql
-- Execute APÓS o create_tables_paroquiaon.sql
\i seed_data_paroquiaon.sql
```

### 3. `check_database_structure.sql`
**Script para verificar se tudo foi criado corretamente.**

**O que faz:**
- Verifica se todas as tabelas existem
- Verifica estrutura das colunas
- Verifica índices e triggers
- Conta registros em cada tabela
- Testa funcionalidades básicas

**Como executar:**
```sql
-- Execute para verificar a instalação
\i check_database_structure.sql
```

## 🚀 Instalação Passo a Passo

### Opção 1: Supabase (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Execute o script principal**
   - Vá para SQL Editor
   - Cole o conteúdo de `create_tables_paroquiaon.sql`
   - Clique em "Run"

3. **Execute o script de dados de exemplo** (opcional)
   - Cole o conteúdo de `seed_data_paroquiaon.sql`
   - Clique em "Run"

4. **Verifique a instalação**
   - Cole o conteúdo de `check_database_structure.sql`
   - Clique em "Run"

### Opção 2: PostgreSQL Local

1. **Conecte ao banco**
   ```bash
   psql -h localhost -U seu_usuario -d paroquiaon
   ```

2. **Execute os scripts**
   ```sql
   \i create_tables_paroquiaon.sql
   \i seed_data_paroquiaon.sql
   \i check_database_structure.sql
   ```

### Opção 3: pgAdmin

1. **Abra o pgAdmin**
2. **Conecte ao servidor**
3. **Abra Query Tool**
4. **Execute os scripts na ordem**

## 📊 Estrutura das Tabelas

### Tabelas Principais
- **perfis** - Perfis de acesso ao sistema
- **pessoas** - Pessoas da paróquia
- **usuarios** - Usuários do sistema
- **comunidades** - Comunidades paroquiais
- **pastorais** - Pastorais
- **pilares** - Pilares da paróquia
- **locais** - Locais e espaços físicos
- **acoes** - Ações e atividades
- **eventos** - Agenda de eventos
- **relatorios** - Relatórios gerados
- **recebimentos** - Recebimentos financeiros
- **conferencias** - Conferências e eventos especiais
- **sincronizacoes** - Controle de sincronização

### Relacionamentos
- `usuarios` → `perfis` (perfil_id)
- `usuarios` → `pessoas` (pessoa_id)
- `pastorais` → `pessoas` (responsavel_id)
- `pastorais` → `comunidades` (comunidade_id)
- `acoes` → `pilares` (pilar_id)
- `eventos` → `locais` (local_id)
- `eventos` → `acoes` (acao_id)
- `eventos` → `pessoas` (responsavel_id)

## 🔐 Dados Iniciais

### Perfis Criados
1. **Administrador** - Acesso total
2. **Coordenador** - Gestão de comunidades e pastorais
3. **Secretário** - Cadastros e agenda
4. **Visualizador** - Apenas visualização

### Pilares Criados
1. **Formação** - Formação cristã e catequese
2. **Caridade** - Caridade e solidariedade
3. **Liturgia** - Liturgia e celebração
4. **Comunhão** - Comunhão e fraternidade
5. **Missão** - Missão e evangelização

### Usuário Administrador
- **Email:** admin@paroquia.com
- **Login:** admin
- **Senha:** admin123 (altere após primeiro login)

## ⚠️ Importante

1. **Altere a senha do administrador** após o primeiro login
2. **Configure as variáveis de ambiente** da API com as credenciais do Supabase
3. **Execute os scripts na ordem** para evitar erros
4. **Faça backup** antes de executar em produção

## 🔧 Configuração da API

Após criar as tabelas, configure as variáveis de ambiente:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anonima
JWT_SECRET=sua-chave-secreta-jwt
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do Supabase
2. **Execute o script de verificação** (`check_database_structure.sql`)
3. **Consulte a documentação** do Supabase
4. **Entre em contato** através do GitHub Issues

---

**ParóquiaON Database** - Sistema de gestão paroquial com banco de dados robusto e escalável.
