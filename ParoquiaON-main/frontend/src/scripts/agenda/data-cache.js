// Data cache and loaders for Agenda - attach to window.AgendaCache
(function() {
  if (!window.api || !window.endpoints) {
    console.error('AgendaCache: window.api or window.endpoints not available');
    return;
  }

  const cache = {
    comunidades: null,
    pastorais: null,
    pilares: null,
    acoes: null,
    locais: null,
    status: null
  };

  async function loadList(key, endpoint) {
    if (Array.isArray(cache[key]) && cache[key].length) return cache[key];
    const { data, error } = await window.api.get(endpoint);
    if (error) throw error;
    const list = Array.isArray(data) ? data : [];
    cache[key] = list;
    return list;
  }

  function getStatusIdByName(statusName) {
    if (!statusName) return 1;
    const list = cache.status || [];
    const status = list.find(s => s.nome === statusName);
    return status ? status.id : 1;
  }

  async function comunidades() { return loadList('comunidades', window.endpoints.comunidades.list); }
  async function pastorais() { return loadList('pastorais', window.endpoints.pastorais.list); }
  async function pilares() { return loadList('pilares', window.endpoints.pilares.list); }
  async function acoes() { return loadList('acoes', window.endpoints.acoes.list); }
  async function locais() { return loadList('locais', window.endpoints.locais.list); }
  async function status() { return loadList('status', window.endpoints.statusAgendamento.list); }

  window.AgendaCache = {
    cache,
    comunidades,
    pastorais,
    pilares,
    acoes,
    locais,
    status,
    getStatusIdByName
  };
})();


