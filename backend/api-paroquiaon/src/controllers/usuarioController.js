const supabase = require('../config/supabase');

// Listar todos os usuários
async function listarUsuarios(req, res) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
}

// Buscar usuário por ID
async function buscarUsuario(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
}

// Criar novo usuário
async function criarUsuario(req, res) {
    try {
        const dados = req.body;
        const { data, error } = await supabase
            .from('usuarios')
            .insert([dados])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
}

// Atualizar usuário
async function atualizarUsuario(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase
            .from('usuarios')
            .update(dados)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
}

// Excluir usuário
async function excluirUsuario(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
}

module.exports = {
    listarUsuarios,
    buscarUsuario,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario
};
