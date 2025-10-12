// Função de debug para testar a funcionalidade
function debugColaboradores() {
    console.log('🐛 === DEBUG COLABORADORES ===');
    console.log('Testando carregamento de colaboradores...');
    
    // Testar carregamento
    carregarColaboradores().then(() => {
        console.log('✅ Carregamento de colaboradores OK');
        
        // Verificar se há colaboradores na tabela
        const tbody = document.querySelector('.table-container table tbody');
        const rows = tbody.querySelectorAll('tr');
        console.log('📊 Número de colaboradores na tabela:', rows.length);
        
        if (rows.length > 0) {
            // Testar visualização do primeiro colaborador
            const firstRow = rows[0];
            const viewBtn = firstRow.querySelector('.view-btn');
            if (viewBtn) {
                const onclick = viewBtn.getAttribute('onclick');
                console.log('🔍 Primeiro botão de visualização:', onclick);
                
                // Extrair código do onclick
                const match = onclick.match(/visualizarColaborador\((\d+)\)/);
                if (match) {
                    const codigo = match[1];
                    console.log('🧪 Testando visualização do colaborador:', codigo);
                    
                    // Simular clique após 2 segundos
                    setTimeout(() => {
                        visualizarColaborador(codigo);
                    }, 2000);
                }
            }
        }
    }).catch(error => {
        console.error('❌ Erro no debug:', error);
    });
}

// Função para verificar se os dados estão corretos
function verificarDadosColaborador(colaborador, codigoEsperado) {
    console.log('=== VERIFICAÇÃO DE DADOS ===');
    console.log('Código esperado:', codigoEsperado);
    console.log('Código recebido:', colaborador.codigo);
    console.log('Nome:', colaborador.nome);
    console.log('Email:', colaborador.email);
    console.log('Dados completos:', colaborador);
    console.log('==========================');
    
    if (colaborador.codigo != codigoEsperado) {
        console.error('❌ ERRO: Código não confere!');
        return false;
    }
    console.log('✅ Dados verificados com sucesso');
    return true;
}

// Função auxiliar para formatar data em pt-BR
function formatarDataPtBr(dataStr) {
    if (!dataStr) return '';
    const d = new Date(dataStr);
    if (isNaN(d)) return dataStr;
    return d.toLocaleDateString('pt-BR');
}

// Avatar padrão inline (evita 404)
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA3MC4zNTg5IDI3LjM1ODkgNjMgMzcgNjNINjNDNzIuNjQxMSA2MyA4MCA3MC4zNTg5IDgwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+';

// Função para carregar colaboradores
async function carregarColaboradores() {
    try {
        const colaboradores = await api.get('/colaboradores');
        const tbody = document.querySelector('.table-container table tbody');
        tbody.innerHTML = '';

        colaboradores.forEach(colaborador => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${colaborador.foto || DEFAULT_AVATAR}"></td>
                <td>${colaborador.codigo}</td>
                <td>${colaborador.nome}</td>
                <td>${colaborador.email}</td>
                <td>${colaborador.telefone}</td>
                <td>${colaborador.cargo}</td>
                <td>${formatarDataPtBr(colaborador.data_admissao)}</td>
                <td><span class="status ${colaborador.status.toLowerCase()}">${colaborador.status}</span></td>
                <td class="actions">
                    <button class="action-btn view-btn" onclick="visualizarColaborador('${colaborador.codigo}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editarColaborador('${colaborador.codigo}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="confirmarExclusao('${colaborador.codigo}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        mostrarToast('Erro ao carregar colaboradores', 'error');
        throw error; // Propagar erro para a função principal
    }
}

// Função para criar colaborador
async function criarColaborador(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const colaborador = {
        nome: (formData.get('nome') || '').trim(),
        email: (formData.get('email') || '').trim(),
        telefone: (formData.get('telefone') || '').trim(),
        cargo: (formData.get('cargo') || '').trim(),
        data_admissao: formData.get('data_admissao') ? formData.get('data_admissao') : new Date().toISOString().split('T')[0],
        status: formData.get('status'),
        perfil: formData.get('perfil') || null,
        foto: formData.get('foto') || null
    };

    try {
        const response = await api.post('/colaboradores', colaborador);
        carregarColaboradores();
        event.target.reset();
        closeModal();
        showSuccessModal(response.senha_temporaria, colaborador.email);
    } catch (error) {
        if (error.data?.details?.includes('colaboradores_email_key')) {
            mostrarToast('Este email já está cadastrado para outro colaborador.', 'error');
        } else if (error.status === 500) {
            mostrarToast('Erro ao criar colaborador: ' + (error.data?.message || 'verifique os campos e tente novamente.'), 'error');
        } else {
            mostrarToast('Erro ao processar a requisição: ' + (error.data?.message || error.message || ''), 'error');
        }
    }
}

// Função para limpar formulário
function limparFormulario() {
    const form = document.getElementById('colaboradorForm');
    if (form) {
        console.log('🧹 Limpando formulário...');
        form.reset();
        // Limpar campos manualmente para garantir
        if (form.codigo) form.codigo.value = '';
        form.nome.value = '';
        form.email.value = '';
        form.telefone.value = '';
        form.cargo.value = '';
        form.data_admissao.value = '';
        const statusInput = form.querySelector('input[name="status"]');
        if (statusInput) statusInput.value = 'Ativo';
        const toggle = form.querySelector('.status-toggle');
        if (toggle) {
            toggle.checked = true;
            toggle.disabled = false;
        }
        // Atualizar label de status
        const statusLabel = document.querySelector('.status-label-modal');
        if (statusLabel) {
            statusLabel.textContent = 'Ativo';
        }
        form.perfil.value = '';
        const fotoHidden = form.querySelector('input[name="foto"]');
        if (fotoHidden) fotoHidden.value = '';
        const preview = document.getElementById('fotoPreview');
        if (preview) preview.src = DEFAULT_AVATAR;
        console.log('✅ Formulário limpo');
    }
}

// Função para visualizar colaborador
async function visualizarColaborador(codigo) {
    try {
        console.log('👁️ Visualizando colaborador com código:', codigo);
        
        // Limpar formulário antes de carregar novos dados
        limparFormulario();
        
        const response = await api.get(`/colaboradores/${codigo}`);
        const colaborador = response;
        
        // Verificar se os dados estão corretos
        if (!verificarDadosColaborador(colaborador, codigo)) {
            throw new Error('Dados incorretos recebidos do servidor');
        }
        
        console.log('Valor do perfil:', colaborador.perfil);

        const modal = document.getElementById('colaboradorModal');
        const modalTitle = modal.querySelector('#modalTitle');
        // Remover event listeners anteriores do formulário antes de adicionar novos
        const formOriginal = document.getElementById('colaboradorForm');
        const formClonado = formOriginal.cloneNode(true);
        formOriginal.parentNode.replaceChild(formClonado, formOriginal);
        const form = document.getElementById('colaboradorForm');

        modalTitle.textContent = 'Visualizar Colaborador';
        
        // Preencher o formulário com os dados do colaborador
        // Código não é mais exibido no formulário de cadastro/edição
        const statusInput = form.querySelector('input[name="status"]');
        const statusValor = colaborador.status || 'Ativo';
        if (statusInput) statusInput.value = statusValor;
        const toggle = form.querySelector('.status-toggle');
        let ativo = false; // Declarar variável fora do bloco if
        if (toggle) {
            ativo = (statusValor || '').toLowerCase() === 'ativo';
            toggle.checked = ativo;
        }
        // Atualizar label de status
        const statusLabel = document.querySelector('.status-label-modal');
        if (statusLabel) {
            statusLabel.textContent = ativo ? 'Ativo' : 'Inativo';
        }
        form.nome.value = colaborador.nome || '';
        form.email.value = colaborador.email || '';
        form.telefone.value = colaborador.telefone || '';
        form.cargo.value = colaborador.cargo || '';
        form.data_admissao.value = colaborador.data_admissao || '';
        form.perfil.value = colaborador.perfil || '';
        const fotoHiddenView = form.querySelector('input[name="foto"]');
        const previewView = document.getElementById('fotoPreview');
        if (fotoHiddenView) fotoHiddenView.value = colaborador.foto || '';
        if (previewView) previewView.src = colaborador.foto || DEFAULT_AVATAR;
        console.log('Valor definido no campo perfil (visualizar):', form.perfil.value);

        // Inicializar handlers antes de desabilitar
        inicializarStatusToggle();
        inicializarFotoHandlers();
        
        // Desabilitar todos os campos
        Array.from(form.elements).forEach(element => {
            element.disabled = true;
        });
        // Desabilitar handlers de foto
        const fotoInputV = document.getElementById('fotoInput');
        if (fotoInputV) fotoInputV.disabled = true;
        const removeBtnV = document.getElementById('removeFotoBtn');
        if (removeBtnV) removeBtnV.disabled = true;
        // Desabilitar toggle visualmente
        if (toggle) toggle.disabled = true;

        // Esconder ações (Cancelar/Salvar) no modo visualização
        const actions = form.querySelector('.form-actions');
        if (actions) {
            actions.style.display = 'none';
        }

        // Mostrar o modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Configurar o evento de submit do formulário
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal();
        });
    } catch (error) {
        console.error('❌ Erro ao visualizar colaborador:', error);
        mostrarToast('Erro ao carregar dados do colaborador: ' + error.message, 'error');
    }
}

// Função para editar colaborador
async function editarColaborador(codigo) {
    try {
        console.log('✏️ Editando colaborador com código:', codigo);
        
        // Limpar formulário antes de carregar novos dados
        limparFormulario();
        
        const response = await api.get(`/colaboradores/${codigo}`);
        const colaborador = response;
        
        // Verificar se os dados estão corretos
        if (!verificarDadosColaborador(colaborador, codigo)) {
            throw new Error('Dados incorretos recebidos do servidor');
        }
        
        console.log('Valor do perfil para edição:', colaborador.perfil);

        const modal = document.getElementById('colaboradorModal');
        const modalTitle = modal.querySelector('#modalTitle');
        // Remover event listeners anteriores do formulário antes de adicionar novos
        const formOriginal = document.getElementById('colaboradorForm');
        const formClonado = formOriginal.cloneNode(true);
        formOriginal.parentNode.replaceChild(formClonado, formOriginal);
        const form = document.getElementById('colaboradorForm');

        modalTitle.textContent = 'Editar Colaborador';
        
        // Preencher o formulário com os dados do colaborador
        // Código não exibido no formulário
        const statusInput2 = form.querySelector('input[name="status"]');
        const statusValor2 = colaborador.status || 'Ativo';
        if (statusInput2) statusInput2.value = statusValor2;
        const toggle2 = form.querySelector('.status-toggle');
        let ativo = false; // Declarar variável fora do bloco if
        if (toggle2) {
            ativo = (statusValor2 || '').toLowerCase() === 'ativo';
            toggle2.checked = ativo;
            toggle2.disabled = false;
        }
        // Atualizar label de status
        const statusLabel = document.querySelector('.status-label-modal');
        if (statusLabel) {
            statusLabel.textContent = ativo ? 'Ativo' : 'Inativo';
        }
        form.nome.value = colaborador.nome || '';
        form.email.value = colaborador.email || '';
        form.telefone.value = colaborador.telefone || '';
        form.cargo.value = colaborador.cargo || '';
        form.data_admissao.value = colaborador.data_admissao || '';
        form.perfil.value = colaborador.perfil || '';
        const fotoHiddenEdit = form.querySelector('input[name="foto"]');
        const previewEdit = document.getElementById('fotoPreview');
        if (fotoHiddenEdit) fotoHiddenEdit.value = colaborador.foto || '';
        if (previewEdit) previewEdit.src = colaborador.foto || DEFAULT_AVATAR;
        console.log('Valor definido no campo perfil (editar):', form.perfil.value);

        // Reabilitar campos (exceto código) para edição
        Array.from(form.elements).forEach(element => {
            if (element.name !== 'codigo') {
                element.disabled = false;
            }
        });
        inicializarStatusToggle();
        inicializarFotoHandlers();

        // Garantir que ações estejam visíveis no modo edição
        const actions = form.querySelector('.form-actions');
        if (actions) {
            actions.style.display = 'flex';
            // Adicionar botão de resetar senha se ainda não existir
            if (!actions.querySelector('#btnResetSenha')) {
                const btnReset = document.createElement('button');
                btnReset.type = 'button';
                btnReset.id = 'btnResetSenha';
                btnReset.className = 'btn-secondary';
                btnReset.innerHTML = '<i class="fas fa-key"></i> Resetar Senha';
                btnReset.style.marginRight = 'auto';
                btnReset.addEventListener('click', async () => {
                    try {
                        console.log('[RESET] Click reset for codigo:', codigo);
                        // Abrir modal padrão do sistema
                        const modal = document.getElementById('resetConfirmModal');
                        const input = document.getElementById('resetConfirmInput');
                        const btnOk = document.getElementById('resetConfirmBtn');
                        const btnCancel = document.getElementById('resetCancelBtn');
                        const btnCancel2 = document.getElementById('resetCancelBtn2');

                        if (!modal || !input || !btnOk) {
                            console.error('Modal de confirmação de reset não encontrado');
                            return;
                        }

                        modal.style.display = 'flex';
                        input.value = '';
                        input.focus();

                        const closeModal = () => { modal.style.display = 'none'; };
                        const onCancel = () => { closeModal(); };

                        // Encerrar possíveis listeners antigos
                        btnOk.replaceWith(btnOk.cloneNode(true));
                        const newOk = document.getElementById('resetConfirmBtn');
                        btnCancel && btnCancel.replaceWith(btnCancel.cloneNode(true));
                        btnCancel2 && btnCancel2.replaceWith(btnCancel2.cloneNode(true));
                        const newCancel = document.getElementById('resetCancelBtn');
                        const newCancel2 = document.getElementById('resetCancelBtn2');

                        newCancel && newCancel.addEventListener('click', onCancel);
                        newCancel2 && newCancel2.addEventListener('click', onCancel);

                        await new Promise((resolve, reject) => {
                            newOk.addEventListener('click', () => {
                                if (input.value === 'CONFIRMO') {
                                    resolve(true);
                                } else {
                                    try { mostrarToast('Você precisa digitar CONFIRMO (maiúsculas).', 'error'); } catch(_) {}
                                }
                            });
                            // Fechar ao ESC
                            const onKey = (e) => { if (e.key === 'Escape') { closeModal(); reject(new Error('cancelado')); } };
                            modal.addEventListener('keydown', onKey, { once: true });
                        }).catch(() => false);

                        closeModal();
                        if (input.value !== 'CONFIRMO') return;

                        // feedback visual
                        btnReset.disabled = true;
                        const oldLabel = btnReset.innerHTML;
                        btnReset.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';

                        const endpoint = `/colaboradores/${codigo}/reset-senha`;
                        console.log('[RESET] POST', endpoint);
                        const resp = await api.post(endpoint, {});
                        console.log('[RESET] Response:', resp);
                        const email = (resp && resp.email) || colaborador.email;
                        const senhaTemp = resp && resp.senha_temporaria;

                        if (!senhaTemp) {
                            throw { message: 'Resposta sem senha_temporaria', data: resp };
                        }

                        if (window.showSuccessModal) {
                            showSuccessModal(senhaTemp, email);
                        } else if (window.Swal && Swal.fire) {
                            await Swal.fire({
                                title: 'Senha resetada!',
                                html: `<div style=\"text-align:left\">Email: <b>${email}</b><br>Senha temporária: <b>${senhaTemp}</b></div>`,
                                icon: 'success'
                            });
                        } else {
                            alert(`Senha temporária: ${senhaTemp}`);
                        }
                        try { mostrarToast('Senha temporária gerada com sucesso', 'success'); } catch(_) {}
                        btnReset.innerHTML = oldLabel;
                        btnReset.disabled = false;
                    } catch (err) {
                        console.error('[RESET] Erro ao resetar senha:', err);
                        const msg = (err && err.data && (err.data.error || err.data.message)) || err.message || 'Erro ao resetar senha';
                        try { mostrarToast(msg, 'error'); } catch(_) {}
                        btnReset.disabled = false;
                        btnReset.innerHTML = '<i class="fas fa-key"></i> Resetar Senha';
                    }
                });
                actions.prepend(btnReset);
            }
        }

        // Mostrar o modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Configurar o evento de submit do formulário
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            
            const colaboradorAtualizado = {
                codigo: codigo,
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                cargo: formData.get('cargo'),
                data_admissao: formData.get('data_admissao') ? formData.get('data_admissao') : new Date().toISOString().split('T')[0],
                status: formData.get('status'),
                perfil: formData.get('perfil') || null,
                foto: formData.get('foto') || null
            };

            try {
                const response = await api.put(`/colaboradores/${codigo}`, colaboradorAtualizado);
                
                if (response) {
                    carregarColaboradores();
                    closeModal();
                    showUpdateSuccessModal(colaboradorAtualizado.status);
                } else {
                    throw new Error('Resposta inválida do servidor');
                }
            } catch (error) {
                console.error('Erro ao atualizar colaborador:', error);
                if (error.status === 404) {
                    mostrarToast('Colaborador não encontrado.', 'error');
                } else if (error.data?.details?.includes('multiple (or no) rows returned')) {
                    mostrarToast('Erro ao processar a requisição. Por favor, tente novamente.', 'error');
                } else {
                    mostrarToast('Erro ao atualizar colaborador: ' + (error.data?.message || error.message), 'error');
                }
            }
        });
    } catch (error) {
        console.error('❌ Erro ao editar colaborador:', error);
        mostrarToast('Erro ao carregar dados do colaborador: ' + error.message, 'error');
    }
}

// Função para excluir colaborador
async function excluirColaborador(codigo) {
    try {
        const codigoStr = codigo.toString().padStart(5, '0');
        
        const result = await window.bloqueioExclusao.deleteWithCheck(
            'colaboradores',
            codigoStr,
            () => { closeDeleteModal(); carregarColaboradores(); },
            (details) => {
                // Mensagem específica para FK comum em comissões
                const msg = (details && details.message) || 'Não é possível excluir colaborador: existem lançamentos/comissões vinculados.';
                if (window.bloqueioExclusao && typeof window.bloqueioExclusao.openDependencyBlockModal === 'function') {
                    window.bloqueioExclusao.openDependencyBlockModal(msg, details || {});
                } else {
                    mostrarToast(msg, 'error');
                }
            }
        );
        if (!result.ok && !result.blocked) {
            mostrarToast('Erro ao excluir colaborador', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir colaborador:', error);
        const backendMsg = error?.data?.message || 'Erro ao excluir colaborador';
        mostrarToast(backendMsg, 'error');
    }
}

// Função para mostrar toast
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

// Função para carregar a lista de perfis
async function carregarPerfis() {
    try {
        
        const perfis = await api.get('/perfis');
        
        const select = document.querySelector('select[name="perfil"]');
        
        // Limpar opções existentes
        select.innerHTML = '<option value="">Selecione um perfil</option>';
        
        // Adicionar perfis
        perfis.forEach(perfil => {
            const option = document.createElement('option');
            option.value = perfil.codigo;
            option.textContent = `${perfil.nome}`;
            select.appendChild(option);
        });
        
        
        
    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        mostrarToast('Erro ao carregar lista de perfis', 'error');
        throw error; // Propagar erro para a função principal
    }
}

// Função para confirmar exclusão
function confirmarExclusao(codigo) {
    const modal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    // Remover event listener anterior se existir
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Adicionar novo event listener
    newConfirmBtn.addEventListener('click', () => excluirColaborador(codigo));
    
    modal.style.display = 'flex';
}

// Inicializar toggle de status
function inicializarStatusToggle(context) {
    const root = document; // agora o controle fica no header
    const toggle = root.querySelector('.status-toggle');
    const input = root.querySelector('input[name="status"]');
    const statusLabel = root.querySelector('.status-label-modal');
    if (!toggle || !input) return;
    
    // Remover listeners antigos mantendo o input dentro do label
    const t = toggle; // já é o input do tipo checkbox
    const syncFromModel = () => {
        t.checked = (input.value || '').toLowerCase() === 'ativo';
        // Atualizar label de status
        if (statusLabel) {
            statusLabel.textContent = t.checked ? 'Ativo' : 'Inativo';
        }
    };
    const syncFromToggle = () => {
        input.value = t.checked ? 'Ativo' : 'Inativo';
        // Atualizar label de status
        if (statusLabel) {
            statusLabel.textContent = t.checked ? 'Ativo' : 'Inativo';
        }
    };
    syncFromModel();
    t.addEventListener('change', () => {
        if (t.disabled) return;
        syncFromToggle();
    });
}

// Inicializar foto (preview + base64 no hidden)
function inicializarFotoHandlers() {
    const input = document.getElementById('fotoInput'); // agora no header
    const preview = document.getElementById('fotoPreview'); // no header
    const hidden = document.querySelector('input[name="foto"]');
    const removeBtn = document.getElementById('removeFotoBtn');

    if (!input || !preview || !hidden) return;

    // Remover listeners antigos
    const novoInput = input.cloneNode(true);
    input.parentNode.replaceChild(novoInput, input);
    const fileInput = document.getElementById('fotoInput');

    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) {
            mostrarToast('A imagem deve ter no máximo 500KB.', 'error');
            fileInput.value = '';
            return;
        }
        
        // Comprimir imagem antes de converter para Base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Redimensionar para máximo 300x300px
            const maxSize = 300;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar imagem redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para Base64 com qualidade 0.8
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            preview.src = base64;
            hidden.value = base64;
        };
        
        img.src = URL.createObjectURL(file);
    });

    // Clicar na foto abre o seletor de arquivo
    preview.addEventListener('click', () => {
        if (input.disabled) return;
        fileInput.click();
    });

    // Remover botão de remover do layout atual (não exibido)
}

// Filtro de busca e status (cliente)
function aplicarFiltros() {
    const termo = (document.querySelector('.search-box input')?.value || '').toLowerCase();
    const statusFiltro = (document.querySelector('.filter-options select')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('.table-container table tbody tr');

    rows.forEach(row => {
        const textoLinha = row.innerText.toLowerCase();
        const statusSpan = row.querySelector('.status');
        const statusLinha = statusSpan ? statusSpan.textContent.toLowerCase() : '';

        const passaBusca = termo === '' || textoLinha.includes(termo);
        const passaStatus = statusFiltro === '' || statusLinha === statusFiltro;
        row.style.display = (passaBusca && passaStatus) ? '' : 'none';
    });
}

// Carregar colaboradores quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verificar autenticação antes de carregar a página
        if (window.authGuard) {
            const isAuthenticated = await window.authGuard.checkAuthentication();
            if (!isAuthenticated) {
                return; // Redirecionará para login automaticamente
            }
        }
        
        // Mostrar spinner centralizado ao iniciar
        mostrarSpinner();
        
        // Carregar dados em paralelo
        await Promise.all([
            carregarColaboradores(),
            carregarPerfis()
        ]);
        
        // Ocultar spinner centralizado quando tudo carregar
        ocultarSpinner();
        
        // Executar debug após carregamento (opcional)
        // setTimeout(() => debugColaboradores(), 3000);
        
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        mostrarToast('Erro ao carregar dados da página', 'error');
        // Ocultar spinner mesmo em caso de erro
        ocultarSpinner();
    }
    
    // Adicionar evento de submit ao formulário apenas para criação
    const form = document.getElementById('colaboradorForm');
    
    // Remover event listeners anteriores
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Inicializar toggle de status no formulário clonado
    inicializarStatusToggle(document.getElementById('colaboradorForm'));
    inicializarFotoHandlers();
    
    // Adicionar event listener apenas para criação
    document.getElementById('colaboradorForm').addEventListener('submit', criarColaborador);

    // Listeners de filtro
    const inputBusca = document.querySelector('.search-box input');
    const selectStatus = document.querySelector('.filter-options select');
    if (inputBusca) inputBusca.addEventListener('input', aplicarFiltros);
    if (selectStatus) selectStatus.addEventListener('change', aplicarFiltros);
});

// Exportar funções para uso global
window.visualizarColaborador = visualizarColaborador;
window.editarColaborador = editarColaborador;
window.excluirColaborador = excluirColaborador;
window.confirmarExclusao = confirmarExclusao;
window.debugColaboradores = debugColaboradores; 