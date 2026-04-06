#!/usr/bin/env node

/**
 * Script de teste para verificar a integração da aba "Minha Comunidade"
 * com o sistema de API e banco de dados
 */

const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Função para testar endpoint
async function testEndpoint(endpoint, description) {
    try {
        console.log(`🔄 Testando ${description}...`);
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        
        if (response.status === 200) {
            console.log(`✅ ${description} - OK`);
            console.log(`   Dados recebidos: ${JSON.stringify(response.data).substring(0, 100)}...`);
            return true;
        } else {
            console.log(`❌ ${description} - Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${description} - Erro: ${error.message}`);
        return false;
    }
}

// Função principal de teste
async function runTests() {
    console.log('🚀 Iniciando testes de integração da aba "Minha Comunidade"');
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    console.log('=' * 60);

    const tests = [
        { endpoint: '/dashboard', description: 'Dashboard consolidado' },
        { endpoint: '/comunidades/estatisticas', description: 'Estatísticas de comunidades' },
        { endpoint: '/comunidades/graficos', description: 'Dados de gráficos de comunidades' },
        { endpoint: '/pastorais/estatisticas', description: 'Estatísticas de pastorais' },
        { endpoint: '/pastorais/graficos', description: 'Dados de gráficos de pastorais' },
        { endpoint: '/pessoas/estatisticas', description: 'Estatísticas de pessoas' },
        { endpoint: '/pessoas/graficos', description: 'Dados de gráficos de pessoas' },
        { endpoint: '/agenda/estatisticas', description: 'Estatísticas de eventos' },
        { endpoint: '/agenda/graficos', description: 'Dados de gráficos de eventos' }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        const passed = await testEndpoint(test.endpoint, test.description);
        if (passed) passedTests++;
        console.log(''); // Linha em branco
    }

    console.log('=' * 60);
    console.log(`📊 Resultado dos testes: ${passedTests}/${totalTests} passaram`);
    
    if (passedTests === totalTests) {
        console.log('🎉 Todos os testes passaram! A integração está funcionando corretamente.');
        console.log('');
        console.log('📋 Próximos passos:');
        console.log('   1. Verificar se o frontend está carregando os dados corretamente');
        console.log('   2. Testar os gráficos na interface');
        console.log('   3. Verificar se os cards do dashboard estão atualizados');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique:');
        console.log('   1. Se o servidor da API está rodando');
        console.log('   2. Se o banco de dados está configurado corretamente');
        console.log('   3. Se as tabelas existem no banco');
    }

    console.log('');
    console.log('🔗 URLs para testar manualmente:');
    tests.forEach(test => {
        console.log(`   ${API_BASE_URL}${test.endpoint}`);
    });
}

// Executar testes
runTests().catch(error => {
    console.error('❌ Erro ao executar testes:', error.message);
    process.exit(1);
});
