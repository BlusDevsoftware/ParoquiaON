const express = require('express');
const router = express.Router();
const {
  listarPerfis,
  buscarPerfil,
  listarPermissoes,
  criarPerfil,
  atualizarPerfil,
  excluirPerfil,
} = require('../controllers/perfilController');

router.get('/', listarPerfis);
router.get('/:codigo', buscarPerfil);
router.get('/:codigo/permissoes', listarPermissoes);
router.post('/', criarPerfil);
router.put('/:codigo', atualizarPerfil);
router.delete('/:codigo', excluirPerfil);

module.exports = router;


