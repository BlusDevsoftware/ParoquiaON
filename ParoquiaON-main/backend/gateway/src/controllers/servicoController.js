const supabase = require('../config/supabase');

// Listar todos os serviços
const listarServicos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('servicos')
            .select('*')
            .order('codigo', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({ error: 'Erro ao listar serviços' });
    }
};

// Buscar serviço por código
const buscarServico = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { data, error } = await supabase
            .from('servicos')
            .select('*')
            .eq('codigo', codigo)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        res.status(500).json({ error: 'Erro ao buscar serviço' });
    }
};

// Criar novo serviço
const criarServico = async (req, res) => {
    try {
        const { nome, categoria, preco, descricao, status } = req.body;

        const { data, error } = await supabase
            .from('servicos')
            .insert([
                {
                    nome,
                    categoria,
                    preco,
                    descricao,
                    status
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ error: 'Erro ao criar serviço' });
    }
};

// Atualizar serviço
const atualizarServico = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { nome, categoria, preco, descricao, status } = req.body;

        const { data, error } = await supabase
            .from('servicos')
            .update({
                nome,
                categoria,
                preco,
                descricao,
                status
            })
            .eq('codigo', codigo)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
};

// Excluir serviço
const excluirServico = async (req, res) => {
    try {
        const { codigo } = req.params;

        const { error } = await supabase
            .from('servicos')
            .delete()
            .eq('codigo', codigo);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        res.status(500).json({ error: 'Erro ao excluir serviço' });
    }
};

module.exports = {
    listarServicos,
    buscarServico,
    criarServico,
    atualizarServico,
    excluirServico
}; 