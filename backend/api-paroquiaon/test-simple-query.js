const { supabase } = require('./src/config/supabase');

async function testSimpleQuery() {
    console.log('🔄 Testando consulta simples...');
    
    try {
        // Testar consulta básica sem relacionamentos
        const { data: basicData, error: basicError } = await supabase
            .from('agendamentos')
            .select('id, titulo, data_inicio, status_id')
            .limit(3);
            
        if (basicError) {
            console.error('❌ Erro na consulta básica:', basicError);
            return;
        }
        
        console.log('✅ Consulta básica funcionou:', basicData);
        
        // Testar relacionamento com status apenas
        const { data: statusData, error: statusError } = await supabase
            .from('agendamentos')
            .select(`
                id,
                titulo,
                status_id,
                status_agendamento!status_id (
                    id,
                    nome
                )
            `)
            .limit(3);
            
        if (statusError) {
            console.error('❌ Erro no relacionamento com status:', statusError);
        } else {
            console.log('✅ Relacionamento com status funcionou:', statusData);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testSimpleQuery();
