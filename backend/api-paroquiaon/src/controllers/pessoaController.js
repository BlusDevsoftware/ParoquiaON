const { supabase } = require('../config/supabase');

async function listarPessoas(req, res) {
    try {
        const { data, error } = await supabase.from('pessoas').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar pessoas:', error);
        res.status(500).json({ error: 'Erro ao listar pessoas' });
    }
}

async function buscarPessoa(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pessoas').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pessoa:', error);
        res.status(500).json({ error: 'Erro ao buscar pessoa' });
    }
}

async function criarPessoa(req, res) {
    try {
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? (String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo')
            : 'ativo';

        const insertData = {
            nome: body.nome,
            telefone: body.telefone ?? null,
            endereco: body.endereco ?? null,
            status: normalizedStatus,
            usuario_id: body.usuario_id ?? null,
            criado_por_email: body.criado_por_email ?? null,
            criado_por_nome: body.criado_por_nome ?? null
        };

        let insertResult = await supabase
            .from('pessoas')
            .insert([insertData])
            .select()
            .single();

        if (insertResult.error && insertResult.error.code === '42703') {
            // Fallback para esquemas com coluna boolean "ativo"
            const fallbackData = {
                nome: insertData.nome,
                telefone: insertData.telefone,
                endereco: insertData.endereco,
                ativo: normalizedStatus === 'ativo',
                usuario_id: insertData.usuario_id,
                criado_por_email: insertData.criado_por_email,
                criado_por_nome: insertData.criado_por_nome
            };
            insertResult = await supabase
                .from('pessoas')
                .insert([fallbackData])
                .select()
                .single();
        }

        if (insertResult.error) throw insertResult.error;
        res.status(201).json(insertResult.data);
    } catch (error) {
        console.error('Erro ao criar pessoa:', error);
        res.status(500).json({ error: 'Erro ao criar pessoa', details: error?.message });
    }
}

async function atualizarPessoa(req, res) {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const normalizedStatus = typeof body.status === 'string'
            ? (String(body.status).toLowerCase() === 'inativo' ? 'inativo' : 'ativo')
            : undefined;

        const updateData = {
            ...(body.nome !== undefined ? { nome: body.nome } : {}),
            ...(body.telefone !== undefined ? { telefone: body.telefone } : {}),
            ...(body.endereco !== undefined ? { endereco: body.endereco } : {}),
            ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
            ...(body.usuario_id !== undefined ? { usuario_id: body.usuario_id } : {}),
            ...(body.criado_por_email !== undefined ? { criado_por_email: body.criado_por_email } : {}),
            ...(body.criado_por_nome !== undefined ? { criado_por_nome: body.criado_por_nome } : {})
        };

        let updateResult = await supabase
            .from('pessoas')
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
                .from('pessoas')
                .update(fallbackUpdate)
                .eq('id', id)
                .select()
                .single();
        }

        if (updateResult.error) throw updateResult.error;
        if (!updateResult.data) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json(updateResult.data);
    } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ error: 'Erro ao atualizar pessoa', details: error?.message });
    }
}

async function excluirPessoa(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('pessoas').delete().eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json({ message: 'Pessoa excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir pessoa:', error);
        res.status(500).json({ error: 'Erro ao excluir pessoa' });
    }
}

module.exports = { listarPessoas, buscarPessoa, criarPessoa, atualizarPessoa, excluirPessoa };
