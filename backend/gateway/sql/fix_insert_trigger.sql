-- Script para corrigir trigger de INSERT - usar horário local de Brasília
-- O problema é que o DEFAULT NOW() está usando UTC, mas queremos horário local

-- 1. Configurar timezone da sessão para Brasília
SET timezone = 'America/Sao_Paulo';

-- 2. Criar função para definir created_at e updated_at no horário local
CREATE OR REPLACE FUNCTION set_created_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Usar NOW() que agora retorna o horário local de Brasília
    NEW.created_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Remover trigger de INSERT existente se houver
DROP TRIGGER IF EXISTS set_created_updated_at_trigger ON movimento_comissoes;

-- 4. Criar trigger para INSERT que define created_at e updated_at
CREATE TRIGGER set_created_updated_at_trigger
    BEFORE INSERT ON movimento_comissoes
    FOR EACH ROW
    EXECUTE FUNCTION set_created_updated_at();

-- 5. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'movimento_comissoes'
  AND trigger_name = 'set_created_updated_at_trigger';

-- Comentário: Agora tanto INSERT quanto UPDATE usarão horário local de Brasília
