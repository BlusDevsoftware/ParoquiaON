// Agenda selects population - attach to window.AgendaSelects
(function() {
  function fillSelect(selectEl, list, placeholder) {
    if (!selectEl) return;
    const options = [
      `<option value="">${placeholder}</option>`
    ].concat(
      (list || []).map(item => `<option value="${item.id}">${item.nome || item.titulo || item.descricao || 'Registro'}</option>`)
    );
    selectEl.innerHTML = options.join('');
  }

  async function populateSelectsForModal() {
    if (!window.api || !window.endpoints) return;
    try {
      // Fetch all lists in parallel from API (no cache)
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


