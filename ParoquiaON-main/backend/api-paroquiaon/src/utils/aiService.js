const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o cliente do Gemini usando a variável de ambiente
const apiKey = process.env.GEMINI_API_KEY;
// Permitir configurar o modelo via env; padrão: gemini-2.5-flash (disponível na sua conta)
const defaultModel = 'gemini-2.5-flash';
const modelId = process.env.GEMINI_MODEL || defaultModel;

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

    const model = genAI.getGenerativeModel({ model: modelId });

    const prompt = `
Você é um assistente pastoral de uma paróquia católica.
Você receberá os dados de um evento da agenda com os campos:
Título, Comunidade, Pastoral, Pilar, Local, Ação, se o evento é paroquial
e, quando disponível, data e horário.

Tarefa:
- Escreva um objetivo curto, claro e acolhedor para esse evento,
  usando esses campos como contexto.
- Quando fizer sentido, mencione a comunidade, a pastoral, o pilar,
  o local e/ou a ação para deixar o objetivo mais específico.

Regras:
- Use português do Brasil.
- Utilize no máximo 2 frases.
- Foque em evangelização, comunhão e serviço, de forma simples.

Dados do evento:
${descricao}

Responda somente com o texto do objetivo.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return (response || '').trim();
}

module.exports = {
    gerarObjetivoComGemini,
};

