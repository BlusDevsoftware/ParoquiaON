const supabase = require('../config/supabase');

async function listarPessoas(req, res) {
    try {
        const { data, error } = await supabase.from('pessoas').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar pessoas:', error);
        res.status(500).json({ error: 'Erro ao listar pessoas' });
    }
}

async function buscarPessoa(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pessoas').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pessoa:', error);
        res.status(500).json({ error: 'Erro ao buscar pessoa' });
    }
}

async function criarPessoa(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase.from('pessoas').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pessoa:', error);
        res.status(500).json({ error: 'Erro ao criar pessoa' });
    }
}

async function atualizarPessoa(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('pessoas').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ error: 'Erro ao atualizar pessoa' });
    }
}

async function excluirPessoa(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pessoas').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json({ message: 'Pessoa excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir pessoa:', error);
        res.status(500).json({ error: 'Erro ao excluir pessoa' });
    }
}

module.exports = { listarPessoas, buscarPessoa, criarPessoa, atualizarPessoa, excluirPessoa };
