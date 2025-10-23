-- Script para verificar o sistema de status
-- Execute este script no Supabase SQL Editor para verificar se tudo está funcionando

-- 1. Verificar tabela de status
SELECT 'Status disponíveis:' as info;
SELECT id, nome, descricao, ativo FROM status_agendamento ORDER BY id;

-- 2. Verificar estrutura da tabela agendamentos
SELECT 'Colunas da tabela agendamentos:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND column_name IN ('status', 'status_id')
ORDER BY ordinal_position;

-- 3. Verificar foreign keys
SELECT 'Foreign keys da tabela agendamentos:' as info;
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
    AND kcu.column_name = 'status_id';

-- 4. Verificar dados existentes
SELECT 'Agendamentos por status:' as info;
SELECT 
    sa.nome as status,
    COUNT(a.id) as total,
    COUNT(CASE WHEN a.status_id IS NOT NULL THEN 1 END) as com_status_id,
    COUNT(CASE WHEN a.status IS NOT NULL THEN 1 END) as com_status_antigo
FROM status_agendamento sa
LEFT JOIN agendamentos a ON sa.id = a.status_id
GROUP BY sa.id, sa.nome
ORDER BY sa.id;

-- 5. Verificar constraints
SELECT 'Constraints da tabela agendamentos:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'agendamentos'::regclass
AND conname LIKE '%status%';
