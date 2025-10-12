// Evita sobrescrever se já houver um cliente global (ex.: gateway axios)
if (window.api) {
    // Já existe um cliente definido; não sobrescrever
} else {
// Configuração da API
const API_URL = 'https://e-gerente-backend-cadastros-api.vercel.app/api/cadastros';

// Função para fazer requisições GET
async function get(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        const responseData = await response.json();
        if (!response.ok) {
            throw { status: response.status, data: responseData };
        }
        return responseData;
    } catch (error) {
        throw error;
    }
}

// Função para fazer requisições POST
async function post(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw { status: response.status, data: responseData };
        }

        return responseData;
    } catch (error) {
        throw error;
    }
}

// Função para fazer requisições PUT
async function put(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw { status: response.status, data: responseData };
        }

        return responseData;
    } catch (error) {
        throw error;
    }
}

// Função para fazer requisições DELETE
async function del(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });
        let responseData = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        }
        if (!response.ok) {
            throw { status: response.status, data: responseData };
        }
        return responseData;
    } catch (error) {
        throw error;
    }
}

// Função para fazer requisições PUT com FormData (upload de arquivos)
async function putFormData(endpoint, formData) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            body: formData // Não definir Content-Type, deixar o browser definir automaticamente
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw { status: response.status, data: responseData };
        }

        return responseData;
    } catch (error) {
        throw error;
    }
}

// Exporta as funções da API
const api = {
    get,
    post,
    put,
    putFormData,
    delete: del
};

// Torna a API disponível globalmente
window.api = api;
}