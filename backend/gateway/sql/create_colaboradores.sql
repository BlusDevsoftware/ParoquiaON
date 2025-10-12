-- Criar tabela de colaboradores
CREATE TABLE colaboradores (
    codigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(50) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    data_admissao DATE,
    usuario_vinculado INTEGER REFERENCES usuarios(codigo),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Adicionar comentários nas colunas
COMMENT ON TABLE colaboradores IS 'Tabela de colaboradores do sistema';
COMMENT ON COLUMN colaboradores.codigo IS 'Código único do colaborador';
COMMENT ON COLUMN colaboradores.nome IS 'Nome completo do colaborador';
COMMENT ON COLUMN colaboradores.email IS 'Email do colaborador';
COMMENT ON COLUMN colaboradores.telefone IS 'Telefone do colaborador';
COMMENT ON COLUMN colaboradores.cargo IS 'Cargo do colaborador';
COMMENT ON COLUMN colaboradores.departamento IS 'Departamento do colaborador';
COMMENT ON COLUMN colaboradores.data_admissao IS 'Data de admissão do colaborador';
COMMENT ON COLUMN colaboradores.usuario_vinculado IS 'Código do usuário vinculado ao colaborador';
COMMENT ON COLUMN colaboradores.status IS 'Status do colaborador (ativo/inativo)';
COMMENT ON COLUMN colaboradores.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN colaboradores.updated_at IS 'Data da última atualização do registro';

-- Criar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colaboradores_updated_at
    BEFORE UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 