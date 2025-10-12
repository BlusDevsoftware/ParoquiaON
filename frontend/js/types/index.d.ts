// Tipos para Usuários
interface User {
    id: number;
    email: string;
    papel: 'admin' | 'gerente' | 'usuario';
    status: 'ativo' | 'inativo';
    created_at: string;
    updated_at: string;
}

// Tipos para Clientes
interface Cliente {
    id: number;
    codigo_crm: string;
    tipo: 'pf' | 'pj';
    nome: string;
    documento: string;
    email?: string;
    telefone?: string;
    status: 'ativo' | 'inativo';
    created_at: string;
    updated_at: string;
}

// Tipos para Colaboradores
interface Colaborador {
    id: number;
    codigo: string;
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    data_admissao: string;
    usuario_vinculado?: number;
    status: 'ativo' | 'inativo';
    created_at: string;
    updated_at: string;
}

// Tipos para Comissões
interface Comissao {
    id: number;
    colaborador_id: number;
    tipo: 'produto' | 'servico';
    valor: number;
    data_venda: string;
    status: 'pendente' | 'pago' | 'cancelado';
    created_at: string;
    updated_at: string;
}

// Tipos para Produtos
interface Produto {
    id: number;
    codigo: string;
    nome: string;
    categoria: string;
    valor: number;
    estoque: number;
    estoque_minimo: number;
    fornecedor?: string;
    status: 'ativo' | 'inativo';
    created_at: string;
    updated_at: string;
}

// Tipos para Serviços
interface Servico {
    id: number;
    codigo: string;
    nome: string;
    categoria: string;
    valor: number;
    duracao: string;
    descricao: string;
    status: 'ativo' | 'inativo';
    created_at: string;
    updated_at: string;
}

// Tipos para Respostas da API
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Tipos para Paginação
interface PaginationParams {
    page: number;
    limit: number;
    total: number;
}

// Tipos para Filtros
interface FilterParams {
    search?: string;
    status?: string;
    tipo?: string;
    data_inicio?: string;
    data_fim?: string;
} 