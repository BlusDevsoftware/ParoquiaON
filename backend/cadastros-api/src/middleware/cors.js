const cors = require('cors');

const allowedOrigins = [
    'https://e-gerente.vercel.app',
    'https://e-gerente-5lhcje1mq-bluedevs-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem origin (como mobile apps ou curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Origin bloqueada:', origin);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = cors(corsOptions); 