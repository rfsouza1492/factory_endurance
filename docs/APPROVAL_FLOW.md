# 🔄 Fluxo de Aprovação - O que acontece após o usuário aprovar

**Data:** 2025-12-30  
**Versão:** 2.0

---

## 📋 Visão Geral

Este documento detalha o que acontece no sistema após o usuário aprovar uma decisão Go/No-go no Maestro Workflow.

---

## 🎯 Fluxo Completo de Aprovação

### 1. Usuário Aprova a Decisão

**Ação do Usuário:**
- Acessa o dashboard: `http://localhost:3000/dashboard`
- Visualiza a decisão Go/No-go
- Clica em "Aprovar"

**Endpoint Chamado:**
```
POST /api/approvals/:id/approve
```

---

### 2. Servidor Processa a Aprovação

**Código:** `src/web/server.js` (linhas 601-618)

**O que acontece:**

1. **Atualiza Status da Aprovação:**
   ```javascript
   approval.status = 'approved';
   approval.approvedBy = req.body.user || 'Usuário';
   approval.approvedAt = new Date().toISOString();
   ```

2. **Salva Aprovação:**
   - Salva em memória (Map `approvals`)
   - Persiste em arquivo: `src/shared/approvals.json`
   - Formato:
     ```json
     {
       "id": "2025-12-30T10-00-00",
       "status": "approved",
       "approvedBy": "Usuário",
       "approvedAt": "2025-12-30T10:30:00.000Z",
       "decision": "GO WITH CONCERNS",
       "scores": { ... },
       "concerns": { ... }
     }
     ```

3. **Retorna Resposta:**
   ```json
   {
     "success": true,
     "approval": { ... }
   }
   ```

---

### 3. Estado Atual do Sistema Após Aprovação

**O que já foi feito ANTES da aprovação:**

#### ✅ Fase 1: Execução Paralela
- ✅ Todos os 6 agentes executaram
- ✅ Resultados salvos em `src/shared/results/`
- ✅ Scores calculados

#### ✅ Fase 2: Avaliação Cruzada
- ✅ 6 avaliações cruzadas criadas
- ✅ Preocupações identificadas
- ✅ Conflitos detectados

#### ✅ Fase 3: Decisão Go/No-go
- ✅ Decisão tomada (GO, NO-GO, ou GO WITH CONCERNS)
- ✅ Relatório gerado: `src/shared/decisions/go-no-go-report.md`
- ✅ Backlog atualizado gerado: `src/shared/backlog/current-backlog.json`
- ✅ Issues convertidos em tarefas priorizadas

#### ✅ Feedback para Product Manager (se havia backlog inicial)
- ✅ Arquivo criado: `src/shared/events/workflow-feedback.json`
- ✅ Contém: decisão, scores, issues, backlog atualizado
- ✅ Evento `backlog-ready.json` removido

---

### 4. O que acontece DEPOIS da Aprovação

#### 📊 Status Atualizado

**No Dashboard:**
- Status da aprovação muda de "pending" para "approved"
- Badge de notificações diminui
- Card de decisão mostra "✅ Aprovado"

**No Sistema:**
- Aprovação fica registrada permanentemente
- Histórico de aprovações atualizado

---

#### 🔄 Próximos Passos (Manual ou Automatizado)

**Atualmente (v2.0):** A aprovação é principalmente um registro. O sistema não executa ações automáticas após aprovação.

**O que o usuário pode fazer:**

1. **Implementar Tarefas do Backlog:**
   - Acessar backlog: `src/shared/backlog/current-backlog.json`
   - Implementar tarefas priorizadas (P0, P1, P2, P3)
   - Marcar tarefas como concluídas

2. **Re-executar Workflow:**
   - Após implementar melhorias, executar workflow novamente
   - Verificar se scores melhoraram
   - Verificar se decisão mudou (NO-GO → GO WITH CONCERNS → GO)

3. **Product Manager Lê Feedback (se aplicável):**
   - Se havia backlog inicial do Product Manager
   - Product Manager pode ler: `src/shared/events/workflow-feedback.json`
   - Decidir próximos passos baseado no feedback

---

## 🔮 Implementações Futuras (Planejadas)

### Implementação Automática (Nível 1: Baixo Risco)

**Quando implementado:**
- Sistema automaticamente implementa correções de baixo risco
- Exemplos:
  - Adicionar comentários em código
  - Corrigir formatação
  - Adicionar documentação básica

**Status:** ⏳ Não implementado

---

### Implementação Assistida (Nível 2: Médio Risco)

**Quando implementado:**
- Sistema sugere mudanças e pede confirmação
- Usuário revisa e aprova cada mudança
- Sistema implementa após confirmação

**Status:** ⏳ Não implementado

---

### Implementação Completa (Nível 3: Alto Risco)

**Quando implementado:**
- Sistema implementa todas as melhorias automaticamente
- Cria commits
- Abre Pull Requests
- Aguarda revisão

**Status:** ⏳ Não implementado

---

## 📁 Arquivos Envolvidos no Fluxo de Aprovação

### Arquivos Criados/Atualizados:

1. **`src/shared/approvals.json`**
   - Contém todas as aprovações
   - Status: pending, approved, rejected
   - Timestamps e usuário

2. **`src/shared/decisions/go-no-go-report.md`**
   - Relatório completo da decisão
   - Já foi gerado antes da aprovação
   - Não muda após aprovação

3. **`src/shared/backlog/current-backlog.json`**
   - Backlog atualizado com tarefas
   - Já foi gerado antes da aprovação
   - Não muda após aprovação

4. **`src/shared/events/workflow-feedback.json`** (se havia backlog inicial)
   - Feedback para Product Manager
   - Já foi gerado antes da aprovação
   - Não muda após aprovação

---

## 🔄 Ciclo Completo

```
1. Product Manager gera backlog
   ↓
2. Maestro executa workflow
   ↓
3. Decisão Go/No-go gerada
   ↓
4. Backlog atualizado gerado
   ↓
5. Feedback retornado para PM (se aplicável)
   ↓
6. Usuário visualiza no dashboard
   ↓
7. Usuário APROVA decisão
   ↓
8. Status atualizado para "approved"
   ↓
9. [MANUAL] Usuário implementa tarefas do backlog
   ↓
10. [MANUAL] Usuário re-executa workflow
   ↓
11. Novo ciclo começa
```

---

## 📊 Exemplo Prático

### Cenário: Decisão GO WITH CONCERNS Aprovada

**Antes da Aprovação:**
- Decisão: GO WITH CONCERNS
- Score: 75/100
- Issues P1: 6
- Backlog: 14 tarefas geradas

**Após Aprovação:**
- Status: ✅ approved
- Aprovação registrada em `approvals.json`
- Dashboard mostra "Aprovado"

**Próximos Passos (Manual):**
1. Usuário acessa backlog
2. Implementa tarefas P1 (6 tarefas)
3. Re-executa workflow
4. Nova decisão: GO (score melhorou para 85/100)
5. Aprova nova decisão
6. Ciclo continua

---

## 🎯 Resumo

### O que acontece IMEDIATAMENTE após aprovação:
- ✅ Status atualizado para "approved"
- ✅ Aprovação salva em `approvals.json`
- ✅ Dashboard atualizado
- ✅ Notificações atualizadas

### O que NÃO acontece automaticamente:
- ❌ Implementação de tarefas
- ❌ Execução de correções
- ❌ Criação de commits
- ❌ Abertura de PRs

### O que o usuário DEVE fazer:
- 📋 Implementar tarefas do backlog manualmente
- 🔄 Re-executar workflow após implementações
- 📊 Monitorar melhorias nos scores
- ✅ Aprovar novas decisões

---

## 🔗 Referências

- [Workflow Execution Process](processes/workflow-execution.md)
- [Product Manager Process](processes/product-manager.md)
- [Backlog Generation Process](processes/backlog-generation.md)
- [Automation and Triggers](AUTOMATION_AND_TRIGGERS.md)

---

**Última Atualização:** 2025-12-30  
**Versão:** 2.0

