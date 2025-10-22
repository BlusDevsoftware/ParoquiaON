const { supabase } = require('../config/supabase');

async function listarEventos(req, res) {
    try {
        const { data, error } = await supabase
            .from('agendamentos')
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco,
                    capacidade
                ),
                acoes (
                    id,
                    nome,
                    descricao,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone,
                    email
                ),
                comunidades (
                    id,
                    nome
                ),
                pastorais (
                    id,
                    nome
                ),
                pilares (
                    id,
                    nome,
                    cor
                ),
                usuarios!usuario_lancamento_id (
                    id,
                    nome,
                    email
                )
            `)
            .order('data_inicio', { ascending: true });
            
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
}

async function buscarEvento(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('agendamentos')
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco,
                    capacidade
                ),
                acoes (
                    id,
                    nome,
                    descricao,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone,
                    email
                ),
                comunidades (
                    id,
                    nome
                ),
                pastorais (
                    id,
                    nome
                ),
                pilares (
                    id,
                    nome,
                    cor
                ),
                usuarios!usuario_lancamento_id (
                    id,
                    nome,
                    email
                )
            `)
            .eq('id', id)
            .single();
            
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Agendamento não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
}

async function criarEvento(req, res) {
    try {
        const dados = req.body;
        
        // Validação básica
        if (!dados.titulo || !dados.data_inicio) {
            return res.status(400).json({ error: 'Título e data de início são obrigatórios' });
        }
        
        // Adicionar dados do usuário de lançamento
        const dadosCompletos = {
            ...dados,
            usuario_lancamento_id: req.user?.id || null,
            usuario_lancamento_nome: req.user?.nome || 'Sistema',
            status: dados.status || 'Ativo'
        };
        
        // Inserir agendamento
        const { data, error } = await supabase
            .from('agendamentos')
            .insert([dadosCompletos])
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco,
                    capacidade
                ),
                acoes (
                    id,
                    nome,
                    descricao,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone,
                    email
                ),
                comunidades (
                    id,
                    nome
                ),
                pastorais (
                    id,
                    nome
                ),
                pilares (
                    id,
                    nome,
                    cor
                ),
                usuarios!usuario_lancamento_id (
                    id,
                    nome,
                    email
                )
            `)
            .single();
            
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
}

async function atualizarEvento(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        
        // Atualizar agendamento
        const { data, error } = await supabase
            .from('agendamentos')
            .update(dados)
            .eq('id', id)
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco,
                    capacidade
                ),
                acoes (
                    id,
                    nome,
                    descricao,
                    pilares (
                        id,
                        nome,
                        cor
                    )
                ),
                pessoas!responsavel_id (
                    id,
                    nome,
                    telefone,
                    email
                ),
                comunidades (
                    id,
                    nome
                ),
                pastorais (
                    id,
                    nome
                ),
                pilares (
                    id,
                    nome,
                    cor
                ),
                usuarios!usuario_lancamento_id (
                    id,
                    nome,
                    email
                )
            `)
            .single();
            
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Agendamento não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
}

async function excluirEvento(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('agendamentos').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });
        res.json({ message: 'Agendamento excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
}

module.exports = { listarEventos, buscarEvento, criarEvento, atualizarEvento, excluirEvento };
