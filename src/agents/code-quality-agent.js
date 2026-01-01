/**
 * Code Quality Review Agent
 * Executa avaliação de qualidade de código usando evaluate-code-quality.js
 */

import { execSync, spawn } from 'child_process';
import { promisify } from 'util';
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

/**
 * Executa avaliação de qualidade de código
 */
export async function runCodeQualityEvaluation() {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    
    // Usar spawn para capturar output mesmo quando exit code é 1
    // evaluate-code-quality.js deve estar no diretório do projeto
    const evaluateScriptPath = path.join(PROJECT_DIR, 'evaluate-code-quality.js');
    const evaluateScript = fs.existsSync(evaluateScriptPath) 
      ? evaluateScriptPath 
      : path.join(WORKSPACE_ROOT, 'evaluate-code-quality.js');
    
    const process = spawn('node', [evaluateScript], {
      cwd: PROJECT_DIR,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      // Combinar stdout e stderr (o script pode usar ambos)
      const fullOutput = output + errorOutput;
      
      // Parse do output para extrair informações
      const results = parseEvaluationOutput(fullOutput);

      // Exit code 1 é esperado quando há issues, mas ainda temos resultados válidos
      const hasValidResults = results.summary.totalFiles > 0 || results.score > 0;

      resolve({
        success: hasValidResults || code === 0,
        results,
        rawOutput: fullOutput,
        exitCode: code
      });
    });

    process.on('error', (error) => {
      resolve({
        success: false,
        results: parseEvaluationOutput(''),
        rawOutput: error.message,
        error: error.message
      });
    });
  });
}

/**
 * Parse do output do evaluate-code-quality.js
 */
function parseEvaluationOutput(output) {
  const lines = output.split('\n');
  
  // Extrair informações do summary - o formato real é:
  // Total Files: X
  // Files Passed: X
  // Files with Warnings: X
  // Files with Errors: X
  // Overall Score: X%
  // Total Issues: X
  
  const summary = {
    totalFiles: extractNumber(lines, 'Total Files:'),
    passed: extractNumber(lines, 'Files Passed:'),
    warnings: extractNumber(lines, 'Files with Warnings:'),
    failed: extractNumber(lines, 'Files with Errors:'),
    score: 0,
    totalIssues: extractNumber(lines, 'Total Issues:')
  };
  
  // Extrair score - formato: "Overall Score:   91%"
  let score = 0;
  const scoreLine = lines.find(line => line.includes('Overall Score:'));
  if (scoreLine) {
    // Padrão: "Overall Score:   91%" ou "Overall Score: 91%"
    const scoreMatch = scoreLine.match(/Overall Score:\s*(\d+)%/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
    } else {
      // Tentar sem porcentagem
      const numMatch = scoreLine.match(/Overall Score:\s*(\d+)/i);
      if (numMatch) score = parseInt(numMatch[1]);
    }
  }
  
  // Fallback: tentar no output completo
  if (score === 0) {
    const scoreMatch = output.match(/Overall Score:\s*(\d+)%/i);
    if (scoreMatch) score = parseInt(scoreMatch[1]);
  }
  
  // Se ainda não conseguiu, calcular baseado em arquivos avaliados
  if (score === 0 && summary.totalFiles > 0) {
    // Calcular score baseado em passed/total (aproximação)
    const passRate = summary.passed / summary.totalFiles;
    // Penalizar por warnings e errors
    const warningPenalty = (summary.warnings / summary.totalFiles) * 0.1;
    const errorPenalty = (summary.failed / summary.totalFiles) * 0.3;
    score = Math.max(0, Math.round((passRate * 100) - (warningPenalty * 100) - (errorPenalty * 100)));
  }
  
  summary.score = score;

  // Extrair issues críticos (errors)
  const criticalIssues = [];
  const highPriorityIssues = [];
  const mediumPriorityIssues = [];
  const lowPriorityIssues = [];

  let currentFile = null;
  let inFileSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início de seção de arquivo
    if (line.includes('FAIL') || line.includes('WARN') || line.includes('PASS')) {
      inFileSection = true;
      const fileMatch = line.match(/\[(.*?)\]/);
      if (fileMatch) {
        currentFile = fileMatch[1];
      }
    }

    // Extrair errors
    if (line.includes('❌ [Line') && currentFile) {
      const issue = extractIssue(line, 'error', currentFile);
      if (issue) {
        criticalIssues.push(issue);
      }
    }

    // Extrair warnings
    if (line.includes('⚠️  [Line') && currentFile) {
      const issue = extractIssue(line, 'warning', currentFile);
      if (issue) {
        // Classificar warnings por tipo
        if (issue.type.includes('CRITICAL') || issue.type.includes('Security')) {
          highPriorityIssues.push(issue);
        } else if (issue.type.includes('Business Logic')) {
          highPriorityIssues.push(issue);
        } else {
          mediumPriorityIssues.push(issue);
        }
      }
    }
  }

  return {
    summary,
    issues: {
      critical: criticalIssues,
      high: highPriorityIssues,
      medium: mediumPriorityIssues,
      low: lowPriorityIssues
    },
    score: summary.score || 0
  };
}

function extractNumber(lines, pattern) {
  for (const line of lines) {
    if (line.includes(pattern)) {
      // Padrão: "Total Files:     13" ou "Overall Score:   91%"
      // Tentar padrão com dois pontos e espaços
      const colonMatch = line.match(/:\s+(\d+)/);
      if (colonMatch) return parseInt(colonMatch[1]);
      
      // Tentar padrão simples
      const match = line.match(/(\d+)/);
      if (match) return parseInt(match[1]);
    }
  }
  return 0;
}

function extractIssue(line, severity, file) {
  const match = line.match(/\[Line (\d+)\]\s*(.+?):\s*(.+)/);
  if (match) {
    return {
      file,
      line: parseInt(match[1]),
      type: match[2],
      message: match[3],
      severity: severity === 'error' ? 'P0' : 'P1'
    };
  }
  return null;
}

/**
 * Gera relatório formatado usando template
 */
export function generateCodeQualityReport(evaluationResults, timestamp) {
  const { summary, issues, score } = evaluationResults;

  const criticalCount = issues.critical.length;
  const highCount = issues.high.length;
  const mediumCount = issues.medium.length;
  const lowCount = issues.low.length;

  let report = `# Resultado do Agente: Code Quality Review

**Data:** ${new Date().toISOString()}
**Agente:** Code Quality Review
**Status:** ✅ Completo

---

## 📊 Resumo Executivo

**Objetivo da Análise:**
Avaliação completa da qualidade do código contra o Gold Standard definido em CODE_QUALITY_STANDARD.md

**Principais Descobertas:**
- ${summary.totalFiles} arquivo(s) analisado(s)
- ${summary.passed} arquivo(s) passaram sem issues
- ${summary.failed} arquivo(s) com erros críticos
- ${summary.warnings} arquivo(s) com warnings
- Score geral: ${score}%

**Score/Status Geral:**
${score >= 90 ? '✅ Excelente (90-100%)' : score >= 75 ? '⚠️ Bom (75-89%)' : score >= 60 ? '⚠️ Regular (60-74%)' : '❌ Precisa Melhorar (<60%)'}

---

## 🚨 Issues Identificados

### Críticos (P0) - Bloqueadores

`;

  if (criticalCount > 0) {
    report += `| ID | Issue | Localização | Impacto | Esforço |\n`;
    report += `|----|-------|-------------|---------|---------|\n`;
    issues.critical.forEach((issue, idx) => {
      report += `| P0-${idx + 1} | ${issue.message} | ${issue.file}:${issue.line} | Alto | Médio |\n`;
    });
    report += `\n**Detalhes:**\n\n`;
    issues.critical.forEach((issue, idx) => {
      report += `- **P0-${idx + 1}**: ${issue.message}\n`;
      report += `  - **Localização**: ${issue.file}:${issue.line}\n`;
      report += `  - **Tipo**: ${issue.type}\n`;
      report += `  - **Severidade**: Crítica (P0)\n\n`;
    });
  } else {
    report += `Nenhum issue crítico identificado. ✅\n\n`;
  }

  report += `### Alta Prioridade (P1) - Importantes\n\n`;

  if (highCount > 0) {
    report += `| ID | Issue | Localização | Impacto | Esforço |\n`;
    report += `|----|-------|-------------|---------|---------|\n`;
    issues.high.forEach((issue, idx) => {
      report += `| P1-${idx + 1} | ${issue.message} | ${issue.file}:${issue.line} | Médio | Baixo |\n`;
    });
    report += `\n**Detalhes:**\n\n`;
    issues.high.slice(0, 10).forEach((issue, idx) => {
      report += `- **P1-${idx + 1}**: ${issue.message}\n`;
      report += `  - **Localização**: ${issue.file}:${issue.line}\n\n`;
    });
    if (highCount > 10) {
      report += `\n*... e mais ${highCount - 10} issues de alta prioridade*\n\n`;
    }
  } else {
    report += `Nenhum issue de alta prioridade identificado. ✅\n\n`;
  }

  report += `### Média Prioridade (P2) - Melhorias\n\n`;
  report += `${mediumCount} issues de média prioridade identificados.\n\n`;

  report += `### Baixa Prioridade (P3) - Futuro\n\n`;
  report += `${lowCount} issues de baixa prioridade identificados.\n\n`;

  report += `## 💡 Recomendações\n\n`;

  if (criticalCount > 0) {
    report += `### Imediatas (P0)\n\n`;
    report += `1. **Corrigir Issues Críticos**\n`;
    report += `   - **O que fazer**: Resolver todos os ${criticalCount} issues críticos identificados\n`;
    report += `   - **Por que**: Issues críticos bloqueiam qualidade e podem causar problemas em produção\n`;
    report += `   - **Esforço**: Alto\n\n`;
  }

  if (highCount > 0) {
    report += `### Curto Prazo (P1)\n\n`;
    report += `1. **Resolver Issues de Alta Prioridade**\n`;
    report += `   - **O que fazer**: Revisar e corrigir os ${highCount} issues de alta prioridade\n`;
    report += `   - **Por que**: Melhoram significativamente a qualidade do código\n`;
    report += `   - **Esforço**: Médio\n\n`;
  }

  if (score < 75) {
    report += `### Melhorias Gerais\n\n`;
    report += `1. **Melhorar Score Geral**\n`;
    report += `   - **Score Atual**: ${score}%\n`;
    report += `   - **Meta**: 90%+\n`;
    report += `   - **Ações**: Revisar e corrigir issues identificados\n\n`;
  }

  report += `## 📈 Métricas e Scores\n\n`;
  report += `### Scores por Categoria\n\n`;
  report += `| Categoria | Score | Status |\n`;
  report += `|-----------|-------|--------|\n`;
  report += `| Qualidade Geral | ${score}/100 | ${score >= 90 ? '✅' : score >= 75 ? '⚠️' : '❌'} |\n`;
  report += `| Arquivos Sem Issues | ${Math.round((summary.passed / summary.totalFiles) * 100)}% | ${summary.passed === summary.totalFiles ? '✅' : '⚠️'} |\n\n`;

  report += `### Métricas Gerais\n\n`;
  report += `- **Total de Issues**: ${summary.totalIssues}\n`;
  report += `  - Críticos (P0): ${criticalCount}\n`;
  report += `  - Alta (P1): ${highCount}\n`;
  report += `  - Média (P2): ${mediumCount}\n`;
  report += `  - Baixa (P3): ${lowCount}\n\n`;
  report += `- **Score Geral**: ${score}/100\n\n`;

  report += `**Gerado por:** Code Quality Review Agent\n`;
  report += `**Próxima Revisão Sugerida:** Após correções\n`;

  return report;
}

