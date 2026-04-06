const { supabase } = require('../config/supabase');

async function listarEventos(req, res) {
    try {
        const leve = req.query.leve === '1' || req.query.leve === 'true';
        
        // Modo leve: apenas campos essenciais (para Minha Comunidade)
        if (leve) {
            const { data: agendamentos, error: agendamentosError } = await supabase
                .from('agendamentos')
                .select('id, data_inicio, comunidade_id')
                .order('data_inicio', { ascending: true });
            
            if (agendamentosError) {
                console.error('❌ Erro ao buscar agendamentos (modo leve):', agendamentosError);
                throw agendamentosError;
            }
            
            return res.json(agendamentos || []);
        }
        
        // Modo completo: comportamento original (para outras telas)
        console.log('🔄 Iniciando listagem de eventos (modo completo)...');
        
        // Primeiro, tentar uma consulta simples para verificar se a tabela existe
        const { data: testData, error: testError } = await supabase
            .from('agendamentos')
            .select('id, titulo')
            .limit(1);
            
        if (testError) {
            console.error('❌ Erro ao acessar tabela agendamentos:', testError);
            return res.status(500).json({ 
                error: 'Erro ao acessar tabela agendamentos',
                details: testError.message 
            });
        }
        
        console.log('✅ Tabela agendamentos acessível, fazendo consulta completa...');
        
        // Filtro opcional por data de início (para reduzir volume quando desejado)
        const { start_date: startDate } = req.query;
        
        // Primeiro buscar os agendamentos sem relacionamentos complexos
        let agendamentosQuery = supabase
            .from('agendamentos')
            .select('*');

        if (startDate) {
            agendamentosQuery = agendamentosQuery.gte('data_inicio', startDate);
        }

        const { data: agendamentos, error: agendamentosError } = await agendamentosQuery
            .order('data_inicio', { ascending: true });
            
        if (agendamentosError) {
            console.error('❌ Erro ao buscar agendamentos:', agendamentosError);
            throw agendamentosError;
        }
        
        // Buscar dados relacionados separadamente
        const relacionamentos = {};
        
        // Buscar locais
        const { data: locais } = await supabase.from('locais').select('id, nome');
        if (locais) relacionamentos.locais = locais;
        
        // Buscar ações
        const { data: acoes } = await supabase.from('acoes').select('id, nome');
        if (acoes) relacionamentos.acoes = acoes;
        
        // Buscar pessoas (sem foto para reduzir consumo - foto será carregada sob demanda)
        const { data: pessoas } = await supabase.from('pessoas').select('id, nome');
        if (pessoas) relacionamentos.pessoas = pessoas;
        
        // Buscar comunidades
        const { data: comunidades } = await supabase.from('comunidades').select('id, nome, foto, cor');
        if (comunidades) relacionamentos.comunidades = comunidades;
        
        // Buscar pastorais
        const { data: pastorais } = await supabase.from('pastorais').select('id, nome');
        if (pastorais) relacionamentos.pastorais = pastorais;
        
        // Buscar pilares
        const { data: pilares } = await supabase.from('pilares').select('id, nome');
        if (pilares) relacionamentos.pilares = pilares;
        
        // Buscar usuários (inclui pessoa_id para chegar na foto)
        const { data: usuarios } = await supabase.from('usuarios').select('id, email, pessoa_id');
        if (usuarios) relacionamentos.usuarios = usuarios;
        
        // Status removido - não é necessário carregar essa informação
        
        // Combinar os dados
        const data = agendamentos?.map(agendamento => {
            const usuarioLancamento = relacionamentos.usuarios?.find(u => u.id === agendamento.usuario_lancamento_id) || null;
            const pessoaDoUsuarioLancamento = usuarioLancamento && relacionamentos.pessoas
                ? relacionamentos.pessoas.find(p => p.id === usuarioLancamento.pessoa_id)
                : null;

            return {
                ...agendamento,
                locais: relacionamentos.locais?.find(l => l.id === agendamento.local_id),
                acoes: relacionamentos.acoes?.find(a => a.id === agendamento.acao_id),
                pessoas: relacionamentos.pessoas?.find(p => p.id === agendamento.responsavel_id),
                comunidades: relacionamentos.comunidades?.find(c => c.id === agendamento.comunidade_id),
                pastorais: relacionamentos.pastorais?.find(p => p.id === agendamento.pastoral_id),
                pilares: relacionamentos.pilares?.find(p => p.id === agendamento.pilar_id),
                // Usuário que lançou o agendamento
                usuarios: usuarioLancamento,
                // Campos derivados para facilitar uso no frontend
                usuario_lancamento_nome: pessoaDoUsuarioLancamento?.nome || usuarioLancamento?.email || null,
                usuario_lancamento_email: usuarioLancamento?.email || null
                // usuario_lancamento_foto removido - será carregado sob demanda quando o modal for aberto
                // status_agendamento removido - não é necessário
            };
        }) || [];
        
        console.log(`✅ ${data?.length || 0} eventos encontrados`);
        res.json(data || []);
    } catch (error) {
        console.error('❌ Erro ao listar eventos:', error);
        res.status(500).json({ 
            error: 'Erro ao listar eventos',
            details: error.message 
        });
    }
}

async function buscarEvento(req, res) {
    try {
        const { id } = req.params;
        
        // Buscar o agendamento
        const { data: agendamento, error: agendamentoError } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('id', id)
            .single();
            
        if (agendamentoError) throw agendamentoError;
        if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
        
        // Buscar dados relacionados
        const relacionamentos = {};
        
        if (agendamento.local_id) {
            const { data: local } = await supabase.from('locais').select('id, nome').eq('id', agendamento.local_id).single();
            relacionamentos.locais = local;
        }
        
        if (agendamento.acao_id) {
            const { data: acao } = await supabase.from('acoes').select('id, nome').eq('id', agendamento.acao_id).single();
            relacionamentos.acoes = acao;
        }
        
        if (agendamento.responsavel_id) {
            const { data: pessoa } = await supabase.from('pessoas').select('id, nome').eq('id', agendamento.responsavel_id).single();
            relacionamentos.pessoas = pessoa;
        }
        
        if (agendamento.comunidade_id) {
            const { data: comunidade } = await supabase.from('comunidades').select('id, nome, foto, cor').eq('id', agendamento.comunidade_id).single();
            relacionamentos.comunidades = comunidade;
        }
        
        if (agendamento.pastoral_id) {
            const { data: pastoral } = await supabase.from('pastorais').select('id, nome').eq('id', agendamento.pastoral_id).single();
            relacionamentos.pastorais = pastoral;
        }
        
        if (agendamento.pilar_id) {
            const { data: pilar } = await supabase.from('pilares').select('id, nome').eq('id', agendamento.pilar_id).single();
            relacionamentos.pilares = pilar;
        }
        
        if (agendamento.usuario_lancamento_id) {
            // Buscar usuário que lançou o agendamento (inclui pessoa_id)
            const { data: usuario } = await supabase
                .from('usuarios')
                .select('id, email, pessoa_id')
                .eq('id', agendamento.usuario_lancamento_id)
                .single();
            relacionamentos.usuarios = usuario;

            // Buscar pessoa vinculada ao usuário para obter nome/foto
            if (usuario && usuario.pessoa_id) {
                const { data: pessoaUsuario } = await supabase
                    .from('pessoas')
                    .select('id, nome, foto')
                    .eq('id', usuario.pessoa_id)
                    .single();

                if (pessoaUsuario) {
                    relacionamentos.usuario_lancamento_nome = pessoaUsuario.nome || usuario.email || null;
                    relacionamentos.usuario_lancamento_email = usuario.email || null;
                    relacionamentos.usuario_lancamento_foto = pessoaUsuario.foto || null;
                } else {
                    relacionamentos.usuario_lancamento_nome = usuario.email || null;
                    relacionamentos.usuario_lancamento_email = usuario.email || null;
                    relacionamentos.usuario_lancamento_foto = null;
                }
            }
        }
        
        // Status removido - não é necessário carregar essa informação
        
        // Combinar os dados
        const data = {
            ...agendamento,
            ...relacionamentos
        };
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
}

async function criarEvento(req, res) {
    try {
        const dados = req.body;
        
        // Validação básica
        if (!dados.titulo || !dados.data_inicio) {
            return res.status(400).json({ error: 'Título e data de início são obrigatórios' });
        }
        
        // Mapear visibilidade para valores corretos do banco
        const visibilidadeMapping = {
            'publico': 'Publico',
            'privado': 'Privado',
            'restrito': 'Restrito'
        };
        
        const visibilidadeCorreta = visibilidadeMapping[dados.visibilidade] || 'Publico';
        
        // Adicionar dados do usuário de lançamento
        const dadosCompletos = {
            ...dados,
            visibilidade: visibilidadeCorreta,
            usuario_lancamento_id: dados.usuario_lancamento_id || req.user?.id || null
        };
        
        // OTIMIZAÇÃO: Remover validações de FK - o banco já valida com constraints
        // Se houver FK inválida, o Supabase retornará erro e tratamos abaixo
        
        // Inserir evento
        const { data: insertedData, error } = await supabase
            .from('agendamentos')
            .insert([dadosCompletos])
            .select('*')
            .single();
            
        if (error) {
            // Tratar erros de FK inválida de forma amigável
            if (error.code === '23503' || error.message?.includes('foreign key')) {
                return res.status(400).json({ 
                    error: 'Referência inválida em um dos campos relacionados',
                    details: error.message 
                });
            }
            console.error('❌ Erro do Supabase ao inserir agendamento:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
        
        // OTIMIZAÇÃO: Buscar relacionamentos em PARALELO (Promise.all) ao invés de sequencial
        const relacionamentosPromises = [];
        
        if (insertedData.local_id) {
            relacionamentosPromises.push(
                supabase.from('locais').select('id, nome').eq('id', insertedData.local_id).single()
                    .then(({ data }) => ({ key: 'locais', data }))
            );
        }
        
        if (insertedData.acao_id) {
            relacionamentosPromises.push(
                supabase.from('acoes').select('id, nome').eq('id', insertedData.acao_id).single()
                    .then(({ data }) => ({ key: 'acoes', data }))
            );
        }
        
        if (insertedData.responsavel_id) {
            relacionamentosPromises.push(
                supabase.from('pessoas').select('id, nome').eq('id', insertedData.responsavel_id).single()
                    .then(({ data }) => ({ key: 'pessoas', data }))
            );
        }
        
        if (insertedData.comunidade_id) {
            relacionamentosPromises.push(
                supabase.from('comunidades').select('id, nome, foto, cor').eq('id', insertedData.comunidade_id).single()
                    .then(({ data }) => ({ key: 'comunidades', data }))
            );
        }
        
        if (insertedData.pastoral_id) {
            relacionamentosPromises.push(
                supabase.from('pastorais').select('id, nome').eq('id', insertedData.pastoral_id).single()
                    .then(({ data }) => ({ key: 'pastorais', data }))
            );
        }
        
        if (insertedData.pilar_id) {
            relacionamentosPromises.push(
                supabase.from('pilares').select('id, nome').eq('id', insertedData.pilar_id).single()
                    .then(({ data }) => ({ key: 'pilares', data }))
            );
        }
        
        if (insertedData.usuario_lancamento_id) {
            relacionamentosPromises.push(
                supabase.from('usuarios').select('id, email').eq('id', insertedData.usuario_lancamento_id).single()
                    .then(({ data }) => ({ key: 'usuarios', data }))
            );
        }
        
        // Executar todas as buscas em paralelo
        const relacionamentosResults = await Promise.all(relacionamentosPromises);
        
        // Montar objeto de relacionamentos
        const relacionamentos = {};
        relacionamentosResults.forEach(({ key, data }) => {
            if (data) relacionamentos[key] = data;
        });
        
        // Combinar os dados
        const data = {
            ...insertedData,
            ...relacionamentos
        };
        
        res.status(201).json(data);
    } catch (error) {
        console.error('❌ Erro ao criar agendamento:', {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code
        });
        res.status(500).json({ 
            error: 'Erro ao criar agendamento',
            details: error?.message || null,
            code: error?.code || null
        });
    }
}

async function atualizarEvento(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        
        // Buscar evento original para preservar valores se não vierem no body ou vierem como null
        const { data: eventoOriginal } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('id', id)
            .single();
            
        if (!eventoOriginal) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        
        // Preservar valores originais se campos vierem como null ou undefined
        const dadosAtualizados = {
            ...dados,
            // Preservar usuario_lancamento_id original se não vier ou vier null
            usuario_lancamento_id: dados.usuario_lancamento_id !== undefined && dados.usuario_lancamento_id !== null
                ? dados.usuario_lancamento_id 
                : (eventoOriginal.usuario_lancamento_id || req.user?.id || null),
            // Preservar outros campos se vierem como null
            comunidade_id: dados.comunidade_id !== undefined && dados.comunidade_id !== null
                ? dados.comunidade_id
                : eventoOriginal.comunidade_id,
            pastoral_id: dados.pastoral_id !== undefined && dados.pastoral_id !== null
                ? dados.pastoral_id
                : eventoOriginal.pastoral_id,
            pilar_id: dados.pilar_id !== undefined && dados.pilar_id !== null
                ? dados.pilar_id
                : eventoOriginal.pilar_id,
            local_id: dados.local_id !== undefined && dados.local_id !== null
                ? dados.local_id
                : eventoOriginal.local_id,
            acao_id: dados.acao_id !== undefined && dados.acao_id !== null
                ? dados.acao_id
                : eventoOriginal.acao_id
        };
        
        // Atualizar evento
        const { data: updatedData, error } = await supabase
            .from('agendamentos')
            .update(dadosAtualizados)
            .eq('id', id)
            .select('*')
            .single();
            
        if (error) throw error;
        if (!updatedData) return res.status(404).json({ error: 'Agendamento não encontrado' });
        
        // OTIMIZAÇÃO: Buscar relacionamentos em PARALELO
        const relacionamentosPromises = [];
        
        if (updatedData.local_id) {
            relacionamentosPromises.push(
                supabase.from('locais').select('id, nome').eq('id', updatedData.local_id).single()
                    .then(({ data }) => ({ key: 'locais', data }))
            );
        }
        
        if (updatedData.acao_id) {
            relacionamentosPromises.push(
                supabase.from('acoes').select('id, nome').eq('id', updatedData.acao_id).single()
                    .then(({ data }) => ({ key: 'acoes', data }))
            );
        }
        
        if (updatedData.responsavel_id) {
            relacionamentosPromises.push(
                supabase.from('pessoas').select('id, nome').eq('id', updatedData.responsavel_id).single()
                    .then(({ data }) => ({ key: 'pessoas', data }))
            );
        }
        
        if (updatedData.comunidade_id) {
            relacionamentosPromises.push(
                supabase.from('comunidades').select('id, nome, foto, cor').eq('id', updatedData.comunidade_id).single()
                    .then(({ data }) => ({ key: 'comunidades', data }))
            );
        }
        
        if (updatedData.pastoral_id) {
            relacionamentosPromises.push(
                supabase.from('pastorais').select('id, nome').eq('id', updatedData.pastoral_id).single()
                    .then(({ data }) => ({ key: 'pastorais', data }))
            );
        }
        
        if (updatedData.pilar_id) {
            relacionamentosPromises.push(
                supabase.from('pilares').select('id, nome').eq('id', updatedData.pilar_id).single()
                    .then(({ data }) => ({ key: 'pilares', data }))
            );
        }
        
        if (updatedData.usuario_lancamento_id) {
            relacionamentosPromises.push(
                supabase.from('usuarios').select('id, email').eq('id', updatedData.usuario_lancamento_id).single()
                    .then(({ data }) => ({ key: 'usuarios', data }))
            );
        }
        
        // Executar todas as buscas em paralelo
        const relacionamentosResults = await Promise.all(relacionamentosPromises);
        
        // Montar objeto de relacionamentos
        const relacionamentos = {};
        relacionamentosResults.forEach(({ key, data }) => {
            if (data) relacionamentos[key] = data;
        });
        
        // Combinar os dados
        const data = {
            ...updatedData,
            ...relacionamentos
        };
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
}

async function excluirEvento(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('agendamentos').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Evento não encontrado' });
        res.json({ message: 'Agendamento excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
}

// Estatísticas dos agendamentos
async function estatisticasEventos(req, res) {
    try {
        const { data: total, error: totalError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true });

        if (totalError) {
            throw new Error('Erro ao buscar estatísticas');
        }

        res.json({
            total: total?.length || 0
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
}

// Dados para gráficos de agendamentos
async function dadosGraficosEventos(req, res) {
    try {
        // Buscar todos os agendamentos
        const { data: agendamentos, error: agendamentosError } = await supabase
            .from('agendamentos')
            .select(`
                id,
                titulo,
                data_inicio,
                created_at
            `)
            .order('created_at', { ascending: true });

        if (agendamentosError) throw agendamentosError;

        // Calcular evolução de agendamentos por mês (últimos 6 meses)
        const evolucaoAgendamentos = calcularEvolucaoEventos(agendamentos);

        // Calcular agendamentos por mês (próximos 6 meses)
        const agendamentosPorMes = calcularEventosPorMes(agendamentos);

        res.json({
            evolucao: evolucaoAgendamentos,
            eventosPorMes: agendamentosPorMes,
            totalEventos: agendamentos?.length || 0
        });

    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos:', error);
        res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
    }
}

// Função auxiliar para calcular evolução de eventos
function calcularEvolucaoEventos(eventos) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const eventosMes = (eventos || []).filter(e => {
            if (!e || !e.created_at) return false;
            const dataEvento = new Date(e.created_at);
            if (isNaN(dataEvento.getTime())) return false;
            return dataEvento.getMonth() === mes.getMonth() && 
                   dataEvento.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = eventosMes.length;
    }

    return { labels, dados };
}

// Função auxiliar para calcular eventos por mês
function calcularEventosPorMes(eventos) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const eventosMes = (eventos || []).filter(e => {
            if (!e || !e.data_inicio) return false;
            const dataEvento = new Date(e.data_inicio);
            if (isNaN(dataEvento.getTime())) return false;
            return dataEvento.getMonth() === mes.getMonth() && 
                   dataEvento.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = eventosMes.length;
    }

    return { labels, dados };
}

module.exports = { 
    listarEventos, 
    buscarEvento, 
    criarEvento, 
    atualizarEvento, 
    excluirEvento,
    estatisticasEventos,
    dadosGraficosEventos
};
