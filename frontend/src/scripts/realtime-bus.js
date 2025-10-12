// Realtime Bus - Sistema de sincronização em tempo real DESABILITADO
(function realtimeBus(){
  if (window.realtimeBus) return;
  
  console.log('[realtime-bus] Sistema de realtime desabilitado - sem recarregamentos automáticos');
  return; // Desabilita todo o sistema de realtime

  const config = window.REALTIME_CONFIG || {
    url: 'https://hnxjjsiwptkybhwspmvd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGpqc2l3cHRreWJod3NwbXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MTUsImV4cCI6MjA2NDU0OTgxNX0.C85U2IAaA_OKH1_JCGBagWDQfaIG1FxH_zZupuV8HV4',
    tables: ['movimento_comissoes', 'colaboradores', 'clientes', 'pilares', 'servicos'],
    reconnectDelay: 5000,
    maxReconnectAttempts: 10
  };

  const state = {
    supabase: null,
    channels: new Map(),
    connected: false,
    reconnectAttempts: 0,
    reconnectTimer: null
  };

  function dispatch(name, detail) {
    try { 
      window.dispatchEvent(new CustomEvent(name, { detail })); 
      console.log(`[realtime-bus] Evento disparado: ${name}`, detail);
    } catch (e) { 
      console.error('[realtime-bus] Erro ao disparar evento:', e);
    }
  }

  function initClient() {
    console.log('[realtime-bus] Inicializando cliente Supabase...');
    
    if (!window.supabase || !window.supabase.createClient) {
      console.error('[realtime-bus] Supabase JS não encontrado. Carregando CDN...');
      loadSupabaseCDN();
      return null;
    }
    
    try {
      state.supabase = window.supabase.createClient(config.url, config.anonKey);
      console.log('[realtime-bus] Cliente Supabase criado com sucesso');
      return state.supabase;
    } catch (error) {
      console.error('[realtime-bus] Erro ao criar cliente Supabase:', error);
      return null;
    }
  }

  function loadSupabaseCDN() {
    if (document.querySelector('script[src*="supabase-js"]')) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      console.log('[realtime-bus] Supabase CDN carregado, reinicializando...');
      initClient();
    };
    document.head.appendChild(script);
  }

  function subscribeTable(table) {
    if (state.channels.has(table)) {
      console.log(`[realtime-bus] Tabela ${table} já está sendo monitorada`);
      return state.channels.get(table);
    }
    
    if (!state.supabase && !initClient()) {
      console.error(`[realtime-bus] Não foi possível inicializar cliente para ${table}`);
      return null;
    }

    console.log(`[realtime-bus] Assinando tabela: ${table}`);
    
    const channel = state.supabase
      .channel(`${table}-realtime-${Date.now()}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table 
      }, (payload) => {
        console.log(`[realtime-bus] Evento recebido para ${table}:`, payload);
        dispatch(`db:${table}`, payload);
        dispatch('realtime:data', { table, payload });
      })
      .subscribe((status, err) => {
        console.log(`[realtime-bus] Status da conexão para ${table}:`, status);
        
        if (err) {
          console.error(`[realtime-bus] Erro na conexão para ${table}:`, err);
        }
        
        state.connected = status === 'SUBSCRIBED';
        dispatch('realtime:status', { 
          connected: state.connected, 
          table, 
          status, 
          error: err 
        });
        
        // Reset reconnect attempts on successful connection
        if (status === 'SUBSCRIBED') {
          state.reconnectAttempts = 0;
        }
        
        // Handle connection errors
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          handleConnectionError(table);
        }
      });

    state.channels.set(table, channel);
    return channel;
  }

  function handleConnectionError(table) {
    if (state.reconnectAttempts >= config.maxReconnectAttempts) {
      console.error(`[realtime-bus] Máximo de tentativas de reconexão atingido para ${table}`);
      dispatch('realtime:error', { 
        table, 
        message: 'Máximo de tentativas de reconexão atingido' 
      });
      return;
    }

    state.reconnectAttempts++;
    console.log(`[realtime-bus] Tentando reconectar ${table} em ${config.reconnectDelay}ms (tentativa ${state.reconnectAttempts}/${config.maxReconnectAttempts})`);
    
    state.reconnectTimer = setTimeout(() => {
      if (state.channels.has(table)) {
        state.channels.delete(table);
        subscribeTable(table);
      }
    }, config.reconnectDelay);
  }

  function subscribeTables(tables) {
    const tablesToSubscribe = tables || config.tables;
    console.log('[realtime-bus] Iniciando assinaturas para tabelas:', tablesToSubscribe);
    
    tablesToSubscribe.forEach(table => {
      subscribeTable(table);
    });
  }

  function disconnect() {
    console.log('[realtime-bus] Desconectando todas as assinaturas...');
    
    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }
    
    state.channels.forEach((channel, table) => {
      console.log(`[realtime-bus] Desconectando ${table}...`);
      state.supabase?.removeChannel(channel);
    });
    
    state.channels.clear();
    state.connected = false;
    state.reconnectAttempts = 0;
  }

  // API pública
  window.realtimeBus = { 
    subscribeTable, 
    subscribeTables, 
    disconnect,
    isConnected: () => state.connected,
    getChannels: () => Array.from(state.channels.keys())
  };

  // Auto-inicialização quando DOM estiver pronto
  function initialize() {
    console.log('[realtime-bus] Inicializando Realtime Bus...');
    subscribeTables();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Cleanup ao sair da página
  window.addEventListener('beforeunload', disconnect);
})();