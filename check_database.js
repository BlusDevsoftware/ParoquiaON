const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    try {
        console.log('🔍 Verificando estrutura da tabela colaboradores...\n');

        // 1. Buscar um colaborador para ver a estrutura
        console.log('1. Buscando um colaborador para ver a estrutura:');
        const { data: colaborador, error: error1 } = await supabase
            .from('colaboradores')
            .select('*')
            .limit(1)
            .single();

        if (error1) {
            console.error('❌ Erro ao buscar colaborador:', error1);
        } else {
            console.log('✅ Colaborador encontrado:');
            console.log('Campos disponíveis:', Object.keys(colaborador));
            console.log('Estrutura completa:', colaborador);
        }

        console.log('\n2. Verificando admin@egerente.com:');
        const { data: admin, error: error2 } = await supabase
            .from('colaboradores')
            .select('*')
            .eq('email', 'admin@egerente.com')
            .single();

        if (error2) {
            console.error('❌ Erro ao buscar admin:', error2);
        } else {
            console.log('✅ Admin encontrado:');
            console.log('Email:', admin.email);
            console.log('Nome:', admin.nome);
            console.log('Status:', admin.status);
            console.log('Tem senha:', admin.senha ? 'Sim' : 'Não');
            console.log('Tem senha_temporaria:', admin.senha_temporaria ? 'Sim' : 'Não');
            console.log('Senha temporária:', admin.senha_temporaria);
        }

        console.log('\n3. Testando atualização simples:');
        const { data: updateResult, error: error3 } = await supabase
            .from('colaboradores')
            .update({ senha: 'teste123' })
            .eq('email', 'admin@egerente.com')
            .select()
            .single();

        if (error3) {
            console.error('❌ Erro ao atualizar senha:', error3);
        } else {
            console.log('✅ Atualização bem-sucedida:', updateResult);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkDatabase();
