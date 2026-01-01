/**
 * Testing Coverage Agent
 * Analisa cobertura de testes e qualidade dos testes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from '../../config/project-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar configuração centralizada
const WORKSPACE_ROOT = config.WORKSPACE_ROOT;
const PROJECT_DIR = config.PROJECT_DIR;
const SHARED_DIR = path.join(__dirname, '../shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'testing-coverage');

/**
 * Executa análise de cobertura de testes
 */
export async function runTestingAnalysis() {
  try {
    ensureDirectories();
    
    const issues = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    // 1. Verificar existência de testes
    const testExistence = analyzeTestExistence();
    
    // 2. Analisar cobertura (se disponível)
    const coverage = await analyzeCoverage();
    
    // 3. Analisar qualidade dos testes
    const quality = analyzeTestQuality();
    
    // 4. Identificar áreas sem testes
    const gaps = identifyTestGaps();
    
    // Consolidar issues
    issues.critical.push(...(testExistence.issues?.critical || []));
    issues.critical.push(...(coverage.issues?.critical || []));
    issues.critical.push(...(quality.issues?.critical || []));
    
    issues.high.push(...(testExistence.issues?.high || []));
    issues.high.push(...(coverage.issues?.high || []));
    issues.high.push(...(quality.issues?.high || []));
    issues.high.push(...(gaps.issues?.high || []));
    
    issues.medium.push(...(coverage.issues?.medium || []));
    issues.medium.push(...(quality.issues?.medium || []));
    issues.medium.push(...(gaps.issues?.medium || []));
    
    issues.low.push(...(coverage.issues?.low || []));
    issues.low.push(...(quality.issues?.low || []));
    issues.low.push(...(gaps.issues?.low || []));
    
    // Calcular score
    const score = calculateTestingScore(issues, coverage, testExistence);
    
    // Garantir que summary existe
    const testExistenceSummary = testExistence.summary || 'Análise de existência de testes';
    const coverageSummary = coverage.summary || 'Análise de cobertura';
    const qualitySummary = quality.summary || 'Análise de qualidade';
    const gapsSummary = gaps.summary || 'Análise de gaps';
    
    return {
      success: true,
      results: {
        issues,
        score,
        testExistence: { ...testExistence, summary: testExistenceSummary },
        coverage: { ...coverage, summary: coverageSummary },
        quality: { ...quality, summary: qualitySummary },
        gaps: { ...gaps, summary: gapsSummary },
        recommendations: generateRecommendations(issues, coverage, gaps)
      }
    };
  } catch (error) {
    console.error('Erro na análise de testes:', error);
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
 * Gera relatório de análise de testes
 */
export function generateTestingReport(results, timestamp) {
  const { issues, score, testExistence, coverage, quality, gaps, recommendations } = results;
  
  const report = `# Relatório de Análise de Testes

**Data:** ${timestamp}
**Agente:** Testing Coverage Agent

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

### Existência de Testes
${testExistence.summary || 'N/A'}

### Cobertura de Testes
${coverage.summary || 'N/A'}

### Qualidade dos Testes
${quality.summary || 'N/A'}

### Gaps Identificados
${gaps.summary || 'N/A'}

---

## 💡 Recomendações

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

**Gerado por:** Testing Coverage Agent
**Versão:** 1.0
`;

  return report;
}

/**
 * Verifica existência de testes
 */
function analyzeTestExistence() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Verificar se há diretório de testes
  const testDirs = ['__tests__', 'tests', 'test', 'spec', '__spec__'];
  let hasTestDir = false;
  
  for (const dir of testDirs) {
    const testDir = path.join(PROJECT_DIR, dir);
    if (fs.existsSync(testDir)) {
      hasTestDir = true;
      break;
    }
  }
  
  if (!hasTestDir) {
    issues.critical.push({
      message: 'Diretório de testes não encontrado',
      location: PROJECT_DIR,
      type: 'Test Structure',
      impact: 'Alto',
      recommendation: 'Criar diretório de testes e adicionar testes básicos'
    });
  }
  
  // Verificar se há arquivos de teste
  const testFiles = findTestFiles(PROJECT_DIR);
  if (testFiles.length === 0) {
    issues.critical.push({
      message: 'Nenhum arquivo de teste encontrado',
      location: PROJECT_DIR,
      type: 'Test Coverage',
      impact: 'Alto',
      recommendation: 'Adicionar testes para componentes críticos'
    });
  } else {
    issues.high.push({
      message: `Apenas ${testFiles.length} arquivo(s) de teste encontrado(s)`,
      location: PROJECT_DIR,
      type: 'Test Coverage',
      impact: 'Médio',
      recommendation: 'Aumentar cobertura de testes'
    });
  }
  
  return { issues, summary: `Encontrados ${testFiles.length} arquivo(s) de teste` };
}

/**
 * Analisa cobertura de testes
 */
async function analyzeCoverage() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Tentar executar cobertura se disponível
  let coverageData = null;
  try {
    // Verificar se há configuração de cobertura
    const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.test && scripts.test.includes('coverage')) {
        // Tentar executar cobertura
        try {
          execSync('npm test -- --coverage', { 
            cwd: PROJECT_DIR, 
            stdio: 'ignore',
            timeout: 10000 
          });
          coverageData = { available: true };
        } catch (error) {
          // Cobertura não disponível ou falhou
        }
      }
    }
  } catch (error) {
    // Ignorar erros
  }
  
  if (!coverageData) {
    issues.high.push({
      message: 'Cobertura de testes não configurada ou não disponível',
      location: PROJECT_DIR,
      type: 'Test Coverage',
      impact: 'Médio',
      recommendation: 'Configurar ferramenta de cobertura (Jest, Istanbul, etc.)'
    });
  }
  
  return { issues, summary: coverageData ? 'Cobertura disponível' : 'Cobertura não configurada' };
}

/**
 * Analisa qualidade dos testes
 */
function analyzeTestQuality() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  const testFiles = findTestFiles(PROJECT_DIR);
  
  for (const testFile of testFiles.slice(0, 5)) { // Analisar primeiros 5
    try {
      const content = fs.readFileSync(testFile, 'utf-8');
      
      // Verificar se tem assertions
      if (!content.includes('expect') && !content.includes('assert') && !content.includes('should')) {
        issues.medium.push({
          message: `Arquivo de teste sem assertions: ${path.relative(PROJECT_DIR, testFile)}`,
          location: testFile,
          type: 'Test Quality',
          impact: 'Médio',
          recommendation: 'Adicionar assertions aos testes'
        });
      }
      
      // Verificar se tem setup/teardown
      if (!content.includes('beforeEach') && !content.includes('beforeAll') && !content.includes('setup')) {
        issues.low.push({
          message: `Arquivo de teste sem setup: ${path.relative(PROJECT_DIR, testFile)}`,
          location: testFile,
          type: 'Test Quality',
          impact: 'Baixo',
          recommendation: 'Adicionar setup/teardown apropriado'
        });
      }
    } catch (error) {
      // Ignorar erros de leitura
    }
  }
  
  return { issues, summary: `Analisados ${Math.min(testFiles.length, 5)} arquivo(s) de teste` };
}

/**
 * Identifica gaps de testes
 */
function identifyTestGaps() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Verificar componentes principais sem testes
  const srcDir = path.join(PROJECT_DIR, 'src');
  if (fs.existsSync(srcDir)) {
    const components = findComponents(srcDir);
    const testFiles = findTestFiles(PROJECT_DIR);
    const testedComponents = testFiles.map(f => path.basename(f).replace(/\.(test|spec)\.(js|jsx|ts|tsx)$/, ''));
    
    for (const component of components.slice(0, 10)) {
      const componentName = path.basename(component, path.extname(component));
      if (!testedComponents.some(t => t.includes(componentName))) {
        issues.high.push({
          message: `Componente sem testes: ${path.relative(PROJECT_DIR, component)}`,
          location: component,
          type: 'Test Gap',
          impact: 'Médio',
          recommendation: `Criar teste para ${componentName}`
        });
      }
    }
  }
  
  return { issues, summary: `Identificados ${issues.high.length} componentes sem testes` };
}

/**
 * Encontra arquivos de teste
 */
function findTestFiles(dir) {
  const testFiles = [];
  
  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        const name = path.basename(entry.name, ext);
        if (name.includes('.test') || name.includes('.spec') || 
            entry.name.includes('test') || entry.name.includes('spec')) {
          if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            testFiles.push(fullPath);
          }
        }
      }
    }
  }
  
  walk(dir);
  return testFiles;
}

/**
 * Encontra componentes
 */
function findComponents(dir) {
  const components = [];
  
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
          components.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return components;
}

/**
 * Calcula score de testes
 */
function calculateTestingScore(issues, coverage, testExistence) {
  let score = 100;
  
  // Penalizar por issues críticos
  score -= issues.critical.length * 20;
  
  // Penalizar por issues altos
  score -= issues.high.length * 10;
  
  // Penalizar por issues médios
  score -= issues.medium.length * 5;
  
  // Penalizar por falta de testes
  if (testExistence.issues.critical.length > 0) {
    score -= 30;
  }
  
  // Penalizar por falta de cobertura
  if (coverage.issues.high.length > 0) {
    score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Gera recomendações
 */
function generateRecommendations(issues, coverage, gaps) {
  const recommendations = [];
  
  if (issues.critical.length > 0) {
    recommendations.push('Resolver issues críticos de testes primeiro');
  }
  
  if (coverage.issues.high.length > 0) {
    recommendations.push('Configurar ferramenta de cobertura de testes');
  }
  
  if (gaps.issues.high.length > 0) {
    recommendations.push(`Adicionar testes para ${gaps.issues.high.length} componentes sem cobertura`);
  }
  
  if (issues.high.length > 0) {
    recommendations.push('Melhorar qualidade dos testes existentes');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Manter cobertura de testes atual');
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

