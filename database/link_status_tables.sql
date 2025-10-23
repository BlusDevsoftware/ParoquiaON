-- Script para ligar tabela agendamentos com status_agendamento
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela status_agendamento existe
SELECT 'Verificando tabela status_agendamento...' as info;
SELECT COUNT(*) as total_status FROM status_agendamento;

-- 2. Verificar estrutura atual da tabela agendamentos
SELECT 'Estrutura atual da tabela agendamentos:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND column_name IN ('status', 'status_id')
ORDER BY ordinal_position;

-- 3. Se a coluna status_id não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' 
        AND column_name = 'status_id'
    ) THEN
        ALTER TABLE agendamentos ADD COLUMN status_id INTEGER;
        RAISE NOTICE 'Coluna status_id criada';
    ELSE
        RAISE NOTICE 'Coluna status_id já existe';
    END IF;
END $$;

-- 4. Adicionar foreign key constraint
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS fk_agendamentos_status_id;

ALTER TABLE agendamentos 
ADD CONSTRAINT fk_agendamentos_status_id 
FOREIGN KEY (status_id) REFERENCES status_agendamento(id);

-- 5. Mapear status antigos para novos IDs
UPDATE agendamentos 
SET status_id = CASE 
    WHEN status = 'agendado' THEN (SELECT id FROM status_agendamento WHERE nome = 'agendado')
    WHEN status = 'confirmado' THEN (SELECT id FROM status_agendamento WHERE nome = 'confirmado')
    WHEN status = 'pendente' THEN (SELECT id FROM status_agendamento WHERE nome = 'pendente')
    WHEN status = 'cancelado' THEN (SELECT id FROM status_agendamento WHERE nome = 'cancelado')
    ELSE (SELECT id FROM status_agendamento WHERE nome = 'agendado')
END
WHERE status_id IS NULL;

-- 6. Definir status_id como NOT NULL após migração
ALTER TABLE agendamentos 
ALTER COLUMN status_id SET NOT NULL;

-- 7. Remover constraint antiga de status (se existir)
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_check;

-- 8. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_status_id ON agendamentos(status_id);

-- 9. Verificar resultado
SELECT 'Resultado da migração:' as info;
SELECT 
    sa.nome as status_nome,
    COUNT(a.id) as total_agendamentos
FROM status_agendamento sa
LEFT JOIN agendamentos a ON sa.id = a.status_id
GROUP BY sa.id, sa.nome
ORDER BY sa.id;

-- 10. Verificar foreign keys criadas
SELECT 'Foreign keys da tabela agendamentos:' as info;
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'agendamentos'
    AND kcu.column_name = 'status_id';
