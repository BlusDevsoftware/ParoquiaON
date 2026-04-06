const { supabase, dbHelpers } = require('../config/supabase');

// Listar todas as pastorais
async function listarPastorais(req, res) {
    try {
        const { page = 1, limit = 10, ativo, comunidade_id } = req.query;
        
        let filters = {};
        if (ativo !== undefined) filters.ativo = ativo === 'true';
        if (comunidade_id) filters.comunidade_id = comunidade_id;
        
        const { data, error, count, totalPages } = await dbHelpers.paginate(
            'pastorais', 
            parseInt(page), 
            parseInt(limit), 
            filters
        );

        if (error) throw error;

        // Buscar dados relacionados
        const pastoraisComRelacoes = await Promise.all(
            data.map(async (pastoral) => {
                const relacionamentos = {};
                
                if (pastoral.responsavel_id) {
                    const { data: responsavel } = await supabase
                        .from('pessoas')
                        .select('id, nome, telefone')
                        .eq('id', pastoral.responsavel_id)
                        .single();
                    relacionamentos.responsavel = responsavel;
                }
                
                if (pastoral.comunidade_id) {
                    const { data: comunidade } = await supabase
                        .from('comunidades')
                        .select('id, nome, codigo')
                        .eq('id', pastoral.comunidade_id)
                        .single();
                    relacionamentos.comunidade = comunidade;
                }
                
                return { ...pastoral, ...relacionamentos };
            })
        );

        res.json({
            data: pastoraisComRelacoes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: totalPages
            }
        });
    } catch (error) {
        console.error('Erro ao listar pastorais:', error);
        res.status(500).json({ error: 'Erro ao listar pastorais' });
    }
}

// Buscar pastoral por ID
async function buscarPastoral(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await dbHelpers.findById('pastorais', id);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Pastoral não encontrada' });
        }

        // Buscar dados relacionados
        const relacionamentos = {};
        
        if (data.responsavel_id) {
            const { data: responsavel } = await supabase
                .from('pessoas')
                .select('id, nome, telefone, email')
                .eq('id', data.responsavel_id)
                .single();
            relacionamentos.responsavel = responsavel;
        }
        
        if (data.comunidade_id) {
            const { data: comunidade } = await supabase
                .from('comunidades')
                .select('id, nome, codigo, telefone, endereco')
                .eq('id', data.comunidade_id)
                .single();
            relacionamentos.comunidade = comunidade;
        }

        res.json({ ...data, ...relacionamentos });
    } catch (error) {
        console.error('Erro ao buscar pastoral:', error);
        res.status(500).json({ error: 'Erro ao buscar pastoral' });
    }
}

// Criar nova pastoral
async function criarPastoral(req, res) {
    try {
        const { nome, descricao, responsavel_id, comunidade_id } = req.body;

        // Validações
        if (!nome) {
            return res.status(400).json({ 
                error: 'Nome é obrigatório' 
            });
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

        // Verificar se comunidade existe (se fornecida)
        if (comunidade_id) {
            const { data: comunidade, error: comunidadeError } = await supabase
                .from('comunidades')
                .select('id')
                .eq('id', comunidade_id)
                .eq('status', 'Ativo')
                .single();

            if (comunidadeError || !comunidade) {
                return res.status(400).json({ 
                    error: 'Comunidade não encontrada ou inativa' 
                });
            }
        }

        const pastoralData = {
            nome,
            descricao,
            responsavel_id,
            comunidade_id,
            ativo: true
        };

        const { data, error } = await dbHelpers.create('pastorais', pastoralData);

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pastoral:', error);
        res.status(500).json({ error: 'Erro ao criar pastoral' });
    }
}

// Atualizar pastoral
async function atualizarPastoral(req, res) {
    try {
        const { id } = req.params;
        const { nome, descricao, responsavel_id, comunidade_id, ativo } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (descricao !== undefined) updateData.descricao = descricao;
        if (responsavel_id !== undefined) updateData.responsavel_id = responsavel_id;
        if (comunidade_id !== undefined) updateData.comunidade_id = comunidade_id;
        if (ativo !== undefined) updateData.ativo = ativo;

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

        // Verificar se comunidade existe (se fornecida)
        if (comunidade_id) {
            const { data: comunidade, error: comunidadeError } = await supabase
                .from('comunidades')
                .select('id')
                .eq('id', comunidade_id)
                .eq('status', 'Ativo')
                .single();

            if (comunidadeError || !comunidade) {
                return res.status(400).json({ 
                    error: 'Comunidade não encontrada ou inativa' 
                });
            }
        }

        const { data, error } = await dbHelpers.update('pastorais', id, updateData);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Pastoral não encontrada' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pastoral:', error);
        res.status(500).json({ error: 'Erro ao atualizar pastoral' });
    }
}

// Excluir pastoral
async function excluirPastoral(req, res) {
    try {
        const { id } = req.params;
        const { error } = await dbHelpers.delete('pastorais', id);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir pastoral:', error);
        res.status(500).json({ error: 'Erro ao excluir pastoral' });
    }
}

// Buscar pastorais por comunidade
async function buscarPorComunidade(req, res) {
    try {
        const { comunidade_id } = req.params;
        const { data, error } = await supabase
            .from('pastorais')
            .select(`
                *,
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone
                )
            `)
            .eq('comunidade_id', comunidade_id)
            .eq('ativo', true)
            .order('nome', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pastorais por comunidade:', error);
        res.status(500).json({ error: 'Erro ao buscar pastorais por comunidade' });
    }
}

// Estatísticas das pastorais
async function estatisticasPastorais(req, res) {
    try {
        const { data: total, error: totalError } = await supabase
            .from('pastorais')
            .select('*', { count: 'exact', head: true });

        const { data: ativas, error: ativasError } = await supabase
            .from('pastorais')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', true);

        const { data: inativas, error: inativasError } = await supabase
            .from('pastorais')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', false);

        if (totalError || ativasError || inativasError) {
            throw new Error('Erro ao buscar estatísticas');
        }

        res.json({
            total: total?.length || 0,
            ativas: ativas?.length || 0,
            inativas: inativas?.length || 0
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
}

module.exports = {
    listarPastorais,
    buscarPastoral,
    criarPastoral,
    atualizarPastoral,
    excluirPastoral,
    buscarPorComunidade,
    estatisticasPastorais
};
