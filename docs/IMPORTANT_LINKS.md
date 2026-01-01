# 🔗 Links Importantes do Projeto

**Última atualização:** 31 de Dezembro de 2025

---

## 🎯 Links Principais

### 🌐 Dashboard e Interface Web

| Link | Descrição | Status |
|------|-----------|--------|
| **http://localhost:3001/** | Dashboard principal do Factory | ✅ Ativo |
| **http://localhost:3001/dashboard** | Dashboard tradicional | ✅ Ativo |
| **http://localhost:3001/realtime-dashboard** | Dashboard em tempo real | ✅ Ativo |
| **http://localhost:3001/multi-project** | Dashboard multi-projeto | ✅ Ativo |

---

## 🔌 API REST - Endpoints Principais

**Base URL:** `http://localhost:3001/api`

### 📊 Status e Monitoramento

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/status` | GET | Status geral do sistema |
| `/api/progress` | GET | Progresso detalhado do workflow |
| `/api/metrics` | GET | Métricas em tempo real |
| `/api/activities` | GET | Atividades recentes |
| `/api/logs` | GET | Últimos 100 logs do workflow |

**Exemplo:**
```bash
curl http://localhost:3001/api/status
```

---

### 🤖 Agentes e Resultados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/agents` | GET | Status individual de todos os agentes |
| `/api/scores` | GET | Scores detalhados de todos os agentes |
| `/api/decisions` | GET | Histórico de decisões Go/No-go |

**Exemplo:**
```bash
curl http://localhost:3001/api/agents
curl http://localhost:3001/api/scores
```

---

### 🔄 Workflow e Execução

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/workflow/run` | POST | Executa workflow completo |
| `/api/implementation/run` | POST | Executa Implementation Agent |
| `/api/implementations` | GET | Lista implementações realizadas |

**Exemplo:**
```bash
curl -X POST http://localhost:3001/api/workflow/run \
  -H "Content-Type: application/json" \
  -d '{"phase": "all"}'
```

---

### ✅ Aprovações

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/approvals/pending` | GET | Lista aprovações pendentes |
| `/api/approvals/backlog` | GET | Histórico de aprovações |
| `/api/approvals/:id/approve` | POST | Aprova uma decisão |
| `/api/approvals/:id/reject` | POST | Rejeita uma decisão |
| `/api/approvals/:id/report` | GET | Relatório completo (Markdown) |

**Exemplo:**
```bash
curl http://localhost:3001/api/approvals/pending
curl -X POST http://localhost:3001/api/approvals/approval-1/approve
```

---

### 📋 Backlog e Tarefas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/backlog` | GET | Backlog completo (tasks) |
| `/api/backlog?status=pending` | GET | Backlog filtrado por status |

**Exemplo:**
```bash
curl http://localhost:3001/api/backlog
curl http://localhost:3001/api/backlog?status=pending
```

---

### ⚙️ Background Jobs

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/jobs` | GET | Lista todos os jobs |
| `/api/jobs?status=running` | GET | Jobs filtrados por status |
| `/api/jobs/:id` | GET | Detalhes de um job específico |
| `/api/jobs/:id/cancel` | POST | Cancela um job |

**Exemplo:**
```bash
curl http://localhost:3001/api/jobs
curl http://localhost:3001/api/jobs?status=running
curl -X POST http://localhost:3001/api/jobs/job-123/cancel
```

---

### 🏗️ Multi-Projeto

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/projects` | GET | Lista todos os projetos |
| `/api/projects` | POST | Adiciona novo projeto |
| `/api/projects/:id` | GET | Detalhes de um projeto |
| `/api/projects/:id` | DELETE | Remove projeto |
| `/api/projects/:id/analyze` | POST | Executa análise em projeto |
| `/api/projects/:id/results` | GET | Resultados de um projeto |

**Exemplo:**
```bash
curl http://localhost:3001/api/projects
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Novo Projeto", "path": "/path/to/project"}'
```

---

### 🔥 Firebase

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/firebase/status` | GET | Status da conexão Firebase |
| `/api/firebase/migrate` | POST | Migra dados para Firestore |

**Exemplo:**
```bash
curl http://localhost:3001/api/firebase/status
curl -X POST http://localhost:3001/api/firebase/migrate
```

---

## 🔥 Firebase Emulators

### Interface de Gerenciamento

| Link | Descrição | Porta |
|------|-----------|-------|
| **http://localhost:4000** | Firebase Emulator UI (Interface Principal) | 4000 |
| **http://localhost:8080** | Firestore Emulator | 8080 |
| **http://localhost:9099** | Auth Emulator | 9099 |
| **http://localhost:9199** | Storage Emulator | 9199 |
| **http://localhost:5001** | Functions Emulator | 5001 |
| **http://localhost:5002** | Hosting Emulator | 5002 |

**Acesso Principal:**
- **Firebase Emulator UI:** http://localhost:4000
  - Visualiza todas as coleções do Firestore
  - Gerencia autenticação
  - Monitora functions
  - Visualiza storage

---

## 📚 Documentação

### Documentação Principal

| Documento | Descrição | Localização |
|-----------|-----------|-------------|
| **README Principal** | Visão geral do projeto | `maestro-workflow/README.md` |
| **API Reference** | Referência completa da API | `docs/API_REFERENCE.md` |
| **Backend Status** | Status do backend | `docs/BACKEND_STATUS.md` |
| **Backend Architecture** | Arquitetura do backend | `docs/BACKEND_ARCHITECTURE.md` |
| **Organizational Structure** | Estrutura organizacional | `docs/ORGANIZATIONAL_STRUCTURE.md` |
| **Production Status** | Status de produção | `docs/PRODUCTION_STATUS.md` |

---

### Documentação de Processos

| Documento | Descrição |
|-----------|-----------|
| **Workflow Execution** | Processo de execução do workflow |
| **Backlog Generation** | Geração de backlog |
| **Go/No-go Decision** | Processo de decisão |
| **Product Manager** | Processo do Product Manager |

**Localização:** `docs/processes/`

---

### Documentação Técnica

| Documento | Descrição |
|-----------|-----------|
| **Firebase Integration** | Integração com Firebase |
| **Testing Guide** | Guia de testes |
| **Troubleshooting** | Solução de problemas |
| **Onboarding** | Guia de onboarding |

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Todos os testes
npm test
```

**Documentação:**
- `docs/TESTING_GUIDE.md` - Guia completo de testes
- `docs/TEST_EXECUTION_GUIDE.md` - Guia de execução de testes
- `tests/README.md` - Documentação dos testes

---

## 🛠️ Comandos Úteis

### Iniciar Servidor

```bash
# Servidor web (porta 3001)
npm run maestro:web

# Servidor em produção
PORT=3001 NODE_ENV=production node src/web/server.js
```

### Firebase Emulators

```bash
# Iniciar emulators
npm run firebase:emulators

# Parar emulators
npm run firebase:kill

# Testar conexão
npm run test:firebase
```

### Workflow

```bash
# Executar workflow completo
npm run maestro

# Executar fase específica
npm run maestro -- --phase=1
```

---

## 📊 Monitoramento

### Verificar Status do Servidor

```bash
# Status via API
curl http://localhost:3001/api/status

# Status do Firebase
curl http://localhost:3001/api/firebase/status

# Logs do servidor
tail -f /tmp/maestro-server.log
```

### Verificar Processos

```bash
# Verificar se servidor está rodando
lsof -ti:3001

# Parar servidor
lsof -ti:3001 | xargs kill -9
```

---

## 🔍 Links de Referência Externa

### Firebase

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Best Practices:** https://firebase.google.com/docs/firestore/best-practices
- **Cloud Functions Guide:** https://firebase.google.com/docs/functions

### Ferramentas

- **Mermaid.js:** https://mermaid.js.org/ (Diagramas)
- **Express.js:** https://expressjs.com/ (Framework web)
- **Node.js:** https://nodejs.org/ (Runtime)

---

## 📋 Checklist de Acesso Rápido

### ✅ Verificar se está tudo funcionando:

- [ ] Dashboard principal: http://localhost:3001/
- [ ] API Status: http://localhost:3001/api/status
- [ ] Firebase Emulator UI: http://localhost:4000
- [ ] Background Jobs: http://localhost:3001/api/jobs
- [ ] Agentes: http://localhost:3001/api/agents
- [ ] Progresso: http://localhost:3001/api/progress

---

## 🎯 Links Mais Usados

### Top 5 Links Essenciais

1. **Dashboard Principal**
   - http://localhost:3001/
   - Interface principal para monitorar o sistema

2. **API Status**
   - http://localhost:3001/api/status
   - Verificar saúde do sistema

3. **Firebase Emulator UI**
   - http://localhost:4000
   - Gerenciar dados do Firestore

4. **Background Jobs**
   - http://localhost:3001/api/jobs
   - Monitorar jobs em execução

5. **Agentes**
   - http://localhost:3001/api/agents
   - Status individual dos agentes

---

## 🔐 Autenticação (se habilitada)

Se `REQUIRE_AUTH=true` estiver configurado:

```bash
# Headers necessários para requisições
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3001/api/status
```

**Variáveis de Ambiente:**
- `API_KEY` - Chave de API para autenticação
- `ADMIN_API_KEY` - Chave de administrador
- `REQUIRE_AUTH` - Habilitar autenticação (true/false)

---

## 📝 Notas Importantes

1. **Porta Padrão:** 3001 (para evitar conflito com Vite na porta 3000)
2. **Firebase Emulators:** Devem estar rodando para desenvolvimento
3. **CORS:** Habilitado para desenvolvimento local
4. **Rate Limiting:** Ativo em endpoints críticos (5 req/min para workflow)

---

## 🚀 Quick Start

```bash
# 1. Iniciar Firebase Emulators
npm run firebase:emulators

# 2. Iniciar Servidor Web
npm run maestro:web

# 3. Acessar Dashboard
open http://localhost:3001/

# 4. Verificar Status
curl http://localhost:3001/api/status
```

---

**Última atualização:** 31 de Dezembro de 2025  
**Mantido por:** Factory Manager System

