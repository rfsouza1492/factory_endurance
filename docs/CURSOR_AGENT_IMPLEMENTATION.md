# 🤖 Implementação usando Cursor Background Agent Stack

**Data:** 2025-12-30  
**Sistema:** Maestro - Coordenação de Agentes  
**Método:** Cursor Background Agent Stack

---

## 🎯 Visão Geral

Este documento fornece instruções detalhadas para implementar cada agente do sistema Maestro usando o **Cursor Background Agent Stack**. Cada agente será implementado como uma função autônoma que pode ser executada pelo Cursor para realizar sua missão específica.

---

## 📋 Estrutura de Implementação

### Arquitetura Base

```
Agents/maestro/
├── scripts/
│   ├── agents/
│   │   ├── product-manager-agent.js      [NOVO]
│   │   ├── architecture-agent.js         [EXISTENTE]
│   │   ├── code-quality-agent.js         [EXISTENTE]
│   │   ├── document-analysis-agent.js    [EXISTENTE]
│   │   ├── security-agent.js             [NOVO]
│   │   ├── performance-agent.js          [NOVO]
│   │   ├── dependency-agent.js           [NOVO]
│   │   ├── testing-agent.js              [NOVO]
│   │   ├── accessibility-agent.js        [NOVO]
│   │   ├── api-design-agent.js           [NOVO]
│   │   └── implementation-tracking-agent.js [NOVO]
│   │
│   ├── evaluation-logic.js               [EXISTENTE]
│   ├── decision-logic.js                 [EXISTENTE]
│   ├── backlog-generator.js             [NOVO]
│   └── run-workflow.js                   [EXISTENTE]
│
└── shared/
    ├── backlog/                          [NOVO]
    ├── results/
    ├── evaluations/
    └── decisions/
```

---

## 🎯 Instruções para Cursor Background Agent Stack

### Como Usar Este Documento

Para cada agente abaixo, você deve:

1. **Criar o arquivo do agente** na estrutura especificada
2. **Implementar as funções** conforme descrito
3. **Testar a execução** isoladamente
4. **Integrar ao workflow** principal

---

## 📊 Product Manager Agent

### Arquivo: `Agents/maestro/scripts/agents/product-manager-agent.js`

### Prompt para Cursor:

```
Crie um agente Product Manager que:

1. Lê o roadmap (knowledge/product/ROADMAP.md) e milestones
2. Analisa o código atual do projeto (Agents/life-goals-app/)
3. Compara progresso atual vs. objetivos do roadmap
4. Identifica gaps (features faltantes, qualidade abaixo do esperado, etc.)
5. Gera backlog de tarefas automaticamente em formato JSON
6. Salva backlog em maestro/shared/backlog/backlog-[timestamp].json
7. Aciona Maestro com evento "backlog-ready"

Estrutura esperada:
- Função principal: runProductManagerAnalysis()
- Função para ler roadmap: readRoadmap()
- Função para analisar código: analyzeCurrentCode()
- Função para comparar: compareWithMilestones()
- Função para gerar backlog: generateBacklog(gaps)
- Função para salvar: saveBacklog(backlog)
- Função para acionar Maestro: notifyMaestro(backlogId)

Output esperado:
- backlog.json com estrutura completa
- status-report.md com resumo executivo
```

### Estrutura de Código Base:

```javascript
/**
 * Product Manager Agent
 * Avalia status de desenvolvimento, cria backlog, aciona Maestro
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const KNOWLEDGE_DIR = path.join(WORKSPACE_ROOT, 'knowledge');
const PRODUCT_DIR = path.join(KNOWLEDGE_DIR, 'product');
const BACKLOG_DIR = path.join(__dirname, '../../shared/backlog');

/**
 * Executa análise do Product Manager
 */
export async function runProductManagerAnalysis() {
  // 1. Ler roadmap e milestones
  const roadmap = await readRoadmap();
  
  // 2. Analisar código atual
  const currentStatus = await analyzeCurrentCode();
  
  // 3. Comparar com milestones
  const gaps = await compareWithMilestones(roadmap, currentStatus);
  
  // 4. Gerar backlog
  const backlog = await generateBacklog(gaps);
  
  // 5. Salvar backlog
  await saveBacklog(backlog);
  
  // 6. Acionar Maestro
  await notifyMaestro(backlog.backlogId);
  
  return {
    success: true,
    backlogId: backlog.backlogId,
    tasksCreated: backlog.tasks.length
  };
}

/**
 * Lê roadmap e milestones
 */
async function readRoadmap() {
  // Implementar leitura de ROADMAP.md e BACKLOG.md
}

/**
 * Analisa código atual
 */
async function analyzeCurrentCode() {
  // Implementar análise do código atual
}

/**
 * Compara com milestones
 */
async function compareWithMilestones(roadmap, currentStatus) {
  // Implementar comparação e identificação de gaps
}

/**
 * Gera backlog de tarefas
 */
async function generateBacklog(gaps) {
  // Implementar geração de backlog
}

/**
 * Salva backlog em arquivo
 */
async function saveBacklog(backlog) {
  // Implementar salvamento
}

/**
 * Notifica Maestro sobre novo backlog
 */
async function notifyMaestro(backlogId) {
  // Implementar notificação
}
```

---

## 🏗️ Architecture Review Agent

### Arquivo: `Agents/maestro/scripts/agents/architecture-agent.js` [EXISTENTE - Melhorar]

### Prompt para Cursor:

```
Melhore o Architecture Review Agent existente para:

1. Seguir o processo detalhado em PROCESS_MAPPING.md
2. Implementar todas as 7 fases com micro-passos
3. Gerar relatório completo usando template
4. Salvar resultado em formato padronizado
5. Retornar estrutura compatível com Maestro

Melhorias necessárias:
- Adicionar análise de padrões arquiteturais mais profunda
- Melhorar detecção de anti-padrões
- Adicionar análise de escalabilidade
- Melhorar geração de sugestões de melhorias
```

---

## ✅ Code Quality Review Agent

### Arquivo: `Agents/maestro/scripts/agents/code-quality-agent.js` [EXISTENTE - Melhorar]

### Prompt para Cursor:

```
Melhore o Code Quality Review Agent existente para:

1. Seguir processo completo em PROCESS_MAPPING.md
2. Implementar análise manual detalhada
3. Melhorar categorização de issues
4. Adicionar análise de padrões
5. Gerar recomendações mais específicas

Melhorias necessárias:
- Análise file-by-file mais detalhada
- Verificação de business logic mais robusta
- Análise de acessibilidade mais completa
- Melhor cálculo de scores por categoria
```

---

## 📚 Document Analysis Agent

### Arquivo: `Agents/maestro/scripts/agents/document-analysis-agent.js` [EXISTENTE - Melhorar]

### Prompt para Cursor:

```
Melhore o Document Analysis Agent existente para:

1. Implementar todas as 6 fases do processo
2. Adicionar classificação de documentos
3. Melhorar extração de informações
4. Adicionar análise de relacionamentos
5. Gerar síntese de conhecimento

Melhorias necessárias:
- Classificação automática de documentos
- Mapeamento de relacionamentos entre docs
- Análise de gaps mais profunda
- Geração de insights mais estruturada
```

---

## 🔒 Security Audit Agent

### Arquivo: `Agents/maestro/scripts/agents/security-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um Security Audit Agent que:

1. Analisa código para vulnerabilidades OWASP Top 10
2. Verifica autenticação e autorização
3. Identifica dados sensíveis e secrets
4. Verifica configurações de segurança
5. Analisa dependências para vulnerabilidades
6. Verifica regras de segurança (Firestore, etc.)
7. Classifica vulnerabilidades por severidade
8. Gera relatório de segurança

Estrutura esperada:
- Função principal: runSecurityAudit()
- Função para análise de código: analyzeCodeSecurity()
- Função para análise de configurações: analyzeSecurityConfig()
- Função para análise de dependências: analyzeDependencies()
- Função para análise de regras: analyzeSecurityRules()
- Função para classificação: classifyVulnerabilities(issues)
- Função para relatório: generateSecurityReport(issues)

Seguir processo em PROCESS_MAPPING.md seção Security Audit Agent.
```

### Estrutura de Código Base:

```javascript
/**
 * Security Audit Agent
 * Realiza auditoria profunda de segurança
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const PROJECT_DIR = path.join(WORKSPACE_ROOT, 'Agents/life-goals-app');

/**
 * Executa auditoria de segurança
 */
export async function runSecurityAudit() {
  const issues = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };
  
  // 1. Análise de código
  const codeIssues = await analyzeCodeSecurity();
  
  // 2. Análise de configurações
  const configIssues = await analyzeSecurityConfig();
  
  // 3. Análise de dependências
  const depIssues = await analyzeDependencies();
  
  // 4. Análise de regras de segurança
  const rulesIssues = await analyzeSecurityRules();
  
  // Consolidar issues
  issues.critical.push(...codeIssues.critical);
  issues.high.push(...codeIssues.high);
  // ... etc
  
  // Calcular score
  const score = calculateSecurityScore(issues);
  
  return {
    success: true,
    results: {
      issues,
      score,
      recommendations: generateRecommendations(issues)
    }
  };
}

// Implementar funções específicas...
```

---

## ⚡ Performance Analysis Agent

### Arquivo: `Agents/maestro/scripts/agents/performance-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um Performance Analysis Agent que:

1. Executa profiling de código
2. Analisa queries de banco de dados
3. Analisa tamanho de bundle
4. Analisa renderização e re-renders
5. Identifica bottlenecks
6. Sugere otimizações específicas
7. Gera relatório de performance

Estrutura esperada:
- Função principal: runPerformanceAnalysis()
- Função para profiling: performProfiling()
- Função para análise de queries: analyzeQueries()
- Função para análise de bundle: analyzeBundle()
- Função para análise de renderização: analyzeRendering()
- Função para identificar bottlenecks: identifyBottlenecks(metrics)
- Função para gerar otimizações: generateOptimizations(bottlenecks)

Seguir processo em PROCESS_MAPPING.md seção Performance Analysis Agent.
```

---

## 📦 Dependency Management Agent

### Arquivo: `Agents/maestro/scripts/agents/dependency-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um Dependency Management Agent que:

1. Analisa package.json e dependências
2. Identifica dependências desatualizadas
3. Verifica vulnerabilidades conhecidas
4. Verifica dependências não utilizadas
5. Sugere atualizações seguras
6. Analisa impacto de atualizações
7. Gera relatório de dependências

Estrutura esperada:
- Função principal: runDependencyAnalysis()
- Função para análise de dependências: analyzeDependencies()
- Função para verificar vulnerabilidades: checkVulnerabilities()
- Função para verificar não utilizadas: findUnusedDependencies()
- Função para sugerir atualizações: suggestUpdates(dependencies)
- Função para analisar impacto: analyzeUpdateImpact(updates)
```

---

## 🧪 Testing Coverage Agent

### Arquivo: `Agents/maestro/scripts/agents/testing-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um Testing Coverage Agent que:

1. Analisa cobertura de testes
2. Identifica código não testado
3. Verifica tipos de testes (unit, integration, e2e)
4. Analisa qualidade dos testes
5. Sugere testes faltantes
6. Gera relatório de cobertura

Estrutura esperada:
- Função principal: runTestingAnalysis()
- Função para análise de cobertura: analyzeCoverage()
- Função para identificar não testado: findUntestedCode()
- Função para verificar tipos: checkTestTypes()
- Função para analisar qualidade: analyzeTestQuality()
- Função para sugerir testes: suggestMissingTests(untested)
```

---

## ♿ Accessibility Audit Agent

### Arquivo: `Agents/maestro/scripts/agents/accessibility-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um Accessibility Audit Agent que:

1. Verifica semantic HTML
2. Verifica ARIA labels e roles
3. Verifica navegação por teclado
4. Verifica contraste de cores
5. Verifica alt text em imagens
6. Verifica formulários acessíveis
7. Gera relatório de acessibilidade

Estrutura esperada:
- Função principal: runAccessibilityAudit()
- Função para verificar HTML: checkSemanticHTML()
- Função para verificar ARIA: checkARIA()
- Função para verificar teclado: checkKeyboardNavigation()
- Função para verificar contraste: checkColorContrast()
- Função para verificar imagens: checkImageAccessibility()
- Função para verificar formulários: checkFormAccessibility()
```

---

## 🔌 API Design Review Agent

### Arquivo: `Agents/maestro/scripts/agents/api-design-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um API Design Review Agent que:

1. Analisa design de APIs (se aplicável)
2. Verifica RESTful principles
3. Verifica versionamento
4. Verifica documentação de API
5. Verifica tratamento de erros
6. Verifica autenticação/autorização
7. Gera relatório de design de API

Estrutura esperada:
- Função principal: runAPIDesignReview()
- Função para análise de design: analyzeAPIDesign()
- Função para verificar RESTful: checkRESTfulPrinciples()
- Função para verificar versionamento: checkVersioning()
- Função para verificar documentação: checkAPIDocumentation()
- Função para verificar erros: checkErrorHandling()
```

---

## 🔄 Implementation Tracking Agent

### Arquivo: `Agents/maestro/scripts/agents/implementation-tracking-agent.js` [NOVO]

### Prompt para Cursor:

```
Crie um Implementation Tracking Agent que:

1. Lê decisões aprovadas (maestro/shared/approvals.json)
2. Para cada issue identificado, verifica estado atual
3. Compara estado anterior vs. atual
4. Classifica status: Resolvido, Parcialmente Resolvido, Pendente, Em Progresso
5. Calcula métricas de progresso
6. Gera relatório de implementação

Estrutura esperada:
- Função principal: runImplementationTracking()
- Função para carregar decisões: loadApprovedDecisions()
- Função para verificar issue: checkIssueStatus(issue)
- Função para classificar: classifyStatus(before, after)
- Função para calcular métricas: calculateMetrics(issues)
- Função para gerar relatório: generateTrackingReport(metrics)

Seguir processo em PROCESS_MAPPING.md seção Implementation Tracking Agent.
```

---

## 🔧 Backlog Generator

### Arquivo: `Agents/maestro/scripts/backlog-generator.js` [NOVO]

### Prompt para Cursor:

```
Crie um módulo Backlog Generator que:

1. Recebe issues identificados pelos agentes
2. Converte issues em tarefas estruturadas
3. Prioriza tarefas automaticamente
4. Agrupa tarefas por tipo e prioridade
5. Estima esforço para cada tarefa
6. Identifica dependências entre tarefas
7. Gera backlog.json estruturado

Estrutura esperada:
- Função principal: generateBacklog(issues, options)
- Função para converter: convertIssueToTask(issue)
- Função para priorizar: prioritizeTasks(tasks)
- Função para agrupar: groupTasks(tasks)
- Função para estimar: estimateEffort(task)
- Função para dependências: identifyDependencies(tasks)
- Função para gerar JSON: generateBacklogJSON(tasks)
```

---

## 🔄 Integração com Workflow

### Arquivo: `Agents/maestro/scripts/run-workflow.js` [ATUALIZAR]

### Prompt para Cursor:

```
Atualize o run-workflow.js para:

1. Verificar se há backlog do Product Manager
2. Se houver, usar backlog como entrada
3. Executar agentes baseado em tarefas do backlog
4. Retornar feedback para Product Manager
5. Aguardar aprovação antes de implementar

Adicionar:
- Função para verificar backlog: checkForBacklog()
- Função para carregar backlog: loadBacklog(backlogId)
- Função para filtrar agentes: filterAgentsByBacklog(backlog)
- Função para retornar feedback: returnFeedbackToProductManager(results)
```

---

## 📝 Template de Implementação

### Estrutura Padrão para Cada Agente

```javascript
/**
 * [Nome do Agente]
 * [Descrição da missão]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const PROJECT_DIR = path.join(WORKSPACE_ROOT, 'Agents/life-goals-app');
const SHARED_DIR = path.join(__dirname, '../../shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results');

/**
 * Executa análise do agente
 */
export async function run[NomeAgente]Analysis() {
  try {
    // 1. Preparar ambiente
    ensureDirectories();
    
    // 2. Executar análise
    const results = await performAnalysis();
    
    // 3. Processar resultados
    const processed = await processResults(results);
    
    // 4. Gerar relatório
    const report = await generateReport(processed);
    
    // 5. Salvar resultados
    await saveResults(report);
    
    return {
      success: true,
      results: processed,
      reportPath: report.path
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Realiza análise principal
 */
async function performAnalysis() {
  // Implementar análise específica do agente
}

/**
 * Processa resultados
 */
async function processResults(results) {
  // Processar e estruturar resultados
}

/**
 * Gera relatório
 */
async function generateReport(processed) {
  // Gerar relatório em Markdown
}

/**
 * Salva resultados
 */
async function saveResults(report) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `${timestamp}-[tipo].md`;
  const filepath = path.join(RESULTS_DIR, '[agente-dir]', filename);
  
  fs.writeFileSync(filepath, report.content, 'utf-8');
  
  return { path: filepath };
}

/**
 * Garante que diretórios existem
 */
function ensureDirectories() {
  const dirs = [
    RESULTS_DIR,
    path.join(RESULTS_DIR, '[agente-dir]')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
```

---

## ✅ Checklist de Implementação

### Para Cada Agente Novo:

- [ ] Criar arquivo do agente em `scripts/agents/`
- [ ] Implementar função principal `run[Nome]Analysis()`
- [ ] Implementar funções de análise específicas
- [ ] Implementar geração de relatório
- [ ] Implementar salvamento de resultados
- [ ] Testar execução isolada
- [ ] Integrar ao `run-workflow.js`
- [ ] Adicionar ao `evaluation-logic.js` (se necessário)
- [ ] Adicionar ao `decision-logic.js` (se necessário)
- [ ] Documentar no README do agente

### Para Melhorias de Agentes Existentes:

- [ ] Revisar processo em PROCESS_MAPPING.md
- [ ] Identificar funcionalidades faltantes
- [ ] Implementar melhorias
- [ ] Manter compatibilidade com workflow existente
- [ ] Testar integração
- [ ] Atualizar documentação

---

## 🎯 Ordem de Implementação Recomendada

### Fase 1: Core (Prioridade Alta)
1. ✅ Product Manager Agent
2. ✅ Backlog Generator
3. ✅ Atualizar run-workflow.js

### Fase 2: Melhorias (Prioridade Média)
4. ✅ Melhorar Architecture Agent
5. ✅ Melhorar Code Quality Agent
6. ✅ Melhorar Document Analysis Agent

### Fase 3: Novos Agentes (Prioridade Média)
7. ✅ Security Audit Agent
8. ✅ Performance Analysis Agent
9. ✅ Dependency Management Agent

### Fase 4: Agentes Adicionais (Prioridade Baixa)
10. ✅ Testing Coverage Agent
11. ✅ Accessibility Audit Agent
12. ✅ API Design Review Agent
13. ✅ Implementation Tracking Agent

---

## 📚 Recursos de Referência

### Documentos Importantes:
- `PROCESS_MAPPING.md` - Processos detalhados de cada agente
- `PRODUCT_MANAGER_AGENT.md` - Especificação do Product Manager
- `PRODUCT_MANAGER_PROMPT.md` - Prompt detalhado
- `AUTOMATION_AND_TRIGGERS.md` - Sistema de automação
- `NEW_AGENTS_PROMPTS.md` - Prompts dos novos agentes

### Templates:
- `templates/agent-result-template.md`
- `templates/cross-evaluation-template.md`
- `templates/go-no-go-report-template.md`

---

## 🔍 Exemplo de Uso com Cursor

### Passo a Passo:

1. **Abra o arquivo do agente** que deseja criar/melhorar
2. **Use o prompt específico** deste documento para o agente
3. **Cursor irá gerar** o código base
4. **Revise e ajuste** conforme necessário
5. **Teste a execução** isoladamente
6. **Integre ao workflow** principal

### Exemplo de Prompt para Cursor:

```
@Cursor: Implemente o Security Audit Agent seguindo as especificações em CURSOR_AGENT_IMPLEMENTATION.md. O agente deve:

1. Analisar código para vulnerabilidades OWASP Top 10
2. Verificar autenticação e autorização
3. Identificar secrets hardcoded
4. Verificar configurações de segurança
5. Analisar dependências
6. Gerar relatório completo

Use a estrutura de código base fornecida e siga o processo em PROCESS_MAPPING.md.
```

---

**Última Atualização**: 2025-12-30  
**Status**: 📋 Guia Completo para Implementação

