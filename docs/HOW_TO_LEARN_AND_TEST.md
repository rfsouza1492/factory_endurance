# 📚 Como Aprender e Testar - Maestro Workflow

**Guia Completo para Entender e Validar o Sistema**

---

## 🎯 O QUE VOCÊ PRECISA SABER

### 1. Conceitos Fundamentais

#### O que é o Maestro?
- **Sistema de coordenação** de agentes especializados
- **Automatiza** avaliação e decisão sobre projetos
- **Gera backlog** automaticamente baseado em issues
- **Fornece interface web** para aprovação

#### Como Funciona?
1. Product Manager avalia roadmap e gera backlog
2. Maestro executa 6 agentes em paralelo
3. Agentes avaliam-se mutuamente (avaliação cruzada)
4. Maestro consolida e decide Go/No-go
5. Backlog atualizado é gerado
6. Feedback retorna para Product Manager
7. Usuário aprova via interface web

---

### 2. Estrutura de Dados

#### Resultados dos Agentes
```javascript
{
  success: true,
  results: {
    score: 75,  // 0-100
    issues: {
      critical: [],  // P0
      high: [],      // P1
      medium: [],    // P2
      low: []        // P3
    }
  }
}
```

#### Backlog
```json
{
  "backlogId": "backlog-2025-12-30T10-00-00",
  "tasks": [
    {
      "id": "task-001",
      "title": "...",
      "priority": "P0",
      "effort": "M",
      "status": "todo"
    }
  ],
  "summary": {
    "totalTasks": 10,
    "estimatedEffort": "40 hours"
  }
}
```

#### Decisão Go/No-go
```markdown
## 🎯 Decisão Final
### ⚠️ **DECISÃO: GO WITH CONCERNS**
- Score: 75/100
- Issues P0: 0
- Issues P1: 6
```

---

## 📖 COMO APRENDER

### Fase 1: Visão Geral (30 min)

1. **Leia README.md**
   - Entenda o propósito
   - Veja a estrutura
   - Conheça os comandos básicos

2. **Leia SETUP.md**
   - Configure o ambiente
   - Instale dependências
   - Configure variáveis

3. **Execute quick-test.sh**
   ```bash
   ./quick-test.sh
   ```
   - Veja o sistema em ação
   - Entenda o output

---

### Fase 2: Entender Processos (1-2 horas)

1. **Leia docs/processes/README.md**
   - Veja índice de processos
   - Entenda o fluxo geral

2. **Leia docs/QUICK_REFERENCE_FLOWCHARTS.md**
   - Visualize fluxos principais
   - Entenda integrações

3. **Leia docs/processes/workflow-execution.md**
   - Entenda cada fase
   - Veja checklists

---

### Fase 3: Entender Agentes (2-3 horas)

1. **Para cada agente, leia:**
   - Código fonte (`src/agents/[agent].js`)
   - Documentação do processo
   - Exemplos de output

2. **Execute cada agente isoladamente:**
   ```bash
   node -e "import('./src/agents/architecture-agent.js').then(m => m.runArchitectureReview().then(r => console.log(JSON.stringify(r, null, 2))))"
   ```

3. **Analise os resultados:**
   - Veja formato de output
   - Entenda como scores são calculados
   - Veja como issues são categorizados

---

### Fase 4: Entender Integrações (1-2 horas)

1. **Leia docs/processes/product-manager.md**
   - Entenda como PM gera backlog
   - Veja como aciona Maestro

2. **Leia docs/processes/backlog-generation.md**
   - Entenda conversão de issues
   - Veja priorização

3. **Leia src/scripts/run-workflow.js**
   - Veja como tudo se conecta
   - Entenda o fluxo de execução

---

### Fase 5: Entender Decisão (1 hora)

1. **Leia docs/processes/go-no-go-decision.md**
   - Entenda critérios
   - Veja fórmula de score
   - Entenda matriz de decisão

2. **Leia src/scripts/decision-logic.js**
   - Veja implementação
   - Entenda lógica

---

## 🧪 COMO TESTAR

### Teste 1: Teste Rápido (5 min)

```bash
# Executar script de teste rápido
./quick-test.sh
```

**Valida:**
- Ambiente configurado
- Agentes executam
- Resultados são gerados

---

### Teste 2: Teste de Agente Individual (10 min por agente)

```bash
# Testar Architecture Agent
node -e "
import('./src/agents/architecture-agent.js').then(m => {
  m.runArchitectureReview().then(r => {
    console.log('✅ Success:', r.success);
    console.log('📊 Score:', r.results.score);
    console.log('🚨 P0:', r.results.issues.critical.length);
    console.log('⚠️  P1:', r.results.issues.high.length);
  });
});
"
```

**Repita para cada agente:**
- `code-quality-agent.js`
- `document-analysis-agent.js`
- `security-agent.js`
- `performance-agent.js`
- `dependency-agent.js`
- `product-manager-agent.js`

---

### Teste 3: Teste do Workflow Completo (15 min)

```bash
# Limpar dados anteriores
rm -rf src/shared/results/* src/shared/evaluations/* src/shared/decisions/*

# Executar workflow completo
node src/scripts/run-workflow.js --verbose

# Verificar resultados
echo "=== Agentes Executados ==="
ls -1 src/shared/results/*/ | wc -l

echo "=== Avaliações Criadas ==="
ls -1 src/shared/evaluations/ | wc -l

echo "=== Decisão Gerada ==="
test -f src/shared/decisions/go-no-go-report.md && echo "✅ Sim" || echo "❌ Não"

echo "=== Backlog Gerado ==="
test -f src/shared/backlog/current-backlog.json && echo "✅ Sim" || echo "❌ Não"
```

**Valida:**
- Todos os agentes executam
- Avaliações cruzadas são criadas
- Decisão é gerada
- Backlog é gerado

---

### Teste 4: Teste de Integração PM → Maestro (20 min)

```bash
# 1. Executar Product Manager
node -e "
import('./src/agents/product-manager-agent.js').then(m => {
  m.runProductManagerAnalysis().then(r => {
    console.log('Backlog ID:', r.backlogId);
    console.log('Tarefas:', r.tasksCreated);
  });
});
"

# 2. Verificar evento
cat src/shared/events/backlog-ready.json

# 3. Executar Maestro (deve detectar backlog)
node src/scripts/run-workflow.js --verbose

# 4. Verificar feedback
cat src/shared/events/workflow-feedback.json
```

**Valida:**
- PM cria backlog
- Maestro detecta backlog
- Maestro usa backlog
- Feedback é retornado

---

### Teste 5: Teste da Interface Web (10 min)

```bash
# Terminal 1: Iniciar servidor
npm run maestro:web

# Terminal 2: Testar endpoints
curl http://localhost:3000/api/status
curl -X POST http://localhost:3000/api/workflow/run
curl http://localhost:3000/api/approvals/pending
```

**Valida:**
- Servidor inicia
- Endpoints respondem
- Workflow executa via API
- Dados são retornados

---

### Teste 6: Teste Automatizado (5 min)

```bash
# Executar suite de testes
node tests/test-workflow.js
```

**Valida:**
- Todos os agentes funcionam
- Lógica de decisão funciona
- Backlog generator funciona
- Estrutura de arquivos existe

---

## ✅ Checklist de Validação Completa

### Ambiente
- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Estrutura de pastas criada
- [ ] WORKSPACE_ROOT configurado (se necessário)

### Agentes
- [ ] Product Manager executa
- [ ] Architecture executa
- [ ] Code Quality executa
- [ ] Document Analysis executa
- [ ] Security executa
- [ ] Performance executa
- [ ] Dependency executa

### Workflow
- [ ] Fase 1: Execução completa
- [ ] Fase 2: Avaliação completa
- [ ] Fase 3: Decisão gerada
- [ ] Fase 4: Aprovação disponível

### Integrações
- [ ] PM → Maestro funciona
- [ ] Maestro → PM (feedback) funciona
- [ ] Backlog Generator funciona
- [ ] Interface Web funciona

### Qualidade
- [ ] Scores são válidos (0-100)
- [ ] Issues têm prioridade
- [ ] Decisão é justificada
- [ ] Backlog tem estrutura válida
- [ ] JSONs são válidos

---

## 🔍 Como Diagnosticar Problemas

### Problema: Agente não executa

**Diagnóstico:**
```bash
# Verificar imports
node -e "import('./src/agents/[agent].js').catch(e => console.error(e))"

# Verificar caminhos
echo $WORKSPACE_ROOT
ls -la $WORKSPACE_ROOT/Agents/life-goals-app/
```

**Soluções Comuns:**
- Verificar WORKSPACE_ROOT
- Verificar se projeto existe
- Verificar permissões de arquivo

---

### Problema: Score sempre 0

**Diagnóstico:**
```bash
# Executar com verbose
node src/scripts/run-workflow.js --verbose

# Verificar output do agente
node -e "import('./src/agents/[agent].js').then(m => m.run[Agent]().then(r => console.log(JSON.stringify(r, null, 2))))"
```

**Soluções Comuns:**
- Verificar se projeto está no caminho correto
- Verificar se arquivos existem
- Verificar parsing de output

---

### Problema: Backlog não detectado

**Diagnóstico:**
```bash
# Verificar evento
cat src/shared/events/backlog-ready.json

# Verificar backlog
cat src/shared/backlog/current-backlog.json

# Verificar código de detecção
grep -A 10 "checkForBacklog" src/scripts/run-workflow.js
```

**Soluções Comuns:**
- Verificar se evento existe
- Verificar formato JSON
- Verificar permissões

---

## 📊 Métricas de Sucesso

### Teste Bem-Sucedido

- ✅ Todos os 7 agentes executam sem erros
- ✅ 6 avaliações cruzadas são criadas
- ✅ Decisão Go/No-go é gerada
- ✅ Backlog é gerado
- ✅ Interface web funciona
- ✅ Integração PM ↔ Maestro funciona

### Qualidade dos Resultados

- ✅ Scores entre 0-100
- ✅ Issues categorizados corretamente
- ✅ Decisão justificada
- ✅ Backlog estruturado corretamente
- ✅ JSONs válidos

---

## 🚀 Próximos Passos Após Testes

1. **Se todos os testes passam:**
   - Sistema está funcional
   - Pode ser usado em produção
   - Documentação está atualizada

2. **Se alguns testes falham:**
   - Verificar logs de erro
   - Consultar troubleshooting
   - Verificar configuração

3. **Para melhorias:**
   - Implementar testes automatizados
   - Adicionar mais cenários
   - Melhorar cobertura

---

**Última Atualização:** 2025-12-30  
**Versão:** 2.0

