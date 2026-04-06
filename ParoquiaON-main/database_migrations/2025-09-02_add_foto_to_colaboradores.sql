-- Adiciona coluna de foto (base64 ou URL) à tabela colaboradores
-- Tipo TEXT para comportar base64. Se preferir armazenar URL de storage, também atende.

ALTER TABLE colaboradores
ADD COLUMN IF NOT EXISTS foto TEXT;

-- Índice não necessário aqui; é campo de dados binários/URL
-- Para limpar fotos antigas nulas: UPDATE colaboradores SET foto = NULL WHERE foto = '';


