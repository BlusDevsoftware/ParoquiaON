const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de autenticação
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);
router.post('/verify', authController.verifyToken);

module.exports = router;
