const express = require('express');
const router = express.Router();
const { listarStatus, buscarStatus } = require('../controllers/statusController');

// Rota para listar todos os status
router.get('/', listarStatus);

// Rota para buscar um status específico
router.get('/:id', buscarStatus);

module.exports = router;
