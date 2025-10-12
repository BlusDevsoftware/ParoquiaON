# Migração: Novas Colunas na Tabela de Clientes

## 📅 Data da Migração
**27 de Janeiro de 2025**

## 🎯 Objetivo
Adicionar novas colunas na tabela `clientes` para suportar os campos adicionados no modal de cadastro do frontend.

## 🔄 Colunas Adicionadas

### 1. **responsavel** (VARCHAR(100))
- **Descrição**: Nome do responsável pelo cliente
- **Tipo**: VARCHAR(100)
- **Nullable**: Sim
- **Comentário**: Nome do responsável pelo cliente

### 2. **contato** (VARCHAR(100))
- **Descrição**: Telefone ou email de contato
- **Tipo**: VARCHAR(100)
- **Nullable**: Sim
- **Comentário**: Telefone ou email de contato

### 3. **observacao** (VARCHAR(100))
- **Descrição**: Observações sobre o cliente
- **Tipo**: VARCHAR(100)
- **Nullable**: Sim
- **Comentário**: Observações sobre o cliente (máximo 100 caracteres)

## 🔍 Colunas Verificadas/Criadas

### 4. **status** (VARCHAR(20))
- **Descrição**: Status do cliente (ativo/inativo)
- **Tipo**: VARCHAR(20)
- **Nullable**: Não (NOT NULL)
- **Default**: 'ativo'
- **Comentário**: Status do cliente (ativo/inativo)

### 5. **codigo_crm** (VARCHAR(50))
- **Descrição**: Código do cliente no CRM
- **Tipo**: VARCHAR(50)
- **Nullable**: Sim
- **Comentário**: Código do cliente no CRM

### 6. **documento** (VARCHAR(20))
- **Descrição**: CNPJ ou CPF do cliente
- **Tipo**: VARCHAR(20)
- **Nullable**: Sim
- **Comentário**: CNPJ ou CPF do cliente

### 7. **updated_at** (TIMESTAMP WITH TIME ZONE)
- **Descrição**: Data da última atualização do registro
- **Tipo**: TIMESTAMP WITH TIME ZONE
- **Nullable**: Não (NOT NULL)
- **Default**: NOW()
- **Comentário**: Data da última atualização do registro

## 🚀 Script de Migração

O arquivo `database_migrations/add_clientes_new_columns.sql` contém o script completo para:

1. **Adicionar as novas colunas**
2. **Verificar e criar colunas que podem não existir**
3. **Adicionar comentários nas colunas**
4. **Criar trigger para atualizar `updated_at`**
5. **Verificar a estrutura final da tabela**

## 🔧 Backend Atualizado

### Controller de Clientes (`clienteController.js`)
- **Função `criarCliente`**: Atualizada para receber e salvar as novas colunas
- **Função `atualizarCliente`**: Atualizada para receber e atualizar as novas colunas
- **Função `listarClientes`**: Já retorna todas as colunas (`select *`)
- **Função `buscarCliente`**: Já retorna todas as colunas (`select *`)

## 📋 Estrutura Final da Tabela

```sql
CREATE TABLE clientes (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(2) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    codigo_crm VARCHAR(50),
    documento VARCHAR(20),
    responsavel VARCHAR(100),
    contato VARCHAR(100),
    observacao VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## ✅ Como Executar

1. **Execute o script SQL** no seu banco de dados Supabase:
   ```bash
   psql -h [HOST] -U [USER] -d [DATABASE] -f database_migrations/add_clientes_new_columns.sql
   ```

2. **Reinicie o backend** para que as mudanças sejam aplicadas

3. **Teste o frontend** para verificar se os novos campos estão funcionando

## 🧪 Testes Recomendados

1. **Criar novo cliente** com todos os campos preenchidos
2. **Editar cliente existente** e verificar se os novos campos são salvos
3. **Visualizar cliente** e confirmar se todos os campos são exibidos
4. **Listar clientes** e verificar se a coluna de status está funcionando

## ⚠️ Observações Importantes

- **Compatibilidade**: O script verifica se as colunas já existem antes de criar
- **Dados existentes**: Clientes já cadastrados terão valores NULL nas novas colunas
- **Frontend**: Já está preparado para trabalhar com as novas colunas
- **API**: Backend já foi atualizado para suportar as novas colunas

## 🔗 Arquivos Modificados

- `database_migrations/add_clientes_new_columns.sql` (NOVO)
- `backend/gateway/src/controllers/clienteController.js` (ATUALIZADO)
- `frontend/src/clientes.html` (JÁ ATUALIZADO ANTERIORMENTE)

---

**Status**: ✅ Migração Preparada  
**Próximo Passo**: Executar o script SQL no banco de dados
