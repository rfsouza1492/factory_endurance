# 🧪 Test Execution Agent

**Agent responsável por executar testes antes de produção**

---

## 📋 Visão Geral

O **Test Execution Agent** é responsável por:

1. ✅ Validar estrutura de testes
2. ✅ Executar suíte completa de testes (unit/integration/e2e)
3. ✅ Gerar relatório de testes
4. ✅ Bloquear produção se testes falharem

---

## 🔄 Integração no Workflow

### Posição no Workflow

```
Fase 1: Execução (Agentes de Análise)
  ↓
Fase 2: Avaliação Cruzada
  ↓
Fase 3: Decisão Go/No-go
  ↓
Fase 4: Testes Antes de Produção ← Test Execution Agent
  ↓
Fase 5: Implementação Automática
  ↓
Fase 6: Aprovação
```

### Quando Executa

- **Automático:** Durante workflow completo (`--phase=all`)
- **Manual:** `--phase=testing`
- **Antes de:** Implementação e Produção

---

## 📚 Uso da Documentação

O Agent carrega automaticamente a documentação de `docs/testing-methodology/`:

- `TEST_CONSTRUCTION_METHODOLOGY.md` - Metodologia completa
- `TEST_QUICK_REFERENCE.md` - Guia rápido
- `FRAMEWORK_GUIDE.md` - Guia do framework

**Uso:**
- Validar estrutura de testes
- Entender padrões esperados
- Gerar relatórios formatados

---

## 🚀 Execução

### Via Workflow
```bash
npm run maestro
# Executa todas as fases, incluindo testes
```

### Apenas Testes
```bash
npm run maestro -- --phase=testing
```

### Opções
```bash
# Pular validação de estrutura
npm run maestro -- --phase=testing --skip-test-validation

# Executar apenas tipos específicos
npm run maestro -- --phase=testing --test-types=unit,integration

# Não bloquear produção mesmo com falhas
npm run maestro -- --phase=testing --no-block-on-test-failure
```

---

## 📊 Resultados

### Estrutura de Resultados

```json
{
  "id": "test-execution-2025-12-31T17-00-00",
  "timestamp": "2025-12-31T17:00:00.000Z",
  "methodology": {
    "loaded": true,
    "available": true
  },
  "structure": {
    "validated": true,
    "valid": true
  },
  "tests": {
    "unit": { "success": true, "output": "..." },
    "integration": { "success": true, "output": "..." },
    "e2e": { "success": true, "output": "..." }
  },
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "blocked": false
  }
}
```

### Localização

- **JSON:** `src/shared/results/test-execution/test-execution-{timestamp}.json`
- **Relatório:** `src/shared/results/test-execution/test-execution-{timestamp}-report.md`
- **Firestore:** Coleção `agent-results` com `agent: 'TestExecutionAgent'`

---

## 🚫 Bloqueio de Produção

### Quando Bloqueia

- ✅ `blockProduction: true` (padrão)
- ✅ E `summary.failed > 0`

### Comportamento

1. **Bloqueia:** Workflow para com erro
2. **Loga:** Mensagem clara de bloqueio
3. **Recomenda:** Corrigir testes antes de continuar

### Exemplo

```
🚫 PRODUÇÃO BLOQUEADA: Testes falharam
   Corrija os testes antes de prosseguir
```

---

## 📋 Recomendações Geradas

O Agent gera recomendações baseadas nos resultados:

- ✅ **Todos passaram:** "Pronto para produção"
- ❌ **Falharam:** "Corrigir testes antes de prosseguir"
- ⚠️ **Estrutura inválida:** "Corrigir estrutura de testes"

---

## 🔧 Configuração

### Opções do Agent

```javascript
{
  skipValidation: false,        // Pular validação de estrutura
  testTypes: ['unit', 'integration', 'e2e'],  // Tipos a executar
  blockProduction: true         // Bloquear se falhar
}
```

### Variáveis de Ambiente

Nenhuma variável específica necessária. O Agent usa:
- Framework em `tests/framework/`
- Documentação em `docs/testing-methodology/`
- Scripts npm em `package.json`

---

## 📚 Documentação Relacionada

- [`docs/testing-methodology/README.md`](./testing-methodology/README.md) - Documentação completa
- [`tests/framework/README.md`](../tests/framework/README.md) - Framework de testes
- [`src/agents/test-execution-agent.js`](../src/agents/test-execution-agent.js) - Código do Agent

---

**Última atualização:** 31 de Dezembro de 2025

