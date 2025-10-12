-- Habilitar apenas RLS (as tabelas já estão na publicação do Realtime)
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.movimento_comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas RLS básicas para permitir acesso autenticado
-- Política para movimento_comissoes
CREATE POLICY "Permitir acesso autenticado" ON public.movimento_comissoes
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para colaboradores
CREATE POLICY "Permitir acesso autenticado" ON public.colaboradores
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para clientes
CREATE POLICY "Permitir acesso autenticado" ON public.clientes
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para produtos
CREATE POLICY "Permitir acesso autenticado" ON public.produtos
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para serviços
CREATE POLICY "Permitir acesso autenticado" ON public.servicos
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Verificar se RLS foi habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('movimento_comissoes', 'colaboradores', 'clientes', 'produtos', 'servicos')
AND schemaname = 'public';
