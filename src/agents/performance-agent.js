/**
 * Performance Analysis Agent
 * Analisa performance do código, identifica bottlenecks, sugere otimizações
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
const SHARED_DIR = path.join(__dirname, '../../shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'performance-analysis');

/**
 * Executa análise de performance
 */
export async function runPerformanceAnalysis() {
  try {
    ensureDirectories();
    
    const issues = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    // 1. Análise de código (profiling básico)
    const codeIssues = await analyzeCodePerformance();
    
    // 2. Análise de queries
    const queryIssues = await analyzeQueries();
    
    // 3. Análise de bundle
    const bundleIssues = await analyzeBundle();
    
    // 4. Análise de renderização
    const renderIssues = await analyzeRendering();
    
    // Consolidar issues
    issues.critical.push(...codeIssues.critical);
    issues.high.push(...codeIssues.high);
    issues.high.push(...queryIssues.high);
    issues.high.push(...bundleIssues.high);
    issues.high.push(...renderIssues.high);
    
    issues.medium.push(...codeIssues.medium);
    issues.medium.push(...queryIssues.medium);
    issues.medium.push(...bundleIssues.medium);
    issues.medium.push(...renderIssues.medium);
    
    issues.low.push(...codeIssues.low);
    issues.low.push(...queryIssues.low);
    issues.low.push(...bundleIssues.low);
    issues.low.push(...renderIssues.low);
    
    // Calcular score
    const score = calculatePerformanceScore(issues);
    
    return {
      success: true,
      results: {
        issues,
        score,
        codeAnalysis: codeIssues,
        queryAnalysis: queryIssues,
        bundleAnalysis: bundleIssues,
        renderingAnalysis: renderIssues,
        recommendations: generateOptimizations(issues)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Garante que diretórios existem
 */
function ensureDirectories() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

/**
 * Analisa código para problemas de performance
 */
async function analyzeCodePerformance() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const srcDir = path.join(PROJECT_DIR, 'src');
  if (!fs.existsSync(srcDir)) {
    return issues;
  }
  
  const files = listFiles(srcDir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    // Verificar loops aninhados profundos
    let maxNesting = 0;
    let currentNesting = 0;
    for (const line of lines) {
      if (line.match(/for\s*\(|while\s*\(|\.forEach\s*\(|\.map\s*\(/)) {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      }
      if (line.includes('}')) {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }
    
    if (maxNesting > 3) {
      issues.high.push({
        type: 'Performance',
        message: `Loops aninhados profundos (${maxNesting} níveis) em ${path.basename(file)}`,
        location: file,
        severity: 'high'
      });
    }
    
    // Verificar operações síncronas bloqueantes
    if (content.includes('readFileSync') || content.includes('writeFileSync')) {
      issues.medium.push({
        type: 'Performance',
        message: `Operações síncronas bloqueantes em ${path.basename(file)}`,
        location: file,
        severity: 'medium'
      });
    }
    
    // Verificar funções muito grandes
    const functionMatches = content.matchAll(/function\s+\w+\s*\([^)]*\)\s*\{/g);
    for (const match of functionMatches) {
      const funcStart = match.index;
      const funcContent = content.substring(funcStart);
      const funcLines = funcContent.split('\n');
      if (funcLines.length > 100) {
        issues.medium.push({
          type: 'Performance',
          message: `Função muito grande (${funcLines.length} linhas) em ${path.basename(file)}`,
          location: file,
          severity: 'medium'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Analisa queries de banco de dados
 */
async function analyzeQueries() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const srcDir = path.join(PROJECT_DIR, 'src');
  if (!fs.existsSync(srcDir)) {
    return issues;
  }
  
  const files = listFiles(srcDir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Verificar queries dentro de loops (N+1 problem)
    if (content.includes('.get(') || content.includes('.where(')) {
      const lines = content.split('\n');
      let inLoop = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/for\s*\(|while\s*\(|\.forEach\s*\(|\.map\s*\(/)) {
          inLoop = true;
        }
        if (inLoop && (line.includes('.get(') || line.includes('.where('))) {
          issues.high.push({
            type: 'Performance',
            message: `Possível problema N+1: query dentro de loop em ${path.basename(file)} (linha ${i + 1})`,
            location: file,
            severity: 'high'
          });
        }
        if (line.includes('}') && inLoop) {
          inLoop = false;
        }
      }
    }
    
    // Verificar se há uso de índices
    if (content.includes('.where(') && !content.includes('indexOn')) {
      issues.medium.push({
        type: 'Performance',
        message: `Query sem índice explícito em ${path.basename(file)} - verificar se índices estão configurados`,
        location: file,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

/**
 * Analisa tamanho de bundle
 */
async function analyzeBundle() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Verificar package.json para dependências grandes
  const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Dependências conhecidas por serem grandes
    const largeDeps = ['lodash', 'moment', 'jquery', 'bootstrap'];
    for (const dep of largeDeps) {
      if (deps[dep]) {
        issues.medium.push({
          type: 'Performance',
          message: `Dependência grande detectada: ${dep} - considerar alternativas mais leves`,
          location: packageJsonPath,
          severity: 'medium',
          package: dep
        });
      }
    }
  }
  
  // Verificar se há code splitting configurado
  const viteConfigPath = path.join(PROJECT_DIR, 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const config = fs.readFileSync(viteConfigPath, 'utf-8');
    if (!config.includes('splitChunks') && !config.includes('manualChunks')) {
      issues.medium.push({
        type: 'Performance',
        message: 'Code splitting não configurado explicitamente',
        location: viteConfigPath,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

/**
 * Analisa renderização e re-renders
 */
async function analyzeRendering() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const srcDir = path.join(PROJECT_DIR, 'src');
  if (!fs.existsSync(srcDir)) {
    return issues;
  }
  
  const files = listFiles(srcDir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Verificar uso de memoização
    if (content.includes('useState') || content.includes('useEffect')) {
      const hasMemo = content.includes('useMemo') || content.includes('useCallback');
      const hasExpensiveOps = content.includes('.map(') || content.includes('.filter(') || content.includes('.reduce(');
      
      if (hasExpensiveOps && !hasMemo) {
        issues.high.push({
          type: 'Performance',
          message: `Operações custosas sem memoização em ${path.basename(file)}`,
          location: file,
          severity: 'high'
        });
      }
    }
    
    // Verificar se há muitos re-renders potenciais
    const useStateCount = (content.match(/useState/g) || []).length;
    if (useStateCount > 5) {
      issues.medium.push({
        type: 'Performance',
        message: `Muitos estados (${useStateCount}) em ${path.basename(file)} - considerar reducer`,
        location: file,
        severity: 'medium'
      });
    }
    
    // Verificar se há virtualização de listas
    if (content.includes('.map(') && content.includes('return') && !content.includes('react-window') && !content.includes('react-virtualized')) {
      const mapMatches = content.matchAll(/\.map\s*\(/g);
      let mapCount = 0;
      for (const _ of mapMatches) mapCount++;
      
      if (mapCount > 2) {
        issues.low.push({
          type: 'Performance',
          message: `Múltiplas listas renderizadas em ${path.basename(file)} - considerar virtualização`,
          location: file,
          severity: 'low'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Lista arquivos recursivamente
 */
function listFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      listFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Calcula score de performance
 */
function calculatePerformanceScore(issues) {
  let score = 100;
  score -= issues.critical.length * 20;
  score -= issues.high.length * 10;
  score -= issues.medium.length * 5;
  score -= issues.low.length * 2;
  
  return Math.max(0, score);
}

/**
 * Gera otimizações sugeridas
 */
function generateOptimizations(issues) {
  const optimizations = [];
  
  if (issues.high.some(i => i.message.includes('memoização'))) {
    optimizations.push({
      priority: 'P1',
      title: 'Adicionar memoização para operações custosas',
      description: 'Usar useMemo e useCallback para evitar recálculos desnecessários',
      steps: [
        'Identificar operações custosas (map, filter, reduce)',
        'Envolver com useMemo',
        'Envolver funções com useCallback',
        'Testar performance antes/depois'
      ]
    });
  }
  
  if (issues.high.some(i => i.message.includes('N+1'))) {
    optimizations.push({
      priority: 'P1',
      title: 'Resolver problema N+1 em queries',
      description: 'Mover queries para fora de loops ou usar batch queries',
      steps: [
        'Identificar queries dentro de loops',
        'Mover queries para antes do loop',
        'Usar batch queries quando possível',
        'Validar que queries foram otimizadas'
      ]
    });
  }
  
  return optimizations;
}

/**
 * Gera relatório de performance
 */
export function generatePerformanceReport(results, timestamp) {
  let report = `# Performance Analysis Report\n\n`;
  report += `**Data:** ${new Date().toISOString()}\n`;
  report += `**Timestamp:** ${timestamp}\n\n`;
  report += `---\n\n`;
  
  report += `## 📊 Resumo Executivo\n\n`;
  report += `- **Score de Performance:** ${results.score}/100\n`;
  report += `- **Issues Críticos:** ${results.issues.critical.length}\n`;
  report += `- **Issues Alta:** ${results.issues.high.length}\n`;
  report += `- **Issues Média:** ${results.issues.medium.length}\n\n`;
  
  if (results.issues.high.length > 0) {
    report += `## ⚠️ Issues de Alta Prioridade\n\n`;
    results.issues.high.slice(0, 10).forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.message}\n\n`;
      report += `- **Localização:** \`${issue.location}\`\n\n`;
    });
  }
  
  if (results.recommendations.length > 0) {
    report += `## 💡 Otimizações Sugeridas\n\n`;
    results.recommendations.forEach((opt, idx) => {
      report += `### ${idx + 1}. ${opt.title}\n\n`;
      report += `${opt.description}\n\n`;
      report += `**Passos:**\n`;
      opt.steps.forEach(step => {
        report += `- ${step}\n`;
      });
      report += `\n`;
    });
  }
  
  return report;
}

