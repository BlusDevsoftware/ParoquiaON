const supabase = require('../config/supabase');

async function listarRelatorios(req, res) {
    try {
        const { data, error } = await supabase.from('relatorios').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar relatórios:', error);
        res.status(500).json({ error: 'Erro ao listar relatórios' });
    }
}

async function buscarRelatorio(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('relatorios').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Relatório não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
}

async function criarRelatorio(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase.from('relatorios').insert([dados]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar relatório:', error);
        res.status(500).json({ error: 'Erro ao criar relatório' });
    }
}

async function atualizarRelatorio(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('relatorios').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Relatório não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar relatório:', error);
        res.status(500).json({ error: 'Erro ao atualizar relatório' });
    }
}

async function excluirRelatorio(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('relatorios').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Relatório não encontrado' });
        res.json({ message: 'Relatório excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir relatório:', error);
        res.status(500).json({ error: 'Erro ao excluir relatório' });
    }
}

module.exports = { listarRelatorios, buscarRelatorio, criarRelatorio, atualizarRelatorio, excluirRelatorio };
