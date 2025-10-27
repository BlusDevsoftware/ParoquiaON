-- Migration: Adicionar campo "cor" à tabela comunidades
-- Data: 2025-10-28
-- Descrição: Adiciona campo de cor personalizada para identificação visual das comunidades

-- Adicionar coluna "cor" à tabela comunidades
ALTER TABLE comunidades 
ADD COLUMN IF NOT EXISTS cor VARCHAR(7) DEFAULT '#1e3a8a';

-- Adicionar comentário na coluna
COMMENT ON COLUMN comunidades.cor IS 'Cor hexadecimal para identificação visual da comunidade';

