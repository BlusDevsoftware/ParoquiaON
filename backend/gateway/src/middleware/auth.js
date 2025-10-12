const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'paroquiaon-secret-key';

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Token de acesso não fornecido',
                code: 'MISSING_TOKEN'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verificar token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar usuário no Supabase
        const { data: user, error } = await supabase
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

        if (error || !user) {
            return res.status(401).json({ 
                error: 'Usuário não encontrado ou inativo',
                code: 'USER_NOT_FOUND'
            });
        }

        // Adicionar informações do usuário à requisição
        req.user = {
            id: user.id,
            email: user.email,
            login: user.login,
            perfil: user.perfis,
            pessoa: user.pessoas,
            permissions: user.perfis?.permissoes || {}
        };

        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        
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

        return res.status(500).json({ 
            error: 'Erro interno na autenticação',
            code: 'AUTH_ERROR'
        });
    }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const userPermissions = req.user.permissions;
        
        // Administrador tem acesso total
        if (userPermissions.admin === true) {
            return next();
        }

        // Verificar permissão específica
        if (!userPermissions[permission]) {
            return res.status(403).json({ 
                error: 'Permissão insuficiente',
                code: 'INSUFFICIENT_PERMISSION',
                required: permission
            });
        }

        next();
    };
};

// Middleware para verificar múltiplas permissões (qualquer uma)
const checkAnyPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const userPermissions = req.user.permissions;
        
        // Administrador tem acesso total
        if (userPermissions.admin === true) {
            return next();
        }

        // Verificar se tem pelo menos uma das permissões
        const hasPermission = permissions.some(permission => userPermissions[permission]);
        
        if (!hasPermission) {
            return res.status(403).json({ 
                error: 'Permissão insuficiente',
                code: 'INSUFFICIENT_PERMISSION',
                required: permissions
            });
        }

        next();
    };
};

// Função para gerar token JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Função para verificar token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    authMiddleware,
    checkPermission,
    checkAnyPermission,
    generateToken,
    verifyToken
};