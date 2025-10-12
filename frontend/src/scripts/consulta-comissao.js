// Consulta de Comissões - Funcionalidades
class ConsultaComissao {
    constructor() {
        this.movimentos = [];
        this.colaboradores = [];
        this.camposSelecionados = [];
        this.totalizadoresSelecionados = [];
        this.filtros = {
            dataInicio: '',
            dataFim: '',
            colaborador: '',
            tipo: '',
            produto: '',
            valorMin: '',
            valorMax: ''
        };
        this.paginaAtual = 1;
        this.itensPorPagina = 10;
        this.totalItens = 0;
        
        this.init();
    }

    async init() {
        this.mostrarSpinner();
        try {
            await this.carregarColaboradores();
            await this.carregarMovimentos();
            this.carregarPilares();
            this.configurarEventos();
            this.inicializarBuilder();
            this.renderizarTabelaBuilder();
        } catch (error) {
            console.error('Erro ao inicializar consulta:', error);
            this.mostrarToast('Erro ao inicializar a página de consulta', 'error');
        } finally {
            this.ocultarSpinner();
        }
    }

    async carregarColaboradores() {
        try {
            const colaboradores = await window.api.get('/colaboradores');
            this.colaboradores = colaboradores;
            this.preencherSelectColaboradores();
        } catch (error) {
            console.error('Erro ao carregar colaboradores:', error);
            this.mostrarToast('Erro ao carregar colaboradores', 'error');
        }
    }

    preencherSelectColaboradores() {
        const select = document.getElementById('filtroColaborador');
        if (select) {
            select.innerHTML = '<option value="">Selecionar</option><option value="todos">Todos</option>';
            this.colaboradores.forEach(colab => {
                const option = document.createElement('option');
                option.value = colab.codigo;
                option.textContent = colab.nome;
                select.appendChild(option);
            });
        }
    }

    async carregarMovimentos() {
        try {
            const movimentos = await window.api.get('/movimento_comissoes');
            this.movimentos = movimentos;
            this.totalItens = this.movimentos.length;
            this.aplicarFiltros();
        } catch (error) {
            console.error('Erro ao carregar movimentos:', error);
            this.mostrarToast('Erro ao carregar movimentos', 'error');
        }
    }

    carregarPilares() {
        // Extrair pilares únicos dos movimentos
        const pilaresUnicos = new Set();
        
        this.movimentos.forEach(m => {
            if (m.item_id) {
                const itemIds = m.item_id.split(',');
                itemIds.forEach(itemId => {
                    const parts = itemId.trim().split('-');
                    if (parts.length >= 2) {
                        const nomeProduto = parts.slice(1).join('-');
                        pilaresUnicos.add(nomeProduto);
                    }
                });
            }
        });

        // Preencher select de pilares
        const select = document.getElementById('filtroProduto');
        if (select) {
            select.innerHTML = '<option value="">Selecionar</option><option value="todos">Todos</option>';
            
            // Ordenar pilares alfabeticamente
            const pilaresOrdenados = Array.from(pilaresUnicos).sort();
            
            pilaresOrdenados.forEach(produto => {
                const option = document.createElement('option');
                option.value = produto;
                option.textContent = produto;
                select.appendChild(option);
            });
        }
    }

    configurarEventos() {
        // Filtros automáticos
        const filtroContainer = document.querySelector('.advanced-filters');
        if (filtroContainer) {
            filtroContainer.addEventListener('change', (e) => {
                if (e.target.matches('#dataInicial, #dataFinal')) {
                    this.aplicarFiltros();
                    this.renderizarTabelaBuilder();
                }
            });
        }

        // Botão limpar filtros
        const btnLimpar = document.getElementById('btnLimparFiltros');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                const ids = ['dataInicial','dataFinal'];
                ids.forEach(id => { 
                    const el = document.getElementById(id); 
                    if (el) el.value=''; 
                });
                this.modoFiltroData = 'geracao';
                this.atualizarBotoesModo();
                this.aplicarFiltros();
                this.renderizarTabelaBuilder();
            });
        }

        // Botões de modo de data
        this.modoFiltroData = 'geracao';
        const btnGeracao = document.getElementById('btnDataGeracao');
        const btnVenc = document.getElementById('btnDataVencimento');
        
        if (btnGeracao) {
            btnGeracao.addEventListener('click', () => { 
                this.modoFiltroData='geracao'; 
                this.atualizarBotoesModo(); 
                this.aplicarFiltros(); 
                this.renderizarTabelaBuilder();
            });
        }
        
        if (btnVenc) {
            btnVenc.addEventListener('click', () => { 
                this.modoFiltroData='vencimento'; 
                this.atualizarBotoesModo(); 
                this.aplicarFiltros(); 
                this.renderizarTabelaBuilder();
            });
        }
        
        this.atualizarBotoesModo();

        // Ações do builder
        const btnClear = document.getElementById('btnClearFields');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                this.camposSelecionados = [];
                this.atualizarDropZone();
                this.renderizarTabelaBuilder();
            });
        }

        const btnExportCsv = document.getElementById('btnExportCsv');
        if (btnExportCsv) {
            btnExportCsv.addEventListener('click', () => this.exportarCSVBuilder());
        }

        const btnExportPdf = document.getElementById('btnExportPdf');
        if (btnExportPdf) {
            btnExportPdf.addEventListener('click', () => this.exportarPDFBuilder());
        }
    }

    atualizarBotoesModo() {
        const btnGeracao = document.getElementById('btnDataGeracao');
        const btnVenc = document.getElementById('btnDataVencimento');
        
        if (btnGeracao && btnVenc) {
            const ativo = 'height:32px; width:120px; padding:0 10px; border:1.5px solid #90caf9; border-radius:6px; background:#1976D2; color:#fff; font-size:0.9em; cursor:pointer;';
            const inativo = 'height:32px; width:120px; padding:0 10px; border:1.5px solid #90caf9; border-radius:6px; background:#f4faff; color:#1565c0; font-size:0.9em; cursor:pointer;';
            btnGeracao.setAttribute('style', this.modoFiltroData==='geracao' ? ativo : inativo);
            btnVenc.setAttribute('style', this.modoFiltroData==='vencimento' ? ativo : inativo);
        }
    }

    capturarFiltros() {
        this.filtros.dataInicio = document.getElementById('dataInicial')?.value || '';
        this.filtros.dataFim = document.getElementById('dataFinal')?.value || '';
        this.filtros.colaborador = '';
        this.filtros.tipo = '';
        this.filtros.produto = '';
    }

    aplicarFiltros() {
        this.capturarFiltros();
        
        let movimentosFiltrados = [...this.movimentos];

        // Filtro por data
        if (this.filtros.dataInicio) {
            movimentosFiltrados = movimentosFiltrados.filter(m => {
                const base = this.modoFiltroData === 'vencimento' ? m.data_vencimento : m.data_geracao;
                return base ? new Date(base) >= new Date(this.filtros.dataInicio) : true;
            });
        }
        if (this.filtros.dataFim) {
            movimentosFiltrados = movimentosFiltrados.filter(m => {
                const base = this.modoFiltroData === 'vencimento' ? m.data_vencimento : m.data_geracao;
                return base ? new Date(base) <= new Date(this.filtros.dataFim) : true;
            });
        }

        // Filtros removidos: colaborador, tipo, produto (agora disponíveis como variáveis no builder)

        this.movimentosFiltrados = movimentosFiltrados;
        this.totalItens = movimentosFiltrados.length;
        this.paginaAtual = 1;
        
        this.renderizarTabelaBuilder();
    }

    inicializarBuilder() {
        // Drag start
        document.querySelectorAll('.variable-item').forEach(el => {
            el.addEventListener('dragstart', (e) => {
                const field = e.target.getAttribute('data-field');
                const total = e.target.getAttribute('data-total');
                if (field) {
                    e.dataTransfer.setData('text/plain', field);
                    e.dataTransfer.setData('text/total', '0');
                }
                if (total) {
                    e.dataTransfer.setData('text/total', '1');
                    e.dataTransfer.setData('text/total-key', total);
                }
            });
        });

        // Drop zone
        const drop = document.getElementById('dropFields');
        if (drop) {
            drop.addEventListener('dragover', (e) => { e.preventDefault(); });
            drop.addEventListener('drop', (e) => {
                e.preventDefault();
                const isTotal = e.dataTransfer.getData('text/total') === '1';
                if (isTotal) return; // evitar soltar totalizadores nas colunas
                const field = e.dataTransfer.getData('text/plain');
                if (field && !this.camposSelecionados.includes(field)) {
                    this.camposSelecionados.push(field);
                    this.atualizarDropZone();
                    this.renderizarTabelaBuilder();
                }
            });
        }

        // Drop zone de totalizadores
        const dropTotals = document.getElementById('dropTotals');
        if (dropTotals) {
            dropTotals.addEventListener('dragover', (e) => { e.preventDefault(); });
            dropTotals.addEventListener('drop', (e) => {
                e.preventDefault();
                const totalKey = e.dataTransfer.getData('text/total-key') || '';
                if (totalKey && !this.totalizadoresSelecionados.includes(totalKey)) {
                    this.totalizadoresSelecionados.push(totalKey);
                    this.atualizarDropZone();
                    this.renderizarTotalizadores();
                }
            });
        }

        this.atualizarDropZone();
    }

    atualizarDropZone() {
        const drop = document.getElementById('dropFields');
        const dropTotals = document.getElementById('dropTotals');
        if (drop) {
            drop.innerHTML = '';
            if (this.camposSelecionados.length === 0) {
                const hint = document.createElement('span');
                hint.style.color = '#90caf9';
                hint.textContent = 'Arraste campos aqui...';
                drop.appendChild(hint);
            } else {
                this.camposSelecionados.forEach(field => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.innerHTML = `${this.obterLabelCampo(field)} <button title=\"Remover\">×</button>`;
                    chip.querySelector('button').addEventListener('click', () => {
                        this.camposSelecionados = this.camposSelecionados.filter(f => f !== field);
                        this.atualizarDropZone();
                        this.renderizarTabelaBuilder();
                    });
                    drop.appendChild(chip);
                });
            }
        }
        if (dropTotals) {
            dropTotals.innerHTML = '';
            if (this.totalizadoresSelecionados.length === 0) {
                const hint = document.createElement('span');
                hint.style.color = '#90caf9';
                hint.textContent = 'Arraste totalizadores aqui...';
                dropTotals.appendChild(hint);
            } else {
                this.totalizadoresSelecionados.forEach(key => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.innerHTML = `${this.obterLabelTotal(key)} <button title=\"Remover\">×</button>`;
                    chip.querySelector('button').addEventListener('click', () => {
                        this.totalizadoresSelecionados = this.totalizadoresSelecionados.filter(k => k !== key);
                        this.atualizarDropZone();
                        this.renderizarTotalizadores();
                    });
                    dropTotals.appendChild(chip);
                });
            }
        }
    }

    obterLabelTotal(key) {
        const map = {
            total_valor_venda: 'Total Valor de Venda',
            total_comissao: 'Total Comissão',
            qtd_titulos: 'Quantidade de Títulos',
            qtd_pilares_distintos: 'Pilares Distintos',
            qtd_colaboradores_distintos: 'Colaboradores Distintos',
            total_pago: 'Total Pago',
            total_pendente: 'Total Pendente'
        };
        return map[key] || key;
    }

    renderizarTotalizadores() {
        const container = document.getElementById('totalsContainer');
        if (!container) return;
        container.innerHTML = '';
        const dados = this.movimentosFiltrados || this.movimentos;
        const calc = {
            total_valor_venda: () => dados.reduce((s, m) => s + Number(m.valor_venda || 0), 0),
            total_comissao: () => dados.reduce((s, m) => s + Number(m.valor || 0), 0),
            qtd_titulos: () => dados.length,
            qtd_pilares_distintos: () => {
                const set = new Set();
                dados.forEach(m => {
                    if (m.item_id) m.item_id.split(',').forEach(x => set.add(x.trim()));
                });
                return set.size;
            },
            qtd_colaboradores_distintos: () => {
                const set = new Set(dados.map(m => m.colaborador_id));
                return set.size;
            },
            total_pago: () => dados.filter(m => String(m.status||'').toLowerCase().includes('pago')).reduce((s,m)=> s + Number(m.valor || 0), 0),
            total_pendente: () => dados.filter(m => String(m.status||'').toLowerCase().includes('pend')).reduce((s,m)=> s + Number(m.valor || 0), 0)
        };
        this.totalizadoresSelecionados.forEach(key => {
            const valor = calc[key] ? calc[key]() : 0;
            const card = document.createElement('div');
            card.className = 'card';
            const display = (typeof valor === 'number') ? (key.startsWith('total') ? this.formatarMoeda(valor) : valor) : valor;
            card.innerHTML = `
                <div class="card-icon" style="background:transparent; color:#1976D2;">
                    <i class="fas fa-calculator"></i>
                </div>
                <div class="card-info">
                    <h3>${this.obterLabelTotal(key)}</h3>
                    <p>${display}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    obterLabelCampo(field) {
        const map = {
            data_geracao: 'Data de Geração',
            data_vencimento: 'Data de Vencimento',
            numero_titulo: 'Número do Título',
            colaborador: 'Colaborador',
            tipo: 'Tipo',
            produto: 'Produto',
            valor_venda: 'Valor da Venda',
            valor: 'Valor da Comissão',
            status: 'Status'
        };
        return map[field] || field;
    }

    renderizarTabelaBuilder() {
        const thead = document.querySelector('#reportTable thead');
        const tbody = document.querySelector('#reportTable tbody');
        if (!thead || !tbody) return;

        // Cabeçalho
        thead.innerHTML = '';
        const trHead = document.createElement('tr');
        this.camposSelecionados.forEach(field => {
            const th = document.createElement('th');
            th.textContent = this.obterLabelCampo(field);
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        // Corpo
        tbody.innerHTML = '';
        const dados = this.movimentosFiltrados || this.movimentos;
        dados.forEach(m => {
            const tr = document.createElement('tr');
            this.camposSelecionados.forEach(field => {
                const td = document.createElement('td');
                td.textContent = this.obterValorCampo(field, m);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    obterValorCampo(field, m) {
        switch (field) {
            case 'data_geracao':
                return m.data_geracao ? this.formatarData(m.data_geracao) : '';
            case 'data_vencimento':
                return m.data_vencimento ? this.formatarData(m.data_vencimento) : '';
            case 'numero_titulo':
                return m.numero_titulo || '';
            case 'colaborador': {
                const colab = this.colaboradores.find(c => c.codigo === m.colaborador_id);
                return (colab && colab.nome) ? colab.nome : (m.colaborador_nome || '');
            }
            case 'tipo':
                return m.tipo || '';
            case 'produto': {
                if (!m.item_id) return '';
                const ids = m.item_id.split(',');
                return ids.map(s => s.trim().split('-').slice(1).join('-')).filter(Boolean).join(', ');
            }
            case 'valor_venda':
                return this.formatarMoeda(m.valor_venda || 0);
            case 'valor':
                return this.formatarMoeda(m.valor || 0);
            case 'status':
                return m.status || '';
            default:
                return '';
        }
    }

    exportarCSVBuilder() {
        const dados = this.movimentosFiltrados || this.movimentos;
        if (!dados.length || !this.camposSelecionados.length) {
            this.mostrarToast('Selecione alguns campos e aplique filtros antes de exportar.', 'info');
            return;
        }
        const header = this.camposSelecionados.map(f => '"' + this.obterLabelCampo(f) + '"').join(',');
        const rows = dados.map(m => this.camposSelecionados
            .map(f => '"' + (this.obterValorCampo(f, m) || '').toString().replace(/"/g, '""') + '"')
            .join(',')
        );
        const csv = [header, ...rows].join('\n');
        this.downloadCSV(csv, 'relatorio_personalizado.csv');
        this.mostrarToast('Relatório exportado com sucesso!', 'success');
    }

    exportarPDFBuilder() {
        const dados = this.movimentosFiltrados || this.movimentos;
        if (!dados.length || !this.camposSelecionados.length) {
            this.mostrarToast('Selecione alguns campos e aplique filtros antes de exportar.', 'info');
            return;
        }
        const janela = window.open('', '_blank');
        const titulo = 'Relatório Personalizado';
        const dataGeracao = new Date().toLocaleDateString('pt-BR');
        const estilo = `
            <style>
                body { font-family: Arial, sans-serif; margin: 24px; }
                h1 { color: #1976D2; margin-bottom: 6px; }
                .meta { color: #666; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                th { background: #f7f9fc; }
                .totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 16px; }
                .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; }
                .card h3 { margin: 0 0 6px 0; font-size: 14px; color: #1976D2; }
                .card p { margin: 0; font-weight: bold; }
            </style>
        `;
        const header = this.camposSelecionados.map(f => `<th>${this.obterLabelCampo(f)}</th>`).join('');
        const rows = dados.map(m => {
            const tds = this.camposSelecionados.map(f => `<td>${this.obterValorCampo(f, m)}</td>`).join('');
            return `<tr>${tds}</tr>`;
        }).join('');

        // Totalizadores selecionados
        const dadosCalc = this.movimentosFiltrados || this.movimentos;
        const calc = {
            total_valor_venda: () => dadosCalc.reduce((s, m) => s + Number(m.valor_venda || 0), 0),
            total_comissao: () => dadosCalc.reduce((s, m) => s + Number(m.valor || 0), 0),
            qtd_titulos: () => dadosCalc.length,
            qtd_pilares_distintos: () => { const set = new Set(); dadosCalc.forEach(m => { if (m.item_id) m.item_id.split(',').forEach(x => set.add(x.trim())); }); return set.size; },
            qtd_colaboradores_distintos: () => { const set = new Set(dadosCalc.map(m => m.colaborador_id)); return set.size; },
            total_pago: () => dadosCalc.filter(m => String(m.status||'').toLowerCase().includes('pago')).reduce((s,m)=> s + Number(m.valor || 0), 0),
            total_pendente: () => dadosCalc.filter(m => String(m.status||'').toLowerCase().includes('pend')).reduce((s,m)=> s + Number(m.valor || 0), 0)
        };
        const totalsHtml = (this.totalizadoresSelecionados || []).map(key => {
            const valor = calc[key] ? calc[key]() : 0;
            const display = (typeof valor === 'number') ? (key.startsWith('total') ? this.formatarMoeda(valor) : valor) : valor;
            return `<div class="card"><h3>${this.obterLabelTotal(key)}</h3><p>${display}</p></div>`;
        }).join('');

        const html = `
            <html>
            <head>
                <title>${titulo}</title>
                ${estilo}
            </head>
            <body>
                <h1>${titulo}</h1>
                <div class="meta">Gerado em: ${dataGeracao}</div>
                <table>
                    <thead><tr>${header}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="totals">${totalsHtml}</div>
            </body>
            </html>
        `;
        janela.document.write(html);
        janela.document.close();
        janela.print();
    }

    renderizarPaginacao() {
        const totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
        if (totalPaginas <= 1) return;

        const tableContainer = document.querySelector('.table-container');
        let paginacao = tableContainer.querySelector('.pagination');
        
        if (!paginacao) {
            paginacao = document.createElement('div');
            paginacao.className = 'pagination';
            tableContainer.appendChild(paginacao);
        }

        let html = '';
        
        // Botão anterior
        html += `<button class="page-btn" ${this.paginaAtual === 1 ? 'disabled' : ''} onclick="consultaComissao.irParaPagina(${this.paginaAtual - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // Páginas
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= this.paginaAtual - 2 && i <= this.paginaAtual + 2)) {
                html += `<button class="page-btn ${i === this.paginaAtual ? 'active' : ''}" onclick="consultaComissao.irParaPagina(${i})">${i}</button>`;
            } else if (i === this.paginaAtual - 3 || i === this.paginaAtual + 3) {
                html += '<span class="page-ellipsis">...</span>';
            }
        }

        // Botão próximo
        html += `<button class="page-btn" ${this.paginaAtual === totalPaginas ? 'disabled' : ''} onclick="consultaComissao.irParaPagina(${this.paginaAtual + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;

        paginacao.innerHTML = html;
    }

    irParaPagina(pagina) {
        this.paginaAtual = pagina;
        this.renderizarTabela();
    }

    atualizarGraficos() {
        const movimentos = this.movimentosFiltrados || this.movimentos;
        
        // Gráfico de Status
        this.atualizarGraficoStatus(movimentos);
        
        // Gráfico de Colaboradores
        this.atualizarGraficoColaboradores(movimentos);
        
        // Gráfico Mensal
        this.atualizarGraficoMensal(movimentos);
        
        // Funil de Vendas
        this.atualizarGraficoFunil(movimentos);
    }

    atualizarGraficoStatus(movimentos) {
        // Agrupar por produto (usando item_id para extrair nome do produto)
        const produtoVendas = {};
        
        movimentos.forEach(m => {
            if (m.item_id) {
                // Extrair nome do produto do item_id (formato: "00001-NOME_DO_PRODUTO")
                const itemIds = m.item_id.split(',');
                itemIds.forEach(itemId => {
                    const parts = itemId.trim().split('-');
                    if (parts.length >= 2) {
                        const nomeProduto = parts.slice(1).join('-'); // Pega tudo após o primeiro hífen
                        // Contar quantidade de vendas (não valor)
                        produtoVendas[nomeProduto] = (produtoVendas[nomeProduto] || 0) + 1;
                    }
                });
            }
        });

        // Ordenar por quantidade e pegar top 10
        const sortedPilares = Object.entries(produtoVendas)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedPilares.map(([nome]) => nome);
        const values = sortedPilares.map(([, quantidade]) => quantidade);

        const ctx = document.getElementById('statusChart');
        if (ctx && window.statusChart) {
            window.statusChart.data.labels = labels;
            window.statusChart.data.datasets[0].data = values;
            window.statusChart.update();
        }
    }

    atualizarGraficoColaboradores(movimentos) {
        const colaboradorVendas = {};
        
        movimentos.forEach(m => {
            const colab = this.colaboradores.find(c => c.codigo === m.colaborador_id);
            const nome = colab?.nome || 'N/A';
            // Contar quantidade de vendas (não valor)
            colaboradorVendas[nome] = (colaboradorVendas[nome] || 0) + 1;
        });

        // Ordenar por quantidade e pegar top 10
        const sortedColaboradores = Object.entries(colaboradorVendas)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedColaboradores.map(([nome]) => nome);
        const values = sortedColaboradores.map(([, quantidade]) => quantidade);

        const ctx = document.getElementById('collaboratorChart');
        if (ctx && window.collaboratorChart) {
            window.collaboratorChart.data.labels = labels;
            window.collaboratorChart.data.datasets[0].data = values;
            window.collaboratorChart.update();
        }
    }

    atualizarGraficoMensal(movimentos) {
        const monthlyTotals = {};
        movimentos.forEach(m => {
            const base = this.modoFiltroData === 'vencimento' ? m.data_vencimento : m.data_geracao;
            if (!base) return;
            const data = new Date(base);
            const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            const valor = Number(m.valor) || 0;
            monthlyTotals[mesAno] = (monthlyTotals[mesAno] || 0) + valor;
        });

        // Ordenar por data
        const sortedEvolucao = Object.entries(monthlyTotals)
            .sort(([a], [b]) => a.localeCompare(b));

        const labels = sortedEvolucao.map(([mesAno]) => {
            const [ano, mes] = mesAno.split('-');
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return `${meses[parseInt(mes) - 1]}/${ano}`;
        });
        const values = sortedEvolucao.map(([, valor]) => valor);

        const ctx = document.getElementById('monthlyChart');
        if (ctx && window.monthlyChart) {
            window.monthlyChart.data.labels = labels;
            window.monthlyChart.data.datasets[0].data = values;
            window.monthlyChart.update();
        }
    }

    atualizarGraficoFunil(movimentos) {
        // Criar dados do funil de vendas baseado nos movimentos
        const funilData = {
            'Leads': 0,
            'Oportunidades': 0,
            'Propostas': 0,
            'Negociações': 0,
            'Fechamentos': 0,
            'Vendas Concluídas': 0
        };

        // Analisar cada movimento para categorizar no funil
        movimentos.forEach(m => {
            const valorVenda = Number(m.valor_venda) || 0;
            const status = m.status?.toLowerCase() || '';
            
            // Categorizar baseado no status e valor
            if (status === 'pendente') {
                if (valorVenda < 1000) {
                    funilData['Leads'] += valorVenda;
                } else if (valorVenda < 5000) {
                    funilData['Oportunidades'] += valorVenda;
                } else {
                    funilData['Propostas'] += valorVenda;
                }
            } else if (status === 'pago') {
                if (valorVenda < 2000) {
                    funilData['Negociações'] += valorVenda;
                } else if (valorVenda < 10000) {
                    funilData['Fechamentos'] += valorVenda;
                } else {
                    funilData['Vendas Concluídas'] += valorVenda;
                }
            } else if (status === 'cancelado') {
                // Movimentos cancelados não entram no funil
                return;
            }
        });

        // Preparar dados para o gráfico
        const labels = Object.keys(funilData);
        const values = Object.values(funilData);

        // Atualizar o gráfico
        const ctx = document.getElementById('funnelChart');
        if (ctx && window.funnelChart) {
            window.funnelChart.data.labels = labels;
            window.funnelChart.data.datasets[0].data = values;
            window.funnelChart.update();
        }
    }

    async visualizarMovimento(id) {
        try {
            const movimento = await window.api.get(`/movimento_comissoes/${id}`);
            this.mostrarModalVisualizacao(movimento);
        } catch (error) {
            console.error('Erro ao carregar movimento:', error);
            this.mostrarToast('Erro ao carregar movimento', 'error');
        }
    }

    mostrarModalVisualizacao(movimento) {
        const colaborador = this.colaboradores.find(c => c.codigo === movimento.colaborador_id);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Visualizar Movimento</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Número do Título</label>
                            <input type="text" value="${movimento.numero_titulo}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Data de Geração</label>
                            <input type="date" value="${movimento.data_geracao}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Colaborador</label>
                            <input type="text" value="${colaborador?.nome || 'N/A'}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <input type="text" value="${movimento.tipo}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Valor da Venda</label>
                            <input type="text" value="${this.formatarMoeda(movimento.valor_venda)}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Valor da Comissão</label>
                            <input type="text" value="${this.formatarMoeda(movimento.valor)}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Status</label>
                            <input type="text" value="${movimento.status}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Data de Vencimento</label>
                            <input type="date" value="${movimento.data_vencimento}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea readonly>${movimento.observacoes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async editarMovimento(id) {
        try {
            const movimento = await window.api.get(`/movimento_comissoes/${id}`);
            this.mostrarModalEdicao(movimento);
        } catch (error) {
            console.error('Erro ao carregar movimento:', error);
            this.mostrarToast('Erro ao carregar movimento', 'error');
        }
    }

    mostrarModalEdicao(movimento) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Movimento</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status" required>
                                    <option value="pendente" ${movimento.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                                    <option value="pago" ${movimento.status === 'pago' ? 'selected' : ''}>Pago</option>
                                    <option value="cancelado" ${movimento.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Data de Pagamento</label>
                                <input type="date" name="data_pagamento" value="${movimento.data_pagamento || ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Valor Pago</label>
                                <input type="number" name="valor_pago" step="0.01" value="${movimento.valor_pago || ''}">
                            </div>
                            <div class="form-group">
                                <label>Data de Vencimento</label>
                                <input type="date" name="data_vencimento" value="${movimento.data_vencimento}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Observações</label>
                            <textarea name="observacoes">${movimento.observacoes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="consultaComissao.salvarEdicao(${movimento.id})">Salvar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async salvarEdicao(id) {
        try {
            const form = document.getElementById('editForm');
            const formData = new FormData(form);
            const dados = Object.fromEntries(formData.entries());
            
            // Converter valores numéricos
            if (dados.valor_pago) dados.valor_pago = parseFloat(dados.valor_pago);
            
            await window.api.put(`/movimento_comissoes/${id}`, dados);
            this.mostrarToast('Movimento atualizado com sucesso!', 'success');
            document.querySelector('.modal').remove();
            await this.carregarMovimentos();
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
            this.mostrarToast('Erro ao salvar alterações', 'error');
        }
    }

    async excluirMovimento(id) {
        // Usar o sistema de bloqueio de exclusão
        if (typeof deleteWithCheck === 'function') {
            const movimento = this.movimentos.find(m => m.id === id);
            if (movimento) {
                await deleteWithCheck(
                    'movimento_comissoes',
                    id,
                    () => {
                        this.mostrarToast('Movimento excluído com sucesso!', 'success');
                        this.carregarMovimentos();
                    }
                );
            }
        } else {
            // Fallback para exclusão direta
            if (confirm('Tem certeza que deseja excluir este movimento?')) {
                try {
                    await window.api.delete(`/movimento_comissoes/${id}`);
                    this.mostrarToast('Movimento excluído com sucesso!', 'success');
                    await this.carregarMovimentos();
                } catch (error) {
                    console.error('Erro ao excluir movimento:', error);
                    this.mostrarToast('Erro ao excluir movimento', 'error');
                }
            }
        }
    }

    exportarDados() {
        const movimentos = this.movimentosFiltrados || this.movimentos;
        const csv = this.gerarCSV(movimentos);
        this.downloadCSV(csv, 'movimentos_comissoes.csv');
        this.mostrarToast('Dados exportados com sucesso!', 'success');
    }

    gerarCSV(movimentos) {
        const headers = ['Data', 'Colaborador', 'Tipo', 'Valor Venda', 'Comissão', 'Status', 'Número Título'];
        const rows = movimentos.map(m => {
            const colaborador = this.colaboradores.find(c => c.codigo === m.colaborador_id);
            return [
                this.formatarData(m.data_geracao),
                colaborador?.nome || 'N/A',
                m.tipo,
                m.valor_venda,
                m.valor,
                m.status,
                m.numero_titulo
            ];
        });

        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    imprimirDados() {
        const movimentos = this.movimentosFiltrados || this.movimentos;
        const printWindow = window.open('', '_blank');
        
        const html = `
            <html>
                <head>
                    <title>Relatório de Comissões</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .header { text-align: center; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Relatório de Comissões</h1>
                        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Colaborador</th>
                                <th>Tipo</th>
                                <th>Valor Venda</th>
                                <th>Comissão</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movimentos.map(m => {
                                const colaborador = this.colaboradores.find(c => c.codigo === m.colaborador_id);
                                return `
                                    <tr>
                                        <td>${this.formatarData(m.data_geracao)}</td>
                                        <td>${colaborador?.nome || 'N/A'}</td>
                                        <td>${m.tipo}</td>
                                        <td>${this.formatarMoeda(m.valor_venda)}</td>
                                        <td>${this.formatarMoeda(m.valor)}</td>
                                        <td>${m.status}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    mostrarSpinner() {
        const spinner = document.getElementById('loader-consulta');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    ocultarSpinner() {
        const spinner = document.getElementById('loader-consulta');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    mostrarLoading(mostrar) {
        const tbody = document.querySelector('table tbody');
        if (mostrar) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        <i class="fas fa-spinner fa-spin"></i> Carregando...
                    </td>
                </tr>
            `;
        }
    }

    mostrarToast(mensagem, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(tipo)}"></i>
            <span>${mensagem}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        const container = document.querySelector('.toast-container') || this.criarToastContainer();
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 5000);
    }

    criarToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getToastIcon(tipo) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[tipo] || 'info-circle';
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    getStatusClass(status) {
        const classes = {
            pendente: 'pending',
            pago: 'paid',
            cancelado: 'cancelled'
        };
        return classes[status.toLowerCase()] || 'pending';
    }

}

// Inicializar quando a página carregar
let consultaComissao;
document.addEventListener('DOMContentLoaded', () => {
    consultaComissao = new ConsultaComissao();
});
