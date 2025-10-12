# Migração: Nova Coluna `motivo_aglutinacao`

## 📋 Resumo da Mudança

Esta migração adiciona uma nova coluna `motivo_aglutinacao` na tabela `movimento_comissoes` para separar claramente:
- **Motivo da aglutinação** (nova coluna `motivo_aglutinacao`)
- **Observações de pagamento** (coluna existente `observacoes`)
- **Descrição do título** (coluna existente `descricao`)

## 🎯 Objetivos

1. **Resolver ambiguidade** entre motivo da aglutinação e observações de pagamento
2. **Melhorar semântica** dos dados
3. **Facilitar manutenção** e futuras funcionalidades
4. **Padronizar** o sistema de aglutinação

## 📁 Arquivos Modificados

### Backend
- `backend/cadastros-api/src/controllers/movimentoComissaoController.js` - Atualizado para usar nova coluna

### Frontend
- `frontend/src/movimento-comissao.html` - Modal de visualização atualizado
- `frontend/src/modais-movimento.html` - Modal de aglutinação atualizado

### Scripts SQL
- `backend/gateway/sql/add_motivo_aglutinacao_column.sql` - Script SQL para adicionar coluna
- `backend/gateway/scripts/migrate_motivo_aglutinacao.js` - Script de migração automatizada

## 🚀 Como Implementar

### Opção 1: Execução Manual (Recomendado para Produção)

1. **Executar SQL diretamente no banco:**
```sql
-- Adicionar nova coluna
ALTER TABLE movimento_comissoes 
ADD COLUMN motivo_aglutinacao TEXT;

-- Adicionar comentário
COMMENT ON COLUMN movimento_comissoes.motivo_aglutinacao IS 'Motivo específico da aglutinação de títulos - separado das observações de pagamento';

-- Criar índice para performance
CREATE INDEX idx_movimento_comissoes_motivo_aglutinacao ON movimento_comissoes(motivo_aglutinacao);

-- Migrar dados existentes
UPDATE movimento_comissoes 
SET motivo_aglutinacao = observacoes 
WHERE tipo_aglutinacao = 'AGL-PS' 
  AND observacoes IS NOT NULL 
  AND observacoes != '';
```

### Opção 2: Script de Migração Automatizada

1. **Instalar dependências:**
```bash
cd backend/gateway
npm install @supabase/supabase-js dotenv
```

2. **Configurar variáveis de ambiente:**
```bash
# .env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

3. **Executar migração:**
```bash
node scripts/migrate_motivo_aglutinacao.js
```

## 🔄 Fluxo de Dados Atualizado

### Antes (Campo `observacoes` sobrecarregado)
```
observacoes = "Motivo da aglutinação" (quando criado)
observacoes = "Observação de pagamento" (quando pago)
```

### Depois (Campos separados)
```
motivo_aglutinacao = "Motivo da aglutinação" (sempre)
observacoes = "Observação de pagamento" (apenas quando pago)
descricao = "Descrição original do título" (sempre)
```

## 🧪 Testes Recomendados

### 1. Teste de Aglutinação
- [ ] Criar nova aglutinação com motivo
- [ ] Verificar se `motivo_aglutinacao` é salvo corretamente
- [ ] Verificar se `observacoes` e `descricao` ficam vazios

### 2. Teste de Visualização
- [ ] Abrir modal de título aglutinado
- [ ] Verificar se "Motivo da Aglutinação" aparece corretamente
- [ ] Verificar se "Observações de Pagamento" está vazio (inicialmente)

### 3. Teste de Pagamento
- [ ] Fazer baixa de título aglutinado
- [ ] Adicionar observação de pagamento
- [ ] Verificar se `observacoes` é atualizado corretamente
- [ ] Verificar se `motivo_aglutinacao` permanece inalterado

### 4. Teste de Dados Existentes
- [ ] Verificar se títulos aglutinados antigos têm `motivo_aglutinacao` preenchido
- [ ] Verificar se a migração não afetou outros dados

## ⚠️ Considerações Importantes

### Rollback
Se necessário reverter a migração:
```sql
-- Remover índice
DROP INDEX IF EXISTS idx_movimento_comissoes_motivo_aglutinacao;

-- Remover coluna
ALTER TABLE movimento_comissoes DROP COLUMN IF EXISTS motivo_aglutinacao;
```

### Compatibilidade
- ✅ **Backward compatible** - não quebra funcionalidades existentes
- ✅ **Dados preservados** - migração automática de dados existentes
- ✅ **API mantida** - endpoint `/aglutinar` continua funcionando

### Performance
- ✅ **Índice criado** para consultas por `motivo_aglutinacao`
- ✅ **Sem impacto** em consultas existentes
- ✅ **Otimizado** para títulos aglutinados

## 📊 Monitoramento

### Métricas a Acompanhar
- Quantidade de títulos com `motivo_aglutinacao` preenchido
- Performance de consultas por motivo
- Erros relacionados à nova coluna

### Logs Importantes
- Verificar se `motivo_aglutinacao` está sendo salvo corretamente
- Monitorar erros de migração
- Acompanhar uso da nova funcionalidade

## 🎉 Benefícios Esperados

1. **Clareza semântica** - cada campo tem um propósito específico
2. **Facilidade de manutenção** - código mais limpo e direto
3. **Escalabilidade** - fácil adicionar funcionalidades relacionadas
4. **Relatórios** - melhor separação para análises
5. **Padrão de mercado** - arquitetura mais profissional

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs do script de migração
2. Consultar documentação do Supabase
3. Revisar se todas as variáveis de ambiente estão configuradas
4. Verificar permissões do usuário no banco de dados
