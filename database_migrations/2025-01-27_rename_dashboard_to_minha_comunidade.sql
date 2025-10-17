-- Migração: Renomear coluna dashboard_ver para minha_comunidade_ver
-- Data: 2025-01-27
-- Descrição: Alinha nomenclatura do banco com o frontend (Dashboard → Minha Comunidade)

-- Renomear a coluna dashboard_ver para minha_comunidade_ver
ALTER TABLE perfis 
RENAME COLUMN dashboard_ver TO minha_comunidade_ver;

-- Comentário na coluna para documentação
COMMENT ON COLUMN perfis.minha_comunidade_ver IS 'Permissão para visualizar Minha Comunidade (antigo Dashboard)';

-- Verificar se a alteração foi aplicada corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'perfis' 
AND column_name = 'minha_comunidade_ver';
