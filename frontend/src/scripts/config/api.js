// Configuração da API
const API_BASE_URL = 'https://api-paroquiaon.vercel.app/api' // Produção

// Configurações da API
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Função para fazer requisições HTTP
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...apiConfig.headers,
      ...options.headers
    }
  }

  const config = {
    ...defaultOptions,
    ...options
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    console.error('API Request Error:', error)
    return { data: null, error }
  }
}

// Métodos HTTP
const api = {
  // GET
  async get(endpoint, options = {}) {
    return apiRequest(endpoint, {
      method: 'GET',
      ...options
    })
  },

  // POST
  async post(endpoint, data, options = {}) {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  },

  // PUT
  async put(endpoint, data, options = {}) {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  },

  // PATCH
  async patch(endpoint, data, options = {}) {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    })
  },

  // DELETE
  async delete(endpoint, options = {}) {
    return apiRequest(endpoint, {
      method: 'DELETE',
      ...options
    })
  }
}

// Endpoints específicos
const endpoints = {
  // Autenticação
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh'
  },

  // Comunidades
  comunidades: {
    list: '/comunidades',
    create: '/comunidades',
    get: (id) => `/comunidades/${id}`,
    update: (id) => `/comunidades/${id}`,
    delete: (id) => `/comunidades/${id}`
  },

  // Pastorais
  pastorais: {
    list: '/pastorais',
    create: '/pastorais',
    get: (id) => `/pastorais/${id}`,
    update: (id) => `/pastorais/${id}`,
    delete: (id) => `/pastorais/${id}`
  },

  // Pilares
  pilares: {
    list: '/pilares',
    create: '/pilares',
    get: (id) => `/pilares/${id}`,
    update: (id) => `/pilares/${id}`,
    delete: (id) => `/pilares/${id}`
  },

  // Locais
  locais: {
    list: '/locais',
    create: '/locais',
    get: (id) => `/locais/${id}`,
    update: (id) => `/locais/${id}`,
    delete: (id) => `/locais/${id}`
  },

  // Ações
  acoes: {
    list: '/acoes',
    create: '/acoes',
    get: (id) => `/acoes/${id}`,
    update: (id) => `/acoes/${id}`,
    delete: (id) => `/acoes/${id}`
  },

  // Pessoas
  pessoas: {
    list: '/pessoas',
    create: '/pessoas',
    get: (id) => `/pessoas/${id}`,
    update: (id) => `/pessoas/${id}`,
    delete: (id) => `/pessoas/${id}`
  },

  // Usuários
  usuarios: {
    list: '/usuarios',
    create: '/usuarios',
    get: (id) => `/usuarios/${id}`,
    update: (id) => `/usuarios/${id}`,
    delete: (id) => `/usuarios/${id}`
  },

  // Perfis
  perfis: {
    list: '/perfis',
    create: '/perfis',
    get: (id) => `/perfis/${id}`,
    update: (id) => `/perfis/${id}`,
    delete: (id) => `/perfis/${id}`
  },

  // Agenda
  agenda: {
    list: '/agenda',
    create: '/agenda',
    get: (id) => `/agenda/${id}`,
    update: (id) => `/agenda/${id}`,
    delete: (id) => `/agenda/${id}`,
    byDate: (date) => `/agenda/date/${date}`,
    byMonth: (month, year) => `/agenda/month/${year}/${month}`
  }
}

// Tornar disponível globalmente
window.api = api;
window.apiConfig = apiConfig;
window.endpoints = endpoints;