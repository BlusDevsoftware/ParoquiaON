// Script para adicionar modal de logout a todas as páginas
(function() {
    // Verificar se o modal já existe
    if (document.getElementById('logoutModal')) {
        return;
    }

    // Criar o modal
    const modalHTML = `
        <!-- Modal de Confirmação de Saída -->
        <div id="logoutModal" class="logout-modal">
            <div class="logout-modal-content">
                <div class="logout-modal-header">
                    <h2><i class="fas fa-sign-out-alt"></i> Confirmar Saída</h2>
                    <button class="logout-close-btn" onclick="closeLogoutModal()">&times;</button>
                </div>
                <div class="logout-modal-body">
                    <div class="logout-icon">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <div class="logout-message">
                        Tem certeza que deseja sair do sistema?
                    </div>
                    <div class="logout-warning">
                        Você será redirecionado para a tela de login.
                    </div>
                </div>
                <div class="logout-modal-actions">
                    <button class="logout-btn-cancel" onclick="closeLogoutModal()">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                    <button class="logout-btn-confirm" onclick="confirmLogout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Sair
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adicionar o modal ao final do body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adicionar event listener para fechar modal ao clicar fora
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('logoutModal');
        if (event.target === modal) {
            closeLogoutModal();
        }
    });

    // Adicionar event listener para ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('logoutModal');
            if (modal && modal.style.display === 'flex') {
                closeLogoutModal();
            }
        }
    });
})();
