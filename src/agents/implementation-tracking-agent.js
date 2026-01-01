/**
 * Implementation Tracking Agent
 * Rastreia e verifica se decisões aprovadas foram implementadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from '../../config/project-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar configuração centralizada
const WORKSPACE_ROOT = config.WORKSPACE_ROOT;
const PROJECT_DIR = config.PROJECT_DIR;
const SHARED_DIR = path.join(__dirname, '../shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'implementation-tracking');
const APPROVALS_FILE = path.join(SHARED_DIR, 'approvals.json');
const DECISIONS_DIR = path.join(SHARED_DIR, 'decisions');

/**
 * Executa rastreamento de implementação
 */
export async function runImplementationTracking() {
  try {
    ensureDirectories();
    
    // 1. Carregar decisões aprovadas
    const approvedDecisions = loadApprovedDecisions();
    
    if (approvedDecisions.length === 0) {
      return {
        success: true,
        results: {
          totalDecisions: 0,
          totalIssues: 0,
          resolvedIssues: 0,
          pendingIssues: 0,
          partiallyResolvedIssues: 0,
          issues: [],
          metrics: {
            resolutionRate: 100,
            averageResolutionTime: 0
          },
          recommendations: ['Nenhuma decisão aprovada para rastrear']
        }
      };
    }
    
    // 2. Verificar status de cada issue
    const trackingResults = [];
    let totalIssues = 0;
    let resolvedIssues = 0;
    let pendingIssues = 0;
    let partiallyResolvedIssues = 0;
    
    for (const decision of approvedDecisions) {
      const issues = extractIssuesFromDecision(decision);
      totalIssues += issues.length;
      
      for (const issue of issues) {
        const status = await checkIssueStatus(issue, decision);
        trackingResults.push({
          decisionId: decision.id,
          issue,
          status,
          checkedAt: new Date().toISOString()
        });
        
        if (status === 'resolved') {
          resolvedIssues++;
        } else if (status === 'partially-resolved') {
          partiallyResolvedIssues++;
        } else {
          pendingIssues++;
        }
      }
    }
    
    // 3. Calcular métricas
    const metrics = calculateMetrics(approvedDecisions, trackingResults);
    
    // 4. Gerar recomendações
    const recommendations = generateRecommendations(trackingResults);
    
    return {
      success: true,
      results: {
        totalDecisions: approvedDecisions.length,
        totalIssues,
        resolvedIssues,
        pendingIssues,
        partiallyResolvedIssues,
        issues: trackingResults,
        metrics,
        recommendations
      }
    };
  } catch (error) {
    console.error('Erro no rastreamento de implementação:', error);
    return {
      success: false,
      error: error.message,
      results: {
        totalDecisions: 0,
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        partiallyResolvedIssues: 0,
        issues: [],
        metrics: {
          resolutionRate: 0,
          averageResolutionTime: 0
        },
        recommendations: []
      }
    };
  }
}

/**
 * Gera relatório de rastreamento
 */
export function generateTrackingReport(results, timestamp) {
  const { totalDecisions, totalIssues, resolvedIssues, pendingIssues, partiallyResolvedIssues, issues, metrics, recommendations } = results;
  
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;
  
  const report = `# Relatório de Rastreamento de Implementação

**Data:** ${timestamp}
**Agente:** Implementation Tracking Agent

---

## 📊 Resumo Executivo

| Métrica | Valor | Status |
|---------|-------|--------|
| **Decisões Aprovadas** | ${totalDecisions} | - |
| **Total de Issues** | ${totalIssues} | - |
| **Issues Resolvidos** | ${resolvedIssues} | ${resolvedIssues === totalIssues ? '✅' : '⚠️'} |
| **Issues Pendentes** | ${pendingIssues} | ${pendingIssues === 0 ? '✅' : '❌'} |
| **Issues Parcialmente Resolvidos** | ${partiallyResolvedIssues} | ${partiallyResolvedIssues === 0 ? '✅' : '⚠️'} |
| **Taxa de Resolução** | ${resolutionRate}% | ${resolutionRate >= 80 ? '✅' : resolutionRate >= 50 ? '⚠️' : '❌'} |

---

## ✅ Issues Resolvidos

${issues.filter(i => i.status === 'resolved').length > 0 ? issues.filter(i => i.status === 'resolved').map((item, i) => `
### ${i + 1}. ${item.issue.message || item.issue.title || 'Issue'}
- **Decisão:** ${item.decisionId}
- **Status:** ✅ Resolvido
- **Verificado em:** ${item.checkedAt}
`).join('\n') : 'Nenhum issue resolvido identificado.'}

---

## ⚠️ Issues Parcialmente Resolvidos

${issues.filter(i => i.status === 'partially-resolved').length > 0 ? issues.filter(i => i.status === 'partially-resolved').map((item, i) => `
### ${i + 1}. ${item.issue.message || item.issue.title || 'Issue'}
- **Decisão:** ${item.decisionId}
- **Status:** ⚠️ Parcialmente Resolvido
- **Verificado em:** ${item.checkedAt}
`).join('\n') : 'Nenhum issue parcialmente resolvido.'}

---

## ❌ Issues Pendentes

${issues.filter(i => i.status === 'pending').length > 0 ? issues.filter(i => i.status === 'pending').map((item, i) => `
### ${i + 1}. ${item.issue.message || item.issue.title || 'Issue'}
- **Decisão:** ${item.decisionId}
- **Status:** ❌ Pendente
- **Verificado em:** ${item.checkedAt}
`).join('\n') : 'Nenhum issue pendente. ✅'}

---

## 📈 Métricas

- **Taxa de Resolução:** ${metrics.resolutionRate}%
- **Tempo Médio de Resolução:** ${metrics.averageResolutionTime} dias
- **Issues por Prioridade:** 
  - P0: ${issues.filter(i => i.issue.priority === 'P0').length}
  - P1: ${issues.filter(i => i.issue.priority === 'P1').length}
  - P2: ${issues.filter(i => i.issue.priority === 'P2').length}
  - P3: ${issues.filter(i => i.issue.priority === 'P3').length}

---

## 💡 Recomendações

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

**Gerado por:** Implementation Tracking Agent
**Versão:** 1.0
`;

  return report;
}

/**
 * Carrega decisões aprovadas
 */
function loadApprovedDecisions() {
  const decisions = [];
  
  // Tentar carregar de approvals.json
  if (fs.existsSync(APPROVALS_FILE)) {
    try {
      const approvals = JSON.parse(fs.readFileSync(APPROVALS_FILE, 'utf-8'));
      const approved = Array.isArray(approvals) 
        ? approvals.filter(a => a.status === 'approved')
        : [];
      decisions.push(...approved);
    } catch (error) {
      console.error('Erro ao ler approvals.json:', error);
    }
  }
  
  // Também verificar decisões recentes
  if (fs.existsSync(DECISIONS_DIR)) {
    try {
      const files = fs.readdirSync(DECISIONS_DIR);
      const reportFiles = files.filter(f => f.endsWith('.md'));
      
      for (const file of reportFiles.slice(-5)) { // Últimas 5 decisões
        const filePath = path.join(DECISIONS_DIR, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const decisionMatch = content.match(/## 🎯 Decisão Final\s*\n\s*### .*?\*\*DECISÃO:\s*(.+?)\*\*/);
          if (decisionMatch && (decisionMatch[1].includes('GO') || decisionMatch[1].includes('NO-GO'))) {
            // Extrair informações básicas
            const workflowIdMatch = content.match(/\*\*Workflow ID:\*\*\s*(.+)/);
            const timestampMatch = content.match(/\*\*Data:\*\*\s*(.+)/);
            
            decisions.push({
              id: workflowIdMatch ? workflowIdMatch[1].trim() : file.replace('.md', ''),
              decision: decisionMatch[1].trim(),
              timestamp: timestampMatch ? timestampMatch[1].trim() : new Date().toISOString(),
              status: 'approved', // Assumir aprovado se está no arquivo
              content
            });
          }
        } catch (error) {
          // Ignorar erros
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  return decisions;
}

/**
 * Extrai issues de uma decisão
 */
function extractIssuesFromDecision(decision) {
  const issues = [];
  
  // Extrair de concerns
  if (decision.concerns) {
    if (decision.concerns.critical) {
      issues.push(...decision.concerns.critical.map(c => ({ ...c, priority: 'P0' })));
    }
    if (decision.concerns.high) {
      issues.push(...decision.concerns.high.map(c => ({ ...c, priority: 'P1' })));
    }
  }
  
  // Extrair de actionPlan se disponível
  if (decision.actionPlan) {
    if (decision.actionPlan.immediate) {
      issues.push(...decision.actionPlan.immediate.map(a => ({ ...a, priority: 'P0' })));
    }
    if (decision.actionPlan.shortTerm) {
      issues.push(...decision.actionPlan.shortTerm.map(a => ({ ...a, priority: 'P1' })));
    }
  }
  
  // Extrair do conteúdo Markdown se disponível
  if (decision.content) {
    const criticalMatch = decision.content.match(/## 🚨 Preocupações Críticas.*?##/s);
    if (criticalMatch) {
      const issueMatches = criticalMatch[0].matchAll(/\| P0-\d+ \| (.+?) \|/g);
      for (const match of issueMatches) {
        issues.push({
          message: match[1].trim(),
          priority: 'P0',
          source: 'decision-report'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Verifica status de um issue
 */
async function checkIssueStatus(issue, decision) {
  // Verificar se arquivo mencionado existe
  if (issue.location) {
    const filePath = path.join(WORKSPACE_ROOT, issue.location);
    if (fs.existsSync(filePath)) {
      // Arquivo existe, pode ter sido resolvido
      // Verificação simplificada: se arquivo existe e não há menção de erro, considerar parcialmente resolvido
      return 'partially-resolved';
    } else {
      // Arquivo não existe, ainda pendente
      return 'pending';
    }
  }
  
  // Verificar por mensagem/descrição
  const message = (issue.message || issue.description || '').toLowerCase();
  
  // Verificações básicas
  if (message.includes('readme') || message.includes('documentation')) {
    const readmePath = path.join(WORKSPACE_ROOT, 'README.md');
    if (fs.existsSync(readmePath)) {
      return 'resolved';
    }
  }
  
  if (message.includes('firestore.rules')) {
    const rulesPath = path.join(WORKSPACE_ROOT, 'firestore.rules');
    if (fs.existsSync(rulesPath)) {
      return 'resolved';
    }
  }
  
  // Por padrão, considerar pendente
  return 'pending';
}

/**
 * Calcula métricas
 */
function calculateMetrics(decisions, trackingResults) {
  const resolved = trackingResults.filter(r => r.status === 'resolved');
  const total = trackingResults.length;
  
  const resolutionRate = total > 0 ? Math.round((resolved.length / total) * 100) : 100;
  
  // Calcular tempo médio (simplificado)
  let totalDays = 0;
  let count = 0;
  
  for (const decision of decisions) {
    if (decision.timestamp) {
      const decisionDate = new Date(decision.timestamp);
      const now = new Date();
      const days = Math.floor((now - decisionDate) / (1000 * 60 * 60 * 24));
      totalDays += days;
      count++;
    }
  }
  
  const averageResolutionTime = count > 0 ? Math.round(totalDays / count) : 0;
  
  return {
    resolutionRate,
    averageResolutionTime
  };
}

/**
 * Gera recomendações
 */
function generateRecommendations(trackingResults) {
  const recommendations = [];
  
  const pending = trackingResults.filter(r => r.status === 'pending');
  const partiallyResolved = trackingResults.filter(r => r.status === 'partially-resolved');
  
  if (pending.length > 0) {
    recommendations.push(`Priorizar resolução de ${pending.length} issue(s) pendente(s)`);
  }
  
  if (partiallyResolved.length > 0) {
    recommendations.push(`Completar implementação de ${partiallyResolved.length} issue(s) parcialmente resolvido(s)`);
  }
  
  const p0Pending = pending.filter(r => r.issue.priority === 'P0');
  if (p0Pending.length > 0) {
    recommendations.push(`Resolver ${p0Pending.length} issue(s) crítico(s) (P0) primeiro`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Todas as decisões aprovadas foram implementadas com sucesso');
  }
  
  return recommendations;
}

/**
 * Garante que diretórios existem
 */
function ensureDirectories() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

