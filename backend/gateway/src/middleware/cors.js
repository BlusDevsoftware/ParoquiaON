const cors = require('cors');

// Configuração do CORS para ParóquiaON
const corsOptions = {
    origin: function (origin, callback) {
        // Lista de origens permitidas
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:4173',
            'https://paroquiaon.vercel.app',
            'https://paroquiaon-frontend.vercel.app',
            'https://*.vercel.app',
            'https://*.netlify.app'
        ];

        // Permitir requisições sem origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Verificar se a origem está na lista de permitidas
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                // Para wildcards como *.vercel.app
                const pattern = allowedOrigin.replace('*', '.*');
                return new RegExp(pattern).test(origin);
            }
            return origin === allowedOrigin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origem não permitida: ${origin}`);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page',
        'X-Per-Page',
        'X-Total-Pages'
    ],
    credentials: true,
    maxAge: 86400, // 24 horas
    preflightContinue: false,
    optionsSuccessStatus: 200
};

// Middleware CORS customizado
const corsMiddleware = cors(corsOptions);

// Middleware adicional para headers personalizados
const customHeaders = (req, res, next) => {
    // Headers de segurança
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Headers da API
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Service', 'ParóquiaON API');
    
    next();
};

// Middleware para tratamento de erros CORS
const corsErrorHandler = (err, req, res, next) => {
    if (err.message === 'Não permitido pelo CORS') {
        res.status(403).json({
            error: 'Acesso negado',
            message: 'Origem não permitida pelo CORS',
            origin: req.headers.origin,
            code: 'CORS_ERROR'
        });
    } else {
        next(err);
    }
};

module.exports = {
    corsMiddleware,
    customHeaders,
    corsErrorHandler,
    corsOptions
};