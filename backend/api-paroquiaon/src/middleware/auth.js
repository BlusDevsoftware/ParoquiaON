const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'paroquiaon-secret-key';

// Middleware de autenticação
async function authenticateUser(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Token não fornecido',
                code: 'MISSING_TOKEN'
            });
        }

        // Verificar token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar usuário atualizado
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select(`
                id,
                email,
                login,
                ativo,
                ultimo_login,
                perfis (
                    id,
                    nome,
                    permissoes
                ),
                pessoas (
                    id,
                    nome,
                    telefone,
                    email
                )
            `)
            .eq('id', decoded.userId)
            .eq('ativo', true)
            .single();

        if (error || !usuario) {
            return res.status(401).json({
                error: 'Usuário não encontrado ou inativo',
                code: 'USER_NOT_FOUND'
            });
        }

        // Adicionar usuário ao request
        req.user = {
            id: usuario.id,
            email: usuario.email,
            login: usuario.login,
            nome: usuario.pessoas?.nome,
            telefone: usuario.pessoas?.telefone,
            perfil: usuario.perfis?.nome,
            permissoes: usuario.perfis?.permissoes || {}
        };

        next();
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            error: 'Erro de autenticação',
            code: 'AUTH_ERROR'
        });
    }
}

module.exports = authenticateUser;
