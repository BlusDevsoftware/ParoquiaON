const express = require('express');
const router = express.Router();

const { listarAuditoria } = require('../controllers/auditoriaController');

// GET /api/auditoria
router.get('/', listarAuditoria);

module.exports = router;

