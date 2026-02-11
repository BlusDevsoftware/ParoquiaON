-- Adiciona colunas de latitude e longitude para exibir localização no mapa
ALTER TABLE comunidades
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
