const { supabase } = require('../config/supabase');

// Middleware de autenticação
async function authenticateUser(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Token não fornecido'
            });
        }

        // Decodificar token simples
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email, timestamp] = decoded.split(':');
        
        // Verificar se o token não é muito antigo (24 horas)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) {
            return res.status(401).json({
                error: 'Token expirado'
            });
        }

        // Verificar se o usuário ainda existe
        const { data: colaborador, error } = await supabase
            .from('colaboradores')
            .select('codigo, email, nome, perfil, status')
            .eq('email', email)
            .eq('status', 'Ativo')
            .single();

        if (error || !colaborador) {
            return res.status(401).json({
                error: 'Usuário não encontrado'
            });
        }

        // Buscar permissões do perfil do usuário
        let permissoes = {};
        try {
            const { data: perfil, error: perfilError } = await supabase
                .from('perfis')
                .select('*')
                .eq('codigo', colaborador.perfil)
                .single();

            if (!perfilError && perfil) {
                // Extrair apenas as permissões (campos booleanos)
                Object.keys(perfil).forEach(key => {
                    if (typeof perfil[key] === 'boolean') {
                        permissoes[key] = perfil[key];
                    }
                });
            }
        } catch (permError) {
            console.warn('Erro ao buscar permissões do perfil:', permError);
        }

        // Adicionar usuário ao request
        req.user = {
            ...colaborador,
            permissoes: permissoes
        };

        next();
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(401).json({
            error: 'Token inválido'
        });
    }
}

module.exports = { authenticateUser };
