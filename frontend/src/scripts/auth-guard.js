/**
 * Sistema de Proteção de Rotas - Auth Guard (cópia para /src/scripts)
 */

// Early redirect disabled - login system removed
(function earlyAuthRedirect(){
    try {
        // Login system disabled - no redirects
        console.log('[AuthGuard] Login system disabled - no redirects to login page');
        return;
    } catch(_) {}
})();

class AuthGuard {
    constructor() {
        this.LOGIN_PAGE = 'login.html';
        this.TOKEN_KEY = 'token';
        this.USER_KEY = 'user';
        this.init();
    }

    init() {
        if (this.isProtectedPage()) {
            this.checkAuthentication();
        }
    }

    isProtectedPage() {
        const currentPage = window.location.pathname.split('/').pop();
        // Protect all pages except the login page
        return currentPage !== this.LOGIN_PAGE;
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
        // Login system disabled - always return true
        console.log('[AuthGuard] Login system disabled - authentication check bypassed');
        return true;
    }

    async validateToken() {
        try {
            const token = sessionStorage.getItem(this.TOKEN_KEY);
            const response = await fetch('https://e-gerente-backend-cadastros-api.vercel.app/api/cadastros/colaboradores/verify', {
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
        // Login system disabled - no redirects
        console.log('[AuthGuard] Login system disabled - redirect to login blocked');
        return;
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
        // Login system disabled - redirect to index
        console.log('[AuthGuard] Login system disabled - redirecting to index');
        window.location.href = 'index.html';
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


