const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addVisualizarTodosTitulosColumn() {
    try {
        console.log('🔧 Adicionando coluna comissoes_visualizar_todos_titulos na tabela perfis...\n');

        // 1. Verificar se a coluna já existe
        console.log('1. Verificando se a coluna já existe...');
        const { data: existingData, error: checkError } = await supabase
            .from('perfis')
            .select('comissoes_visualizar_todos_titulos')
            .limit(1);

        if (checkError && checkError.code === 'PGRST116') {
            console.log('✅ Coluna não existe, vamos criá-la...');
        } else if (checkError) {
            console.error('❌ Erro ao verificar coluna:', checkError);
            return;
        } else {
            console.log('⚠️  Coluna já existe! Pulando criação...');
            return;
        }

        // 2. Executar SQL para adicionar a coluna
        console.log('2. Executando SQL para adicionar coluna...');
        const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE perfis 
                ADD COLUMN comissoes_visualizar_todos_titulos BOOLEAN DEFAULT FALSE;
                
                COMMENT ON COLUMN perfis.comissoes_visualizar_todos_titulos 
                IS 'Se TRUE, perfil pode ver títulos de todos os colaboradores. Se FALSE, vê apenas seus próprios títulos.';
            `
        });

        if (sqlError) {
            console.error('❌ Erro ao executar SQL:', sqlError);
            
            // Tentar método alternativo via RPC
            console.log('🔄 Tentando método alternativo...');
            const { data: altResult, error: altError } = await supabase
                .from('perfis')
                .select('*')
                .limit(1);
                
            if (altError) {
                console.error('❌ Erro no método alternativo:', altError);
                return;
            }
            
            console.log('⚠️  Não foi possível executar ALTER TABLE via RPC.');
            console.log('📝 Execute manualmente no Supabase SQL Editor:');
            console.log(`
                ALTER TABLE perfis 
                ADD COLUMN comissoes_visualizar_todos_titulos BOOLEAN DEFAULT FALSE;
                
                COMMENT ON COLUMN perfis.comissoes_visualizar_todos_titulos 
                IS 'Se TRUE, perfil pode ver títulos de todos os colaboradores. Se FALSE, vê apenas seus próprios títulos.';
            `);
            return;
        }

        console.log('✅ Coluna adicionada com sucesso!');

        // 3. Verificar se a coluna foi criada
        console.log('3. Verificando se a coluna foi criada...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('perfis')
            .select('comissoes_visualizar_todos_titulos')
            .limit(1);

        if (verifyError) {
            console.error('❌ Erro ao verificar coluna criada:', verifyError);
        } else {
            console.log('✅ Coluna verificada com sucesso!');
            console.log('📊 Estrutura da tabela perfis atualizada.');
        }

        // 4. Atualizar perfis existentes (opcional)
        console.log('4. Atualizando perfis existentes...');
        const { data: updateResult, error: updateError } = await supabase
            .from('perfis')
            .update({ comissoes_visualizar_todos_titulos: false })
            .neq('codigo', 0); // Atualizar todos exceto se houver algum filtro

        if (updateError) {
            console.error('❌ Erro ao atualizar perfis existentes:', updateError);
        } else {
            console.log('✅ Perfis existentes atualizados com valor padrão FALSE');
        }

        console.log('\n🎉 Migração concluída com sucesso!');
        console.log('📋 Próximos passos:');
        console.log('   1. Testar criação de perfil com nova permissão');
        console.log('   2. Modificar APIs para usar a nova permissão');
        console.log('   3. Implementar lógica de filtro por colaborador');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

addVisualizarTodosTitulosColumn();
