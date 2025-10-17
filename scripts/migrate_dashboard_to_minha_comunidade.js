const { supabase } = require('./backend/api-paroquiaon/src/config/supabase');

async function migrarDashboardParaMinhaComunidade() {
    try {
        console.log('🔄 Iniciando migração: Dashboard → Minha Comunidade');
        
        // Executar a migração SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                -- Renomear a coluna dashboard_ver para minha_comunidade_ver
                ALTER TABLE perfis 
                RENAME COLUMN dashboard_ver TO minha_comunidade_ver;
                
                -- Comentário na coluna para documentação
                COMMENT ON COLUMN perfis.minha_comunidade_ver IS 'Permissão para visualizar Minha Comunidade (antigo Dashboard)';
            `
        });
        
        if (error) {
            console.error('❌ Erro na migração:', error);
            return;
        }
        
        console.log('✅ Migração executada com sucesso!');
        
        // Verificar se a alteração foi aplicada
        const { data: columns, error: checkError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', 'perfis')
            .eq('column_name', 'minha_comunidade_ver');
            
        if (checkError) {
            console.error('❌ Erro ao verificar migração:', checkError);
            return;
        }
        
        if (columns && columns.length > 0) {
            console.log('✅ Coluna renomeada com sucesso:', columns[0]);
        } else {
            console.log('⚠️ Coluna não encontrada após migração');
        }
        
    } catch (error) {
        console.error('❌ Erro geral na migração:', error);
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrarDashboardParaMinhaComunidade()
        .then(() => {
            console.log('🎉 Migração concluída!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Falha na migração:', error);
            process.exit(1);
        });
}

module.exports = migrarDashboardParaMinhaComunidade;
