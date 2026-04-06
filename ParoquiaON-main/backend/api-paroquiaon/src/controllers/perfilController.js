const { supabase } = require('../config/supabase');

// Removido: geração de "codigo" (banco usa id inteiro)

// Listar perfis
async function listarPerfis(req, res) {
    try {
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        res.json(data || []);
    } catch (error) {
        console.error('Erro ao listar perfis:', error);
        res.status(500).json({ error: 'Erro ao listar perfis' });
    }
}

// Buscar perfil específico
async function buscarPerfil(req, res) {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
}

// listarPermissoes removido: permissões são colunas na tabela perfis

// Criar perfil com permissões
async function criarPerfil(req, res) {
    try {
        const { nome, status = 'ativo', ...permissoes } = req.body || {};
        
        console.log('🔍 DEBUG - Dados recebidos:', { nome, status, permissoes });
        
        if (!nome) {
            return res.status(400).json({ error: 'Nome do perfil é obrigatório' });
        }
        
        // Preparar dados para inserção (incluindo todas as permissões)
        const dadosPerfil = {
            nome,
            status,
            ...permissoes // Todas as permissões vão direto para a tabela perfis
        };
        
        console.log('🔍 DEBUG - Dados para inserção:', dadosPerfil);
        
        // Inserir perfil com todas as permissões em uma única operação
        const { data: perfil, error: errPerfil } = await supabase
            .from('perfis')
            .insert([dadosPerfil])
            .select()
            .single();
        
        if (errPerfil) {
            console.error('❌ Erro ao inserir perfil:', errPerfil);
            throw errPerfil;
        }
        
        console.log('✅ Perfil criado com sucesso:', perfil);
        res.status(201).json(perfil);
    } catch (error) {
        console.error('❌ Erro ao criar perfil:', error);
        res.status(500).json({ 
            error: 'Erro ao criar perfil', 
            details: error.message 
        });
    }
}

// Atualizar perfil e permissões
async function atualizarPerfil(req, res) {
    try {
        const { id } = req.params;
        const { nome, status, ...permissoes } = req.body || {};
        
        console.log('🔍 DEBUG - Atualizando perfil:', { id, nome, status, permissoes });
        
        // Verificar se perfil existe
        const { data: perfilExistente, error: errCheck } = await supabase
            .from('perfis')
            .select('id')
            .eq('id', id)
            .single();
        
        if (errCheck || !perfilExistente) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        
        // Preparar dados para atualização (incluindo todas as permissões)
        const updates = {};
        if (nome !== undefined) updates.nome = nome;
        if (status !== undefined) updates.status = status;
        
        // Adicionar todas as permissões aos updates
        Object.keys(permissoes).forEach(key => {
            if (permissoes[key] !== undefined) {
                updates[key] = permissoes[key];
            }
        });
        
        console.log('🔍 DEBUG - Updates para aplicar:', updates);
        
        // Atualizar perfil com todas as permissões em uma única operação
        const { data: perfilAtualizado, error: errUpdate } = await supabase
            .from('perfis')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (errUpdate) {
            console.error('❌ Erro ao atualizar perfil:', errUpdate);
            throw errUpdate;
        }
        
        console.log('✅ Perfil atualizado com sucesso:', perfilAtualizado);
        res.json(perfilAtualizado);
    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        res.status(500).json({ 
            error: 'Erro ao atualizar perfil', 
            details: error.message 
        });
    }
}

// Excluir perfil (cascade remove permissões)
async function excluirPerfil(req, res) {
    try {
        const { id } = req.params;
        
        // Verificar se perfil existe
        const { data: perfilExistente, error: errCheck } = await supabase
            .from('perfis')
            .select('id')
            .eq('id', id)
            .single();
        
        if (errCheck || !perfilExistente) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        
        // Excluir perfil (cascade remove permissões automaticamente)
        const { error } = await supabase
            .from('perfis')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir perfil:', error);
        res.status(500).json({ 
            error: 'Erro ao excluir perfil', 
            details: error.message 
        });
    }
}

module.exports = {
    listarPerfis,
    buscarPerfil,
    criarPerfil,
    atualizarPerfil,
    excluirPerfil
};
