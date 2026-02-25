const { supabase } = require('../config/supabase');

/**
 * Lista registros de auditoria para a tela de Relatórios > Auditoria.
 * 
 * Importante: retorna um ARRAY na raiz, pois o frontend já espera isso.
 */
const listarAuditoria = async (req, res) => {
    try {
        // Opcionalmente, aceitar filtros simples via query string (modulo, acao)
        const { modulo, acao } = req.query || {};

        let query = supabase
            .from('auditoria')
            .select('acao, created_at, descricao, modulo, recurso, foto_usuario')
            .order('created_at', { ascending: false })
            .limit(1000); // limite de segurança

        if (modulo) {
            query = query.ilike('modulo', modulo);
        }
        if (acao) {
            query = query.ilike('acao', acao);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar auditoria:', error);
            return res.status(500).json({ error: 'Erro ao listar auditoria' });
        }

        return res.json(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error('Erro inesperado ao listar auditoria:', err);
        return res.status(500).json({ error: 'Erro ao listar auditoria' });
    }
};

module.exports = {
    listarAuditoria
};

