const { supabase } = require('./src/config/supabase');

async function checkTables() {
    console.log('🔄 Verificando tabelas existentes...');
    
    try {
        // Listar todas as tabelas
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
            
        if (error) {
            console.error('❌ Erro ao listar tabelas:', error);
            return;
        }
        
        console.log('📋 Tabelas encontradas:');
        tables?.forEach(table => {
            console.log(`  - ${table.table_name}`);
        });
        
        // Verificar se existe tabela de agendamentos
        const { data: agendamentos, error: agendamentosError } = await supabase
            .from('agendamentos')
            .select('id')
            .limit(1);
            
        if (agendamentosError) {
            console.log('❌ Tabela agendamentos não existe ou não é acessível');
        } else {
            console.log('✅ Tabela agendamentos existe');
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkTables();
