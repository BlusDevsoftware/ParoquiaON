const { supabase } = require('../config/supabase');

async function listarLocais(req, res) {
    try {
        const { data, error } = await supabase.from('locais').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar locais:', error);
        res.status(500).json({ error: 'Erro ao listar locais' });
    }
}

async function buscarLocal(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('locais').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Local não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar local:', error);
        res.status(500).json({ error: 'Erro ao buscar local' });
    }
}

async function criarLocal(req, res) {
    try {
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? (String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo')
            : 'ativo';

        const insertData = {
            nome: body.nome,
            endereco: body.endereco ?? null,
            tipo: body.tipo ?? null,
            observacao: body.observacao ?? body.descricao ?? null,
            status: normalizedStatus,
            usuario_id: body.usuario_id ?? null,
            criado_por_email: body.criado_por_email ?? null,
            criado_por_nome: body.criado_por_nome ?? null
        };

        let insertResult = await supabase
            .from('locais')
            .insert([insertData])
            .select()
            .single();

        if (insertResult.error && insertResult.error.code === '42703') {
            const fallbackData = {
                nome: insertData.nome,
                endereco: insertData.endereco,
                tipo: insertData.tipo,
                observacao: insertData.observacao,
                ativo: normalizedStatus === 'ativo',
                usuario_id: insertData.usuario_id,
                criado_por_email: insertData.criado_por_email,
                criado_por_nome: insertData.criado_por_nome
            };
            insertResult = await supabase
                .from('locais')
                .insert([fallbackData])
                .select()
                .single();
        }

        if (insertResult.error) throw insertResult.error;
        res.status(201).json(insertResult.data);
    } catch (error) {
        console.error('Erro ao criar local:', error);
        res.status(500).json({ error: 'Erro ao criar local', details: error?.message });
    }
}

async function atualizarLocal(req, res) {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? (String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo')
            : undefined;

        const updateData = {
            ...(body.nome !== undefined ? { nome: body.nome } : {}),
            ...(body.endereco !== undefined ? { endereco: body.endereco } : {}),
            ...(body.tipo !== undefined ? { tipo: body.tipo } : {}),
            ...(body.observacao !== undefined ? { observacao: body.observacao } : (body.descricao !== undefined ? { observacao: body.descricao } : {})),
            ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
            ...(body.usuario_id !== undefined ? { usuario_id: body.usuario_id } : {}),
            ...(body.criado_por_email !== undefined ? { criado_por_email: body.criado_por_email } : {}),
            ...(body.criado_por_nome !== undefined ? { criado_por_nome: body.criado_por_nome } : {})
        };

        let updateResult = await supabase
            .from('locais')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateResult.error && updateResult.error.code === '42703' && normalizedStatus !== undefined) {
            const fallbackUpdate = {
                ...updateData,
                status: undefined,
                ativo: normalizedStatus === 'ativo'
            };
            updateResult = await supabase
                .from('locais')
                .update(fallbackUpdate)
                .eq('id', id)
                .select()
                .single();
        }

        if (updateResult.error) throw updateResult.error;
        if (!updateResult.data) return res.status(404).json({ error: 'Local não encontrado' });
        res.json(updateResult.data);
    } catch (error) {
        console.error('Erro ao atualizar local:', error);
        res.status(500).json({ error: 'Erro ao atualizar local', details: error?.message });
    }
}

async function excluirLocal(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('locais').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Local não encontrado' });
        res.json({ message: 'Local excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir local:', error);
        res.status(500).json({ error: 'Erro ao excluir local' });
    }
}

module.exports = { listarLocais, buscarLocal, criarLocal, atualizarLocal, excluirLocal };
