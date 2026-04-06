-- Script COMPLETO para configurar timezone de Brasília
-- Este script garante que novos títulos usem horário de Brasília automaticamente

-- 1. Configurar timezone da sessão para Brasília
SET timezone = 'America/Sao_Paulo';

-- 2. Converter colunas para TIMESTAMP (sem timezone) se necessário
ALTER TABLE movimento_comissoes 
ALTER COLUMN created_at TYPE TIMESTAMP USING created_at,
ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at;

-- 3. Definir DEFAULTs que usam horário de Brasília
ALTER TABLE movimento_comissoes 
ALTER COLUMN created_at SET DEFAULT TIMEZONE('America/Sao_Paulo', NOW()),
ALTER COLUMN updated_at SET DEFAULT TIMEZONE('America/Sao_Paulo', NOW());

-- 4. Criar função unificada para INSERT e UPDATE
CREATE OR REPLACE FUNCTION set_created_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Para INSERT: definir created_at e updated_at no horário de Brasília
        NEW.created_at := TIMEZONE('America/Sao_Paulo', NOW());
        NEW.updated_at := TIMEZONE('America/Sao_Paulo', NOW());
    ELSIF TG_OP = 'UPDATE' THEN
        -- Para UPDATE: apenas updated_at no horário de Brasília
        NEW.updated_at := TIMEZONE('America/Sao_Paulo', NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Remover triggers antigos
DROP TRIGGER IF EXISTS update_movimento_comissoes_updated_at ON movimento_comissoes;
DROP TRIGGER IF EXISTS set_created_updated_at_trigger ON movimento_comissoes;
DROP TRIGGER IF EXISTS trg_mc_ins ON movimento_comissoes;
DROP TRIGGER IF EXISTS trg_mc_upd ON movimento_comissoes;

-- 6. Criar novos triggers
CREATE TRIGGER trg_movimento_comissoes_ins 
    BEFORE INSERT ON movimento_comissoes
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_updated_at();

CREATE TRIGGER trg_movimento_comissoes_upd 
    BEFORE UPDATE ON movimento_comissoes
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_updated_at();

-- 7. Verificar configuração
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimento_comissoes' 
  AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

-- 8. Verificar triggers ativos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'movimento_comissoes'
ORDER BY trigger_name;

-- 9. Teste: verificar horário atual
SELECT 
    NOW() as horario_atual,
    TIMEZONE('America/Sao_Paulo', NOW()) as horario_brasilia,
    CURRENT_TIMESTAMP as timestamp_atual;

-- Comentário: Agora TODOS os novos títulos e atualizações usarão horário de Brasília automaticamente
-- Não precisa mais enviar created_at/updated_at do backend - o banco cuida sozinho!
