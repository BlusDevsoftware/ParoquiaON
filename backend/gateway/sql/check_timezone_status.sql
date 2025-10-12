-- Verificar status atual das colunas de timezone na tabela movimento_comissoes
-- Este script ajuda a diagnosticar problemas de timezone

-- 1. Verificar tipo das colunas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimento_comissoes' 
  AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

-- 2. Verificar triggers ativos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'movimento_comissoes'
ORDER BY trigger_name;

-- 3. Verificar função do trigger
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_updated_at_column'
  AND routine_type = 'FUNCTION';

-- 4. Verificar alguns registros para ver os valores atuais
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

-- 5. Verificar se há registros com updated_at anterior ao created_at
SELECT 
    id,
    numero_titulo,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at < created_at THEN 'PROBLEMA: updated_at anterior ao created_at'
        ELSE 'OK'
    END as status
FROM movimento_comissoes 
WHERE updated_at < created_at
ORDER BY id DESC;

