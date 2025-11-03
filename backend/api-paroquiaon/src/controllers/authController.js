const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'paroquiaon-secret-key';

// Função para fazer login (suporta email ou login e primeiro acesso com senha temporária)
const login = async (req, res) => {
    try {
        const { email, emailOrUsername, senha } = req.body;

        const identificador = (emailOrUsername || email || '').trim();
        if (!identificador || !senha) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Buscar usuário pelo identificador de forma determinística:
        // 1) Tenta por email exato; 2) Se não encontrar, tenta por login exato
        const baseSelect = `
                id,
                email,
                login,
                senha,
                senha_temporaria,
                trocar_senha_proximo_login,
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
                )`;

        let usuario = null;
        let usuarioError = null;

        // Tenta por email
        let resp = await supabase
            .from('usuarios')
            .select(baseSelect)
            .eq('email', identificador)
            .eq('ativo', true)
            .maybeSingle();

        if (!resp.error && resp.data) {
            usuario = resp.data;
        } else {
            // Se não achou por email, tenta por login
            resp = await supabase
                .from('usuarios')
                .select(baseSelect)
                .eq('login', identificador)
                .eq('ativo', true)
                .maybeSingle();
            usuario = resp.data || null;
            usuarioError = resp.error || null;
        }

        // Log para debug (remover em produção)
        console.log('🔍 Login attempt:', { 
            identificador, 
            usuarioFound: !!usuario,
            error: usuarioError?.message || null,
            hasTempPassword: !!usuario?.senha_temporaria
        });

        if (usuarioError || !usuario) {
            console.log('❌ Usuário não encontrado ou erro:', usuarioError);
            return res.status(401).json({
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Verificar primeiro acesso (senha temporária ou flag para trocar)
        const hasTemp = !!usuario.senha_temporaria; // pode não existir no schema atual
        const mustChange = !!usuario.trocar_senha_proximo_login; // pode não existir no schema atual

        if (hasTemp || mustChange) {
            // Se o usuário enviou a senha temporária correta, retornar sinalização de troca de senha
            if (hasTemp && senha && String(senha) === String(usuario.senha_temporaria)) {
                return res.status(200).json({
                    success: true,
                    requiresPasswordChange: true,
                    user: {
                        id: usuario.id,
                        email: usuario.email,
                        login: usuario.login,
                        nome: usuario.pessoas?.nome,
                        telefone: usuario.pessoas?.telefone,
                        perfil: usuario.perfis?.nome,
                        permissoes: usuario.perfis?.permissoes || {}
                    }
                });
            }

            // Caso tenha flag de trocar senha mas a senha enviada não é a temporária
            return res.status(428).json({
                error: 'Primeiro acesso: é necessário alterar a senha temporária',
                code: 'PASSWORD_CHANGE_REQUIRED'
            });
        }

        // Verificar senha normal (hash)
        if (!usuario.senha) {
            console.log('❌ Usuário sem senha cadastrada');
            return res.status(401).json({
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        console.log('🔐 Verificação de senha:', { 
            senhaHashExists: !!usuario.senha,
            senhaValida,
            senhaLength: senha?.length || 0
        });

        if (!senhaValida) {
            console.log('❌ Senha inválida');
            return res.status(401).json({
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Atualizar último login
        await supabase
            .from('usuarios')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', usuario.id);

        // Gerar token JWT
        const token = jwt.sign(
            { 
                userId: usuario.id,
                email: usuario.email,
                perfil: usuario.perfis?.nome
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: usuario.id,
                email: usuario.email,
                login: usuario.login,
                nome: usuario.pessoas?.nome,
                telefone: usuario.pessoas?.telefone,
                perfil: usuario.perfis?.nome,
                permissoes: usuario.perfis?.permissoes || {}
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Função para verificar token
const verifyToken = async (req, res) => {
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
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            valid: true,
            user: {
                id: usuario.id,
                email: usuario.email,
                login: usuario.login,
                nome: usuario.pessoas?.nome,
                telefone: usuario.pessoas?.telefone,
                perfil: usuario.perfis?.nome,
                permissoes: usuario.perfis?.permissoes || {}
            }
        });

    } catch (error) {
        console.error('Erro ao verificar token:', error);
        
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
            error: 'Token inválido',
            code: 'TOKEN_ERROR'
        });
    }
};

// Função para alterar senha
const alterarSenha = async (req, res) => {
    try {
        const { email, senhaAtual, novaSenha } = req.body;

        if (!email || !senhaAtual || !novaSenha) {
            return res.status(400).json({ 
                error: 'Email, senha atual e nova senha são obrigatórios',
                code: 'MISSING_FIELDS'
            });
        }

        // Validar força da senha
        const passwordValidation = validatePasswordStrength(novaSenha);
        if (passwordValidation.strength < 4) {
            return res.status(400).json({ 
                error: 'A senha não atende aos requisitos mínimos de segurança',
                code: 'WEAK_PASSWORD',
                requirements: passwordValidation.requirements
            });
        }

        // Buscar usuário por email
        const { data: usuario, error: searchError } = await supabase
            .from('usuarios')
            .select('id, email, senha, ativo')
            .eq('email', email)
            .eq('ativo', true)
            .single();

        if (searchError || !usuario) {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        // Verificar senha atual
        const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaAtualValida) {
            return res.status(400).json({ 
                error: 'Senha atual incorreta',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }

        // Hash da nova senha
        const saltRounds = 12;
        const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

        // Atualizar senha
        const { data, error } = await supabase
            .from('usuarios')
            .update({
                senha: novaSenhaHash
            })
            .eq('email', email)
            .select('id, email')
            .single();

        if (error) {
            throw error;
        }

        res.json({ 
            message: 'Senha alterada com sucesso',
            code: 'PASSWORD_CHANGED',
            user: {
                id: data.id,
                email: data.email
            }
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ 
            error: 'Erro ao alterar senha',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Função para resetar senha (admin)
const resetarSenha = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { novaSenha } = req.body;

        if (!novaSenha) {
            return res.status(400).json({ 
                error: 'Nova senha é obrigatória',
                code: 'MISSING_PASSWORD'
            });
        }

        // Validar força da senha
        const passwordValidation = validatePasswordStrength(novaSenha);
        if (passwordValidation.strength < 4) {
            return res.status(400).json({ 
                error: 'A senha não atende aos requisitos mínimos de segurança',
                code: 'WEAK_PASSWORD',
                requirements: passwordValidation.requirements
            });
        }

        // Buscar usuário
        const { data: usuario, error: searchError } = await supabase
            .from('usuarios')
            .select('id, email, ativo')
            .eq('id', usuario_id)
            .eq('ativo', true)
            .single();

        if (searchError || !usuario) {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        // Hash da nova senha
        const saltRounds = 12;
        const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

        // Atualizar senha
        const { data, error } = await supabase
            .from('usuarios')
            .update({
                senha: novaSenhaHash
            })
            .eq('id', usuario_id)
            .select('id, email')
            .single();

        if (error) {
            throw error;
        }

        res.json({ 
            message: 'Senha resetada com sucesso',
            code: 'PASSWORD_RESET',
            user: {
                id: data.id,
                email: data.email
            }
        });

    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        res.status(500).json({ 
            error: 'Erro ao resetar senha',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Função para logout (opcional - para invalidar tokens)
const logout = async (req, res) => {
    try {
        // Em uma implementação mais robusta, você poderia manter uma blacklist de tokens
        // Por enquanto, apenas retornamos sucesso
        res.json({
            message: 'Logout realizado com sucesso',
            code: 'LOGOUT_SUCCESS'
        });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Função para validar força da senha
function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%&*]/.test(password)
    };
    
    const strength = Object.values(requirements).filter(Boolean).length;
    return { requirements, strength };
}

module.exports = {
    login,
    verifyToken,
    alterarSenha,
    resetarSenha,
    logout
};
