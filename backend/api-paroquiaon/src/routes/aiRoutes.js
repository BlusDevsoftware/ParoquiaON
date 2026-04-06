const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Rota para gerar objetivo de evento com IA (Gemini)
// POST /api/ai/objetivo
router.post('/objetivo', aiController.gerarObjetivo);

module.exports = router;

