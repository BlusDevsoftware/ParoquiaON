const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// Rotas para relatórios
router.get('/', relatorioController.listarRelatorios);
router.get('/:id', relatorioController.buscarRelatorio);
router.post('/', relatorioController.criarRelatorio);
router.put('/:id', relatorioController.atualizarRelatorio);
router.delete('/:id', relatorioController.excluirRelatorio);

module.exports = router;
