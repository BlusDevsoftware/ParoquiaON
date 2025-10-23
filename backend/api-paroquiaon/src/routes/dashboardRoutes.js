const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rota para dados consolidados do dashboard
router.get('/', dashboardController.dadosDashboard);

module.exports = router;
