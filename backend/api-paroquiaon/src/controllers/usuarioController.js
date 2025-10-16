const { supabase } = require('../config/supabase');
const crypto = require('crypto');

// Gerar senha temporária aleatória
function gerarSenhaTemporaria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let senha = '';
    for (let i = 0; i < 8; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
}

// Listar todos os usuários
async function listarUsuarios(req, res) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
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
        console.log('Dados recebidos para criar usuário:', dados);
        
        // Gerar senha temporária
        const senhaTemporaria = gerarSenhaTemporaria();
        
        // Preparar dados básicos (só incluir campos que existem na tabela)
        const dadosBasicos = {
            email: dados.email,
            login: dados.login,
            senha: senhaTemporaria,
            pessoa_id: dados.pessoa_id || null,
            ativo: dados.ativo !== false, // default true
            usuario_id: dados.usuario_id || null,
            criado_por_email: dados.criado_por_email || null,
            criado_por_nome: dados.criado_por_nome || null
        };
        
        // Incluir perfil_id se fornecido
        if (dados.perfil_id) dadosBasicos.perfil_id = dados.perfil_id;
        
        console.log('Dados preparados para inserção:', dadosBasicos);
        
        const { data, error } = await supabase
            .from('usuarios')
            .insert([dadosBasicos])
            .select()
            .single();

        if (error) {
            console.error('Erro do Supabase:', error);
            throw error;
        }
        
        console.log('Usuário criado com sucesso:', data);
        
        // Retornar dados com senha temporária para o frontend
        res.status(201).json({
            ...data,
            senha_temporaria: senhaTemporaria
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            error: 'Erro ao criar usuário', 
            details: error.message,
            code: error.code 
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
