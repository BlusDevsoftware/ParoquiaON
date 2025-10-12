-- Adicionar coluna tipo_aglutinacao para identificar títulos aglutinados
ALTER TABLE movimento_comissoes 
ADD COLUMN tipo_aglutinacao VARCHAR(20) DEFAULT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN movimento_comissoes.tipo_aglutinacao IS 'Tipo especial para títulos aglutinados (AGL-PS) - não afeta a constraint de foreign key do campo tipo';

-- Criar índice para melhor performance em consultas
CREATE INDEX idx_movimento_comissoes_tipo_aglutinacao ON movimento_comissoes(tipo_aglutinacao);
