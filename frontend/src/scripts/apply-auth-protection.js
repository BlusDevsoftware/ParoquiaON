// Aplicar proteção de autenticação e ajustar UI por permissões
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Aplicando proteção de autenticação...');
    
    if (typeof window.authGuard !== 'undefined') {
        console.log('✅ Sistema de autenticação disponível');
        const maybePromise = window.authGuard && window.authGuard.protectPage ? window.authGuard.protectPage() : true;
        Promise.resolve(maybePromise).then(function() {
            try { 
                aplicarPermissoesNoMenu();
                atualizarAvatarUsuario();
                configurarDropdownAvatar();
            } catch (_) {}
        });
    } else {
        console.log('⚠️ Sistema de autenticação não disponível - acesso livre');
    }
});

// Atualizar avatar do usuário no menu superior
function atualizarAvatarUsuario() {
    const user = window.authGuard ? window.authGuard.getCurrentUser() : null;
    if (!user) return;
    
    const nome = user.nome || user.email || 'U';
    const inicial = nome.charAt(0).toUpperCase();
    const email = user.email || '';
    const foto = user.foto || user.avatar || user.pessoa?.foto || null;
    
    // Função para atualizar avatar (com foto ou inicial)
    function atualizarElementoAvatar(el, tamanho) {
        if (!el) return;
        if (foto) {
            const img = document.createElement('img');
            img.src = foto;
            img.alt = nome;
            img.onerror = function() {
                el.innerHTML = inicial;
                el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
                el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
            };
            el.innerHTML = '';
            el.appendChild(img);
        } else {
            el.innerHTML = inicial;
            el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
            el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
        }
    }
    
    // Atualizar avatar principal
    const avatar = document.getElementById('userAvatar');
    atualizarElementoAvatar(avatar, 'small');
    
    // Atualizar dropdown
    const dropdownAvatar = document.getElementById('userDropdownAvatar');
    atualizarElementoAvatar(dropdownAvatar, 'large');
    
    const dropdownName = document.getElementById('userDropdownName');
    if (dropdownName) {
        dropdownName.textContent = nome;
    }
    
    const dropdownEmail = document.getElementById('userDropdownEmail');
    if (dropdownEmail) {
        dropdownEmail.textContent = email;
    }
}

// Configurar dropdown do avatar
function configurarDropdownAvatar() {
    const avatarDropdown = document.querySelector('.user-avatar-dropdown');
    const avatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!avatarDropdown || !avatar) return;
    
    // Toggle dropdown ao clicar no avatar
    avatar.addEventListener('click', function(e) {
        e.stopPropagation();
        avatarDropdown.classList.toggle('active');
    });
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        if (!avatarDropdown.contains(e.target)) {
            avatarDropdown.classList.remove('active');
        }
    });
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair do sistema?')) {
                if (window.authGuard && typeof window.authGuard.logout === 'function') {
                    window.authGuard.logout();
                } else {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                }
                window.location.href = 'login.html';
            }
        });
    }
}

function aplicarPermissoesNoMenu() {
    const user = window.authGuard ? window.authGuard.getCurrentUser() : null;
    if (!user || !user.permissoes) return;
    const can = function(flag) {
        if (!flag) return true;
        return user.permissoes && user.permissoes[flag] === true;
    };
    const itens = [
        { selector: 'a[href="comunidades.html"]', flag: 'comunidades_ver' },
        { selector: 'a[href="pastorais.html"]', flag: 'pastorais_ver' },
        { selector: 'a[href="pilares.html"]', flag: 'pilares_ver' },
        { selector: 'a[href="locais.html"]', flag: 'locais_ver' },
        { selector: 'a[href="acoes.html"]', flag: 'acoes_ver' },
        { selector: 'a[href="pessoas.html"]', flag: 'pessoas_ver' },
        { selector: 'a[href="usuarios.html"]', flag: 'usuarios_ver' },
        { selector: 'a[href="perfil.html"]', flag: 'perfis_ver' },
        { selector: 'a[href="recebimento.html"]', flag: 'relatorios_ver' },
        { selector: 'a[href="conferencia.html"]', flag: 'relatorios_ver' },
        { selector: 'a[href="dinamico.html"]', flag: 'relatorios_ver' }
    ];
    itens.forEach(function(item) {
        var el = document.querySelector(item.selector);
        if (el && !can(item.flag)) {
            var container = el.closest('li') || el;
            container.style.display = 'none';
        }
    });
}