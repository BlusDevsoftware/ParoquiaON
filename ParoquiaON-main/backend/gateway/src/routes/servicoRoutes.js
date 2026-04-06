const express = require('express');
const router = express.Router();
const {
    listarServicos,
    buscarServico,
    criarServico,
    atualizarServico,
    excluirServico
} = require('../controllers/servicoController');

// Listar todos os serviços
router.get('/', listarServicos);

// Buscar serviço por código
router.get('/:codigo', buscarServico);

// Criar novo serviço
router.post('/', criarServico);

// Atualizar serviço
router.put('/:codigo', atualizarServico);

// Excluir serviço
router.delete('/:codigo', excluirServico);

module.exports = router; 