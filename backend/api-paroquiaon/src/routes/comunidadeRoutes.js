const express = require('express');
const router = express.Router();
const comunidadeController = require('../controllers/comunidadeController');

// Rotas para comunidades
router.get('/', comunidadeController.listarComunidades);
router.get('/:id', comunidadeController.buscarComunidade);
router.post('/', comunidadeController.criarComunidade);
router.put('/:id', comunidadeController.atualizarComunidade);
router.delete('/:id', comunidadeController.excluirComunidade);

module.exports = router;
