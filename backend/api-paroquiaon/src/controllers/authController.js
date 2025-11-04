const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'paroquiaon-secret-key';

// Login reativado: email-only; força troca se tiver senha temporária/flag
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const identificador = (email || '').trim();
        if (!identificador || !senha) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Apenas email permitido
        if (!identificador.includes('@')) {
            return res.status(400).json({
                error: 'Informe um email válido para login',
                code: 'EMAIL_REQUIRED'
            });
        }

        const baseSelect = `
                id,
                email,
                senha,
                senha_temporaria,
                ativo,
                ultimo_login,
                perfil_id,
                pessoa_id`;

        let resp = await supabase
            .from('usuarios')
            .select(baseSelect)
            .eq('email', identificador)
            .maybeSingle();

        let usuario = resp.data || null;
        let usuarioError = resp.error || null;

        if (usuarioError) {
            console.error('Supabase error fetching user by email:', usuarioError);
        }

        // Fallback para PostgREST 400: tentar com limit(1) e array
        if ((usuarioError && (usuarioError.code === 'PGRST100' || usuarioError.message)) || (!usuario && !usuarioError)) {
            try {
                const respArr = await supabase
                    .from('usuarios')
                    .select(baseSelect)
                    .eq('email', identificador)
                    .order('id', { ascending: true })
                    .limit(1);
                if (!respArr.error && Array.isArray(respArr.data) && respArr.data.length > 0) {
                    usuario = respArr.data[0];
                    usuarioError = null;
                }
            } catch (e) {
                console.error('Fallback fetch error:', e);
            }
        }

        if (usuarioError || !usuario) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Checar ativo no app layer para evitar falhas do filtro no PostgREST
        if (usuario.ativo === false) {
            return res.status(403).json({
                error: 'Usuário inativo',
                code: 'USER_INACTIVE'
            });
        }

        const hasTemp = !!usuario.senha_temporaria;

        // Primeiro acesso: se senha enviada = temporária, sinaliza troca com 200; senão 428
        if (hasTemp) {
            if (String(senha) === String(usuario.senha_temporaria)) {
                return res.status(200).json({
                    success: true,
                    requiresPasswordChange: true,
                    user: {
                        id: usuario.id,
                        email: usuario.email,
                        perfil_id: usuario.perfil_id ?? null,
                        pessoa_id: usuario.pessoa_id ?? null
                    }
                });
            }
            return res.status(428).json({
                error: 'Primeiro acesso: é necessário alterar a senha temporária',
                code: 'PASSWORD_CHANGE_REQUIRED'
            });
        }

        // Login normal por senha (bcrypt)
        if (!usuario.senha) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS'
            });
        }

        await supabase
            .from('usuarios')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', usuario.id);

        const token = jwt.sign(
            { userId: usuario.id, email: usuario.email, perfil_id: usuario.perfil_id ?? null },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: usuario.id,
                email: usuario.email,
                perfil_id: usuario.perfil_id ?? null,
                pessoa_id: usuario.pessoa_id ?? null
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
    }
};

// Função para verificar token (robusta contra 300 do PostgREST)
const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido', code: 'MISSING_TOKEN' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Buscar usuário atualizado (maybeSingle + fallback limit(1))
        // Buscar apenas campos básicos para evitar bloqueios de RLS em joins
        const baseSelect = `
                id,
                email,
                login,
                ativo,
                ultimo_login,
                perfil_id,
                pessoa_id`;

        let resp = await supabase
            .from('usuarios')
            .select(baseSelect)
            .eq('id', decoded.userId)
            .eq('ativo', true)
            .maybeSingle();

        let usuario = resp.data || null;
        let usuarioError = resp.error || null;

        // Fallback para possíveis retornos 300/array
        if ((usuarioError && (usuarioError.code === 'PGRST100' || usuarioError.message)) || (!usuario && !usuarioError)) {
            try {
                const respArr = await supabase
                    .from('usuarios')
                    .select(baseSelect)
                    .eq('id', decoded.userId)
                    .eq('ativo', true)
                    .order('id', { ascending: true })
                    .limit(1);
                if (!respArr.error && Array.isArray(respArr.data) && respArr.data.length > 0) {
                    usuario = respArr.data[0];
                    usuarioError = null;
                }
            } catch (e) {
                console.error('Fallback fetch error (verify):', e);
            }
        }

        if (usuarioError || !usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
        }

        // Buscar perfil em chamada separada (best-effort)
        let perfilNome = null;
        let permissoes = {};
        if (usuario.perfil_id != null) {
            try {
                let perfResp = await supabase
                    .from('perfis')
                    .select('id,nome,permissoes')
                    .eq('id', usuario.perfil_id)
                    .maybeSingle();
                let perfil = perfResp.data || null;
                if ((!perfil && !perfResp.error)) {
                    const arr = await supabase
                        .from('perfis')
                        .select('id,nome,permissoes')
                        .eq('id', usuario.perfil_id)
                        .order('id', { ascending: true })
                        .limit(1);
                    if (!arr.error && Array.isArray(arr.data) && arr.data.length > 0) {
                        perfil = arr.data[0];
                    }
                }
                if (perfil) {
                    perfilNome = perfil.nome || null;
                    permissoes = perfil.permissoes || {};
                }
            } catch (e) {
                console.warn('Falha ao buscar perfil (best-effort):', e);
            }
        }

        return res.json({
            valid: true,
            user: {
                id: usuario.id,
                email: usuario.email,
                login: usuario.login,
                perfil_id: usuario.perfil_id ?? null,
                pessoa_id: usuario.pessoa_id ?? null,
                perfil: perfilNome,
                permissoes
            }
        });

    } catch (error) {
        console.error('Erro ao verificar token:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido', code: 'INVALID_TOKEN' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Token inválido', code: 'TOKEN_ERROR' });
    }
};

// Função para alterar senha no primeiro acesso (com senha temporária)
const changePasswordFirstLogin = async (req, res) => {
    try {
        const { email, senhaTemporaria, novaSenha } = req.body;

        if (!email || !senhaTemporaria || !novaSenha) {
            return res.status(400).json({
                error: 'Email, senha temporária e nova senha são obrigatórios',
                code: 'MISSING_FIELDS'
            });
        }

        // Validar formato de e-mail
        if (!email.includes('@')) {
            return res.status(400).json({
                error: 'Informe um email válido',
                code: 'INVALID_EMAIL'
            });
        }

        // Buscar usuário por email
        let resp = await supabase
            .from('usuarios')
            .select('id, email, senha_temporaria, ativo')
            .eq('email', email)
            .eq('ativo', true)
            .maybeSingle();

        let usuario = resp.data || null;
        let usuarioError = resp.error || null;

        if (usuarioError) {
            console.error('Supabase error fetching user by email:', usuarioError);
        }

        // Fallback para PostgREST 400: tentar com limit(1) e array
        if ((usuarioError && (usuarioError.code === 'PGRST100' || usuarioError.message)) || (!usuario && !usuarioError)) {
            try {
                const respArr = await supabase
                    .from('usuarios')
                    .select('id, email, senha_temporaria, ativo')
                    .eq('email', email)
                    .eq('ativo', true)
                    .order('id', { ascending: true })
                    .limit(1);
                if (!respArr.error && Array.isArray(respArr.data) && respArr.data.length > 0) {
                    usuario = respArr.data[0];
                    usuarioError = null;
                }
            } catch (e) {
                console.error('Fallback fetch error:', e);
            }
        }

        if (usuarioError || !usuario) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        // Validar senha temporária
        if (!usuario.senha_temporaria || String(usuario.senha_temporaria) !== String(senhaTemporaria)) {
            return res.status(400).json({
                error: 'Senha temporária inválida',
                code: 'INVALID_TEMP_PASSWORD'
            });
        }

        // Validar força da nova senha
        const passwordValidation = validatePasswordStrength(novaSenha);
        if (passwordValidation.strength < 4) {
            return res.status(400).json({
                error: 'A senha não atende aos requisitos mínimos de segurança',
                code: 'WEAK_PASSWORD',
                requirements: passwordValidation.requirements
            });
        }

        // Hash da nova senha
        const saltRounds = 12;
        const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

        // Atualizar senha e limpar senha temporária
        const { error: updateError } = await supabase
            .from('usuarios')
            .update({
                senha: novaSenhaHash,
                senha_temporaria: null
            })
            .eq('id', usuario.id);

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError);
            return res.status(500).json({
                error: 'Erro ao atualizar senha',
                code: 'UPDATE_FAILED'
            });
        }

        return res.json({
            success: true,
            message: 'Senha alterada com sucesso',
            code: 'PASSWORD_CHANGED'
        });

    } catch (error) {
        console.error('Erro no change-password (primeiro acesso):', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
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
    changePasswordFirstLogin,
    alterarSenha,
    resetarSenha,
    logout
};
