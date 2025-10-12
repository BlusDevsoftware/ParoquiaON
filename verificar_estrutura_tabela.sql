-- Comando para verificar a estrutura completa da tabela colaboradores
SELECT 
    column_name as "Nome da Coluna",
    data_type as "Tipo de Dados",
    character_maximum_length as "Tamanho Máximo",
    is_nullable as "Permite NULL",
    column_default as "Valor Padrão",
    ordinal_position as "Posição"
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
ORDER BY ordinal_position;

-- Comando alternativo mais simples
\d colaboradores;

-- Ou se estiver usando PostgreSQL diretamente:
SELECT * FROM information_schema.columns WHERE table_name = 'colaboradores';
