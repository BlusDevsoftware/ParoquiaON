const { supabase } = require('./src/config/supabase');

async function testAgendaFix() {
    console.log('🔄 Testando correção da consulta de agenda...');
    
    try {
        // Testar a consulta corrigida
        const { data, error } = await supabase
            .from('agendamentos')
            .select(`
                *,
                locais (
                    id,
                    nome
                ),
                acoes (
                    id,
                    nome
                ),
                pessoas!responsavel_id (
                    id,
                    nome
                ),
                comunidades (
                    id,
                    nome
                ),
                pastorais (
                    id,
                    nome
                ),
                pilares (
                    id,
                    nome
                ),
                usuarios!usuario_lancamento_id (
                    id,
                    email
                ),
                status_agendamento!fk_agendamentos_status_id (
                    id,
                    nome,
                    descricao
                )
            `)
            .limit(5);
            
        if (error) {
            console.error('❌ Erro na consulta corrigida:', error);
            return;
        }
        
        console.log(`✅ Consulta funcionou! ${data?.length || 0} agendamentos encontrados`);
        console.log('📋 Primeiro agendamento:', data?.[0]);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testAgendaFix();
