// Aplicar proteção de autenticação e ajustar UI por permissões
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Aplicando proteção de autenticação...');
    
    if (typeof window.authGuard !== 'undefined') {
        console.log('✅ Sistema de autenticação disponível');
        const maybePromise = window.authGuard && window.authGuard.protectPage ? window.authGuard.protectPage() : true;
        Promise.resolve(maybePromise).then(function() {
            try { 
                aplicarPermissoesNoMenu();
                // Aguardar um pouco para garantir que o template do menu foi carregado
                setTimeout(function() {
                    atualizarAvatarUsuario();
                    configurarDropdownAvatar();
                }, 100);
            } catch (e) {
                console.error('Erro ao aplicar proteção:', e);
            }
        });
    } else {
        console.log('⚠️ Sistema de autenticação não disponível - acesso livre');
        // Tentar configurar mesmo sem auth guard (pode ser modo desenvolvimento)
        setTimeout(function() {
            configurarDropdownAvatar();
        }, 100);
    }
});

// Atualizar avatar do usuário no menu superior
function atualizarAvatarUsuario() {
    const user = window.authGuard ? window.authGuard.getCurrentUser() : null;
    if (!user) {
        console.warn('Usuário não encontrado para atualizar avatar');
        return;
    }
    
    const nome = user.nome || user.email || 'U';
    const inicial = nome.charAt(0).toUpperCase();
    const email = user.email || '';
    const foto = user.foto || user.avatar || user.pessoa?.foto || null;
    
    console.log('Atualizando avatar:', { nome, email, temFoto: !!foto });
    
    // Função para atualizar avatar (com foto ou inicial)
    function atualizarElementoAvatar(el, tamanho) {
        if (!el) {
            console.warn('Elemento de avatar não encontrado');
            return;
        }
        if (foto && foto.trim() !== '') {
            // Limpar conteúdo anterior
            el.innerHTML = '';
            el.style.background = '';
            el.style.color = '';
            
            const img = document.createElement('img');
            img.src = foto;
            img.alt = nome;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            img.onerror = function() {
                console.warn('Erro ao carregar foto do usuário:', foto);
                el.innerHTML = inicial;
                el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
                el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
            };
            el.appendChild(img);
        } else {
            el.innerHTML = inicial;
            el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
            el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
            // Remover imagens se houver
            const img = el.querySelector('img');
            if (img) img.remove();
        }
    }
    
    // Atualizar avatar principal
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        atualizarElementoAvatar(avatar, 'small');
    } else {
        console.warn('Avatar principal não encontrado');
    }
    
    // Atualizar dropdown
    const dropdownAvatar = document.getElementById('userDropdownAvatar');
    if (dropdownAvatar) {
        atualizarElementoAvatar(dropdownAvatar, 'large');
    } else {
        console.warn('Avatar do dropdown não encontrado');
    }
    
    const dropdownName = document.getElementById('userDropdownName');
    if (dropdownName) {
        dropdownName.textContent = nome;
    }
    
    const dropdownEmail = document.getElementById('userDropdownEmail');
    if (dropdownEmail) {
        dropdownEmail.textContent = email;
    }
    
    console.log('✅ Avatar atualizado');
}

// Configurar dropdown do avatar
let avatarClickHandler = null;
let documentClickHandler = null;

function configurarDropdownAvatar() {
    const avatarDropdown = document.querySelector('.user-avatar-dropdown');
    const avatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!avatarDropdown || !avatar) {
        console.warn('Elementos do avatar não encontrados:', { avatarDropdown, avatar });
        return;
    }
    
    // Remover event listeners anteriores se existirem
    if (avatarClickHandler && avatar) {
        avatar.removeEventListener('click', avatarClickHandler);
    }
    if (documentClickHandler) {
        document.removeEventListener('click', documentClickHandler);
    }
    
    // Toggle dropdown ao clicar no avatar
    avatarClickHandler = function(e) {
        e.stopPropagation();
        e.preventDefault();
        avatarDropdown.classList.toggle('active');
        console.log('Avatar clicado, dropdown:', avatarDropdown.classList.contains('active'));
    };
    avatar.addEventListener('click', avatarClickHandler);
    
    // Fechar dropdown ao clicar fora
    documentClickHandler = function(e) {
        if (avatarDropdown && !avatarDropdown.contains(e.target)) {
            avatarDropdown.classList.remove('active');
        }
    };
    document.addEventListener('click', documentClickHandler);
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
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
    
    console.log('✅ Dropdown do avatar configurado');
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