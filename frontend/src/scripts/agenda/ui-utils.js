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
    const sortedEvents = [...events].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
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
      let statusClass = 'status-confirmed';
      if (eventDate > new Date() && eventDate.toDateString() === new Date().toDateString()) statusClass = 'status-pending';
      const appointmentItem = document.createElement('div');
      appointmentItem.className = 'appointment-item';
      appointmentItem.innerHTML = `
        <div class="appointment-time" style="background: ${event.color || '#1e3a8a'};">${timeString}</div>
        <div class="appointment-details">
          <div class="appointment-title">${event.title || 'Agendamento'}</div>
          <div class="appointment-type">Agendamento • ${dateString}</div>
        </div>
        <div class="appointment-status ${statusClass}"></div>
      `;
      appointmentItem.addEventListener('click', () => {
        if (typeof window.editEvent === 'function') window.editEvent(event);
      });
      appointmentsList.appendChild(appointmentItem);
    });
  }

  window.AgendaUI = { showToast, updateRecentAppointments };
})();


