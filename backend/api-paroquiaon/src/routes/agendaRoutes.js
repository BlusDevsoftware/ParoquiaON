const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');

// Rotas para agenda
router.get('/', agendaController.listarEventos);
router.get('/:id', agendaController.buscarEvento);
router.post('/', agendaController.criarEvento);
router.put('/:id', agendaController.atualizarEvento);
router.delete('/:id', agendaController.excluirEvento);

module.exports = router;
