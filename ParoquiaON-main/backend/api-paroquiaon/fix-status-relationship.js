const { supabase } = require('./src/config/supabase');

async function fixStatusRelationship() {
    console.log('🔄 Verificando e corrigindo relacionamento status_agendamento...');
    
    try {
        // 1. Verificar se a tabela status_agendamento existe
        const { data: statusTable, error: statusError } = await supabase
            .from('status_agendamento')
            .select('id, nome')
            .limit(1);
            
        if (statusError) {
            console.log('❌ Tabela status_agendamento não existe ou não está acessível:', statusError.message);
            
            // Criar a tabela se não existir
            console.log('🔄 Tentando criar tabela status_agendamento...');
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS status_agendamento (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(50) NOT NULL UNIQUE,
                    descricao TEXT,
                    ativo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            
            const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
            if (createError) {
                console.error('❌ Erro ao criar tabela:', createError);
                return;
            }
            console.log('✅ Tabela status_agendamento criada');
        } else {
            console.log('✅ Tabela status_agendamento existe');
        }
        
        // 2. Verificar se existem dados na tabela status_agendamento
        const { data: statusData, error: statusDataError } = await supabase
            .from('status_agendamento')
            .select('*')
            .order('id');
            
        if (statusDataError) {
            console.error('❌ Erro ao buscar dados da tabela status:', statusDataError);
            return;
        }
        
        console.log(`📋 Status encontrados: ${statusData?.length || 0}`);
        
        // 3. Se não há dados, inserir status padrão
        if (!statusData || statusData.length === 0) {
            console.log('🔄 Inserindo status padrão...');
            
            const defaultStatus = [
                { nome: 'agendado', descricao: 'Evento agendado, aguardando confirmação', ativo: true },
                { nome: 'confirmado', descricao: 'Evento confirmado e aprovado', ativo: true },
                { nome: 'pendente', descricao: 'Evento pendente de aprovação', ativo: true },
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
            statusData = inserted;
        }
        
        // 4. Verificar se a coluna status_id existe na tabela agendamentos
        const { data: agendamentosTest, error: agendamentosError } = await supabase
            .from('agendamentos')
            .select('id, status_id')
            .limit(1);
            
        if (agendamentosError) {
            console.log('❌ Erro ao acessar tabela agendamentos:', agendamentosError.message);
            
            // Tentar adicionar a coluna status_id se não existir
            console.log('🔄 Tentando adicionar coluna status_id...');
            const addColumnSQL = `
                ALTER TABLE agendamentos 
                ADD COLUMN IF NOT EXISTS status_id INTEGER;
            `;
            
            const { error: addColumnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
            if (addColumnError) {
                console.error('❌ Erro ao adicionar coluna status_id:', addColumnError);
            } else {
                console.log('✅ Coluna status_id adicionada');
            }
        } else {
            console.log('✅ Tabela agendamentos acessível');
        }
        
        // 5. Atualizar registros existentes que não têm status_id
        console.log('🔄 Atualizando registros sem status_id...');
        const { data: updatedRecords, error: updateError } = await supabase
            .from('agendamentos')
            .update({ status_id: 1 }) // Padrão: agendado
            .is('status_id', null)
            .select('id');
            
        if (updateError) {
            console.log('⚠️ Aviso ao atualizar registros:', updateError.message);
        } else {
            console.log(`✅ ${updatedRecords?.length || 0} registros atualizados`);
        }
        
        // 6. Testar uma consulta simples
        console.log('🔄 Testando consulta simples...');
        const { data: testData, error: testError } = await supabase
            .from('agendamentos')
            .select(`
                id,
                titulo,
                status_id,
                status_agendamento!agendamentos_status_id_fkey (
                    id,
                    nome
                )
            `)
            .limit(3);
            
        if (testError) {
            console.error('❌ Erro na consulta de teste:', testError);
            
            // Tentar com relacionamento mais específico
            console.log('🔄 Tentando consulta alternativa...');
            const { data: altData, error: altError } = await supabase
                .from('agendamentos')
                .select(`
                    id,
                    titulo,
                    status_id
                `)
                .limit(3);
                
            if (altError) {
                console.error('❌ Erro na consulta alternativa:', altError);
            } else {
                console.log('✅ Consulta alternativa funcionou');
                console.log('📋 Dados encontrados:', altData?.length || 0);
            }
        } else {
            console.log('✅ Consulta de teste funcionou');
            console.log('📋 Dados encontrados:', testData?.length || 0);
        }
        
        console.log('✅ Verificação concluída');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

fixStatusRelationship();
