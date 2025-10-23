-- ==============================================
-- TABELA DE AGENDAMENTOS (EVENTOS DA AGENDA)
-- ==============================================
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    local_id INTEGER REFERENCES locais(id),
    acao_id INTEGER REFERENCES acoes(id),
    responsavel_id INTEGER REFERENCES pessoas(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    pastoral_id INTEGER REFERENCES pastorais(id),
    pilar_id INTEGER REFERENCES pilares(id),
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Concluído', 'Cancelado')),
    evento_paroquial BOOLEAN DEFAULT false,
    visibilidade VARCHAR(20) DEFAULT 'Publico' CHECK (visibilidade IN ('Publico', 'Privado', 'Restrito')),
    lembrete VARCHAR(50) DEFAULT 'Nenhum' CHECK (lembrete IN ('Nenhum', '15min', '30min', '1h', '1dia')),
    capacidade INTEGER,
    usuario_lancamento_id INTEGER REFERENCES usuarios(id),
    usuario_lancamento_nome VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_inicio ON agendamentos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_local_id ON agendamentos(local_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_acao_id ON agendamentos(acao_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_comunidade_id ON agendamentos(comunidade_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_pastoral_id ON agendamentos(pastoral_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_pilar_id ON agendamentos(pilar_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agendamentos_updated_at 
    BEFORE UPDATE ON agendamentos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE agendamentos IS 'Tabela para armazenar agendamentos e eventos da paróquia';
COMMENT ON COLUMN agendamentos.titulo IS 'Título do evento/agendamento';
COMMENT ON COLUMN agendamentos.descricao IS 'Descrição detalhada do evento';
COMMENT ON COLUMN agendamentos.objetivo IS 'Objetivo do evento';
COMMENT ON COLUMN agendamentos.data_inicio IS 'Data e hora de início do evento';
COMMENT ON COLUMN agendamentos.data_fim IS 'Data e hora de fim do evento';
COMMENT ON COLUMN agendamentos.local_id IS 'ID do local onde será realizado';
COMMENT ON COLUMN agendamentos.acao_id IS 'ID da ação relacionada';
COMMENT ON COLUMN agendamentos.responsavel_id IS 'ID da pessoa responsável';
COMMENT ON COLUMN agendamentos.comunidade_id IS 'ID da comunidade relacionada';
COMMENT ON COLUMN agendamentos.pastoral_id IS 'ID da pastoral relacionada';
COMMENT ON COLUMN agendamentos.pilar_id IS 'ID do pilar relacionado';
COMMENT ON COLUMN agendamentos.status IS 'Status do agendamento';
COMMENT ON COLUMN agendamentos.evento_paroquial IS 'Se é um evento paroquial';
COMMENT ON COLUMN agendamentos.visibilidade IS 'Nível de visibilidade do evento';
COMMENT ON COLUMN agendamentos.lembrete IS 'Tipo de lembrete';
COMMENT ON COLUMN agendamentos.capacidade IS 'Capacidade máxima do evento';
COMMENT ON COLUMN agendamentos.usuario_lancamento_id IS 'ID do usuário que criou o agendamento';
COMMENT ON COLUMN agendamentos.usuario_lancamento_nome IS 'Nome do usuário que criou o agendamento';
