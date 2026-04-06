// Middleware de tratamento de erros padronizado
const errorHandler = (err, req, res, next) => {
    console.error('Erro na API:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Erro de validação do Supabase
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({
            error: 'Violação de restrição de dados',
            code: 'DATA_CONSTRAINT_VIOLATION',
            details: err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erro de conexão com banco
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(503).json({
            error: 'Serviço temporariamente indisponível',
            code: 'SERVICE_UNAVAILABLE',
            timestamp: new Date().toISOString()
        });
    }

    // Erro de timeout
    if (err.code === 'ETIMEDOUT') {
        return res.status(504).json({
            error: 'Timeout na operação',
            code: 'OPERATION_TIMEOUT',
            timestamp: new Date().toISOString()
        });
    }

    // Erro de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'JSON inválido',
            code: 'INVALID_JSON',
            timestamp: new Date().toISOString()
        });
    }

    // Erro de validação personalizado
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Dados inválidos',
            code: 'VALIDATION_ERROR',
            details: err.details || err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erro de autorização
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Não autorizado',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
        });
    }

    // Erro de permissão
    if (err.name === 'ForbiddenError') {
        return res.status(403).json({
            error: 'Acesso negado',
            code: 'FORBIDDEN',
            timestamp: new Date().toISOString()
        });
    }

    // Erro de recurso não encontrado
    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Recurso não encontrado',
            code: 'NOT_FOUND',
            timestamp: new Date().toISOString()
        });
    }

    // Erro de conflito (ex: email duplicado)
    if (err.name === 'ConflictError') {
        return res.status(409).json({
            error: 'Conflito de dados',
            code: 'CONFLICT',
            details: err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erro interno do servidor (padrão)
    res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
        timestamp: new Date().toISOString()
    });
};

// Middleware para capturar erros 404
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        code: 'ROUTE_NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};

// Classe para erros personalizados
class AppError extends Error {
    constructor(message, statusCode, code = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Funções auxiliares para criar erros específicos
const createError = {
    badRequest: (message, details = null) => {
        const error = new AppError(message, 400, 'BAD_REQUEST');
        if (details) error.details = details;
        return error;
    },

    unauthorized: (message = 'Não autorizado') => {
        return new AppError(message, 401, 'UNAUTHORIZED');
    },

    forbidden: (message = 'Acesso negado') => {
        return new AppError(message, 403, 'FORBIDDEN');
    },

    notFound: (message = 'Recurso não encontrado') => {
        return new AppError(message, 404, 'NOT_FOUND');
    },

    conflict: (message = 'Conflito de dados') => {
        return new AppError(message, 409, 'CONFLICT');
    },

    internal: (message = 'Erro interno do servidor') => {
        return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
    }
};

module.exports = {
    errorHandler,
    notFoundHandler,
    AppError,
    createError
};
