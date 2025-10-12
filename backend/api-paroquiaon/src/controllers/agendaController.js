const { supabase } = require('../config/supabase');

async function listarEventos(req, res) {
    try {
        const { data, error } = await supabase.from('eventos').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar eventos:', error);
        res.status(500).json({ error: 'Erro ao listar eventos' });
    }
}

async function buscarEvento(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('eventos').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Evento não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).json({ error: 'Erro ao buscar evento' });
    }
}

async function criarEvento(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase.from('eventos').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
}

async function atualizarEvento(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('eventos').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Evento não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
}

async function excluirEvento(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('eventos').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Evento não encontrado' });
        res.json({ message: 'Evento excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        res.status(500).json({ error: 'Erro ao excluir evento' });
    }
}

module.exports = { listarEventos, buscarEvento, criarEvento, atualizarEvento, excluirEvento };
