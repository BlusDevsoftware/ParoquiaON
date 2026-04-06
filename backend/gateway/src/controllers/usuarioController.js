const supabase = require('../config/supabase');

// Listar todos os usuários
async function listarUsuarios(req, res) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('codigo', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
}

// Buscar usuário por código
async function buscarUsuario(req, res) {
    try {
        const { codigo } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('codigo', codigo)
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
        const { nome, email, senha, nivel } = req.body;

        // Gerar código sequencial
        const { data: ultimoUsuario } = await supabase
            .from('usuarios')
            .select('codigo')
            .order('codigo', { ascending: false })
            .limit(1);

        const ultimoCodigo = ultimoUsuario?.[0]?.codigo || '00000';
        const novoCodigo = String(parseInt(ultimoCodigo) + 1).padStart(5, '0');

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                {
                    codigo: novoCodigo,
                    nome,
                    email,
                    senha, // TODO: Implementar hash da senha
                    nivel,
                    status: 'ativo'
                }
            ])
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
        const { codigo } = req.params;
        const { nome, email, senha, nivel, status } = req.body;

        const { data, error } = await supabase
            .from('usuarios')
            .update({
                nome,
                email,
                senha, // TODO: Implementar hash da senha
                nivel,
                status
            })
            .eq('codigo', codigo)
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
        const { codigo } = req.params;

        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('codigo', codigo);

        if (error) throw error;

        res.status(204).send();
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