const { supabase } = require('../config/supabase');

async function listarComunidades(req, res) {
    try {
        const { data, error } = await supabase.from('comunidades').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar comunidades:', error);
        res.status(500).json({ error: 'Erro ao listar comunidades' });
    }
}

async function buscarComunidade(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('comunidades').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Comunidade não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar comunidade:', error);
        res.status(500).json({ error: 'Erro ao buscar comunidade' });
    }
}

async function criarComunidade(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase.from('comunidades').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar comunidade:', error);
        res.status(500).json({ error: 'Erro ao criar comunidade' });
    }
}

async function atualizarComunidade(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('comunidades').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Comunidade não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar comunidade:', error);
        res.status(500).json({ error: 'Erro ao atualizar comunidade' });
    }
}

async function excluirComunidade(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('comunidades').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Comunidade não encontrada' });
        res.json({ message: 'Comunidade excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir comunidade:', error);
        res.status(500).json({ error: 'Erro ao excluir comunidade' });
    }
}

module.exports = { listarComunidades, buscarComunidade, criarComunidade, atualizarComunidade, excluirComunidade };
