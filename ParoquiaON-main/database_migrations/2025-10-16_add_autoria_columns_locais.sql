BEGIN;

-- Adicionar colunas de autoria em LOCais (usuario_id inteiro)
ALTER TABLE public.locais
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER,
  ADD COLUMN IF NOT EXISTS criado_por_email TEXT,
  ADD COLUMN IF NOT EXISTS criado_por_nome TEXT;

-- Foreign key para public.usuarios(id), se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locais_usuario_id_fkey'
  ) THEN
    ALTER TABLE public.locais
      ADD CONSTRAINT locais_usuario_id_fkey
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS idx_locais_usuario_id ON public.locais(usuario_id);

COMMIT;


