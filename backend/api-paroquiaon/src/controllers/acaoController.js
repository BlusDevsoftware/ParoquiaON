const { supabase } = require('../config/supabase');

async function listarAcoes(req, res) {
    try {
        const { data, error } = await supabase.from('acoes').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar ações:', error);
        res.status(500).json({ error: 'Erro ao listar ações' });
    }
}

async function buscarAcao(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('acoes').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Ação não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar ação:', error);
        res.status(500).json({ error: 'Erro ao buscar ação' });
    }
}

async function criarAcao(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase.from('acoes').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar ação:', error);
        res.status(500).json({ error: 'Erro ao criar ação' });
    }
}

async function atualizarAcao(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('acoes').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Ação não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar ação:', error);
        res.status(500).json({ error: 'Erro ao atualizar ação' });
    }
}

async function excluirAcao(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('acoes').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Ação não encontrada' });
        res.json({ message: 'Ação excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir ação:', error);
        res.status(500).json({ error: 'Erro ao excluir ação' });
    }
}

module.exports = { listarAcoes, buscarAcao, criarAcao, atualizarAcao, excluirAcao };
