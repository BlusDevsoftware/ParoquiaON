const express = require('express');
const router = express.Router();
const {
    listarClientes,
    buscarCliente,
    criarCliente,
    atualizarCliente,
    excluirCliente
} = require('../controllers/clienteController');

// Listar todos os clientes
router.get('/', listarClientes);

// Buscar cliente por código
router.get('/:codigo', buscarCliente);

// Criar novo cliente
router.post('/', criarCliente);

// Atualizar cliente
router.put('/:codigo', atualizarCliente);

// Excluir cliente
router.delete('/:codigo', excluirCliente);

module.exports = router; 