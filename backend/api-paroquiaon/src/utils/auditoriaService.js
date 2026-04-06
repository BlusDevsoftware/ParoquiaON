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

        /**
         * Regra importante:
         * - Se o controller enviou explicitamente a propriedade "usuario" (mesmo que null),
         *   usamos ESSA informação como verdade absoluta e NÃO tentamos extrair de detalhes/body.
         *   Isso evita que o criador do registro (criado_por_email, etc.) sobrescreva o executor.
         * - Somente quando "usuario" NÃO for enviado (undefined) é que aplicamos os fallbacks.
         */

        if (typeof usuarioParam !== 'undefined') {
            // Controller passou "usuario": pode ser string (executor) ou null (desconhecido),
            // mas em ambos os casos não usamos fallbacks.
            usuario = usuarioParam;
        } else {
            // 1) Tentar via req.user (nome, login ou email)
            if (userFromReq) {
                usuario =
                    userFromReq.nome ||
                    userFromReq.login ||
                    userFromReq.email ||
                    null;
            }

            // 2) Se ainda não tiver usuário, tenta extrair de "detalhes"
            if (!usuario && detalhes && typeof detalhes === 'object') {
                const tentarExtrair = (obj) => {
                    if (!obj || typeof obj !== 'object') return null;
                    return (
                        obj.criado_por_email ||
                        obj.atualizado_por_email ||
                        obj.email ||
                        obj.usuario_email ||
                        obj.user_email ||
                        obj.login ||
                        null
                    );
                };

                // primeiro no próprio objeto detalhes
                usuario = tentarExtrair(detalhes);

                // depois em detalhes.before / detalhes.after, se existir
                if (!usuario && detalhes.before) {
                    usuario = tentarExtrair(detalhes.before);
                }
                if (!usuario && detalhes.after) {
                    usuario = tentarExtrair(detalhes.after);
                }
            }

            // 3) Último fallback: tentar no req.body (ex.: criado_por_email)
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

        // Descrição permanece apenas com o texto enviado pelos controllers
        const descricaoFinal = descricao || null;

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

