# 📋 Contrato AutoFix - Todo Backlog é Auto-Fixável

**Data:** 31 de Dezembro de 2025  
**Status:** ✅ **IMPLEMENTANDO**

---

## 🎯 Regra de Ouro

> **Se uma tarefa entra no backlog, ela é, por definição, auto-fixável.**
> 
> Se não é auto-fixável, **não deve existir no backlog**.

---

## 📐 Schema AutoFixTask

Toda tarefa no backlog DEVE ter:

### Campos Obrigatórios

```typescript
{
  id: string;                    // ID único
  title: string;                 // Título
  description: string;           // Descrição do problema
  targetType: 'file' | 'function' | 'config' | 'doc' | 'command';
  targetPath: string;           // Caminho do arquivo/função/config
  fixType: 'patch' | 'rewrite' | 'command' | 'create' | 'delete';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
}
```

### Campos Condicionais (por fixType)

- **fixType: 'patch'** → requer `patch` (diff ou trecho)
- **fixType: 'rewrite'** → requer `newContent` (conteúdo completo)
- **fixType: 'command'** → requer `command` (comando a executar)
- **fixType: 'create'** → requer `newContent` (conteúdo do novo arquivo)
- **fixType: 'delete'** → requer apenas `targetPath`
- **fixType: 'config'** → requer `configKey` e `newValue`

---

## 🔒 Validação Fail-Fast

**No momento de salvar o backlog:**

```javascript
import { validateAutoFixBacklog } from './schemas/auto-fix-task.js';

const validation = validateAutoFixBacklog(backlog);
if (!validation.valid) {
  throw new Error(`Contrato violado: ${validation.errors.join('; ')}`);
}
```

**Se qualquer tarefa violar o contrato → workflow falha imediatamente.**

---

## 🔄 Mudanças no Pipeline

### 1. Backlog Generator

**ANTES:**
- Gera tarefas descritivas
- Sem patch/comando
- Implementation Agent filtra depois

**DEPOIS:**
- Só gera tarefas com patch/comando completo
- Se não conseguir gerar → não entra no backlog
- Vai para `insights` ou `manualActions`

### 2. Implementation Agent

**ANTES:**
```javascript
const autoFixableTasks = filterAutoFixableTasks(backlog.tasks);
if (autoFixableTasks.length === 0) {
  return 'Nenhuma tarefa auto-fixável';
}
```

**DEPOIS:**
```javascript
// Validação fail-fast
const validation = validateAutoFixBacklog(backlog);
if (!validation.valid) {
  throw new Error(`Backlog inválido: ${validation.errors.join('; ')}`);
}

// Executa TODAS as tarefas (sem filtro)
for (const task of backlog.tasks) {
  await applyAutoFix(task);
}
```

---

## 📊 Exemplo de Tarefa Válida

```json
{
  "id": "task-001",
  "title": "Adicionar firestore.rules",
  "description": "Arquivo firestore.rules não encontrado",
  "targetType": "file",
  "targetPath": "Agents/life-goals-app/firestore.rules",
  "fixType": "create",
  "newContent": "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}",
  "priority": "P0",
  "riskLevel": "low",
  "requiresApproval": true,
  "status": "todo"
}
```

---

## 🚫 Exemplo de Tarefa Inválida (NÃO entra no backlog)

```json
{
  "id": "task-001",
  "title": "Melhorar arquitetura",
  "description": "Arquitetura precisa ser melhorada",
  "type": "refactor"
  // ❌ Faltando: targetPath, fixType, patch/comando
}
```

**Destino:** `insights/architecture-improvements.md` (não backlog)

---

## ✅ Checklist de Implementação

- [x] Schema AutoFixTask criado
- [x] Função de validação criada
- [ ] Backlog Generator atualizado (gerar apenas AutoFixTask)
- [ ] Implementation Agent simplificado (executar todas)
- [ ] Validação fail-fast no salvamento
- [ ] Testes de validação

---

**Status:** 🔄 Em implementação

