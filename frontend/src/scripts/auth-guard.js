/**
 * Sistema de Proteção de Rotas - Auth Guard (cópia para /src/scripts)
 */

// Early redirect: se não autenticado e não for a tela de login, redireciona
(function earlyAuthRedirect(){
    try {
        const loginPage = 'login.html';
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === loginPage) return;
        const token = sessionStorage.getItem('token');
        const user = sessionStorage.getItem('user');
        if (!token || !user) {
            console.log('[AuthGuard] Não autenticado - redirecionando para login');
            const redirectUrl = `${loginPage}?redirect=${encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html')}`;
            window.location.href = redirectUrl;
        }
    } catch(_) {}
})();

class AuthGuard {
    constructor() {
        this.LOGIN_PAGE = 'login.html';
        this.LOGIN_PATHS = ['login.html', 'login', '/login'];
        this.TOKEN_KEY = 'token';
        this.USER_KEY = 'user';
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
        const onLogin = window.location.pathname.split('/').pop() === this.LOGIN_PAGE;
        const hasSession = this.isAuthenticated();
        if (!hasSession) {
            if (!this.isLoginPage()) this.redirectToLogin();
            return false;
        }
        // Valida token com backend (opcional, silencioso)
        try {
            const ok = await this.validateToken();
            if (!ok) {
                this.logout();
                if (!this.isLoginPage()) this.redirectToLogin();
                return false;
            }
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
            return response.ok;
        } catch {
            return false;
        }
    }

    redirectToLogin() {
        const pathname = window.location.pathname || '/index.html';
        const isVercel = /vercel\.app$/i.test(window.location.hostname);
        const loginTarget = isVercel ? '/login' : 'login.html';
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


