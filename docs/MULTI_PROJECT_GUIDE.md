# 🎯 Guia Multi-Projeto - Maestro Workflow

**Status:** ✅ Implementado  
**Data:** 31 de Dezembro de 2025

---

## 📋 Visão Geral

O Maestro Workflow agora suporta **múltiplos projetos simultaneamente**. Você pode:

- ✅ Adicionar vários projetos para análise
- ✅ Acompanhar status de cada projeto no dashboard
- ✅ Executar análises independentes por projeto
- ✅ Comparar métricas entre projetos
- ✅ Ver histórico de análises por projeto

---

## 🚀 Como Usar

### 1. Acessar Dashboard Multi-Projeto

```bash
# Iniciar servidor
npm run maestro:web

# Acessar dashboard
# http://localhost:3001/multi-project
```

### 2. Adicionar Novo Projeto

1. Clique em **"+ Adicionar Projeto"**
2. Preencha os campos:
   - **ID:** Identificador único (ex: `my-react-app`)
   - **Nome:** Nome amigável (ex: `My React App`)
   - **Caminho:** Caminho relativo da raiz do workspace (ex: `projects/my-app`)
   - **Tipo:** Tipo do projeto (React App, Node.js App, etc.)
   - **Firebase Project ID:** (opcional) ID do projeto Firebase
3. Clique em **"Adicionar"**

### 3. Executar Análise

No dashboard, cada projeto tem um card com:
- Status atual
- Score geral
- Última análise
- Agentes executados

Clique em **"🔍 Analisar"** para iniciar uma análise do projeto.

### 4. Ver Detalhes

Clique em **"📊 Detalhes"** para ver análise completa do projeto.

---

## 📊 Estrutura de Dados

### Firestore Collections

Cada resultado do Maestro agora inclui `projectId`:

```
maestro/results/
├── {agent}-{timestamp}
│   ├── agent: "architecture-review"
│   ├── projectId: "life-goals-app"  ← Novo campo
│   ├── score: 85
│   ├── timestamp: "2025-12-31T..."
│   └── ...
```

### Configuração de Projetos

Arquivo: `maestro-workflow/config/projects.json`

```json
{
  "projects": [
    {
      "id": "life-goals-app",
      "name": "Life Goals App",
      "path": "Agents/life-goals-app",
      "type": "react-app",
      "status": "active",
      "lastAnalysis": {
        "timestamp": "2025-12-31T...",
        "score": 85,
        "status": "completed"
      },
      "firebaseProjectId": "planning-with-ai-fa2a3"
    }
  ],
  "defaultProject": "life-goals-app"
}
```

---

## 🔧 API Endpoints

### Listar Projetos
```http
GET /api/projects
```

### Adicionar Projeto
```http
POST /api/projects
Content-Type: application/json

{
  "id": "my-project",
  "name": "My Project",
  "path": "projects/my-project",
  "type": "react-app",
  "firebaseProjectId": "my-firebase-id"
}
```

### Obter Projeto
```http
GET /api/projects/:id
```

### Remover Projeto
```http
DELETE /api/projects/:id
```

### Executar Análise
```http
POST /api/projects/:id/analyze
```

### Obter Resultados
```http
GET /api/projects/:id/results
```

---

## 📝 Exemplo de Uso

### Adicionar Projeto via API

```javascript
const response = await fetch('http://localhost:3001/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'my-react-app',
    name: 'My React App',
    path: 'projects/my-react-app',
    type: 'react-app',
    firebaseProjectId: 'my-firebase-project'
  })
});

const result = await response.json();
console.log('Projeto adicionado:', result);
```

### Executar Análise via API

```javascript
const response = await fetch('http://localhost:3001/api/projects/my-react-app/analyze', {
  method: 'POST'
});

const result = await response.json();
console.log('Análise iniciada:', result);
```

### Obter Resultados

```javascript
const response = await fetch('http://localhost:3001/api/projects/my-react-app/results');
const { results } = await response.json();

console.log('Resultados:', results);
```

---

## 🎯 Benefícios

1. **Análise Paralela**
   - Analise múltiplos projetos simultaneamente
   - Cada projeto mantém seu próprio histórico

2. **Dashboard Unificado**
   - Veja status de todos os projetos em um lugar
   - Compare métricas entre projetos

3. **Isolamento**
   - Cada projeto tem seus próprios resultados
   - Não há interferência entre projetos

4. **Escalabilidade**
   - Adicione quantos projetos quiser
   - Sistema escala automaticamente

---

## 🔄 Fluxo de Trabalho

```
1. Adicionar Projeto
   ↓
2. Configurar Projeto
   ↓
3. Executar Análise
   ↓
4. Ver Resultados no Dashboard
   ↓
5. Comparar com Outros Projetos
   ↓
6. Ajustar e Re-analisar
```

---

## 📚 Arquivos Relacionados

- **Dashboard:** `maestro-workflow/src/web/multi-project-dashboard.html`
- **API:** `maestro-workflow/src/web/server.js` (endpoints `/api/projects/*`)
- **Manager:** `maestro-workflow/src/config/projects-manager.js`
- **Config:** `maestro-workflow/config/projects.json`

---

**Status:** ✅ Sistema multi-projeto funcionando e pronto para uso!

