# 🏗️ Arquitetura do Backend - Maestro/Factory

**Diagrama visual e detalhado da arquitetura**

---

## 📊 Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                        │
│  - Dashboard HTML/JS                                        │
│  - Multi-Project Dashboard                                  │
│  - Real-time Dashboard                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Port 3001)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware                                            │  │
│  │  - CORS                                                │  │
│  │  - JSON Parser                                         │  │
│  │  - Static Files                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API REST Endpoints (30+)                            │  │
│  │  ├── Workflow Management                              │  │
│  │  ├── Agent Monitoring                                 │  │
│  │  ├── Approval System                                   │  │
│  │  ├── Multi-Project Management                         │  │
│  │  ├── Firebase Integration                             │  │
│  │  └── Logs & Metrics                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────┬──────────────────┘
               │                           │
       ┌───────┴───────┐         ┌────────┴────────┐
       │               │         │                  │
       ▼               ▼         ▼                  ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│ File System │  │ Firestore│  │ Cloud        │  │ Workflow     │
│  (Local)    │  │ (Cloud)  │  │ Functions    │  │ Scripts      │
│             │  │          │  │              │  │              │
│ - results/  │  │ - backlog│  │ - process    │  │ - run-       │
│ - backlog/  │  │ - results│  │   Agent      │  │   workflow   │
│ - decisions/│  │ - events │  │ - generate   │  │ - agents/    │
│ - events/   │  │ - metrics│  │   Report     │  │              │
└─────────────┘  └──────────┘  │ - calculate  │  └──────────────┘
                               │   Metrics    │
                               │ - cleanup    │
                               └──────────────┘
```

---

## 🔌 API REST - Detalhamento

### Workflow Management
```
POST   /api/workflow/run          → Executa workflow completo
GET    /api/status                → Status atual do sistema
GET    /api/progress              → Progresso do workflow (híbrido)
GET    /api/metrics              → Métricas em tempo real
GET    /api/activities           → Atividades recentes
GET    /api/logs                 → Últimos 100 logs
```

### Agent Monitoring
```
GET    /api/agents               → Lista agentes e status
GET    /api/scores               → Scores de todos os agentes
GET    /api/decisions            → Decisões Go/No-go
```

### Implementation
```
POST   /api/implementation/run   → Executa Implementation Agent
GET    /api/implementations      → Lista implementações
```

### Approval System
```
GET    /api/approvals/pending    → Aprovações pendentes
GET    /api/approvals/backlog    → Histórico de aprovações
POST   /api/approvals/:id/approve → Aprova decisão
POST   /api/approvals/:id/reject → Rejeita decisão
GET    /api/approvals/:id/report → Relatório completo (MD)
```

### Multi-Project
```
GET    /api/projects             → Lista projetos
POST   /api/projects             → Adiciona projeto
GET    /api/projects/:id         → Detalhes do projeto
DELETE /api/projects/:id         → Remove projeto
POST   /api/projects/:id/analyze → Executa análise
GET    /api/projects/:id/results → Resultados do projeto
```

### Firebase
```
POST   /api/firebase/migrate     → Migra dados para Firestore
GET    /api/firebase/status      → Status da conexão
```

---

## 🔥 Firebase Services

### Firestore Collections
```
backlog/
  └── current                    # Backlog atual

agent-results/
  └── {resultId}                 # Resultados dos agentes

evaluations/
  └── {evaluationId}             # Avaliações cruzadas

decisions/
  └── {decisionId}                # Decisões Go/No-go

events/
  └── {eventId}                  # Eventos do workflow

maestro/results/
  └── {resultId}                 # Resultados por projeto

processes/
  └── {processId}                # Processos em execução

reports/
  └── {reportId}                 # Relatórios gerados

metrics/
  └── current                    # Métricas agregadas
```

### Cloud Functions
```
processAgent              # Processa agente específico
generateReport            # Gera relatório agregado
calculateMetrics          # Calcula métricas complexas
batchProcessAgents        # Processa múltiplos agentes
onResultCreated           # Trigger: novo resultado
onWorkflowProgressUpdated # Trigger: progresso atualizado
```

---

## 💾 Armazenamento

### Local (File System)
```
src/shared/
  ├── results/              # Resultados dos agentes
  │   ├── architecture-review/
  │   ├── code-quality-review/
  │   └── ...
  ├── evaluations/          # Avaliações cruzadas
  ├── decisions/            # Decisões Go/No-go
  ├── backlog/              # Backlogs
  ├── implementations/      # Implementações
  ├── events/               # Eventos
  └── workflow-progress.json # Progresso
```

### Cloud (Firestore)
- ✅ Sincronização híbrida
- ✅ Real-time updates
- ✅ Histórico completo
- ✅ Multi-projeto

---

## 🔄 Fluxo de Dados

### 1. Execução de Workflow
```
Frontend → POST /api/workflow/run
  ↓
Express Server → Executa run-workflow.js
  ↓
Agents executam → Geram resultados
  ↓
Salva híbrido:
  ├── File System (local)
  └── Firestore (cloud)
  ↓
Cloud Functions (triggers)
  ├── onResultCreated
  └── onWorkflowProgressUpdated
  ↓
Frontend atualiza (polling/real-time)
```

### 2. Aprovação de Decisão
```
Frontend → POST /api/approvals/:id/approve
  ↓
Express Server → Atualiza Map() em memória
  ↓
Salva em arquivo (approvals.json)
  ↓
Frontend atualiza
```

### 3. Multi-Projeto
```
Frontend → POST /api/projects/:id/analyze
  ↓
Express Server → Executa workflow em background
  ↓
Salva resultados com projectId
  ↓
Frontend → GET /api/projects/:id/results
  ↓
Firestore query com projectId
```

---

## ⚡ Performance

### Tempos de Resposta
- **Endpoints simples:** < 50ms
- **Endpoints com Firestore:** < 200ms (local), < 500ms (cloud)
- **Workflow execution:** Variável (30s - 5min)

### Limitações
- ⚠️ Aprovações em memória (perdidas ao reiniciar)
- ⚠️ Logs limitados a 1000 entradas
- ⚠️ Workflow síncrono (pode bloquear)

---

## 🔒 Segurança

### Implementado
- ✅ CORS configurado
- ✅ JSON parsing seguro
- ✅ Error handling

### Não Implementado
- ❌ Autenticação de usuários
- ❌ Rate limiting
- ❌ Input validation robusta
- ❌ HTTPS enforcement

---

## 📈 Escalabilidade

### Atual
- ✅ Suporta múltiplos projetos
- ✅ Firestore escalável
- ✅ Cloud Functions para processamento pesado

### Limitações
- ⚠️ Servidor Express single-threaded
- ⚠️ Workflow síncrono
- ⚠️ Sem load balancing

---

## 🎯 Status por Componente

| Componente | Status | Observações |
|------------|--------|------------|
| **Express Server** | ✅ Completo | 30+ endpoints funcionais |
| **Firebase Integration** | ✅ Completo | Firestore, Auth, Functions |
| **API REST** | ✅ Completo | Todos os endpoints implementados |
| **Cloud Functions** | ✅ Implementado | 5 funções + 2 triggers |
| **Sincronização Híbrida** | ✅ Funcional | Arquivo + Firestore |
| **Multi-Projeto** | ✅ Funcional | Suporte completo |
| **Real-time Updates** | ⚠️ Parcial | Polling (WebSockets não implementado) |
| **Autenticação** | ❌ Não implementado | Sem sistema de usuários |
| **Rate Limiting** | ❌ Não implementado | Sem proteção |
| **Background Jobs** | ❌ Não implementado | Workflow síncrono |

---

## 🚀 Como Executar

### Servidor Web
```bash
npm run maestro:web
# ou
node src/web/server.js
```

### Acessar
- **Dashboard:** http://localhost:3001
- **Multi-Projeto:** http://localhost:3001/multi-project
- **Real-time:** http://localhost:3001/realtime-dashboard

---

## 📚 Documentação

- [`BACKEND_STATUS.md`](./BACKEND_STATUS.md) - Status detalhado
- [`src/web/README.md`](../src/web/README.md) - Documentação do servidor
- [`MULTI_PROJECT_GUIDE.md`](./MULTI_PROJECT_GUIDE.md) - Guia multi-projeto

---

**Última atualização:** 31 de Dezembro de 2025

