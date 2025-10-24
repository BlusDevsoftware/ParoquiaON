const { supabase } = require('../config/supabase');

// Dashboard consolidado com todos os dados
async function dadosDashboard(req, res) {
    try {
        console.log('🔄 Buscando dados do dashboard...');

        // Buscar estatísticas de todas as entidades
        const [comunidadesStats, pastoraisStats, pessoasStats, agendaStats] = await Promise.all([
            estatisticasComunidades(),
            estatisticasPastorais(),
            estatisticasPessoas(),
            estatisticasEventos()
        ]);

        // Buscar dados para gráficos
        const [comunidadesGraficos, pastoraisGraficos, pessoasGraficos, agendaGraficos] = await Promise.all([
            dadosGraficosComunidades(),
            dadosGraficosPastorais(),
            dadosGraficosPessoas(),
            dadosGraficosEventos()
        ]);

        const dashboardData = {
            estatisticas: {
                comunidades: comunidadesStats,
                pastorais: pastoraisStats,
                pessoas: pessoasStats,
                eventos: agendaStats
            },
            graficos: {
                comunidades: comunidadesGraficos,
                pastorais: pastoraisGraficos,
                pessoas: pessoasGraficos,
                eventos: agendaGraficos
            },
            timestamp: new Date().toISOString()
        };

        console.log('✅ Dados do dashboard carregados com sucesso');
        res.json(dashboardData);

    } catch (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
}

// Funções auxiliares para estatísticas
async function estatisticasComunidades() {
    try {
        const { data: total, error: totalError } = await supabase
            .from('comunidades')
            .select('*', { count: 'exact', head: true });

        const { data: ativas, error: ativasError } = await supabase
            .from('comunidades')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Ativo');

        const { data: inativas, error: inativasError } = await supabase
            .from('comunidades')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Inativo');

        if (totalError || ativasError || inativasError) {
            throw new Error('Erro ao buscar estatísticas de comunidades');
        }

        return {
            total: total?.length || 0,
            ativas: ativas?.length || 0,
            inativas: inativas?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas de comunidades:', error);
        return { total: 0, ativas: 0, inativas: 0 };
    }
}

async function estatisticasPastorais() {
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
            throw new Error('Erro ao buscar estatísticas de pastorais');
        }

        return {
            total: total?.length || 0,
            ativas: ativas?.length || 0,
            inativas: inativas?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas de pastorais:', error);
        return { total: 0, ativas: 0, inativas: 0 };
    }
}

async function estatisticasPessoas() {
    try {
        const { data: total, error: totalError } = await supabase
            .from('pessoas')
            .select('*', { count: 'exact', head: true });

        const { data: ativas, error: ativasError } = await supabase
            .from('pessoas')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', true);

        const { data: inativas, error: inativasError } = await supabase
            .from('pessoas')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', false);

        if (totalError || ativasError || inativasError) {
            throw new Error('Erro ao buscar estatísticas de pessoas');
        }

        return {
            total: total?.length || 0,
            ativas: ativas?.length || 0,
            inativas: inativas?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas de pessoas:', error);
        return { total: 0, ativas: 0, inativas: 0 };
    }
}

async function estatisticasEventos() {
    try {
        const { data: total, error: totalError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true });

        const { data: agendados, error: agendadosError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('status_id', 1);

        const { data: confirmados, error: confirmadosError } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('status_id', 2);

        if (totalError || agendadosError || confirmadosError) {
            throw new Error('Erro ao buscar estatísticas de eventos');
        }

        return {
            total: total?.length || 0,
            agendados: agendados?.length || 0,
            confirmados: confirmados?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas de eventos:', error);
        return { total: 0, agendados: 0, confirmados: 0 };
    }
}

// Funções auxiliares para dados de gráficos
async function dadosGraficosComunidades() {
    try {
        const { data: comunidades, error: comunidadesError } = await supabase
            .from('comunidades')
            .select(`
                id,
                nome,
                status,
                data_fundacao,
                created_at
            `)
            .order('created_at', { ascending: true });

        if (comunidadesError) throw comunidadesError;

        const { data: pessoas, error: pessoasError } = await supabase
            .from('pessoas')
            .select('id, comunidade_id, created_at');

        if (pessoasError) throw pessoasError;

        const evolucaoComunidades = calcularEvolucaoComunidades(comunidades);
        const distribuicaoStatus = calcularDistribuicaoStatus(comunidades);
        const topComunidades = calcularTopComunidades(comunidades, pessoas);

        return {
            evolucao: evolucaoComunidades,
            distribuicao: distribuicaoStatus,
            topComunidades: topComunidades,
            totalComunidades: comunidades?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos de comunidades:', error);
        return {
            evolucao: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], dados: [0, 0, 0, 0, 0, 0] },
            distribuicao: { labels: ['Ativo', 'Inativo'], dados: [0, 0] },
            topComunidades: { labels: ['Sem dados'], dados: [0] },
            totalComunidades: 0
        };
    }
}

async function dadosGraficosPastorais() {
    try {
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

        const evolucaoPastorais = calcularEvolucaoPastorais(pastorais);
        const distribuicaoStatus = calcularDistribuicaoStatusPastorais(pastorais);

        return {
            evolucao: evolucaoPastorais,
            distribuicao: distribuicaoStatus,
            totalPastorais: pastorais?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos de pastorais:', error);
        return {
            evolucao: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], dados: [0, 0, 0, 0, 0, 0] },
            distribuicao: { labels: ['Ativo', 'Inativo'], dados: [0, 0] },
            totalPastorais: 0
        };
    }
}

async function dadosGraficosPessoas() {
    try {
        const { data: pessoas, error: pessoasError } = await supabase
            .from('pessoas')
            .select(`
                id,
                nome,
                ativo,
                created_at,
                comunidade_id
            `)
            .order('created_at', { ascending: true });

        if (pessoasError) throw pessoasError;

        const evolucaoPessoas = calcularEvolucaoPessoas(pessoas);
        const distribuicaoStatus = calcularDistribuicaoStatusPessoas(pessoas);

        return {
            evolucao: evolucaoPessoas,
            distribuicao: distribuicaoStatus,
            totalPessoas: pessoas?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos de pessoas:', error);
        return {
            evolucao: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], dados: [0, 0, 0, 0, 0, 0] },
            distribuicao: { labels: ['Ativo', 'Inativo'], dados: [0, 0] },
            totalPessoas: 0
        };
    }
}

async function dadosGraficosEventos() {
    try {
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

        const evolucaoEventos = calcularEvolucaoEventos(eventos);
        const distribuicaoStatus = calcularDistribuicaoStatusEventos(eventos);
        const eventosPorMes = calcularEventosPorMes(eventos);

        return {
            evolucao: evolucaoEventos,
            distribuicao: distribuicaoStatus,
            eventosPorMes: eventosPorMes,
            totalEventos: eventos?.length || 0
        };
    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos de eventos:', error);
        return {
            evolucao: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], dados: [0, 0, 0, 0, 0, 0] },
            distribuicao: { labels: ['Ativo', 'Concluído', 'Cancelado'], dados: [0, 0, 0] },
            eventosPorMes: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], dados: [0, 0, 0, 0, 0, 0] },
            totalEventos: 0
        };
    }
}

// Funções auxiliares para cálculos
function calcularEvolucaoComunidades(comunidades) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const comunidadesMes = (comunidades || []).filter(c => {
            if (!c || !c.created_at) return false;
            const dataComunidade = new Date(c.created_at);
            if (isNaN(dataComunidade.getTime())) return false;
            return dataComunidade.getMonth() === mes.getMonth() && 
                   dataComunidade.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = comunidadesMes.length;
    }

    return { labels, dados };
}

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

function calcularEvolucaoPessoas(pessoas) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = new Array(6).fill(0);
    const labels = [];

    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(meses[mes.getMonth()]);
        
        const pessoasMes = (pessoas || []).filter(p => {
            if (!p || !p.created_at) return false;
            const dataPessoa = new Date(p.created_at);
            if (isNaN(dataPessoa.getTime())) return false;
            return dataPessoa.getMonth() === mes.getMonth() && 
                   dataPessoa.getFullYear() === mes.getFullYear();
        });

        dados[5 - i] = pessoasMes.length;
    }

    return { labels, dados };
}

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

function calcularDistribuicaoStatus(comunidades) {
    const status = {
        ativo: 0,
        inativo: 0
    };

    (comunidades || []).forEach(comunidade => {
        const statusComunidade = (comunidade.status || '').toString().trim().toLowerCase();
        if (statusComunidade === 'ativo') {
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

function calcularDistribuicaoStatusPessoas(pessoas) {
    const status = {
        ativo: 0,
        inativo: 0
    };

    (pessoas || []).forEach(pessoa => {
        if (pessoa.ativo === true) {
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

function calcularTopComunidades(comunidades, pessoas) {
    const pessoasPorComunidade = {};
    
    pessoas.forEach(pessoa => {
        if (pessoa.comunidade_id) {
            pessoasPorComunidade[pessoa.comunidade_id] = (pessoasPorComunidade[pessoa.comunidade_id] || 0) + 1;
        }
    });

    const nomesComunidades = {};
    comunidades.forEach(comunidade => {
        if (comunidade.id) {
            nomesComunidades[comunidade.id] = comunidade.nome || 'Comunidade';
        }
    });

    const topComunidades = Object.entries(pessoasPorComunidade)
        .map(([id, count]) => ({
            nome: nomesComunidades[id] || `Comunidade ${id}`,
            count: count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        labels: topComunidades.map(c => c.nome),
        dados: topComunidades.map(c => c.count)
    };
}

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

module.exports = { dadosDashboard };
