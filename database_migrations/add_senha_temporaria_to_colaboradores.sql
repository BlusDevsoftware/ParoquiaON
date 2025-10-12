-- Adicionar campo senha_temporaria na tabela colaboradores
-- Data: 2024-01-XX
-- Descrição: Campo para armazenar senha temporária gerada automaticamente ao criar colaborador

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'colaboradores' 
        AND column_name = 'senha_temporaria'
    ) THEN
        ALTER TABLE colaboradores 
        ADD COLUMN senha_temporaria VARCHAR(20);
        
        -- Adicionar comentário na coluna
        COMMENT ON COLUMN colaboradores.senha_temporaria IS 'Senha temporária gerada automaticamente para primeiro acesso do colaborador';
        
        RAISE NOTICE 'Coluna senha_temporaria adicionada com sucesso à tabela colaboradores';
    ELSE
        RAISE NOTICE 'Coluna senha_temporaria já existe na tabela colaboradores';
    END IF;
END $$;
