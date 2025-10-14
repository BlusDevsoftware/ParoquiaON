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
        const { data, error } = await supabase.from('comunidades').select('*').order('id', { ascending: true });
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
        if (isBase64DataUrl(dados.foto)) {
            // Recupera o registro para obter o código em caso de upload
            const { data: atual, error: fetchError } = await supabase
                .from('comunidades')
                .select('id, codigo')
                .eq('id', id)
                .single();
            if (!fetchError && atual) {
                dados = await uploadFotoIfNeeded(dados, atual.codigo || atual.id);
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

module.exports = { listarComunidades, buscarComunidade, criarComunidade, atualizarComunidade, excluirComunidade };
