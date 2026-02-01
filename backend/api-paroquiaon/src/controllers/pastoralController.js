const { supabase } = require('../config/supabase');

async function listarPastorais(req, res) {
    try {
        const leve = req.query.leve === '1' || req.query.leve === 'true';
        
        if (leve) {
            // Modo leve: buscar apenas campos essenciais
            // Primeiro tenta com status e ativo, se falhar, busca apenas id e nome
            let campos = 'id, nome, status, ativo';
            let { data, error } = await supabase.from('pastorais').select(campos).order('id', { ascending: true });
            
            // Se erro por campos não existirem, tenta apenas id e nome
            if (error && (error.code === 'PGRST116' || error.message?.includes('column') || error.message?.includes('does not exist'))) {
                console.log('⚠️ Campos status/ativo não encontrados, usando apenas id e nome');
                campos = 'id, nome';
                const retry = await supabase.from('pastorais').select(campos).order('id', { ascending: true });
                data = retry.data;
                error = retry.error;
            }
            
            if (error) throw error;
            return res.json(data || []);
        }
        
        // Modo completo: todos os campos
        const { data, error } = await supabase.from('pastorais').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar pastorais:', error);
        res.status(500).json({ 
            error: 'Erro ao listar pastorais',
            details: error.message 
        });
    }
}

async function buscarPastoral(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pastorais').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pastoral não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pastoral:', error);
        res.status(500).json({ error: 'Erro ao buscar pastoral' });
    }
}

async function criarPastoral(req, res) {
    try {
        const dados = req.body;
        console.log('Dados recebidos para criar pastoral:', dados);
        const { data, error } = await supabase.from('pastorais').insert([dados]).select().single();
        if (error) {
            console.error('Erro do Supabase:', error);
            throw error;
        }
        console.log('Pastoral criada com sucesso:', data);
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pastoral:', error);
        res.status(500).json({ error: 'Erro ao criar pastoral', details: error.message });
    }
}

async function atualizarPastoral(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase.from('pastorais').update(dados).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pastoral não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pastoral:', error);
        res.status(500).json({ error: 'Erro ao atualizar pastoral' });
    }
}

async function excluirPastoral(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pastorais').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Pastoral não encontrada' });
        res.json({ message: 'Pastoral excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir pastoral:', error);
        res.status(500).json({ error: 'Erro ao excluir pastoral' });
    }
}

// Estatísticas das pastorais
async function estatisticasPastorais(req, res) {
    try {
        const { data: total, error: totalError } = await supabase
            .from('pastorais')
            .select('*', { count: 'exact', head: true });

        const { data: ativas, error: ativasError } = await supabase
            .from('pastorais')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', true);

        const { data: inativas, error: inativasError } = await supabase
            .from('pastorais')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', false);

        if (totalError || ativasError || inativasError) {
            throw new Error('Erro ao buscar estatísticas');
        }

        res.json({
            total: total?.length || 0,
            ativas: ativas?.length || 0,
            inativas: inativas?.length || 0
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
}

// Dados para gráficos de pastorais
async function dadosGraficosPastorais(req, res) {
    try {
        // Buscar todas as pastorais
        const { data: pastorais, error: pastoraisError } = await supabase
            .from('pastorais')
            .select(`
                id,
                nome,
                ativo,
                created_at
            `)
            .order('created_at', { ascending: true });

        if (pastoraisError) throw pastoraisError;

        // Calcular evolução de pastorais por mês (últimos 6 meses)
        const evolucaoPastorais = calcularEvolucaoPastorais(pastorais);
        
        // Calcular distribuição por status
        const distribuicaoStatus = calcularDistribuicaoStatusPastorais(pastorais);

        res.json({
            evolucao: evolucaoPastorais,
            distribuicao: distribuicaoStatus,
            totalPastorais: pastorais?.length || 0
        });

    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos:', error);
        res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
    }
}

// Função auxiliar para calcular evolução de pastorais
function calcularEvolucaoPastorais(pastorais) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const pastoraisMes = (pastorais || []).filter(p => {
            if (!p || !p.created_at) return false;
            const dataPastoral = new Date(p.created_at);
            if (isNaN(dataPastoral.getTime())) return false;
            return dataPastoral.getMonth() === mes.getMonth() && 
                   dataPastoral.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = pastoraisMes.length;
    }

    return { labels, dados };
}

// Função auxiliar para calcular distribuição por status das pastorais
function calcularDistribuicaoStatusPastorais(pastorais) {
    const status = {
        ativo: 0,
        inativo: 0
    };

    (pastorais || []).forEach(pastoral => {
        if (pastoral.ativo === true) {
            status.ativo++;
        } else {
            status.inativo++;
        }
    });

    return {
        labels: ['Ativo', 'Inativo'],
        dados: [status.ativo, status.inativo]
    };
}

module.exports = { 
    listarPastorais, 
    buscarPastoral, 
    criarPastoral, 
    atualizarPastoral, 
    excluirPastoral,
    estatisticasPastorais,
    dadosGraficosPastorais
};
