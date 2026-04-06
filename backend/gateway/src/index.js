const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors');
const authMiddleware = require('./middleware/auth');

// Importar rotas do ParóquiaON
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const comunidadeRoutes = require('./routes/comunidadeRoutes');
const pastoralRoutes = require('./routes/pastoralRoutes');
const pilarRoutes = require('./routes/pilarRoutes');
const localRoutes = require('./routes/localRoutes');
const acaoRoutes = require('./routes/acaoRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();

// Configurações de segurança
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // limite de 1000 requisições por IP
    message: {
        error: 'Muitas requisições. Tente novamente em 15 minutos.'
    }
});
app.use(limiter);

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas públicas (sem autenticação)
app.use('/api/auth', authRoutes);

// Middleware de autenticação para rotas protegidas
app.use('/api', authMiddleware);

// Rotas protegidas do ParóquiaON
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfis', perfilRoutes);
app.use('/api/pessoas', pessoaRoutes);
app.use('/api/comunidades', comunidadeRoutes);
app.use('/api/pastorais', pastoralRoutes);
app.use('/api/pilares', pilarRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/acoes', acaoRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'ParóquiaON API',
        version: '1.0.0'
    });
});

// Rota de informações da API
app.get('/api/info', (req, res) => {
    res.json({
        name: 'ParóquiaON API',
        version: '1.0.0',
        description: 'API para sistema de gestão paroquial',
        endpoints: {
            auth: '/api/auth',
            usuarios: '/api/usuarios',
            perfis: '/api/perfis',
            pessoas: '/api/pessoas',
            comunidades: '/api/comunidades',
            pastorais: '/api/pastorais',
            pilares: '/api/pilares',
            locais: '/api/locais',
            acoes: '/api/acoes',
            agenda: '/api/agenda',
            relatorios: '/api/relatorios'
        }
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro na API:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ParóquiaON API rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
});

module.exports = app;