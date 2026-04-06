const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

// Rotas para perfis
router.get('/', perfilController.listarPerfis);
router.get('/:id', perfilController.buscarPerfil);
router.post('/', perfilController.criarPerfil);
router.put('/:id', perfilController.atualizarPerfil);
router.delete('/:id', perfilController.excluirPerfil);

module.exports = router;
