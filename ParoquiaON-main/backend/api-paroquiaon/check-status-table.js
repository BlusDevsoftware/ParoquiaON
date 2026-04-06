const { supabase } = require('./src/config/supabase');

async function checkStatusTable() {
    console.log('🔄 Verificando tabela status_agendamento...');
    
    try {
        // Verificar se a tabela existe
        const { data: tableExists, error: tableError } = await supabase
            .from('status_agendamento')
            .select('id')
            .limit(1);
            
        if (tableError) {
            console.error('❌ Erro ao acessar tabela status_agendamento:', tableError);
            return;
        }
        
        console.log('✅ Tabela status_agendamento existe');
        
        // Buscar todos os status
        const { data: status, error: statusError } = await supabase
            .from('status_agendamento')
            .select('*')
            .order('id', { ascending: true });
            
        if (statusError) {
            console.error('❌ Erro ao buscar status:', statusError);
            return;
        }
        
        console.log(`✅ ${status?.length || 0} status encontrados:`);
        status?.forEach(s => {
            console.log(`  - ID: ${s.id}, Nome: ${s.nome}, Ativo: ${s.ativo}`);
        });
        
        // Se não há dados, inserir status padrão
        if (!status || status.length === 0) {
            console.log('🔄 Inserindo status padrão...');
            
            const defaultStatus = [
                { nome: 'agendado', descricao: 'Evento agendado', ativo: true },
                { nome: 'confirmado', descricao: 'Evento confirmado', ativo: true },
                { nome: 'pendente', descricao: 'Evento pendente', ativo: true },
                { nome: 'cancelado', descricao: 'Evento cancelado', ativo: true }
            ];
            
            const { data: inserted, error: insertError } = await supabase
                .from('status_agendamento')
                .insert(defaultStatus)
                .select();
                
            if (insertError) {
                console.error('❌ Erro ao inserir status padrão:', insertError);
                return;
            }
            
            console.log('✅ Status padrão inseridos:', inserted.length);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkStatusTable();
