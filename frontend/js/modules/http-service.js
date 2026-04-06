/**
 * Serviço base para requisições HTTP
 */
class HttpService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Obtém os headers padrão para as requisições
     * @returns {Object} Headers da requisição
     */
    getHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Realiza uma requisição GET
     * @param {string} endpoint - Endpoint da API
     * @param {Object} params - Parâmetros da query
     * @returns {Promise<ApiResponse>} Resposta da API
     */
    async get(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/index.html';
                throw new Error('Sessão expirada');
            }

            const data = await response.json();
            return this.handleResponse(data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Realiza uma requisição POST
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise<ApiResponse>} Resposta da API
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/index.html';
                throw new Error('Sessão expirada');
            }

            const responseData = await response.json();
            return this.handleResponse(responseData);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Realiza uma requisição PUT
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem atualizados
     * @returns {Promise<ApiResponse>} Resposta da API
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/index.html';
                throw new Error('Sessão expirada');
            }

            const responseData = await response.json();
            return this.handleResponse(responseData);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Realiza uma requisição DELETE
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<ApiResponse>} Resposta da API
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/index.html';
                throw new Error('Sessão expirada');
            }

            const data = await response.json();
            return this.handleResponse(data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Trata a resposta da API
     * @param {Object} data - Dados da resposta
     * @returns {ApiResponse} Resposta tratada
     */
    handleResponse(data) {
        if (data.error) {
            throw new Error(data.error);
        }
        return {
            success: true,
            data: data
        };
    }

    /**
     * Trata erros da requisição
     * @param {Error} error - Erro ocorrido
     * @returns {ApiResponse} Resposta de erro
     */
    handleError(error) {
        console.error('Erro na requisição:', error);
        return {
            success: false,
            error: error.message || 'Erro ao conectar com o servidor'
        };
    }
}

// Exporta o serviço
export default HttpService; 