const { supabase } = require('./src/config/supabase');

async function testStatusData() {
    console.log('🔄 Testando dados da tabela status_agendamento...');
    
    try {
        // Testar consulta simples sem filtros
        const { data: allData, error: allError } = await supabase
            .from('status_agendamento')
            .select('*');
            
        if (allError) {
            console.error('❌ Erro ao consultar todos os dados:', allError);
            return;
        }
        
        console.log(`✅ ${allData?.length || 0} registros encontrados na tabela status_agendamento`);
        console.log('📋 Dados:', allData);
        
        // Testar consulta com filtro ativo
        const { data: activeData, error: activeError } = await supabase
            .from('status_agendamento')
            .select('*')
            .eq('ativo', true);
            
        if (activeError) {
            console.log('⚠️ Erro ao filtrar por ativo=true:', activeError);
            console.log('🔍 Tentando sem filtro de ativo...');
        } else {
            console.log(`✅ ${activeData?.length || 0} registros ativos encontrados`);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testStatusData();
