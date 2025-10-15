const validator = require('validator');

// Middleware de validação genérico (simplificado)
const validateData = (schema) => {
    return (req, res, next) => {
        // Por enquanto, apenas passa para o próximo middleware
        next();
    };
};

// Validações específicas para diferentes entidades
const validationSchemas = {
    // Validação para usuários
    usuario: {
        email: validator.isEmail,
        login: (value) => validator.isLength(value, { min: 3, max: 50 }),
        senha: (value) => validator.isLength(value, { min: 8 }),
        perfil_id: validator.isInt,
        pessoa_id: validator.isInt
    },

    // Validação para pessoas
    pessoa: {
        nome: (value) => validator.isLength(value, { min: 2, max: 100 }),
        email: (value) => !value || validator.isEmail(value),
        telefone: (value) => !value || validator.isMobilePhone(value, 'pt-BR'),
        cpf: (value) => !value || validator.isLength(value, { min: 11, max: 14 }),
        data_nascimento: (value) => !value || validator.isISO8601(value)
    },

    // Validação para comunidades
    comunidade: {
        nome: (value) => validator.isLength(value, { min: 2, max: 100 }),
        descricao: (value) => !value || validator.isLength(value, { max: 500 }),
        endereco: (value) => !value || validator.isLength(value, { max: 200 })
    },

    // Validação para pastorais
    pastoral: {
        nome: (value) => validator.isLength(value, { min: 2, max: 100 }),
        tipo: (value) => !value || validator.isLength(value, { max: 100 }),
        descricao: (value) => !value || validator.isLength(value, { max: 500 }),
        responsavel_id: (value) => !value || validator.isInt(value)
    },

    // Validação para eventos
    evento: {
        titulo: (value) => validator.isLength(value, { min: 2, max: 100 }),
        descricao: (value) => !value || validator.isLength(value, { max: 1000 }),
        data_inicio: validator.isISO8601,
        data_fim: (value) => !value || validator.isISO8601(value),
        local_id: (value) => !value || validator.isInt(value)
    }
};

// Função para validar campos obrigatórios
const validateRequired = (fields) => {
    return (req, res, next) => {
        const missingFields = [];
        
        fields.forEach(field => {
            if (!req.body[field] || req.body[field] === '') {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Campos obrigatórios não fornecidos',
                code: 'MISSING_REQUIRED_FIELDS',
                missingFields
            });
        }

        next();
    };
};

// Função para validar força da senha
const validatePasswordStrength = (password) => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%&*]/.test(password)
    };
    
    const strength = Object.values(requirements).filter(Boolean).length;
    return { requirements, strength };
};

// Middleware para validar senha
const validatePassword = (req, res, next) => {
    const { senha } = req.body;
    
    if (senha) {
        const validation = validatePasswordStrength(senha);
        if (validation.strength < 4) {
            return res.status(400).json({
                error: 'A senha não atende aos requisitos mínimos de segurança',
                code: 'WEAK_PASSWORD',
                requirements: validation.requirements
            });
        }
    }
    
    next();
};

// Função para sanitizar dados
const sanitizeData = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Remover espaços em branco no início e fim
                req.body[key] = req.body[key].trim();
                
                // Sanitizar campos específicos
                if (key === 'email') {
                    req.body[key] = validator.normalizeEmail(req.body[key]);
                }
                
                if (key === 'nome' || key === 'titulo') {
                    // Capitalizar primeira letra de cada palavra
                    req.body[key] = req.body[key].replace(/\b\w/g, l => l.toUpperCase());
                }
                
                if (key === 'tipo') {
                    // Manter tipo em minúsculas para consistência
                    req.body[key] = req.body[key].toLowerCase();
                }
            }
        });
    }
    
    next();
};

module.exports = {
    validateData,
    validationSchemas,
    validateRequired,
    validatePasswordStrength,
    validatePassword,
    sanitizeData
};
