# 🧪 Plano de Testes - Fases 1, 2 e 3

**Data:** 31 de Dezembro de 2025  
**Status:** 📋 **PLANEJADO**

---

## 🎯 Objetivo

Validar que todas as fases implementadas funcionam corretamente:
- ✅ Fase 1: Blindagem do Firestore
- ✅ Fase 2: Backlog Generator (AutoFixTask completas)
- ✅ Fase 3: Implementation Agent (todos os fixType)

---

## 📋 Estrutura de Testes

### 1. Testes Unitários
- Validação de schemas
- Geradores de AutoFixTask
- Funções apply* individuais

### 2. Testes de Integração
- Backlog Generator → AutoFixTask
- AutoFixTask → Implementation Agent
- Salvamento no Firestore

### 3. Testes End-to-End
- Workflow completo
- Cenários felizes e de erro

---

## 🧪 Fase 1: Blindagem do Firestore

### Teste 1.1: Validação de AutoFixTask

**Objetivo:** Validar que `validateAutoFixTask()` detecta todos os problemas

**Cenários:**
1. ✅ Tarefa válida → deve passar
2. ❌ Tarefa sem `targetPath` → deve falhar
3. ❌ Tarefa sem `fixType` → deve falhar
4. ❌ Tarefa com `fixType: 'patch'` sem `patch` → deve falhar
5. ❌ Tarefa com `undefined` → deve falhar

**Dados de Teste:**
```javascript
// Válido
const validTask = {
  id: 'task-001',
  title: 'Test',
  description: 'Test',
  targetType: 'file',
  targetPath: '/test',
  fixType: 'create',
  newContent: 'test',
  priority: 'P1',
  riskLevel: 'low',
  requiresApproval: false
};

// Inválido - sem targetPath
const invalidTask1 = { ...validTask, targetPath: undefined };

// Inválido - fixType patch sem patch
const invalidTask2 = { ...validTask, fixType: 'patch', patch: undefined };
```

**Critério de Aceitação:**
- ✅ Tarefa válida passa
- ❌ Tarefas inválidas falham com mensagem clara

---

### Teste 1.2: Validação de WorkflowFeedbackEvent

**Objetivo:** Validar que `validateWorkflowFeedbackEvent()` detecta problemas

**Cenários:**
1. ✅ Evento válido → deve passar
2. ❌ Evento com `scores: undefined` → deve falhar
3. ❌ Evento sem `decision` → deve falhar
4. ❌ Evento com `issues` inválido → deve falhar

**Critério de Aceitação:**
- ✅ Evento válido passa
- ❌ Eventos inválidos falham com mensagem clara

---

### Teste 1.3: Fail-Fast no Salvamento

**Objetivo:** Validar que validação é executada antes de salvar

**Cenários:**
1. ✅ Backlog válido → salva no Firestore
2. ❌ Backlog inválido → não salva, erro imediato
3. ✅ Evento válido → salva no Firestore
4. ❌ Evento inválido → não salva, erro imediato

**Critério de Aceitação:**
- ✅ Dados válidos são salvos
- ❌ Dados inválidos não são salvos
- ❌ Erro é lançado antes de `setDoc()`

---

## 🧪 Fase 2: Backlog Generator

### Teste 2.1: Geração de AutoFixTask - Arquivo Faltando

**Objetivo:** Validar que issue de arquivo faltando gera AutoFixTask `create`

**Cenário:**
```javascript
const issue = {
  type: 'Security',
  message: 'firestore.rules não encontrado',
  location: 'Agents/life-goals-app/firestore.rules',
  severity: 'critical',
  priority: 'P0'
};
```

**Resultado Esperado:**
```javascript
{
  id: 'task-001',
  title: '...',
  targetType: 'file',
  targetPath: 'Agents/life-goals-app/firestore.rules',
  fixType: 'create',
  newContent: 'rules_version = \'2\';...', // Template
  priority: 'P0',
  riskLevel: 'low',
  requiresApproval: true
}
```

**Critério de Aceitação:**
- ✅ AutoFixTask gerada é válida
- ✅ `fixType` é `create`
- ✅ `newContent` contém template de firestore.rules
- ✅ Passa em `validateAutoFixTask()`

---

### Teste 2.2: Geração de AutoFixTask - Dependência Faltando

**Objetivo:** Validar que issue de dependência gera AutoFixTask `command`

**Cenário:**
```javascript
const issue = {
  type: 'Dependency',
  message: 'package express não encontrado',
  location: 'package.json',
  severity: 'high',
  priority: 'P1'
};
```

**Resultado Esperado:**
```javascript
{
  fixType: 'command',
  command: 'npm install express',
  targetType: 'command',
  targetPath: 'package.json'
}
```

**Critério de Aceitação:**
- ✅ AutoFixTask gerada é válida
- ✅ `fixType` é `command`
- ✅ `command` é `npm install express`
- ✅ Passa em `validateAutoFixTask()`

---

### Teste 2.3: Filtro de Issues Não Auto-Fixáveis

**Objetivo:** Validar que issues não auto-fixáveis retornam `null`

**Cenários:**
1. Issue de arquitetura → retorna `null`
2. Issue de lógica de negócio → retorna `null`
3. Issue sem location e sem tipo claro → retorna `null`

**Cenário:**
```javascript
const issue = {
  type: 'Architecture',
  message: 'Arquitetura precisa ser refatorada para microserviços',
  severity: 'high'
  // Sem location
};
```

**Resultado Esperado:**
- ✅ `convertIssueToTask(issue)` retorna `null`
- ✅ Issue não entra no backlog
- ✅ Log indica que issue foi filtrado

**Critério de Aceitação:**
- ✅ Issues não auto-fixáveis retornam `null`
- ✅ Backlog só contém AutoFixTask válidas
- ✅ Log indica issues filtrados

---

### Teste 2.4: Backlog Completo

**Objetivo:** Validar que backlog gerado só contém AutoFixTask válidas

**Cenário:**
- Gerar backlog com mix de issues (válidos e inválidos)

**Resultado Esperado:**
- ✅ Backlog só contém AutoFixTask válidas
- ✅ Todas as tarefas passam em `validateAutoFixTask()`
- ✅ Nenhuma tarefa tem `undefined`
- ✅ Issues inválidos são filtrados

**Critério de Aceitação:**
- ✅ 100% das tarefas no backlog são AutoFixTask válidas
- ✅ Backlog passa em `validateAutoFixBacklog()`

---

## 🧪 Fase 3: Implementation Agent

### Teste 3.1: applyCreate()

**Objetivo:** Validar criação de arquivo

**Cenário:**
```javascript
const task = {
  id: 'task-001',
  targetPath: 'test/new-file.js',
  fixType: 'create',
  newContent: 'console.log("test");'
};
```

**Resultado Esperado:**
- ✅ Arquivo criado em `test/new-file.js`
- ✅ Conteúdo é `newContent`
- ✅ Retorna `success: true`

**Critério de Aceitação:**
- ✅ Arquivo é criado corretamente
- ✅ Conteúdo está correto
- ✅ Diretório é criado se não existir
- ✅ Erro se arquivo já existe

---

### Teste 3.2: applyCommand()

**Objetivo:** Validar execução de comando

**Cenário:**
```javascript
const task = {
  id: 'task-002',
  fixType: 'command',
  command: 'npm install express'
};
```

**Resultado Esperado:**
- ✅ Comando é executado
- ✅ Retorna `success: true`
- ✅ Erro se comando falhar

**Critério de Aceitação:**
- ✅ Comando é executado corretamente
- ✅ Erro é logado com RUNTIME_ERROR se falhar

---

### Teste 3.3: applyConfig()

**Objetivo:** Validar atualização de configuração

**Cenário:**
```javascript
const task = {
  id: 'task-003',
  targetPath: '.eslintrc.json',
  fixType: 'config',
  configKey: 'rules.no-console',
  newValue: 'error'
};
```

**Resultado Esperado:**
- ✅ Config é atualizada
- ✅ Chave aninhada funciona
- ✅ JSON é válido após atualização

**Critério de Aceitação:**
- ✅ Config é atualizada corretamente
- ✅ Chaves aninhadas funcionam
- ✅ JSON permanece válido

---

### Teste 3.4: applyPatch()

**Objetivo:** Validar aplicação de patch

**Cenário:**
```javascript
const task = {
  id: 'task-004',
  targetPath: 'src/file.js',
  fixType: 'patch',
  patch: '// Novo conteúdo'
};
```

**Resultado Esperado:**
- ✅ Arquivo é atualizado com patch
- ✅ Mudanças são calculadas corretamente

**Critério de Aceitação:**
- ✅ Patch é aplicado corretamente
- ✅ Mudanças são calculadas

---

### Teste 3.5: applyRewrite()

**Objetivo:** Validar reescrita de arquivo

**Cenário:**
```javascript
const task = {
  id: 'task-005',
  targetPath: 'src/file.js',
  fixType: 'rewrite',
  newContent: '// Conteúdo completo novo'
};
```

**Resultado Esperado:**
- ✅ Arquivo é reescrito completamente
- ✅ Mudanças são calculadas

**Critério de Aceitação:**
- ✅ Arquivo é reescrito corretamente
- ✅ Mudanças são calculadas

---

### Teste 3.6: applyDelete()

**Objetivo:** Validar deleção de arquivo

**Cenário:**
```javascript
const task = {
  id: 'task-006',
  targetPath: 'test/old-file.js',
  fixType: 'delete'
};
```

**Resultado Esperado:**
- ✅ Arquivo é deletado
- ✅ Erro se arquivo não existe

**Critério de Aceitação:**
- ✅ Arquivo é deletado corretamente
- ✅ Erro se arquivo não existe

---

### Teste 3.7: Logs de Erro

**Objetivo:** Validar que erros são logados com RUNTIME_ERROR

**Cenários:**
1. Arquivo não encontrado → RUNTIME_ERROR
2. Comando falha → RUNTIME_ERROR
3. JSON inválido → RUNTIME_ERROR

**Critério de Aceitação:**
- ✅ Erros são logados com prefixo `RUNTIME_ERROR`
- ✅ Contexto completo é incluído
- ✅ Mensagem é descritiva

---

## 🧪 Testes End-to-End

### Teste E2E 1: Workflow Completo - Cenário Feliz

**Objetivo:** Validar workflow completo com dados válidos

**Cenário:**
1. Executar workflow com issues válidos
2. Backlog gerado com AutoFixTask completas
3. Implementation Agent executa todas as tarefas
4. Dados salvos no Firestore

**Resultado Esperado:**
- ✅ Backlog gerado é válido
- ✅ Todas as tarefas são executadas
- ✅ Dados são salvos no Firestore sem erro
- ✅ Nenhum `undefined` chega no Firestore

**Critério de Aceitação:**
- ✅ Workflow completa sem erros
- ✅ Firestore recebe dados válidos
- ✅ Logs são claros e classificados

---

### Teste E2E 2: Workflow Completo - Cenário com Erro

**Objetivo:** Validar que erros são tratados corretamente

**Cenário:**
1. Executar workflow com mix de issues (válidos e inválidos)
2. Backlog gerado filtra issues inválidos
3. Implementation Agent tenta executar tarefas
4. Algumas tarefas falham

**Resultado Esperado:**
- ✅ Issues inválidos são filtrados
- ✅ Backlog só contém AutoFixTask válidas
- ✅ Tarefas válidas são executadas
- ✅ Tarefas que falham são logadas com RUNTIME_ERROR
- ✅ Workflow continua mesmo com alguns erros

**Critério de Aceitação:**
- ✅ Erros são tratados graciosamente
- ✅ Logs são claros e classificados
- ✅ Workflow não quebra completamente

---

## 📊 Checklist de Execução

### Pré-requisitos
- [ ] Firebase emulators rodando (ou credenciais de produção)
- [ ] Projeto de teste configurado
- [ ] Dados de teste preparados

### Fase 1
- [ ] Teste 1.1: Validação de AutoFixTask
- [ ] Teste 1.2: Validação de WorkflowFeedbackEvent
- [ ] Teste 1.3: Fail-Fast no Salvamento

### Fase 2
- [ ] Teste 2.1: Geração - Arquivo Faltando
- [ ] Teste 2.2: Geração - Dependência Faltando
- [ ] Teste 2.3: Filtro de Issues Não Auto-Fixáveis
- [ ] Teste 2.4: Backlog Completo

### Fase 3
- [ ] Teste 3.1: applyCreate()
- [ ] Teste 3.2: applyCommand()
- [ ] Teste 3.3: applyConfig()
- [ ] Teste 3.4: applyPatch()
- [ ] Teste 3.5: applyRewrite()
- [ ] Teste 3.6: applyDelete()
- [ ] Teste 3.7: Logs de Erro

### End-to-End
- [ ] Teste E2E 1: Workflow Completo - Cenário Feliz
- [ ] Teste E2E 2: Workflow Completo - Cenário com Erro

---

## 🚀 Como Executar

### Testes Automatizados

```bash
# Teste de blindagem do Firestore
npm run test:firestore-blindage

# Teste de validação de schemas
node tests/test-schemas.js

# Teste de geradores
node tests/test-autofix-generators.js

# Teste de Implementation Agent
node tests/test-implementation-agent.js
```

### Testes Manuais

```bash
# Executar workflow completo
npm run maestro

# Verificar logs
tail -f logs/maestro.log

# Verificar Firestore
# Acessar http://localhost:4000 (emulators) ou Firebase Console
```

---

## 📝 Critérios de Sucesso

### Fase 1
- ✅ 100% dos testes de validação passam
- ✅ Nenhum `undefined` chega no Firestore
- ✅ Erros são classificados corretamente

### Fase 2
- ✅ 100% das AutoFixTask geradas são válidas
- ✅ Issues não auto-fixáveis são filtrados
- ✅ Backlog passa em `validateAutoFixBacklog()`

### Fase 3
- ✅ Todos os fixType funcionam
- ✅ Erros são logados com RUNTIME_ERROR
- ✅ Validação básica funciona

### End-to-End
- ✅ Workflow completa sem erros críticos
- ✅ Dados são salvos no Firestore
- ✅ Logs são claros e classificados

---

**Status:** 📋 **PLANO COMPLETO - PRONTO PARA EXECUÇÃO**

