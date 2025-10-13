// Aplicar proteção de autenticação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Aplicando proteção de autenticação...');
    
    // Verificar se o sistema de autenticação está habilitado
    if (typeof window.authGuard !== 'undefined' && window.authGuard.isEnabled()) {
        console.log('✅ Sistema de autenticação habilitado');
        
        // Aplicar proteção em todas as páginas
        window.authGuard.protectPage();
    } else {
        console.log('⚠️ Sistema de autenticação desabilitado - acesso livre');
    }
});