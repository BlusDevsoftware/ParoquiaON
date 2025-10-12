-- Script para limpar e recriar todas as tabelas do ParóquiaON
-- ⚠️ ATENÇÃO: Este script irá APAGAR todos os dados existentes!
-- Use apenas em desenvolvimento ou quando quiser recriar tudo do zero

-- ==============================================
-- LIMPEZA COMPLETA (CUIDADO!)
-- ==============================================

-- Desabilitar triggers temporariamente
SET session_replication_role = replica;

-- Remover todos os triggers primeiro
DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
DROP TRIGGER IF EXISTS update_pessoas_updated_at ON pessoas;
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_comunidades_updated_at ON comunidades;
DROP TRIGGER IF EXISTS update_pastorais_updated_at ON pastorais;
DROP TRIGGER IF EXISTS update_pilares_updated_at ON pilares;
DROP TRIGGER IF EXISTS update_locais_updated_at ON locais;
DROP TRIGGER IF EXISTS update_acoes_updated_at ON acoes;
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
DROP TRIGGER IF EXISTS update_recebimentos_updated_at ON recebimentos;
DROP TRIGGER IF EXISTS update_conferencias_updated_at ON conferencias;
DROP TRIGGER IF EXISTS update_sincronizacoes_updated_at ON sincronizacoes;

-- Remover todas as tabelas (em ordem reversa devido às foreign keys)
DROP TABLE IF EXISTS sincronizacoes CASCADE;
DROP TABLE IF EXISTS conferencias CASCADE;
DROP TABLE IF EXISTS recebimentos CASCADE;
DROP TABLE IF EXISTS relatorios CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS acoes CASCADE;
DROP TABLE IF EXISTS locais CASCADE;
DROP TABLE IF EXISTS pilares CASCADE;
DROP TABLE IF EXISTS pastorais CASCADE;
DROP TABLE IF EXISTS comunidades CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS pessoas CASCADE;
DROP TABLE IF EXISTS perfis CASCADE;

-- Remover a função
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- ==============================================
-- RECRIAR TUDO DO ZERO
-- ==============================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- TABELA DE PERFIS DE ACESSO
-- ==============================================
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    permissoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE PESSOAS
-- ==============================================
CREATE TABLE pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    foto TEXT,
    email VARCHAR(255),
    data_nascimento DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE USUÁRIOS
-- ==============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    login VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil_id INTEGER REFERENCES perfis(id),
    pessoa_id INTEGER REFERENCES pessoas(id),
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE COMUNIDADES
-- ==============================================
CREATE TABLE comunidades (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    data_fundacao DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
    foto TEXT,
    conselho_membros JSONB,
    responsaveis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE PASTORAIS
-- ==============================================
CREATE TABLE pastorais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel_id INTEGER REFERENCES pessoas(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE PILARES
-- ==============================================
CREATE TABLE pilares (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#1976d2',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE LOCAIS
-- ==============================================
CREATE TABLE locais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    capacidade INTEGER,
    tipo VARCHAR(50) DEFAULT 'Sala',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE AÇÕES
-- ==============================================
CREATE TABLE acoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    pilar_id INTEGER REFERENCES pilares(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE EVENTOS DA AGENDA
-- ==============================================
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    local_id INTEGER REFERENCES locais(id),
    acao_id INTEGER REFERENCES acoes(id),
    responsavel_id INTEGER REFERENCES pessoas(id),
    status VARCHAR(20) DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Cancelado', 'Realizado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE RELATÓRIOS
-- ==============================================
CREATE TABLE relatorios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    parametros JSONB DEFAULT '{}',
    dados JSONB DEFAULT '{}',
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE RECEBIMENTOS
-- ==============================================
CREATE TABLE recebimentos (
    id SERIAL PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL,
    data_recebimento DATE NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    pessoa_id INTEGER REFERENCES pessoas(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    status VARCHAR(20) DEFAULT 'Confirmado' CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE CONFERÊNCIAS
-- ==============================================
CREATE TABLE conferencias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    local_id INTEGER REFERENCES locais(id),
    responsavel_id INTEGER REFERENCES pessoas(id),
    participantes JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Em Andamento', 'Concluida', 'Cancelada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TABELA DE SINCRONIZAÇÃO
-- ==============================================
CREATE TABLE sincronizacoes (
    id SERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    registro_id INTEGER NOT NULL,
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('CREATE', 'UPDATE', 'DELETE')),
    dados JSONB,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Sincronizado', 'Erro')),
    erro TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ==============================================

-- Índices para usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_login ON usuarios(login);
CREATE INDEX idx_usuarios_perfil_id ON usuarios(perfil_id);
CREATE INDEX idx_usuarios_pessoa_id ON usuarios(pessoa_id);

-- Índices para comunidades
CREATE INDEX idx_comunidades_codigo ON comunidades(codigo);
CREATE INDEX idx_comunidades_nome ON comunidades(nome);
CREATE INDEX idx_comunidades_status ON comunidades(status);

-- Índices para pessoas
CREATE INDEX idx_pessoas_nome ON pessoas(nome);
CREATE INDEX idx_pessoas_email ON pessoas(email);
CREATE INDEX idx_pessoas_ativo ON pessoas(ativo);

-- Índices para pastorais
CREATE INDEX idx_pastorais_nome ON pastorais(nome);
CREATE INDEX idx_pastorais_responsavel_id ON pastorais(responsavel_id);
CREATE INDEX idx_pastorais_comunidade_id ON pastorais(comunidade_id);

-- Índices para eventos
CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_eventos_local_id ON eventos(local_id);
CREATE INDEX idx_eventos_acao_id ON eventos(acao_id);

-- Índices para recebimentos
CREATE INDEX idx_recebimentos_data ON recebimentos(data_recebimento);
CREATE INDEX idx_recebimentos_pessoa_id ON recebimentos(pessoa_id);
CREATE INDEX idx_recebimentos_comunidade_id ON recebimentos(comunidade_id);

-- ==============================================
-- TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas que têm updated_at
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comunidades_updated_at BEFORE UPDATE ON comunidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pastorais_updated_at BEFORE UPDATE ON pastorais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilares_updated_at BEFORE UPDATE ON pilares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locais_updated_at BEFORE UPDATE ON locais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acoes_updated_at BEFORE UPDATE ON acoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recebimentos_updated_at BEFORE UPDATE ON recebimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conferencias_updated_at BEFORE UPDATE ON conferencias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sincronizacoes_updated_at BEFORE UPDATE ON sincronizacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- DADOS INICIAIS
-- ==============================================

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao, permissoes) VALUES
('Administrador', 'Acesso total ao sistema', '{
    "dashboard": true,
    "comunidades": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "pastorais": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "pilares": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "locais": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "acoes": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "pessoas": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "usuarios": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "perfis": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "agenda": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "relatorios": {"ver": true, "criar": true, "exportar": true},
    "recebimentos": {"ver": true, "criar": true, "editar": true, "excluir": true},
    "conferencias": {"ver": true, "criar": true, "editar": true, "excluir": true}
}'),
('Coordenador', 'Acesso a gestão de comunidades e pastorais', '{
    "dashboard": true,
    "comunidades": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "pastorais": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "pilares": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "locais": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "acoes": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "pessoas": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "agenda": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "relatorios": {"ver": true, "criar": true, "exportar": true},
    "recebimentos": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "conferencias": {"ver": true, "criar": true, "editar": true, "excluir": false}
}'),
('Secretário', 'Acesso a cadastros e agenda', '{
    "dashboard": true,
    "comunidades": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "pastorais": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "pilares": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "locais": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "acoes": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "pessoas": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "agenda": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "relatorios": {"ver": true, "criar": true, "exportar": true},
    "recebimentos": {"ver": true, "criar": true, "editar": true, "excluir": false},
    "conferencias": {"ver": true, "criar": true, "editar": true, "excluir": false}
}'),
('Visualizador', 'Apenas visualização', '{
    "dashboard": true,
    "comunidades": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "pastorais": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "pilares": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "locais": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "acoes": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "pessoas": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "agenda": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "relatorios": {"ver": true, "criar": false, "exportar": true},
    "recebimentos": {"ver": true, "criar": false, "editar": false, "excluir": false},
    "conferencias": {"ver": true, "criar": false, "editar": false, "excluir": false}
}');

-- Inserir pilares padrão
INSERT INTO pilares (nome, descricao, cor) VALUES
('Formação', 'Pilar de formação cristã e catequese', '#1976d2'),
('Caridade', 'Pilar de caridade e solidariedade', '#f44336'),
('Liturgia', 'Pilar de liturgia e celebração', '#4caf50'),
('Comunhão', 'Pilar de comunhão e fraternidade', '#ff9800'),
('Missão', 'Pilar de missão e evangelização', '#9c27b0');

-- Inserir pessoa administrador padrão
INSERT INTO pessoas (nome, email, telefone, ativo) VALUES
('Administrador do Sistema', 'admin@paroquia.com', '(11) 99999-9999', true);

-- Inserir usuário administrador padrão
INSERT INTO usuarios (email, login, senha, perfil_id, pessoa_id, ativo) VALUES
('admin@paroquia.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J5K5K5K5K', 1, 1, true);

-- ==============================================
-- MENSAGEM DE SUCESSO
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'BANCO DE DADOS PARÓQUIAON RECRIADO COM SUCESSO!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Todas as tabelas foram recriadas do zero.';
    RAISE NOTICE 'Dados iniciais inseridos.';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '==============================================';
END $$;
