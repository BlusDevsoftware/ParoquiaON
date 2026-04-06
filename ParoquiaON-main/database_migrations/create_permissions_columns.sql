-- Script para criar todas as colunas de permissões na tabela perfis
-- Execute este script no seu banco de dados Supabase/PostgreSQL

-- Minha Comunidade
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS minha_comunidade_ver BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.minha_comunidade_ver IS 'Permissão para visualizar Minha Comunidade';

-- Usuários
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS usuarios_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS usuarios_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS usuarios_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS usuarios_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.usuarios_ver IS 'Permissão para visualizar Usuários';
COMMENT ON COLUMN perfis.usuarios_criar IS 'Permissão para criar Usuários';
COMMENT ON COLUMN perfis.usuarios_editar IS 'Permissão para editar Usuários';
COMMENT ON COLUMN perfis.usuarios_excluir IS 'Permissão para excluir Usuários';

-- Pessoas
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pessoas_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pessoas_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pessoas_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pessoas_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.pessoas_ver IS 'Permissão para visualizar Pessoas';
COMMENT ON COLUMN perfis.pessoas_criar IS 'Permissão para criar Pessoas';
COMMENT ON COLUMN perfis.pessoas_editar IS 'Permissão para editar Pessoas';
COMMENT ON COLUMN perfis.pessoas_excluir IS 'Permissão para excluir Pessoas';

-- Comunidades
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comunidades_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comunidades_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comunidades_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS comunidades_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.comunidades_ver IS 'Permissão para visualizar Comunidades';
COMMENT ON COLUMN perfis.comunidades_criar IS 'Permissão para criar Comunidades';
COMMENT ON COLUMN perfis.comunidades_editar IS 'Permissão para editar Comunidades';
COMMENT ON COLUMN perfis.comunidades_excluir IS 'Permissão para excluir Comunidades';

-- Pastorais
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pastorais_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pastorais_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pastorais_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pastorais_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.pastorais_ver IS 'Permissão para visualizar Pastorais';
COMMENT ON COLUMN perfis.pastorais_criar IS 'Permissão para criar Pastorais';
COMMENT ON COLUMN perfis.pastorais_editar IS 'Permissão para editar Pastorais';
COMMENT ON COLUMN perfis.pastorais_excluir IS 'Permissão para excluir Pastorais';

-- Pilares
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pilares_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pilares_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pilares_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS pilares_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.pilares_ver IS 'Permissão para visualizar Pilares';
COMMENT ON COLUMN perfis.pilares_criar IS 'Permissão para criar Pilares';
COMMENT ON COLUMN perfis.pilares_editar IS 'Permissão para editar Pilares';
COMMENT ON COLUMN perfis.pilares_excluir IS 'Permissão para excluir Pilares';

-- Locais
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS locais_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS locais_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS locais_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS locais_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.locais_ver IS 'Permissão para visualizar Locais';
COMMENT ON COLUMN perfis.locais_criar IS 'Permissão para criar Locais';
COMMENT ON COLUMN perfis.locais_editar IS 'Permissão para editar Locais';
COMMENT ON COLUMN perfis.locais_excluir IS 'Permissão para excluir Locais';

-- Ações
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS acoes_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS acoes_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS acoes_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS acoes_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.acoes_ver IS 'Permissão para visualizar Ações';
COMMENT ON COLUMN perfis.acoes_criar IS 'Permissão para criar Ações';
COMMENT ON COLUMN perfis.acoes_editar IS 'Permissão para editar Ações';
COMMENT ON COLUMN perfis.acoes_excluir IS 'Permissão para excluir Ações';

-- Agenda
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS agenda_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS agenda_criar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS agenda_editar BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS agenda_excluir BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.agenda_ver IS 'Permissão para visualizar Agenda';
COMMENT ON COLUMN perfis.agenda_criar IS 'Permissão para criar eventos na Agenda';
COMMENT ON COLUMN perfis.agenda_editar IS 'Permissão para editar eventos na Agenda';
COMMENT ON COLUMN perfis.agenda_excluir IS 'Permissão para excluir eventos na Agenda';

-- Relatórios
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS relatorios_exportar BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.relatorios_ver IS 'Permissão para visualizar Relatórios';
COMMENT ON COLUMN perfis.relatorios_exportar IS 'Permissão para exportar Relatórios';

-- Perfis
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS perfis_ver BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.perfis_ver IS 'Permissão para visualizar Perfis';

-- Configurações
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS configuracoes_manutencao_ver BOOLEAN DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS configuracoes_sincronizar_ver BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN perfis.configuracoes_manutencao_ver IS 'Permissão para acessar Manutenção do BD';
COMMENT ON COLUMN perfis.configuracoes_sincronizar_ver IS 'Permissão para acessar Sincronização';

-- Verificar se as colunas foram criadas corretamente
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'perfis' 
    AND column_name LIKE '%_ver' 
    OR column_name LIKE '%_criar' 
    OR column_name LIKE '%_editar' 
    OR column_name LIKE '%_excluir'
    OR column_name LIKE '%_exportar'
ORDER BY column_name;

