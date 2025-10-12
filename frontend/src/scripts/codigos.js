// Função para gerar código sequencial
function gerarCodigo(tipo) {
    const chave = `ultimoCodigo${tipo}`;
    const ultimoCodigo = localStorage.getItem(chave) || '00000';
    const novoCodigo = String(parseInt(ultimoCodigo) + 1).padStart(5, '0');
    localStorage.setItem(chave, novoCodigo);
    return novoCodigo;
}

// Função para abrir modal e gerar código
function openModal(tipo) {
    const modal = document.getElementById(`${tipo}Modal`);
    const codigoInput = document.getElementById('codigo');
    
    if (codigoInput) {
        codigoInput.value = gerarCodigo(tipo);
    }
    
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error(`Modal ${tipo}Modal não encontrado`);
    }
}

// Função para fechar modal
function closeModal(tipo) {
    const modal = document.getElementById(`${tipo}Modal`);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para salvar o último código usado
function salvarUltimoCodigo(tipo, codigo) {
    const chave = `ultimoCodigo${tipo}`;
    localStorage.setItem(chave, codigo);
}

// Função de logout
function logout() {
    // Limpa o token de autenticação
    localStorage.removeItem('token');
    // Redireciona para a página de login
    window.location.href = 'index.html';
}

// Exportar funções para uso em outros arquivos
window.gerarCodigo = gerarCodigo;
window.openModal = openModal;
window.closeModal = closeModal;
window.salvarUltimoCodigo = salvarUltimoCodigo; 