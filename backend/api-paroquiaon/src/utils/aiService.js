const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o cliente do Gemini usando a variável de ambiente
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('[AI Service] GEMINI_API_KEY não configurada. As chamadas de IA irão falhar até que a variável seja definida.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Gera um texto de "objetivo" pastoral para um evento da paróquia,
 * a partir de uma descrição simples fornecida pelo usuário.
 *
 * @param {string} descricao Texto curto descrevendo o evento
 * @returns {Promise<string>} Objetivo gerado pela IA
 */
async function gerarObjetivoComGemini(descricao) {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY não configurada no servidor');
    }

    // Usar o modelo recomendado na API generativelanguage v1beta
    // (sufixo -latest é o que o Google indica hoje para produção)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
Você é um assistente pastoral de uma paróquia católica.
Escreva um objetivo curto, claro e acolhedor para um evento paroquial,
com base na descrição abaixo.

Regras:
- Use português do Brasil.
- Utilize no máximo 2 frases.
- Foque em evangelização, comunhão e serviço, de forma simples.

Descrição do evento: "${descricao}"

Responda somente com o texto do objetivo.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return (response || '').trim();
}

module.exports = {
    gerarObjetivoComGemini,
};

