-- Adiciona coluna comunidade_id para vincular o local a uma comunidade
ALTER TABLE locais
ADD COLUMN IF NOT EXISTS comunidade_id INTEGER REFERENCES comunidades(id);
