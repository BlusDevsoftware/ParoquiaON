# Soluções Alternativas - Redução de Consumo na Aba Agenda
## Análise e Propostas (Sem usar ?leve=1)

**Data:** 2025-01-27  
**Objetivo:** Reduzir consumo de Transferência Rápida de Origem sem usar modo leve

---

## 🔍 PROBLEMAS IDENTIFICADOS NO CÓDIGO ATUAL

### 1. **Fotos em base64 sendo transferidas** (MAIOR PROBLEMA)
**Localização:** `backend/api-paroquiaon/src/controllers/agendaController.js` (linhas 77, 81, 120)

**Problema:**
- `pessoas` retorna com campo `foto` (linha 77)
- `comunidades` retorna com campo `foto` (linha 81)
- `usuario_lancamento_foto` retorna foto da pessoa (linha 120)
- Se fotos estão em base64 no banco, cada uma = 50-200KB
- Com 50 pessoas + 20 comunidades = **3.5-14MB só de fotos**

**Uso no frontend:**
- Fotos são usadas apenas em:
  - Avatar do evento no calendário semanal (linha 5262, 5724, 7311)
  - Modal de visualização (linha 8178)
  - Recent appointments (ui-utils.js linha 62)

**Solução proposta:**
- **Remover campo `foto` do payload padrão** do GET /agenda
- Retornar apenas `null` ou URL (se já estiver convertida)
- Criar endpoint separado `/agenda/:id/detalhes` que retorna foto quando necessário
- Ou carregar foto sob demanda via `/comunidades/:id` e `/pessoas/:id`

**Impacto estimado:** 70-90% de redução no payload

---

### 2. **Objetos completos quando apenas nomes são necessários**

**Problema:**
- Backend retorna objetos completos: `locais: { id: 1, nome: "Local" }`
- Frontend usa apenas `nome` na maioria dos casos
- Poderia retornar apenas: `local_nome: "Local"`

**Exemplo atual:**
```json
{
  "locais": { "id": 1, "nome": "Local" },
  "acoes": { "id": 1, "nome": "Ação" },
  "comunidades": { "id": 1, "nome": "Comunidade", "foto": "...", "cor": "#FF0000" }
}
```

**Solução proposta:**
- Retornar apenas campos necessários: `local_nome`, `acao_nome`, `comunidade_nome`, `comunidade_cor`
- Manter apenas IDs dos relacionamentos: `local_id`, `acao_id`, `comunidade_id`
- Frontend já tem cache (`AgendaCache`) para lookup se necessário

**Impacto estimado:** 30-40% de redução no payload

---

### 3. **Todos os eventos sendo carregados de uma vez**

**Problema:**
- GET /agenda retorna **TODOS** os agendamentos sem limite
- Se houver 1000 eventos, todos são transferidos
- Frontend filtra localmente, mas dados já foram transferidos

**Solução proposta:**
- Implementar filtro por data: `?start_date=2025-01-01&end_date=2025-12-31`
- Frontend pode carregar apenas eventos do período visível (ex: mês atual + 1 mês antes/depois)
- Ou paginação: `?page=1&limit=50`

**Impacto estimado:** 50-80% de redução (depende do volume de eventos)

---

### 4. **Campos desnecessários sendo retornados**

**Problema:**
- Retorna todos os campos da tabela `agendamentos` (`select('*')`)
- Alguns campos podem não ser usados no calendário/listagem

**Solução proposta:**
- Selecionar apenas campos necessários:
  - `id, titulo, data_inicio, data_fim, local_id, acao_id, comunidade_id, pastoral_id, pilar_id, status_id, objetivo, evento_paroquial`
- Remover campos como `created_at`, `updated_at`, `visibilidade` (se não usados)

**Impacto estimado:** 5-10% de redução

---

## 🎯 SOLUÇÕES PRIORITÁRIAS (ORDEM DE IMPACTO)

### 🔥 PRIORIDADE MÁXIMA

#### 1. Remover fotos do GET /agenda (Solução mais impactante)
**Impacto:** 70-90% de redução  
**Esforço:** Baixo  
**Implementação:**

**Backend (`agendaController.js`):**
```javascript
// Linha 77 - Remover foto
const { data: pessoas } = await supabase.from('pessoas').select('id, nome'); // ✅ Sem foto

// Linha 81 - Remover foto
const { data: comunidades } = await supabase.from('comunidades').select('id, nome, cor'); // ✅ Sem foto

// Linha 120 - Remover foto do usuário
usuario_lancamento_foto: null // ✅ Não retornar foto
```

**Frontend (`agenda.html`):**
- Avatar do evento: usar apenas inicial ou ícone (sem foto)
- Modal de visualização: carregar foto sob demanda via `/agenda/:id` ou `/comunidades/:id`
- Recent appointments: usar apenas inicial (já está fazendo fallback)

**Resultado:** Payload cai de 20-50MB para 2-5MB (com 100 eventos)

---

#### 2. Retornar apenas nomes, não objetos completos
**Impacto:** 30-40% de redução  
**Esforço:** Médio  
**Implementação:**

**Backend (`agendaController.js`):**
```javascript
// Em vez de retornar objetos completos, retornar apenas nomes
return {
    ...agendamento,
    local_nome: relacionamentos.locais?.nome || null,
    acao_nome: relacionamentos.acoes?.nome || null,
    comunidade_nome: relacionamentos.comunidades?.nome || null,
    comunidade_cor: relacionamentos.comunidades?.cor || null,
    pastoral_nome: relacionamentos.pastorais?.nome || null,
    pilar_nome: relacionamentos.pilares?.nome || null,
    // Manter apenas IDs dos relacionamentos
    local_id: agendamento.local_id,
    acao_id: agendamento.acao_id,
    comunidade_id: agendamento.comunidade_id,
    // ... outros IDs
};
```

**Frontend (`agenda.html`):**
- Já está usando `ev.locais?.nome || ev.local_nome` (fallback)
- Continuará funcionando normalmente

**Resultado:** Payload reduz de 2-5MB para 1.4-3MB

---

### ⚡ PRIORIDADE ALTA

#### 3. Implementar filtro por data
**Impacto:** 50-80% de redução (se houver muitos eventos)  
**Esforço:** Médio  
**Implementação:**

**Backend (`agendaController.js`):**
```javascript
const startDate = req.query.start_date; // YYYY-MM-DD
const endDate = req.query.end_date; // YYYY-MM-DD

let query = supabase.from('agendamentos').select('...');

if (startDate) {
    query = query.gte('data_inicio', startDate);
}
if (endDate) {
    query = query.lte('data_inicio', endDate);
}

const { data: agendamentos } = await query.order('data_inicio', { ascending: true });
```

**Frontend (`agenda.html`):**
```javascript
// Carregar apenas eventos do período visível (mês atual + 1 mês antes/depois)
const hoje = new Date();
const mesAtual = hoje.getMonth();
const anoAtual = hoje.getFullYear();

const startDate = new Date(anoAtual, mesAtual - 1, 1).toISOString().split('T')[0];
const endDate = new Date(anoAtual, mesAtual + 2, 0).toISOString().split('T')[0];

const lista = await window.AgendaAPI.list(`?start_date=${startDate}&end_date=${endDate}`);
```

**Resultado:** Se houver 1000 eventos mas apenas 50 no período visível, payload cai de 20-50MB para 1-2.5MB

---

## 📊 ESTIMATIVA DE REDUÇÃO TOTAL

**Consumo atual estimado:**
- GET /agenda (100 eventos): ~20-50MB
- Após criar/editar/excluir: já otimizado (não recarrega)

**Consumo após soluções prioritárias:**
- GET /agenda (100 eventos, sem fotos, apenas nomes): ~1-3MB
- Com filtro por data (50 eventos no período): ~0.5-1.5MB

**Redução estimada: 85-95%** 🎉

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Quick Wins (Hoje)
1. ✅ Remover fotos do GET /agenda
2. ✅ Retornar apenas nomes, não objetos completos

### Fase 2: Otimizações Adicionais (Amanhã)
3. Implementar filtro por data
4. Selecionar apenas campos necessários

---

## ⚠️ ATENÇÃO - COMPATIBILIDADE

**O que NÃO vai quebrar:**
- Frontend já tem fallbacks (`ev.locais?.nome || ev.local_nome`)
- Avatar do evento: já tem fallback para inicial se não tiver foto
- Modal de visualização: pode carregar foto sob demanda

**O que precisa ajustar:**
- Se algum lugar depender de `event.comunidades.foto`, precisa carregar sob demanda
- Avatar do evento no calendário: usar apenas inicial/ícone (sem foto)

---

**Documento criado em:** 2025-01-27  
**Última atualização:** 2025-01-27
