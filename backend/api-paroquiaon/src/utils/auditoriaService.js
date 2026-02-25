const { supabase } = require('../config/supabase');

/**
 * Registra um evento de auditoria na tabela `auditoria`.
 *
 * Este helper NÃO lança erro para não quebrar o fluxo de negócio.
 */
async function logEvento({
    req,
    acao,
    modulo,
    recurso,
    entidadeId,
    descricao,
    detalhes
}) {
    try {
        const userFromReq = req && req.user ? req.user : {};
        const email = userFromReq.email || null;
        const usuario =
            userFromReq.nome ||
            userFromReq.login ||
            userFromReq.email ||
            null;

        // IP e user-agent (pensando em ambiente com proxy / Vercel)
        const forwarded = req?.headers?.['x-forwarded-for'];
        const ip =
            (typeof forwarded === 'string' && forwarded.split(',')[0].trim()) ||
            req?.ip ||
            null;

        const userAgent = req?.headers?.['user-agent'] || null;

        const payload = {
            acao,
            modulo,
            recurso,
            entidade_id: entidadeId ?? null,
            email,
            usuario,
            descricao: descricao || null,
            detalhes: detalhes || null,
            ip,
            user_agent: userAgent
        };

        const { error } = await supabase.from('auditoria').insert([payload]);
        if (error) {
            console.error('Erro ao registrar auditoria:', error);
        }
    } catch (err) {
        console.error('Falha inesperada ao registrar auditoria:', err);
    }
}

module.exports = {
    logEvento
};

