const express = require('express');
const router = express.Router();
const acaoController = require('../controllers/acaoController');

// Rotas para ações
router.get('/', acaoController.listarAcoes);
router.get('/:id', acaoController.buscarAcao);
router.post('/', acaoController.criarAcao);
router.put('/:id', acaoController.atualizarAcao);
router.delete('/:id', acaoController.excluirAcao);

module.exports = router;
