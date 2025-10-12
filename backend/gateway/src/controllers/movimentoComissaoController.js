const supabase = require('../config/supabase');

// Listar todos os movimentos de comissão
const listarMovimentos = async (req, res) => {
    try {
        // Verificar se o usuário tem permissão para ver todos os títulos
        const user = req.user; // Assumindo que o middleware de auth já populou req.user
        const podeVerTodosTitulos = user?.permissoes?.comissoes_visualizar_todos_titulos === true;
        
        let query = supabase
            .from('movimento_comissoes')
            .select('*');
        
        // Se não pode ver todos os títulos, filtrar apenas os seus
        if (!podeVerTodosTitulos && user?.codigo) {
            query = query.eq('colaborador_id', user.codigo);
        }
        
        const { data, error } = await query.order('id', { ascending: true });
        
        if (error) throw error;
        
        console.log(`📊 Movimentos retornados: ${data?.length || 0} (usuário: ${user?.email}, podeVerTodos: ${podeVerTodosTitulos})`);
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar movimentos:', error);
        res.status(500).json({ error: 'Erro ao listar movimentos' });
    }
};

// Buscar movimento por ID
const buscarMovimento = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('movimento_comissoes')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Movimento não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar movimento:', error);
        res.status(500).json({ error: 'Erro ao buscar movimento' });
    }
};

// Criar novo movimento
const criarMovimento = async (req, res) => {
    try {
        const movimentos = Array.isArray(req.body) ? req.body : [req.body];
        
        // Buscar o maior número sequencial global já utilizado UMA ÚNICA VEZ
        let ultimoNumero = 0;
        try {
            const { data: todos, error: errorTodos } = await supabase
                .from('movimento_comissoes')
                .select('numero_titulo');
            if (errorTodos) throw errorTodos;
            if (todos && todos.length > 0) {
                const bases = todos
                    .map(t => {
                        // Para títulos parciais, extrair o número após PAR-
                        if (t.numero_titulo && t.numero_titulo.startsWith('PAR-')) {
                            const match = t.numero_titulo.match(/^PAR-(\d{5,})/);
                            return match ? parseInt(match[1], 10) : null;
                        }
                        // Para títulos normais, extrair o número base
                        const match = (t.numero_titulo || '').match(/^(\d{5,})/);
                        return match ? parseInt(match[1], 10) : null;
                    })
                    .filter(n => n !== null && n > 0);
                if (bases.length > 0) {
                    ultimoNumero = Math.max(...bases);
                }
            }
        } catch (e) {
            ultimoNumero = 0;
        }
        
        // Montar os registros para todos os colaboradores, incrementando o número para cada colaborador
        const registros = [];
        for (let i = 0; i < movimentos.length; i++) {
            const mov = movimentos[i];
            const qtd_parcelas = mov.qtd_parcelas ? parseInt(mov.qtd_parcelas) : 1;
            const proximoNumero = ultimoNumero + 1; // incrementa a partir do maior encontrado
            const numeroBaseStr = proximoNumero.toString().padStart(5, '0');
            
            for (let parcela = 1; parcela <= qtd_parcelas; parcela++) {
                let numeroTitulo = numeroBaseStr;
                if (qtd_parcelas > 1) {
                    numeroTitulo += `-${parcela}/${qtd_parcelas}`;
                }
                
                // Se for título parcial, prefixe com PAR- e use número sequencial único
                if (mov.id_titulo_origem) {
                    numeroTitulo = `PAR-${numeroTitulo}`;
                }
                
                registros.push({
                    ...mov,
                    numero_titulo: numeroTitulo
                });
            }
            ultimoNumero++; // incrementa para o próximo colaborador
        }
        
        // Inserir todos os registros de uma vez
        const { data, error } = await supabase
            .from('movimento_comissoes')
            .insert(registros)
            .select();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar movimento:', error);
        res.status(500).json({ error: 'Erro ao criar movimento' });
    }
};

// Atualizar movimento
const atualizarMovimento = async (req, res) => {
    try {
        const { id } = req.params;
        const atualizacao = req.body;
        const { data, error } = await supabase
            .from('movimento_comissoes')
            .update(atualizacao)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Movimento não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar movimento:', error);
        res.status(500).json({ error: 'Erro ao atualizar movimento' });
    }
};

// Excluir movimento
const excluirMovimento = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('movimento_comissoes')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir movimento:', error);
        res.status(500).json({ error: 'Erro ao excluir movimento' });
    }
};

// Simular próximo número base para um colaborador
const simularProximoNumeroBase = async (req, res) => {
    try {
        const { colaborador_id } = req.query;
        console.log('Simulação para colaborador:', colaborador_id);
        if (!colaborador_id) {
            return res.status(400).json({ error: 'colaborador_id é obrigatório' });
        }
        // Busca todos os títulos do colaborador
        const { data, error } = await supabase
            .from('movimento_comissoes')
            .select('numero_titulo, colaborador_id')
            .eq('colaborador_id', colaborador_id);
        console.log('Títulos encontrados:', data);
        if (error) throw error;
        let usados = (data || [])
            .map(t => {
                const match = (t.numero_titulo || '').match(/^(\d{5})/);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(n => n !== null && n > 0);
        let proximoNumeroBase = 1;
        if (usados.length > 0) {
            usados.sort((a, b) => a - b);
            // Procurar o menor número não usado
            for (let i = 1; i <= usados[usados.length - 1] + 1; i++) {
                if (!usados.includes(i)) {
                    proximoNumeroBase = i;
                    break;
                }
            }
        }
        return res.json({ proximo_numero_base: proximoNumeroBase.toString().padStart(5, '0') });
    } catch (error) {
        console.error('Erro ao simular próximo número base:', error);
        res.status(500).json({ error: 'Erro ao simular próximo número base' });
    }
};

// Buscar produtos de um título
const buscarProdutosTitulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: titulo, error: errorTitulo } = await supabase
            .from('movimento_comissoes')
            .select('item_id')
            .eq('id', id)
            .single();
        
        if (errorTitulo) throw errorTitulo;
        if (!titulo) return res.status(404).json({ error: 'Título não encontrado' });
        
        if (!titulo.item_id) {
            return res.json([]);
        }
        
        const produtos = [];
        const itemIds = titulo.item_id.split(',');
        
        for (const itemId of itemIds) {
            const [id, descricao] = itemId.trim().split('-');
            if (id && descricao) {
                produtos.push({
                    id: id.trim(),
                    descricao: descricao.trim()
                });
            }
        }
        
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos do título:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos do título' });
    }
};

// Upload de comprovante de pagamento
const uploadComprovante = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar se o título existe
        const { data: titulo, error: errorTitulo } = await supabase
            .from('movimento_comissoes')
            .select('*')
            .eq('id', id)
            .single();
        
        if (errorTitulo) throw errorTitulo;
        if (!titulo) return res.status(404).json({ error: 'Título não encontrado' });
        
        // Aqui você pode implementar a lógica para salvar o arquivo
        // Por exemplo, salvar no Supabase Storage ou em um diretório local
        // Por enquanto, vamos apenas retornar sucesso
        
        // Atualizar o título com a informação do comprovante
        const { data, error } = await supabase
            .from('movimento_comissoes')
            .update({
                comprovante_anexado: true,
                data_comprovante: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ 
            message: 'Comprovante anexado com sucesso',
            data: data
        });
    } catch (error) {
        console.error('Erro ao anexar comprovante:', error);
        res.status(500).json({ error: 'Erro ao anexar comprovante' });
    }
};

// Listar todos os movimentos de comissão (sem filtro por colaborador - para Dashboard)
const listarMovimentosTodos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('movimento_comissoes')
            .select('*')
            .order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar todos os movimentos:', error);
        res.status(500).json({ error: 'Erro ao listar todos os movimentos' });
    }
};

module.exports = {
    listarMovimentos,
    listarMovimentosTodos,
    buscarMovimento,
    criarMovimento,
    atualizarMovimento,
    excluirMovimento,
    simularProximoNumeroBase,
    buscarProdutosTitulo,
    uploadComprovante
}; 