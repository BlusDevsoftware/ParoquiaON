-- Script para adicionar novas colunas na tabela de clientes
-- Data: 2025-01-27
-- Descrição: Adiciona colunas responsavel, contato e observacao na tabela clientes

-- Adicionar coluna responsavel
ALTER TABLE clientes 
ADD COLUMN responsavel VARCHAR(100);

-- Adicionar coluna contato
ALTER TABLE clientes 
ADD COLUMN contato VARCHAR(100);

-- Adicionar coluna observacao
ALTER TABLE clientes 
ADD COLUMN observacao VARCHAR(100);

-- Adicionar comentários nas novas colunas
COMMENT ON COLUMN clientes.responsavel IS 'Nome do responsável pelo cliente';
COMMENT ON COLUMN clientes.contato IS 'Telefone ou email de contato';
COMMENT ON COLUMN clientes.observacao IS 'Observações sobre o cliente (máximo 100 caracteres)';

-- Verificar se a coluna status já existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'status'
    ) THEN
        ALTER TABLE clientes ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ativo';
        COMMENT ON COLUMN clientes.status IS 'Status do cliente (ativo/inativo)';
    END IF;
END $$;

-- Verificar se a coluna codigo_crm já existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'codigo_crm'
    ) THEN
        ALTER TABLE clientes ADD COLUMN codigo_crm VARCHAR(50);
        COMMENT ON COLUMN clientes.codigo_crm IS 'Código do cliente no CRM';
    END IF;
END $$;

-- Verificar se a coluna documento já existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'documento'
    ) THEN
        ALTER TABLE clientes ADD COLUMN documento VARCHAR(20);
        COMMENT ON COLUMN clientes.documento IS 'CNPJ ou CPF do cliente';
    END IF;
END $$;

-- Verificar se a coluna updated_at já existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE clientes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
        COMMENT ON COLUMN clientes.updated_at IS 'Data da última atualização do registro';
    END IF;
END $$;

-- Criar trigger para atualizar o updated_at se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_clientes_updated_at'
    ) THEN
        -- Criar função se não existir
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
        ) THEN
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $func$
            BEGIN
                NEW.updated_at = TIMEZONE('utc'::text, NOW());
                RETURN NEW;
            END;
            $func$ language 'plpgsql';
        END IF;
        
        -- Criar trigger
        CREATE TRIGGER update_clientes_updated_at
            BEFORE UPDATE ON clientes
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
