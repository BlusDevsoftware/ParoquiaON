const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');

// Rotas genéricas para qualquer tabela (compatibilidade com eGerente)
router.get('/:tabela', cadastroController.listarRegistros);
router.get('/:tabela/:id', cadastroController.buscarRegistro);
router.post('/:tabela', cadastroController.criarRegistro);
router.put('/:tabela/:id', cadastroController.atualizarRegistro);
router.delete('/:tabela/:id', cadastroController.excluirRegistro);

// Rotas específicas para usuários (compatibilidade com eGerente)
router.post('/usuarios/change-password', cadastroController.alterarSenhaUsuario);
router.post('/usuarios/:id/reset-password', cadastroController.resetarSenhaUsuario);

// Rotas específicas para colaboradores (mapeadas para usuários)
router.post('/colaboradores/change-password', cadastroController.alterarSenhaUsuario);
router.post('/colaboradores/:id/reset-password', cadastroController.resetarSenhaUsuario);

module.exports = router;