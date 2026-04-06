-- Adicionar colunas de permissão à tabela perfis existente
-- Execute este script no Supabase SQL Editor

-- DASHBOARD
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS dashboard_ver BOOLEAN DEFAULT FALSE;

-- CADASTROS
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_colaboradores_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_colaboradores_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_colaboradores_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_colaboradores_excluir BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_clientes_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_clientes_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_clientes_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_clientes_excluir BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_produtos_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_produtos_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_produtos_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_produtos_excluir BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_servicos_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_servicos_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_servicos_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cadastros_servicos_excluir BOOLEAN DEFAULT FALSE;

-- COMISSÕES
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_lancar_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_lancar_criar BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_movimento_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_movimento_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_movimento_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_movimento_excluir BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comissoes_consulta_ver BOOLEAN DEFAULT FALSE;

-- RELATÓRIOS
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_recebimento_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_recebimento_exportar BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_conferencia_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_conferencia_exportar BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_dinamico_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_dinamico_exportar BOOLEAN DEFAULT FALSE;

-- CONFIGURAÇÕES
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS configuracoes_manutencao_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS configuracoes_manutencao_executar BOOLEAN DEFAULT FALSE;

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS configuracoes_sincronizar_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS configuracoes_sincronizar_executar BOOLEAN DEFAULT FALSE;

-- Comentários para documentar as colunas
COMMENT ON COLUMN perfis.dashboard_ver IS 'Permissão para visualizar Dashboard';
COMMENT ON COLUMN perfis.cadastros_colaboradores_ver IS 'Permissão para visualizar Colaboradores';
COMMENT ON COLUMN perfis.cadastros_colaboradores_criar IS 'Permissão para criar Colaboradores';
COMMENT ON COLUMN perfis.cadastros_colaboradores_editar IS 'Permissão para editar Colaboradores';
COMMENT ON COLUMN perfis.cadastros_colaboradores_excluir IS 'Permissão para excluir Colaboradores';
