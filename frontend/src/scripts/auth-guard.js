/**
 * Sistema de Proteção de Rotas - Auth Guard (cópia para /src/scripts)
 */

// Desabilitar autenticação (toggle temporário)
const AUTH_DISABLED = false;

// Early redirect: se não autenticado e não for a tela de login, redireciona (desativado se AUTH_DISABLED)
// Early redirect desativado para evitar loops em casos de erro temporário/latência
// O fluxo normal usará AuthGuard.init() e validateToken()

class AuthGuard {
    constructor() {
        this.LOGIN_PAGE = 'login.html';
        this.LOGIN_PATHS = ['login.html', 'login', '/login'];
        this.TOKEN_KEY = 'token';
        this.USER_KEY = 'user';
        // Mapeamento de permissão exigida por página
        // Ajuste as chaves/flags conforme seu backend (devem bater com user.permissoes)
        this.PAGE_PERMISSION_MAP = {
            'index.html': 'minha_comunidade_ver',
            'agenda.html': 'agenda_ver',
            'comunidades.html': 'cadastros_comunidades_ver',
            'pastorais.html': 'cadastros_pastorais_ver',
            'pilares.html': 'cadastros_pilares_ver',
            'locais.html': 'cadastros_locais_ver',
            'acoes.html': 'cadastros_acoes_ver',
            'pessoas.html': 'cadastros_pessoas_ver',
            'usuarios.html': 'cadastros_usuarios_ver',
            'perfil.html': 'cadastros_perfis_ver',
            'dinamico.html': 'relatorios_dinamico_ver',
            'manutencao-bd.html': 'configuracoes_manutencao_ver'
        };
        this.init();
    }

    init() {
        if (this.isProtectedPage()) {
            this.checkAuthentication();
        }
    }

    isLoginPage() {
        const pathname = window.location.pathname || '';
        const last = pathname.split('/').pop();
        return this.LOGIN_PATHS.some(p => pathname.endsWith(p) || last === p);
    }

    isProtectedPage() {
        return !this.isLoginPage();
    }

    isAuthenticated() {
        const token = sessionStorage.getItem(this.TOKEN_KEY);
        const user = sessionStorage.getItem(this.USER_KEY);
        if (!token || !user) return false;
        try {
            const userData = JSON.parse(user);
            return userData && userData.email;
        } catch {
            return false;
        }
    }

    async checkAuthentication() {
        if (AUTH_DISABLED) {
            console.log('[AuthGuard] Login system disabled - authentication check bypassed');
            return true;
        }
        const onLogin = window.location.pathname.split('/').pop() === this.LOGIN_PAGE;
        const hasSession = this.isAuthenticated();
        if (!hasSession) {
            if (!this.isLoginPage()) this.redirectToLogin();
            return false;
        }
        try {
            const ok = await this.validateToken();
            if (!ok) {
                this.logout();
                if (!this.isLoginPage()) this.redirectToLogin();
                return false;
            }
            // Após validar token, checar autorização por página
            this.enforcePagePermission();
        } catch(_) {}
        return true;
    }

    async validateToken() {
        try {
            const token = sessionStorage.getItem(this.TOKEN_KEY);
            const response = await fetch('https://api-paroquiaon.vercel.app/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                let info = '';
                try { info = await response.text(); } catch(_) {}
                console.warn('[AuthGuard] verify failed:', response.status, info);
                try {
                    sessionStorage.setItem('lastAuthError', JSON.stringify({
                        ts: Date.now(),
                        status: response.status,
                        body: info && info.slice ? info.slice(0, 2000) : String(info)
                    }));
                } catch(_) {}
                // Só forçar logout quando for 401/403; outras falhas tratamos como temporárias
                if (response.status === 401 || response.status === 403) return false;
                return true;
            }
            // Se a verificação ok, atualizar o usuário/permissões na sessão (caso backend retorne)
            try {
                const data = await response.json();
                if (data && data.user) {
                    let user = data.user;
                    // Fallback: se não veio permissoes mas tem perfil_id, buscar do endpoint de perfis
                    if ((!user.permissoes || typeof user.permissoes !== 'object') && (user.perfil_id !== null && user.perfil_id !== undefined)) {
                        try {
                            const perfResp = await fetch(`https://api-paroquiaon.vercel.app/api/perfis/${user.perfil_id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (perfResp.ok) {
                                const perfil = await perfResp.json();
                                if (perfil && typeof perfil === 'object') {
                                    // Extrair permissões de colunas booleanas/numericas do perfil
                                    const perms = {};
                                    Object.entries(perfil).forEach(([key, value]) => {
                                        if (typeof value === 'boolean' && value === true) {
                                            perms[key] = true;
                                        } else if (typeof value === 'number' && value === 1) {
                                            perms[key] = true;
                                        }
                                    });
                                    if (Object.keys(perms).length > 0) {
                                        user = { ...user, permissoes: perms };
                                    }
                                }
                            }
                        } catch(_) {}
                    }
                    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
                }
            } catch(_) {}
            return true;
        } catch {
            console.warn('[AuthGuard] verify request error - treating as temporary');
            try {
                sessionStorage.setItem('lastAuthError', JSON.stringify({ ts: Date.now(), status: 'network_error' }));
            } catch(_) {}
            return true;
        }
    }

    // Verifica a permissão exigida para a página atual e redireciona se não tiver
    enforcePagePermission() {
        const current = (window.location.pathname || '').split('/').pop() || 'index.html';
        // Não checa login.html
        if (this.isLoginPage()) return;
        const requiredFlag = this.PAGE_PERMISSION_MAP[current];
        if (!requiredFlag) return; // Página não mapeada: não restringe
        const allowed = this.hasPermission(requiredFlag);
        if (!allowed) {
            const user = this.getCurrentUser();
            const target = this.getFirstAllowedPage(user && user.permissoes);
            if (target && target !== current) {
                window.location.href = target;
            } else {
                // Sem página permitida: não redireciona para evitar loop
                console.warn('[AuthGuard] Sem permissão para a página atual e nenhuma alternativa disponível.');
            }
        }
    }

    // Calcula a primeira página que o usuário tem permissão de ver
    getFirstAllowedPage(permissoes) {
        if (!permissoes || typeof permissoes !== 'object') return null;
        const order = [
            { url: 'index.html', flag: 'minha_comunidade_ver' },
            { url: 'agenda.html', flag: 'agenda_ver' },
            { url: 'comunidades.html', flag: 'cadastros_comunidades_ver' },
            { url: 'pastorais.html', flag: 'cadastros_pastorais_ver' },
            { url: 'pilares.html', flag: 'cadastros_pilares_ver' },
            { url: 'locais.html', flag: 'cadastros_locais_ver' },
            { url: 'acoes.html', flag: 'cadastros_acoes_ver' },
            { url: 'pessoas.html', flag: 'cadastros_pessoas_ver' },
            { url: 'usuarios.html', flag: 'cadastros_usuarios_ver' },
            { url: 'perfil.html', flag: 'cadastros_perfis_ver' },
            { url: 'dinamico.html', flag: 'relatorios_dinamico_ver' },
            { url: 'manutencao-bd.html', flag: 'configuracoes_manutencao_ver' }
        ];
        for (const item of order) {
            if (permissoes[item.flag]) return item.url;
        }
        return null;
    }

    redirectToLogin() {
        if (AUTH_DISABLED) {
            console.log('[AuthGuard] Login system disabled - redirect to login blocked');
            return;
        }
        const pathname = window.location.pathname || '/index.html';
        // Sempre usar login.html (rota estática) para evitar 404 em produção
        const loginTarget = 'login.html';
        const current = pathname && pathname !== '/' ? pathname : 'index.html';
        const joiner = loginTarget.includes('?') ? '&' : '?';
        const target = `${loginTarget}${joiner}redirect=${encodeURIComponent(current)}`;
        window.location.href = target;
    }

    logout() {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem('redirectAfterLogin');
    }

    getCurrentUser() {
        if (AUTH_DISABLED) {
            // Retorna usuário padrão quando autenticação está desabilitada
            return {
                id: 1,
                email: 'admin@paroquia.com',
                login: 'admin',
                nome: 'Administrador',
                perfil: 'Administrador',
                permissoes: {} // Permissões vazias - pode ajustar conforme necessário
            };
        }
        try {
            const userData = sessionStorage.getItem(this.USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    getToken() { return sessionStorage.getItem(this.TOKEN_KEY); }

    hasPermission(flagOrSection, action) {
        const user = this.getCurrentUser();
        if (!user) return false;
        const perms = user.permissoes || {};
        if (typeof flagOrSection === 'string' && !action) {
            return perms[flagOrSection] === true;
        }
        if (typeof flagOrSection === 'string' && typeof action === 'string') {
            const key = `${flagOrSection}_${action}`;
            return perms[key] === true;
        }
        return false;
    }

    redirectAfterLogin() {
        const params = new URLSearchParams(window.location.search);
        const next = params.get('redirect');
        window.location.href = next || 'index.html';
    }

    async protectPage() {
        if (AUTH_DISABLED) {
            console.log('[AuthGuard] Login system disabled - page protection bypassed');
            return true;
        }
        return this.checkAuthentication();
    }

    getAuthHeaders() {
        const token = this.getToken();
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.authGuard = new AuthGuard();
});

window.AuthGuard = AuthGuard;


