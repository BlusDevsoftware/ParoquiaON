const { supabase } = require('./src/config/supabase');

async function checkAllTables() {
    console.log('🔄 Verificando todas as tabelas...');
    
    try {
        // Tentar acessar algumas tabelas comuns
        const tables = [
            'agendamentos',
            'status_agendamento',
            'comunidades',
            'pastorais',
            'pilares',
            'locais',
            'acoes',
            'pessoas',
            'usuarios'
        ];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('id')
                    .limit(1);
                    
                if (error) {
                    console.log(`❌ Tabela ${table}: ${error.message}`);
                } else {
                    console.log(`✅ Tabela ${table}: existe`);
                }
            } catch (err) {
                console.log(`❌ Tabela ${table}: erro - ${err.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkAllTables();
