/**
 * Mobile Menu JavaScript
 * Gerencia o menu flutuante mobile para todas as páginas
 */

// Função para toggle do menu mobile
function toggleMobileMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const menuContainer = document.getElementById('mobileMenuContainer');
    const menuFab = document.getElementById('mobileMenuFab');
    
    if (!menuContainer || !menuFab) return;
    
    if (menuContainer.classList.contains('show')) {
        menuContainer.classList.remove('show');
        menuFab.classList.remove('active');
        menuFab.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
        menuContainer.classList.add('show');
        menuFab.classList.add('active');
        menuFab.innerHTML = '<i class="fas fa-times"></i>';
    }
}

// Função para fechar menu mobile ao clicar fora
function closeMobileMenuOnClickOutside(event) {
    // Só executa em mobile
    if (window.innerWidth > 768) return;
    
    const menuContainer = document.getElementById('mobileMenuContainer');
    const menuFab = document.getElementById('mobileMenuFab');
    
    // Verifica se os elementos existem e o menu está aberto
    if (!menuContainer || !menuFab || !menuContainer.classList.contains('show')) return;
    
    // Verifica se o clique foi fora do menu e do botão
    if (!menuContainer.contains(event.target) && !menuFab.contains(event.target)) {
        menuContainer.classList.remove('show');
        menuFab.classList.remove('active');
        menuFab.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

// Função para marcar o link ativo baseado na página atual
function setActiveMobileMenuLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const mobileLinks = document.querySelectorAll('.mobile-menu-link');
    
    mobileLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Event listener no botão mobile
    const menuFab = document.getElementById('mobileMenuFab');
    if (menuFab) {
        menuFab.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            toggleMobileMenu(event);
        });
    }
    
    // Event listener para fechar ao clicar fora
    document.addEventListener('click', closeMobileMenuOnClickOutside);
    
    // Marcar link ativo
    setActiveMobileMenuLink();
    
    // Fechar menu ao redimensionar a janela
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const menuContainer = document.getElementById('mobileMenuContainer');
            const menuFab = document.getElementById('mobileMenuFab');
            
            if (menuContainer && menuFab) {
                menuContainer.classList.remove('show');
                menuFab.classList.remove('active');
                menuFab.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
});
