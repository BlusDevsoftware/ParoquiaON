const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');

// Rotas para pessoas
router.get('/', pessoaController.listarPessoas);
router.get('/estatisticas', pessoaController.estatisticasPessoas);
router.get('/graficos', pessoaController.dadosGraficosPessoas);
router.get('/:id', pessoaController.buscarPessoa);
router.post('/', pessoaController.criarPessoa);
router.put('/:id', pessoaController.atualizarPessoa);
router.delete('/:id', pessoaController.excluirPessoa);

module.exports = router;
