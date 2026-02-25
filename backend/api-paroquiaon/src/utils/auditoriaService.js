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
    descricao
}) {
    try {
        const userFromReq = req && req.user ? req.user : {};
        let fotoUsuario = null;

        // Tentar buscar a foto da pessoa vinculada ao usuário autenticado
        if (userFromReq.pessoa_id) {
            try {
                const { data: pessoa, error } = await supabase
                    .from('pessoas')
                    .select('foto')
                    .eq('id', userFromReq.pessoa_id)
                    .maybeSingle();
                if (!error && pessoa && pessoa.foto) {
                    fotoUsuario = pessoa.foto;
                }
            } catch (e) {
                console.warn('Não foi possível buscar foto da pessoa para auditoria:', e);
            }
        }

        const payload = {
            acao,
            modulo,
            recurso,
            descricao: descricao || null,
            foto_usuario: fotoUsuario
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

