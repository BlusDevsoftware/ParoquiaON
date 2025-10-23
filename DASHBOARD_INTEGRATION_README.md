# 📊 Integração da Aba "Minha Comunidade" - ParoquiaON

## 🎯 Objetivo

Conectar a aba "Minha Comunidade" com o sistema de API e banco de dados para exibir gráficos e informações em tempo real.

## 🚀 Funcionalidades Implementadas

### 1. **Endpoints de Estatísticas**
- `/api/comunidades/estatisticas` - Estatísticas gerais de comunidades
- `/api/pastorais/estatisticas` - Estatísticas gerais de pastorais  
- `/api/pessoas/estatisticas` - Estatísticas gerais de pessoas
- `/api/agenda/estatisticas` - Estatísticas gerais de eventos

### 2. **Endpoints de Dados para Gráficos**
- `/api/comunidades/graficos` - Dados para gráficos de comunidades
- `/api/pastorais/graficos` - Dados para gráficos de pastorais
- `/api/pessoas/graficos` - Dados para gráficos de pessoas
- `/api/agenda/graficos` - Dados para gráficos de eventos

### 3. **Endpoint Consolidado**
- `/api/dashboard` - Todos os dados do dashboard em uma única requisição

## 📈 Gráficos Disponíveis

### **Cards do Dashboard**
- **Total de Comunidades** - Número total e crescimento mensal
- **Pastorais Ativas** - Número total e crescimento mensal
- **Pessoas Cadastradas** - Número total e crescimento mensal
- **Eventos do Mês** - Número de eventos ativos

### **Gráficos Visuais**
1. **Evolução de Pessoas Cadastradas** (Linha)
   - Últimos 6 meses de cadastros
   - Dados baseados em `created_at`

2. **Distribuição por Pastorais** (Pizza)
   - Status: Ativo/Inativo
   - Baseado no campo `ativo`

3. **Eventos por Mês** (Barras)
   - Últimos 6 meses de eventos
   - Baseado em `data_inicio`

4. **Top 5 Comunidades** (Barras Horizontais)
   - Por número de pessoas cadastradas
   - Relacionamento `pessoas.comunidade_id`

## 🛠️ Como Usar

### **1. Iniciar o Servidor da API**
```bash
cd backend/api-paroquiaon
npm start
```

### **2. Testar os Endpoints**
```bash
# Executar script de teste
node test-dashboard-integration.js

# Ou testar manualmente
curl http://localhost:3000/api/dashboard
```

### **3. Acessar o Frontend**
1. Abra `frontend/src/index.html` no navegador
2. A aba "Minha Comunidade" carregará automaticamente os dados
3. Os gráficos serão renderizados com dados reais do banco

## 🔧 Configuração

### **Banco de Dados**
Certifique-se de que as seguintes tabelas existem:
- `comunidades`
- `pastorais` 
- `pessoas`
- `agendamentos`

### **Estrutura Esperada**
```sql
-- Comunidades
CREATE TABLE comunidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pastorais
CREATE TABLE pastorais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pessoas
CREATE TABLE pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    comunidade_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data_inicio TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Estrutura dos Dados

### **Resposta do Dashboard Consolidado**
```json
{
  "estatisticas": {
    "comunidades": { "total": 5, "ativas": 4, "inativas": 1 },
    "pastorais": { "total": 8, "ativas": 6, "inativas": 2 },
    "pessoas": { "total": 150, "ativas": 140, "inativas": 10 },
    "eventos": { "total": 25, "ativos": 20, "concluidos": 5 }
  },
  "graficos": {
    "comunidades": {
      "evolucao": { "labels": ["Jan", "Fev", "Mar"], "dados": [1, 2, 2] },
      "distribuicao": { "labels": ["Ativo", "Inativo"], "dados": [4, 1] },
      "topComunidades": { "labels": ["Comunidade A"], "dados": [25] }
    },
    "pessoas": {
      "evolucao": { "labels": ["Jan", "Fev", "Mar"], "dados": [10, 15, 20] },
      "distribuicao": { "labels": ["Ativo", "Inativo"], "dados": [140, 10] }
    }
  },
  "timestamp": "2024-01-27T10:30:00.000Z"
}
```

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **"Erro ao carregar dados"**
   - Verifique se o servidor da API está rodando
   - Confirme se o banco de dados está conectado

2. **Gráficos não aparecem**
   - Verifique se há dados nas tabelas
   - Confirme se o Chart.js está carregado

3. **Dados zerados**
   - Verifique se as tabelas têm dados
   - Confirme se os campos `created_at` estão preenchidos

### **Logs Úteis**
```bash
# Verificar logs da API
cd backend/api-paroquiaon
npm start

# Verificar logs do frontend (F12 no navegador)
console.log('Dados do dashboard:', dashboardData);
```

## 🔄 Próximas Melhorias

1. **Cache de Dados** - Implementar cache para melhor performance
2. **Filtros de Período** - Permitir seleção de período nos gráficos
3. **Exportação** - Adicionar exportação de relatórios
4. **Notificações** - Alertas para eventos importantes
5. **Responsividade** - Melhorar visualização em dispositivos móveis

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da API
2. Execute o script de teste
3. Confirme a estrutura do banco de dados
4. Teste os endpoints individualmente

---

**✅ Status: Implementado e Funcional**
**📅 Última Atualização: Janeiro 2024**
