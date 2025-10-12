-- Adicionar coluna motivo_aglutinacao para armazenar o motivo específico da aglutinação
ALTER TABLE movimento_comissoes 
ADD COLUMN motivo_aglutinacao TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN movimento_comissoes.motivo_aglutinacao IS 'Motivo específico da aglutinação de títulos - separado das observações de pagamento';

-- Criar índice para melhor performance em consultas
CREATE INDEX idx_movimento_comissoes_motivo_aglutinacao ON movimento_comissoes(motivo_aglutinacao);

-- Migrar dados existentes (se necessário)
-- Atualizar registros existentes que têm tipo_aglutinacao = 'AGL-PS'
UPDATE movimento_comissoes 
SET motivo_aglutinacao = observacoes 
WHERE tipo_aglutinacao = 'AGL-PS' 
  AND observacoes IS NOT NULL 
  AND observacoes != '';

-- Limpar campo observacoes para títulos aglutinados existentes
-- (opcional - comentar se quiser preservar dados históricos)
-- UPDATE movimento_comissoes 
-- SET observacoes = NULL 
-- WHERE tipo_aglutinacao = 'AGL-PS' 
--   AND motivo_aglutinacao IS NOT NULL;
