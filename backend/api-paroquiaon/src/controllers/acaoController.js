const { supabase } = require('../config/supabase');

async function listarAcoes(req, res) {
    try {
        const { data, error } = await supabase.from('acoes').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar ações:', error);
        res.status(500).json({ error: 'Erro ao listar ações' });
    }
}

async function buscarAcao(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('acoes').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Ação não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar ação:', error);
        res.status(500).json({ error: 'Erro ao buscar ação' });
    }
}

async function criarAcao(req, res) {
    try {
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? (String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo')
            : 'ativo';

        const insertData = {
            nome: body.nome,
            descricao: body.descricao ?? null,
            status: normalizedStatus,
            usuario_id: body.usuario_id ?? null,
            criado_por_email: body.criado_por_email ?? null,
            criado_por_nome: body.criado_por_nome ?? null
        };

        let insertResult = await supabase
            .from('acoes')
            .insert([insertData])
            .select()
            .single();

        if (insertResult.error && insertResult.error.code === '42703') {
            // Fallback se ainda existir apenas coluna "ativo" (boolean)
            const fallbackData = {
                nome: insertData.nome,
                descricao: insertData.descricao,
                ativo: normalizedStatus === 'ativo',
                usuario_id: insertData.usuario_id,
                criado_por_email: insertData.criado_por_email,
                criado_por_nome: insertData.criado_por_nome
            };
            insertResult = await supabase
                .from('acoes')
                .insert([fallbackData])
                .select()
                .single();
        }

        if (insertResult.error) throw insertResult.error;
        res.status(201).json(insertResult.data);
    } catch (error) {
        console.error('Erro ao criar ação:', error);
        res.status(500).json({ error: 'Erro ao criar ação', details: error?.message });
    }
}

async function atualizarAcao(req, res) {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? (String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo')
            : undefined;

        const updateData = {
            ...(body.nome !== undefined ? { nome: body.nome } : {}),
            ...(body.descricao !== undefined ? { descricao: body.descricao } : {}),
            ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
            ...(body.usuario_id !== undefined ? { usuario_id: body.usuario_id } : {}),
            ...(body.criado_por_email !== undefined ? { criado_por_email: body.criado_por_email } : {}),
            ...(body.criado_por_nome !== undefined ? { criado_por_nome: body.criado_por_nome } : {})
        };

        let updateResult = await supabase
            .from('acoes')
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
                .from('acoes')
                .update(fallbackUpdate)
                .eq('id', id)
                .select()
                .single();
        }

        if (updateResult.error) throw updateResult.error;
        if (!updateResult.data) return res.status(404).json({ error: 'Ação não encontrada' });
        res.json(updateResult.data);
    } catch (error) {
        console.error('Erro ao atualizar ação:', error);
        res.status(500).json({ error: 'Erro ao atualizar ação', details: error?.message });
    }
}

async function excluirAcao(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('acoes').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Ação não encontrada' });
        res.json({ message: 'Ação excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir ação:', error);
        res.status(500).json({ error: 'Erro ao excluir ação' });
    }
}

module.exports = { listarAcoes, buscarAcao, criarAcao, atualizarAcao, excluirAcao };
