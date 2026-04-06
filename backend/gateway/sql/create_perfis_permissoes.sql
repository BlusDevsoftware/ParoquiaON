-- Tabela de permissões por seção/ação para cada perfil
CREATE TABLE IF NOT EXISTS perfis_permissoes (
    id SERIAL PRIMARY KEY,
    perfil_codigo VARCHAR(5) NOT NULL REFERENCES perfis(codigo) ON DELETE CASCADE,
    secao VARCHAR(120) NOT NULL,
    ver BOOLEAN NOT NULL DEFAULT FALSE,
    criar BOOLEAN NOT NULL DEFAULT FALSE,
    editar BOOLEAN NOT NULL DEFAULT FALSE,
    excluir BOOLEAN NOT NULL DEFAULT FALSE,
    exportar BOOLEAN NOT NULL DEFAULT FALSE,
    executar BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo', NOW()) NOT NULL,
    CONSTRAINT uq_perfil_secao UNIQUE(perfil_codigo, secao)
);

COMMENT ON TABLE perfis_permissoes IS 'Mapa de permissões por seção para cada perfil';
COMMENT ON COLUMN perfis_permissoes.perfil_codigo IS 'FK para perfis.codigo';
COMMENT ON COLUMN perfis_permissoes.secao IS 'Seção do sistema (ex.: Cadastros/Colaboradores)';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_perfis_permissoes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('America/Sao_Paulo', NOW());
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_perfis_permissoes_updated_at ON perfis_permissoes;
CREATE TRIGGER trg_perfis_permissoes_updated_at
BEFORE UPDATE ON perfis_permissoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_perfis_permissoes();


