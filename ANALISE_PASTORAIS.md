# 📊 ANÁLISE COMPLETA - ABA PASTORAIS

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Estrutura HTML](#estrutura-html)
3. [Estilos CSS - Desktop](#estilos-css---desktop)
4. [Estilos CSS - Mobile](#estilos-css---mobile)
5. [Funcionalidades JavaScript](#funcionalidades-javascript)
6. [Backend e API](#backend-e-api)
7. [Componentes Principais](#componentes-principais)
8. [Fluxos de Dados](#fluxos-de-dados)
9. [Responsividade](#responsividade)

---

## 🎯 VISÃO GERAL

A aba **Pastorais** é uma interface completa para gerenciamento de pastorais da paróquia, permitindo:
- ✅ Listar pastorais com filtros e busca
- ✅ Criar novas pastorais
- ✅ Editar pastorais existentes
- ✅ Visualizar detalhes
- ✅ Duplicar pastorais
- ✅ Excluir pastorais (com verificação de dependências)
- ✅ Controle de status (Ativo/Inativo)
- ✅ Upload de fotos
- ✅ Gerenciamento responsivo (desktop e mobile)

**Arquivo Principal:** `frontend/src/pastorais.html`

---

## 📄 ESTRUTURA HTML

### 1. **HEADER SUPERIOR (Desktop e Mobile)**
```html
<div class="top-header">
    <div class="header-left">
        <div class="logo-section">
            <button class="hamburger-menu" id="hamburgerMenu">☰</button>
            <span>ParoquiaON</span>
        </div>
        <div class="nav-links">...</div>
    </div>
    <div class="header-right">...</div>
</div>
```

**Características:**
- Fixo no topo (z-index: 1000)
- Altura: 80px (desktop) / 60px (mobile)
- Fundo azul (#1e3a8a)
- Menu hambúrguer visível apenas no mobile

### 2. **MENU MOBILE LATERAL**
```html
<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
<div class="mobile-menu" id="mobileMenu">
    <!-- Links do menu -->
</div>
```

**Funcionalidades:**
- Slide-in da esquerda
- Overlay escuro com fade
- Fecha ao clicar no overlay ou botão X
- Z-index: 1500 (acima do header)

### 3. **ÁREA DE CONTEÚDO PRINCIPAL**
```html
<div class="main-content">
    <div class="search-wrapper">
        <div class="search-box-hero">
            <input id="searchPastorais" />
        </div>
        <button class="btn-nova-pastoral">+ Nova Pastoral</button>
    </div>
    <div class="list-container">
        <div id="loader-pastorais" class="loader-overlay-pastorais">...</div>
        <div id="pastoraisRows" class="rows"></div>
    </div>
</div>
```

**Componentes:**
- **Busca:** Input com ícone de lupa
- **Botão Nova Pastoral:** Absoluto à direita na busca
- **Lista:** Container scrollável com cards de pastorais
- **Loader:** Spinner centralizado durante carregamento

### 4. **MODAL PRINCIPAL (Criar/Editar/Visualizar)**
```html
<div class="modal" id="pastoralModal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modalTitle">Nova Pastoral</h2>
            <div class="modal-header-actions">
                <!-- Toggle de Status -->
                <button class="close-modal">×</button>
            </div>
        </div>
        <div class="modal-body">
            <form id="pastoralForm">
                <!-- Campos do formulário -->
            </form>
        </div>
    </div>
</div>
```

**Campos do Formulário:**
1. **Foto:** Upload com preview (160x160px)
2. **Nome da Pastoral:** Texto obrigatório
3. **Responsável:** Select com lista de pessoas
4. **Contato:** Telefone ou email
5. **Tipo:** Texto (padrão: "Geral")
6. **Observação:** Textarea (máx. 100 caracteres com contador)
7. **Status:** Toggle switch (Ativo/Inativo)

### 5. **MODAL DE CONFIRMAÇÃO DE EXCLUSÃO**
```html
<div id="deleteModal" class="modal">
    <!-- Confirmação de exclusão -->
</div>
```

---

## 🎨 ESTILOS CSS - DESKTOP

### **Header Superior**
```css
.top-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #1e3a8a;
    height: 80px;
    padding: 0;
}
```

### **Busca e Botão Nova Pastoral**
```css
.search-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
}

.search-box-hero {
    max-width: 720px;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e6e9ef;
    border-radius: 8px;
}

.btn-nova-pastoral {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: #1e3a8a;
    padding: 12px 20px;
}
```

### **Grid de Listagem**
```css
.pastorais-header {
    display: grid;
    grid-template-columns: 56px 1fr 1fr 140px 120px;
    gap: 16px;
    padding: 14px 0;
}

.row-card {
    display: grid;
    grid-template-columns: 56px 1fr 1fr 140px 120px auto;
    gap: 16px;
    padding: 12px;
    border: 1px solid #eef1f6;
    border-radius: 8px;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.row-card:hover {
    background: #f0f4ff;
    box-shadow: 0 6px 16px rgba(30, 58, 138, 0.15);
    transform: translateY(-2px);
}
```

**Colunas:**
1. **Avatar/Foto** (56px)
2. **Nome** (flex)
3. **Responsável** (flex)
4. **Tipo** (140px, centralizado)
5. **Status** (120px, centralizado)
6. **Ações** (auto - 3 botões: Editar, Duplicar, Excluir)

### **Botões de Ação**
```css
.btn-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
    transition: transform .12s ease;
}

.btn-icon.btn-edit {
    background: #1e3a8a;
    color: #ffffff;
}
```

### **Modal**
```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-content {
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    transform: translateY(-20px);
    transition: transform 0.3s ease;
}
```

### **Status Badges**
```css
.status.ativo {
    background-color: #1e3a8a;
    color: #ffffff;
}

.status.inativo {
    background-color: #dc2626;
    color: #ffffff;
}
```

---

## 📱 ESTILOS CSS - MOBILE

### **Breakpoints**
- `@media (max-width: 768px)` - Tablets e mobile
- `@media (max-width: 480px)` - Smartphones pequenos

### **Ajustes no Header (≤768px)**
```css
@media (max-width: 768px) {
    .top-header {
        height: 60px;
    }
    
    .hamburger-menu {
        display: flex; /* Visível */
        width: 36px;
        height: 36px;
    }
    
    .nav-links {
        display: none; /* Oculto */
    }
    
    .header-icon, .user-avatar {
        width: 36px;
        height: 36px;
    }
}
```

### **Ajustes na Busca (≤768px)**
```css
@media (max-width: 768px) {
    .search-wrapper {
        padding: 12px 16px;
        flex-wrap: nowrap;
    }
    
    .search-box-hero {
        max-width: calc(100% - 120px);
        height: 44px;
        padding: 10px 12px;
    }
    
    .btn-nova-pastoral {
        width: auto;
        padding: 0 14px;
        height: 44px;
    }
    
    .btn-nova-pastoral span {
        display: none; /* Apenas ícone */
    }
}
```

### **Ajustes nos Cards (≤768px)**
```css
@media (max-width: 768px) {
    .row-card {
        grid-template-columns: 48px 1fr auto !important;
        padding: 10px;
    }
    
    /* Ocultar colunas: Responsável, Tipo, Status */
    .row-card > div:nth-child(3),
    .row-card > div:nth-child(4),
    .row-card > div:nth-child(5) {
        display: none;
    }
    
    .row-card > div:first-child img,
    .row-card > div:first-child > div {
        width: 48px !important;
        height: 48px !important;
    }
    
    .row-card > div:nth-child(2) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
```

**Resultado Mobile:**
- ✅ Avatar (48px)
- ✅ Nome (com ellipsis)
- ✅ Ações (botões)

### **Ajustes para Smartphones Pequenos (≤480px)**
```css
@media (max-width: 480px) {
    .search-box-hero {
        max-width: calc(100% - 100px);
        height: 40px;
        padding: 8px 10px;
    }
    
    .btn-nova-pastoral {
        height: 40px;
        padding: 0 12px;
    }
    
    .row-card {
        grid-template-columns: 44px 1fr auto !important;
        padding: 8px;
    }
    
    .row-card > div:first-child img,
    .row-card > div:first-child > div {
        width: 44px !important;
        height: 44px !important;
    }
}
```

### **Menu Mobile**
```css
.mobile-menu {
    position: fixed;
    top: 0;
    left: -280px; /* Oculto por padrão */
    width: 280px;
    height: 100%;
    background: #ffffff;
    transition: left 0.3s ease;
    z-index: 1501;
}

.mobile-menu.open {
    left: 0; /* Visível */
}

.mobile-menu-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1500;
    opacity: 0;
    transition: opacity 0.3s ease;
}
```

---

## ⚙️ FUNCIONALIDADES JAVASCRIPT

### **1. Carregamento Inicial**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar lista de pessoas para select de responsáveis
    const { data: pessoas } = await api.get(endpoints.pessoas.list);
    pessoasById = pessoas.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    
    // Preencher select
    select.innerHTML = '<option value="">Selecione...</option>' + 
        pessoas.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    
    // Carregar pastorais
    carregar();
});
```

### **2. Função de Carregamento (IIFE)**
```javascript
(function(){
    let pessoasById = {};
    
    async function carregar() {
        const rows = document.getElementById('pastoraisRows');
        rows.innerHTML = '';
        showLoader(true);
        
        try {
            // Carregar pessoas
            const pessoasResp = await window.api.get(window.endpoints.pessoas.list);
            const pessoas = Array.isArray(pessoasResp.data) ? pessoasResp.data : [];
            pessoasById = pessoas.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
            
            // Carregar pastorais
            const pastResp = await window.api.get(window.endpoints.pastorais.list);
            const lista = Array.isArray(pastResp.data) ? pastResp.data : [];
            
            // Aplicar filtros
            const termo = document.getElementById('searchPastorais')?.value.trim().toLowerCase();
            const filtrada = lista.filter(p => {
                const nome = (p?.nome || '').toLowerCase();
                const tipo = (p?.tipo || '').toLowerCase();
                const responsavel = pessoasById[p.responsavel_id]?.nome?.toLowerCase() || '';
                return nome.includes(termo) || tipo.includes(termo) || responsavel.includes(termo);
            });
            
            // Renderizar cards
            filtrada.forEach(p => rows.appendChild(createRow(p)));
        } finally {
            showLoader(false);
        }
    }
    
    // Event listener para busca
    document.getElementById('searchPastorais').addEventListener('input', carregar);
    
    // Expor globalmente
    window.carregarPastorais = carregar;
})();
```

### **3. Criação de Cards (createRow)**
```javascript
function createRow(p) {
    const nome = p?.nome || '-';
    const respNome = pessoasById[p.responsavel_id]?.nome || '-';
    const tipo = p?.tipo || '-';
    const ativo = p?.ativo !== false;
    const statusText = ativo ? 'Ativo' : 'Inativo';
    const statusClass = ativo ? 'ativo' : 'inativo';
    const foto = p?.foto || '';
    
    const el = document.createElement('div');
    el.className = 'row-card';
    el.innerHTML = `
        <div>
            ${foto ? `<img src="${foto}" ... />` : 
              `<div style="...">${nome.charAt(0).toUpperCase()}</div>`}
        </div>
        <div>${nome}</div>
        <div>${respNome}</div>
        <div style="text-align:center;">${tipo}</div>
        <div style="text-align:center;">
            <span class="status ${statusClass}">${statusText}</span>
        </div>
        ${actionButtons(p?.id)}
    `;
    return el;
}
```

### **4. Botões de Ação**
```javascript
function actionButtons(id) {
    return `
        <div style="display:flex; gap:8px; justify-content:center;">
            <button class="btn-icon btn-edit" 
                    title="Editar" 
                    onclick="editarPastoral?.('${id}')">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon btn-duplicate" 
                    title="Duplicar" 
                    onclick="duplicarPastoral?.('${id}')">
                <i class="fa-regular fa-copy"></i>
            </button>
            <button class="btn-icon btn-delete" 
                    title="Excluir" 
                    onclick="excluirPastoral?.('${id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
}
```

### **5. Nova Pastoral**
```javascript
function novaPastoral() {
    const form = document.getElementById('pastoralForm');
    form.reset();
    delete form.dataset.id;
    
    // Resetar campos
    form.contato.value = '';
    form.tipo.value = '';
    form.observacao.value = '';
    
    // Resetar status
    document.getElementById('statusToggleModal').checked = true;
    document.getElementById('status').value = 'ativo';
    
    // Abrir modal
    document.getElementById('pastoralModal').style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Resetar foto
    const hiddenFoto = form.querySelector('input[name="foto"]');
    if (hiddenFoto) hiddenFoto.value = '';
    
    inicializarFotoHandlersPastoral();
}
```

### **6. Editar Pastoral**
```javascript
async function editarPastoral(id) {
    try {
        const { data: pastoral, error } = await api.get(endpoints.pastorais.get(id));
        if (error) throw error;
        
        const form = document.getElementById('pastoralForm');
        form.dataset.id = pastoral.id;
        
        // Preencher campos
        form.nome.value = pastoral.nome;
        document.getElementById('responsavel_id').value = pastoral.responsavel_id || '';
        form.contato.value = pastoral.contato || '';
        form.tipo.value = pastoral.tipo || '';
        form.observacao.value = pastoral.descricao || '';
        
        // Status
        const ativo = pastoral.ativo !== false;
        document.getElementById('statusToggleModal').checked = ativo;
        document.getElementById('status').value = ativo ? 'ativo' : 'inativo';
        
        // Foto
        const fotoHidden = form.querySelector('input[name="foto"]');
        const fotoPreview = document.getElementById('fotoPreview');
        if (fotoHidden) fotoHidden.value = pastoral.foto || '';
        if (fotoPreview && pastoral.foto) fotoPreview.src = pastoral.foto;
        
        // Abrir modal
        document.getElementById('pastoralModal').style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        inicializarFotoHandlersPastoral();
    } catch (error) {
        console.error('Erro ao carregar pastoral:', error);
        alert('Erro ao carregar pastoral');
    }
}
```

### **7. Salvar Pastoral**
```javascript
async function salvarPastoral(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Estado de loading
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML = '<span class="btn-spinner"></span> &nbsp;Salvando...';
    
    const formData = new FormData(form);
    const currentUser = window.authGuard?.getCurrentUser();
    
    const payload = {
        nome: formData.get('nome'),
        tipo: formData.get('tipo') || 'Geral',
        descricao: formData.get('observacao') || '',
        responsavel_id: formData.get('responsavel_id') ? Number(formData.get('responsavel_id')) : null,
        foto: formData.get('foto') || null,
        ativo: formData.get('status') === 'ativo',
        usuario_id: currentUser?.id ?? undefined,
        criado_por_email: currentUser?.email ?? undefined,
        criado_por_nome: currentUser?.nome ?? undefined
    };
    
    try {
        if (form.dataset.id) {
            // Atualizar
            const { error } = await api.put(endpoints.pastorais.update(form.dataset.id), payload);
            if (error) throw error;
            window.showUpdateSuccessModal(payload.ativo ? 'Ativo' : 'Inativo');
        } else {
            // Criar
            const { error } = await api.post(endpoints.pastorais.create, payload);
            if (error) throw error;
            window.showSuccessModal();
        }
        
        closeModal();
        window.carregarPastorais();
    } catch (error) {
        console.error('Erro ao salvar pastoral:', error);
        alert('Erro ao salvar pastoral');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerHTML = originalLabel;
    }
}
```

### **8. Excluir Pastoral**
```javascript
function excluirPastoral(id) {
    codigoParaExcluir = id;
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

document.getElementById('confirmDeleteBtn').onclick = async function() {
    if (!codigoParaExcluir) return;
    try {
        await window.bloqueioExclusao.deleteWithCheck(
            'pastorais',
            codigoParaExcluir,
            () => {
                closeDeleteModal();
                window.carregarPastorais();
                window.showDeleteSuccessModal();
            }
        );
    } catch (error) {
        console.error('Erro ao excluir pastoral:', error);
    }
};
```

### **9. Duplicar Pastoral**
```javascript
window.duplicarPastoral = async function(id) {
    try {
        const { data: pastoral, error } = await api.get(endpoints.pastorais.get(id));
        if (error) throw error;
        
        const form = document.getElementById('pastoralForm');
        novaPastoral();
        
        // Copiar dados
        form.nome.value = `${pastoral.nome} (cópia)`;
        document.getElementById('responsavel_id').value = pastoral.responsavel_id || '';
        form.contato.value = pastoral.contato || '';
        form.tipo.value = pastoral.tipo || '';
        form.observacao.value = pastoral.descricao || '';
        
        // Copiar foto
        const hiddenFoto = form.querySelector('input[name="foto"]');
        const fotoPreview = document.getElementById('fotoPreview');
        if (hiddenFoto) hiddenFoto.value = pastoral.foto || '';
        if (fotoPreview && pastoral.foto) fotoPreview.src = pastoral.foto;
    } catch (e) {
        console.error('Erro ao duplicar pastoral:', e);
        alert('Erro ao duplicar pastoral');
    }
}
```

### **10. Upload de Foto**
```javascript
function inicializarFotoHandlersPastoral() {
    const fileInput = document.getElementById('fotoInput');
    const preview = document.getElementById('fotoPreview');
    const hidden = document.querySelector('input[name="foto"]');
    
    // Reset listener
    const novoInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(novoInput, fileInput);
    const inputRef = document.getElementById('fotoInput');
    
    inputRef.addEventListener('change', () => {
        const file = inputRef.files && inputRef.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            preview.src = base64;
            hidden.value = base64; // Salvar base64
        };
        reader.readAsDataURL(file);
    });
}
```

### **11. Menu Mobile**
```javascript
function openMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const menu = document.getElementById('mobileMenu');
    
    overlay.style.display = 'block';
    menu.classList.add('open');
    setTimeout(() => overlay.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const menu = document.getElementById('mobileMenu');
    
    overlay.classList.remove('show');
    menu.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Event listeners
document.getElementById('hamburgerMenu').addEventListener('click', openMobileMenu);
document.getElementById('mobileMenuClose').addEventListener('click', closeMobileMenu);
document.getElementById('mobileMenuOverlay').addEventListener('click', closeMobileMenu);
```

### **12. Contador de Caracteres**
```javascript
function atualizarContador(textarea) {
    const contador = document.getElementById('charCount');
    const caracteresAtuais = textarea.value.length;
    const limite = textarea.maxLength; // 100
    
    contador.textContent = caracteresAtuais;
    
    // Mudar cor baseado no uso
    if (caracteresAtuais >= limite) {
        contador.style.color = '#dc3545'; // Vermelho
    } else if (caracteresAtuais >= limite * 0.8) {
        contador.style.color = '#ff9800'; // Laranja
    } else {
        contador.style.color = '#2196F3'; // Azul
    }
}
```

### **13. Toggle de Status**
```javascript
function toggleStatus() {
    const toggle = document.getElementById('statusToggleModal');
    const statusLabel = document.querySelector('.status-label-modal');
    const statusInput = document.getElementById('status');
    
    if (toggle.checked) {
        statusLabel.textContent = 'Ativo';
        statusInput.value = 'ativo';
    } else {
        statusLabel.textContent = 'Inativo';
        statusInput.value = 'inativo';
    }
}
```

---

## 🔌 BACKEND E API

### **Estrutura de Rotas**
```javascript
// backend/api-paroquiaon/src/routes/pastoralRoutes.js
router.get('/', pastoralController.listarPastorais);
router.get('/estatisticas', pastoralController.estatisticasPastorais);
router.get('/graficos', pastoralController.dadosGraficosPastorais);
router.get('/:id', pastoralController.buscarPastoral);
router.post('/', pastoralController.criarPastoral);
router.put('/:id', pastoralController.atualizarPastoral);
router.delete('/:id', pastoralController.excluirPastoral);
```

### **Controller - Listar Pastorais**
```javascript
async function listarPastorais(req, res) {
    try {
        const { data, error } = await supabase
            .from('pastorais')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao listar pastorais:', error);
        res.status(500).json({ error: 'Erro ao listar pastorais' });
    }
}
```

### **Controller - Buscar Pastoral**
```javascript
async function buscarPastoral(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('pastorais')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pastoral não encontrada' });
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar pastoral:', error);
        res.status(500).json({ error: 'Erro ao buscar pastoral' });
    }
}
```

### **Controller - Criar Pastoral**
```javascript
async function criarPastoral(req, res) {
    try {
        const dados = req.body;
        console.log('Dados recebidos para criar pastoral:', dados);
        
        const { data, error } = await supabase
            .from('pastorais')
            .insert([dados])
            .select()
            .single();
        
        if (error) {
            console.error('Erro do Supabase:', error);
            throw error;
        }
        
        console.log('Pastoral criada com sucesso:', data);
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao criar pastoral:', error);
        res.status(500).json({ error: 'Erro ao criar pastoral', details: error.message });
    }
}
```

### **Controller - Atualizar Pastoral**
```javascript
async function atualizarPastoral(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;
        
        const { data, error } = await supabase
            .from('pastorais')
            .update(dados)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Pastoral não encontrada' });
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao atualizar pastoral:', error);
        res.status(500).json({ error: 'Erro ao atualizar pastoral' });
    }
}
```

### **Controller - Excluir Pastoral**
```javascript
async function excluirPastoral(req, res) {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('pastorais')
            .delete()
            .eq('id', id)
            .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Pastoral não encontrada' });
        }
        
        res.json({ message: 'Pastoral excluída com sucesso', data });
    } catch (error) {
        console.error('Erro ao excluir pastoral:', error);
        res.status(500).json({ error: 'Erro ao excluir pastoral' });
    }
}
```

### **Endpoints (Frontend)**
```javascript
// frontend/src/scripts/config/api.js
pastorais: {
    list: '/pastorais',
    create: '/pastorais',
    get: (id) => `/pastorais/${id}`,
    update: (id) => `/pastorais/${id}`,
    delete: (id) => `/pastorais/${id}`
}
```

### **API Base URL**
```javascript
const API_BASE_URL = 'https://api-paroquiaon.vercel.app/api'
```

---

## 🧩 COMPONENTES PRINCIPAIS

### **1. Loader (Spinner)**
- **Localização:** `.loader-overlay-pastorais`
- **Posição:** Absoluta sobre `.list-container`
- **Estilo:** Spinner azul com texto "Carregando pastorais..."
- **Controle:** Funções `showLoader(true/false)`

### **2. Cards de Pastoral**
- **Estrutura:** Grid de 6 colunas (desktop) / 3 colunas (mobile)
- **Hover:** Background #f0f4ff, sombra aumentada, translateY(-2px)
- **Avatar:** Foto ou inicial em círculo colorido

### **3. Modal de Formulário**
- **Tamanho:** Max-width 800px, width 90%
- **Scroll:** Max-height 90vh, overflow-y auto
- **Animação:** Fade in/out + translateY

### **4. Toggle Switch de Status**
- **Visual:** Switch customizado (40x20px)
- **Estados:** Ativo (azul #1e3a8a) / Inativo (cinza)
- **Label:** Dinâmico ("Ativo" / "Inativo")

### **5. Upload de Foto**
- **Preview:** 160x160px, border-radius 12px
- **Formato:** Base64 (data URL)
- **Storage:** Campo hidden `input[name="foto"]`

### **6. Busca em Tempo Real**
- **Trigger:** Event `input` no campo de busca
- **Busca em:** Nome, Tipo, Responsável
- **Filtro:** Case-insensitive, trim

### **7. Modal de Exclusão**
- **Design:** Vermelho (#dc3545) para alerta
- **Confirmação:** Botão "Excluir" + "Cancelar"
- **Verificação:** Usa `window.bloqueioExclusao.deleteWithCheck`

---

## 🔄 FLUXOS DE DADOS

### **Fluxo de Criação**
```
1. Usuário clica em "Nova Pastoral"
   ↓
2. Modal abre com formulário vazio
   ↓
3. Usuário preenche dados
   ↓
4. Submit do formulário
   ↓
5. Validação client-side
   ↓
6. POST /api/pastorais com payload
   ↓
7. Backend insere no Supabase
   ↓
8. Modal de sucesso
   ↓
9. Fechar modal e recarregar lista
```

### **Fluxo de Edição**
```
1. Usuário clica em "Editar"
   ↓
2. GET /api/pastorais/:id
   ↓
3. Preencher formulário com dados
   ↓
4. Modal abre em modo edição
   ↓
5. Usuário altera dados
   ↓
6. Submit do formulário
   ↓
7. PUT /api/pastorais/:id com payload
   ↓
8. Backend atualiza no Supabase
   ↓
9. Modal de sucesso de atualização
   ↓
10. Fechar modal e recarregar lista
```

### **Fluxo de Exclusão**
```
1. Usuário clica em "Excluir"
   ↓
2. Modal de confirmação abre
   ↓
3. Usuário confirma
   ↓
4. Verificar dependências (bloqueio_exclusao.js)
   ↓
5. DELETE /api/pastorais/:id
   ↓
6. Backend remove do Supabase
   ↓
7. Modal de sucesso de exclusão
   ↓
8. Recarregar lista
```

### **Fluxo de Carregamento**
```
1. DOMContentLoaded
   ↓
2. Carregar lista de pessoas (GET /api/pessoas)
   ↓
3. Criar cache pessoasById
   ↓
4. Preencher select de responsáveis
   ↓
5. Carregar lista de pastorais (GET /api/pastorais)
   ↓
6. Aplicar filtros (busca, status)
   ↓
7. Para cada pastoral:
   - Criar card HTML
   - Resolver nome do responsável (cache)
   - Anexar ao DOM
   ↓
8. Ocultar loader
```

---

## 📱 RESPONSIVIDADE

### **Desktop (> 768px)**
- ✅ Header completo com links visíveis
- ✅ Grid de 6 colunas nos cards
- ✅ Botão "Nova Pastoral" com texto completo
- ✅ Busca centralizada (max-width 720px)
- ✅ Modal max-width 800px

### **Tablet (≤ 768px)**
- ✅ Menu hambúrguer visível
- ✅ Links do menu ocultos
- ✅ Grid de 3 colunas (Avatar, Nome, Ações)
- ✅ Botão "Nova Pastoral" apenas ícone
- ✅ Busca adaptada (max-width calc(100% - 120px))

### **Smartphone (≤ 480px)**
- ✅ Header reduzido (60px)
- ✅ Grid de 3 colunas com espaçamento menor
- ✅ Avatar menor (44px)
- ✅ Busca compacta (max-width calc(100% - 100px))
- ✅ Botão "Nova Pastoral" menor (40px altura)

### **Menu Mobile**
- ✅ Slide-in da esquerda
- ✅ Overlay escuro semi-transparente
- ✅ Fecha ao clicar fora ou no X
- ✅ Scroll interno se necessário

---

## 🎯 CONCLUSÕES

### **Pontos Fortes**
1. ✅ **Arquitetura bem estruturada** - Separação clara entre frontend e backend
2. ✅ **Responsividade completa** - Adaptação adequada para todos os dispositivos
3. ✅ **UX intuitiva** - Interface limpa e fácil de usar
4. ✅ **Performance** - Uso de cache para pessoas, loader durante requisições
5. ✅ **Segurança** - Verificação de dependências antes de excluir
6. ✅ **Feedback visual** - Modais de sucesso, estados de loading

### **Possíveis Melhorias**
1. 🔄 **Paginação** - Para listas grandes de pastorais
2. 🔄 **Ordenação** - Permitir ordenar por nome, tipo, status
3. 🔄 **Filtros avançados** - Por status, tipo, responsável
4. 🔄 **Exportação** - CSV/PDF da lista de pastorais
5. 🔄 **Histórico** - Log de alterações (auditoria)
6. 🔄 **Validação** - Validação mais robusta no frontend
7. 🔄 **Upload de fotos** - Armazenar em storage (S3, Supabase Storage) ao invés de base64
8. 🔄 **Impressão** - Versão para impressão dos cards

---

**Documento gerado em:** 2025-01-27
**Versão:** 1.0
