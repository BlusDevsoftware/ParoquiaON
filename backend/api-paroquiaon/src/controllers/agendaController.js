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

// Estatísticas dos eventos
async function estatisticasEventos(req, res) {
    try {
        const { data: total, error: totalError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true });

        const { data: ativos, error: ativosError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Ativo');

        const { data: concluidos, error: concluidosError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Concluído');

        if (totalError || ativosError || concluidosError) {
            throw new Error('Erro ao buscar estatísticas');
        }

        res.json({
            total: total?.length || 0,
            ativos: ativos?.length || 0,
            concluidos: concluidos?.length || 0
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
}

// Dados para gráficos de eventos
async function dadosGraficosEventos(req, res) {
    try {
        // Buscar todos os eventos
        const { data: eventos, error: eventosError } = await supabase
            .from('agendamentos')
            .select(`
                id,
                titulo,
                data_inicio,
                status,
                created_at
            `)
            .order('created_at', { ascending: true });

        if (eventosError) throw eventosError;

        // Calcular evolução de eventos por mês (últimos 6 meses)
        const evolucaoEventos = calcularEvolucaoEventos(eventos);
        
        // Calcular distribuição por status
        const distribuicaoStatus = calcularDistribuicaoStatusEventos(eventos);

        // Calcular eventos por mês (próximos 6 meses)
        const eventosPorMes = calcularEventosPorMes(eventos);

        res.json({
            evolucao: evolucaoEventos,
            distribuicao: distribuicaoStatus,
            eventosPorMes: eventosPorMes,
            totalEventos: eventos?.length || 0
        });

    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos:', error);
        res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
    }
}

// Função auxiliar para calcular evolução de eventos
function calcularEvolucaoEventos(eventos) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const eventosMes = (eventos || []).filter(e => {
            if (!e || !e.created_at) return false;
            const dataEvento = new Date(e.created_at);
            if (isNaN(dataEvento.getTime())) return false;
            return dataEvento.getMonth() === mes.getMonth() && 
                   dataEvento.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = eventosMes.length;
    }

    return { labels, dados };
}

// Função auxiliar para calcular distribuição por status dos eventos
function calcularDistribuicaoStatusEventos(eventos) {
    const status = {
        ativo: 0,
        concluido: 0,
        cancelado: 0
    };

    (eventos || []).forEach(evento => {
        const statusEvento = (evento.status || '').toString().trim().toLowerCase();
        if (statusEvento === 'ativo') {
            status.ativo++;
        } else if (statusEvento === 'concluído' || statusEvento === 'concluido') {
            status.concluido++;
        } else {
            status.cancelado++;
        }
    });

    return {
        labels: ['Ativo', 'Concluído', 'Cancelado'],
        dados: [status.ativo, status.concluido, status.cancelado]
    };
}

// Função auxiliar para calcular eventos por mês
function calcularEventosPorMes(eventos) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const eventosMes = (eventos || []).filter(e => {
            if (!e || !e.data_inicio) return false;
            const dataEvento = new Date(e.data_inicio);
            if (isNaN(dataEvento.getTime())) return false;
            return dataEvento.getMonth() === mes.getMonth() && 
                   dataEvento.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = eventosMes.length;
    }

    return { labels, dados };
}

module.exports = { 
    listarEventos, 
    buscarEvento, 
    criarEvento, 
    atualizarEvento, 
    excluirEvento,
    estatisticasEventos,
    dadosGraficosEventos
};
