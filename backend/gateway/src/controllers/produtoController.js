const supabase = require('../config/supabase');

// Listar todos os produtos
const listarProdutos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('codigo', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ error: 'Erro ao listar produtos' });
    }
};

// Buscar produto por código
const buscarProduto = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('codigo', codigo)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
};

// Criar novo produto
const criarProduto = async (req, res) => {
    try {
        const { nome, categoria, preco, estoque, estoque_minimo, fornecedor, status } = req.body;

        const { data, error } = await supabase
            .from('produtos')
            .insert([
                {
                    nome,
                    categoria,
                    preco,
                    estoque,
                    estoque_minimo,
                    fornecedor,
                    status
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
};

// Atualizar produto
const atualizarProduto = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { nome, categoria, preco, estoque, estoque_minimo, fornecedor, status } = req.body;

        const { data, error } = await supabase
            .from('produtos')
            .update({
                nome,
                categoria,
                preco,
                estoque,
                estoque_minimo,
                fornecedor,
                status
            })
            .eq('codigo', codigo)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
};

// Excluir produto (sem validação de vínculos no backend)
const excluirProduto = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('codigo', codigo);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro ao excluir produto' });
    }
};

module.exports = {
    listarProdutos,
    buscarProduto,
    criarProduto,
    atualizarProduto,
    excluirProduto
}; 