const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');

// Rotas para agenda
router.get('/', agendaController.listarEventos);
router.get('/estatisticas', agendaController.estatisticasEventos);
router.get('/graficos', agendaController.dadosGraficosEventos);
router.get('/:id', agendaController.buscarEvento);
router.post('/', agendaController.criarEvento);
router.put('/:id', agendaController.atualizarEvento);
router.delete('/:id', agendaController.excluirEvento);

module.exports = router;
