// Função para inicializar o menu
function initializeMenu() {
    // Adiciona evento de clique para os itens do menu com submenu
    const submenuTriggers = document.querySelectorAll('.submenu-trigger');
    submenuTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Fecha todos os outros submenus
            document.querySelectorAll('.has-submenu').forEach(menu => {
                if (menu !== this.parentElement) {
                    menu.classList.remove('active');
                }
            });
            
            // Toggle do submenu atual
            const parent = this.parentElement;
            parent.classList.toggle('active');
        });
    });

    // Adiciona evento de clique para os links do menu
    document.querySelectorAll('.nav-menu a:not(.submenu-trigger)').forEach(link => {
        link.addEventListener('click', function(e) {
            // Não previne o comportamento padrão do link
            // Apenas atualiza as classes de estilo
            document.querySelectorAll('.nav-menu a').forEach(otherLink => {
                otherLink.classList.remove('active');
            });
            this.classList.add('active');
            
            const parentSubmenu = this.closest('.has-submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('active');
            }
        });
    });

    // Marca o item atual como ativo
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-menu a').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || href === './' + currentPage || href === '/' + currentPage) {
            item.classList.add('active');
            const parentSubmenu = item.closest('.has-submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('active');
            }
        }
    });

    // Adiciona evento de clique no documento para fechar submenus quando clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.has-submenu')) {
            document.querySelectorAll('.has-submenu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });

    // Abre o submenu do item ativo por padrão
    const activeItem = document.querySelector('.nav-menu a.active');
    if (activeItem) {
        const parentSubmenu = activeItem.closest('.has-submenu');
        if (parentSubmenu) {
            parentSubmenu.classList.add('active');
        }
    }
}

// Inicializa o menu quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeMenu); 