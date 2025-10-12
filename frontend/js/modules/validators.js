/**
 * Módulo de validações
 */
class Validators {
    /**
     * Valida um CPF
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} Se o CPF é válido
     */
    static validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let rest = 11 - (sum % 11);
        let digit1 = rest > 9 ? 0 : rest;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        rest = 11 - (sum % 11);
        let digit2 = rest > 9 ? 0 : rest;
        
        return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    }

    /**
     * Valida um CNPJ
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {boolean} Se o CNPJ é válido
     */
    static validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]/g, '');
        
        if (cnpj.length !== 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cnpj)) return false;
        
        // Validação do primeiro dígito verificador
        let size = cnpj.length - 2;
        let numbers = cnpj.substring(0, size);
        let digits = cnpj.substring(size);
        let sum = 0;
        let pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        
        // Validação do segundo dígito verificador
        size = size + 1;
        numbers = cnpj.substring(0, size);
        sum = 0;
        pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return result === parseInt(digits.charAt(1));
    }

    /**
     * Valida um email
     * @param {string} email - Email a ser validado
     * @returns {boolean} Se o email é válido
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Valida um telefone
     * @param {string} phone - Telefone a ser validado
     * @returns {boolean} Se o telefone é válido
     */
    static validatePhone(phone) {
        const re = /^\(\d{2}\) \d{4,5}-\d{4}$/;
        return re.test(phone);
    }

    /**
     * Valida uma senha
     * @param {string} password - Senha a ser validada
     * @returns {Object} Resultado da validação
     */
    static validatePassword(password) {
        const result = {
            isValid: true,
            errors: []
        };

        if (password.length < 8) {
            result.isValid = false;
            result.errors.push('A senha deve ter pelo menos 8 caracteres');
        }

        if (!/[A-Z]/.test(password)) {
            result.isValid = false;
            result.errors.push('A senha deve conter pelo menos uma letra maiúscula');
        }

        if (!/[a-z]/.test(password)) {
            result.isValid = false;
            result.errors.push('A senha deve conter pelo menos uma letra minúscula');
        }

        if (!/[0-9]/.test(password)) {
            result.isValid = false;
            result.errors.push('A senha deve conter pelo menos um número');
        }

        if (!/[!@#$%^&*]/.test(password)) {
            result.isValid = false;
            result.errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*)');
        }

        return result;
    }

    /**
     * Valida um valor monetário
     * @param {number} value - Valor a ser validado
     * @returns {boolean} Se o valor é válido
     */
    static validateMonetaryValue(value) {
        return !isNaN(value) && value >= 0;
    }

    /**
     * Formata um CPF
     * @param {string} cpf - CPF a ser formatado
     * @returns {string} CPF formatado
     */
    static formatCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    /**
     * Formata um CNPJ
     * @param {string} cnpj - CNPJ a ser formatado
     * @returns {string} CNPJ formatado
     */
    static formatCNPJ(cnpj) {
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    /**
     * Formata um telefone
     * @param {string} phone - Telefone a ser formatado
     * @returns {string} Telefone formatado
     */
    static formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }

    /**
     * Formata um valor monetário
     * @param {number} value - Valor a ser formatado
     * @returns {string} Valor formatado
     */
    static formatMonetaryValue(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// Exporta o módulo
export default Validators; 