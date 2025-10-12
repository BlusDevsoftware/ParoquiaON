-- Migração para corrigir problema de timezone na coluna updated_at da tabela movimento_comissoes
-- O problema é que updated_at está sendo armazenado com horário incorreto
-- Quando é 18:11 em Brasília, deveria ser armazenado como 21:11 UTC

-- Converter updated_at para TIMESTAMPTZ para manter consistência com outras tabelas
ALTER TABLE movimento_comissoes 
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Configurar trigger para atualizar updated_at automaticamente
-- Primeiro, remover trigger existente se houver
DROP TRIGGER IF EXISTS update_updated_at_column ON movimento_comissoes;
DROP TRIGGER IF EXISTS update_movimento_comissoes_updated_at ON movimento_comissoes;

-- Criar função para atualizar updated_at (converter Brasília para UTC corretamente)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Converter o horário atual de Brasília para UTC
    -- NOW() retorna o horário atual do servidor
    -- TIMEZONE('America/Sao_Paulo'::text, NOW()) converte para horário de Brasília
    -- AT TIME ZONE 'UTC' converte de volta para UTC para armazenamento
    NEW.updated_at = (TIMEZONE('America/Sao_Paulo'::text, NOW()) AT TIME ZONE 'UTC')::timestamptz;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_movimento_comissoes_updated_at
    BEFORE UPDATE ON movimento_comissoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentário: Agora updated_at será sempre atualizado automaticamente
-- e armazenado corretamente em UTC, mantendo a consistência com o horário de Brasília
