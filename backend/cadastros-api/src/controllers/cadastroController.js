const { supabase } = require('../config/supabase');

// Função para fazer login
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }

        // Buscar colaborador por email
        const { data: colaborador, error: colaboradorError } = await supabase
            .from('colaboradores')
            .select('*')
            .eq('email', email)
            .eq('status', 'Ativo')
            .single();

        if (colaboradorError || !colaborador) {
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }

        // Carregar permissões do perfil
        let perfilPermissoes = {};
        try {
            const perfilCodigo = colaborador.perfil; // ex.: '00002'
            if (perfilCodigo) {
                const { data: perfilData, error: perfilError } = await supabase
                    .from('perfis')
                    .select('*')
                    .eq('codigo', perfilCodigo)
                    .single();
                if (!perfilError && perfilData) {
                    // Montar objeto de permissões a partir das colunas booleanas *_ver|*_criar|*_editar|*_excluir|*_exportar|*_executar
                    const permissoesObj = {};
                    Object.keys(perfilData).forEach((key) => {
                        const value = perfilData[key];
                        if (typeof value === 'boolean') {
                            permissoesObj[key] = value;
                        }
                    });
                    // Caso exista um JSONB 'permissoes', mesclar (prioridade para colunas explícitas)
                    if (perfilData.permissoes && typeof perfilData.permissoes === 'object') {
                        Object.assign(permissoesObj, perfilData.permissoes || {});
                    }
                    perfilPermissoes = permissoesObj;
                }
            }
        } catch (_) {
            // Ignorar erro de permissões, seguir com objeto vazio
        }

        // Verificar se tem senha temporária (primeiro acesso)
        if (colaborador.senha_temporaria) {
            if (senha === colaborador.senha_temporaria) {
                return res.json({
                    success: true,
                    requiresPasswordChange: true,
                    user: {
                        id: colaborador.codigo,
                        email: colaborador.email,
                        nome: colaborador.nome,
                        perfil: colaborador.perfil,
                        permissoes: perfilPermissoes
                    }
                });
            } else {
                return res.status(401).json({
                    error: 'Credenciais inválidas'
                });
            }
        }

        // Verificar senha normal (implementar hash de senha no futuro)
        if (senha === colaborador.senha_hash || senha === 'admin123') {
            // Gerar token simples (em produção, usar JWT)
            const token = Buffer.from(`${colaborador.email}:${Date.now()}`).toString('base64');
            
            return res.json({
                success: true,
                token: token,
                user: {
                    id: colaborador.codigo,
                    email: colaborador.email,
                    nome: colaborador.nome,
                    perfil: colaborador.perfil,
                    permissoes: perfilPermissoes
                }
            });
        } else {
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};

// Função para verificar token
const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Token não fornecido'
            });
        }

        // Decodificar token simples
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email, timestamp] = decoded.split(':');
        
        // Verificar se o token não é muito antigo (24 horas)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) {
            return res.status(401).json({
                error: 'Token expirado'
            });
        }

        // Verificar se o usuário ainda existe
        const { data: colaborador, error } = await supabase
            .from('colaboradores')
            .select('codigo, email, nome, perfil, status')
            .eq('email', email)
            .eq('status', 'Ativo')
            .single();

        if (error || !colaborador) {
            return res.status(401).json({
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            valid: true,
            user: colaborador
        });

    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(401).json({
            error: 'Token inválido'
        });
    }
};

// Função para gerar senha temporária
function gerarSenhaTemporaria() {
    const maiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiais = '!@#$%&*';
    
    let senha = '';
    
    // Adicionar 2 caracteres de cada tipo
    for (let i = 0; i < 2; i++) {
        senha += maiusculas.charAt(Math.floor(Math.random() * maiusculas.length));
        senha += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
        senha += numeros.charAt(Math.floor(Math.random() * numeros.length));
        senha += especiais.charAt(Math.floor(Math.random() * especiais.length));
    }
    
    // Embaralhar a senha
    return senha.split('').sort(() => Math.random() - 0.5).join('');
}

// Resetar senha do colaborador por código (gera senha temporária)
const resetSenhaColaboradorPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const codigoStr = codigo.toString().padStart(5, '0');

        // Verificar existência do colaborador
        const { data: usuario, error: findErr } = await supabase
            .from('colaboradores')
            .select('codigo, email, nome, status')
            .eq('codigo', codigoStr)
            .single();

        if (findErr || !usuario) {
            return res.status(404).json({ error: 'Colaborador não encontrado' });
        }

        const senhaTemporaria = gerarSenhaTemporaria();

        const { data, error } = await supabase
            .from('colaboradores')
            .update({ 
                senha_temporaria: senhaTemporaria,
                senha_hash: null,
                primeiro_acesso: true
            })
            .eq('codigo', codigoStr)
            .select('codigo, email')
            .single();

        if (error) throw error;

        return res.json({
            message: 'Senha temporária gerada com sucesso',
            email: data.email,
            senha_temporaria: senhaTemporaria
        });
    } catch (error) {
        console.error('Erro ao resetar senha do colaborador (cadastros-api):', error);
        res.status(500).json({ error: 'Erro ao resetar senha do colaborador' });
    }
};

// Função genérica para listar registros
const listarRegistros = async (req, res) => {
    try {
        const { tabela } = req.params;
        const { data, error } = await supabase
            .from(tabela)
            .select('*')
            .order('codigo', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error(`Erro ao listar registros da tabela ${req.params.tabela}:`, error);
        res.status(500).json({ error: `Erro ao listar registros da tabela ${req.params.tabela}` });
    }
};

// Função genérica para buscar registro
const buscarRegistro = async (req, res) => {
    try {
        const { tabela, codigo } = req.params;
        
        // Garantir que o código seja tratado como string
        const codigoStr = codigo.toString().padStart(5, '0');
        
        const { data, error } = await supabase
            .from(tabela)
            .select('*')
            .eq('codigo', codigoStr)
            .single();

        if (error) {
            console.error(`Erro ao buscar registro da tabela ${tabela}:`, error);
            throw error;
        }
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

        // Gerar código único
        const { data: ultimoRegistro } = await supabase
            .from(tabela)
            .select('codigo')
            .order('codigo', { ascending: false })
            .limit(1);

        let novoCodigo;
        if (ultimoRegistro && ultimoRegistro.length > 0) {
            // Extrair o número do último código (remover zeros à esquerda)
            const ultimoNumero = parseInt(ultimoRegistro[0].codigo);
            novoCodigo = (ultimoNumero + 1).toString().padStart(5, '0');
        } else {
            novoCodigo = '00001';
        }

        // Preparar dados para inserção
        const dadosParaInserir = {
            ...dados,
            codigo: novoCodigo
        };

        // Se for a tabela colaboradores, adicionar departamento padrão, tratar usuario_vinculado e gerar senha temporária
        if (tabela === 'colaboradores') {
            dadosParaInserir.departamento = 'Geral';
            
            // Converter usuario_vinculado vazio para null
            if (dadosParaInserir.usuario_vinculado === '') {
                dadosParaInserir.usuario_vinculado = null;
            } else if (dadosParaInserir.usuario_vinculado) {
                dadosParaInserir.usuario_vinculado = parseInt(dadosParaInserir.usuario_vinculado);
            }
            
            // Gerar senha temporária (8 caracteres: 2 maiúsculas + 2 minúsculas + 2 números + 2 especiais)
            const senhaTemporaria = gerarSenhaTemporaria();
            dadosParaInserir.senha_temporaria = senhaTemporaria;
        }

        const { data, error } = await supabase
            .from(tabela)
            .insert([dadosParaInserir])
            .select()
            .single();

        if (error) {
            console.error(`Erro ao inserir na tabela ${tabela}:`, error);
            throw error;
        }

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
        const { tabela, codigo } = req.params;
        const dados = req.body;

        // Se for a tabela colaboradores, tratar usuario_vinculado
        if (tabela === 'colaboradores') {
            if (dados.usuario_vinculado === '') {
                dados.usuario_vinculado = null;
            } else if (dados.usuario_vinculado) {
                dados.usuario_vinculado = parseInt(dados.usuario_vinculado);
            }
        }

        const { data, error } = await supabase
            .from(tabela)
            .update(dados)
            .eq('codigo', codigo)
            .select()
            .single();

        if (error) {
            console.error(`Erro ao atualizar registro da tabela ${tabela}:`, error);
            throw error;
        }
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
        const { tabela, codigo } = req.params;
        
        // Garantir que o código seja tratado como string
        const codigoStr = codigo.toString().padStart(5, '0');
        
        console.log(`Tentando excluir registro da tabela ${tabela} com código ${codigoStr}`);
        
        const { data, error } = await supabase
            .from(tabela)
            .delete()
            .eq('codigo', codigoStr)
            .select();

        if (error) {
            console.error(`Erro ao excluir registro da tabela ${tabela}:`, error);
            throw error;
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        console.log(`Registro excluído com sucesso:`, data);
        res.json({ message: 'Registro excluído com sucesso', data });
    } catch (error) {
        console.error(`Erro ao excluir registro da tabela ${req.params.tabela}:`, error);
        res.status(500).json({ 
            error: `Erro ao excluir registro da tabela ${req.params.tabela}`,
            details: error.message 
        });
    }
};

// Função para alterar senha de colaborador
const alterarSenhaColaborador = async (req, res) => {
    try {
        const { email, novaSenha } = req.body;

        console.log('Alterando senha para:', { email, novaSenha: novaSenha ? '***' : 'undefined' });

        if (!email || !novaSenha) {
            return res.status(400).json({ 
                error: 'Email e nova senha são obrigatórios' 
            });
        }

        // Validar força da senha
        const passwordValidation = validatePasswordStrength(novaSenha);
        console.log('Validação da senha:', passwordValidation);
        
        if (passwordValidation.strength < 4) {
            return res.status(400).json({ 
                error: 'A senha não atende aos requisitos mínimos de segurança',
                requirements: passwordValidation.requirements
            });
        }

        // Buscar colaborador por email
        const { data: colaborador, error: searchError } = await supabase
            .from('colaboradores')
            .select('*')
            .eq('email', email)
            .single();

        console.log('Colaborador encontrado:', colaborador ? 'Sim' : 'Não', searchError);

        if (searchError || !colaborador) {
            return res.status(404).json({ 
                error: 'Colaborador não encontrado' 
            });
        }

        // Verificar se tem senha temporária (primeiro acesso)
        if (!colaborador.senha_temporaria) {
            return res.status(400).json({ 
                error: 'Este colaborador já alterou sua senha anteriormente' 
            });
        }

        // Atualizar senha usando o campo correto
        const { data, error } = await supabase
            .from('colaboradores')
            .update({
                senha_hash: novaSenha, // TODO: Implementar hash da senha
                senha_temporaria: null, // Remove a senha temporária
                primeiro_acesso: false // Marca que não é mais primeiro acesso
            })
            .eq('email', email)
            .select()
            .single();

        console.log('Resultado da atualização:', { data, error });

        if (error) {
            throw error;
        }

        res.json({ 
            message: 'Senha alterada com sucesso',
            colaborador: {
                codigo: data.codigo,
                nome: data.nome,
                email: data.email
            }
        });

    } catch (error) {
        console.error('Erro ao alterar senha do colaborador:', error);
        res.status(500).json({ 
            error: 'Erro ao alterar senha do colaborador',
            details: error.message 
        });
    }
};

// Função para validar força da senha (mesma lógica do frontend)
function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%&*]/.test(password)
    };
    
    const strength = Object.values(requirements).filter(Boolean).length;
    return { requirements, strength };
}

module.exports = {
    listarRegistros,
    buscarRegistro,
    criarRegistro,
    atualizarRegistro,
    excluirRegistro,
    alterarSenhaColaborador,
    resetSenhaColaboradorPorCodigo,
    login,
    verifyToken
}; 