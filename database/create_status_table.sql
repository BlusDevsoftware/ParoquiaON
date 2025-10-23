-- Criar tabela de status para agendamentos
CREATE TABLE IF NOT EXISTS status_agendamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir os status padrão
INSERT INTO status_agendamento (nome, descricao) VALUES 
('agendado', 'Evento agendado, aguardando confirmação'),
('confirmado', 'Evento confirmado e aprovado'),
('pendente', 'Evento pendente de aprovação'),
('cancelado', 'Evento cancelado')
ON CONFLICT (nome) DO NOTHING;

-- Adicionar coluna status_id na tabela agendamentos (se não existir)
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES status_agendamento(id);

-- Atualizar registros existentes para usar status_id = 1 (agendado)
UPDATE agendamentos 
SET status_id = 1 
WHERE status_id IS NULL;

-- Remover a constraint antiga de status (se existir)
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_check;

-- Adicionar nova constraint para status_id
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_status_id_check 
CHECK (status_id IS NOT NULL);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_status_id ON agendamentos(status_id);

-- Comentários para documentação
COMMENT ON TABLE status_agendamento IS 'Tabela de status para agendamentos';
COMMENT ON COLUMN status_agendamento.nome IS 'Nome do status (agendado, confirmado, pendente, cancelado)';
COMMENT ON COLUMN status_agendamento.descricao IS 'Descrição detalhada do status';
COMMENT ON COLUMN status_agendamento.ativo IS 'Se o status está ativo para uso';

COMMENT ON COLUMN agendamentos.status_id IS 'Referência ao status do agendamento';
