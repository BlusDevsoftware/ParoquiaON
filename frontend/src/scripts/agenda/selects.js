// Agenda selects population - attach to window.AgendaSelects
(function() {
  let modalSelectsCache = null; // cache para evitar refetch ao abrir modal

  function isEntityActive(entity) {
    if (!entity) return false;
    if (Object.prototype.hasOwnProperty.call(entity, 'ativo')) {
      const value = entity.ativo;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['false', '0', 'n', 'nao', 'não', 'inativo'].includes(normalized)) return false;
        if (['true', '1', 's', 'sim', 'ativo'].includes(normalized)) return true;
      }
      if (typeof value === 'number') return value !== 0;
      return Boolean(value);
    }
    const statusValue = entity.status || entity.situacao || entity.situacao_registro || entity.status_registro;
    if (statusValue != null) {
      const normalized = String(statusValue).trim().toLowerCase();
      if (['inativo', 'i', 'false', '0', 'n', 'nao', 'não'].includes(normalized)) return false;
      if (['ativo', 'a', 'true', '1', 's', 'sim'].includes(normalized)) return true;
    }
    return true;
  }

  function fillSelect(selectEl, list, placeholder) {
    if (!selectEl) return;
    const activeList = (list || []).filter(isEntityActive);
    const options = [
      `<option value="">${placeholder}</option>`
    ].concat(
      activeList.map(item => `<option value="${item.id}">${item.nome || item.titulo || item.descricao || 'Registro'}</option>`)
    );
    selectEl.innerHTML = options.join('');
  }

  async function populateSelectsForModal() {
    if (!window.api || !window.endpoints) return;
    try {
      // Usar cache se já carregou (evita delay ao reabrir modal)
      if (modalSelectsCache) {
        const { comunidades, pastorais, pilares, locais, acoes, status } = modalSelectsCache;
        fillSelect(document.getElementById('eventCommunity'), comunidades, 'Selecione a comunidade');
        fillSelect(document.getElementById('eventPastoral'), pastorais, 'Selecione a pastoral');
        fillSelect(document.getElementById('eventPilares'), pilares, 'Selecione o pilar');
        fillSelect(document.getElementById('eventLocation'), locais, 'Selecione o local');
        fillSelect(document.getElementById('eventAcao'), acoes, 'Selecione a ação');
        const statusSelect = document.getElementById('eventStatus');
        if (statusSelect && status) fillSelect(statusSelect, status, 'Selecione o status');
        return;
      }
      const requests = [
        window.api.get(window.endpoints.comunidades.list),
        window.api.get(window.endpoints.pastorais.list),
        window.api.get(window.endpoints.pilares.list),
        window.api.get(window.endpoints.locais.list),
        window.api.get(window.endpoints.acoes.list),
        window.api.get(window.endpoints.statusAgendamento.list).catch(() => ({ data: [] }))
      ];
      const [cRes, pRes, piRes, lRes, aRes, sRes] = await Promise.all(requests);
      const comunidades = Array.isArray(cRes.data) ? cRes.data : [];
      const pastorais = Array.isArray(pRes.data) ? pRes.data : [];
      const pilares = Array.isArray(piRes.data) ? piRes.data : [];
      const locais = Array.isArray(lRes.data) ? lRes.data : [];
      const acoes = Array.isArray(aRes.data) ? aRes.data : [];
      const status = Array.isArray(sRes.data) ? sRes.data : [];
      modalSelectsCache = { comunidades, pastorais, pilares, locais, acoes, status };

      fillSelect(document.getElementById('eventCommunity'), comunidades, 'Selecione a comunidade');
      fillSelect(document.getElementById('eventPastoral'), pastorais, 'Selecione a pastoral');
      fillSelect(document.getElementById('eventPilares'), pilares, 'Selecione o pilar');
      fillSelect(document.getElementById('eventLocation'), locais, 'Selecione o local');
      fillSelect(document.getElementById('eventAcao'), acoes, 'Selecione a ação');

      const statusSelect = document.getElementById('eventStatus');
      if (statusSelect) fillSelect(statusSelect, status, 'Selecione o status');
    } catch (err) {
      console.error('Erro ao popular selects do modal via API:', err);
      [
        ['eventCommunity', 'Selecione a comunidade'],
        ['eventPastoral', 'Selecione a pastoral'],
        ['eventPilares', 'Selecione o pilar'],
        ['eventLocation', 'Selecione o local'],
        ['eventAcao', 'Selecione a ação'],
        ['eventStatus', 'Selecione o status']
      ].forEach(([id, ph]) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<option value="">${ph}</option>`;
      });
    }
  }

  window.AgendaSelects = { populateSelectsForModal };
})();


