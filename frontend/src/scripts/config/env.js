// Configurações de ambiente
export const env = {
  // Ambiente atual
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // URLs
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // Configurações da aplicação
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ParóquiaON',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  
  // Configurações de desenvolvimento
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Configurações de produção
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  
  // Configurações de build
  BUILD_TIME: new Date().toISOString(),
  BUILD_VERSION: import.meta.env.VITE_BUILD_VERSION || '1.0.0'
}

// Função para verificar se uma variável de ambiente está definida
export function hasEnvVar(name) {
  return import.meta.env[name] !== undefined
}

// Função para obter uma variável de ambiente com valor padrão
export function getEnvVar(name, defaultValue = null) {
  return import.meta.env[name] || defaultValue
}

// Função para validar configurações obrigatórias
export function validateConfig() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = required.filter(key => !hasEnvVar(key))
  
  if (missing.length > 0) {
    console.warn('Variáveis de ambiente obrigatórias não encontradas:', missing)
    return false
  }
  
  return true
}

// Função para log de configurações (apenas em desenvolvimento)
export function logConfig() {
  if (env.IS_DEVELOPMENT) {
    console.log('🔧 Configurações do ambiente:', {
      NODE_ENV: env.NODE_ENV,
      API_URL: env.API_URL,
      APP_NAME: env.APP_NAME,
      APP_VERSION: env.APP_VERSION,
      DEBUG: env.DEBUG
    })
  }
}

// Validar configurações na inicialização
if (env.IS_DEVELOPMENT) {
  validateConfig()
  logConfig()
}

export default env
