const cors = require('cors');

const allowedOrigins = [
    'https://paroquia-on.vercel.app',
    'https://paroquiaon.vercel.app',
    'https://paroquiaon-frontend.vercel.app',
    'https://paroquiaon-git-main-bluedevs-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5173'
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