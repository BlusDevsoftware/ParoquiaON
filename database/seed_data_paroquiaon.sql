-- Script para inserir dados de exemplo no ParóquiaON
-- Execute este script APÓS executar o create_tables_paroquiaon.sql

-- ==============================================
-- DADOS DE EXEMPLO PARA COMUNIDADES
-- ==============================================
INSERT INTO comunidades (codigo, nome, telefone, endereco, data_fundacao, status, foto) VALUES
('00001', 'Comunidade São José', '(11) 3333-1111', 'Rua das Flores, 123 - Centro', '2020-01-15', 'Ativo', 'https://example.com/sao-jose.jpg'),
('00002', 'Comunidade Nossa Senhora Aparecida', '(11) 3333-2222', 'Av. Principal, 456 - Bairro Novo', '2019-03-20', 'Ativo', 'https://example.com/aparecida.jpg'),
('00003', 'Comunidade Santo Antônio', '(11) 3333-3333', 'Rua da Paz, 789 - Vila Santa', '2021-06-10', 'Ativo', 'https://example.com/santo-antonio.jpg'),
('00004', 'Comunidade São Francisco', '(11) 3333-4444', 'Praça da Igreja, 321 - Centro', '2018-09-05', 'Ativo', 'https://example.com/sao-francisco.jpg')
ON CONFLICT (codigo) DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA PESSOAS
-- ==============================================
INSERT INTO pessoas (nome, telefone, endereco, email, data_nascimento, ativo) VALUES
('João Silva', '(11) 99999-1111', 'Rua A, 100 - Centro', 'joao.silva@email.com', '1985-05-15', true),
('Maria Santos', '(11) 99999-2222', 'Rua B, 200 - Bairro Novo', 'maria.santos@email.com', '1990-08-22', true),
('Pedro Oliveira', '(11) 99999-3333', 'Rua C, 300 - Vila Santa', 'pedro.oliveira@email.com', '1978-12-03', true),
('Ana Costa', '(11) 99999-4444', 'Rua D, 400 - Centro', 'ana.costa@email.com', '1992-03-18', true),
('Carlos Ferreira', '(11) 99999-5555', 'Rua E, 500 - Bairro Novo', 'carlos.ferreira@email.com', '1988-07-25', true),
('Lucia Mendes', '(11) 99999-6666', 'Rua F, 600 - Vila Santa', 'lucia.mendes@email.com', '1983-11-12', true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA LOCAIS
-- ==============================================
INSERT INTO locais (nome, endereco, capacidade, tipo, ativo) VALUES
('Salão Paroquial', 'Rua da Igreja, 1 - Centro', 200, 'Salão', true),
('Sala de Catequese 1', 'Rua da Igreja, 1 - Centro', 30, 'Sala', true),
('Sala de Catequese 2', 'Rua da Igreja, 1 - Centro', 30, 'Sala', true),
('Capela São José', 'Rua das Flores, 123 - Centro', 80, 'Capela', true),
('Capela Nossa Senhora', 'Av. Principal, 456 - Bairro Novo', 60, 'Capela', true),
('Auditório', 'Rua da Igreja, 1 - Centro', 150, 'Auditório', true),
('Quadra Esportiva', 'Rua da Igreja, 1 - Centro', 100, 'Quadra', true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA AÇÕES
-- ==============================================
INSERT INTO acoes (nome, descricao, pilar_id, ativo) VALUES
('Catequese Infantil', 'Catequese para crianças de 7 a 10 anos', 1, true),
('Catequese Juvenil', 'Catequese para jovens de 11 a 17 anos', 1, true),
('Grupo de Oração', 'Encontro semanal de oração e partilha', 2, true),
('Pastoral da Caridade', 'Ações de caridade e solidariedade', 2, true),
('Coral Paroquial', 'Grupo de canto e música litúrgica', 3, true),
('Ministros da Eucaristia', 'Formação e coordenação dos ministros', 3, true),
('Grupo de Jovens', 'Encontros e atividades para jovens', 4, true),
('Pastoral Familiar', 'Acompanhamento e formação de famílias', 4, true),
('Evangelização', 'Missões e evangelização na comunidade', 5, true),
('Pastoral Vocacional', 'Despertar e acompanhar vocações', 5, true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA PASTORAIS
-- ==============================================
INSERT INTO pastorais (nome, descricao, responsavel_id, comunidade_id, ativo) VALUES
('Pastoral da Catequese', 'Coordenação da catequese paroquial', 2, 1, true),
('Pastoral da Caridade', 'Ações sociais e caritativas', 3, 1, true),
('Pastoral Litúrgica', 'Coordenação das celebrações', 4, 2, true),
('Pastoral da Juventude', 'Trabalho com jovens', 5, 2, true),
('Pastoral Familiar', 'Acompanhamento das famílias', 6, 3, true),
('Pastoral Vocacional', 'Despertar vocações', 2, 3, true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA EVENTOS
-- ==============================================
INSERT INTO agendamentos (titulo, descricao, data_inicio, data_fim, local_id, acao_id, responsavel_id, status_id, comunidade_id, pastoral_id, pilar_id, evento_paroquial, visibilidade, lembrete, capacidade) VALUES
('Catequese Infantil - Aula 1', 'Primeira aula de catequese para crianças', '2024-02-15 14:00:00', '2024-02-15 15:30:00', 2, 1, 2, 1, 1, 1, 1, true, 'Publico', '1h', 30),
('Grupo de Oração', 'Encontro semanal do grupo de oração', '2024-02-16 19:00:00', '2024-02-16 21:00:00', 1, 3, 3, 1, 2, 2, 2, false, 'Publico', '30min', 50),
('Coral Paroquial - Ensaio', 'Ensaio semanal do coral', '2024-02-17 15:00:00', '2024-02-17 17:00:00', 6, 5, 4, 1, 3, 3, 3, true, 'Publico', 'Nenhum', 25),
('Pastoral da Caridade - Reunião', 'Reunião mensal da pastoral', '2024-02-18 14:00:00', '2024-02-18 16:00:00', 1, 4, 3, 1, 4, 4, 4, false, 'Publico', '15min', 20),
('Grupo de Jovens', 'Encontro do grupo de jovens', '2024-02-19 19:30:00', '2024-02-19 22:00:00', 1, 7, 5, 1, 5, 5, 5, true, 'Publico', '1h', 40),
('Pastoral Familiar - Encontro', 'Encontro mensal das famílias', '2024-02-20 15:00:00', '2024-02-20 17:30:00', 1, 8, 6, 1, 6, 6, 6, false, 'Publico', '30min', 35)
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA RECEBIMENTOS
-- ==============================================
INSERT INTO recebimentos (valor, data_recebimento, descricao, categoria, pessoa_id, comunidade_id, status) VALUES
(150.00, '2024-02-01', 'Dízimo mensal', 'Dízimo', 1, 1, 'Confirmado'),
(75.50, '2024-02-02', 'Doação para obras', 'Doação', 2, 1, 'Confirmado'),
(200.00, '2024-02-03', 'Taxa de batizado', 'Sacramentos', 3, 2, 'Confirmado'),
(100.00, '2024-02-04', 'Dízimo mensal', 'Dízimo', 4, 2, 'Confirmado'),
(50.00, '2024-02-05', 'Doação para caridade', 'Doação', 5, 3, 'Confirmado'),
(300.00, '2024-02-06', 'Taxa de casamento', 'Sacramentos', 6, 3, 'Confirmado')
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE EXEMPLO PARA CONFERÊNCIAS
-- ==============================================
INSERT INTO conferencias (nome, descricao, data_inicio, data_fim, local_id, responsavel_id, participantes, status) VALUES
('Conferência de Catequese', 'Encontro de formação para catequistas', '2024-03-15', '2024-03-17', 1, 2, '["João Silva", "Maria Santos", "Pedro Oliveira"]', 'Agendada'),
('Retiro Espiritual', 'Retiro de fim de semana para jovens', '2024-04-20', '2024-04-22', 1, 5, '["Ana Costa", "Carlos Ferreira", "Lucia Mendes"]', 'Agendada'),
('Encontro de Pastoral', 'Reunião geral das pastorais', '2024-05-10', '2024-05-10', 1, 3, '["João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa"]', 'Agendada')
ON CONFLICT DO NOTHING;

-- ==============================================
-- MENSAGEM DE SUCESSO
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DADOS DE EXEMPLO INSERIDOS COM SUCESSO!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Dados inseridos:';
    RAISE NOTICE '- 4 comunidades';
    RAISE NOTICE '- 6 pessoas';
    RAISE NOTICE '- 7 locais';
    RAISE NOTICE '- 10 ações';
    RAISE NOTICE '- 6 pastorais';
    RAISE NOTICE '- 6 agendamentos';
    RAISE NOTICE '- 6 recebimentos';
    RAISE NOTICE '- 3 conferências';
    RAISE NOTICE '';
    RAISE NOTICE 'O sistema está pronto para uso!';
    RAISE NOTICE '==============================================';
END $$;
