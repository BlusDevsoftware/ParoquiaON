const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors');
const cadastroRoutes = require('./routes/cadastroRoutes');
const movimentoComissaoRoutes = require('./routes/movimentoComissaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

const app = express();

// Configurações de segurança
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API de Cadastros do eGerente',
        version: '1.0.0',
        endpoints: {
            colaboradores: '/api/cadastros/colaboradores',
            clientes: '/api/cadastros/clientes',
            produtos: '/api/cadastros/produtos',
            servicos: '/api/cadastros/servicos',
            perfis: '/api/cadastros/perfis'
        }
    });
});

// Rotas
app.use('/api/cadastros', movimentoComissaoRoutes);
app.use('/api/cadastros', cadastroRoutes);
app.use('/api/cadastros', perfilRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: 'A rota solicitada não existe'
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 