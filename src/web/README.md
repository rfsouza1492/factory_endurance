# Maestro Web Interface

Interface web para gerenciar e executar workflows do Maestro.

## 🚀 Iniciar Servidor

```bash
npm run maestro:web
```

Ou diretamente:

```bash
node Agents/maestro/web/server.js
```

O servidor iniciará em: **http://localhost:3000**

## 📋 Funcionalidades

### 1. Executar Workflow
- Botão para executar o workflow completo
- Visualização do status em tempo real
- Logs da execução

### 2. Status Atual
- Métricas em tempo real:
  - Score Geral
  - Score Architecture
  - Score Code Quality
  - Score Documentation

### 3. Aprovações Pendentes
- Lista de decisões Go/No-go aguardando aprovação
- Visualização de:
  - Decisão (GO/NO-GO/GO WITH CONCERNS)
  - Score
  - Justificativa
  - Issues críticos e de alta prioridade
- Ações:
  - ✅ Aprovar
  - ❌ Rejeitar
  - 📄 Ver Detalhes

### 4. Backlog de Aprovações
- Histórico de todas as aprovações
- Status de cada decisão
- Informações de quem aprovou/rejeitou

### 5. Logs
- Visualização de logs do workflow
- Atualização em tempo real

## 🎨 Interface

A interface é responsiva e moderna, com:
- Design limpo e intuitivo
- Cores indicativas de status
- Cards organizados
- Atualização automática a cada 5 segundos

## 🔧 API Endpoints

### GET `/api/status`
Retorna o status atual do sistema e scores.

### POST `/api/workflow/run`
Executa o workflow completo.

### GET `/api/approvals/pending`
Lista aprovações pendentes.

### GET `/api/approvals/backlog`
Lista histórico de aprovações.

### POST `/api/approvals/:id/approve`
Aprova uma decisão.

### POST `/api/approvals/:id/reject`
Rejeita uma decisão.

### GET `/api/approvals/:id/report`
Retorna o relatório completo em Markdown.

### GET `/api/logs`
Retorna os logs do workflow.

## 📦 Dependências

- `express`: Servidor web
- `cors`: CORS middleware

Instalar com:
```bash
npm install express cors
```

## 🎯 Uso

1. Inicie o servidor: `npm run maestro:web`
2. Abra o navegador em: http://localhost:3000
3. Clique em "Executar Workflow Completo" para iniciar
4. Aguarde a execução
5. Revise as aprovações pendentes
6. Aprove ou rejeite conforme necessário

---

**Última Atualização**: 2024-12-30

