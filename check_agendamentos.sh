#!/bin/bash

# Script para verificar estrutura da tabela agendamentos
# Execute este script no terminal

echo "🔍 Verificando estrutura da tabela agendamentos..."
echo "================================================"

# Verificar se a tabela existe
echo "1. Verificando se a tabela existe:"
psql $DATABASE_URL -c "
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'agendamentos'
AND table_schema = 'public';
"

echo ""
echo "2. Estrutura da tabela agendamentos:"
psql $DATABASE_URL -c "
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
"

echo ""
echo "3. Chaves estrangeiras:"
psql $DATABASE_URL -c "
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
"

echo ""
echo "4. Índices da tabela:"
psql $DATABASE_URL -c "
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'agendamentos'
AND schemaname = 'public';
"

echo ""
echo "5. Quantidade de registros:"
psql $DATABASE_URL -c "SELECT COUNT(*) as total_registros FROM agendamentos;"

echo ""
echo "6. Alguns registros de exemplo:"
psql $DATABASE_URL -c "SELECT * FROM agendamentos LIMIT 3;"

echo ""
echo "✅ Verificação concluída!"
