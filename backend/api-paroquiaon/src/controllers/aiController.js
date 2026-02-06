const { gerarObjetivoComGemini } = require('../utils/aiService');

/**
 * Controller para geração de objetivo de evento com IA (Gemini)
 */
async function gerarObjetivo(req, res) {
    try {
        const { descricao } = req.body || {};

        if (!descricao || typeof descricao !== 'string' || !descricao.trim()) {
            return res.status(400).json({
                error: 'Campo "descricao" é obrigatório.',
            });
        }

        const objetivo = await gerarObjetivoComGemini(descricao.trim());

        return res.json({ objetivo });
    } catch (error) {
        console.error('[AI Controller] Erro ao gerar objetivo com Gemini:', error);

        return res.status(500).json({
            error: 'Não foi possível gerar o objetivo com IA no momento.',
            details: error && (error.message || error.toString()),
        });
    }
}

module.exports = {
    gerarObjetivo,
};

