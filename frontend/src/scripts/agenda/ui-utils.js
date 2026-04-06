// UI utilities for Agenda - attach to window.AgendaUI
(function() {
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  function updateRecentAppointments(events) {
    const appointmentsList = document.getElementById('recentAppointmentsList');
    if (!appointmentsList) return;
    appointmentsList.innerHTML = '';
    // Ordenar por data de criação (created_at) em ordem decrescente (mais recentes primeiro)
    const sortedEvents = [...events].sort((a, b) => {
      const getCreatedTime = (ev) => {
        const created = ev.created_at || ev.createdAt || ev.data_criacao || ev.dataCriacao || 0;
        return created ? new Date(created).getTime() : 0;
      };
      return getCreatedTime(b) - getCreatedTime(a); // Descendente: mais recentes primeiro
    });
    const recentEvents = sortedEvents.slice(0, 10);
    if (recentEvents.length === 0) {
      appointmentsList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <i class="fas fa-calendar-plus" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
          Nenhum agendamento encontrado
        </div>
      `;
      return;
    }
    recentEvents.forEach(event => {
      const eventDate = new Date(event.startTime);
      const timeString = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateString = eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      // status indicator removed from card UI

      const communityName = (event.comunidades && event.comunidades.nome) || event.comunidade_nome || 'Comunidade';
      const communityPhoto = (event.comunidades && (event.comunidades.foto || event.comunidades.logo || event.comunidades.imagem)) || event.comunidade_foto || event.comunidade_logo || null;
      const initials = String(communityName || '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase();

      const appointmentItem = document.createElement('div');
      appointmentItem.className = 'appointment-item';
      appointmentItem.innerHTML = `
        <div style="width:32px; height:32px; border-radius:50%; overflow:hidden; flex:0 0 32px; display:flex; align-items:center; justify-content:center; background:#fff; border:2px solid ${event.color || '#1e3a8a'}; color:${event.color || '#1e3a8a'}; font-weight:700; font-size:12px;">
          ${communityPhoto ? `<img src="${communityPhoto}" alt="${communityName}" style="width:100%; height:100%; object-fit:cover;" />` : initials}
        </div>
        <div class="appointment-details" style="display:flex; flex-direction:column; gap:2px;">
          <div class="appointment-title">${event.title || 'Agendamento'}</div>
          <div class="appointment-type" style="display:flex; gap:6px; align-items:center; color:#666;">
            <span style="color:#1e3a8a; font-weight:600;">${communityName}</span>
            <span>• ${dateString}</span>
            <span>• ${timeString}</span>
          </div>
        </div>
      `;
      appointmentItem.addEventListener('click', () => {
        if (typeof window.editEvent === 'function') window.editEvent(event);
      });
      appointmentsList.appendChild(appointmentItem);
    });
  }

  window.AgendaUI = { showToast, updateRecentAppointments };
})();


