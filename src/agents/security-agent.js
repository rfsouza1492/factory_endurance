/**
 * Security Audit Agent
 * Realiza auditoria profunda de segurança
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
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'security-audit');

/**
 * Executa auditoria de segurança
 */
export async function runSecurityAudit() {
  try {
    ensureDirectories();
    
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
    issues.critical.push(...configIssues.critical);
    issues.critical.push(...depIssues.critical);
    issues.critical.push(...rulesIssues.critical);
    
    issues.high.push(...codeIssues.high);
    issues.high.push(...configIssues.high);
    issues.high.push(...depIssues.high);
    issues.high.push(...rulesIssues.high);
    
    issues.medium.push(...codeIssues.medium);
    issues.medium.push(...configIssues.medium);
    issues.medium.push(...depIssues.medium);
    issues.medium.push(...rulesIssues.medium);
    
    issues.low.push(...codeIssues.low);
    issues.low.push(...configIssues.low);
    issues.low.push(...depIssues.low);
    issues.low.push(...rulesIssues.low);
    
    // Calcular score
    const score = calculateSecurityScore(issues);
    
    return {
      success: true,
      results: {
        issues,
        score,
        codeAnalysis: codeIssues,
        configAnalysis: configIssues,
        dependencyAnalysis: depIssues,
        rulesAnalysis: rulesIssues,
        recommendations: generateRecommendations(issues)
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
 * Analisa código para vulnerabilidades
 */
async function analyzeCodeSecurity() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  const srcDir = path.join(PROJECT_DIR, 'src');
  if (!fs.existsSync(srcDir)) {
    return issues;
  }
  
  // Analisar arquivos JavaScript/JSX
  const files = listFiles(srcDir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Verificar OWASP Top 10
    
    // 1. Injection
    if (content.includes('eval(') || content.includes('Function(')) {
      issues.critical.push({
        type: 'Security',
        message: `Possível vulnerabilidade de injection em ${path.basename(file)}`,
        location: file,
        severity: 'critical'
      });
    }
    
    // 2. Broken Authentication
    if (content.includes('password') && content.includes('===') && !content.includes('hash')) {
      issues.high.push({
        type: 'Security',
        message: `Possível comparação de senha insegura em ${path.basename(file)}`,
        location: file,
        severity: 'high'
      });
    }
    
    // 3. Sensitive Data Exposure
    const sensitivePatterns = [
      /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/i,
      /secret\s*[:=]\s*['"]([^'"]+)['"]/i,
      /password\s*[:=]\s*['"]([^'"]+)['"]/i,
      /token\s*[:=]\s*['"]([^'"]+)['"]/i
    ];
    
    for (const pattern of sensitivePatterns) {
      const matches = content.match(pattern);
      if (matches && matches[1] && !matches[1].includes('YOUR_') && !matches[1].includes('process.env')) {
        issues.critical.push({
          type: 'Security',
          message: `Possível secret hardcoded em ${path.basename(file)}`,
          location: file,
          severity: 'critical'
        });
        break;
      }
    }
    
    // 4. XSS
    if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify')) {
      issues.high.push({
        type: 'Security',
        message: `Uso de dangerouslySetInnerHTML sem sanitização em ${path.basename(file)}`,
        location: file,
        severity: 'high'
      });
    }
    
    // 5. Broken Access Control
    if (content.includes('user.uid') && content.includes('===') && !content.includes('auth.currentUser')) {
      issues.medium.push({
        type: 'Security',
        message: `Possível validação de acesso insegura em ${path.basename(file)}`,
        location: file,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

/**
 * Analisa configurações de segurança
 */
async function analyzeSecurityConfig() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Verificar firebase.json
  const firebaseConfigPath = path.join(PROJECT_DIR, 'firebase.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    
    // Verificar se há configurações de segurança
    if (!config.hosting?.headers) {
      issues.medium.push({
        type: 'Security',
        message: 'Headers de segurança não configurados no firebase.json',
        location: firebaseConfigPath,
        severity: 'medium'
      });
    }
  }
  
  // Verificar variáveis de ambiente
  const envFiles = ['.env', '.env.local', '.env.production'];
  for (const envFile of envFiles) {
    const envPath = path.join(PROJECT_DIR, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      if (content.includes('API_KEY=') && !content.includes('# ')) {
        issues.high.push({
          type: 'Security',
          message: `.env file encontrado - verificar se não está commitado`,
          location: envPath,
          severity: 'high'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Analisa dependências para vulnerabilidades
 */
async function analyzeDependencies() {
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
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          issues.critical.push({
            type: 'Security',
            message: `Vulnerabilidade ${vuln.severity} em ${pkg}: ${vuln.title || 'N/A'}`,
            location: packageJsonPath,
            severity: 'critical',
            package: pkg,
            vulnerability: vuln
          });
        } else if (vuln.severity === 'moderate') {
          issues.high.push({
            type: 'Security',
            message: `Vulnerabilidade moderada em ${pkg}: ${vuln.title || 'N/A'}`,
            location: packageJsonPath,
            severity: 'high',
            package: pkg
          });
        }
      }
    }
  } catch (error) {
    // npm audit pode falhar se não houver vulnerabilidades ou se não estiver em um projeto npm
    issues.medium.push({
      type: 'Security',
      message: 'Não foi possível executar npm audit - verificar manualmente',
      location: packageJsonPath,
      severity: 'medium'
    });
  }
  
  return issues;
}

/**
 * Analisa regras de segurança (Firestore, etc.)
 */
async function analyzeSecurityRules() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  // Verificar firestore.rules
  const rulesPath = path.join(PROJECT_DIR, 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    issues.critical.push({
      type: 'Security',
      message: 'firestore.rules não encontrado - regras de segurança não configuradas',
      location: rulesPath,
      severity: 'critical'
    });
    return issues;
  }
  
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  
  // Verificar se há regras básicas
  if (!rulesContent.includes('match')) {
    issues.critical.push({
      type: 'Security',
      message: 'firestore.rules não contém regras de match - acesso não restrito',
      location: rulesPath,
      severity: 'critical'
    });
  }
  
  // Verificar se há validação de autenticação
  if (!rulesContent.includes('request.auth') && !rulesContent.includes('auth != null')) {
    issues.high.push({
      type: 'Security',
      message: 'firestore.rules pode não estar validando autenticação',
      location: rulesPath,
      severity: 'high'
    });
  }
  
  // Verificar se há validação de ownership
  if (rulesContent.includes('request.resource.data') && !rulesContent.includes('request.auth.uid')) {
    issues.medium.push({
      type: 'Security',
      message: 'firestore.rules pode não estar validando ownership de dados',
      location: rulesPath,
      severity: 'medium'
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
 * Calcula score de segurança
 */
function calculateSecurityScore(issues) {
  let score = 100;
  score -= issues.critical.length * 20;
  score -= issues.high.length * 10;
  score -= issues.medium.length * 5;
  score -= issues.low.length * 2;
  
  return Math.max(0, score);
}

/**
 * Gera recomendações de segurança
 */
function generateRecommendations(issues) {
  const recommendations = [];
  
  if (issues.critical.length > 0) {
    recommendations.push({
      priority: 'P0',
      title: 'Resolver vulnerabilidades críticas',
      description: `Existem ${issues.critical.length} vulnerabilidades críticas que devem ser resolvidas imediatamente`,
      steps: [
        'Revisar cada vulnerabilidade crítica',
        'Aplicar patches ou correções',
        'Re-executar auditoria de segurança',
        'Validar que vulnerabilidades foram resolvidas'
      ]
    });
  }
  
  if (issues.high.length > 0) {
    recommendations.push({
      priority: 'P1',
      title: 'Resolver vulnerabilidades de alta prioridade',
      description: `Existem ${issues.high.length} vulnerabilidades de alta prioridade`,
      steps: [
        'Priorizar vulnerabilidades por impacto',
        'Aplicar correções',
        'Testar funcionalidade após correções'
      ]
    });
  }
  
  return recommendations;
}

/**
 * Gera relatório de segurança
 */
export function generateSecurityReport(results, timestamp) {
  let report = `# Security Audit Report\n\n`;
  report += `**Data:** ${new Date().toISOString()}\n`;
  report += `**Timestamp:** ${timestamp}\n\n`;
  report += `---\n\n`;
  
  report += `## 📊 Resumo Executivo\n\n`;
  report += `- **Score de Segurança:** ${results.score}/100\n`;
  report += `- **Vulnerabilidades Críticas:** ${results.issues.critical.length}\n`;
  report += `- **Vulnerabilidades Alta:** ${results.issues.high.length}\n`;
  report += `- **Vulnerabilidades Média:** ${results.issues.medium.length}\n`;
  report += `- **Vulnerabilidades Baixa:** ${results.issues.low.length}\n\n`;
  
  if (results.issues.critical.length > 0) {
    report += `## 🚨 Vulnerabilidades Críticas (P0)\n\n`;
    results.issues.critical.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.message}\n\n`;
      report += `- **Localização:** \`${issue.location}\`\n`;
      report += `- **Tipo:** ${issue.type}\n`;
      report += `- **Severidade:** ${issue.severity}\n\n`;
    });
  }
  
  if (results.issues.high.length > 0) {
    report += `## ⚠️ Vulnerabilidades Alta Prioridade (P1)\n\n`;
    results.issues.high.slice(0, 10).forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.message}\n\n`;
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

