const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const movimentoComissaoRoutes = require('./routes/movimentoComissaoRoutes');

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

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/movimento_comissoes', movimentoComissaoRoutes);

// Rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Configuração dos serviços
const services = {
    clientes: {
        url: process.env.CLIENTES_API_URL || 'https://clientes-api-bluepay.vercel.app',
        path: '/api/clientes'
    },
    colaboradores: {
        url: process.env.COLABORADORES_API_URL || 'https://colaboradores-api-bluepay.vercel.app',
        path: '/api/colaboradores'
    },
    servicos: {
        url: process.env.SERVICOS_API_URL || 'https://servicos-api-bluepay.vercel.app',
        path: '/api/servicos'
    }
};

// Configuração do proxy para cada serviço
Object.entries(services).forEach(([service, config]) => {
    app.use(
        config.path,
        createProxyMiddleware({
            target: config.url,
            changeOrigin: true,
            pathRewrite: {
                [`^${config.path}`]: ''
            },
            onError: (err, req, res) => {
                console.error(`Erro no serviço ${service}:`, err);
                res.status(500).json({
                    error: `Serviço ${service} indisponível`
                });
            }
        })
    );
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 