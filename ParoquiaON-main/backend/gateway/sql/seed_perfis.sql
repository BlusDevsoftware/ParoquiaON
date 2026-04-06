-- Seed de perfis e permissões padrão
-- Ordem de execução: após create_perfis.sql e create_perfis_permissoes.sql

-- Cria perfil GERENTE (tudo liberado conforme cada seção)
INSERT INTO perfis (codigo, nome, status)
VALUES ('00001', 'Gerente', 'ativo')
ON CONFLICT (codigo) DO NOTHING;

-- Função auxiliar: insere/atualiza permissões por seção
-- Para Postgres puro usaremos upsert por (perfil_codigo, secao)

-- Dashboard
INSERT INTO perfis_permissoes (perfil_codigo, secao, ver)
VALUES ('00001', 'Dashboard', TRUE)
ON CONFLICT (perfil_codigo, secao) DO UPDATE SET ver = EXCLUDED.ver;

-- Cadastros
INSERT INTO perfis_permissoes (perfil_codigo, secao, ver, criar, editar, excluir)
VALUES 
  ('00001', 'Cadastros/Colaboradores', TRUE, TRUE, TRUE, TRUE),
  ('00001', 'Cadastros/Clientes', TRUE, TRUE, TRUE, TRUE),
  ('00001', 'Cadastros/Produtos', TRUE, TRUE, TRUE, TRUE),
  ('00001', 'Cadastros/Serviços', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (perfil_codigo, secao) DO UPDATE 
SET ver = EXCLUDED.ver, criar = EXCLUDED.criar, editar = EXCLUDED.editar, excluir = EXCLUDED.excluir;

-- Comissões
INSERT INTO perfis_permissoes (perfil_codigo, secao, ver, criar, editar, excluir)
VALUES 
  ('00001', 'Comissões/Lançar', TRUE, TRUE, FALSE, FALSE),
  ('00001', 'Comissões/Movimento', TRUE, TRUE, TRUE, TRUE),
  ('00001', 'Comissões/Consulta', TRUE, FALSE, FALSE, FALSE)
ON CONFLICT (perfil_codigo, secao) DO UPDATE 
SET ver = EXCLUDED.ver, criar = EXCLUDED.criar, editar = EXCLUDED.editar, excluir = EXCLUDED.excluir;

-- Relatórios (habilita ver e exportar)
INSERT INTO perfis_permissoes (perfil_codigo, secao, ver, exportar)
VALUES 
  ('00001', 'Relatórios/Recebimento', TRUE, TRUE),
  ('00001', 'Relatórios/Conferência', TRUE, TRUE),
  ('00001', 'Relatórios/Dinâmico', TRUE, TRUE)
ON CONFLICT (perfil_codigo, secao) DO UPDATE 
SET ver = EXCLUDED.ver, exportar = EXCLUDED.exportar;

-- Configurações (habilita ver e executar)
INSERT INTO perfis_permissoes (perfil_codigo, secao, ver, executar)
VALUES 
  ('00001', 'Configurações/Manutenção BD', TRUE, TRUE),
  ('00001', 'Configurações/Sincronizar', TRUE, TRUE)
ON CONFLICT (perfil_codigo, secao) DO UPDATE 
SET ver = EXCLUDED.ver, executar = EXCLUDED.executar;


