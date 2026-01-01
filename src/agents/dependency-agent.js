/**
 * Dependency Management Agent
 * Analisa dependências, verifica vulnerabilidades, sugere atualizações
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
const SHARED_DIR = path.join(__dirname, '../../shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'dependency-management');

/**
 * Executa análise de dependências
 */
export async function runDependencyAnalysis() {
  try {
    ensureDirectories();
    
    const issues = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    // 1. Analisar package.json
    const packageAnalysis = await analyzePackageJson();
    
    // 2. Verificar vulnerabilidades
    const vulnerabilityIssues = await checkVulnerabilities();
    
    // 3. Verificar dependências não utilizadas
    const unusedIssues = await findUnusedDependencies();
    
    // 4. Verificar dependências desatualizadas
    const outdatedIssues = await checkOutdatedDependencies();
    
    // Consolidar issues
    issues.critical.push(...packageAnalysis.critical);
    issues.critical.push(...vulnerabilityIssues.critical);
    issues.high.push(...packageAnalysis.high);
    issues.high.push(...vulnerabilityIssues.high);
    issues.high.push(...outdatedIssues.high);
    issues.medium.push(...packageAnalysis.medium);
    issues.medium.push(...unusedIssues.medium);
    issues.medium.push(...outdatedIssues.medium);
    issues.low.push(...unusedIssues.low);
    
    // Calcular score
    const score = calculateDependencyScore(issues);
    
    return {
      success: true,
      results: {
        issues,
        score,
        packageAnalysis,
        vulnerabilities: vulnerabilityIssues,
        unused: unusedIssues,
        outdated: outdatedIssues,
        recommendations: suggestUpdates(issues)
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
 * Analisa package.json
 */
async function analyzePackageJson() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    issues.critical.push({
      type: 'Dependency',
      message: 'package.json não encontrado',
      location: packageJsonPath,
      severity: 'critical'
    });
    return issues;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Verificar se há dependências
  if (!packageJson.dependencies && !packageJson.devDependencies) {
    issues.critical.push({
      type: 'Dependency',
      message: 'Nenhuma dependência definida no package.json',
      location: packageJsonPath,
      severity: 'critical'
    });
  }
  
  // Verificar se há engines especificados
  if (!packageJson.engines) {
    issues.medium.push({
      type: 'Dependency',
      message: 'Engines não especificados no package.json',
      location: packageJsonPath,
      severity: 'medium'
    });
  }
  
  // Verificar se há scripts importantes
  const requiredScripts = ['build', 'dev', 'start'];
  const scripts = packageJson.scripts || {};
  for (const script of requiredScripts) {
    if (!scripts[script]) {
      issues.medium.push({
        type: 'Dependency',
        message: `Script "${script}" não encontrado no package.json`,
        location: packageJsonPath,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

/**
 * Verifica vulnerabilidades conhecidas
 */
async function checkVulnerabilities() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return issues;
  }
  
  try {
    // Executar npm audit
    const auditResult = execSync('npm audit --json', {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const audit = JSON.parse(auditResult);
    
    if (audit.vulnerabilities) {
      for (const [pkg, vuln] of Object.entries(audit.vulnerabilities)) {
        if (vuln.severity === 'critical') {
          issues.critical.push({
            type: 'Dependency',
            message: `Vulnerabilidade crítica em ${pkg}: ${vuln.title || 'N/A'}`,
            location: packageJsonPath,
            severity: 'critical',
            package: pkg,
            vulnerability: vuln
          });
        } else if (vuln.severity === 'high') {
          issues.high.push({
            type: 'Dependency',
            message: `Vulnerabilidade alta em ${pkg}: ${vuln.title || 'N/A'}`,
            location: packageJsonPath,
            severity: 'high',
            package: pkg
          });
        } else if (vuln.severity === 'moderate') {
          issues.medium.push({
            type: 'Dependency',
            message: `Vulnerabilidade moderada em ${pkg}: ${vuln.title || 'N/A'}`,
            location: packageJsonPath,
            severity: 'medium',
            package: pkg
          });
        }
      }
    }
  } catch (error) {
    // npm audit pode falhar - não é crítico
    issues.low.push({
      type: 'Dependency',
      message: 'Não foi possível executar npm audit',
      location: packageJsonPath,
      severity: 'low'
    });
  }
  
  return issues;
}

/**
 * Encontra dependências não utilizadas
 */
async function findUnusedDependencies() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return issues;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Verificar imports no código
  const srcDir = path.join(PROJECT_DIR, 'src');
  if (!fs.existsSync(srcDir)) {
    return issues;
  }
  
  const files = listFiles(srcDir);
  const allImports = new Set();
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extrair imports
    const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const importPath = match[1];
      // Remover caminhos relativos e pegar nome do pacote
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        const pkgName = importPath.split('/')[0];
        allImports.add(pkgName);
      }
    }
  }
  
  // Verificar dependências não usadas
  for (const [depName, depVersion] of Object.entries(deps)) {
    if (!allImports.has(depName) && !depName.startsWith('@types/')) {
      issues.low.push({
        type: 'Dependency',
        message: `Dependência possivelmente não utilizada: ${depName}`,
        location: packageJsonPath,
        severity: 'low',
        package: depName
      });
    }
  }
  
  return issues;
}

/**
 * Verifica dependências desatualizadas
 */
async function checkOutdatedDependencies() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return issues;
  }
  
  try {
    // Executar npm outdated
    const outdatedResult = execSync('npm outdated --json', {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const outdated = JSON.parse(outdatedResult);
    
    for (const [pkg, info] of Object.entries(outdated)) {
      const current = info.current;
      const wanted = info.wanted;
      const latest = info.latest;
      
      // Se há versão major disponível
      if (current !== latest && latest) {
        const currentMajor = parseInt(current.split('.')[0]);
        const latestMajor = parseInt(latest.split('.')[0]);
        
        if (latestMajor > currentMajor) {
          issues.high.push({
            type: 'Dependency',
            message: `Dependência desatualizada: ${pkg} (${current} → ${latest}) - atualização major disponível`,
            location: packageJsonPath,
            severity: 'high',
            package: pkg,
            current,
            latest
          });
        } else {
          issues.medium.push({
            type: 'Dependency',
            message: `Dependência desatualizada: ${pkg} (${current} → ${latest})`,
            location: packageJsonPath,
            severity: 'medium',
            package: pkg,
            current,
            latest
          });
        }
      }
    }
  } catch (error) {
    // npm outdated pode falhar - não é crítico
    issues.low.push({
      type: 'Dependency',
      message: 'Não foi possível verificar dependências desatualizadas',
      location: packageJsonPath,
      severity: 'low'
    });
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
 * Calcula score de dependências
 */
function calculateDependencyScore(issues) {
  let score = 100;
  score -= issues.critical.length * 20;
  score -= issues.high.length * 10;
  score -= issues.medium.length * 5;
  score -= issues.low.length * 2;
  
  return Math.max(0, score);
}

/**
 * Sugere atualizações
 */
function suggestUpdates(issues) {
  const suggestions = [];
  
  const vulnerabilityIssues = issues.critical.concat(issues.high).filter(i => i.vulnerability);
  if (vulnerabilityIssues.length > 0) {
    suggestions.push({
      priority: 'P0',
      title: 'Atualizar dependências com vulnerabilidades',
      description: `Existem ${vulnerabilityIssues.length} dependências com vulnerabilidades conhecidas`,
      steps: [
        'Executar npm audit fix',
        'Revisar breaking changes',
        'Testar aplicação após atualização',
        'Validar que vulnerabilidades foram resolvidas'
      ]
    });
  }
  
  const outdatedIssues = issues.high.filter(i => i.latest);
  if (outdatedIssues.length > 0) {
    suggestions.push({
      priority: 'P1',
      title: 'Atualizar dependências desatualizadas',
      description: `Existem ${outdatedIssues.length} dependências com atualizações disponíveis`,
      steps: [
        'Revisar changelog de cada dependência',
        'Atualizar uma dependência por vez',
        'Testar após cada atualização',
        'Validar que tudo funciona'
      ]
    });
  }
  
  return suggestions;
}

/**
 * Gera relatório de dependências
 */
export function generateDependencyReport(results, timestamp) {
  let report = `# Dependency Management Report\n\n`;
  report += `**Data:** ${new Date().toISOString()}\n`;
  report += `**Timestamp:** ${timestamp}\n\n`;
  report += `---\n\n`;
  
  report += `## 📊 Resumo Executivo\n\n`;
  report += `- **Score de Dependências:** ${results.score}/100\n`;
  report += `- **Vulnerabilidades Críticas:** ${results.issues.critical.length}\n`;
  report += `- **Vulnerabilidades Alta:** ${results.issues.high.length}\n`;
  report += `- **Dependências Desatualizadas:** ${results.outdated.high.length + results.outdated.medium.length}\n\n`;
  
  if (results.issues.critical.length > 0) {
    report += `## 🚨 Vulnerabilidades Críticas\n\n`;
    results.issues.critical.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.message}\n\n`;
      report += `- **Pacote:** ${issue.package}\n`;
      report += `- **Localização:** \`${issue.location}\`\n\n`;
    });
  }
  
  if (results.recommendations.length > 0) {
    report += `## 💡 Recomendações\n\n`;
    results.recommendations.forEach((rec, idx) => {
      report += `### ${idx + 1}. ${rec.title}\n\n`;
      report += `${rec.description}\n\n`;
      report += `**Passos:**\n`;
      rec.steps.forEach(step => {
        report += `- ${step}\n`;
      });
      report += `\n`;
    });
  }
  
  return report;
}

