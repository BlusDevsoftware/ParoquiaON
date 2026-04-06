// Configuração do Supabase
import { createClient } from '@supabase/supabase-js'

// URLs e chaves do Supabase (substitua pelas suas)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configurações adicionais
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
}

// Funções auxiliares
export const auth = {
  // Fazer login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Verificar se está autenticado
  async isAuthenticated() {
    const user = await this.getCurrentUser()
    return !!user
  }
}

// Funções de banco de dados
export const database = {
  // Buscar dados
  async select(table, columns = '*', filters = {}) {
    let query = supabase.from(table).select(columns)
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    return { data, error }
  },

  // Inserir dados
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    return { data: result, error }
  },

  // Atualizar dados
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    return { data: result, error }
  },

  // Deletar dados
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    return { error }
  }
}

export default supabase
