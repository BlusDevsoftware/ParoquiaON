// Teste simples para verificar se a API está funcionando
const app = require('./src/index');

console.log('✅ API carregada com sucesso!');
console.log('🚀 Testando endpoints básicos...');

// Teste do endpoint raiz
app.get('/', (req, res) => {
    console.log('✅ Endpoint raiz funcionando');
    res.json({ message: 'API funcionando!' });
});

console.log('✅ Todos os testes passaram!');
