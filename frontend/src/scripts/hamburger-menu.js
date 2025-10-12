// Hamburger Menu Toggle Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('[HamburgerMenu] Script carregado');
    
    // Get sidebar and logo elements
    const sidebar = document.querySelector('.sidebar');
    const logo = document.querySelector('.logo');
    
    if (!sidebar || !logo) {
        console.log('[HamburgerMenu] Sidebar ou logo não encontrados');
        return;
    }
    
    // Create hamburger button
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn';
    hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
    hamburgerBtn.title = 'Recolher/Expandir Menu';
    
    // Add button to logo
    logo.appendChild(hamburgerBtn);
    console.log('[HamburgerMenu] Botão hambúrguer adicionado');
    
    // Toggle function
    function toggleSidebar() {
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            hamburgerBtn.classList.toggle('rotated');
            
            // Update button icon
            const icon = hamburgerBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-bars';
                hamburgerBtn.title = 'Expandir Menu';
                console.log('[HamburgerMenu] Sidebar recolhido');
            } else {
                icon.className = 'fas fa-times';
                hamburgerBtn.title = 'Recolher Menu';
                console.log('[HamburgerMenu] Sidebar expandido');
            }
            
            // Store state in localStorage
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }
    
    // Add click event
    hamburgerBtn.addEventListener('click', toggleSidebar);
    
    // Restore state from localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
        hamburgerBtn.classList.add('rotated');
        const icon = hamburgerBtn.querySelector('i');
        icon.className = 'fas fa-bars';
        hamburgerBtn.title = 'Expandir Menu';
        console.log('[HamburgerMenu] Estado restaurado: recolhido');
    }
    
           // Handle submenu clicks when sidebar is collapsed - EXPAND SIDEBAR
           function handleCollapsedSubmenuClick(event) {
               console.log('[HamburgerMenu] Clique em item com submenu detectado');
               
               if (!sidebar.classList.contains('collapsed')) {
                   console.log('[HamburgerMenu] Sidebar já está expandido, ignorando');
                   return;
               }
               
               const clickedItem = event.currentTarget.closest('.has-submenu');
               if (!clickedItem) {
                   console.log('[HamburgerMenu] Item com submenu não encontrado');
                   return;
               }
               
               console.log('[HamburgerMenu] Item clicado:', clickedItem);
               
               event.preventDefault();
               event.stopPropagation();
               
               // EXPAND SIDEBAR automatically
               console.log('[HamburgerMenu] Expandindo sidebar automaticamente...');
               sidebar.classList.remove('collapsed');
               hamburgerBtn.classList.remove('rotated');
               
               // Update button icon
               const icon = hamburgerBtn.querySelector('i');
               icon.className = 'fas fa-times';
               hamburgerBtn.title = 'Recolher Menu';
               
               // Store state in localStorage
               localStorage.setItem('sidebarCollapsed', false);
               
               // Close all submenus first
               const allSubmenus = document.querySelectorAll('.has-submenu');
               allSubmenus.forEach(submenu => {
                   submenu.classList.remove('active');
               });
               
               // Wait a bit for sidebar to expand, then open the clicked submenu
               setTimeout(() => {
                   clickedItem.classList.add('active');
                   console.log('[HamburgerMenu] Submenu aberto após expansão:', clickedItem);
               }, 100);
           }
    
    // Add click listeners to submenu triggers
    function addSubmenuListeners() {
        // Wait a bit to ensure navigation.js has loaded
        setTimeout(() => {
            const submenuTriggers = document.querySelectorAll('.submenu-trigger');
            console.log('[HamburgerMenu] Encontrados', submenuTriggers.length, 'triggers de submenu');
            
            submenuTriggers.forEach((trigger, index) => {
                // Remove existing listeners and add our own
                trigger.removeEventListener('click', handleCollapsedSubmenuClick);
                trigger.addEventListener('click', handleCollapsedSubmenuClick, true); // Use capture phase
                console.log('[HamburgerMenu] Listener adicionado ao trigger', index + 1);
            });
            
            // Also add listeners to the li elements for better click detection
            const submenuItems = document.querySelectorAll('.has-submenu');
            console.log('[HamburgerMenu] Encontrados', submenuItems.length, 'itens com submenu');
            
            submenuItems.forEach((item, index) => {
                // Remove existing listeners and add our own
                item.removeEventListener('click', handleCollapsedSubmenuClick);
                item.addEventListener('click', handleCollapsedSubmenuClick, true); // Use capture phase
                console.log('[HamburgerMenu] Listener adicionado ao item', index + 1);
            });
        }, 100);
    }
    
    // Close submenus when sidebar is expanded
    function closeSubmenus() {
        const submenus = document.querySelectorAll('.has-submenu');
        submenus.forEach(submenu => {
            submenu.classList.remove('active');
        });
    }
    
    // Add observer to watch for sidebar collapse
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (sidebar.classList.contains('collapsed')) {
                    // Don't close submenus when collapsed - allow them to show
                } else {
                    closeSubmenus();
                }
            }
        });
    });
    
    if (sidebar) {
        observer.observe(sidebar, { attributes: true });
        addSubmenuListeners();
    }
    
    // Close submenus when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar.classList.contains('collapsed')) {
            const isInsideSubmenu = event.target.closest('.submenu') || event.target.closest('.has-submenu');
            if (!isInsideSubmenu) {
                closeSubmenus();
            }
        }
    });
});
