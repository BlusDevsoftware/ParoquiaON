const { supabase, dbHelpers } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Listar todas as comunidades
async function listarComunidades(req, res) {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        let filters = {};
        if (status) filters.status = status;
        
        const { data, error, count, totalPages } = await dbHelpers.paginate(
            'comunidades', 
            parseInt(page), 
            parseInt(limit), 
            filters
        );

        if (error) throw error;

        // Busca por texto se especificada
        let filteredData = data;
        if (search) {
            filteredData = data.filter(comunidade => 
                comunidade.nome.toLowerCase().includes(search.toLowerCase()) ||
                comunidade.codigo.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json({
            data: filteredData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: totalPages
            }
        });
    } catch (error) {
        console.error('Erro ao listar comunidades:', error);
        res.status(500).json({ error: 'Erro ao listar comunidades' });
    }
}

// Buscar comunidade por ID
async function buscarComunidade(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await dbHelpers.findById('comunidades', id);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Comunidade não encontrada' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar comunidade:', error);
        res.status(500).json({ error: 'Erro ao buscar comunidade' });
    }
}

// Criar nova comunidade
async function criarComunidade(req, res) {
    try {
        const { nome, telefone, endereco, data_fundacao, foto, conselho_membros, responsaveis } = req.body;

        // Validações
        if (!nome || !data_fundacao) {
            return res.status(400).json({ 
                error: 'Nome e data de fundação são obrigatórios' 
            });
        }

        // Gerar código único
        const { data: ultimaComunidade } = await supabase
            .from('comunidades')
            .select('codigo')
            .order('codigo', { ascending: false })
            .limit(1);

        const ultimoCodigo = ultimaComunidade?.[0]?.codigo || '00000';
        const novoCodigo = String(parseInt(ultimoCodigo) + 1).padStart(5, '0');

        const comunidadeData = {
            codigo: novoCodigo,
            nome,
            telefone,
            endereco,
            data_fundacao,
            foto,
            conselho_membros: conselho_membros || [],
            responsaveis: responsaveis || [],
            status: 'Ativo'
        };

        const { data, error } = await dbHelpers.create('comunidades', comunidadeData);

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar comunidade:', error);
        res.status(500).json({ error: 'Erro ao criar comunidade' });
    }
}

// Atualizar comunidade
async function atualizarComunidade(req, res) {
    try {
        const { id } = req.params;
        const { nome, telefone, endereco, data_fundacao, foto, conselho_membros, responsaveis, status } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (telefone !== undefined) updateData.telefone = telefone;
        if (endereco !== undefined) updateData.endereco = endereco;
        if (data_fundacao !== undefined) updateData.data_fundacao = data_fundacao;
        if (foto !== undefined) updateData.foto = foto;
        if (conselho_membros !== undefined) updateData.conselho_membros = conselho_membros;
        if (responsaveis !== undefined) updateData.responsaveis = responsaveis;
        if (status !== undefined) updateData.status = status;

        const { data, error } = await dbHelpers.update('comunidades', id, updateData);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Comunidade não encontrada' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar comunidade:', error);
        res.status(500).json({ error: 'Erro ao atualizar comunidade' });
    }
}

// Excluir comunidade
async function excluirComunidade(req, res) {
    try {
        const { id } = req.params;
        const { error } = await dbHelpers.delete('comunidades', id);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir comunidade:', error);
        res.status(500).json({ error: 'Erro ao excluir comunidade' });
    }
}

// Buscar comunidades por status
async function buscarPorStatus(req, res) {
    try {
        const { status } = req.params;
        const { data, error } = await supabase
            .from('comunidades')
            .select('*')
            .eq('status', status)
            .order('nome', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar comunidades por status:', error);
        res.status(500).json({ error: 'Erro ao buscar comunidades por status' });
    }
}

// Estatísticas das comunidades
async function estatisticasComunidades(req, res) {
    try {
        const { data: total, error: totalError } = await supabase
            .from('comunidades')
            .select('*', { count: 'exact', head: true });

        const { data: ativas, error: ativasError } = await supabase
            .from('comunidades')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Ativo');

        const { data: inativas, error: inativasError } = await supabase
            .from('comunidades')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Inativo');

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
    listarComunidades,
    buscarComunidade,
    criarComunidade,
    atualizarComunidade,
    excluirComunidade,
    buscarPorStatus,
    estatisticasComunidades
};
