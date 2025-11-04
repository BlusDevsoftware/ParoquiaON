// Função para aguardar elemento estar disponível
function aguardarElemento(seletor, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const inicio = Date.now();
        const check = () => {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                resolve(elemento);
            } else if (Date.now() - inicio < timeout) {
                setTimeout(check, 100);
            } else {
                reject(new Error(`Elemento ${seletor} não encontrado após ${timeout}ms`));
            }
        };
        check();
    });
}

// Cache de dados do usuário para exibição imediata
let cachedUserData = null;

// Carregar dados do cache imediatamente
(function() {
    try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
            cachedUserData = JSON.parse(userData);
        }
    } catch(e) {}
})();

// Aplicar proteção de autenticação e ajustar UI por permissões
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Aplicando proteção de autenticação...');
    
    // Atualizar avatar IMEDIATAMENTE com dados do cache (sem esperar verifyToken)
    requestAnimationFrame(function() {
        atualizarAvatarImmediato();
        configurarDropdownAvatar();
    });
    
    if (typeof window.authGuard !== 'undefined') {
        console.log('✅ Sistema de autenticação disponível');
        const maybePromise = window.authGuard && window.authGuard.protectPage ? window.authGuard.protectPage() : true;
        Promise.resolve(maybePromise).then(function() {
            try { 
                aplicarPermissoesNoMenu();
                // Atualizar novamente quando os dados atualizados chegarem do backend
                atualizarAvatarUsuario();
            } catch (e) {
                console.error('Erro ao aplicar proteção:', e);
            }
        });
    } else {
        console.log('⚠️ Sistema de autenticação não disponível - acesso livre');
        // Tentar configurar mesmo sem auth guard (pode ser modo desenvolvimento)
        tentarAtualizarAvatar();
    }
});

// Função para atualizar avatar imediatamente com dados do cache
function atualizarAvatarImmediato() {
    const user = cachedUserData || (window.authGuard ? window.authGuard.getCurrentUser() : null);
    if (!user) return;
    
    const nome = user.nome || user.email || 'U';
    const inicial = nome.charAt(0).toUpperCase();
    const email = user.email || '';
    const foto = user.foto || user.avatar || user.pessoa?.foto || null;
    
    // Atualizar elementos se existirem
    const avatar = document.getElementById('userAvatar');
    const dropdownAvatar = document.getElementById('userDropdownAvatar');
    const dropdownName = document.getElementById('userDropdownName');
    const dropdownEmail = document.getElementById('userDropdownEmail');
    
    if (avatar) {
        // Sempre mostrar inicial primeiro (para evitar tela branca)
        avatar.innerHTML = inicial;
        avatar.style.background = '#ffffff';
        avatar.style.color = '#1e3a8a';
        
        if (foto && foto.trim() !== '') {
            // Pre-carregar imagem e substituir quando estiver pronta
            const img = new Image();
            img.onload = function() {
                avatar.innerHTML = '';
                avatar.style.background = '';
                avatar.style.color = '';
                const imgEl = document.createElement('img');
                imgEl.src = foto;
                imgEl.alt = nome;
                imgEl.style.width = '100%';
                imgEl.style.height = '100%';
                imgEl.style.objectFit = 'cover';
                imgEl.style.borderRadius = '50%';
                avatar.appendChild(imgEl);
            };
            img.onerror = function() {
                // Manter inicial se foto falhar
                avatar.innerHTML = inicial;
                avatar.style.background = '#ffffff';
                avatar.style.color = '#1e3a8a';
            };
            img.src = foto;
        }
    }
    
    if (dropdownAvatar) {
        // Sempre mostrar inicial primeiro (para evitar tela branca)
        dropdownAvatar.innerHTML = inicial;
        dropdownAvatar.style.background = '#1e3a8a';
        dropdownAvatar.style.color = 'white';
        
        if (foto && foto.trim() !== '') {
            // Pre-carregar imagem e substituir quando estiver pronta
            const img = new Image();
            img.onload = function() {
                dropdownAvatar.innerHTML = '';
                dropdownAvatar.style.background = '';
                dropdownAvatar.style.color = '';
                const imgEl = document.createElement('img');
                imgEl.src = foto;
                imgEl.alt = nome;
                imgEl.style.width = '100%';
                imgEl.style.height = '100%';
                imgEl.style.objectFit = 'cover';
                imgEl.style.borderRadius = '50%';
                dropdownAvatar.appendChild(imgEl);
            };
            img.onerror = function() {
                // Manter inicial se foto falhar
                dropdownAvatar.innerHTML = inicial;
                dropdownAvatar.style.background = '#1e3a8a';
                dropdownAvatar.style.color = 'white';
            };
            img.src = foto;
        }
    }
    
    if (dropdownName) dropdownName.textContent = nome;
    if (dropdownEmail) dropdownEmail.textContent = email;
}

// Função para tentar atualizar avatar várias vezes até conseguir
function tentarAtualizarAvatar() {
    let tentativas = 0;
    const maxTentativas = 10;
    
    const tentar = () => {
        tentativas++;
        const avatar = document.getElementById('userAvatar');
        const avatarDropdown = document.querySelector('.user-avatar-dropdown');
        
        if (avatar && avatarDropdown) {
            atualizarAvatarImmediato();
            configurarDropdownAvatar();
        } else if (tentativas < maxTentativas) {
            setTimeout(tentar, 100); // Reduzido de 200ms para 100ms
        } else {
            console.warn('⚠️ Não foi possível encontrar elementos do avatar após várias tentativas');
            // Tentar criar estrutura se não existir
            criarEstruturaAvatarSeNecessario();
        }
    };
    
    tentar();
}

// Escutar atualizações de dados do usuário
window.addEventListener('userDataUpdated', function(event) {
    if (event.detail) {
        cachedUserData = event.detail;
        atualizarAvatarUsuario();
    }
});

// Função para criar estrutura do avatar se não existir
function criarEstruturaAvatarSeNecessario() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    
    // Verificar se já existe estrutura completa
    let avatarDropdown = document.querySelector('.user-avatar-dropdown');
    if (!avatarDropdown) {
        // Procurar avatar simples
        const avatarSimples = document.querySelector('.user-avatar:not(#userAvatar)');
        if (avatarSimples) {
            // Criar estrutura completa
            avatarDropdown = document.createElement('div');
            avatarDropdown.className = 'user-avatar-dropdown';
            
            const avatar = document.createElement('div');
            avatar.className = 'user-avatar';
            avatar.id = 'userAvatar';
            avatar.textContent = avatarSimples.textContent || 'A';
            
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'user-dropdown-menu';
            dropdownMenu.id = 'userDropdownMenu';
            
            const dropdownHeader = document.createElement('div');
            dropdownHeader.className = 'user-dropdown-header';
            
            const dropdownAvatar = document.createElement('div');
            dropdownAvatar.className = 'user-dropdown-avatar';
            dropdownAvatar.id = 'userDropdownAvatar';
            dropdownAvatar.textContent = avatarSimples.textContent || 'A';
            
            const dropdownInfo = document.createElement('div');
            dropdownInfo.className = 'user-dropdown-info';
            
            const dropdownName = document.createElement('div');
            dropdownName.className = 'user-dropdown-name';
            dropdownName.id = 'userDropdownName';
            dropdownName.textContent = 'Usuário';
            
            const dropdownEmail = document.createElement('div');
            dropdownEmail.className = 'user-dropdown-email';
            dropdownEmail.id = 'userDropdownEmail';
            dropdownEmail.textContent = 'usuario@email.com';
            
            dropdownInfo.appendChild(dropdownName);
            dropdownInfo.appendChild(dropdownEmail);
            dropdownHeader.appendChild(dropdownAvatar);
            dropdownHeader.appendChild(dropdownInfo);
            
            const divider = document.createElement('div');
            divider.className = 'user-dropdown-divider';
            
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'user-dropdown-item logout';
            logoutBtn.id = 'logoutBtn';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Sair</span>';
            
            dropdownMenu.appendChild(dropdownHeader);
            dropdownMenu.appendChild(divider);
            dropdownMenu.appendChild(logoutBtn);
            
            avatarDropdown.appendChild(avatar);
            avatarDropdown.appendChild(dropdownMenu);
            
            // Substituir avatar simples pela estrutura completa
            avatarSimples.parentNode.replaceChild(avatarDropdown, avatarSimples);
            
            console.log('✅ Estrutura do avatar criada dinamicamente');
            
            // Atualizar e configurar
            atualizarAvatarUsuario();
            configurarDropdownAvatar();
        }
    }
}

// Atualizar avatar do usuário no menu superior (com dados atualizados do backend)
function atualizarAvatarUsuario() {
    const user = window.authGuard ? window.authGuard.getCurrentUser() : null;
    if (!user) {
        // Se não encontrou usuário, tentar atualizar com cache
        atualizarAvatarImmediato();
        return;
    }
    
    // Atualizar cache
    cachedUserData = user;
    
    const nome = user.nome || user.email || 'U';
    const inicial = nome.charAt(0).toUpperCase();
    const email = user.email || '';
    const foto = user.foto || user.avatar || user.pessoa?.foto || null;
    
    // Função para atualizar avatar (com foto ou inicial) - versão otimizada
    function atualizarElementoAvatar(el, tamanho) {
        if (!el) return;
        
        // Sempre mostrar inicial primeiro (para evitar tela branca)
        el.innerHTML = inicial;
        el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
        el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
        
        if (foto && foto.trim() !== '') {
            // Verificar se já tem a mesma foto para evitar recarregamento desnecessário
            const imgExistente = el.querySelector('img');
            if (imgExistente && imgExistente.src === foto) {
                return; // Já tem a foto correta, não precisa atualizar
            }
            
            // Pre-carregar imagem e substituir quando estiver pronta
            const img = new Image();
            img.onload = function() {
                el.innerHTML = '';
                el.style.background = '';
                el.style.color = '';
                const imgEl = document.createElement('img');
                imgEl.src = foto;
                imgEl.alt = nome;
                imgEl.style.width = '100%';
                imgEl.style.height = '100%';
                imgEl.style.objectFit = 'cover';
                imgEl.style.borderRadius = '50%';
                el.appendChild(imgEl);
            };
            img.onerror = function() {
                // Manter inicial se foto falhar
                el.innerHTML = inicial;
                el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
                el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
            };
            img.src = foto;
        } else {
            // Remover imagens se houver
            const img = el.querySelector('img');
            if (img) img.remove();
        }
    }
    
    // Atualizar avatar principal
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        atualizarElementoAvatar(avatar, 'small');
    }
    
    // Atualizar dropdown
    const dropdownAvatar = document.getElementById('userDropdownAvatar');
    if (dropdownAvatar) {
        atualizarElementoAvatar(dropdownAvatar, 'large');
    }
    
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