const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rotas para usuários
router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.buscarUsuario);
router.post('/', usuarioController.criarUsuario);
router.put('/:id', usuarioController.atualizarUsuario);
router.delete('/:id', usuarioController.excluirUsuario);

module.exports = router;
