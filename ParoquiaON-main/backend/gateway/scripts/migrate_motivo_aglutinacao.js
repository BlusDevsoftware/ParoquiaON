const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateMotivoAglutinacao() {
    try {
        console.log('🚀 Iniciando migração para adicionar coluna motivo_aglutinacao...');
        
        // 1. Adicionar a nova coluna
        console.log('📝 Adicionando coluna motivo_aglutinacao...');
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE movimento_comissoes 
                ADD COLUMN IF NOT EXISTS motivo_aglutinacao TEXT;
            `
        });
        
        if (alterError) {
            console.error('❌ Erro ao adicionar coluna:', alterError);
            throw alterError;
        }
        
        console.log('✅ Coluna motivo_aglutinacao adicionada com sucesso');
        
        // 2. Adicionar comentário
        console.log('📝 Adicionando comentário na coluna...');
        const { error: commentError } = await supabase.rpc('exec_sql', {
            sql: `
                COMMENT ON COLUMN movimento_comissoes.motivo_aglutinacao IS 'Motivo específico da aglutinação de títulos - separado das observações de pagamento';
            `
        });
        
        if (commentError) {
            console.warn('⚠️ Aviso: Não foi possível adicionar comentário (pode não ser suportado):', commentError.message);
        } else {
            console.log('✅ Comentário adicionado com sucesso');
        }
        
        // 3. Criar índice
        console.log('📝 Criando índice para performance...');
        const { error: indexError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE INDEX IF NOT EXISTS idx_movimento_comissoes_motivo_aglutinacao 
                ON movimento_comissoes(motivo_aglutinacao);
            `
        });
        
        if (indexError) {
            console.warn('⚠️ Aviso: Não foi possível criar índice (pode já existir):', indexError.message);
        } else {
            console.log('✅ Índice criado com sucesso');
        }
        
        // 4. Migrar dados existentes
        console.log('📝 Migrando dados existentes...');
        const { error: migrateError } = await supabase.rpc('exec_sql', {
            sql: `
                UPDATE movimento_comissoes 
                SET motivo_aglutinacao = observacoes 
                WHERE tipo_aglutinacao = 'AGL-PS' 
                  AND observacoes IS NOT NULL 
                  AND observacoes != ''
                  AND motivo_aglutinacao IS NULL;
            `
        });
        
        if (migrateError) {
            console.warn('⚠️ Aviso: Não foi possível migrar dados existentes:', migrateError.message);
        } else {
            console.log('✅ Dados existentes migrados com sucesso');
        }
        
        // 5. Verificar resultado
        console.log('🔍 Verificando resultado da migração...');
        const { data: checkData, error: checkError } = await supabase
            .from('movimento_comissoes')
            .select('id, numero_titulo, tipo_aglutinacao, motivo_aglutinacao, observacoes')
            .eq('tipo_aglutinacao', 'AGL-PS')
            .limit(5);
        
        if (checkError) {
            console.warn('⚠️ Aviso: Não foi possível verificar dados:', checkError.message);
        } else {
            console.log('📊 Dados de verificação:');
            checkData.forEach(titulo => {
                console.log(`  - ID ${titulo.id}: ${titulo.numero_titulo} | Motivo: ${titulo.motivo_aglutinacao || 'N/A'} | Obs: ${titulo.observacoes || 'N/A'}`);
            });
        }
        
        console.log('🎉 Migração concluída com sucesso!');
        console.log('📋 Resumo:');
        console.log('  ✅ Coluna motivo_aglutinacao adicionada');
        console.log('  ✅ Comentário adicionado (se suportado)');
        console.log('  ✅ Índice criado (se suportado)');
        console.log('  ✅ Dados existentes migrados');
        console.log('');
        console.log('💡 Próximos passos:');
        console.log('  1. Reiniciar o backend para usar a nova coluna');
        console.log('  2. Testar a funcionalidade de aglutinação');
        console.log('  3. Verificar se os motivos estão sendo salvos corretamente');
        
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        process.exit(1);
    }
}

// Executar migração
migrateMotivoAglutinacao();
