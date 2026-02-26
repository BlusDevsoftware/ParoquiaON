const { supabase } = require('../config/supabase');

/**
 * Registra um evento de auditoria na tabela `auditoria`.
 *
 * Este helper NÃO lança erro para não quebrar o fluxo de negócio.
 *
 * Parâmetros aceitos (objeto):
 * - req: request Express (opcional, usado para tentar descobrir o usuário)
 * - acao, modulo, recurso, descricao: dados principais da auditoria
 * - usuario: string opcional para forçar o identificador do usuário (ex: email)
 * - detalhes: objeto opcional; se contiver email/nome, também é usado como fallback para usuário
 */
async function logEvento({
    req,
    acao,
    modulo,
    recurso,
    descricao,
    usuario: usuarioParam,
    detalhes
}) {
    try {
        const userFromReq = req && req.user ? req.user : {};
        let fotoUsuario = null;
        let usuario = null;

        // 1) Se veio explicitamente em usuarioParam, usa ele
        if (usuarioParam) {
            usuario = usuarioParam;
        } else {
            // 2) Tentar via req.user (nome, login ou email)
            if (userFromReq) {
                usuario =
                    userFromReq.nome ||
                    userFromReq.login ||
                    userFromReq.email ||
                    null;
            }

            // 3) Se ainda não tiver usuário, tenta extrair de "detalhes"
            if (!usuario && detalhes && typeof detalhes === 'object') {
                usuario =
                    detalhes.email ||
                    detalhes.usuario_email ||
                    detalhes.user_email ||
                    detalhes.login ||
                    null;
            }

            // 4) Último fallback: tentar no req.body (ex.: criado_por_email)
            const body = req && req.body ? req.body : null;
            if (!usuario && body && typeof body === 'object') {
                usuario =
                    body.criado_por_email ||
                    body.atualizado_por_email ||
                    body.email ||
                    null;
            }
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

