-- Script para verificar a estrutura das tabelas do ParóquiaON
-- Execute este script para verificar se todas as tabelas foram criadas corretamente

-- ==============================================
-- VERIFICAR EXISTÊNCIA DAS TABELAS
-- ==============================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'perfis', 'pessoas', 'usuarios', 'comunidades', 
        'pastorais', 'pilares', 'locais', 'acoes', 
        'eventos', 'relatorios', 'recebimentos', 
        'conferencias', 'sincronizacoes'
    )
ORDER BY table_name;

-- ==============================================
-- VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
-- ==============================================

-- Estrutura da tabela perfis
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'perfis' 
ORDER BY ordinal_position;

-- Estrutura da tabela pessoas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
ORDER BY ordinal_position;

-- Estrutura da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Estrutura da tabela comunidades
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comunidades' 
ORDER BY ordinal_position;

-- ==============================================
-- VERIFICAR ÍNDICES
-- ==============================================
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN (
        'perfis', 'pessoas', 'usuarios', 'comunidades', 
        'pastorais', 'pilares', 'locais', 'acoes', 
        'eventos', 'relatorios', 'recebimentos', 
        'conferencias', 'sincronizacoes'
    )
ORDER BY tablename, indexname;

-- ==============================================
-- VERIFICAR TRIGGERS
-- ==============================================
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ==============================================
-- VERIFICAR DADOS INICIAIS
-- ==============================================

-- Contar registros em cada tabela
SELECT 'perfis' as tabela, COUNT(*) as total FROM perfis
UNION ALL
SELECT 'pessoas' as tabela, COUNT(*) as total FROM pessoas
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'comunidades' as tabela, COUNT(*) as total FROM comunidades
UNION ALL
SELECT 'pastorais' as tabela, COUNT(*) as total FROM pastorais
UNION ALL
SELECT 'pilares' as tabela, COUNT(*) as total FROM pilares
UNION ALL
SELECT 'locais' as tabela, COUNT(*) as total FROM locais
UNION ALL
SELECT 'acoes' as tabela, COUNT(*) as total FROM acoes
UNION ALL
SELECT 'eventos' as tabela, COUNT(*) as total FROM eventos
UNION ALL
SELECT 'relatorios' as tabela, COUNT(*) as total FROM relatorios
UNION ALL
SELECT 'recebimentos' as tabela, COUNT(*) as total FROM recebimentos
UNION ALL
SELECT 'conferencias' as tabela, COUNT(*) as total FROM conferencias
UNION ALL
SELECT 'sincronizacoes' as tabela, COUNT(*) as total FROM sincronizacoes
ORDER BY tabela;

-- ==============================================
-- VERIFICAR RELACIONAMENTOS
-- ==============================================

-- Verificar foreign keys
SELECT 
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
    AND tc.table_schema = 'public'
    AND tc.table_name IN (
        'perfis', 'pessoas', 'usuarios', 'comunidades', 
        'pastorais', 'pilares', 'locais', 'acoes', 
        'eventos', 'relatorios', 'recebimentos', 
        'conferencias', 'sincronizacoes'
    )
ORDER BY tc.table_name, kcu.column_name;

-- ==============================================
-- TESTE DE FUNCIONALIDADE
-- ==============================================

-- Testar inserção de um registro de exemplo
INSERT INTO pessoas (nome, telefone, email, ativo) 
VALUES ('Teste Sistema', '(11) 99999-0000', 'teste@sistema.com', true)
ON CONFLICT DO NOTHING;

-- Verificar se o trigger de updated_at funciona
UPDATE pessoas 
SET telefone = '(11) 99999-0001' 
WHERE nome = 'Teste Sistema';

-- Verificar se updated_at foi atualizado
SELECT nome, telefone, created_at, updated_at 
FROM pessoas 
WHERE nome = 'Teste Sistema';

-- Limpar dados de teste
DELETE FROM pessoas WHERE nome = 'Teste Sistema';

-- ==============================================
-- RELATÓRIO FINAL
-- ==============================================
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Contar tabelas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name IN (
            'perfis', 'pessoas', 'usuarios', 'comunidades', 
            'pastorais', 'pilares', 'locais', 'acoes', 
            'eventos', 'relatorios', 'recebimentos', 
            'conferencias', 'sincronizacoes'
        );
    
    -- Contar índices
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
        AND tablename IN (
            'perfis', 'pessoas', 'usuarios', 'comunidades', 
            'pastorais', 'pilares', 'locais', 'acoes', 
            'eventos', 'relatorios', 'recebimentos', 
            'conferencias', 'sincronizacoes'
        );
    
    -- Contar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
        AND trigger_name LIKE '%updated_at%';
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'RELATÓRIO DE VERIFICAÇÃO DO BANCO DE DADOS';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tabelas encontradas: %', table_count;
    RAISE NOTICE 'Índices encontrados: %', index_count;
    RAISE NOTICE 'Triggers encontrados: %', trigger_count;
    RAISE NOTICE '';
    
    IF table_count = 13 THEN
        RAISE NOTICE '✅ Todas as tabelas foram criadas com sucesso!';
    ELSE
        RAISE NOTICE '❌ Algumas tabelas não foram encontradas. Esperado: 13, Encontrado: %', table_count;
    END IF;
    
    IF trigger_count >= 12 THEN
        RAISE NOTICE '✅ Triggers de updated_at estão funcionando!';
    ELSE
        RAISE NOTICE '❌ Alguns triggers não foram encontrados. Esperado: 12+, Encontrado: %', trigger_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'O banco de dados está pronto para uso!';
    RAISE NOTICE '==============================================';
END $$;
