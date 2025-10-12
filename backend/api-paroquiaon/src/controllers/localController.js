const { supabase } = require('../config/supabase');

async function listarLocais(req, res) {
    try {
        const { data, error } = await supabase.from('locais').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar locais:', error);
        res.status(500).json({ error: 'Erro ao listar locais' });
    }
}

async function buscarLocal(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('locais').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Local não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar local:', error);
        res.status(500).json({ error: 'Erro ao buscar local' });
    }
}

async function criarLocal(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase.from('locais').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar local:', error);
        res.status(500).json({ error: 'Erro ao criar local' });
    }
}

async function atualizarLocal(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('locais').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Local não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar local:', error);
        res.status(500).json({ error: 'Erro ao atualizar local' });
    }
}

async function excluirLocal(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('locais').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Local não encontrado' });
        res.json({ message: 'Local excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir local:', error);
        res.status(500).json({ error: 'Erro ao excluir local' });
    }
}

module.exports = { listarLocais, buscarLocal, criarLocal, atualizarLocal, excluirLocal };
