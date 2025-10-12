const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

// Rotas para perfis
router.get('/', perfilController.listarPerfis);
router.get('/:codigo', perfilController.buscarPerfil);
router.get('/:codigo/permissoes', perfilController.listarPermissoes);
router.post('/', perfilController.criarPerfil);
router.put('/:codigo', perfilController.atualizarPerfil);
router.delete('/:codigo', perfilController.excluirPerfil);

module.exports = router;
