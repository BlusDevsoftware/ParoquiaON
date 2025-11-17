// Agenda API wrapper - attach to window.AgendaAPI
(function() {
  if (!window.api || !window.endpoints) {
    console.error('AgendaAPI: window.api or window.endpoints not available');
    return;
  }

  const { formatLocalDateTime, parseApiDateTime } = window.DateUtils || {};

  function normalizeEvent(ev) {
    if (!ev || typeof ev !== 'object') return ev;
    const startRaw = ev.startTime || ev.start_time || ev.inicio || ev.data_inicio || ev.dataHoraInicio || ev.start || ev.startedAt || ev.inicio_iso || ev.inicioISO || ev.data_inicio_iso || ev.dataInicioISO || ev.start_iso || ev.startISO || ev.startDate || ev.start_date;
    const endRaw = ev.endTime || ev.end_time || ev.fim || ev.data_fim || ev.dataHoraFim || ev.end || ev.endedAt || ev.fim_iso || ev.fimISO || ev.data_fim_iso || ev.dataFimISO || ev.end_iso || ev.endISO || ev.endDate || ev.end_date;
    const startDate = parseApiDateTime ? parseApiDateTime(String(startRaw || '')) : new Date(startRaw);
    const endDate = parseApiDateTime ? parseApiDateTime(String(endRaw || '')) : new Date(endRaw);
    return {
      ...ev,
      startTime: startDate && !isNaN(startDate) ? startDate.toISOString() : startRaw, // keep internal as ISO string for consistency
      endTime: endDate && !isNaN(endDate) ? endDate.toISOString() : endRaw,
    };
  }

  async function list() {
    const { data, error } = await window.api.get(window.endpoints.agenda.list);
    if (error) throw error;
    const lista = Array.isArray(data) ? data : [];
    return lista.map(normalizeEvent);
  }

  async function create(evento) {
    // Expect evento with data_inicio/data_fim already normalized (YYYY-MM-DDTHH:mm:ss)
    return window.api.post(window.endpoints.agenda.create, evento);
  }

  async function update(id, evento) {
    return window.api.put(window.endpoints.agenda.update(id), evento);
  }

  async function remove(id) {
    return window.api.delete(window.endpoints.agenda.delete(id));
  }

  async function byDate(dateYmd) {
    const { data, error } = await window.api.get(window.endpoints.agenda.byDate(dateYmd));
    if (error) throw error;
    return (Array.isArray(data) ? data : []).map(normalizeEvent);
  }

  async function byMonth(month, year) {
    const { data, error } = await window.api.get(window.endpoints.agenda.byMonth(month, year));
    if (error) throw error;
    return (Array.isArray(data) ? data : []).map(normalizeEvent);
  }

  window.AgendaAPI = { list, create, update, remove, byDate, byMonth };
})();


