const { supabase } = require('../config/supabase');
const { logEvento } = require('../utils/auditoriaService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'paroquiaon-secret-key';

// Helper para extrair o usuário (email) direto do token JWT,
// sem depender do middleware de autenticação. Se não houver token ou for inválido,
// retorna undefined para permitir que o serviço de auditoria use os fallbacks normais.
function getUsuarioExecutorFromToken(req) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (!authHeader) return undefined;
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) return undefined;

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.email) {
            return decoded.email;
        }
        return undefined;
    } catch (e) {
        return undefined;
    }
}

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

        const acaoCriada = insertResult.data;

        const usuarioExecutorCriacao = getUsuarioExecutorFromToken(req);

        // Auditoria: criação de ação (registrando o usuário que executou a operação, se houver)
        logEvento({
            req,
            usuario: usuarioExecutorCriacao,
            acao: 'CREATE',
            modulo: 'acoes',
            recurso: 'acoes',
            entidadeId: acaoCriada?.id ?? null,
            descricao: `Ação criada: ${acaoCriada?.nome || ''}`.trim(),
            detalhes: {
                after: acaoCriada
            }
        });

        res.status(201).json(acaoCriada);
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

        // Buscar estado atual para comparação em auditoria
        let acaoAntes = null;
        try {
            const { data: atual, error: erroAtual } = await supabase
                .from('acoes')
                .select('*')
                .eq('id', id)
                .single();
            if (!erroAtual && atual) {
                acaoAntes = atual;
            }
        } catch (e) {
            console.warn('Não foi possível buscar ação antes da atualização para auditoria:', e);
        }

        // Não permitir alterar campos de autoria (usuario_id, criado_por_email, criado_por_nome)
        const updateData = {
            ...(body.nome !== undefined ? { nome: body.nome } : {}),
            ...(body.descricao !== undefined ? { descricao: body.descricao } : {}),
            ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {})
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

        const acaoDepois = updateResult.data;

        // Montar descrição amigável com base nas mudanças detectadas
        let descricao = 'Ação atualizada';
        const camposAlterados = [];

        if (acaoAntes) {
            const camposParaChecar = ['nome', 'descricao', 'status', 'ativo'];
            camposParaChecar.forEach((campo) => {
                if (acaoAntes[campo] !== acaoDepois[campo]) {
                    camposAlterados.push(campo);
                }
            });

            if (camposAlterados.length > 0) {
                const labelMap = {
                    nome: 'Nome',
                    descricao: 'Descrição',
                    status: 'Status',
                    ativo: 'Ativo'
                };

                const formatValor = (v) => {
                    if (v === null || v === undefined || v === '') return 'vazio';
                    if (typeof v === 'boolean') return v ? 'ativo' : 'inativo';
                    return String(v);
                };

                const partes = camposAlterados.map((campo) => {
                    const label = labelMap[campo] || campo;
                    const antigo = formatValor(acaoAntes[campo]);
                    const novo = formatValor(acaoDepois[campo]);
                    return `${label}: ${antigo} → ${novo}`;
                });

                descricao = `Ação atualizada - ${partes.join(' | ')}`;
            }
        }

        const usuarioExecutorAtualizacao = getUsuarioExecutorFromToken(req);

        // Auditoria: atualização de ação (registrando o usuário que executou a operação, se houver)
        logEvento({
            req,
            usuario: usuarioExecutorAtualizacao,
            acao: 'UPDATE',
            modulo: 'acoes',
            recurso: 'acoes',
            entidadeId: acaoDepois?.id ?? null,
            descricao,
            detalhes: {
                before: acaoAntes,
                after: acaoDepois
            }
        });

        res.json(acaoDepois);
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

        const acaoRemovida = data[0] || null;

        const usuarioExecutorExclusao = getUsuarioExecutorFromToken(req);

        // Auditoria: exclusão de ação (registrando o usuário que executou a operação, se houver)
        logEvento({
            req,
            usuario: usuarioExecutorExclusao,
            acao: 'DELETE',
            modulo: 'acoes',
            recurso: 'acoes',
            entidadeId: acaoRemovida?.id ?? null,
            descricao: `Ação excluída${acaoRemovida?.nome ? `: ${acaoRemovida.nome}` : ''}`,
            detalhes: {
                before: acaoRemovida
            }
        });

        res.json({ message: 'Ação excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir ação:', error);
        res.status(500).json({ error: 'Erro ao excluir ação' });
    }
}

module.exports = { listarAcoes, buscarAcao, criarAcao, atualizarAcao, excluirAcao };
