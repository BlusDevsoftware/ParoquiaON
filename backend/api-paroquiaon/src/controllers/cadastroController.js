const { supabase, dbHelpers } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Função genérica para listar registros
const listarRegistros = async (req, res) => {
    try {
        const { tabela } = req.params;
        const { page = 1, limit = 10, search, ...filters } = req.query;
        
        // Mapear tabelas herdadas para ParóquiaON
        const tabelaMap = {
            'colaboradores': 'usuarios',
            'clientes': 'pessoas',
            'produtos': 'acoes',
            'servicos': 'locais',
            'perfis': 'perfis'
        };
        
        const tabelaReal = tabelaMap[tabela] || tabela;
        
        const { data, error, count, totalPages } = await dbHelpers.paginate(
            tabelaReal, 
            parseInt(page), 
            parseInt(limit), 
            filters
        );

        if (error) throw error;

        // Busca por texto se especificada
        let filteredData = data;
        if (search) {
            filteredData = data.filter(registro => {
                // Buscar em campos comuns
                const camposBusca = ['nome', 'codigo', 'email', 'descricao'];
                return camposBusca.some(campo => 
                    registro[campo] && 
                    registro[campo].toString().toLowerCase().includes(search.toLowerCase())
                );
            });
        }

        res.json({
            data: filteredData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: totalPages
            }
        });
    } catch (error) {
        console.error(`Erro ao listar registros da tabela ${req.params.tabela}:`, error);
        res.status(500).json({ 
            error: `Erro ao listar registros da tabela ${req.params.tabela}`,
            details: error.message 
        });
    }
};

// Função genérica para buscar registro
const buscarRegistro = async (req, res) => {
    try {
        const { tabela, id } = req.params;
        
        // Mapear tabelas herdadas para ParóquiaON
        const tabelaMap = {
            'colaboradores': 'usuarios',
            'clientes': 'pessoas',
            'produtos': 'acoes',
            'servicos': 'locais',
            'perfis': 'perfis'
        };
        
        const tabelaReal = tabelaMap[tabela] || tabela;
        
        const { data, error } = await dbHelpers.findById(tabelaReal, id);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error(`Erro ao buscar registro da tabela ${req.params.tabela}:`, error);
        res.status(500).json({ 
            error: `Erro ao buscar registro da tabela ${req.params.tabela}`,
            details: error.message 
        });
    }
};

// Função genérica para criar registro
const criarRegistro = async (req, res) => {
    try {
        const { tabela } = req.params;
        const dados = req.body;

        // Mapear tabelas herdadas para ParóquiaON
        const tabelaMap = {
            'colaboradores': 'usuarios',
            'clientes': 'pessoas',
            'produtos': 'acoes',
            'servicos': 'locais',
            'perfis': 'perfis'
        };
        
        const tabelaReal = tabelaMap[tabela] || tabela;

        // Preparar dados específicos para cada tabela
        let dadosParaInserir = { ...dados };

        // Tratamentos específicos por tabela
        switch (tabelaReal) {
            case 'usuarios':
                // Hash da senha se fornecida
                if (dados.senha) {
                    const saltRounds = 12;
                    dadosParaInserir.senha = await bcrypt.hash(dados.senha, saltRounds);
                }
                dadosParaInserir.ativo = true;
                break;
                
            case 'pessoas':
                dadosParaInserir.ativo = true;
                break;
                
            case 'acoes':
                dadosParaInserir.ativo = true;
                break;
                
            case 'locais':
                dadosParaInserir.ativo = true;
                break;
                
            case 'perfis':
                dadosParaInserir.ativo = true;
                dadosParaInserir.permissoes = dados.permissoes || {};
                break;
        }

        const { data, error } = await dbHelpers.create(tabelaReal, dadosParaInserir);

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error(`Erro ao criar registro na tabela ${req.params.tabela}:`, error);
        res.status(500).json({ 
            error: `Erro ao criar registro na tabela ${req.params.tabela}`,
            details: error.message 
        });
    }
};

// Função genérica para atualizar registro
const atualizarRegistro = async (req, res) => {
    try {
        const { tabela, id } = req.params;
        const dados = req.body;

        // Mapear tabelas herdadas para ParóquiaON
        const tabelaMap = {
            'colaboradores': 'usuarios',
            'clientes': 'pessoas',
            'produtos': 'acoes',
            'servicos': 'locais',
            'perfis': 'perfis'
        };
        
        const tabelaReal = tabelaMap[tabela] || tabela;

        // Preparar dados específicos para cada tabela
        let dadosParaAtualizar = { ...dados };

        // Tratamentos específicos por tabela
        switch (tabelaReal) {
            case 'usuarios':
                // Hash da senha se fornecida
                if (dados.senha) {
                    const saltRounds = 12;
                    dadosParaAtualizar.senha = await bcrypt.hash(dados.senha, saltRounds);
                }
                break;
                
            case 'perfis':
                dadosParaAtualizar.permissoes = dados.permissoes || {};
                break;
        }

        const { data, error } = await dbHelpers.update(tabelaReal, id, dadosParaAtualizar);

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.json(data);
    } catch (error) {
        console.error(`Erro ao atualizar registro da tabela ${req.params.tabela}:`, error);
        res.status(500).json({ 
            error: `Erro ao atualizar registro da tabela ${req.params.tabela}`,
            details: error.message 
        });
    }
};

// Função genérica para excluir registro
const excluirRegistro = async (req, res) => {
    try {
        const { tabela, id } = req.params;

        // Mapear tabelas do eGerente para ParóquiaON
        const tabelaMap = {
            'colaboradores': 'usuarios',
            'clientes': 'pessoas',
            'produtos': 'acoes',
            'servicos': 'locais',
            'perfis': 'perfis'
        };
        
        const tabelaReal = tabelaMap[tabela] || tabela;

        // Para usuários, apenas desativar ao invés de excluir
        if (tabelaReal === 'usuarios') {
            const { data, error } = await dbHelpers.update(tabelaReal, id, { ativo: false });
            if (error) throw error;
            return res.json({ message: 'Usuário desativado com sucesso', data });
        }

        const { error } = await dbHelpers.delete(tabelaReal, id);

        if (error) throw error;

        res.json({ message: 'Registro excluído com sucesso' });
    } catch (error) {
        console.error(`Erro ao excluir registro da tabela ${req.params.tabela}:`, error);
        res.status(500).json({ 
            error: `Erro ao excluir registro da tabela ${req.params.tabela}`,
            details: error.message 
        });
    }
};

// Funções de senha movidas para authController para evitar duplicação

module.exports = {
    listarRegistros,
    buscarRegistro,
    criarRegistro,
    atualizarRegistro,
    excluirRegistro
};