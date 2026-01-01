# 🎯 Plano de Implementação - Contrato AutoFix

**Data:** 31 de Dezembro de 2025  
**Status:** 🔄 **FASE 1 IMPLEMENTADA - FASE 2 PENDENTE**

---

## ✅ Fase 1: Validação e Fail-Fast (IMPLEMENTADO)

### O Que Foi Feito

1. ✅ **Schema AutoFixTask criado**
   - `maestro-workflow/src/schemas/auto-fix-task.js`
   - Validação completa de campos obrigatórios
   - Validação condicional por `fixType`

2. ✅ **Validação Fail-Fast implementada**
   - `Implementation Agent` valida antes de executar
   - `run-workflow.js` valida antes de salvar
   - Erro imediato se contrato violado

3. ✅ **Implementation Agent simplificado**
   - Remove filtro de "auto-fixável"
   - Executa TODAS as tarefas do backlog
   - Assume que se está no backlog, é auto-fixável

### Resultado Atual

- ✅ Validação detecta tarefas inválidas
- ⚠️ Backlog Generator ainda cria tarefas sem patch/comando
- ⚠️ Tarefas inválidas são detectadas mas não filtradas automaticamente

---

## 🔄 Fase 2: Backlog Generator (PENDENTE)

### O Que Precisa Ser Feito

**Modificar `convertIssueToTask()` para gerar apenas AutoFixTask completas:**

1. **Analisar issue e determinar se pode ser auto-fixável**
   - Se não → retornar `null` (não entra no backlog)

2. **Gerar patch/comando baseado no tipo de issue:**
   - **Arquivo faltando** → `fixType: 'create'`, `newContent: template`
   - **Arquivo com problema** → `fixType: 'patch'`, `patch: diff`
   - **Config incorreta** → `fixType: 'config'`, `configKey`, `newValue`
   - **Comando necessário** → `fixType: 'command'`, `command: 'npm install ...'`

3. **Preencher todos os campos obrigatórios:**
   - `targetType`, `targetPath`, `fixType`
   - Campo específico do `fixType` (patch, command, newContent, etc.)
   - `riskLevel`, `requiresApproval`

### Exemplo de Conversão

**Issue:**
```javascript
{
  type: 'Security',
  message: 'firestore.rules não encontrado',
  location: 'Agents/life-goals-app/firestore.rules',
  severity: 'critical'
}
```

**AutoFixTask gerada:**
```javascript
{
  id: 'task-001',
  title: 'Criar firestore.rules',
  description: 'Arquivo firestore.rules não encontrado - regras de segurança não configuradas',
  targetType: 'file',
  targetPath: 'Agents/life-goals-app/firestore.rules',
  fixType: 'create',
  newContent: `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}`,
  priority: 'P0',
  riskLevel: 'low',
  requiresApproval: true,
  status: 'todo'
}
```

**Issue que NÃO pode ser auto-fix:**
```javascript
{
  type: 'Architecture',
  message: 'Arquitetura precisa ser refatorada para suportar microserviços',
  severity: 'high'
}
```

**Resultado:** `null` (não entra no backlog, vai para `insights/`)

---

## 📋 Checklist de Implementação

### Fase 1: Validação ✅
- [x] Schema AutoFixTask
- [x] Função validateAutoFixTask
- [x] Função validateAutoFixBacklog
- [x] Validação no Implementation Agent
- [x] Validação no run-workflow.js

### Fase 2: Backlog Generator 🔄
- [ ] Modificar `convertIssueToTask()` para gerar AutoFixTask
- [ ] Implementar geração de `patch` para issues de código
- [ ] Implementar geração de `newContent` para arquivos faltando
- [ ] Implementar geração de `command` para dependências
- [ ] Filtrar issues não auto-fixáveis (retornar null)
- [ ] Testar com backlog real

### Fase 3: Implementation Agent ✅
- [x] Remover filtro de "auto-fixável"
- [x] Executar todas as tarefas
- [x] Validação fail-fast
- [ ] Implementar aplicação de `patch`
- [ ] Implementar aplicação de `newContent`
- [ ] Implementar execução de `command`

---

## 🧪 Teste Atual

Execute o workflow:

```bash
npm run maestro
```

**Comportamento esperado:**
- ⚠️ Validação detecta tarefas inválidas
- ⚠️ Avisos são exibidos
- ✅ Workflow continua (por enquanto)
- ❌ Implementation Agent falha ao tentar executar tarefas sem patch/comando

**Próximo passo:** Implementar Fase 2 (Backlog Generator)

---

**Status:** ✅ Validação implementada | 🔄 Backlog Generator pendente

