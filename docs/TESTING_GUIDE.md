# 🧪 Guia Completo de Testes - Maestro Workflow

**Data:** 2025-12-30  
**Versão:** 2.0  
**Status:** 📋 Guia de Testes

---

## 🎯 Objetivo

Este documento descreve tudo que você precisa saber para testar a aplicação Maestro Workflow completa, como aprender sobre ela, e como executar testes para garantir que tudo está funcional.

---

## 📚 O QUE VOCÊ PRECISA SABER

### 1. Estrutura do Sistema

#### Componentes Principais

```
maestro-workflow/
├── src/
│   ├── agents/          # 7 agentes especializados
│   ├── scripts/         # Scripts de execução
│   ├── shared/          # Dados compartilhados
│   └── web/             # Interface web
├── docs/                # Documentação completa
└── tests/               # Testes (a criar)
```

#### Agentes Implementados

1. **Product Manager Agent** - Trigger inicial, gera backlog
2. **Architecture Review Agent** - Analisa estrutura e padrões
3. **Code Quality Review Agent** - Avalia qualidade de código
4. **Document Analysis Agent** - Analisa documentação
5. **Security Audit Agent** - Auditoria de segurança
6. **Performance Analysis Agent** - Análise de performance
7. **Dependency Management Agent** - Gerencia dependências

#### Fluxo do Sistema

```
Product Manager → Maestro → Agentes → Avaliação → Decisão → Backlog → Feedback
```

---

### 2. Pré-requisitos para Teste

#### Ambiente

- [ ] Node.js 18+ instalado
- [ ] npm ou yarn instalado
- [ ] Projeto alvo disponível (para análise)
- [ ] Roadmap disponível (para Product Manager)
- [ ] Porta 3000 disponível (para interface web)

#### Configuração

- [ ] Variável `WORKSPACE_ROOT` configurada (opcional)
- [ ] Estrutura de pastas `src/shared/` criada
- [ ] Dependências instaladas (`npm install`)

#### Conhecimento Necessário

- [ ] Entender estrutura de arquivos do projeto
- [ ] Saber onde está o projeto a ser analisado
- [ ] Conhecer formato do roadmap (se aplicável)
- [ ] Entender formato de saída dos agentes

---

## 🔍 COMO APRENDER SOBRE A APLICAÇÃO

### 1. Documentação Essencial

#### Leia Primeiro (Ordem Recomendada)

1. **README.md** - Visão geral do sistema
2. **SETUP.md** - Guia de instalação
3. **docs/processes/README.md** - Índice de processos
4. **docs/QUICK_REFERENCE_FLOWCHARTS.md** - Fluxos rápidos

#### Documentação Detalhada

5. **docs/processes/workflow-execution.md** - Processo completo
6. **docs/processes/product-manager.md** - Product Manager
7. **docs/processes/go-no-go-decision.md** - Decisão Go/No-go
8. **docs/processes/backlog-generation.md** - Geração de backlog
9. **docs/PROCESS_FLOWCHARTS.md** - Flowcharts detalhados

#### Documentação Técnica

10. **docs/IMPLEMENTATION_STATUS.md** - Status da implementação
11. **docs/PROCESS_REVIEW.md** - Revisão de processos
12. **docs/DASHBOARD_SPECIFICATION.md** - Especificação do dashboard

---

### 2. Explorar o Código

#### Arquivos Principais para Entender

```bash
# Script principal
src/scripts/run-workflow.js

# Agentes
src/agents/product-manager-agent.js
src/agents/architecture-agent.js
src/agents/code-quality-agent.js
src/agents/document-analysis-agent.js
src/agents/security-agent.js
src/agents/performance-agent.js
src/agents/dependency-agent.js

# Lógica de decisão
src/scripts/decision-logic.js
src/scripts/evaluation-logic.js
src/scripts/backlog-generator.js

# Interface web
src/web/server.js
src/web/index.html
```

#### Comandos para Explorar

```bash
# Ver estrutura completa
tree src/ -L 3

# Ver imports de um arquivo
grep -r "import" src/scripts/run-workflow.js

# Ver funções exportadas
grep -r "export" src/agents/

# Ver dependências
cat package.json | grep -A 20 "dependencies"
```

---

### 3. Executar e Observar

#### Modo Verboso

```bash
# Executar com verbose para ver detalhes
node src/scripts/run-workflow.js --verbose

# Executar fase específica
node src/scripts/run-workflow.js --phase=execution --verbose
```

#### Verificar Outputs

```bash
# Ver resultados dos agentes
ls -la src/shared/results/*/

# Ver avaliações cruzadas
ls -la src/shared/evaluations/

# Ver decisões
cat src/shared/decisions/go-no-go-report.md

# Ver backlog
cat src/shared/backlog/current-backlog.json
```

---

## 🧪 COMO EXECUTAR TESTES

### 1. Testes Manuais por Componente

#### Teste 1: Product Manager Agent

```bash
# Executar Product Manager isoladamente
node -e "
import('./src/agents/product-manager-agent.js').then(m => {
  m.runProductManagerAnalysis().then(r => {
    console.log(JSON.stringify(r, null, 2));
  });
});
"
```

**Validações:**
- [ ] Roadmap lido corretamente
- [ ] Código analisado
- [ ] Gaps identificados
- [ ] Backlog gerado
- [ ] Evento `backlog-ready.json` criado

**Arquivos a Verificar:**
- `src/shared/backlog/current-backlog.json`
- `src/shared/events/backlog-ready.json`
- `src/shared/results/product-manager/*.md`

---

#### Teste 2: Architecture Review Agent

```bash
# Executar Architecture Agent isoladamente
node -e "
import('./src/agents/architecture-agent.js').then(m => {
  m.runArchitectureReview().then(r => {
    console.log('Score:', r.results.score);
    console.log('Issues P0:', r.results.issues.critical.length);
    console.log('Issues P1:', r.results.issues.high.length);
  });
});
"
```

**Validações:**
- [ ] Estrutura do projeto analisada
- [ ] Dependências identificadas
- [ ] Padrões arquiteturais verificados
- [ ] Issues categorizados corretamente
- [ ] Score calculado (0-100)
- [ ] Relatório gerado

**Arquivos a Verificar:**
- `src/shared/results/architecture-review/[timestamp]-review.md`

---

#### Teste 3: Code Quality Review Agent

```bash
# Executar Code Quality Agent isoladamente
node -e "
import('./src/agents/code-quality-agent.js').then(m => {
  m.runCodeQualityEvaluation().then(r => {
    console.log('Score:', r.results.score);
    console.log('Total Files:', r.results.totalFiles);
    console.log('Issues:', r.results.issues);
  });
});
"
```

**Validações:**
- [ ] Script `evaluate-code-quality.js` executado
- [ ] Output parseado corretamente
- [ ] Score extraído
- [ ] Issues categorizados
- [ ] Relatório gerado

**Arquivos a Verificar:**
- `src/shared/results/code-quality-review/[timestamp]-evaluation.md`

---

#### Teste 4: Security Audit Agent

```bash
# Executar Security Agent isoladamente
node -e "
import('./src/agents/security-agent.js').then(m => {
  m.runSecurityAudit().then(r => {
    console.log('Score:', r.results.score);
    console.log('Vulnerabilidades Críticas:', r.results.issues.critical.length);
    console.log('Vulnerabilidades Alta:', r.results.issues.high.length);
  });
});
"
```

**Validações:**
- [ ] Análise OWASP Top 10 executada
- [ ] Secrets hardcoded identificados
- [ ] Configurações verificadas
- [ ] Vulnerabilidades de dependências encontradas
- [ ] Regras de segurança verificadas
- [ ] Relatório gerado

**Arquivos a Verificar:**
- `src/shared/results/security-audit/[timestamp]-audit.md`

---

#### Teste 5: Performance Analysis Agent

```bash
# Executar Performance Agent isoladamente
node -e "
import('./src/agents/performance-agent.js').then(m => {
  m.runPerformanceAnalysis().then(r => {
    console.log('Score:', r.results.score);
    console.log('Bottlenecks:', r.results.issues.high.length);
  });
});
"
```

**Validações:**
- [ ] Profiling de código executado
- [ ] Queries analisadas (problema N+1)
- [ ] Bundle size analisado
- [ ] Renderização analisada
- [ ] Otimizações sugeridas
- [ ] Relatório gerado

**Arquivos a Verificar:**
- `src/shared/results/performance-analysis/[timestamp]-analysis.md`

---

#### Teste 6: Dependency Management Agent

```bash
# Executar Dependency Agent isoladamente
node -e "
import('./src/agents/dependency-agent.js').then(m => {
  m.runDependencyAnalysis().then(r => {
    console.log('Score:', r.results.score);
    console.log('Vulnerabilidades:', r.results.vulnerabilities);
    console.log('Desatualizadas:', r.results.outdated);
  });
});
"
```

**Validações:**
- [ ] package.json analisado
- [ ] npm audit executado (se disponível)
- [ ] Dependências não utilizadas identificadas
- [ ] Dependências desatualizadas identificadas
- [ ] Recomendações geradas
- [ ] Relatório gerado

**Arquivos a Verificar:**
- `src/shared/results/dependency-management/[timestamp]-analysis.md`

---

### 2. Teste do Workflow Completo

#### Teste End-to-End

```bash
# 1. Limpar dados anteriores (opcional)
rm -rf src/shared/results/* src/shared/evaluations/* src/shared/decisions/*

# 2. Executar workflow completo
node src/scripts/run-workflow.js --verbose

# 3. Verificar resultados
echo "=== Resultados ==="
ls -la src/shared/results/*/

echo "=== Avaliações ==="
ls -la src/shared/evaluations/

echo "=== Decisão ==="
cat src/shared/decisions/go-no-go-report.md | head -50

echo "=== Backlog ==="
cat src/shared/backlog/current-backlog.json | jq '.summary' 2>/dev/null || cat src/shared/backlog/current-backlog.json
```

**Validações:**
- [ ] Todos os 6 agentes executaram
- [ ] Resultados salvos em `results/`
- [ ] 6 avaliações cruzadas criadas
- [ ] Decisão Go/No-go gerada
- [ ] Backlog atualizado gerado
- [ ] Feedback criado (se havia backlog do PM)

---

### 3. Teste da Interface Web

#### Iniciar Servidor

```bash
# Terminal 1: Iniciar servidor
node src/web/server.js

# Ou usando npm
npm run maestro:web
```

#### Testar Endpoints

```bash
# Terminal 2: Testar endpoints

# Status
curl http://localhost:3000/api/status

# Executar workflow
curl -X POST http://localhost:3000/api/workflow/run

# Aprovações pendentes
curl http://localhost:3000/api/approvals/pending

# Backlog
curl http://localhost:3000/api/approvals/backlog

# Logs
curl http://localhost:3000/api/logs
```

#### Testar Interface

1. Abrir navegador: `http://localhost:3000`
2. Clicar em "Executar Workflow"
3. Aguardar conclusão
4. Verificar seções:
   - [ ] Status geral exibido
   - [ ] Agentes exibidos com status
   - [ ] Backlog exibido
   - [ ] Aprovações pendentes exibidas
   - [ ] Flowcharts renderizados
   - [ ] Logs exibidos

---

### 4. Teste de Integração Product Manager → Maestro

#### Cenário Completo

```bash
# 1. Executar Product Manager
node -e "
import('./src/agents/product-manager-agent.js').then(m => {
  m.runProductManagerAnalysis().then(r => {
    console.log('Backlog ID:', r.backlogId);
    console.log('Tarefas criadas:', r.tasksCreated);
  });
});
"

# 2. Verificar evento criado
cat src/shared/events/backlog-ready.json

# 3. Executar Maestro (deve detectar backlog)
node src/scripts/run-workflow.js --verbose

# 4. Verificar feedback retornado
cat src/shared/events/workflow-feedback.json
```

**Validações:**
- [ ] Product Manager cria backlog
- [ ] Evento `backlog-ready.json` criado
- [ ] Maestro detecta backlog
- [ ] Maestro carrega backlog
- [ ] Workflow executa com backlog
- [ ] Backlog atualizado gerado
- [ ] Feedback retornado para PM
- [ ] Evento `backlog-ready.json` removido

---

## ✅ Checklist de Funcionalidades

### Funcionalidades Core

#### Product Manager Agent
- [ ] Lê roadmap corretamente
- [ ] Analisa código atual
- [ ] Identifica gaps
- [ ] Gera backlog estruturado
- [ ] Cria evento para Maestro
- [ ] Gera relatório de status

#### Maestro Workflow
- [ ] Detecta backlog do Product Manager
- [ ] Executa todos os 6 agentes em paralelo
- [ ] Salva resultados corretamente
- [ ] Executa avaliações cruzadas
- [ ] Consolida preocupações
- [ ] Identifica conflitos
- [ ] Calcula scores corretamente
- [ ] Toma decisão Go/No-go
- [ ] Gera relatório completo
- [ ] Gera backlog atualizado
- [ ] Retorna feedback para PM

#### Backlog Generator
- [ ] Converte issues em tarefas
- [ ] Prioriza tarefas corretamente
- [ ] Estima esforço
- [ ] Identifica dependências
- [ ] Agrupa tarefas
- [ ] Calcula summary
- [ ] Mescla com backlog original
- [ ] Salva backlog corretamente

#### Interface Web
- [ ] Servidor inicia corretamente
- [ ] Endpoints respondem
- [ ] Workflow executa via API
- [ ] Status atualiza em tempo real
- [ ] Aprovações exibidas
- [ ] Backlog exibido
- [ ] Flowcharts renderizados
- [ ] Logs exibidos

---

### Validações de Qualidade

#### Estrutura de Dados
- [ ] Resultados têm formato correto
- [ ] Issues têm prioridade (P0/P1/P2/P3)
- [ ] Scores são números (0-100)
- [ ] Backlog tem estrutura JSON válida
- [ ] Eventos têm formato correto

#### Integrações
- [ ] Agentes retornam resultados válidos
- [ ] Evaluation logic funciona
- [ ] Decision logic funciona
- [ ] Backlog generator funciona
- [ ] API retorna JSON válido

#### Tratamento de Erros
- [ ] Erros são capturados
- [ ] Mensagens de erro são claras
- [ ] Sistema continua funcionando após erro
- [ ] Logs registram erros

---

## 🧪 Cenários de Teste

### Cenário 1: Workflow Completo sem Backlog

**Objetivo:** Testar workflow padrão sem Product Manager

**Passos:**
1. Garantir que não há `backlog-ready.json`
2. Executar: `node src/scripts/run-workflow.js`
3. Verificar que workflow executa normalmente
4. Verificar que todos os agentes executam
5. Verificar que decisão é gerada

**Resultado Esperado:**
- Workflow executa sem erros
- Todos os 6 agentes completam
- Decisão Go/No-go gerada
- Backlog de melhorias gerado

---

### Cenário 2: Workflow com Backlog do Product Manager

**Objetivo:** Testar integração Product Manager → Maestro

**Passos:**
1. Executar Product Manager
2. Verificar `backlog-ready.json` criado
3. Executar Maestro
4. Verificar que backlog é carregado
5. Verificar que feedback é retornado

**Resultado Esperado:**
- Product Manager cria backlog
- Maestro detecta e carrega backlog
- Workflow executa com backlog
- Feedback retornado para PM

---

### Cenário 3: Decisão NO-GO

**Objetivo:** Testar quando há issues críticos

**Setup:**
- Projeto com vulnerabilidades críticas
- Issues P0 de segurança

**Passos:**
1. Executar workflow
2. Verificar que Security Agent identifica P0
3. Verificar que decisão é NO-GO
4. Verificar que backlog tem tarefas P0

**Resultado Esperado:**
- Decisão: NO-GO
- Justificativa menciona segurança
- Backlog tem tarefas P0
- Plano de ação gerado

---

### Cenário 4: Decisão GO WITH CONCERNS

**Objetivo:** Testar quando há issues P1 mas não P0

**Setup:**
- Projeto com issues P1
- Sem issues P0

**Passos:**
1. Executar workflow
2. Verificar que não há P0
3. Verificar que há P1
4. Verificar decisão

**Resultado Esperado:**
- Decisão: GO WITH CONCERNS
- Justificativa menciona issues P1
- Backlog tem tarefas P1
- Recomendações geradas

---

### Cenário 5: Decisão GO

**Objetivo:** Testar quando não há blockers

**Setup:**
- Projeto limpo
- Sem issues críticos ou alta

**Passos:**
1. Executar workflow
2. Verificar scores altos
3. Verificar que não há P0/P1
4. Verificar decisão

**Resultado Esperado:**
- Decisão: GO
- Score geral ≥ 75
- Nenhum blocker
- Ainda pode ter melhorias P2/P3

---

### Cenário 6: Interface Web Completa

**Objetivo:** Testar interface web end-to-end

**Passos:**
1. Iniciar servidor: `npm run maestro:web`
2. Abrir `http://localhost:3000`
3. Clicar em "Executar Workflow"
4. Aguardar conclusão
5. Verificar todas as seções
6. Aprovar/rejeitar decisão
7. Verificar atualização

**Resultado Esperado:**
- Interface carrega
- Workflow executa via botão
- Status atualiza
- Todas as seções exibem dados
- Aprovação funciona
- Flowcharts renderizam

---

## 🔍 Como Validar Resultados

### 1. Validar Estrutura de Resultados

```bash
# Verificar que cada agente gerou resultado
for agent in architecture-review code-quality-review document-analysis security-audit performance-analysis dependency-management; do
  echo "=== $agent ==="
  ls -la src/shared/results/$agent/ | tail -1
done
```

**Validações:**
- [ ] Cada agente tem pelo menos 1 arquivo de resultado
- [ ] Arquivos têm formato `.md`
- [ ] Arquivos contêm score
- [ ] Arquivos contêm issues

---

### 2. Validar Avaliações Cruzadas

```bash
# Verificar avaliações cruzadas
ls -la src/shared/evaluations/
```

**Validações:**
- [ ] 6 arquivos de avaliação criados
- [ ] Cada avaliação tem preocupações
- [ ] Preocupações têm prioridade

---

### 3. Validar Decisão

```bash
# Verificar relatório Go/No-go
cat src/shared/decisions/go-no-go-report.md | grep -A 5 "DECISÃO"
```

**Validações:**
- [ ] Decisão é GO, NO-GO ou GO WITH CONCERNS
- [ ] Justificativa presente
- [ ] Scores incluídos
- [ ] Issues listados
- [ ] Recomendações presentes

---

### 4. Validar Backlog

```bash
# Verificar backlog
cat src/shared/backlog/current-backlog.json | jq '.summary' 2>/dev/null
```

**Validações:**
- [ ] JSON válido
- [ ] Summary calculado
- [ ] Tarefas presentes
- [ ] Prioridades atribuídas
- [ ] Esforço estimado

---

## 🐛 Troubleshooting

### Problema: Agente não executa

**Sintomas:**
- Erro ao importar módulo
- Função não encontrada

**Soluções:**
```bash
# Verificar imports
grep "import.*from" src/agents/[agent-name].js

# Verificar exports
grep "export" src/agents/[agent-name].js

# Testar import direto
node -e "import('./src/agents/[agent-name].js').then(m => console.log(Object.keys(m)))"
```

---

### Problema: Score sempre 0

**Sintomas:**
- Score retornado é 0
- Issues não são encontrados

**Soluções:**
```bash
# Verificar WORKSPACE_ROOT
echo $WORKSPACE_ROOT

# Verificar se projeto existe
ls -la $WORKSPACE_ROOT/Agents/life-goals-app/

# Executar com verbose
node src/scripts/run-workflow.js --verbose
```

---

### Problema: Backlog não é detectado

**Sintomas:**
- Maestro não carrega backlog
- Mensagem "Nenhum backlog encontrado"

**Soluções:**
```bash
# Verificar se evento existe
cat src/shared/events/backlog-ready.json

# Verificar se backlog existe
cat src/shared/backlog/current-backlog.json

# Verificar permissões
ls -la src/shared/events/ src/shared/backlog/
```

---

### Problema: Interface web não carrega

**Sintomas:**
- Erro ao acessar `localhost:3000`
- Porta em uso

**Soluções:**
```bash
# Verificar se porta está em uso
lsof -i :3000

# Matar processo se necessário
kill -9 $(lsof -t -i:3000)

# Usar porta diferente
PORT=3001 node src/web/server.js
```

---

## 📊 Métricas de Sucesso

### Critérios de Teste Bem-Sucedido

#### Funcionalidade
- ✅ Todos os agentes executam sem erros
- ✅ Resultados são gerados e salvos
- ✅ Avaliações cruzadas são criadas
- ✅ Decisão Go/No-go é tomada
- ✅ Backlog é gerado
- ✅ Interface web funciona

#### Qualidade
- ✅ Scores são calculados corretamente (0-100)
- ✅ Issues são categorizados (P0/P1/P2/P3)
- ✅ Decisão é justificada
- ✅ Backlog tem estrutura válida
- ✅ JSONs são válidos

#### Integração
- ✅ Product Manager → Maestro funciona
- ✅ Maestro → Product Manager (feedback) funciona
- ✅ Backlog Generator funciona
- ✅ Interface web → API funciona

---

## 📝 Relatório de Teste

### Template de Relatório

```markdown
# Relatório de Teste - Maestro Workflow

**Data:** [DATA]
**Testador:** [NOME]
**Versão:** 2.0

## Ambiente de Teste
- Node.js: [VERSÃO]
- OS: [SISTEMA OPERACIONAL]
- Projeto Testado: [PROJETO]

## Resultados

### Agentes
- [ ] Product Manager: ✅/❌
- [ ] Architecture: ✅/❌
- [ ] Code Quality: ✅/❌
- [ ] Document Analysis: ✅/❌
- [ ] Security: ✅/❌
- [ ] Performance: ✅/❌
- [ ] Dependency: ✅/❌

### Workflow
- [ ] Fase 1: Execução: ✅/❌
- [ ] Fase 2: Avaliação: ✅/❌
- [ ] Fase 3: Decisão: ✅/❌
- [ ] Fase 4: Aprovação: ✅/❌

### Integrações
- [ ] Product Manager → Maestro: ✅/❌
- [ ] Maestro → Product Manager: ✅/❌
- [ ] Backlog Generator: ✅/❌
- [ ] Interface Web: ✅/❌

## Issues Encontrados
1. [ISSUE 1]
2. [ISSUE 2]

## Conclusão
[CONCLUSÃO]
```

---

## 🚀 Quick Start para Testes

### Script de Teste Rápido

```bash
#!/bin/bash
# quick-test.sh

echo "🧪 Teste Rápido - Maestro Workflow"
echo ""

# 1. Verificar ambiente
echo "1. Verificando ambiente..."
node --version
npm --version

# 2. Instalar dependências
echo ""
echo "2. Instalando dependências..."
npm install

# 3. Executar workflow
echo ""
echo "3. Executando workflow..."
node src/scripts/run-workflow.js --verbose

# 4. Verificar resultados
echo ""
echo "4. Verificando resultados..."
echo "Agentes executados:"
ls -1 src/shared/results/*/ | wc -l

echo ""
echo "Avaliações criadas:"
ls -1 src/shared/evaluations/ | wc -l

echo ""
echo "Decisão gerada:"
test -f src/shared/decisions/go-no-go-report.md && echo "✅ Sim" || echo "❌ Não"

echo ""
echo "Backlog gerado:"
test -f src/shared/backlog/current-backlog.json && echo "✅ Sim" || echo "❌ Não"

echo ""
echo "✅ Teste completo!"
```

**Salvar como:** `maestro-workflow/quick-test.sh`  
**Executar:** `chmod +x quick-test.sh && ./quick-test.sh`

---

## 📚 Recursos Adicionais

### Documentação
- [README.md](../README.md) - Visão geral
- [SETUP.md](../SETUP.md) - Instalação
- [docs/processes/](processes/) - Processos detalhados
- [docs/PROCESS_FLOWCHARTS.md](PROCESS_FLOWCHARTS.md) - Flowcharts

### Código
- `src/scripts/run-workflow.js` - Script principal
- `src/agents/*.js` - Agentes
- `src/web/server.js` - Servidor web

### Exemplos
- `src/shared/results/` - Exemplos de resultados
- `src/shared/decisions/` - Exemplos de decisões
- `src/shared/backlog/` - Exemplos de backlog

---

**Última Atualização:** 2025-12-30  
**Versão:** 2.0

