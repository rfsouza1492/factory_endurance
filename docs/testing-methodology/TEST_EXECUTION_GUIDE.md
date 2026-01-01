# 🚀 Guia de Execução de Testes

**Data:** 31 de Dezembro de 2025  
**Status:** ✅ **PRONTO PARA EXECUÇÃO**

---

## 📋 Ordem Recomendada de Execução

### 1. Testes Unitários (Rápidos)

```bash
# Teste de geradores
npm run test:autofix-generators

# Teste de Implementation Agent (simulado)
npm run test:implementation-agent

# Teste de blindagem do Firestore
npm run test:firestore-blindage
```

**Tempo estimado:** 2-3 minutos  
**Resultado esperado:** Todos os testes passam ✅

---

### 2. Teste de Integração - Backlog Generator

**Objetivo:** Validar que issues são convertidos em AutoFixTask completas

**Passos:**
1. Criar arquivo de teste com issues variados:
   ```javascript
   const testIssues = [
     { type: 'Security', message: 'firestore.rules não encontrado', location: 'test/firestore.rules', severity: 'critical' },
     { type: 'Dependency', message: 'package express não encontrado', location: 'package.json', severity: 'high' },
     { type: 'Architecture', message: 'Arquitetura precisa ser refatorada', severity: 'high' }
   ];
   ```

2. Executar `generateBacklogFromIssues(testIssues)`

3. Validar:
   - ✅ Backlog só contém AutoFixTask válidas
   - ✅ Issues não auto-fixáveis são filtrados
   - ✅ Todas as tarefas passam em `validateAutoFixTask()`

**Tempo estimado:** 5 minutos

---

### 3. Teste de Integração - Implementation Agent

**Objetivo:** Validar que todos os fixType funcionam

**Passos:**
1. Criar AutoFixTask de teste para cada fixType
2. Executar `implementTask()` para cada uma
3. Validar resultado

**Tempo estimado:** 10 minutos

---

### 4. Teste End-to-End - Workflow Completo

**Objetivo:** Validar workflow completo

**Pré-requisitos:**
- Firebase emulators rodando OU credenciais de produção configuradas
- Projeto de teste configurado

**Passos:**
```bash
# Iniciar emulators (se usar)
npm run firebase:dev

# Executar workflow
npm run maestro

# Verificar logs
tail -f logs/maestro.log

# Verificar Firestore
# Acessar http://localhost:4000 (emulators) ou Firebase Console
```

**Validações:**
- ✅ Workflow completa sem erros críticos
- ✅ Backlog gerado é válido
- ✅ Tarefas são executadas
- ✅ Dados são salvos no Firestore
- ✅ Nenhum `undefined` chega no Firestore
- ✅ Logs são claros e classificados

**Tempo estimado:** 15-20 minutos

---

## 📊 Checklist de Validação

### Fase 1 - Blindagem do Firestore
- [ ] Validação de AutoFixTask funciona
- [ ] Validação de WorkflowFeedbackEvent funciona
- [ ] Detecção de `undefined` funciona
- [ ] Fail-fast funciona antes de salvar

### Fase 2 - Backlog Generator
- [ ] Issues válidos geram AutoFixTask completas
- [ ] Issues inválidos retornam `null`
- [ ] Backlog só contém AutoFixTask válidas
- [ ] Templates são gerados corretamente

### Fase 3 - Implementation Agent
- [ ] `applyCreate()` funciona
- [ ] `applyCommand()` funciona
- [ ] `applyConfig()` funciona
- [ ] `applyPatch()` funciona
- [ ] `applyRewrite()` funciona
- [ ] `applyDelete()` funciona
- [ ] Erros são logados com RUNTIME_ERROR

### End-to-End
- [ ] Workflow completa sem erros críticos
- [ ] Dados são salvos no Firestore
- [ ] Logs são claros e classificados

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
# Verificar se está no diretório correto
cd maestro-workflow

# Instalar dependências
npm install
```

### Erro: "Firebase emulator not running"
```bash
# Iniciar emulators
npm run firebase:dev

# Ou configurar credenciais de produção
export FIREBASE_API_KEY=...
```

### Erro: "Permission denied"
```bash
# Verificar permissões de arquivo
chmod +x tests/*.js
```

---

## 📝 Relatório de Testes

Após executar os testes, documentar:

1. **Resultados dos Testes Unitários**
   - Quantos passaram
   - Quantos falharam
   - Erros encontrados

2. **Resultados dos Testes de Integração**
   - Backlog Generator funcionou?
   - Implementation Agent funcionou?

3. **Resultados dos Testes End-to-End**
   - Workflow completou?
   - Dados foram salvos?
   - Erros encontrados?

4. **Problemas Encontrados**
   - Lista de bugs
   - Prioridade de correção

---

**Status:** ✅ **PLANO COMPLETO - PRONTO PARA EXECUÇÃO**

