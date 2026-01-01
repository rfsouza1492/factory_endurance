/**
 * Accessibility Audit Agent
 * Analisa acessibilidade do código e interface
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
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'accessibility-audit');

/**
 * Executa auditoria de acessibilidade
 */
export async function runAccessibilityAudit() {
  try {
    ensureDirectories();
    
    const issues = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    // 1. Análise de ARIA labels
    const ariaAnalysis = analyzeARIA();
    
    // 2. Análise de contraste de cores
    const contrastAnalysis = analyzeColorContrast();
    
    // 3. Análise de navegação por teclado
    const keyboardAnalysis = analyzeKeyboardNavigation();
    
    // 4. Análise de semântica HTML
    const semanticsAnalysis = analyzeHTMLSemantics();
    
    // Consolidar issues
    issues.critical.push(...(ariaAnalysis.issues?.critical || []));
    issues.critical.push(...(keyboardAnalysis.issues?.critical || []));
    
    issues.high.push(...(ariaAnalysis.issues?.high || []));
    issues.high.push(...(contrastAnalysis.issues?.high || []));
    issues.high.push(...(keyboardAnalysis.issues?.high || []));
    issues.high.push(...(semanticsAnalysis.issues?.high || []));
    
    issues.medium.push(...(contrastAnalysis.issues?.medium || []));
    issues.medium.push(...(keyboardAnalysis.issues?.medium || []));
    issues.medium.push(...(semanticsAnalysis.issues?.medium || []));
    
    issues.low.push(...(contrastAnalysis.issues?.low || []));
    issues.low.push(...(semanticsAnalysis.issues?.low || []));
    
    // Calcular score
    const score = calculateAccessibilityScore(issues);
    
    // Garantir que summary existe
    const ariaSummary = ariaAnalysis.summary || 'Análise de ARIA';
    const contrastSummary = contrastAnalysis.summary || 'Análise de contraste';
    const keyboardSummary = keyboardAnalysis.summary || 'Análise de navegação por teclado';
    const semanticsSummary = semanticsAnalysis.summary || 'Análise de semântica HTML';
    
    return {
      success: true,
      results: {
        issues,
        score,
        ariaAnalysis: { ...ariaAnalysis, summary: ariaSummary },
        contrastAnalysis: { ...contrastAnalysis, summary: contrastSummary },
        keyboardAnalysis: { ...keyboardAnalysis, summary: keyboardSummary },
        semanticsAnalysis: { ...semanticsAnalysis, summary: semanticsSummary },
        recommendations: generateRecommendations(issues)
      }
    };
  } catch (error) {
    console.error('Erro na auditoria de acessibilidade:', error);
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
 * Gera relatório de acessibilidade
 */
export function generateAccessibilityReport(results, timestamp) {
  const { issues, score, ariaAnalysis, contrastAnalysis, keyboardAnalysis, semanticsAnalysis, recommendations } = results;
  
  const report = `# Relatório de Auditoria de Acessibilidade

**Data:** ${timestamp}
**Agente:** Accessibility Audit Agent

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

### Análise de ARIA
${ariaAnalysis.summary || 'N/A'}

### Análise de Contraste
${contrastAnalysis.summary || 'N/A'}

### Análise de Navegação por Teclado
${keyboardAnalysis.summary || 'N/A'}

### Análise de Semântica HTML
${semanticsAnalysis.summary || 'N/A'}

---

## 💡 Recomendações

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

**Gerado por:** Accessibility Audit Agent
**Versão:** 1.0
`;

  return report;
}

/**
 * Analisa uso de ARIA labels
 */
function analyzeARIA() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findReactFiles(PROJECT_DIR);
  let ariaCount = 0;
  let missingAria = 0;
  
  for (const file of files.slice(0, 20)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar se tem elementos interativos
      const hasInteractive = /<button|<input|<select|<textarea|<a\s+[^>]*href/i.test(content);
      
      if (hasInteractive) {
        // Verificar se tem ARIA labels
        const hasAria = /aria-label|aria-labelledby|aria-describedby/i.test(content);
        
        if (hasAria) {
          ariaCount++;
        } else {
          missingAria++;
          
          // Verificar se tem texto alternativo
          const hasAltText = /alt=|children|>{[^<]*}/.test(content);
          
          if (!hasAltText) {
            issues.high.push({
              message: `Elemento interativo sem ARIA label: ${path.relative(PROJECT_DIR, file)}`,
              location: file,
              type: 'ARIA',
              impact: 'Médio',
              recommendation: 'Adicionar aria-label ou aria-labelledby'
            });
          }
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  if (missingAria > ariaCount) {
    issues.medium.push({
      message: `Muitos elementos interativos sem ARIA labels (${missingAria} de ${ariaCount + missingAria})`,
      location: PROJECT_DIR,
      type: 'ARIA Coverage',
      impact: 'Médio',
      recommendation: 'Adicionar ARIA labels a elementos interativos'
    });
  }
  
  return { issues, summary: `Analisados ${files.length} arquivo(s), ${ariaCount} com ARIA, ${missingAria} sem` };
}

/**
 * Analisa contraste de cores
 */
function analyzeColorContrast() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findReactFiles(PROJECT_DIR);
  let hardcodedColors = 0;
  
  for (const file of files.slice(0, 20)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar cores hardcoded (simplificado)
      const colorMatches = content.match(/#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g);
      if (colorMatches && colorMatches.length > 5) {
        hardcodedColors++;
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  if (hardcodedColors > 0) {
    issues.medium.push({
      message: `${hardcodedColors} arquivo(s) com cores hardcoded (pode afetar contraste)`,
      location: PROJECT_DIR,
      type: 'Color Contrast',
      impact: 'Médio',
      recommendation: 'Usar sistema de design com contraste validado'
    });
  }
  
  return { issues, summary: `Verificados ${files.length} arquivo(s) para contraste` };
}

/**
 * Analisa navegação por teclado
 */
function analyzeKeyboardNavigation() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findReactFiles(PROJECT_DIR);
  let missingTabIndex = 0;
  let missingOnKeyDown = 0;
  
  for (const file of files.slice(0, 20)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar elementos customizados interativos
      const customInteractive = /<div[^>]*onClick|<span[^>]*onClick/i.test(content);
      
      if (customInteractive) {
        // Verificar se tem tabIndex
        const hasTabIndex = /tabIndex/i.test(content);
        const hasOnKeyDown = /onKeyDown|onKeyPress/i.test(content);
        
        if (!hasTabIndex) {
          missingTabIndex++;
        }
        
        if (!hasOnKeyDown) {
          missingOnKeyDown++;
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  if (missingTabIndex > 0) {
    issues.high.push({
      message: `${missingTabIndex} elemento(s) interativo(s) sem tabIndex`,
      location: PROJECT_DIR,
      type: 'Keyboard Navigation',
      impact: 'Médio',
      recommendation: 'Adicionar tabIndex={0} a elementos interativos customizados'
    });
  }
  
  if (missingOnKeyDown > 0) {
    issues.medium.push({
      message: `${missingOnKeyDown} elemento(s) interativo(s) sem handler de teclado`,
      location: PROJECT_DIR,
      type: 'Keyboard Navigation',
      impact: 'Médio',
      recommendation: 'Adicionar onKeyDown para suporte a teclado'
    });
  }
  
  return { issues, summary: `Verificados ${files.length} arquivo(s) para navegação por teclado` };
}

/**
 * Analisa semântica HTML
 */
function analyzeHTMLSemantics() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const files = findReactFiles(PROJECT_DIR);
  let divOveruse = 0;
  
  for (const file of files.slice(0, 20)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Verificar uso excessivo de divs
      const divCount = (content.match(/<div/g) || []).length;
      const semanticCount = (content.match(/<header|<nav|<main|<section|<article|<aside|<footer|<button|<input|<form/g) || []).length;
      
      if (divCount > semanticCount * 2) {
        divOveruse++;
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  if (divOveruse > 0) {
    issues.medium.push({
      message: `${divOveruse} arquivo(s) com uso excessivo de divs em vez de elementos semânticos`,
      location: PROJECT_DIR,
      type: 'HTML Semantics',
      impact: 'Médio',
      recommendation: 'Usar elementos semânticos (header, nav, main, section, etc.)'
    });
  }
  
  return { issues, summary: `Verificados ${files.length} arquivo(s) para semântica HTML` };
}

/**
 * Encontra arquivos React
 */
function findReactFiles(dir) {
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
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Calcula score de acessibilidade
 */
function calculateAccessibilityScore(issues) {
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
    recommendations.push('Resolver issues críticos de acessibilidade primeiro');
  }
  
  if (issues.high.length > 0) {
    recommendations.push(`Adicionar ARIA labels a ${issues.high.length} elemento(s)`);
  }
  
  if (issues.medium.length > 0) {
    recommendations.push('Melhorar navegação por teclado');
    recommendations.push('Usar elementos semânticos HTML');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Manter padrões de acessibilidade atuais');
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

