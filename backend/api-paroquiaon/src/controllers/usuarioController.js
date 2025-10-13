const { supabase } = require('../config/supabase');
const { validateRequired, validatePassword, sanitizeData } = require('../middleware/validation');

// Listar todos os usuários
async function listarUsuarios(req, res) {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('usuarios')
            .select(`
                id,
                email,
                login,
                ativo,
                created_at,
                ultimo_login,
                perfis (nome),
                pessoas (nome, telefone)
            `, { count: 'exact' });

        // Aplicar busca se especificada
        if (search) {
            query = query.or(`email.ilike.%${search}%,login.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ 
            error: 'Erro ao listar usuários',
            code: 'LIST_USERS_ERROR'
        });
    }
}

// Buscar usuário por ID
async function buscarUsuario(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
}

// Criar novo usuário
async function criarUsuario(req, res) {
    try {
        const dados = req.body;

        // Validações básicas
        if (!dados.email || !dados.login || !dados.senha) {
            return res.status(400).json({
                error: 'Email, login e senha são obrigatórios',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Verificar se email já existe
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', dados.email)
            .single();

        if (existingUser) {
            return res.status(409).json({
                error: 'Email já está em uso',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }

        // Hash da senha
        const bcrypt = require('bcryptjs');
        const saltRounds = 12;
        dados.senha = await bcrypt.hash(dados.senha, saltRounds);
        dados.ativo = true;

        const { data, error } = await supabase
            .from('usuarios')
            .insert([dados])
            .select(`
                id,
                email,
                login,
                ativo,
                created_at,
                perfis (nome),
                pessoas (nome, telefone)
            `)
            .single();

        if (error) throw error;
        
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            data
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            error: 'Erro ao criar usuário',
            code: 'CREATE_USER_ERROR'
        });
    }
}

// Atualizar usuário
async function atualizarUsuario(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        const { data, error } = await supabase
            .from('usuarios')
            .update(dados)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
}

// Excluir usuário
async function excluirUsuario(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
}

module.exports = {
    listarUsuarios,
    buscarUsuario,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario
};
