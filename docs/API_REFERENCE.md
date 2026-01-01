# 📡 API Reference - Maestro Web Server

**Referência completa da API REST do Maestro**

**Base URL:** `http://localhost:3001`  
**Content-Type:** `application/json`

---

## 📋 Índice

- [Status e Health](#status-e-health)
- [Workflow](#workflow)
- [Backlog](#backlog)
- [Aprovações](#aprovações)
- [Agentes e Resultados](#agentes-e-resultados)
- [Projetos](#projetos)
- [Firebase](#firebase)
- [Jobs em Background](#jobs-em-background)
- [Métricas e Analytics](#métricas-e-analytics)

---

## 🔍 Status e Health

### GET `/api/status`

Retorna status do servidor e sistema.

**Response:**
```json
{
  "status": "running",
  "version": "2.0.0",
  "uptime": 3600,
  "firebase": {
    "connected": true,
    "mode": "hybrid"
  }
}
```

---

### GET `/api/firebase/status`

Retorna status da conexão Firebase.

**Response:**
```json
{
  "connected": true,
  "mode": "emulators",
  "collections": {
    "backlog": 1,
    "results": 10,
    "evaluations": 6
  }
}
```

---

## 🔄 Workflow

### POST `/api/workflow/run`

Executa workflow completo.

**Request:**
```json
{
  "phase": "all",
  "options": {
    "verbose": false,
    "skipTests": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflowId": "workflow-1234567890",
  "status": "running",
  "message": "Workflow iniciado"
}
```

**Rate Limit:** 5 requests/minuto

---

### POST `/api/implementation/run`

Executa Implementation Agent.

**Request:**
```json
{
  "taskIds": ["task-1", "task-2"],
  "options": {
    "dryRun": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "implementationId": "impl-1234567890",
  "tasksProcessed": 2,
  "results": [...]
}
```

---

### GET `/api/progress`

Retorna progresso do workflow atual.

**Response:**
```json
{
  "workflowStatus": "running",
  "currentPhase": 2,
  "phases": {
    "execution": {
      "status": "complete",
      "progress": 100
    },
    "evaluation": {
      "status": "running",
      "progress": 50
    }
  }
}
```

---

## 📋 Backlog

### GET `/api/backlog`

Retorna backlog atual.

**Query Parameters:**
- `status` - Filtrar por status (pending, in-progress, completed)
- `priority` - Filtrar por prioridade (high, medium, low)

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Fix security issue",
      "status": "pending",
      "priority": "high",
      "fixType": "patch"
    }
  ],
  "total": 10
}
```

---

### GET `/api/approvals/backlog`

Retorna backlog pendente de aprovação.

**Response:**
```json
{
  "backlog": {
    "tasks": [...],
    "total": 5
  },
  "requiresApproval": true
}
```

---

## ✅ Aprovações

### GET `/api/approvals/pending`

Lista aprovações pendentes.

**Response:**
```json
{
  "approvals": [
    {
      "id": "approval-1",
      "type": "workflow",
      "status": "pending",
      "createdAt": "2025-12-31T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/approvals/:id/approve`

Aprova uma decisão.

**Request:**
```json
{
  "comment": "Aprovado para produção"
}
```

**Response:**
```json
{
  "success": true,
  "approvalId": "approval-1",
  "status": "approved"
}
```

**Auth:** Requerido (se `REQUIRE_AUTH=true`)

---

### POST `/api/approvals/:id/reject`

Rejeita uma decisão.

**Request:**
```json
{
  "comment": "Necessita mais revisão"
}
```

**Response:**
```json
{
  "success": true,
  "approvalId": "approval-1",
  "status": "rejected"
}
```

**Auth:** Requerido (se `REQUIRE_AUTH=true`)

---

### GET `/api/approvals/:id/report`

Retorna relatório de uma aprovação.

**Response:**
```json
{
  "approval": {
    "id": "approval-1",
    "report": "# Go/No-go Report\n\n...",
    "decision": "GO",
    "scores": {...}
  }
}
```

---

## 🤖 Agentes e Resultados

### GET `/api/agents`

Lista todos os agentes e seus status.

**Response:**
```json
{
  "agents": [
    {
      "name": "architecture-review",
      "status": "complete",
      "lastRun": "2025-12-31T10:00:00Z",
      "score": 85
    }
  ]
}
```

---

### GET `/api/scores`

Retorna scores consolidados dos agentes.

**Response:**
```json
{
  "overall": 80,
  "agents": {
    "architecture": 85,
    "codeQuality": 75,
    "documentation": 80
  },
  "trend": "improving"
}
```

---

### GET `/api/decisions`

Lista decisões Go/No-go.

**Query Parameters:**
- `limit` - Limitar resultados (padrão: 10)
- `status` - Filtrar por status (GO, NO-GO, GO_WITH_CONCERNS)

**Response:**
```json
{
  "decisions": [
    {
      "id": "decision-1",
      "decision": "GO",
      "score": 80,
      "timestamp": "2025-12-31T10:00:00Z"
    }
  ]
}
```

---

## 📁 Projetos

### GET `/api/projects`

Lista todos os projetos configurados.

**Response:**
```json
{
  "projects": [
    {
      "id": "life-goals-app",
      "name": "Life Goals App",
      "status": "active",
      "lastAnalysis": "2025-12-31T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/projects`

Adiciona novo projeto.

**Request:**
```json
{
  "id": "new-project",
  "name": "New Project",
  "path": "path/to/project",
  "type": "react-app"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "new-project",
    "name": "New Project",
    "status": "active"
  }
}
```

**Auth:** Requerido (se `REQUIRE_AUTH=true`)

---

### GET `/api/projects/:id`

Retorna detalhes de um projeto.

**Response:**
```json
{
  "id": "life-goals-app",
  "name": "Life Goals App",
  "path": "Agents/life-goals-app",
  "type": "react-app",
  "status": "active",
  "lastAnalysis": "2025-12-31T10:00:00Z"
}
```

---

### DELETE `/api/projects/:id`

Remove um projeto.

**Response:**
```json
{
  "success": true,
  "message": "Projeto removido"
}
```

**Auth:** Requerido (se `REQUIRE_AUTH=true`)

---

### POST `/api/projects/:id/analyze`

Executa análise completa de um projeto.

**Request:**
```json
{
  "options": {
    "agents": ["architecture", "code-quality"],
    "skipTests": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "analysis-1234567890",
  "status": "running"
}
```

**Rate Limit:** 2 requests/minuto

---

### GET `/api/projects/:id/results`

Retorna resultados da última análise.

**Response:**
```json
{
  "projectId": "life-goals-app",
  "results": {
    "architecture": {...},
    "codeQuality": {...}
  },
  "timestamp": "2025-12-31T10:00:00Z"
}
```

---

## 🔥 Firebase

### POST `/api/firebase/migrate`

Inicia migração de dados para Firestore.

**Request:**
```json
{
  "mode": "hybrid",
  "collections": ["backlog", "results"]
}
```

**Response:**
```json
{
  "success": true,
  "migrationId": "migration-1234567890",
  "status": "running"
}
```

**Auth:** Requerido (Admin)

---

## ⚙️ Jobs em Background

### GET `/api/jobs`

Lista jobs em background.

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-1",
      "type": "workflow",
      "status": "running",
      "progress": 50
    }
  ]
}
```

---

### GET `/api/jobs/:id`

Retorna detalhes de um job.

**Response:**
```json
{
  "id": "job-1",
  "type": "workflow",
  "status": "running",
  "progress": 50,
  "startedAt": "2025-12-31T10:00:00Z"
}
```

---

### POST `/api/jobs/:id/cancel`

Cancela um job em execução.

**Response:**
```json
{
  "success": true,
  "jobId": "job-1",
  "status": "cancelled"
}
```

---

## 📊 Métricas e Analytics

### GET `/api/metrics`

Retorna métricas agregadas do sistema.

**Response:**
```json
{
  "workflows": {
    "total": 100,
    "successful": 95,
    "failed": 5
  },
  "agents": {
    "totalRuns": 500,
    "averageScore": 80
  },
  "performance": {
    "averageExecutionTime": 120
  }
}
```

---

### GET `/api/activities`

Retorna atividades recentes.

**Query Parameters:**
- `limit` - Limitar resultados (padrão: 50)
- `type` - Filtrar por tipo (workflow, approval, etc)

**Response:**
```json
{
  "activities": [
    {
      "id": "activity-1",
      "type": "workflow",
      "action": "completed",
      "timestamp": "2025-12-31T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/logs`

Retorna logs do sistema.

**Query Parameters:**
- `limit` - Limitar resultados (padrão: 100)
- `level` - Filtrar por nível (info, warn, error)

**Response:**
```json
{
  "logs": [
    {
      "level": "info",
      "message": "Workflow iniciado",
      "timestamp": "2025-12-31T10:00:00Z"
    }
  ]
}
```

---

## 🔐 Autenticação

### Endpoints Protegidos

Alguns endpoints requerem autenticação se `REQUIRE_AUTH=true`:

- `POST /api/approvals/:id/approve`
- `POST /api/approvals/:id/reject`
- `POST /api/projects`
- `DELETE /api/projects/:id`
- `POST /api/firebase/migrate` (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

---

## ⚡ Rate Limiting

### Limites Padrão

- **Geral:** 100 requests/minuto
- **Workflow:** 5 requests/minuto
- **Análise de Projeto:** 2 requests/minuto

**Headers de Resposta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

**Status Code:** `429 Too Many Requests` quando excedido

---

## 🐛 Códigos de Erro

### 200 OK
Requisição bem-sucedida

### 400 Bad Request
Requisição inválida (parâmetros faltando ou incorretos)

### 401 Unauthorized
Autenticação requerida ou inválida

### 403 Forbidden
Sem permissão para acessar recurso

### 404 Not Found
Recurso não encontrado

### 429 Too Many Requests
Rate limit excedido

### 500 Internal Server Error
Erro interno do servidor

---

## 📝 Exemplos de Uso

### Executar Workflow

```bash
curl -X POST http://localhost:3001/api/workflow/run \
  -H "Content-Type: application/json" \
  -d '{"phase": "all"}'
```

### Obter Backlog

```bash
curl http://localhost:3001/api/backlog?status=pending
```

### Aprovar Decisão

```bash
curl -X POST http://localhost:3001/api/approvals/approval-1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"comment": "Aprovado"}'
```

---

## 🔗 Documentação Relacionada

- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Troubleshooting da API
- [`DASHBOARD_SPECIFICATION.md`](./DASHBOARD_SPECIFICATION.md) - Especificação do dashboard
- [`FIREBASE_INTEGRATION.md`](./FIREBASE_INTEGRATION.md) - Integração Firebase

---

**Última atualização:** 31 de Dezembro de 2025

