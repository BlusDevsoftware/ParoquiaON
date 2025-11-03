const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login
router.post('/login', authController.login);

// Rota para alterar senha (primeiro acesso)
router.post('/change-password', async (req, res) => {
    try {
        const { email, emailOrUsername, senhaTemporaria, novaSenha } = req.body || {};
        const identificador = (emailOrUsername || email || '').trim();

        if (!identificador || !senhaTemporaria || !novaSenha) {
            return res.status(400).json({
                error: 'Dados incompletos',
                code: 'MISSING_FIELDS'
            });
        }

        // Buscar usuário por email/login
        const { data: usuario, error: usuarioError } = await require('../config/supabase').supabase
            .from('usuarios')
            .select('id, email, login, senha_temporaria, ativo')
            .or(`email.eq.${identificador},login.eq.${identificador}`)
            .eq('ativo', true)
            .single();

        if (usuarioError || !usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
        }

        // Validar senha temporária
        if (!usuario.senha_temporaria || String(usuario.senha_temporaria) !== String(senhaTemporaria)) {
            return res.status(400).json({ error: 'Senha temporária inválida', code: 'INVALID_TEMP_PASSWORD' });
        }

        // Validar força da nova senha (mínimo 8, maiúscula, minúscula, número)
        const strong = (s) => s && s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s);
        if (!strong(novaSenha)) {
            return res.status(400).json({ error: 'Senha fraca', code: 'WEAK_PASSWORD' });
        }

        // Hash e atualizar
        const bcrypt = require('bcryptjs');
        const senhaHash = await bcrypt.hash(novaSenha, 12);
        const { error: updateError } = await require('../config/supabase').supabase
            .from('usuarios')
            .update({ senha: senhaHash, senha_temporaria: null, trocar_senha_proximo_login: false })
            .eq('id', usuario.id);

        if (updateError) {
            return res.status(500).json({ error: 'Erro ao atualizar senha', code: 'UPDATE_FAILED' });
        }

        return res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (err) {
        console.error('Erro no change-password:', err);
        return res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
    }
});

// Rota para verificar token
router.post('/verify', authController.verifyToken);

// Rota para alterar senha
router.post('/change-password', authController.alterarSenha);

// Rota para resetar senha (admin)
router.post('/reset-password/:usuario_id', authController.resetarSenha);

// Rota de logout
router.post('/logout', authController.logout);

module.exports = router;
