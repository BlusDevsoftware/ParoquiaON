import Validators from '../modules/validators';

describe('Validators', () => {
    describe('CPF Validation', () => {
        test('should validate a valid CPF', () => {
            expect(Validators.validateCPF('529.982.247-25')).toBe(true);
        });

        test('should invalidate an invalid CPF', () => {
            expect(Validators.validateCPF('123.456.789-00')).toBe(false);
        });

        test('should invalidate CPF with all same digits', () => {
            expect(Validators.validateCPF('111.111.111-11')).toBe(false);
        });

        test('should format CPF correctly', () => {
            expect(Validators.formatCPF('52998224725')).toBe('529.982.247-25');
        });
    });

    describe('CNPJ Validation', () => {
        test('should validate a valid CNPJ', () => {
            expect(Validators.validateCNPJ('12.345.678/0001-95')).toBe(true);
        });

        test('should invalidate an invalid CNPJ', () => {
            expect(Validators.validateCNPJ('12.345.678/0001-00')).toBe(false);
        });

        test('should invalidate CNPJ with all same digits', () => {
            expect(Validators.validateCNPJ('11.111.111/1111-11')).toBe(false);
        });

        test('should format CNPJ correctly', () => {
            expect(Validators.formatCNPJ('12345678000195')).toBe('12.345.678/0001-95');
        });
    });

    describe('Email Validation', () => {
        test('should validate a valid email', () => {
            expect(Validators.validateEmail('test@example.com')).toBe(true);
        });

        test('should invalidate an invalid email', () => {
            expect(Validators.validateEmail('invalid-email')).toBe(false);
        });
    });

    describe('Phone Validation', () => {
        test('should validate a valid phone number', () => {
            expect(Validators.validatePhone('(11) 99999-9999')).toBe(true);
        });

        test('should invalidate an invalid phone number', () => {
            expect(Validators.validatePhone('123456789')).toBe(false);
        });

        test('should format phone number correctly', () => {
            expect(Validators.formatPhone('11999999999')).toBe('(11) 99999-9999');
        });
    });

    describe('Password Validation', () => {
        test('should validate a strong password', () => {
            const result = Validators.validatePassword('StrongP@ss123');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should invalidate a weak password', () => {
            const result = Validators.validatePassword('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Monetary Value Validation', () => {
        test('should validate a valid monetary value', () => {
            expect(Validators.validateMonetaryValue(100.50)).toBe(true);
        });

        test('should invalidate a negative value', () => {
            expect(Validators.validateMonetaryValue(-100)).toBe(false);
        });

        test('should format monetary value correctly', () => {
            expect(Validators.formatMonetaryValue(100.50)).toBe('R$ 100,50');
        });
    });
}); 