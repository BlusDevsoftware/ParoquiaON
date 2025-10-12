const express = require('express');
const router = express.Router();
const {
    listarUsuarios,
    buscarUsuario,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario
} = require('../controllers/usuarioController');

// Listar todos os usuários
router.get('/', listarUsuarios);

// Buscar usuário por código
router.get('/:codigo', buscarUsuario);

// Criar novo usuário
router.post('/', criarUsuario);

// Atualizar usuário
router.put('/:codigo', atualizarUsuario);

// Excluir usuário
router.delete('/:codigo', excluirUsuario);

module.exports = router; 