const { supabase } = require('../config/supabase');

async function listarEventos(req, res) {
    try {
        console.log('🔄 Iniciando listagem de agendamentos...');
        
        // Primeiro, tentar uma consulta simples para verificar se a tabela existe
        const { data: testData, error: testError } = await supabase
            .from('agendamentos')
            .select('id, titulo')
            .limit(1);
            
        if (testError) {
            console.error('❌ Erro ao acessar tabela agendamentos:', testError);
            return res.status(500).json({ 
                error: 'Erro ao acessar tabela agendamentos',
                details: testError.message 
            });
        }
        
        console.log('✅ Tabela agendamentos acessível, fazendo consulta completa...');
        
        const { data, error } = await supabase
            .from('agendamentos')
            .select(`
                *,
                locais (
                    id,
                    nome,
                    endereco
                ),
                acoes (
                    id,
                    nome,
                    descricao
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
                    nome
                ),
                usuarios!usuario_lancamento_id (
                    id,
                    email
                )
            `)
            .order('data_inicio', { ascending: true });
            
        if (error) {
            console.error('❌ Erro na consulta completa:', error);
            throw error;
        }
        
        console.log(`✅ ${data?.length || 0} agendamentos encontrados`);
        res.json(data || []);
    } catch (error) {
        console.error('❌ Erro ao listar agendamentos:', error);
        res.status(500).json({ 
            error: 'Erro ao listar agendamentos',
            details: error.message 
        });
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
                    endereco
                ),
                acoes (
                    id,
                    nome,
                    descricao
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
                    nome
                ),
                usuarios!usuario_lancamento_id (
                    id,
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
                    endereco
                ),
                acoes (
                    id,
                    nome,
                    descricao
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
                    nome
                ),
                usuarios!usuario_lancamento_id (
                    id,
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
                    endereco
                ),
                acoes (
                    id,
                    nome,
                    descricao
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
                    nome
                ),
                usuarios!usuario_lancamento_id (
                    id,
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
