BEGIN;

-- Adiciona colunas de autoria em pastorais e pilares (usuario_id inteiro)
ALTER TABLE public.pastorais
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER,
  ADD COLUMN IF NOT EXISTS criado_por_email TEXT,
  ADD COLUMN IF NOT EXISTS criado_por_nome TEXT;

ALTER TABLE public.pilares
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER,
  ADD COLUMN IF NOT EXISTS criado_por_email TEXT,
  ADD COLUMN IF NOT EXISTS criado_por_nome TEXT;

-- Foreign keys para public.usuarios(id), se ainda não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pastorais_usuario_id_fkey'
  ) THEN
    ALTER TABLE public.pastorais
      ADD CONSTRAINT pastorais_usuario_id_fkey
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pilares_usuario_id_fkey'
  ) THEN
    ALTER TABLE public.pilares
      ADD CONSTRAINT pilares_usuario_id_fkey
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_pastorais_usuario_id ON public.pastorais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pilares_usuario_id   ON public.pilares(usuario_id);

COMMIT;


