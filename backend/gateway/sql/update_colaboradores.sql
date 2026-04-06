-- Atualizar a estrutura da tabela colaboradores
ALTER TABLE colaboradores
ALTER COLUMN codigo TYPE VARCHAR(5),
ADD COLUMN IF NOT EXISTS data_admissao DATE,
ADD COLUMN IF NOT EXISTS usuario_vinculado INTEGER REFERENCES usuarios(codigo),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Adicionar comentários nas colunas
COMMENT ON COLUMN colaboradores.codigo IS 'Código único do colaborador (5 dígitos)';
COMMENT ON COLUMN colaboradores.data_admissao IS 'Data de admissão do colaborador';
COMMENT ON COLUMN colaboradores.usuario_vinculado IS 'Código do usuário vinculado ao colaborador';
COMMENT ON COLUMN colaboradores.updated_at IS 'Data e hora da última atualização do registro';

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_colaboradores_updated_at ON colaboradores;
CREATE TRIGGER update_colaboradores_updated_at
    BEFORE UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 