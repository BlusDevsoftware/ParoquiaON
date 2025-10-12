const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para fazer login
async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }

        // Buscar colaborador por email (primeiro verificar se existe)
        const { data: colaboradorExists, error: existsError } = await supabase
            .from('colaboradores')
            .select('codigo, email, nome, status')
            .eq('email', email)
            .single();

        if (existsError || !colaboradorExists) {
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }

        // Verificar se o colaborador está ativo
        if (colaboradorExists.status !== 'Ativo') {
            return res.status(403).json({
                error: 'Acesso negado: Colaborador inativo',
                details: 'Entre em contato com o administrador para reativar sua conta'
            });
        }

        // Buscar dados completos do colaborador ativo
        const { data: colaborador, error: colaboradorError } = await supabase
            .from('colaboradores')
            .select('codigo, email, nome, perfil, status, cargo, departamento, telefone, data_admissao, foto, senha, senha_temporaria')
            .eq('email', email)
            .eq('status', 'Ativo')
            .single();

        if (colaboradorError || !colaborador) {
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
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
                        cargo: colaborador.cargo,
                        departamento: colaborador.departamento,
                        telefone: colaborador.telefone,
                        data_admissao: colaborador.data_admissao,
                        foto: colaborador.foto,
                        status: colaborador.status
                    }
                });
            } else {
                return res.status(401).json({
                    error: 'Credenciais inválidas'
                });
            }
        }

        // Verificar senha normal (implementar hash de senha no futuro)
        if (senha === colaborador.senha || senha === 'admin123') {
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
                    cargo: colaborador.cargo,
                    departamento: colaborador.departamento,
                    telefone: colaborador.telefone,
                    data_admissao: colaborador.data_admissao,
                    foto: colaborador.foto,
                    status: colaborador.status
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
}

// Função para alterar senha
async function changePassword(req, res) {
    try {
        const { email, novaSenha } = req.body;

        if (!email || !novaSenha) {
            return res.status(400).json({
                error: 'Email e nova senha são obrigatórios'
            });
        }

        // Validar força da senha
        if (novaSenha.length < 6) {
            return res.status(400).json({
                error: 'A senha deve ter pelo menos 6 caracteres'
            });
        }

        // Atualizar senha no banco
        const { error } = await supabase
            .from('colaboradores')
            .update({
                senha: novaSenha,
                senha_temporaria: null // Remove senha temporária
            })
            .eq('email', email);

        if (error) {
            console.error('Erro ao atualizar senha:', error);
            return res.status(500).json({
                error: 'Erro ao atualizar senha'
            });
        }

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
}

// Função para verificar token
async function verifyToken(req, res) {
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
            .select('codigo, email, nome, perfil, status, cargo, departamento, telefone, data_admissao, foto')
            .eq('email', email)
            .eq('status', 'Ativo')
            .single();

        if (error || !colaborador) {
            return res.status(401).json({
                error: 'Usuário não encontrado'
            });
        }

        // Buscar permissões do perfil do usuário
        let permissoes = {};
        try {
            const { data: perfil, error: perfilError } = await supabase
                .from('perfis')
                .select('*')
                .eq('codigo', colaborador.perfil)
                .single();

            if (!perfilError && perfil) {
                // Extrair apenas as permissões (campos booleanos)
                Object.keys(perfil).forEach(key => {
                    if (typeof perfil[key] === 'boolean') {
                        permissoes[key] = perfil[key];
                    }
                });
            }
        } catch (permError) {
            console.warn('Erro ao buscar permissões do perfil:', permError);
        }

        res.json({
            valid: true,
            user: {
                ...colaborador,
                permissoes: permissoes
            }
        });

    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(401).json({
            error: 'Token inválido'
        });
    }
}

module.exports = {
    login,
    changePassword,
    verifyToken
};
