const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

// Rotas para locais
router.get('/', localController.listarLocais);
router.get('/:id', localController.buscarLocal);
router.post('/', localController.criarLocal);
router.put('/:id', localController.atualizarLocal);
router.delete('/:id', localController.excluirLocal);

module.exports = router;
