const { supabase } = require('../config/supabase');

async function listarPastorais(req, res) {
    try {
        const { data, error } = await supabase.from('pastorais').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar pastorais:', error);
        res.status(500).json({ error: 'Erro ao listar pastorais' });
    }
}

async function buscarPastoral(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pastorais').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pastoral não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pastoral:', error);
        res.status(500).json({ error: 'Erro ao buscar pastoral' });
    }
}

async function criarPastoral(req, res) {
    try {
        const dados = req.body;
        console.log('Dados recebidos para criar pastoral:', dados);
        const { data, error } = await supabase.from('pastorais').insert([dados]).select().single();
        if (error) {
            console.error('Erro do Supabase:', error);
            throw error;
        }
        console.log('Pastoral criada com sucesso:', data);
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pastoral:', error);
        res.status(500).json({ error: 'Erro ao criar pastoral', details: error.message });
    }
}

async function atualizarPastoral(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('pastorais').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pastoral não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pastoral:', error);
        res.status(500).json({ error: 'Erro ao atualizar pastoral' });
    }
}

async function excluirPastoral(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pastorais').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Pastoral não encontrada' });
        res.json({ message: 'Pastoral excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir pastoral:', error);
        res.status(500).json({ error: 'Erro ao excluir pastoral' });
    }
}

module.exports = { listarPastorais, buscarPastoral, criarPastoral, atualizarPastoral, excluirPastoral };
