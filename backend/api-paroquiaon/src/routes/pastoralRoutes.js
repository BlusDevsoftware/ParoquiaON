const express = require('express');
const router = express.Router();
const pastoralController = require('../controllers/pastoralController');

// Rotas para pastorais
router.get('/', pastoralController.listarPastorais);
router.get('/:id', pastoralController.buscarPastoral);
router.post('/', pastoralController.criarPastoral);
router.put('/:id', pastoralController.atualizarPastoral);
router.delete('/:id', pastoralController.excluirPastoral);

module.exports = router;
