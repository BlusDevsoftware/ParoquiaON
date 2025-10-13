// Aplicar proteção de autenticação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Aplicando proteção de autenticação...');
    
    // Verificar se o sistema de autenticação está habilitado
    if (typeof window.authGuard !== 'undefined') {
        console.log('✅ Sistema de autenticação disponível');
        
        // Aplicar proteção em todas as páginas
        if (window.authGuard.protectPage) {
            window.authGuard.protectPage();
        }
    } else {
        console.log('⚠️ Sistema de autenticação não disponível - acesso livre');
    }
});