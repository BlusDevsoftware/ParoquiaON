const { supabase } = require('../config/supabase');

// Helpers de upload para Supabase Storage (bucket: "comunidade")
const STORAGE_BUCKET = 'comunidade';

function isBase64DataUrl(value) {
    return typeof value === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(value);
}

function dataUrlToBuffer(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    return Buffer.from(base64, 'base64');
}

async function uploadFotoIfNeeded(dados, identificador) {
    // Se não houver foto ou não for base64, retorna dados inalterados
    if (!dados || !dados.foto || !isBase64DataUrl(dados.foto)) {
        return dados;
    }
    const buffer = dataUrlToBuffer(dados.foto);
    // Define extensão padrão
    const ext = (dados.foto.match(/^data:image\/(png|jpe?g|webp)/i) || [null, 'jpeg'])[1]
        .replace('jpg', 'jpeg');
    const path = `fotos/${identificador}.${ext}`;

    const { error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(path, buffer, { contentType: `image/${ext}`, upsert: true });

    if (uploadError) {
        console.error('Erro ao fazer upload da imagem para o Storage:', uploadError);
        return dados; // Não bloquear o fluxo; mantém foto como estava
    }

    const { data: publicUrlData } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

    // Substitui foto pelo URL público
    return { ...dados, foto: publicUrlData?.publicUrl || dados.foto };
}

async function listarComunidades(req, res) {
    try {
        const leve = req.query.leve === '1' || req.query.leve === 'true';
        // Modo leve: apenas id, nome e cor (necessários para gráficos)
        // status não é usado na aba Minha Comunidade
        const campos = leve ? 'id, nome, cor' : '*';
        const { data, error } = await supabase.from('comunidades').select(campos).order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar comunidades:', error);
        res.status(500).json({ error: 'Erro ao listar comunidades' });
    }
}

async function buscarComunidade(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('comunidades').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Comunidade não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar comunidade:', error);
        res.status(500).json({ error: 'Erro ao buscar comunidade' });
    }
}

async function criarComunidade(req, res) {
    try {
        let dados = req.body || {};

        // Primeiro cria o registro (sem processar foto), para obter id/codigo
        const { data: created, error: insertError } = await supabase
            .from('comunidades')
            .insert([{
                codigo: dados.codigo,
                nome: dados.nome,
                telefone: dados.telefone,
                endereco: dados.endereco,
                latitude: dados.latitude,
                longitude: dados.longitude,
                data_fundacao: dados.data_fundacao,
                status: dados.status,
                conselho_membros: dados.conselho_membros,
                responsaveis: dados.responsaveis,
                // foto será tratada depois
            }])
            .select()
            .single();
        if (insertError) throw insertError;

        // Se enviou foto base64, faz upload e atualiza o registro com a URL
        if (isBase64DataUrl(dados.foto)) {
            const idOrCodigo = created?.codigo || created?.id;
            const dadosComFotoUrl = await uploadFotoIfNeeded(dados, idOrCodigo);
            if (dadosComFotoUrl.foto && dadosComFotoUrl.foto !== dados.foto) {
                const { data: updated, error: updateError } = await supabase
                    .from('comunidades')
                    .update({ foto: dadosComFotoUrl.foto })
                    .eq('id', created.id)
                    .select()
                    .single();
                if (updateError) {
                    // Loga mas não falha a criação
                    console.error('Erro ao salvar URL da foto após upload:', updateError);
                    return res.status(201).json(created);
                }
                return res.status(201).json(updated);
            }
        }
        res.status(201).json(created);
    } catch (error) {
        console.error('Erro ao criar comunidade:', error);
        res.status(500).json({ error: 'Erro ao criar comunidade' });
    }
}

async function atualizarComunidade(req, res) {
    try {
        const { id } = req.params;
        let dados = req.body || {};

        // Se houver foto base64, faz upload e troca por URL antes de atualizar
        // Se vier base64, sempre processa (mesmo que já exista URL no banco)
        if (dados.foto !== undefined && dados.foto !== null && dados.foto !== '') {
            if (isBase64DataUrl(dados.foto)) {
                // Nova foto em base64: fazer upload e substituir por URL
                console.log('📸 Processando nova foto base64 para comunidade', id);
                // Recupera o registro para obter o código em caso de upload
                const { data: atual, error: fetchError } = await supabase
                    .from('comunidades')
                    .select('id, codigo')
                    .eq('id', id)
                    .single();
                if (!fetchError && atual) {
                    dados = await uploadFotoIfNeeded(dados, atual.codigo || atual.id);
                    console.log('✅ Foto processada:', dados.foto?.substring(0, 50) + '...');
                }
            } else {
                // Se não for base64 (é URL), mantém como está
                console.log('📸 Foto recebida é URL, mantendo:', dados.foto?.substring(0, 50) + '...');
            }
        }

        const { data, error } = await supabase
            .from('comunidades')
            .update(dados)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Comunidade não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar comunidade:', error);
        res.status(500).json({ error: 'Erro ao atualizar comunidade' });
    }
}

async function excluirComunidade(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('comunidades').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Comunidade não encontrada' });
        res.json({ message: 'Comunidade excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir comunidade:', error);
        res.status(500).json({ error: 'Erro ao excluir comunidade' });
    }
}

// Estatísticas das comunidades
async function estatisticasComunidades(req, res) {
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

// Dados para gráficos de comunidades
async function dadosGraficosComunidades(req, res) {
    try {
        // Buscar todas as comunidades com dados relacionados
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

        // Buscar pessoas por comunidade
        const { data: pessoas, error: pessoasError } = await supabase
            .from('pessoas')
            .select('id, comunidade_id, created_at');

        if (pessoasError) throw pessoasError;

        // Calcular evolução de comunidades por mês (últimos 6 meses)
        const evolucaoComunidades = calcularEvolucaoComunidades(comunidades);
        
        // Calcular distribuição por status
        const distribuicaoStatus = calcularDistribuicaoStatus(comunidades);

        // Calcular top comunidades por número de pessoas
        const topComunidades = calcularTopComunidades(comunidades, pessoas);

        res.json({
            evolucao: evolucaoComunidades,
            distribuicao: distribuicaoStatus,
            topComunidades: topComunidades,
            totalComunidades: comunidades?.length || 0
        });

    } catch (error) {
        console.error('Erro ao buscar dados dos gráficos:', error);
        res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
    }
}

// Função auxiliar para calcular evolução de comunidades
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

// Função auxiliar para calcular distribuição por status
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

// Função auxiliar para calcular top comunidades
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

module.exports = { 
    listarComunidades, 
    buscarComunidade, 
    criarComunidade, 
    atualizarComunidade, 
    excluirComunidade,
    estatisticasComunidades,
    dadosGraficosComunidades
};
