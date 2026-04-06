-- Migração para corrigir timezone - armazenar no horário local de Brasília
-- O problema é que o banco está armazenando em UTC (+3h), mas queremos o horário local

-- 1. Primeiro, converter as colunas para TIMESTAMP (sem timezone)
ALTER TABLE movimento_comissoes 
ALTER COLUMN created_at TYPE TIMESTAMP USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at AT TIME ZONE 'UTC';

-- 2. Configurar timezone da sessão para Brasília
SET timezone = 'America/Sao_Paulo';

-- 3. Criar função para atualizar updated_at no horário local
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Usar NOW() que agora retorna o horário local de Brasília
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Remover trigger existente e criar novo
DROP TRIGGER IF EXISTS update_movimento_comissoes_updated_at ON movimento_comissoes;

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_movimento_comissoes_updated_at
    BEFORE UPDATE ON movimento_comissoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Atualizar valores existentes para horário local
-- Converter UTC para horário local de Brasília (-3h)
UPDATE movimento_comissoes 
SET created_at = created_at - INTERVAL '3 hours',
    updated_at = updated_at - INTERVAL '3 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- 7. Verificar resultado
SELECT 
    id,
    numero_titulo,
    created_at,
    updated_at,
    CASE 
        WHEN created_at IS NOT NULL THEN created_at::text
        ELSE 'NULL'
    END as created_at_text,
    CASE 
        WHEN updated_at IS NOT NULL THEN updated_at::text
        ELSE 'NULL'
    END as updated_at_text
FROM movimento_comissoes 
ORDER BY id DESC 
LIMIT 5;

-- Comentário: Agora as datas serão armazenadas no horário local de Brasília
-- sem conversão de timezone, exatamente como você quer
