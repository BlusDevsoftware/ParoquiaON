const express = require('express');
const router = express.Router();
const pilarController = require('../controllers/pilarController');

// Rotas para pilares
router.get('/', pilarController.listarPilares);
router.get('/:id', pilarController.buscarPilar);
router.post('/', pilarController.criarPilar);
router.put('/:id', pilarController.atualizarPilar);
router.delete('/:id', pilarController.excluirPilar);

module.exports = router;
