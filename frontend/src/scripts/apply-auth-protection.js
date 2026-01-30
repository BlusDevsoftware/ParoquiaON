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

// Cache de dados do usuário para evitar recarregamento entre páginas
const USER_CACHE_KEY = 'paroquiaon_user_cache';
const USER_PHOTO_CACHE_KEY = 'paroquiaon_user_photo_cache';

// Função para atualizar cache do usuário
function atualizarCacheUsuario(user) {
    if (!user) return;
    
    try {
        // Cache dos dados do usuário
        const cacheData = {
            id: user.id,
            email: user.email,
            nome: user.nome,
            foto: user.foto || user.avatar || user.pessoa?.foto || null,
            perfil: user.perfil,
            permissoes: user.permissoes || {},
            timestamp: Date.now()
        };
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
        
        // Cache separado da foto (se existir) para pré-carregamento rápido
        if (cacheData.foto) {
            sessionStorage.setItem(USER_PHOTO_CACHE_KEY, cacheData.foto);
        }
        
        console.log('✅ Cache do usuário atualizado');
    } catch (e) {
        console.warn('Erro ao atualizar cache:', e);
    }
}

// Função para obter dados do usuário do cache ou do authGuard
function obterDadosUsuario() {
    let user = null;
    
    // Primeiro tentar do authGuard (mais atualizado)
    if (window.authGuard) {
        user = window.authGuard.getCurrentUser();
    }
    
    // Se não tiver dados completos, tentar do cache
    if (!user || !user.nome || !user.foto) {
        try {
            const cached = sessionStorage.getItem(USER_CACHE_KEY);
            if (cached) {
                const cacheData = JSON.parse(cached);
                // Verificar se o cache não está muito antigo (5 minutos)
                const cacheAge = Date.now() - (cacheData.timestamp || 0);
                if (cacheAge < 300000) { // 5 minutos
                    // Mesclar dados do cache com dados do authGuard
                    user = { ...user, ...cacheData };
                }
            }
        } catch (e) {
            console.warn('Erro ao ler cache:', e);
        }
    }
    
    // Atualizar cache se tiver dados novos
    if (user) {
        atualizarCacheUsuario(user);
    }
    
    return user;
}

// Função para pré-carregar imagem da foto
function preloadUserPhoto(photoUrl) {
    if (!photoUrl) return Promise.resolve();
    
    return new Promise((resolve) => {
        // Verificar se já está no cache do navegador
        const img = new Image();
        img.onload = () => {
            console.log('✅ Foto do usuário pré-carregada');
            resolve();
        };
        img.onerror = () => {
            console.warn('⚠️ Erro ao pré-carregar foto');
            resolve(); // Resolve mesmo com erro para não bloquear
        };
        img.src = photoUrl;
    });
}

// Expor função para atualização de cache globalmente
window.atualizarCacheUsuario = atualizarCacheUsuario;

// Aplicar proteção de autenticação e ajustar UI por permissões
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Aplicando proteção de autenticação...');
    
    // Atualizar avatar imediatamente do cache (sem esperar verificação)
    const cachedUser = obterDadosUsuario();
    if (cachedUser) {
        console.log('📦 Usando dados do cache para atualização rápida');
        setTimeout(() => {
            atualizarAvatarUsuario();
            configurarDropdownAvatar();
        }, 50);
    }
    
    if (typeof window.authGuard !== 'undefined') {
        console.log('✅ Sistema de autenticação disponível');
        const maybePromise = window.authGuard && window.authGuard.protectPage ? window.authGuard.protectPage() : true;
        Promise.resolve(maybePromise).then(function() {
            try { 
                aplicarPermissoesNoMenu();
                // Aguardar elementos estarem disponíveis e tentar várias vezes
                // Atualizar com dados frescos do backend após verificação
                tentarAtualizarAvatar();
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

// Função para tentar atualizar avatar várias vezes até conseguir
function tentarAtualizarAvatar() {
    let tentativas = 0;
    const maxTentativas = 10;
    
    const tentar = () => {
        tentativas++;
        const avatar = document.getElementById('userAvatar');
        const avatarDropdown = document.querySelector('.user-avatar-dropdown');
        
        if (avatar && avatarDropdown) {
            atualizarAvatarUsuario();
            configurarDropdownAvatar();
            
            // Pré-carregar foto do usuário para cache do navegador
            const user = obterDadosUsuario();
            if (user) {
                const foto = sessionStorage.getItem(USER_PHOTO_CACHE_KEY) || user.foto || user.avatar || user.pessoa?.foto || null;
                if (foto) {
                    preloadUserPhoto(foto);
                }
            }
        } else if (tentativas < maxTentativas) {
            setTimeout(tentar, 200);
        } else {
            console.warn('⚠️ Não foi possível encontrar elementos do avatar após várias tentativas');
            // Tentar criar estrutura se não existir
            criarEstruturaAvatarSeNecessario();
        }
    };
    
    tentar();
}

// Função para verificar se a estrutura do avatar existe (removida lógica de criação dinâmica)
// Todos os arquivos HTML agora têm a estrutura completa do avatar
function criarEstruturaAvatarSeNecessario() {
    // Esta função foi simplificada - todos os HTMLs já têm a estrutura completa
    // Mantida apenas para compatibilidade com código existente que pode chamá-la
    const avatarDropdown = document.querySelector('.user-avatar-dropdown');
    if (!avatarDropdown) {
        console.warn('⚠️ Estrutura do avatar não encontrada. Certifique-se de que o HTML possui a estrutura completa do user-avatar-dropdown.');
    }
}

// Atualizar avatar do usuário no menu superior
function atualizarAvatarUsuario() {
    // Usar função que busca do cache primeiro
    const user = obterDadosUsuario();
    
    if (!user) {
        console.warn('Usuário não encontrado para atualizar avatar');
        return;
    }
    
    const nome = user.nome || user.email || 'U';
    const inicial = nome.charAt(0).toUpperCase();
    const email = user.email || '';
    // Tentar foto do cache primeiro, depois do usuário
    const fotoCache = sessionStorage.getItem(USER_PHOTO_CACHE_KEY);
    const foto = fotoCache || user.foto || user.avatar || user.pessoa?.foto || null;
    
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
            img.alt = nome;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            // Adicionar atributos para melhor uso do cache do navegador
            img.loading = 'eager'; // Carregar imediatamente
            // Adicionar imagem ao DOM primeiro para permitir carregamento
            el.appendChild(img);
            // Definir src após adicionar ao DOM para melhor cache
            img.src = foto;
            // Verificar se já está carregada (cache do navegador)
            img.onload = function() {
                // Imagem carregada com sucesso (pode ser do cache)
                console.log('✅ Foto carregada');
            };
            img.onerror = function() {
                console.warn('Erro ao carregar foto do usuário:', foto);
                el.innerHTML = inicial;
                el.style.background = tamanho === 'small' ? '#ffffff' : '#1e3a8a';
                el.style.color = tamanho === 'small' ? '#1e3a8a' : 'white';
            };
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
    
    // Botão Adicionar/alterar foto ao perfil
    let addPhotoBtn = document.getElementById('addPhotoBtn');
    if (!addPhotoBtn && avatarDropdown) {
        addPhotoBtn = document.createElement('a');
        addPhotoBtn.href = '#';
        addPhotoBtn.className = 'user-dropdown-item';
        addPhotoBtn.id = 'addPhotoBtn';
        addPhotoBtn.innerHTML = '<i class="fas fa-camera"></i><span>Adicionar foto ao perfil</span>';
        addPhotoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            abrirSeletorFotoPerfil();
        });
        // Inserir antes do logout
        const divider = avatarDropdown.querySelector('.user-dropdown-divider');
        if (divider && divider.nextElementSibling) {
            divider.parentNode.insertBefore(addPhotoBtn, divider.nextElementSibling);
        } else if (logoutBtn) {
            logoutBtn.parentNode.insertBefore(addPhotoBtn, logoutBtn);
        } else {
            avatarDropdown.querySelector('.user-dropdown-menu').appendChild(addPhotoBtn);
        }
    }

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
                    // Limpar cache do usuário
                    sessionStorage.removeItem(USER_CACHE_KEY);
                    sessionStorage.removeItem(USER_PHOTO_CACHE_KEY);
                }
                window.location.href = 'login.html';
            }
        });
    }
    
    console.log('✅ Dropdown do avatar configurado');
}

// Abrir seletor de arquivo para foto do perfil
function abrirSeletorFotoPerfil() {
    const user = obterDadosUsuario();
    if (!user || !user.pessoa_id) {
        const msg = 'Para adicionar foto, é necessário estar vinculado a um cadastro de pessoa. Acesse Usuários para vincular seu usuário a uma pessoa.';
        if (typeof mostrarToast === 'function') {
            mostrarToast(msg, 'error');
        } else if (typeof showToast === 'function') {
            showToast(msg, 'error');
        } else {
            alert(msg);
        }
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.style.display = 'none';
    input.addEventListener('change', async function() {
        const file = this.files && this.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { // 5MB
            const toast = typeof mostrarToast === 'function' ? mostrarToast : (typeof showToast === 'function' ? showToast : function(m) { alert(m); });
            toast('A imagem deve ter no máximo 5MB.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = async function() {
            const base64 = reader.result;
            try {
                const { data, error } = await window.api.put(window.endpoints.pessoas.update(user.pessoa_id), { foto: base64 });
                if (error) throw error;
                const fotoUrl = (data && data.foto) || base64;
                const userAtual = window.authGuard ? window.authGuard.getCurrentUser() : user;
                const userAtualizado = { ...userAtual, foto: fotoUrl };
                if (window.authGuard) {
                    try {
                        const userStr = sessionStorage.getItem('user');
                        const parsed = userStr ? JSON.parse(userStr) : {};
                        parsed.foto = fotoUrl;
                        sessionStorage.setItem('user', JSON.stringify(parsed));
                    } catch (_) {}
                }
                atualizarCacheUsuario(userAtualizado);
                sessionStorage.setItem(USER_PHOTO_CACHE_KEY, fotoUrl);
                atualizarAvatarUsuario();
                const toastOk = typeof mostrarToast === 'function' ? mostrarToast : (typeof showToast === 'function' ? showToast : function(m) { alert(m); });
                toastOk('Foto atualizada com sucesso!', 'success');
                document.querySelector('.user-avatar-dropdown')?.classList.remove('active');
            } catch (err) {
                console.error('Erro ao enviar foto:', err);
                const toastErr = typeof mostrarToast === 'function' ? mostrarToast : (typeof showToast === 'function' ? showToast : function(m) { alert(m); });
                toastErr('Erro ao atualizar foto. Tente novamente.', 'error');
            }
        };
        reader.readAsDataURL(file);
        document.body.removeChild(input);
    });
    document.body.appendChild(input);
    input.click();
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
        { selector: 'a[href="conferencia.html"]', flag: 'relatorios_ver' }
    ];
    itens.forEach(function(item) {
        var el = document.querySelector(item.selector);
        if (el && !can(item.flag)) {
            var container = el.closest('li') || el;
            container.style.display = 'none';
        }
    });
}