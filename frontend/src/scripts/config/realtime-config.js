// Configuração centralizada do Realtime
(function ensureRealtimeConfig(){
  if (!window.SUPABASE_URL) {
    window.SUPABASE_URL = 'https://hnxjjsiwptkybhwspmvd.supabase.co';
  }
  if (!window.SUPABASE_ANON_KEY) {
    window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGpqc2l3cHRreWJod3NwbXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MTUsImV4cCI6MjA2NDU0OTgxNX0.C85U2IAaA_OKH1_JCGBagWDQfaIG1FxH_zZupuV8HV4';
  }
  
  window.REALTIME_CONFIG = {
    url: window.SUPABASE_URL,
    anonKey: window.SUPABASE_ANON_KEY,
    tables: ['movimento_comissoes', 'colaboradores', 'clientes', 'pilares', 'servicos'],
    reconnectDelay: 5000,
    maxReconnectAttempts: 10
  };
  
  console.log('[realtime-config] Configuração carregada:', window.REALTIME_CONFIG);
})();