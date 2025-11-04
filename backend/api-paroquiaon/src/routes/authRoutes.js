const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login
router.post('/login', authController.login);

// Rota para verificar token
router.post('/verify', authController.verifyToken);

// Rota para alterar senha (primeiro acesso - com senha temporária)
router.post('/change-password', authController.changePasswordFirstLogin);

// Rota para resetar senha (admin)
router.post('/reset-password/:usuario_id', authController.resetarSenha);

// Rota de logout
router.post('/logout', authController.logout);

module.exports = router;
