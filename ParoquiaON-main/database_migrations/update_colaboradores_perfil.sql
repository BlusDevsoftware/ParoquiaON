-- Migração para alterar campo usuario_vinculado para perfil na tabela colaboradores
-- Data: 2024-12-19

-- 1. Adicionar nova coluna perfil
ALTER TABLE colaboradores 
ADD COLUMN perfil VARCHAR(50) REFERENCES perfis(codigo);

-- 2. Migrar dados existentes (se houver)
-- Se existir usuario_vinculado, tentar mapear para perfil baseado no usuário
-- UPDATE colaboradores 
-- SET perfil = (
--     SELECT p.codi
--     FROM perfis p 
--     JOIN usuarios u ON u.perfil = p.codigo 
--     WHERE u.codigo = colaboradores.usuario_vinculado
-- )
-- WHERE usuario_vinculado IS NOT NULL;

-- 3. Remover a coluna usuario_vinculado (comentado por segurança)
-- ALTER TABLE colaboradores DROP COLUMN usuario_vinculado;

-- 4. Adicionar comentário na nova coluna
COMMENT ON COLUMN colaboradores.perfil IS 'Código do perfil associado ao colaborador';

-- 5. Verificar estrutura final
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'colaboradores' 
-- ORDER BY ordinal_position;
