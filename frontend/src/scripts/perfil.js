// Função para renderizar matriz de permissões
function renderPermissionsMatrix(permissoes = {}, isEditMode = false) {
    const c = document.getElementById('permissionsMatrix');
    if (!c) return;
    c.innerHTML = '';
    
    // Adicionar botões "Marcar Todas" e "Desmarcar Todas" apenas no modo de edição
    if (isEditMode) {
        const marcarTodasContainer = document.createElement('div');
        marcarTodasContainer.style.cssText = 'margin-bottom: 15px; display: flex; gap: 8px; justify-content: center;';
        
        const marcarTodasBtn = document.createElement('button');
        marcarTodasBtn.type = 'button';
        marcarTodasBtn.className = 'btn-primary';
        marcarTodasBtn.innerHTML = '<i class="fas fa-check-double"></i> Marcar Todas';
        
        const desmarcarTodasBtn = document.createElement('button');
        desmarcarTodasBtn.type = 'button';
        desmarcarTodasBtn.className = 'btn-secondary';
        desmarcarTodasBtn.innerHTML = '<i class="fas fa-times"></i> Desmarcar Todas';
        
        marcarTodasContainer.appendChild(marcarTodasBtn);
        marcarTodasContainer.appendChild(desmarcarTodasBtn);
        c.appendChild(marcarTodasContainer);

        // Função para marcar todas as permissões
        marcarTodasBtn.addEventListener('click', () => {
            grupos.forEach((g, gi) => {
                g.acoes.forEach(acao => {
                    const cb = c.querySelector(`input[name="perm_${gi}_${acao}"]`);
                    if (cb) {
                        cb.checked = true;
                        // Simular o evento change para atualizar o mapa
                        const event = new Event('change');
                        cb.dispatchEvent(event);
                    }
                });
            });
            mostrarToast('Todas as permissões foram marcadas!', 'success');
        });
        
        // Função para desmarcar todas as permissões
        desmarcarTodasBtn.addEventListener('click', () => {
            grupos.forEach((g, gi) => {
                g.acoes.forEach(acao => {
                    const cb = c.querySelector(`input[name="perm_${gi}_${acao}"]`);
                    if (cb) {
                        cb.checked = false;
                        // Simular o evento change para atualizar o mapa
                        const event = new Event('change');
                        cb.dispatchEvent(event);
                    }
                });
            });
            mostrarToast('Todas as permissões foram desmarcadas!', 'success');
        });
    }
    
    const iconByAction = {
        ver: 'fa-eye',
        criar: 'fa-plus',
        editar: 'fa-pen',
        excluir: 'fa-trash',
        exportar: 'fa-file-export',
        executar: 'fa-play'
    };
    
    // Ícone especial para "Visualizar Todos os Títulos"
    const iconByTitle = {};
    const grupos = [
        { titulo: 'Minha Comunidade', acoes: ['ver'] },
        { titulo: 'Usuários', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Pessoas', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Comunidades', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Pastorais', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Pilares', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Locais', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Ações', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Agenda', acoes: ['ver','criar','editar','excluir'] },
        { titulo: 'Relatórios', acoes: ['ver','exportar'] }
    ];
    
    grupos.forEach((g, gi) => {
        const box = document.createElement('div');
        box.className = 'perm-group';
        const title = document.createElement('div');
        title.className = 'perm-title';
        const icon = iconByTitle[g.titulo] || 'fa-folder';
        title.innerHTML = `<i class="fas ${icon}"></i> ${g.titulo}`;
        const row = document.createElement('div');
        row.className = 'perm-actions';
        g.acoes.forEach(acao => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = `perm_${gi}_${acao}`;
            cb.checked = Boolean(permissoes[g.titulo]?.includes(acao));
            cb.addEventListener('change', () => {
                if (!permissoes[g.titulo]) permissoes[g.titulo] = [];
                // Se marcar criar/editar/excluir, garantir 'ver' marcado
                if (acao !== 'ver' && cb.checked) {
                    const viewCb = c.querySelector(`input[name="perm_${gi}_ver"]`);
                    if (viewCb && !viewCb.checked) {
                        viewCb.checked = true;
                        if (!permissoes[g.titulo].includes('ver')) permissoes[g.titulo].push('ver');
                    }
                }
                // Se desmarcar 'ver', desmarca as demais opções
                if (acao === 'ver' && !cb.checked) {
                    g.acoes.forEach(a2 => {
                        if (a2 !== 'ver') {
                            const other = c.querySelector(`input[name="perm_${gi}_${a2}"]`);
                            if (other && other.checked) other.checked = false;
                        }
                    });
                    delete permissoes[g.titulo];
                    return;
                }
                if (cb.checked) {
                    if (!permissoes[g.titulo].includes(acao)) permissoes[g.titulo].push(acao);
                } else {
                    permissoes[g.titulo] = permissoes[g.titulo].filter(a => a !== acao);
                    if (permissoes[g.titulo].length === 0) delete permissoes[g.titulo];
                }
            });
            const icon = document.createElement('i');
            icon.className = `fas ${iconByAction[acao] || 'fa-check'}`;
            const span = document.createElement('span');
            span.textContent = acao;
            label.appendChild(cb);
            label.appendChild(icon);
            label.appendChild(span);
            row.appendChild(label);
        });
        box.appendChild(title);
        box.appendChild(row);
        c.appendChild(box);
    });
    const form = document.getElementById('perfilForm');
    if (form) {
        form._permissoesAtual = permissoes;
    }
}

// Funções de Modal de Perfil
function sectionKeyToTitle(sectionKey) {
    const map = {
        'dashboard': 'Minha Comunidade',
        'minha_comunidade': 'Minha Comunidade',
        'usuarios': 'Usuários',
        'pessoas': 'Pessoas',
        'comunidades': 'Comunidades',
        'pastorais': 'Pastorais',
        'pilares': 'Pilares',
        'locais': 'Locais',
        'acoes': 'Ações',
        'agenda': 'Agenda',
        'relatorios': 'Relatórios'
    };
    return map[sectionKey] || sectionKey;
}

function buildPermissionsMapFromProfile(profileObj) {
    const mapa = {};
    console.log('🔍 DEBUG - buildPermissionsMapFromProfile - profileObj:', profileObj);
    
    Object.keys(profileObj).forEach(key => {
        if (typeof profileObj[key] !== 'boolean') return;

        const lastUnderscore = key.lastIndexOf('_');
        if (lastUnderscore <= 0) return;
        const sectionKey = key.substring(0, lastUnderscore); // e.g., dashboard, usuarios
        const action = key.substring(lastUnderscore + 1);    // e.g., ver/editar
        if (!['ver','criar','editar','excluir','exportar','executar'].includes(action)) return;
        
        // Mapear dashboard para Minha Comunidade
        const mappedSectionKey = sectionKey === 'dashboard' ? 'minha_comunidade' : sectionKey;
        const title = sectionKeyToTitle(mappedSectionKey);
        
        if (!mapa[title]) mapa[title] = [];
        if (profileObj[key] === true) {
            mapa[title].push(action);
        }
    });
    
    console.log('🔍 DEBUG - buildPermissionsMapFromProfile - mapa final:', mapa);
    return mapa;
}
function openPerfilModal() {
    const modal = document.getElementById('perfilModal');
    if (!modal) {
        console.error('Modal de perfil não encontrado');
        mostrarToast('Modal de perfil não encontrado!', 'error');
        return;
    }
    const form = document.getElementById('perfilForm');
    if (!form) return;
    form.reset();
    document.getElementById('perfilModalTitle').innerHTML = '<i class="fas fa-user-shield"></i> Novo Perfil';
    
    // Para novos perfis, NÃO preencher o código - deixar vazio para o backend gerar
    form.codigo.value = '';
    // Campo codigo_perfil foi removido do formulário
    // Renderiza matriz de permissões (modo de edição para novo perfil)
    renderPermissionsMatrix({}, true);
    modal.style.display = 'flex';
    modal.classList.remove('show');
    modal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
}

function closePerfilModal() {
    const modal = document.getElementById('perfilModal');
    if (!modal) return;
    modal.style.opacity = '0';
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
}

function closeViewModal() {
    // Esta função pode ser removida se o mesmo modal for usado para visualizar e editar
    const modal = document.getElementById('viewModal'); // Verifique se este modal ainda existe no HTML
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Dados cacheados desta página
window.perfisMemoria = [];

// Funções para controlar o spinner centralizado - IDÊNTICAS AO DA ABA DE COLABORADORES
function mostrarSpinner() {
    const el = document.getElementById('loader-perfis') || document.getElementById('loader-usuarios');
    if (el) el.style.display = 'flex';
}

function ocultarSpinner() {
    const el = document.getElementById('loader-perfis') || document.getElementById('loader-usuarios');
    if (el) el.style.display = 'none';
}

// Função para mostrar modal de sucesso
window.showSuccessModal = function() {
    // Preencher data de cadastro
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    document.getElementById('dataCadastro').textContent = dataAtual;
    
    // Mostrar modal com transição
    const modal = document.getElementById('successModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

// Função para fechar modal de sucesso
window.closeSuccessModal = function() {
    const modal = document.getElementById('successModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Função para mostrar modal de sucesso de atualização
window.showUpdateSuccessModal = function(status) {
    // Preencher dados de atualização
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    document.getElementById('dataAtualizacao').textContent = dataAtual;
    if (typeof status === 'string' && status.length) {
        document.getElementById('statusAtualizado').textContent = status;
    } else {
        document.getElementById('statusAtualizado').textContent = 'Ativo';
    }
    
    // Mostrar modal com transição
    const modal = document.getElementById('updateSuccessModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

// Função para fechar modal de sucesso de atualização
window.closeUpdateSuccessModal = function() {
    const modal = document.getElementById('updateSuccessModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Carregar perfis (mesma animação/fluxo da aba de Serviços)
async function carregarPerfis() {
    try {
        // Mostrar spinner ao iniciar carregamento
        mostrarSpinner();

        const tbody = document.getElementById('profilesTableBody');
        if (!tbody) {
            console.error('Tabela de perfis não encontrada.');
            return;
        }

        const { data, error } = await window.api.get(window.endpoints.perfis.list);
        if (error) throw error;
        const perfis = Array.isArray(data) ? data : [];

        tbody.innerHTML = '';
        (perfis || []).forEach((perfil) => {
            const tr = document.createElement('tr');
            const id = perfil.id ?? '';
            const idFmt = id ? String(id).padStart(5, '0') : '';
            const nome = perfil.nome ?? '';
            
            // Contar permissões ativas
            let permissoesAtivas = 0;
            Object.keys(perfil).forEach(key => {
                if (key.includes('_') && typeof perfil[key] === 'boolean' && perfil[key] === true) {
                    permissoesAtivas++;
                }
            });
            
            const permissoesResumo = `${permissoesAtivas} permissão(ões)`;
            
            tr.innerHTML = `
                <td>${idFmt}</td>
                <td>${nome}</td>
                <td>${permissoesResumo}</td>
                <td class="actions">
                    <button class="action-btn view-btn" title="Visualizar" onclick="visualizarPerfil('${id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Editar" onclick="editarPerfil('${id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Excluir" onclick="confirmarExclusaoPerfil('${id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Erro ao carregar perfis', 'error');
        }
    } finally {
        // Ocultar spinner após carregar (com sucesso ou erro)
        ocultarSpinner();
    }
}

// Visualizar perfil
async function visualizarPerfil(id) {
    try {
        const { data, error } = await window.api.get(window.endpoints.perfis.get(parseInt(id, 10)));
        if (error) throw error;
        const perfil = data;
        // Reaproveita o modal de perfil em modo somente leitura
        const form = document.getElementById('perfilForm');
        document.getElementById('perfilModalTitle').innerHTML = '<i class="fas fa-eye"></i> Visualizar Perfil';
        form.id.value = perfil.id || '';
        // Campo codigo_perfil removido; exibição do código não é mais necessária
        form.nome.value = perfil.nome || '';
        
        // Renderizar permissões marcadas no novo formato
        const mapa = buildPermissionsMapFromProfile(perfil);
        
        renderPermissionsMatrix(mapa, false); // Modo de visualização - sem botões
        // Desabilitar campos
        Array.from(form.elements).forEach(el => el.disabled = true);
        // Esconder botões de ação do formulário
        const formActions = form.querySelector('.form-actions');
        if (formActions) {
            formActions.style.display = 'none';
        }
        const modal = document.getElementById('perfilModal');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Erro ao visualizar perfil:', error);
        mostrarToast('Erro ao visualizar perfil', 'error');
    }
}

// Editar perfil
async function editarPerfil(id) {
    try {
        const { data, error } = await window.api.get(window.endpoints.perfis.get(parseInt(id, 10)));
        if (error) throw error;
        const perfil = data;
        const form = document.getElementById('perfilForm');
        document.getElementById('perfilModalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
        form.id.value = perfil.id || '';
        // Campo codigo_perfil removido; exibição do código não é mais necessária
        form.nome.value = perfil.nome || '';
        
        // Renderizar permissões marcadas no novo formato
        const mapa = buildPermissionsMapFromProfile(perfil);
        
        renderPermissionsMatrix(mapa, true); // Modo de edição - com botões
        // Habilitar campos
        Array.from(form.elements).forEach(el => el.disabled = false);
        // Mostrar botões de ação do formulário
        const formActions = form.querySelector('.form-actions');
        if (formActions) {
            formActions.style.display = 'flex';
        }
        const modal = document.getElementById('perfilModal');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Erro ao editar perfil:', error);
        mostrarToast('Erro ao editar perfil', 'error');
    }
}

// Confirmar exclusão de perfil
function confirmarExclusaoPerfil(id) {
    try {
        const modal = document.getElementById('deleteModal');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (!modal || !confirmBtn) return;
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        newBtn.addEventListener('click', async () => {
            try {
                await window.bloqueioExclusao.deleteWithCheck(
                    'perfis',
                    parseInt(id, 10),
                    async () => { closeDeleteModal(); await carregarPerfis(); }
                );
            } catch (error) {
                console.error('Erro ao excluir perfil:', error);
            }
        });
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Erro ao preparar exclusão do perfil:', error);
    }
}

// Excluir perfil
async function excluirPerfil(id) {
    // Mantido apenas para compatibilidade se chamado diretamente em outro lugar
    try {
        await window.bloqueioExclusao.deleteWithCheck(
            'perfis',
            parseInt(id, 10),
            async () => { closeDeleteModal(); await carregarPerfis(); }
        );
    } catch (error) {
        console.error('Erro ao excluir perfil:', error);
    }
}

// Carregar perfis ao iniciar a página e configurar listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Mostrar spinner centralizado ao iniciar
        mostrarSpinner();
        
        // Carregar dados de perfis via API (tabela legacy ou grid nova)
        if (typeof window.carregarPerfisGrid === 'function') {
            await window.carregarPerfisGrid();
        } else {
            await carregarPerfis();
        }
        
        // Ocultar spinner centralizado quando tudo carregar
        ocultarSpinner();
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        // Ocultar spinner mesmo em caso de erro
        ocultarSpinner();
    }
    
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Form de perfil
    let form = document.getElementById('perfilForm');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await salvarPerfil(e);
        };
    }

    // Botão de fechar modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closePerfilModal();
            // closeViewModal(); // Remover se não for mais usado
            closeDeleteModal();
        });
    });

    // Busca
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filtrarPerfis(searchTerm);
        });
    }

    // Filtro de status
    // sem filtro de status nesta aba

    // Filtro de tipo
    // sem filtro de tipo nesta aba
}

// Código é gerado no backend

// Carregar usuários
async function carregarUsuarios() {
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 200; // 200ms
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // Mostrar spinner ao iniciar carregamento
            mostrarSpinner();
            const tbody = document.getElementById('userTableBody');
            if (!tbody) {
                if (i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    continue;
                } else {
                    console.error('Tabela de usuários não encontrada após múltiplas tentativas.');
                    mostrarToast('Tabela de usuários não encontrada', 'error');
                    return;
                }
            }

            const response = await api.get('/usuarios');
            tbody.innerHTML = '';
        
            if (!response || response.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="6" class="text-center">Nenhum usuário encontrado</td>';
                tbody.appendChild(tr);
                return;
            }
        
            response.forEach(usuario => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${usuario.codigo.toString().padStart(5, '0')}</td>
                    <td>${usuario.nome}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.nivel}</td>
                    <td>
                        <span class="status ${usuario.status}">
                            ${usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="action-btn view-btn" onclick="visualizarUsuario('${usuario.codigo}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="editarUsuario('${usuario.codigo}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="confirmarExclusao('${usuario.codigo}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        
            usuarios = response;
            
            // Ocultar spinner após carregar com sucesso
            ocultarSpinner();
            return; // Sai do loop se o carregamento for bem-sucedido
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            if (i < MAX_RETRIES - 1) {
                mostrarToast('Erro ao carregar usuários, re-tentando...', 'error');
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                mostrarToast('Erro ao carregar usuários: ' + error.message, 'error');
                // Ocultar spinner mesmo em caso de erro
                ocultarSpinner();
            }
        }
    }
}

// Filtrar usuários
function filtrarUsuarios(termo) {
    const filtrados = usuarios.filter(usuario => 
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.codigo.toString().includes(termo)
    );
    atualizarTabela(filtrados);
}

// Helpers para permissões/tabela
function mapearPermsPorSecao(permsArray) {
    const mapa = {};
    (permsArray || []).forEach(p => {
        const acoes = [];
        if (p.ver) acoes.push('ver');
        if (p.criar) acoes.push('criar');
        if (p.editar) acoes.push('editar');
        if (p.excluir) acoes.push('excluir');
        if (p.exportar) acoes.push('exportar');
        if (p.executar) acoes.push('executar');
        if (acoes.length) mapa[p.secao] = acoes;
    });
    return mapa;
}

// Atualizar tabela (reutilizada para filtros)
function atualizarTabela(usuarios) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) {
        console.error('TBody da tabela de usuários não encontrado para atualização.');
        return;
    }
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhum usuário encontrado</td>';
        tbody.appendChild(tr);
        return;
    }

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.codigo.toString().padStart(5, '0')}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.nivel}</td>
            <td>
                <span class="status ${usuario.status}">
                    ${usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="actions">
                <button class="action-btn view-btn" onclick="visualizarUsuario('${usuario.codigo}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editarUsuario('${usuario.codigo}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="confirmarExclusao('${usuario.codigo}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Salvar perfil (criar/atualizar) contra a API
async function salvarPerfil(e) {
    const form = e.target;
    const data = new FormData(form);
    const nome = data.get('nome');
    const permissoesMapa = form._permissoesAtual || {};
    
    console.log('🔍 FRONTEND - Form data:', { nome });
    console.log('🔍 FRONTEND - Permissões mapa:', permissoesMapa);
    
    // Converter mapa de permissões para o formato de colunas do banco atual
    const permissoes = {};
    
    // Minha Comunidade
    permissoes.minha_comunidade_ver = permissoesMapa['Minha Comunidade']?.includes('ver') || false;

    // Usuários
    permissoes.usuarios_ver = permissoesMapa['Usuários']?.includes('ver') || false;
    permissoes.usuarios_criar = permissoesMapa['Usuários']?.includes('criar') || false;
    permissoes.usuarios_editar = permissoesMapa['Usuários']?.includes('editar') || false;
    permissoes.usuarios_excluir = permissoesMapa['Usuários']?.includes('excluir') || false;

    // Pessoas
    permissoes.pessoas_ver = permissoesMapa['Pessoas']?.includes('ver') || false;
    permissoes.pessoas_criar = permissoesMapa['Pessoas']?.includes('criar') || false;
    permissoes.pessoas_editar = permissoesMapa['Pessoas']?.includes('editar') || false;
    permissoes.pessoas_excluir = permissoesMapa['Pessoas']?.includes('excluir') || false;

    // Comunidades
    permissoes.comunidades_ver = permissoesMapa['Comunidades']?.includes('ver') || false;
    permissoes.comunidades_criar = permissoesMapa['Comunidades']?.includes('criar') || false;
    permissoes.comunidades_editar = permissoesMapa['Comunidades']?.includes('editar') || false;
    permissoes.comunidades_excluir = permissoesMapa['Comunidades']?.includes('excluir') || false;

    // Pastorais
    permissoes.pastorais_ver = permissoesMapa['Pastorais']?.includes('ver') || false;
    permissoes.pastorais_criar = permissoesMapa['Pastorais']?.includes('criar') || false;
    permissoes.pastorais_editar = permissoesMapa['Pastorais']?.includes('editar') || false;
    permissoes.pastorais_excluir = permissoesMapa['Pastorais']?.includes('excluir') || false;

    // Pilares
    permissoes.pilares_ver = permissoesMapa['Pilares']?.includes('ver') || false;
    permissoes.pilares_criar = permissoesMapa['Pilares']?.includes('criar') || false;
    permissoes.pilares_editar = permissoesMapa['Pilares']?.includes('editar') || false;
    permissoes.pilares_excluir = permissoesMapa['Pilares']?.includes('excluir') || false;

    // Locais
    permissoes.locais_ver = permissoesMapa['Locais']?.includes('ver') || false;
    permissoes.locais_criar = permissoesMapa['Locais']?.includes('criar') || false;
    permissoes.locais_editar = permissoesMapa['Locais']?.includes('editar') || false;
    permissoes.locais_excluir = permissoesMapa['Locais']?.includes('excluir') || false;

    // Ações
    permissoes.acoes_ver = permissoesMapa['Ações']?.includes('ver') || false;
    permissoes.acoes_criar = permissoesMapa['Ações']?.includes('criar') || false;
    permissoes.acoes_editar = permissoesMapa['Ações']?.includes('editar') || false;
    permissoes.acoes_excluir = permissoesMapa['Ações']?.includes('excluir') || false;

    // Agenda
    permissoes.agenda_ver = permissoesMapa['Agenda']?.includes('ver') || false;
    permissoes.agenda_criar = permissoesMapa['Agenda']?.includes('criar') || false;
    permissoes.agenda_editar = permissoesMapa['Agenda']?.includes('editar') || false;
    permissoes.agenda_excluir = permissoesMapa['Agenda']?.includes('excluir') || false;

    // Relatórios (agregados)
    permissoes.relatorios_ver = permissoesMapa['Relatórios']?.includes('ver') || false;
    permissoes.relatorios_exportar = permissoesMapa['Relatórios']?.includes('exportar') || false;
    
    console.log('🔍 FRONTEND - Permissões convertidas para colunas:', permissoes);
    
    // Preparar dados finais para envio
    const dadosEnvio = { nome, ...permissoes };
    console.log('🔍 FRONTEND - Dados a enviar:', dadosEnvio);
    
    try {
        if (form.id.value) {
            console.log('🔍 FRONTEND - Atualizando perfil:', form.id.value);
            const { error: putError } = await window.api.put(window.endpoints.perfis.update(form.id.value), dadosEnvio);
            if (putError) throw putError;
            // Mostrar modal de sucesso de atualização
            window.showUpdateSuccessModal();
        } else {
            console.log('🔍 FRONTEND - Criando novo perfil');
            const { error: postError } = await window.api.post(window.endpoints.perfis.create, dadosEnvio);
            if (postError) throw postError;
            // Mostrar modal de sucesso de cadastro
            window.showSuccessModal();
        }
        closePerfilModal();
        if (typeof window.carregarPerfisGrid === 'function') {
            await window.carregarPerfisGrid();
        } else {
            await carregarPerfis();
        }
    } catch (error) {
        console.error('❌ FRONTEND - Erro ao salvar perfil:', error);
        console.error('❌ FRONTEND - Detalhes do erro:', error.response || error);
        mostrarToast('Erro ao salvar perfil', 'error');
    }
}

// Visualizar usuário
async function visualizarUsuario(codigo) {
    try {
        const usuario = await api.get(`/usuarios/${codigo}`);

        const modal = document.getElementById('userModal'); // ID correto
        const modalTitle = modal.querySelector('#modalTitle');
        const form = document.getElementById('usuarioForm'); // ID correto

        // Configurar o título e ícone do modal
        modalTitle.innerHTML = '<i class="fas fa-eye"></i> Visualizar Usuário';

        // Preencher o formulário com os dados do usuário
        form.codigo.value = usuario.codigo;
        form.nome.value = usuario.nome;
        form.email.value = usuario.email;
        form.tipo.value = usuario.nivel;
        form.status.value = usuario.status;

        // Desabilitar todos os campos
        Array.from(form.elements).forEach(element => {
            element.disabled = true;
        });

        // Esconder campos de senha
        form.senha.parentElement.style.display = 'none';
        form.confirmar_senha.parentElement.style.display = 'none';

        // Esconder botões de ação do formulário
        const formActions = form.querySelector('.form-actions');
        if (formActions) {
            formActions.style.display = 'none';
        }

        // Mostrar o modal imediatamente
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Configurar o evento de submit do formulário para fechar o modal
        form.onsubmit = (e) => {
            e.preventDefault();
            closeModal();
        };

    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        mostrarToast('Erro ao carregar dados do usuário: ' + error.message, 'error');
    }
}

// Editar usuário (função que abre o modal de edição)
async function editarUsuario(codigo) {
    try {
        const usuario = await api.get(`/usuarios/${codigo}`);

        const modal = document.getElementById('userModal'); // ID correto
        const modalTitle = modal.querySelector('#modalTitle');
        let form = document.getElementById('usuarioForm'); // ID correto

        modalTitle.textContent = 'Editar Usuário';
        
        // Preencher o formulário com os dados do usuário
        form.codigo.value = usuario.codigo;
        form.nome.value = usuario.nome;
        form.email.value = usuario.email;
        form.tipo.value = usuario.nivel;
        form.status.value = usuario.status;

        // Reativar e mostrar campos de senha para edição, mas torná-los opcionais
        form.senha.value = ''; // Limpar para que o usuário insira nova senha se quiser
        form.confirmar_senha.value = '';
        form.senha.removeAttribute('required');
        form.confirmar_senha.removeAttribute('required');
        form.senha.parentElement.style.display = 'block';
        form.confirmar_senha.parentElement.style.display = 'block';

        // Re-habilitar todos os campos
        Array.from(form.elements).forEach(element => {
            element.disabled = false;
        });

        // Substituir handler anterior
        form.onsubmit = null;

        // Mostrar o modal imediatamente
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // O evento de submit será tratado por editarUsuarioSubmit
        form.onsubmit = (e) => { // Sobrescreve o onsubmit padrão para chamar a função de edição
            editarUsuarioSubmit(e); // Chama a nova função para o submit
        };

    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        mostrarToast('Erro ao carregar dados do usuário: ' + error.message, 'error');
    }
}

// Nova função para lidar com o submit do formulário de edição
async function editarUsuarioSubmit(event) {
            event.preventDefault();
    const form = event.target;
            const formData = new FormData(form);
            
    const usuarioAtualizado = {
                codigo: form.codigo.value,
                nome: formData.get('nome'),
                email: formData.get('email'),
                nivel: formData.get('tipo'),
                status: formData.get('status')
            };

            const senha = formData.get('senha');
    const confirmarSenha = formData.get('confirmar_senha');
            
            if (senha || confirmarSenha) {
                if (senha !== confirmarSenha) {
            mostrarToast('As senhas não coincidem', 'error');
            return;
                }
        usuarioAtualizado.senha = senha;
            }

            try {
        const response = await api.put(`/usuarios/${usuarioAtualizado.codigo}`, usuarioAtualizado);

        if (response) {
                mostrarToast('Usuário atualizado com sucesso!', 'success');
                carregarUsuarios();
            form.reset();
            closeModal();
        } else {
            throw new Error('Resposta inválida do servidor');
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        if (error.status === 404) {
            mostrarToast('Usuário não encontrado.', 'error');
        } else if (error.data?.details?.includes('multiple (or no) rows returned')) {
            mostrarToast('Erro ao processar a requisição. Por favor, tente novamente.', 'error');
        } else {
            mostrarToast('Erro ao atualizar usuário: ' + (error.data?.message || error.message), 'error');
        }
    }
}

// Função para confirmar exclusão
function confirmarExclusao(codigo) {
    try {
        const modal = document.getElementById('deleteModal');
        if (!modal) {
            throw new Error('Modal de confirmação não encontrado');
        }

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (!confirmBtn) {
            throw new Error('Botão de confirmação não encontrado');
        }

        // Remover event listener anterior se existir
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Adicionar novo event listener
        newConfirmBtn.addEventListener('click', () => {
            excluirUsuario(codigo);
        });
        
        // Mostrar o modal
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erro ao preparar exclusão:', error);
        mostrarToast('Erro ao preparar exclusão: ' + error.message, 'error');
    }
}

// Função para excluir usuário
async function excluirUsuario(codigo) {
    try {
        await api.delete(`/usuarios/${codigo}`);
        mostrarToast('Usuário excluído com sucesso!', 'success');
        closeDeleteModal();
        await carregarUsuarios();
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        mostrarToast('Erro ao excluir usuário: ' + error.message, 'error');
    }
}

// Mostrar toast
function mostrarToast(mensagem, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.querySelector('.toast-container').appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Fechar modal de sucesso quando clicar fora dele
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (modal && event.target === modal) {
        closeSuccessModal();
    }
    
    const updateModal = document.getElementById('updateSuccessModal');
    if (updateModal && event.target === updateModal) {
        closeUpdateSuccessModal();
    }
});

// Adicionar funções ao escopo global (Perfil)
window.openPerfilModal = openPerfilModal;
window.closePerfilModal = closePerfilModal;
window.visualizarPerfil = visualizarPerfil;
window.editarPerfil = editarPerfil;
window.confirmarExclusaoPerfil = confirmarExclusaoPerfil;
window.renderPermissionsMatrix = renderPermissionsMatrix;
window.mostrarToast = mostrarToast;
window.showSuccessModal = showSuccessModal;
window.closeSuccessModal = closeSuccessModal;
window.showUpdateSuccessModal = showUpdateSuccessModal;
window.closeUpdateSuccessModal = closeUpdateSuccessModal;

function fecharModal() {
    const modal = document.getElementById('modalUsuario');
    if (modal) {
        // Adicionar animação de saída
        const modalContent = modal.querySelector('.modal-content');
            modalContent.style.transform = 'translateY(-20px)';
            modalContent.style.opacity = '0';

        // Remover o modal após a animação
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
} 