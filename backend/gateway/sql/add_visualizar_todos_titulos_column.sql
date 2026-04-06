-- Adicionar coluna para controlar se colaborador pode ver todos os títulos
ALTER TABLE colaboradores 
ADD COLUMN visualizar_todos_titulos BOOLEAN DEFAULT FALSE;

-- Comentário explicativo
COMMENT ON COLUMN colaboradores.visualizar_todos_titulos IS 'Se TRUE, colaborador pode ver títulos de todos os colaboradores. Se FALSE, vê apenas seus próprios títulos.';

-- Atualizar usuários administradores para terem permissão (opcional)
-- UPDATE colaboradores SET visualizar_todos_titulos = TRUE WHERE perfil = 'Administrador';
