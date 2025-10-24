-- ==============================================
-- SCRIPT PARA REMOVER TABELA EVENTOS
-- ==============================================
-- Este script remove a tabela 'eventos' e todas suas referências
-- Mantendo apenas a tabela 'agendamentos' como padrão

-- 1. Remover triggers relacionados à tabela eventos
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;

-- 2. Remover índices da tabela eventos
DROP INDEX IF EXISTS idx_eventos_data_inicio;
DROP INDEX IF EXISTS idx_eventos_status;
DROP INDEX IF EXISTS idx_eventos_local_id;
DROP INDEX IF EXISTS idx_eventos_acao_id;

-- 3. Remover a tabela eventos (CASCADE remove dependências)
DROP TABLE IF EXISTS eventos CASCADE;

-- 4. Verificar se a tabela foi removida
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'eventos') THEN
        RAISE NOTICE '❌ Tabela eventos ainda existe';
    ELSE
        RAISE NOTICE '✅ Tabela eventos removida com sucesso';
    END IF;
END $$;

-- 5. Verificar se a tabela agendamentos existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
        RAISE NOTICE '✅ Tabela agendamentos está disponível';
    ELSE
        RAISE NOTICE '❌ Tabela agendamentos não encontrada';
    END IF;
END $$;

-- 6. Mostrar estatísticas das tabelas restantes
SELECT 
    'agendamentos' as tabela,
    COUNT(*) as total_registros
FROM agendamentos
UNION ALL
SELECT 
    'status_agendamento' as tabela,
    COUNT(*) as total_registros
FROM status_agendamento;

-- 7. Comentário final
COMMENT ON TABLE agendamentos IS 'Tabela principal para armazenar agendamentos e eventos da paróquia (substitui a tabela eventos)';

RAISE NOTICE '🎉 Migração concluída: Tabela eventos removida, usando apenas agendamentos';
