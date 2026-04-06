BEGIN;

-- Adicionar coluna status (TEXT) em pilares e sincronizar com a coluna booleana ativo
-- A coluna "ativo" permanece por compatibilidade; a aplicação passará a enviar/usar "status" ('ativo'|'inativo')

-- 1) Adiciona coluna status se não existir
ALTER TABLE public.pilares
  ADD COLUMN IF NOT EXISTS status TEXT;

-- 2) Popular status com base no valor atual de ativo (true/false)
UPDATE public.pilares
   SET status = CASE WHEN ativo IS DISTINCT FROM FALSE THEN 'ativo' ELSE 'inativo' END
 WHERE status IS NULL;

-- 3) Definir default e restrição de domínio para status
ALTER TABLE public.pilares
  ALTER COLUMN status SET DEFAULT 'ativo';

-- Criar constraint de verificação se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'pilares_status_check'
  ) THEN
    ALTER TABLE public.pilares
      ADD CONSTRAINT pilares_status_check CHECK (status IN ('ativo','inativo'));
  END IF;
END $$;

-- 4) Opcional: índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_pilares_status ON public.pilares(status);

COMMIT;


