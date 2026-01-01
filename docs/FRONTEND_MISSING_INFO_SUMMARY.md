# 📊 Informações Não Exibidas no Frontend - Resumo

**Data:** 31 de Dezembro de 2025

---

## 🎯 Principais Informações Faltando

### 🔴 Prioridade Alta

1. **Status Individual dos Agentes** (`/api/agents`)
   - Status de cada agente (pending, complete)
   - Score individual de cada agente
   - Número de issues por agente
   - Última execução

2. **Progresso Detalhado do Workflow** (`/api/progress`)
   - Barra de progresso geral
   - Fase atual (execução, avaliação, decisão)
   - Progresso de cada fase
   - Tempo de execução (startTime, endTime)

### 🟡 Prioridade Média

3. **Histórico de Decisões** (`/api/decisions`)
   - Todas as decisões anteriores
   - Evolução dos scores
   - Timeline de decisões

4. **Backlog Completo** (`/api/backlog`)
   - Tasks do backlog (não apenas aprovações)
   - Status de cada task
   - Prioridades

5. **Detalhes de Job** (`/api/jobs/:id`)
   - Modal com detalhes completos
   - Output do job
   - Logs em tempo real

### 🟢 Prioridade Baixa

6. **Métricas em Tempo Real** (`/api/metrics`)
7. **Atividades Recentes** (`/api/activities`)
8. **Status do Firebase** (`/api/firebase/status`)
9. **Implementações** (`/api/implementations`)

---

## 📈 Estatísticas

- **Endpoints disponíveis:** 33
- **Endpoints usados no frontend:** 11
- **Endpoints não utilizados:** 22
- **Cobertura:** ~33%

---

## 🚀 Recomendação Imediata

Implementar **Status Individual dos Agentes** e **Progresso Detalhado do Workflow** para melhorar significativamente a visibilidade do processo.

---

**Documentação completa:** `FRONTEND_MISSING_INFO.md`

