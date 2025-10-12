const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/colaboradorController');

// Listar todos os colaboradores
router.get('/', colaboradorController.listarColaboradores);

// Buscar colaborador por código
router.get('/:codigo', colaboradorController.buscarColaborador);

// Criar novo colaborador
router.post('/', colaboradorController.criarColaborador);

// Atualizar colaborador
router.put('/:codigo', colaboradorController.atualizarColaborador);

// Resetar senha do colaborador (gera senha temporária)
router.post('/:codigo/reset-senha', colaboradorController.resetSenhaColaborador);

// Excluir colaborador
router.delete('/:codigo', colaboradorController.excluirColaborador);

module.exports = router; 