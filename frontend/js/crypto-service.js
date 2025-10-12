/**
 * Serviço de criptografia para dados sensíveis
 */
class CryptoService {
    constructor() {
        this.ENCRYPTION_KEY = 'bluepay-secure-key-2024'; // Em produção, use uma chave mais segura
        this.IV_LENGTH = 16;
    }

    // Gera uma chave de criptografia a partir de uma string
    async generateKey(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return hash;
    }

    // Criptografa dados
    async encrypt(data) {
        try {
            const key = await this.generateKey(this.ENCRYPTION_KEY);
            const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(JSON.stringify(data));

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encodedData
            );

            // Combina IV e dados criptografados
            const result = new Uint8Array(iv.length + encryptedData.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encryptedData), iv.length);

            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Erro ao criptografar dados:', error);
            throw new Error('Falha na criptografia');
        }
    }

    // Descriptografa dados
    async decrypt(encryptedData) {
        try {
            const key = await this.generateKey(this.ENCRYPTION_KEY);
            const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            // Extrai IV e dados criptografados
            const iv = data.slice(0, this.IV_LENGTH);
            const encryptedContent = data.slice(this.IV_LENGTH);

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encryptedContent
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Erro ao descriptografar dados:', error);
            throw new Error('Falha na descriptografia');
        }
    }
}

// Exporta uma instância do serviço
window.CryptoService = new CryptoService(); 