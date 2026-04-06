-- Criar tabela de perfis de acesso
CREATE TABLE IF NOT EXISTS perfis (
    codigo VARCHAR(5) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    permissoes JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo', NOW()) NOT NULL
);

-- Comentários da tabela
COMMENT ON TABLE perfis IS 'Perfis/roles do sistema com matriz de permissões';
COMMENT ON COLUMN perfis.codigo IS 'Código único do perfil (5 dígitos)';
COMMENT ON COLUMN perfis.nome IS 'Nome do perfil (ex.: Gerente, Administrativo, Colaborador)';
COMMENT ON COLUMN perfis.permissoes IS 'Permissões por seção/ação em JSON';
COMMENT ON COLUMN perfis.status IS 'Status do perfil (ativo/inativo)';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_perfis()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('America/Sao_Paulo', NOW());
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
CREATE TRIGGER update_perfis_updated_at
BEFORE UPDATE ON perfis
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_perfis();


