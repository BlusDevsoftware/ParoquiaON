-- Script de inicialização do banco de dados ParóquiaON
-- Execute este script para criar todas as tabelas necessárias

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis de acesso
CREATE TABLE IF NOT EXISTS perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    permissoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pessoas
CREATE TABLE IF NOT EXISTS pessoas (
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

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
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

-- Tabela de comunidades
CREATE TABLE IF NOT EXISTS comunidades (
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

-- Tabela de pastorais
CREATE TABLE IF NOT EXISTS pastorais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel_id INTEGER REFERENCES pessoas(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pilares
CREATE TABLE IF NOT EXISTS pilares (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#1976d2',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de locais
CREATE TABLE IF NOT EXISTS locais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    capacidade INTEGER,
    tipo VARCHAR(50) DEFAULT 'Sala',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ações
CREATE TABLE IF NOT EXISTS acoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    pilar_id INTEGER REFERENCES pilares(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de eventos da agenda
CREATE TABLE IF NOT EXISTS eventos (
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

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    parametros JSONB DEFAULT '{}',
    dados JSONB DEFAULT '{}',
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);
CREATE INDEX IF NOT EXISTS idx_comunidades_codigo ON comunidades(codigo);
CREATE INDEX IF NOT EXISTS idx_comunidades_nome ON comunidades(nome);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_pessoas_nome ON pessoas(nome);
CREATE INDEX IF NOT EXISTS idx_pastorais_nome ON pastorais(nome);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comunidades_updated_at BEFORE UPDATE ON comunidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pastorais_updated_at BEFORE UPDATE ON pastorais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilares_updated_at BEFORE UPDATE ON pilares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locais_updated_at BEFORE UPDATE ON locais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acoes_updated_at BEFORE UPDATE ON acoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO perfis (nome, descricao, permissoes) VALUES
('Administrador', 'Acesso total ao sistema', '{"dashboard": true, "comunidades": true, "pastorais": true, "pilares": true, "locais": true, "acoes": true, "pessoas": true, "usuarios": true, "perfis": true, "agenda": true, "relatorios": true}'),
('Coordenador', 'Acesso a gestão de comunidades e pastorais', '{"dashboard": true, "comunidades": true, "pastorais": true, "pilares": true, "locais": true, "acoes": true, "pessoas": true, "agenda": true, "relatorios": true}'),
('Secretário', 'Acesso a cadastros e agenda', '{"dashboard": true, "comunidades": true, "pastorais": true, "pilares": true, "locais": true, "acoes": true, "pessoas": true, "agenda": true}'),
('Visualizador', 'Apenas visualização', '{"dashboard": true, "comunidades": true, "pastorais": true, "pilares": true, "locais": true, "acoes": true, "pessoas": true, "agenda": true}')
ON CONFLICT (nome) DO NOTHING;

-- Inserir pilares iniciais
INSERT INTO pilares (nome, descricao, cor) VALUES
('Formação', 'Pilar de formação cristã', '#1976d2'),
('Caridade', 'Pilar de caridade e solidariedade', '#f44336'),
('Liturgia', 'Pilar de liturgia e celebração', '#4caf50'),
('Comunhão', 'Pilar de comunhão e fraternidade', '#ff9800')
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE perfis IS 'Tabela para armazenar perfis de acesso ao sistema';
COMMENT ON TABLE pessoas IS 'Tabela para armazenar dados das pessoas';
COMMENT ON TABLE usuarios IS 'Tabela para armazenar usuários do sistema';
COMMENT ON TABLE comunidades IS 'Tabela para armazenar dados das comunidades paroquiais';
COMMENT ON TABLE pastorais IS 'Tabela para armazenar dados das pastorais';
COMMENT ON TABLE pilares IS 'Tabela para armazenar os pilares da paróquia';
COMMENT ON TABLE locais IS 'Tabela para armazenar locais da paróquia';
COMMENT ON TABLE acoes IS 'Tabela para armazenar ações e atividades';
COMMENT ON TABLE eventos IS 'Tabela para armazenar eventos da agenda';
COMMENT ON TABLE relatorios IS 'Tabela para armazenar relatórios gerados';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados ParóquiaON inicializado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: perfis, pessoas, usuarios, comunidades, pastorais, pilares, locais, acoes, eventos, relatorios';
    RAISE NOTICE 'Dados iniciais inseridos: perfis e pilares';
END $$;
