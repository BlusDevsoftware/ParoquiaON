const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://hnxjjsiwptkybhwspmvd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sua_chave_aqui';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    try {
        console.log('🔍 Verificando tabelas no banco...');
        
        // Verificar tabela perfis
        const { data: perfisData, error: perfisError } = await supabase
            .from('perfis')
            .select('*')
            .limit(1);
        
        console.log('📊 Tabela perfis:', perfisError ? '❌ ERRO' : '✅ EXISTE');
        if (perfisError) console.log('   Erro:', perfisError.message);
        
        // Verificar tabela perfis_permissoes
        const { data: permissoesData, error: permissoesError } = await supabase
            .from('perfis_permissoes')
            .select('*')
            .limit(1);
        
        console.log('📊 Tabela perfis_permissoes:', permissoesError ? '❌ ERRO' : '✅ EXISTE');
        if (permissoesError) console.log('   Erro:', permissoesError.message);
        
        // Listar todas as tabelas
        console.log('\n🔍 Listando todas as tabelas...');
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_tables');
        
        if (tablesError) {
            console.log('❌ Erro ao listar tabelas:', tablesError.message);
        } else {
            console.log('📋 Tabelas encontradas:', tables);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkTables();
