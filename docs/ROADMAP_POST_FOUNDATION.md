# 🗺️ Roadmap Pós-Fundação

**Data:** 31 de Dezembro de 2025  
**Status:** ✅ **FUNDAÇÃO ESTABELECIDA - PRONTO PARA FASE 2**

---

## 🎯 O Que a Fundação Garante

### 1. Invariantes Fortes ✅

**Nenhum `setDoc()` roda sem:**
- ✅ Validação de contrato (AutoFixTask, WorkflowFeedbackEvent, etc.)
- ✅ Validação Firestore-safe (validateForFirestore)
- ✅ (Opcional) Sanitização (removeUndefined())

**Resultado:** O problema original (workflow rodando "bonito" e Firestore explodindo por `undefined`) foi **eliminado por design**.

---

### 2. Domínio > Infra ✅

**O que é válido está na camada de domínio:**
- ✅ `auto-fix-task.js` - Define o que é uma tarefa válida
- ✅ `workflow-feedback-event.js` - Define o que é um evento válido
- ✅ Firestore só persiste, não decide

**Resultado:** Separação clara de responsabilidades. Regras de negócio não estão acopladas à infraestrutura.

---

### 3. Diagnóstico Claro ✅

**Erros classificados com prefixos:**
- ✅ `CONTRACT_ERROR` - Objeto viola contrato
- ✅ `INFRA_ERROR` - Erro de infraestrutura
- ✅ `RUNTIME_ERROR` - Erro durante execução
- ✅ `VALIDATION_ERROR` - Erro na validação em si

**Resultado:** Logs de execuções longas são facilmente analisáveis.

---

### 4. Segurança Contra Regressão ✅

**Proteções implementadas:**
- ✅ Testes automatizados (`test-firestore-blindage.js`)
- ✅ Documentação de fundação (`FOUNDATION_BLINDAGE.md`)
- ✅ Regras de modificação claras

**Resultado:** Mudanças futuras não podem quebrar a blindagem sem revisão arquitetural.

---

## 🚧 O Que Ainda Falta

### Gargalo Atual

**Não é mais:** "É seguro salvar?"  
**Agora é:** "O que exatamente estou salvando e consigo de fato auto-fixar?"

---

## 📋 Fase 2: Backlog Generator

### Objetivo

Transformar o backlog de **"lista de problemas"** para **"lista de ações executáveis"**.

### Implementação

**Arquivo:** `maestro-workflow/src/scripts/backlog-generator.js`

**Função principal:** `convertIssueToTask(issue)`

**Regra de ouro:**
```javascript
// Se não for possível gerar AutoFixTask completa → retornar null
const task = convertIssueToTask(issue);
if (task === null) {
  // Não entra no backlog, vai para insights/manualActions
}
```

### Critérios de Sucesso

1. ✅ **Backlog só contém AutoFixTask válidas**
   - Todas as tarefas passam em `validateAutoFixTask()`
   - Nenhuma tarefa com campos faltando

2. ✅ **Issues não auto-fixáveis são filtrados**
   - Arquitetura → `insights/architecture.md`
   - Lógica de negócio → `insights/business-logic.md`
   - Decisões de design → `insights/design-decisions.md`
   - Mudanças grandes → `manualActions/large-changes.md`

3. ✅ **Cada AutoFixTask tem fix claro**
   - `fixType: 'create'` → `newContent` preenchido
   - `fixType: 'patch'` → `patch` preenchido
   - `fixType: 'command'` → `command` preenchido
   - `fixType: 'config'` → `configKey` e `newValue` preenchidos

### Guia de Implementação

**Documento:** `maestro-workflow/docs/ISSUE_TO_AUTOFIX_MAPPING.md`

**Tabela de mapeamento:**
- Tipo de Issue → fixType → Campos mínimos → Estratégia de geração

**Estratégias:**
- **Template** - Para arquivos comuns (firestore.rules, package.json, etc.)
- **Heurística** - Para casos simples (imports, comandos npm, etc.)
- **LLM** - Para casos complexos (patches, documentação, etc.)

### Testes Necessários

1. ✅ Issue válido → AutoFixTask completa gerada
2. ✅ Issue inválido → retorna `null`
3. ✅ AutoFixTask gerada → passa em `validateAutoFixTask()`
4. ✅ AutoFixTask gerada → não contém `undefined`
5. ✅ Backlog gerado → todas as tarefas são AutoFixTask válidas

---

## 📋 Fase 3: Implementation Agent

### Objetivo

Implementar de fato cada `fixType` para que o Implementation Agent possa executar todas as tarefas do backlog.

### Implementação

**Arquivo:** `maestro-workflow/src/agents/implementation-agent.js`

**Funções a implementar:**
- `applyCreate(task)` - Criar arquivo com `newContent`
- `applyPatch(task)` - Aplicar `patch` no arquivo
- `applyRewrite(task)` - Reescrever arquivo com `newContent`
- `applyCommand(task)` - Executar `command`
- `applyConfig(task)` - Atualizar config com `configKey` e `newValue`
- `applyDelete(task)` - Deletar arquivo/função

### Critérios de Sucesso

1. ✅ **Todos os fixType implementados**
   - `create` - Funciona
   - `patch` - Funciona
   - `rewrite` - Funciona
   - `command` - Funciona
   - `config` - Funciona
   - `delete` - Funciona

2. ✅ **Logs de RUNTIME_ERROR descritivos**
   - Erro indica exatamente o que falhou
   - Contexto completo (arquivo, linha, comando, etc.)
   - Sugestões de correção quando possível

3. ✅ **Validação de resultado**
   - Verifica se fix foi aplicado corretamente
   - Valida arquivo após modificação
   - Testa comando após execução

### Testes Necessários

1. ✅ Cada fixType funciona corretamente
2. ✅ Erros são logados com RUNTIME_ERROR
3. ✅ Validação de resultado funciona
4. ✅ Rollback em caso de erro (se necessário)

---

## 🎯 Roadmap Visual

```
┌─────────────────────────────────────────────────────────┐
│ FASE 1: FUNDAÇÃO ✅                                      │
│ - Blindagem do Firestore                                │
│ - Validação de contratos                                │
│ - Classificação de erros                                 │
│ - Testes de regressão                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 2: BACKLOG GENERATOR ⏭️                            │
│ - convertIssueToTask() completo                         │
│ - Geração de AutoFixTask completas                     │
│ - Filtro de issues não auto-fixáveis                    │
│ - Templates e heurísticas                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 3: IMPLEMENTATION AGENT ⏭️                         │
│ - Aplicação de todos os fixType                         │
│ - Logs descritivos                                       │
│ - Validação de resultado                                 │
│ - Tratamento de erros                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ SISTEMA COMPLETO ✅                                       │
│ - Workflow end-to-end funcionando                       │
│ - Backlog 100% auto-fixável                             │
│ - Implementation Agent executa tudo                     │
│ - Firestore blindado                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Métricas de Sucesso

### Fase 2 (Backlog Generator)

- ✅ 100% das tarefas no backlog são AutoFixTask válidas
- ✅ 0 tarefas com campos faltando
- ✅ Issues não auto-fixáveis vão para insights/manualActions
- ✅ Testes passando

### Fase 3 (Implementation Agent)

- ✅ 100% dos fixType implementados
- ✅ Taxa de sucesso > 80% na aplicação de fixes
- ✅ Erros são logados com RUNTIME_ERROR descritivo
- ✅ Validação de resultado funciona

---

## 🚀 Próximo Passo Imediato

**Implementar Fase 2: Backlog Generator**

1. Ler `ISSUE_TO_AUTOFIX_MAPPING.md`
2. Implementar `convertIssueToTask()` seguindo a tabela
3. Testar com backlog real
4. Validar que todas as tarefas são AutoFixTask completas

---

## 📝 Notas Finais

### O Que Mudou

**Antes:**
- ❌ Firestore validava dados (tarde demais)
- ❌ Erros genéricos difíceis de debugar
- ❌ Backlog com tarefas não auto-fixáveis
- ❌ Implementation Agent não conseguia executar

**Depois (Fase 1):**
- ✅ Validação na camada de domínio
- ✅ Erros classificados e rastreáveis
- ✅ Fundação arquitetural estabelecida
- ✅ Firestore blindado

**Depois (Fase 2 + 3):**
- ✅ Backlog 100% auto-fixável
- ✅ Implementation Agent executa tudo
- ✅ Sistema fecha o ciclo completo

---

**Status:** ✅ **FUNDAÇÃO COMPLETA - PRONTO PARA FASE 2**

