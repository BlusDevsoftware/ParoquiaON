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
        let usuario = null;

        // Montar identificação textual do usuário (nome, login ou email)
        if (userFromReq) {
            usuario =
                userFromReq.nome ||
                userFromReq.login ||
                userFromReq.email ||
                null;
        }

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

        // Se houver usuário e descrição, embute o usuário no texto
        let descricaoFinal = descricao || null;
        if (usuario && descricaoFinal) {
            descricaoFinal = `Usuário ${usuario} - ${descricaoFinal}`;
        }

        const payload = {
            acao,
            modulo,
            recurso,
            descricao: descricaoFinal,
            foto_usuario: fotoUsuario,
            usuario
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

