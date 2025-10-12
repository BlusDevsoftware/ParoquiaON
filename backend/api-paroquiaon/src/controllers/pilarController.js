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
        const dados = req.body;
        const { data, error } = await supabase.from('pilares').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pilar:', error);
        res.status(500).json({ error: 'Erro ao criar pilar' });
    }
}

async function atualizarPilar(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('pilares').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pilar não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pilar:', error);
        res.status(500).json({ error: 'Erro ao atualizar pilar' });
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
