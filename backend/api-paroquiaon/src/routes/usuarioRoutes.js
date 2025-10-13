const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validateRequired, validatePassword, sanitizeData } = require('../middleware/validation');

// Rotas para usuários
router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.buscarUsuario);

// Middleware de validação para criação de usuários
router.post('/', 
    sanitizeData,
    validateRequired(['email', 'login', 'senha']),
    validatePassword,
    usuarioController.criarUsuario
);

router.put('/:id', 
    sanitizeData,
    validatePassword,
    usuarioController.atualizarUsuario
);

router.delete('/:id', usuarioController.excluirUsuario);

module.exports = router;
