const supabase = require('../config/supabase');

// Listar todos os clientes
const listarClientes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('codigo', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({ error: 'Erro ao listar clientes' });
    }
};

// Buscar cliente por código
const buscarCliente = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('codigo', codigo)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
};

// Criar novo cliente
const criarCliente = async (req, res) => {
    try {
        const { 
            nome, 
            tipo, 
            email, 
            telefone, 
            status, 
            codigo_crm, 
            documento, 
            responsavel, 
            contato, 
            observacao 
        } = req.body;

        const { data, error } = await supabase
            .from('clientes')
            .insert([
                {
                    nome,
                    tipo,
                    email,
                    telefone,
                    status,
                    codigo_crm,
                    documento,
                    responsavel,
                    contato,
                    observacao
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
};

// Atualizar cliente
const atualizarCliente = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { 
            nome, 
            tipo, 
            email, 
            telefone, 
            status, 
            codigo_crm, 
            documento, 
            responsavel, 
            contato, 
            observacao 
        } = req.body;

        const { data, error } = await supabase
            .from('clientes')
            .update({
                nome,
                tipo,
                email,
                telefone,
                status,
                codigo_crm,
                documento,
                responsavel,
                contato,
                observacao
            })
            .eq('codigo', codigo)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
};

// Excluir cliente
const excluirCliente = async (req, res) => {
    try {
        const { codigo } = req.params;

        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('codigo', codigo);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro ao excluir cliente' });
    }
};

module.exports = {
    listarClientes,
    buscarCliente,
    criarCliente,
    atualizarCliente,
    excluirCliente
}; 