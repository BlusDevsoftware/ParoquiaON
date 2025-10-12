-- Adicionar trigger para atualizar updated_at na tabela movimento_comissoes
-- Este script adiciona a funcionalidade de atualização automática do campo updated_at

-- Verificar se a função já existe, se não, criar
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('America/Sao_Paulo'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_movimento_comissoes_updated_at ON movimento_comissoes;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_movimento_comissoes_updated_at
    BEFORE UPDATE ON movimento_comissoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar comentário explicativo
COMMENT ON TRIGGER update_movimento_comissoes_updated_at ON movimento_comissoes IS 'Trigger para atualizar automaticamente o campo updated_at quando o registro for modificado';

-- Verificar se o trigger foi criado corretamente
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_movimento_comissoes_updated_at';
