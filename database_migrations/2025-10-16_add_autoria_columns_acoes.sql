BEGIN;

-- Adicionar colunas de autoria em acoes (usuario_id, criado_por_email, criado_por_nome)
ALTER TABLE public.acoes
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER,
  ADD COLUMN IF NOT EXISTS criado_por_email TEXT,
  ADD COLUMN IF NOT EXISTS criado_por_nome TEXT;

-- Foreign key para public.usuarios(id), se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'acoes_usuario_id_fkey'
  ) THEN
    ALTER TABLE public.acoes
      ADD CONSTRAINT acoes_usuario_id_fkey
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS idx_acoes_usuario_id ON public.acoes(usuario_id);

COMMIT;


