# 🏗️ Fundação: Blindagem do Firestore

**Data:** 31 de Dezembro de 2025  
**Status:** ✅ **CONGELADO COMO FUNDAÇÃO**

---

## 🎯 Princípio Fundamental

> **Nenhum objeto chega no Firestore sem passar por validação de contrato + validação Firestore-safe + fail-fast.**

Esta é uma **fundação arquitetural** do sistema. Não deve ser alterada sem revisão arquitetural completa.

---

## 📐 Invariantes Estabelecidos

### 1. Validação de Contrato
- ✅ Todo objeto salvo no Firestore tem um contrato explícito
- ✅ Contratos definidos em `src/schemas/`
- ✅ Validação executada antes de qualquer `setDoc()`

### 2. Validação Firestore-Safe
- ✅ Detecta campos `undefined` recursivamente
- ✅ Rejeita objetos não serializáveis pelo Firestore
- ✅ Integrada em todos os validadores de contrato

### 3. Fail-Fast
- ✅ Validação executada **antes** de salvar
- ✅ Se inválido → erro imediato, nada é salvo
- ✅ Mensagens de erro claras indicando exatamente o problema

---

## 🔒 Pontos Protegidos

### Backlog
- ✅ `backlog/current` - Validado antes de `setDoc()`
- ✅ Funções: `saveBacklog()`, `saveBacklogToFirestore()`

### Eventos
- ✅ `events/workflow-feedback` - Validado antes de `setDoc()`
- ✅ Funções: `saveEvent()`, `saveEventToFirestore()`

### Outros Documentos
- ✅ `results/`, `decisions/`, `evaluations/` - Sanitizados com `removeUndefined()`

---

## 📋 Regras de Modificação

### ⚠️ NÃO Modificar Sem Revisão

1. **Remover validação de contrato**
   - ❌ Não permitido
   - ✅ Se necessário, adicionar novo contrato, não remover existente

2. **Remover validação Firestore-safe**
   - ❌ Não permitido
   - ✅ Firestore não aceita `undefined`, isso é invariante

3. **Remover fail-fast**
   - ❌ Não permitido
   - ✅ Fail-fast é a garantia de que dados inválidos não são salvos

### ✅ Modificações Permitidas

1. **Adicionar novos contratos**
   - ✅ Criar novos schemas em `src/schemas/`
   - ✅ Seguir o padrão estabelecido

2. **Melhorar mensagens de erro**
   - ✅ Adicionar mais contexto
   - ✅ Melhorar classificação de erros

3. **Adicionar novos pontos de salvamento**
   - ✅ Seguir o padrão: validação → fail-fast → sanitização → `setDoc()`

---

## 🧪 Testes de Regressão

Antes de qualquer modificação nesta fundação, executar:

```bash
npm run test:firestore-blindage
```

**Testes obrigatórios:**
1. ✅ Backlog válido → salva sem erro
2. ✅ Backlog inválido (undefined) → falha com CONTRACT_ERROR
3. ✅ Evento válido → salva sem erro
4. ✅ Evento inválido (undefined) → falha com CONTRACT_ERROR

---

## 📊 Matriz de Erros

### CONTRACT_ERROR
- **Causa:** Objeto viola contrato (campos faltando, tipos inválidos, undefined)
- **Ação:** Corrigir objeto na fonte (Backlog Generator, etc.)
- **Exemplo:** `CONTRACT_ERROR [AutoFixTask] [task-001] Campo obrigatório: targetPath`

### INFRA_ERROR
- **Causa:** Erro de infraestrutura (Firestore, rede, permissões)
- **Ação:** Verificar credenciais, conectividade, permissões
- **Exemplo:** `INFRA_ERROR [Firestore] PERMISSION_DENIED`

### RUNTIME_ERROR
- **Causa:** Erro durante execução (aplicação de fix, processamento)
- **Ação:** Verificar lógica de execução
- **Exemplo:** `RUNTIME_ERROR [ImplementationAgent] Arquivo não encontrado`

### VALIDATION_ERROR
- **Causa:** Erro na validação em si (bug no validador)
- **Ação:** Corrigir validador
- **Exemplo:** `VALIDATION_ERROR [AutoFixTask] Erro ao validar campo`

---

## 🎯 Garantias

Com esta fundação em vigor:

1. ✅ **Firestore nunca recebe `undefined`**
   - Validação detecta antes de salvar
   - Sanitização remove qualquer residual

2. ✅ **Erros são classificados e rastreáveis**
   - Prefixos claros (CONTRACT_ERROR, INFRA_ERROR, etc.)
   - Contexto completo em cada erro

3. ✅ **Dados inválidos não são persistidos**
   - Fail-fast garante que nada é salvo se inválido
   - Mensagens claras indicam exatamente o problema

---

## 📝 Histórico

- **2025-12-31:** Fundação estabelecida
- **2025-12-31:** Blindagem completa implementada
- **2025-12-31:** Matriz de erros implementada
- **2025-12-31:** Testes de regressão criados

---

**Status:** ✅ **FUNDAÇÃO CONGELADA - NÃO MODIFICAR SEM REVISÃO ARQUITETURAL**

