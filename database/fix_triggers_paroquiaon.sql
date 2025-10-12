-- Script para corrigir apenas os triggers do ParóquiaON
-- Execute este script se você já tem as tabelas criadas mas os triggers estão com problema

-- ==============================================
-- REMOVER TRIGGERS EXISTENTES
-- ==============================================
DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
DROP TRIGGER IF EXISTS update_pessoas_updated_at ON pessoas;
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_comunidades_updated_at ON comunidades;
DROP TRIGGER IF EXISTS update_pastorais_updated_at ON pastorais;
DROP TRIGGER IF EXISTS update_pilares_updated_at ON pilares;
DROP TRIGGER IF EXISTS update_locais_updated_at ON locais;
DROP TRIGGER IF EXISTS update_acoes_updated_at ON acoes;
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
DROP TRIGGER IF EXISTS update_recebimentos_updated_at ON recebimentos;
DROP TRIGGER IF EXISTS update_conferencias_updated_at ON conferencias;
DROP TRIGGER IF EXISTS update_sincronizacoes_updated_at ON sincronizacoes;

-- ==============================================
-- RECRIAR FUNÇÃO (SE NECESSÁRIO)
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================
-- RECRIAR TRIGGERS
-- ==============================================
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comunidades_updated_at BEFORE UPDATE ON comunidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pastorais_updated_at BEFORE UPDATE ON pastorais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilares_updated_at BEFORE UPDATE ON pilares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locais_updated_at BEFORE UPDATE ON locais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acoes_updated_at BEFORE UPDATE ON acoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recebimentos_updated_at BEFORE UPDATE ON recebimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conferencias_updated_at BEFORE UPDATE ON conferencias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sincronizacoes_updated_at BEFORE UPDATE ON sincronizacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFICAR SE OS TRIGGERS FORAM CRIADOS
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
-- MENSAGEM DE SUCESSO
-- ==============================================
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
        AND trigger_name LIKE '%updated_at%';
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'TRIGGERS CORRIGIDOS COM SUCESSO!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Triggers criados: %', trigger_count;
    RAISE NOTICE 'Todos os triggers de updated_at estão funcionando!';
    RAISE NOTICE '==============================================';
END $$;
