const { supabase } = require('../config/supabase');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Gerar senha temporária aleatória
function gerarSenhaTemporaria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let senha = '';
    for (let i = 0; i < 8; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
}

// Validar dados de usuário
function validarUsuario(dados, isUpdate = false) {
    const erros = [];
    
    if (!isUpdate) {
        if (!dados.email) erros.push('Email é obrigatório');
        // login não é mais obrigatório
    }
    
    if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
        erros.push('Email deve ter formato válido');
    }
    
    // remover validação de login
    
    return erros;
}

// Listar todos os usuários
async function listarUsuarios(req, res) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        
        // Buscar nomes dos perfis e pessoas vinculados
        const usuariosComNomes = await Promise.all(
            (data || []).map(async (usuario) => {
                let perfilNome = null;
                let pessoaNome = null;
                
                // Buscar nome do perfil se perfil_id existir
                if (usuario.perfil_id) {
                    const { data: perfil } = await supabase
                        .from('perfis')
                        .select('nome')
                        .eq('id', usuario.perfil_id)
                        .single();
                    perfilNome = perfil?.nome || null;
                }
                
                // Buscar dados da pessoa se pessoa_id existir
                if (usuario.pessoa_id) {
                    const { data: pessoa } = await supabase
                        .from('pessoas')
                        .select('nome, foto')
                        .eq('id', usuario.pessoa_id)
                        .single();
                    pessoaNome = pessoa?.nome || null;
                    // Anexa foto da pessoa para uso como avatar
                    usuario.pessoaFoto = pessoa?.foto || null;
                }
                
                return {
                    ...usuario,
                    perfilNome,
                    pessoaNome,
                    pessoaFoto: usuario.pessoaFoto || null
                };
            })
        );
        
        res.json(usuariosComNomes);
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
        
        // Validar dados
        const erros = validarUsuario(dados);
        if (erros.length > 0) {
            return res.status(400).json({ 
                error: 'Dados inválidos', 
                details: erros 
            });
        }
        
        // Verificar se email já existe
        const { data: emailExistente, error: emailError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', dados.email)
            .single();
            
        if (emailExistente) {
            return res.status(400).json({ 
                error: 'Email já está em uso' 
            });
        }
        
        // não validar mais duplicidade de login
        
        // Gerar senha temporária e criptografar
        const senhaTemporaria = gerarSenhaTemporaria();
        const senhaCriptografada = await bcrypt.hash(senhaTemporaria, 10);
        
        // Preparar dados básicos
        const dadosBasicos = {
            email: dados.email,
            senha: senhaCriptografada,
            pessoa_id: dados.pessoa_id || null,
            perfil_id: dados.perfil_id || null,
            ativo: dados.ativo !== false, // default true
            usuario_id: dados.usuario_id || null,
            criado_por_email: dados.criado_por_email || null,
            criado_por_nome: dados.criado_por_nome || null
        };
        
        console.log('Dados preparados para inserção:', { ...dadosBasicos, senha: '[CRIPTOGRAFADA]' });
        
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
        
        // Validar dados
        const erros = validarUsuario(dados, true);
        if (erros.length > 0) {
            return res.status(400).json({ 
                error: 'Dados inválidos', 
                details: erros 
            });
        }
        
        // Verificar se usuário existe
        const { data: usuarioExistente, error: checkError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .single();
            
        if (checkError || !usuarioExistente) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Verificar se email já existe (exceto para o próprio usuário)
        if (dados.email) {
            const { data: emailExistente, error: emailError } = await supabase
                .from('usuarios')
                .select('id')
                .eq('email', dados.email)
                .neq('id', id)
                .single();
                
            if (emailExistente) {
                return res.status(400).json({ 
                    error: 'Email já está em uso' 
                });
            }
        }
        
        // não validar mais duplicidade de login em updates
        
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
