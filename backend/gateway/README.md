# eGerente Gateway API

Gateway API para o sistema eGerente, responsável por gerenciar as requisições entre o frontend e o banco de dados Supabase.

## Requisitos

- Node.js 18 ou superior
- Conta no Supabase
- PostgreSQL

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com suas credenciais do Supabase

## Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Execute os seguintes comandos SQL para criar as tabelas necessárias:

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de colaboradores
CREATE TABLE colaboradores (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(50) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de clientes
CREATE TABLE clientes (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(2) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de produtos
CREATE TABLE produtos (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INTEGER NOT NULL,
    estoqueMinimo INTEGER NOT NULL,
    fornecedor VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de serviços
CREATE TABLE servicos (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    duracao INTEGER NOT NULL,
    responsavel VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## Executando o projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Endpoints

### Usuários
- `GET /api/usuarios` - Lista todos os usuários
- `GET /api/usuarios/:codigo` - Busca um usuário pelo código
- `POST /api/usuarios` - Cria um novo usuário
- `PUT /api/usuarios/:codigo` - Atualiza um usuário
- `DELETE /api/usuarios/:codigo` - Exclui um usuário

### Colaboradores
- `GET /api/colaboradores` - Lista todos os colaboradores
- `GET /api/colaboradores/:codigo` - Busca um colaborador pelo código
- `POST /api/colaboradores` - Cria um novo colaborador
- `PUT /api/colaboradores/:codigo` - Atualiza um colaborador
- `DELETE /api/colaboradores/:codigo` - Exclui um colaborador

### Clientes
- `GET /api/clientes` - Lista todos os clientes
- `GET /api/clientes/:codigo` - Busca um cliente pelo código
- `POST /api/clientes` - Cria um novo cliente
- `PUT /api/clientes/:codigo` - Atualiza um cliente
- `DELETE /api/clientes/:codigo` - Exclui um cliente

### Produtos
- `GET /api/produtos` - Lista todos os produtos
- `GET /api/produtos/:codigo` - Busca um produto pelo código
- `POST /api/produtos` - Cria um novo produto
- `PUT /api/produtos/:codigo` - Atualiza um produto
- `DELETE /api/produtos/:codigo` - Exclui um produto

### Serviços
- `GET /api/servicos` - Lista todos os serviços
- `GET /api/servicos/:codigo` - Busca um serviço pelo código
- `POST /api/servicos` - Cria um novo serviço
- `PUT /api/servicos/:codigo` - Atualiza um serviço
- `DELETE /api/servicos/:codigo` - Exclui um serviço

## Segurança

- CORS habilitado
- Rate limiting (100 requisições por IP a cada 15 minutos)
- Helmet para segurança HTTP
- Autenticação via Supabase 