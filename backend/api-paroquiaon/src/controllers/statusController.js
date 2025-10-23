const { supabase } = require('../config/supabase');

async function listarStatus(req, res) {
    try {
        console.log('🔄 Listando status de agendamento...');
        
        const { data, error } = await supabase
            .from('status_agendamento')
            .select('*')
            .eq('ativo', true)
            .order('id', { ascending: true });
            
        if (error) {
            console.error('❌ Erro ao listar status:', error);
            throw error;
        }
        
        console.log(`✅ ${data?.length || 0} status encontrados`);
        res.json(data || []);
    } catch (error) {
        console.error('❌ Erro ao listar status:', error);
        res.status(500).json({ 
            error: 'Erro ao listar status',
            details: error.message 
        });
    }
}

async function buscarStatus(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('status_agendamento')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Status não encontrado' });
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar status:', error);
        res.status(500).json({ error: 'Erro ao buscar status' });
    }
}

module.exports = { 
    listarStatus, 
    buscarStatus
};
