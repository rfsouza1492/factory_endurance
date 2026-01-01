# 📊 Informações do Processo Não Exibidas no Frontend

**Data:** 31 de Dezembro de 2025

---

## 🎯 Resumo Executivo

O backend fornece **muitas informações** sobre o processo do workflow que **não estão sendo exibidas** no frontend. Este documento lista todas essas informações e sugere como exibi-las.

---

## ❌ Informações Disponíveis no Backend mas NÃO Exibidas

### 1. **Status Individual dos Agentes** ❌
**Endpoint:** `GET /api/agents`

**Informações disponíveis:**
- Status de cada agente (pending, complete)
- Score individual de cada agente
- Número de issues encontrados por agente
- Última execução de cada agente
- Ícone e nome de cada agente

**Exemplo de resposta:**
```json
{
  "success": true,
  "agents": [
    {
      "name": "Architecture",
      "icon": "🏗️",
      "status": "complete",
      "score": 70,
      "issues": 5,
      "lastRun": "2025-12-31-10-30-00.md"
    },
    {
      "name": "Code Quality",
      "icon": "✅",
      "status": "complete",
      "score": 87,
      "issues": 2,
      "lastRun": "2025-12-31-10-35-00.md"
    }
  ]
}
```

**O que falta no frontend:**
- ❌ Card/Seção mostrando status de cada agente
- ❌ Progresso individual de cada agente
- ❌ Visualização de quais agentes já executaram
- ❌ Score individual de cada agente

---

### 2. **Progresso Detalhado do Workflow** ❌
**Endpoint:** `GET /api/progress`

**Informações disponíveis:**
- Status do workflow (idle, running, complete, error)
- Fase atual (0: idle, 1: execution, 2: evaluation, 3: decision, 4: complete)
- Status de cada fase:
  - Execução dos Agentes
  - Avaliação Cruzada
  - Decisão Go/No-go
- Progresso de cada agente individual
- Timestamps (startTime, endTime)
- Status de cada agente dentro da fase de execução

**Exemplo de resposta:**
```json
{
  "success": true,
  "progress": {
    "workflowStatus": "complete",
    "currentPhase": 3,
    "phases": {
      "execution": {
        "name": "Execução dos Agentes",
        "status": "complete",
        "progress": 100,
        "agents": {
          "architecture": {
            "name": "Architecture Review",
            "status": "complete",
            "progress": 100
          }
        }
      },
      "evaluation": {
        "name": "Avaliação Cruzada",
        "status": "complete",
        "progress": 100
      },
      "decision": {
        "name": "Decisão Go/No-go",
        "status": "complete",
        "progress": 100
      }
    },
    "startTime": "2025-12-31T10:00:00Z",
    "endTime": "2025-12-31T10:30:00Z"
  }
}
```

**O que falta no frontend:**
- ❌ Barra de progresso do workflow
- ❌ Indicador visual de qual fase está ativa
- ❌ Timeline do workflow
- ❌ Tempo de execução (startTime, endTime)
- ❌ Progresso individual de cada fase

---

### 3. **Histórico de Decisões** ❌
**Endpoint:** `GET /api/decisions`

**Informações disponíveis:**
- Todas as decisões tomadas
- ID de cada decisão
- Decisão (GO/NO-GO/GO WITH CONCERNS)
- Score de cada decisão
- Número de issues P0 e P1
- Timestamp de cada decisão

**Exemplo de resposta:**
```json
{
  "success": true,
  "decisions": [
    {
      "id": "decision-001",
      "decision": "GO",
      "score": 75,
      "issuesP0": 0,
      "issuesP1": 2,
      "timestamp": "2025-12-31T10:30:00Z"
    }
  ]
}
```

**O que falta no frontend:**
- ❌ Seção de histórico de decisões
- ❌ Timeline de decisões anteriores
- ❌ Comparação entre decisões
- ❌ Evolução dos scores ao longo do tempo

---

### 4. **Backlog Completo (Tasks)** ❌
**Endpoint:** `GET /api/backlog`

**Informações disponíveis:**
- Lista completa de tasks do backlog
- Summary do backlog (totalTasks, etc.)
- Detalhes de cada task

**Exemplo de resposta:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-001",
      "title": "Corrigir problema de segurança",
      "priority": "P0",
      "status": "pending"
    }
  ],
  "summary": {
    "totalTasks": 20
  }
}
```

**O que falta no frontend:**
- ❌ Visualização do backlog completo (tasks)
- ❌ Status de cada task
- ❌ Prioridades das tasks
- ❌ Filtros por status/prioridade

**Nota:** O frontend mostra apenas o backlog de aprovações (`/api/approvals/backlog`), mas não o backlog de tasks (`/api/backlog`).

---

### 5. **Métricas em Tempo Real** ❌
**Endpoint:** `GET /api/metrics`

**Informações disponíveis:**
- Métricas detalhadas do workflow
- Status atual
- Progresso por fase
- Timestamps

**O que falta no frontend:**
- ❌ Dashboard de métricas
- ❌ Gráficos de progresso
- ❌ Estatísticas de execução

---

### 6. **Atividades Recentes** ❌
**Endpoint:** `GET /api/activities`

**Informações disponíveis:**
- Lista de atividades recentes do workflow
- Timestamp de cada atividade
- Tipo de atividade
- Mensagem formatada

**O que falta no frontend:**
- ❌ Feed de atividades
- ❌ Timeline de eventos
- ❌ Log de ações recentes

---

### 7. **Status do Firebase** ❌
**Endpoint:** `GET /api/firebase/status`

**Informações disponíveis:**
- Status da conexão com Firebase
- Modo de sincronização (híbrido, completo)
- Status dos emuladores
- Informações de sincronização

**O que falta no frontend:**
- ❌ Indicador de status do Firebase
- ❌ Informações de sincronização
- ❌ Status dos emuladores

---

### 8. **Detalhes de Implementações** ❌
**Endpoint:** `GET /api/implementations`

**Informações disponíveis:**
- Lista de implementações realizadas
- Status de cada implementação
- Detalhes de cada implementação

**O que falta no frontend:**
- ❌ Seção de implementações
- ❌ Histórico de implementações
- ❌ Status de cada implementação

---

### 9. **Detalhes de Job Específico** ⚠️
**Endpoint:** `GET /api/jobs/:id`

**Informações disponíveis:**
- Detalhes completos de um job específico
- Status do job
- Output do job
- Erros (se houver)
- Exit code

**O que falta no frontend:**
- ⚠️ Função `viewJobDetails()` existe mas mostra apenas em `alert()`
- ❌ Modal ou página dedicada para detalhes do job
- ❌ Visualização do output completo
- ❌ Logs do job em tempo real

---

### 10. **Relatório Completo** ⚠️
**Endpoint:** `GET /api/approvals/:id/report`

**Informações disponíveis:**
- Relatório completo em Markdown
- Detalhes completos da decisão
- Justificativa detalhada
- Plano de ação completo

**O que falta no frontend:**
- ⚠️ Função `viewDetails()` abre em nova aba
- ❌ Modal ou seção expandida no próprio frontend
- ❌ Renderização do Markdown no frontend
- ❌ Visualização inline do relatório

---

### 11. **Scores Detalhados** ⚠️
**Endpoint:** `GET /api/scores`

**Informações disponíveis:**
- Scores detalhados de cada categoria
- Scores calculados de diferentes fontes
- Overall score calculado

**O que falta no frontend:**
- ⚠️ Alguns scores são exibidos, mas não todos
- ❌ Scores de todas as categorias (security, performance, dependency, etc.)
- ❌ Gráficos de scores
- ❌ Comparação de scores ao longo do tempo

---

## 📊 Resumo de Endpoints Não Utilizados

| Endpoint | Status | Prioridade | Informação |
|----------|--------|------------|------------|
| `/api/agents` | ❌ Não usado | 🔴 Alta | Status individual dos agentes |
| `/api/progress` | ❌ Não usado | 🔴 Alta | Progresso detalhado do workflow |
| `/api/decisions` | ❌ Não usado | 🟡 Média | Histórico de decisões |
| `/api/backlog` | ❌ Não usado | 🟡 Média | Backlog completo (tasks) |
| `/api/metrics` | ❌ Não usado | 🟡 Média | Métricas em tempo real |
| `/api/activities` | ❌ Não usado | 🟢 Baixa | Atividades recentes |
| `/api/firebase/status` | ❌ Não usado | 🟢 Baixa | Status do Firebase |
| `/api/implementations` | ❌ Não usado | 🟡 Média | Detalhes de implementações |
| `/api/jobs/:id` | ⚠️ Parcial | 🟡 Média | Detalhes de job específico |
| `/api/approvals/:id/report` | ⚠️ Parcial | 🟡 Média | Relatório completo |
| `/api/scores` | ⚠️ Parcial | 🟡 Média | Scores detalhados |

---

## 🎯 Recomendações de Implementação

### Prioridade Alta (P0)

1. **Status Individual dos Agentes**
   - Criar seção "Agentes" no dashboard
   - Mostrar status, score e issues de cada agente
   - Indicador visual de progresso

2. **Progresso Detalhado do Workflow**
   - Adicionar barra de progresso geral
   - Mostrar fase atual
   - Timeline do workflow
   - Tempo de execução

### Prioridade Média (P1)

3. **Histórico de Decisões**
   - Seção de histórico
   - Timeline de decisões
   - Comparação entre decisões

4. **Backlog Completo**
   - Visualização de tasks
   - Filtros e ordenação
   - Status de cada task

5. **Detalhes de Job**
   - Modal para detalhes
   - Visualização de output
   - Logs em tempo real

### Prioridade Baixa (P2)

6. **Métricas em Tempo Real**
   - Dashboard de métricas
   - Gráficos de progresso

7. **Atividades Recentes**
   - Feed de atividades
   - Timeline de eventos

8. **Status do Firebase**
   - Indicador de status
   - Informações de sincronização

---

## 📈 Impacto da Implementação

### Antes (Atual)
- ✅ Status geral (scores básicos)
- ✅ Aprovações pendentes
- ✅ Backlog de aprovações
- ✅ Background jobs (básico)
- ❌ Progresso detalhado
- ❌ Status individual dos agentes
- ❌ Histórico de decisões
- ❌ Backlog completo

### Depois (Proposto)
- ✅ Status geral (scores básicos)
- ✅ Aprovações pendentes
- ✅ Backlog de aprovações
- ✅ Background jobs (completo)
- ✅ Progresso detalhado
- ✅ Status individual dos agentes
- ✅ Histórico de decisões
- ✅ Backlog completo
- ✅ Métricas em tempo real
- ✅ Atividades recentes

---

## 🚀 Próximos Passos

1. **Criar seção de Agentes** no dashboard
2. **Adicionar barra de progresso** do workflow
3. **Implementar histórico de decisões**
4. **Criar visualização do backlog completo**
5. **Melhorar detalhes de jobs** (modal ao invés de alert)
6. **Adicionar métricas em tempo real**

---

**Última atualização:** 31 de Dezembro de 2025

