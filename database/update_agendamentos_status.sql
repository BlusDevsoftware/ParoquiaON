-- Script para atualizar sistema de status dos agendamentos
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de status
CREATE TABLE IF NOT EXISTS status_agendamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inserir status padrão
INSERT INTO status_agendamento (nome, descricao) VALUES 
('agendado', 'Evento agendado, aguardando confirmação'),
('confirmado', 'Evento confirmado e aprovado'),
('pendente', 'Evento pendente de aprovação'),
('cancelado', 'Evento cancelado')
ON CONFLICT (nome) DO NOTHING;

-- 3. Adicionar coluna status_id
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES status_agendamento(id);

-- 4. Atualizar registros existentes
UPDATE agendamentos 
SET status_id = (SELECT id FROM status_agendamento WHERE nome = 'agendado')
WHERE status_id IS NULL;

-- 5. Remover constraint antiga
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_check;

-- 6. Adicionar nova constraint
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_status_id_check 
CHECK (status_id IS NOT NULL);

-- 7. Criar índice
CREATE INDEX IF NOT EXISTS idx_agendamentos_status_id ON agendamentos(status_id);

-- 8. Verificar resultado
SELECT 
    sa.nome as status_nome,
    COUNT(a.id) as total_agendamentos
FROM status_agendamento sa
LEFT JOIN agendamentos a ON sa.id = a.status_id
GROUP BY sa.id, sa.nome
ORDER BY sa.id;
