-- ==============================================
-- VERIFICAR ESTRUTURA DA TABELA AGENDAMENTOS
-- ==============================================

-- 1. Verificar se a tabela existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'agendamentos'
AND table_schema = 'public';

-- 2. Verificar estrutura da tabela agendamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar constraints (chaves estrangeiras)
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'agendamentos'
    AND tc.table_schema = 'public';

-- 4. Verificar índices da tabela
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'agendamentos'
AND schemaname = 'public';

-- 5. Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM agendamentos;

-- 6. Verificar alguns registros de exemplo (se existirem)
SELECT * FROM agendamentos LIMIT 5;
