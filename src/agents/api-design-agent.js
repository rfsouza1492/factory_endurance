/**
 * API Design Review Agent
 * Analisa design e qualidade de APIs
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
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'api-design-review');

/**
 * Executa análise de design de API
 */
export async function runAPIDesignReview() {
  try {
    ensureDirectories();
    
    const issues = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    // 1. Análise de endpoints
    const endpointsAnalysis = analyzeEndpoints();
    
    // 2. Análise de RESTful principles
    const restfulAnalysis = analyzeRESTfulPrinciples();
    
    // 3. Análise de versionamento
    const versioningAnalysis = analyzeVersioning();
    
    // 4. Análise de documentação de API
    const docsAnalysis = analyzeAPIDocumentation();
    
    // Consolidar issues
    issues.critical.push(...(endpointsAnalysis.issues?.critical || []));
    issues.critical.push(...(restfulAnalysis.issues?.critical || []));
    
    issues.high.push(...(endpointsAnalysis.issues?.high || []));
    issues.high.push(...(restfulAnalysis.issues?.high || []));
    issues.high.push(...(versioningAnalysis.issues?.high || []));
    issues.high.push(...(docsAnalysis.issues?.high || []));
    
    issues.medium.push(...(restfulAnalysis.issues?.medium || []));
    issues.medium.push(...(versioningAnalysis.issues?.medium || []));
    issues.medium.push(...(docsAnalysis.issues?.medium || []));
    
    issues.low.push(...(versioningAnalysis.issues?.low || []));
    issues.low.push(...(docsAnalysis.issues?.low || []));
    
    // Calcular score
    const score = calculateAPIDesignScore(issues);
    
    // Garantir que summary existe
    const endpointsSummary = endpointsAnalysis.summary || 'Análise de endpoints';
    const restfulSummary = restfulAnalysis.summary || 'Análise de princípios RESTful';
    const versioningSummary = versioningAnalysis.summary || 'Análise de versionamento';
    const docsSummary = docsAnalysis.summary || 'Análise de documentação';
    
    return {
      success: true,
      results: {
        issues,
        score,
        endpointsAnalysis: { ...endpointsAnalysis, summary: endpointsSummary },
        restfulAnalysis: { ...restfulAnalysis, summary: restfulSummary },
        versioningAnalysis: { ...versioningAnalysis, summary: versioningSummary },
        docsAnalysis: { ...docsAnalysis, summary: docsSummary },
        recommendations: generateRecommendations(issues)
      }
    };
  } catch (error) {
    console.error('Erro na análise de design de API:', error);
    return {
      success: false,
      error: error.message,
      results: {
        issues: { critical: [], high: [], medium: [], low: [] },
        score: 0
      }
    };
  }
}

/**
 * Gera relatório de design de API
 */
export function generateAPIDesignReport(results, timestamp) {
  const { issues, score, endpointsAnalysis, restfulAnalysis, versioningAnalysis, docsAnalysis, recommendations } = results;
  
  const report = `# Relatório de Análise de Design de API

**Data:** ${timestamp}
**Agente:** API Design Review Agent

---

## 📊 Resumo Executivo

| Métrica | Valor | Status |
|---------|-------|--------|
| **Score Geral** | ${score}/100 | ${score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌'} |
| **Issues Críticos (P0)** | ${issues.critical.length} | ${issues.critical.length === 0 ? '✅' : '❌'} |
| **Issues Alta (P1)** | ${issues.high.length} | ${issues.high.length === 0 ? '✅' : '⚠️'} |
| **Issues Média (P2)** | ${issues.medium.length} | ⚠️ |
| **Issues Baixa (P3)** | ${issues.low.length} | ℹ️ |

---

## 🚨 Issues Críticos (P0)

${issues.critical.length > 0 ? issues.critical.map((issue, i) => `
### P0-${i + 1}: ${issue.message}
- **Localização:** ${issue.location || 'N/A'}
- **Tipo:** ${issue.type || 'N/A'}
- **Impacto:** ${issue.impact || 'Alto'}
- **Recomendação:** ${issue.recommendation || 'N/A'}
`).join('\n') : 'Nenhum issue crítico identificado. ✅'}

---

## ⚠️ Issues de Alta Prioridade (P1)

${issues.high.length > 0 ? issues.high.map((issue, i) => `
### P1-${i + 1}: ${issue.message}
- **Localização:** ${issue.location || 'N/A'}
- **Tipo:** ${issue.type || 'N/A'}
- **Impacto:** ${issue.impact || 'Médio'}
- **Recomendação:** ${issue.recommendation || 'N/A'}
`).join('\n') : 'Nenhum issue de alta prioridade identificado. ✅'}

---

## 📋 Issues de Média Prioridade (P2)

${issues.medium.length > 0 ? issues.medium.slice(0, 10).map((issue, i) => `
### P2-${i + 1}: ${issue.message}
- **Localização:** ${issue.location || 'N/A'}
- **Tipo:** ${issue.type || 'N/A'}
`).join('\n') : 'Nenhum issue de média prioridade identificado.'}

${issues.medium.length > 10 ? `\n*... e mais ${issues.medium.length - 10} issues de média prioridade*` : ''}

---

## 📊 Análise Detalhada

### Análise de Endpoints
${endpointsAnalysis.summary || 'N/A'}

### Análise de Princípios RESTful
${restfulAnalysis.summary || 'N/A'}

### Análise de Versionamento
${versioningAnalysis.summary || 'N/A'}

### Análise de Documentação
${docsAnalysis.summary || 'N/A'}

---

## 💡 Recomendações

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

**Gerado por:** API Design Review Agent
**Versão:** 1.0
`;

  return report;
}

/**
 * Analisa endpoints
 */
function analyzeEndpoints() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findAPIFiles(PROJECT_DIR);
  let endpointCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar padrões de endpoints
      const endpointPatterns = [
        /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
        /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
        /\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g
      ];
      
      for (const pattern of endpointPatterns) {
        const matches = [...content.matchAll(pattern)];
        endpointCount += matches.length;
        
        for (const match of matches) {
          const endpoint = match[2];
          
          // Verificar se segue convenções RESTful
          if (!/^\/api\//.test(endpoint) && !/^\/v\d+\//.test(endpoint)) {
            issues.medium.push({
              message: `Endpoint sem prefixo /api/ ou versionamento: ${endpoint}`,
              location: file,
              type: 'API Design',
              impact: 'Médio',
              recommendation: 'Usar prefixo /api/ ou /v1/ para versionamento'
            });
          }
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  if (endpointCount === 0) {
    issues.high.push({
      message: 'Nenhum endpoint de API encontrado',
      location: PROJECT_DIR,
      type: 'API Design',
      impact: 'Médio',
      recommendation: 'Verificar se projeto tem APIs ou se análise é aplicável'
    });
  }
  
  return { issues, summary: `Encontrados ${endpointCount} endpoint(s) de API` };
}

/**
 * Analisa princípios RESTful
 */
function analyzeRESTfulPrinciples() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findAPIFiles(PROJECT_DIR);
  let nonRESTfulCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar uso de verbos em URLs (anti-padrão REST)
      const verbPatterns = /\/api\/[^\/]+\/(get|post|create|update|delete|remove)/i;
      if (verbPatterns.test(content)) {
        nonRESTfulCount++;
        issues.medium.push({
          message: `URL contém verbos (anti-padrão REST): ${path.relative(PROJECT_DIR, file)}`,
          location: file,
          type: 'RESTful Principles',
          impact: 'Médio',
          recommendation: 'Usar substantivos e métodos HTTP apropriados'
        });
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  return { issues, summary: `Verificados ${files.length} arquivo(s) para princípios RESTful` };
}

/**
 * Analisa versionamento
 */
function analyzeVersioning() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findAPIFiles(PROJECT_DIR);
  let hasVersioning = false;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar versionamento
      if (/\/v\d+\//.test(content) || /version|v\d+/i.test(content)) {
        hasVersioning = true;
        break;
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  if (!hasVersioning && files.length > 0) {
    issues.high.push({
      message: 'Versionamento de API não encontrado',
      location: PROJECT_DIR,
      type: 'API Versioning',
      impact: 'Médio',
      recommendation: 'Implementar versionamento de API (ex: /api/v1/)'
    });
  }
  
  return { issues, summary: hasVersioning ? 'Versionamento encontrado' : 'Versionamento não encontrado' };
}

/**
 * Analisa documentação de API
 */
function analyzeAPIDocumentation() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Verificar se há documentação de API
  const docFiles = [
    'API.md',
    'api.md',
    'docs/api.md',
    'docs/API.md',
    'README.md'
  ];
  
  let hasAPIDocs = false;
  for (const docFile of docFiles) {
    const docPath = path.join(PROJECT_DIR, docFile);
    if (fs.existsSync(docPath)) {
      try {
        const content = fs.readFileSync(docPath, 'utf-8');
        if (/api|endpoint|route/i.test(content)) {
          hasAPIDocs = true;
          break;
        }
      } catch (error) {
        // Ignorar
      }
    }
  }
  
  if (!hasAPIDocs) {
    issues.high.push({
      message: 'Documentação de API não encontrada',
      location: PROJECT_DIR,
      type: 'API Documentation',
      impact: 'Médio',
      recommendation: 'Criar documentação de API (Swagger/OpenAPI ou Markdown)'
    });
  }
  
  return { issues, summary: hasAPIDocs ? 'Documentação encontrada' : 'Documentação não encontrada' };
}

/**
 * Encontra arquivos de API
 */
function findAPIFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        const name = entry.name.toLowerCase();
        
        // Verificar se é arquivo de API
        if (name.includes('api') || name.includes('route') || name.includes('endpoint') ||
            (['.js', '.ts'].includes(ext) && 
             (name.includes('server') || name.includes('app') || name.includes('router')))) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Calcula score de design de API
 */
function calculateAPIDesignScore(issues) {
  let score = 100;
  
  score -= issues.critical.length * 25;
  score -= issues.high.length * 10;
  score -= issues.medium.length * 5;
  score -= issues.low.length * 2;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Gera recomendações
 */
function generateRecommendations(issues) {
  const recommendations = [];
  
  if (issues.critical.length > 0) {
    recommendations.push('Resolver issues críticos de design de API primeiro');
  }
  
  if (issues.high.length > 0) {
    recommendations.push('Implementar versionamento de API');
    recommendations.push('Criar documentação de API');
  }
  
  if (issues.medium.length > 0) {
    recommendations.push('Seguir princípios RESTful');
    recommendations.push('Usar convenções de nomenclatura consistentes');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Manter padrões de design de API atuais');
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

