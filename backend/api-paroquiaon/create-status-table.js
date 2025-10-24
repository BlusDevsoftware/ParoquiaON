const { supabase } = require('./src/config/supabase');

async function createStatusTable() {
    console.log('🔄 Criando tabela status_agendamento...');
    
    try {
        // SQL para criar a tabela status_agendamento
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS status_agendamento (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(50) NOT NULL,
                descricao TEXT,
                ativo BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        const { data: createResult, error: createError } = await supabase
            .rpc('exec_sql', { sql: createTableSQL });
            
        if (createError) {
            console.error('❌ Erro ao criar tabela:', createError);
            console.log('🔧 Tentando método alternativo...');
            
            // Método alternativo: inserir dados diretamente
            await insertStatusData();
            return;
        }
        
        console.log('✅ Tabela criada com sucesso');
        
        // Inserir dados padrão
        await insertStatusData();
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        console.log('🔧 Tentando inserir dados diretamente...');
        await insertStatusData();
    }
}

async function insertStatusData() {
    console.log('🔄 Inserindo dados padrão de status...');
    
    try {
        // Dados padrão de status
        const statusData = [
            { nome: 'Agendado', descricao: 'Evento agendado', ativo: true },
            { nome: 'Confirmado', descricao: 'Evento confirmado', ativo: true },
            { nome: 'Pendente', descricao: 'Evento pendente', ativo: true },
            { nome: 'Cancelado', descricao: 'Evento cancelado', ativo: true },
            { nome: 'Concluído', descricao: 'Evento concluído', ativo: true }
        ];
        
        // Tentar inserir um por vez
        for (const status of statusData) {
            const { data, error } = await supabase
                .from('status_agendamento')
                .insert([status])
                .select();
                
            if (error) {
                console.log(`⚠️ Erro ao inserir ${status.nome}:`, error.message);
            } else {
                console.log(`✅ ${status.nome} inserido com sucesso`);
            }
        }
        
        // Verificar se os dados foram inseridos
        const { data: checkData, error: checkError } = await supabase
            .from('status_agendamento')
            .select('*');
            
        if (checkError) {
            console.log('❌ Erro ao verificar dados inseridos:', checkError);
        } else {
            console.log(`✅ ${checkData?.length || 0} status encontrados na tabela`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao inserir dados:', error);
    }
}

// Executar criação
createStatusTable();
