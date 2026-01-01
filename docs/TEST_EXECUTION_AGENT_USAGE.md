# 🧪 Test Execution Agent - Guia de Uso

**Como executar testes antes de produção**

---

## 🚀 Execução Rápida

### Via npm script
```bash
npm run test:pre-production
```

### Opções Disponíveis
```bash
# Pular validação de estrutura
npm run test:pre-production -- --skip-validation

# Executar apenas tipos específicos
npm run test:pre-production -- --test-types=unit,integration

# Não bloquear produção mesmo com falhas
npm run test:pre-production -- --no-block
```

---

## 📊 O Que Faz

1. ✅ **Carrega metodologia** de `docs/testing-methodology/`
2. ✅ **Valida estrutura** de testes
3. ✅ **Executa testes** (unit/integration/e2e)
4. ✅ **Gera relatório** markdown
5. ✅ **Bloqueia produção** se testes falharem (padrão)

---

## 📁 Resultados

### Localização
- **JSON:** `src/shared/results/test-execution/test-execution-{timestamp}.json`
- **Relatório:** `src/shared/results/test-execution/test-execution-{timestamp}-report.md`
- **Firestore:** Coleção `agent-results` com `agent: 'TestExecutionAgent'`

---

## ✅ Status de Execução

### Exemplo de Saída
```
🧪 Test Execution Agent
============================================================
📋 Executando testes antes de produção...

📚 Carregando metodologia de testes...
  ✅ Metodologia carregada

🔍 Validando estrutura de testes...
  ✅ Estrutura válida

🧪 Executando testes...
  📋 Executando testes unit...
  ✅ Testes unit passaram

  📋 Executando testes integration...
  ✅ Testes integration passaram

  📋 Executando testes e2e...
  ✅ Testes e2e passaram

📊 Gerando relatório...
  ✅ Relatório gerado

============================================================
📊 Resumo da Execução de Testes
============================================================
Total de tipos de teste: 3
✅ Passaram: 3
❌ Falharam: 0

✅ PRONTO PARA PRODUÇÃO
```

---

## 🚫 Bloqueio de Produção

### Quando Bloqueia
- ✅ `blockProduction: true` (padrão)
- ✅ E `summary.failed > 0`

### Comportamento
- Exit code: `1` (falha)
- Mensagem clara de bloqueio
- Recomendações para correção

---

## 📚 Documentação Relacionada

- [`TEST_EXECUTION_AGENT.md`](./TEST_EXECUTION_AGENT.md) - Documentação completa
- [`testing-methodology/README.md`](./testing-methodology/README.md) - Metodologia

---

**Última atualização:** 31 de Dezembro de 2025

