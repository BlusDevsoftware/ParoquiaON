const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL e Key são obrigatórios. Verifique as variáveis de ambiente SUPABASE_URL e SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações adicionais do Supabase
const supabaseConfig = {
    url: supabaseUrl,
    key: supabaseKey,
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        db: {
            schema: 'public'
        }
    }
};

// Funções auxiliares para o Supabase
const dbHelpers = {
    // Função para buscar com paginação
    async paginate(table, page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = supabase.from(table).select('*', { count: 'exact' });
        
        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query = query.eq(key, value);
            }
        });
        
        const { data, error, count } = await query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });
            
        return { data, error, count, page, limit, totalPages: Math.ceil(count / limit) };
    },

    // Função para buscar por ID
    async findById(table, id) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();
            
        return { data, error };
    },

    // Função para criar registro
    async create(table, data) {
        const { data: result, error } = await supabase
            .from(table)
            .insert([data])
            .select()
            .single();
            
        return { data: result, error };
    },

    // Função para atualizar registro
    async update(table, id, data) {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single();
            
        return { data: result, error };
    },

    // Função para deletar registro
    async delete(table, id) {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
            
        return { error };
    },

    // Função para buscar com relacionamentos
    async findWithRelations(table, relations = []) {
        let selectQuery = '*';
        if (relations.length > 0) {
            selectQuery = `*, ${relations.join(', ')}`;
        }
        
        const { data, error } = await supabase
            .from(table)
            .select(selectQuery)
            .order('created_at', { ascending: false });
            
        return { data, error };
    }
};

module.exports = {
    supabase,
    supabaseConfig,
    dbHelpers
};