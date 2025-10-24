const { supabase } = require('./src/config/supabase');

async function testStatusRoute() {
    console.log('🔄 Testando rota de status...');
    
    try {
        // Testar se a tabela existe
        const { data: testData, error: testError } = await supabase
            .from('status_agendamento')
            .select('id, nome')
            .limit(1);
            
        if (testError) {
            console.error('❌ Erro ao acessar tabela status_agendamento:', testError);
            return;
        }
        
        console.log('✅ Tabela status_agendamento acessível');
        
        // Testar consulta completa
        const { data, error } = await supabase
            .from('status_agendamento')
            .select('*')
            .eq('ativo', true)
            .order('id', { ascending: true });
            
        if (error) {
            console.error('❌ Erro na consulta completa:', error);
            return;
        }
        
        console.log(`✅ ${data?.length || 0} status encontrados:`, data);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar teste
testStatusRoute();
