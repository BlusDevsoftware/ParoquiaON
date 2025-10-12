import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.7/+esm';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Login system disabled - redirect to index instead of login
            window.location.href = '/index.html';
        }
        return Promise.reject(error);
    }
);

export default api; 