-- Migração para corrigir problema de timezone nas colunas created_at e updated_at
-- O problema é que TIMESTAMP salva em UTC, mas precisamos do horário local

-- Opção 1: Converter para TIMESTAMPTZ (timestamp with timezone)
-- Isso fará com que o PostgreSQL salve o timezone junto com a data

ALTER TABLE movimento_comissoes 
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Opção 2: Se preferir manter TIMESTAMP mas configurar timezone local
-- ALTER TABLE movimento_comissoes 
-- ALTER COLUMN created_at TYPE TIMESTAMP,
-- ALTER COLUMN updated_at TYPE TIMESTAMP;

-- Configurar timezone da sessão para Brasília (opcional)
-- SET timezone = 'America/Sao_Paulo';

-- Comentário: TIMESTAMPTZ é a melhor opção pois:
-- 1. Salva o timezone junto com a data
-- 2. Permite conversão automática para diferentes fusos
-- 3. É o padrão moderno do PostgreSQL
