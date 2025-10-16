const { supabase } = require('../config/supabase');

async function listarPilares(req, res) {
    try {
        const { data, error } = await supabase.from('pilares').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar pilares:', error);
        res.status(500).json({ error: 'Erro ao listar pilares' });
    }
}

async function buscarPilar(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pilares').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pilar não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pilar:', error);
        res.status(500).json({ error: 'Erro ao buscar pilar' });
    }
}

async function criarPilar(req, res) {
    try {
        const body = req.body || {};
        // Normalizar status (texto): 'ativo' | 'inativo' (default: 'ativo')
        const normalizedStatus = typeof body.status === 'string'
            ? String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo'
            : 'ativo';

        // Montar somente campos existentes na tabela (sem coluna ativo)
        const insertData = {
            nome: body.nome,
            descricao: body.descricao ?? null,
            cor: body.cor ?? '#1976d2',
            status: normalizedStatus,
            // Colunas de autoria (adicionadas por migração recente)
            usuario_id: body.usuario_id ?? null,
            criado_por_email: body.criado_por_email ?? null,
            criado_por_nome: body.criado_por_nome ?? null
        };

        const { data, error } = await supabase
            .from('pilares')
            .insert([insertData])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pilar:', error);
        res.status(500).json({ error: 'Erro ao criar pilar', details: error?.message });
    }
}

async function atualizarPilar(req, res) {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo'
            : undefined;

        // Somente campos conhecidos (sem coluna ativo)
        const updateData = {
            ...(body.nome !== undefined ? { nome: body.nome } : {}),
            ...(body.descricao !== undefined ? { descricao: body.descricao } : {}),
            ...(body.cor !== undefined ? { cor: body.cor } : {}),
            ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
            ...(body.usuario_id !== undefined ? { usuario_id: body.usuario_id } : {}),
            ...(body.criado_por_email !== undefined ? { criado_por_email: body.criado_por_email } : {}),
            ...(body.criado_por_nome !== undefined ? { criado_por_nome: body.criado_por_nome } : {})
        };

        const { data, error } = await supabase
            .from('pilares')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pilar não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pilar:', error);
        res.status(500).json({ error: 'Erro ao atualizar pilar', details: error?.message });
    }
}

async function excluirPilar(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pilares').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Pilar não encontrado' });
        res.json({ message: 'Pilar excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir pilar:', error);
        res.status(500).json({ error: 'Erro ao excluir pilar' });
    }
}

module.exports = { listarPilares, buscarPilar, criarPilar, atualizarPilar, excluirPilar };
