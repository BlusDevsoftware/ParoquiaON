/**
 * Serviço de autenticação para o sistema Gestor de Comissões
 */
class AuthService {
    constructor() {
        this.baseUrl = API_CONFIG.AUTH_API.BASE_URL;
        this.endpoints = API_CONFIG.AUTH_API.ENDPOINTS;
        this.token = null;
        this.currentUser = null;
        this.TOKEN_KEY = 'auth_token';
        this.USER_KEY = 'current_user';
        this.init();
    }

    // Inicializa o serviço
    async init() {
        try {
            const encryptedToken = localStorage.getItem(this.TOKEN_KEY);
            const encryptedUser = localStorage.getItem(this.USER_KEY);
            
            if (encryptedToken) {
                this.token = await CryptoService.decrypt(encryptedToken);
            }
            
            if (encryptedUser) {
                this.currentUser = await CryptoService.decrypt(encryptedUser);
            }
        } catch (error) {
            console.error('Erro ao inicializar AuthService:', error);
            this.clear();
        }
    }

    // Verifica se o usuário está autenticado
    isAuthenticated() {
        return !!this.token;
    }
    
    // Verifica se o token é válido
    async verifyToken() {
        if (!this.token) return false;
        
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.VERIFY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            return false;
        }
    }
    
    // Realiza o login
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }
            
            const data = await response.json();
            await this.setToken(data.token);
            await this.setUser(data.user);
            
            return data;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    }
    
    // Realiza o logout
    async logout() {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.LOGOUT}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erro ao fazer logout');
            }
            
            this.clear();
            return true;
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            throw error;
        }
    }
    
    // Define o token
    async setToken(token) {
        this.token = token;
        const encryptedToken = await CryptoService.encrypt(token);
        localStorage.setItem(this.TOKEN_KEY, encryptedToken);
    }
    
    // Define o usuário
    async setUser(user) {
        this.currentUser = user;
        const encryptedUser = await CryptoService.encrypt(user);
        localStorage.setItem(this.USER_KEY, encryptedUser);
    }
    
    // Limpa os dados
    clear() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    getToken() {
        return this.token;
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem(this.TOKEN_KEY);
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.REGISTER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Erro ao registrar usuário');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            throw error;
        }
    }

    async refreshToken() {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.REFRESH_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar token');
            }

            const data = await response.json();
            await this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Erro ao atualizar token:', error);
            throw error;
        }
    }

    async getUserProfile() {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.USER_PROFILE}`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar perfil do usuário');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            throw error;
        }
    }

    async updateUserProfile(userData) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.USER_UPDATE}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar perfil do usuário');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar perfil do usuário:', error);
            throw error;
        }
    }

    async searchUsers(query) {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.USER_SEARCH}?q=${query}`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar usuários');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }
    }
}

// Inicializa o serviço
const authService = new AuthService();

// Exporta o serviço para o escopo global
window.AuthService = authService; 