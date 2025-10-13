const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');

// Rotas genéricas para qualquer tabela (compatibilidade com eGerente)
router.get('/:tabela', cadastroController.listarRegistros);
router.get('/:tabela/:id', cadastroController.buscarRegistro);
router.post('/:tabela', cadastroController.criarRegistro);
router.put('/:tabela/:id', cadastroController.atualizarRegistro);
router.delete('/:tabela/:id', cadastroController.excluirRegistro);

// Rotas de senha movidas para authRoutes para evitar duplicação

module.exports = router;