const { supabase, dbHelpers } = require('../config/supabase');

// Listar todos os eventos
async function listarEventos(req, res) {
    try {
        const { page = 1, limit = 10, status, data_inicio, data_fim, local_id, acao_id } = req.query;
        
        let query = supabase.from('eventos').select(`
            *,
            locais (
                id,
                nome,
                endereco,
                capacidade
            ),
            acoes (
                id,
                nome,
                descricao,
                pilares (
                    id,
                    nome,
                    cor
                )
            ),
            pessoas!responsavel_id (
                id,
                nome,
                telefone,
                email
            )
        `);

        // Aplicar filtros
        if (status) query = query.eq('status', status);
        if (local_id) query = query.eq('local_id', local_id);
        if (acao_id) query = query.eq('acao_id', acao_id);
        
        if (data_inicio) {
            query = query.gte('data_inicio', data_inicio);
        }
        if (data_fim) {
            query = query.lte('data_inicio', data_fim);
        }

        const { data, error, count } = await query
            .order('data_inicio', { ascending: true })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        res.json({
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao listar eventos:', error);
        res.status(500).json({ error: 'Erro ao listar eventos' });
    }
}

// Buscar evento por ID
async function buscarEvento(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('eventos')
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco,
                    capacidade,
                    tipo
                ),
                acoes (
                    id,
                    nome,
                    descricao,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone,
                    email
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).json({ error: 'Erro ao buscar evento' });
    }
}

// Criar novo evento
async function criarEvento(req, res) {
    try {
        const { titulo, descricao, data_inicio, data_fim, local_id, acao_id, responsavel_id } = req.body;

        // Validações
        if (!titulo || !data_inicio) {
            return res.status(400).json({ 
                error: 'Título e data de início são obrigatórios' 
            });
        }

        // Verificar se local existe (se fornecido)
        if (local_id) {
            const { data: local, error: localError } = await supabase
                .from('locais')
                .select('id')
                .eq('id', local_id)
                .eq('ativo', true)
                .single();

            if (localError || !local) {
                return res.status(400).json({ 
                    error: 'Local não encontrado ou inativo' 
                });
            }
        }

        // Verificar se ação existe (se fornecida)
        if (acao_id) {
            const { data: acao, error: acaoError } = await supabase
                .from('acoes')
                .select('id')
                .eq('id', acao_id)
                .eq('ativo', true)
                .single();

            if (acaoError || !acao) {
                return res.status(400).json({ 
                    error: 'Ação não encontrada ou inativa' 
                });
            }
        }

        // Verificar se responsável existe (se fornecido)
        if (responsavel_id) {
            const { data: responsavel, error: responsavelError } = await supabase
                .from('pessoas')
                .select('id')
                .eq('id', responsavel_id)
                .eq('ativo', true)
                .single();

            if (responsavelError || !responsavel) {
                return res.status(400).json({ 
                    error: 'Responsável não encontrado ou inativo' 
                });
            }
        }

        const eventoData = {
            titulo,
            descricao,
            data_inicio,
            data_fim,
            local_id,
            acao_id,
            responsavel_id,
            status: 'Agendado'
        };

        const { data, error } = await dbHelpers.create('eventos', eventoData);

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
}

// Atualizar evento
async function atualizarEvento(req, res) {
    try {
        const { id } = req.params;
        const { titulo, descricao, data_inicio, data_fim, local_id, acao_id, responsavel_id, status } = req.body;

        const updateData = {};
        if (titulo !== undefined) updateData.titulo = titulo;
        if (descricao !== undefined) updateData.descricao = descricao;
        if (data_inicio !== undefined) updateData.data_inicio = data_inicio;
        if (data_fim !== undefined) updateData.data_fim = data_fim;
        if (local_id !== undefined) updateData.local_id = local_id;
        if (acao_id !== undefined) updateData.acao_id = acao_id;
        if (responsavel_id !== undefined) updateData.responsavel_id = responsavel_id;
        if (status !== undefined) updateData.status = status;

        const { data, error } = await dbHelpers.update('eventos', id, updateData);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
}

// Excluir evento
async function excluirEvento(req, res) {
    try {
        const { id } = req.params;
        const { error } = await dbHelpers.delete('eventos', id);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        res.status(500).json({ error: 'Erro ao excluir evento' });
    }
}

// Buscar eventos por data
async function buscarPorData(req, res) {
    try {
        const { data } = req.params;
        const { data: eventos, error } = await supabase
            .from('eventos')
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco
                ),
                acoes (
                    id,
                    nome,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone
                )
            `)
            .gte('data_inicio', `${data} 00:00:00`)
            .lt('data_inicio', `${data} 23:59:59`)
            .order('data_inicio', { ascending: true });

        if (error) throw error;

        res.json(eventos);
    } catch (error) {
        console.error('Erro ao buscar eventos por data:', error);
        res.status(500).json({ error: 'Erro ao buscar eventos por data' });
    }
}

// Buscar eventos por mês
async function buscarPorMes(req, res) {
    try {
        const { ano, mes } = req.params;
        const dataInicio = `${ano}-${mes.padStart(2, '0')}-01`;
        const dataFim = `${ano}-${mes.padStart(2, '0')}-31`;

        const { data: eventos, error } = await supabase
            .from('eventos')
            .select(`
                *,
                locais (
                    id,
                    nome
                ),
                acoes (
                    id,
                    nome,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome
                )
            `)
            .gte('data_inicio', dataInicio)
            .lte('data_inicio', dataFim)
            .order('data_inicio', { ascending: true });

        if (error) throw error;

        res.json(eventos);
    } catch (error) {
        console.error('Erro ao buscar eventos por mês:', error);
        res.status(500).json({ error: 'Erro ao buscar eventos por mês' });
    }
}

// Buscar eventos por semana
async function buscarPorSemana(req, res) {
    try {
        const { data_inicio, data_fim } = req.query;
        
        if (!data_inicio || !data_fim) {
            return res.status(400).json({ 
                error: 'Data de início e fim são obrigatórias' 
            });
        }

        const { data: eventos, error } = await supabase
            .from('eventos')
            .select(`
                *,
                locais (
                    id,
                    nome
                ),
                acoes (
                    id,
                    nome,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome
                )
            `)
            .gte('data_inicio', data_inicio)
            .lte('data_inicio', data_fim)
            .order('data_inicio', { ascending: true });

        if (error) throw error;

        res.json(eventos);
    } catch (error) {
        console.error('Erro ao buscar eventos por semana:', error);
        res.status(500).json({ error: 'Erro ao buscar eventos por semana' });
    }
}

// Estatísticas dos eventos
async function estatisticasEventos(req, res) {
    try {
        const { data: total, error: totalError } = await supabase
            .from('eventos')
            .select('*', { count: 'exact', head: true });

        const { data: agendados, error: agendadosError } = await supabase
            .from('eventos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Agendado');

        const { data: confirmados, error: confirmadosError } = await supabase
            .from('eventos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Confirmado');

        const { data: realizados, error: realizadosError } = await supabase
            .from('eventos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Realizado');

        const { data: cancelados, error: canceladosError } = await supabase
            .from('eventos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Cancelado');

        if (totalError || agendadosError || confirmadosError || realizadosError || canceladosError) {
            throw new Error('Erro ao buscar estatísticas');
        }

        res.json({
            total: total?.length || 0,
            agendados: agendados?.length || 0,
            confirmados: confirmados?.length || 0,
            realizados: realizados?.length || 0,
            cancelados: cancelados?.length || 0
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
}

module.exports = {
    listarEventos,
    buscarEvento,
    criarEvento,
    atualizarEvento,
    excluirEvento,
    buscarPorData,
    buscarPorMes,
    buscarPorSemana,
    estatisticasEventos
};
