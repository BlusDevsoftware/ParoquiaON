const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors');
const authMiddleware = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Importar rotas do ParóquiaON
const authRoutes = require('./routes/authRoutes');
const cadastroRoutes = require('./routes/cadastroRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const comunidadeRoutes = require('./routes/comunidadeRoutes');
const pastoralRoutes = require('./routes/pastoralRoutes');
const pilarRoutes = require('./routes/pilarRoutes');
const localRoutes = require('./routes/localRoutes');
const acaoRoutes = require('./routes/acaoRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const statusRoutes = require('./routes/statusRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

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

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API ParóquiaON - Sistema de Gestão Paroquial',
        version: '1.0.0',
        description: 'API para gerenciar comunidades, pastorais, eventos e relatórios',
        endpoints: {
            auth: '/api/auth',
            cadastros: '/api/cadastros/:tabela',
            perfis: '/api/perfis'
        }
    });
});

// Rotas públicas (sem autenticação)
app.use('/api/auth', authRoutes);

// Rotas protegidas do ParóquiaON (com autenticação)
// Autenticação temporariamente desabilitada para desenvolvimento
app.use('/api/cadastros', cadastroRoutes);
app.use('/api/perfis', perfilRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pessoas', pessoaRoutes);
app.use('/api/comunidades', comunidadeRoutes);
app.use('/api/pastorais', pastoralRoutes);
app.use('/api/pilares', pilarRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/acoes', acaoRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/status-agendamento', statusRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
        modules: {
            auth: 'Autenticação e autorização',
            cadastros: 'CRUD genérico para todas as tabelas',
            perfis: 'Perfis de acesso e permissões',
            // movimento_comissoes removido
        },
        endpoints: {
            auth: '/api/auth',
            cadastros: '/api/cadastros/:tabela',
            perfis: '/api/perfis'
        }
    });
});

// Middleware para rotas não encontradas
app.use('*', notFoundHandler);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ParóquiaON API rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});

module.exports = app;