const supabase = require('../config/supabase');

async function gerarProximoCodigo() {
  const { data: ultimo } = await supabase
    .from('perfis')
    .select('codigo')
    .order('codigo', { ascending: false })
    .limit(1);
  const ultimoCodigo = ultimo?.[0]?.codigo || '00000';
  return String(parseInt(ultimoCodigo, 10) + 1).padStart(5, '0');
}

// Listar perfis
async function listarPerfis(req, res) {
  try {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('codigo', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    res.status(500).json({ error: 'Erro ao listar perfis' });
  }
}

// Buscar perfil
async function buscarPerfil(req, res) {
  try {
    const { codigo } = req.params;
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('codigo', codigo)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Perfil não encontrado' });
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
}

// Buscar permissões do perfil
async function listarPermissoes(req, res) {
  try {
    const { codigo } = req.params;
    const { data, error } = await supabase
      .from('perfis_permissoes')
      .select('*')
      .eq('perfil_codigo', codigo)
      .order('secao', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro ao listar permissões' });
  }
}

// Criar perfil (com permissões opcionais)
async function criarPerfil(req, res) {
  const { nome, status = 'ativo', permissoes = [] } = req.body || {};
  try {
    const novoCodigo = await gerarProximoCodigo();
    const { data: perfil, error: errPerfil } = await supabase
      .from('perfis')
      .insert([{ codigo: novoCodigo, nome, status }])
      .select()
      .single();
    if (errPerfil) throw errPerfil;

    // Inserir permissões se vierem
    if (Array.isArray(permissoes) && permissoes.length > 0) {
      const rows = permissoes.map(p => ({ perfil_codigo: novoCodigo, ...p }));
      const { error: errPerm } = await supabase
        .from('perfis_permissoes')
        .upsert(rows, { onConflict: 'perfil_codigo,secao' });
      if (errPerm) throw errPerm;
    }

    res.status(201).json(perfil);
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ error: 'Erro ao criar perfil' });
  }
}

// Atualizar perfil (e permissões opcionais)
async function atualizarPerfil(req, res) {
  const { codigo } = req.params;
  const { nome, status, permissoes } = req.body || {};
  try {
    const updates = {};
    if (nome !== undefined) updates.nome = nome;
    if (status !== undefined) updates.status = status;

    let updated = null;
    if (Object.keys(updates).length) {
      const { data, error } = await supabase
        .from('perfis')
        .update(updates)
        .eq('codigo', codigo)
        .select()
        .single();
      if (error) throw error;
      updated = data;
    } else {
      const { data } = await supabase
        .from('perfis')
        .select('*')
        .eq('codigo', codigo)
        .single();
      updated = data;
    }

    if (Array.isArray(permissoes)) {
      const rows = permissoes.map(p => ({ perfil_codigo: codigo, ...p }));
      const { error: errPerm } = await supabase
        .from('perfis_permissoes')
        .upsert(rows, { onConflict: 'perfil_codigo,secao' });
      if (errPerm) throw errPerm;
    }

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
}

// Excluir perfil (cascade remove permissões)
async function excluirPerfil(req, res) {
  try {
    const { codigo } = req.params;
    const { error } = await supabase
      .from('perfis')
      .delete()
      .eq('codigo', codigo);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir perfil:', error);
    res.status(500).json({ error: 'Erro ao excluir perfil' });
  }
}

module.exports = {
  listarPerfis,
  buscarPerfil,
  listarPermissoes,
  criarPerfil,
  atualizarPerfil,
  excluirPerfil,
};


