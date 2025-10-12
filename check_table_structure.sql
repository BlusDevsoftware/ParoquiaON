-- Verificar estrutura da tabela colaboradores
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
ORDER BY ordinal_position;

-- Verificar se existe o campo senha_temporaria
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
AND column_name = 'senha_temporaria';

-- Buscar um colaborador para ver a estrutura atual
SELECT * FROM colaboradores LIMIT 1;

-- Verificar se o admin@egerente.com existe e tem senha_temporaria
SELECT 
    codigo,
    nome,
    email,
    senha,
    senha_temporaria,
    status
FROM colaboradores 
WHERE email = 'admin@egerente.com';
