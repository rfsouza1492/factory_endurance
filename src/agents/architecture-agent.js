/**
 * Architecture Review Agent
 * Analisa arquitetura do sistema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar configuração centralizada do projeto
import config from '../../config/project-config.js';

const WORKSPACE_ROOT = config.WORKSPACE_ROOT;
const PROJECT_DIR = config.PROJECT_DIR;
const KNOWLEDGE_DIR = config.KNOWLEDGE_DIR;

/**
 * Executa análise de arquitetura
 */
export async function runArchitectureReview() {
  const issues = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // 1. Analisar estrutura de arquivos
  const structureAnalysis = analyzeProjectStructure();
  
  // 2. Analisar dependências
  const dependencyAnalysis = analyzeDependencies();
  
  // 3. Analisar organização de código
  const organizationAnalysis = analyzeCodeOrganization();
  
  // 4. Analisar padrões arquiteturais
  const patternsAnalysis = analyzeArchitecturalPatterns();
  
  // 5. Analisar segurança
  const securityAnalysis = analyzeSecurity();
  
  // 6. Analisar performance
  const performanceAnalysis = analyzePerformance();

  // Consolidar issues
  issues.critical.push(...structureAnalysis.critical);
  issues.critical.push(...securityAnalysis.critical);
  issues.high.push(...structureAnalysis.high);
  issues.high.push(...dependencyAnalysis.high);
  issues.high.push(...organizationAnalysis.high);
  issues.high.push(...securityAnalysis.high);
  issues.high.push(...performanceAnalysis.high);
  issues.medium.push(...dependencyAnalysis.medium);
  issues.medium.push(...organizationAnalysis.medium);
  issues.medium.push(...patternsAnalysis.medium);
  issues.medium.push(...performanceAnalysis.medium);
  issues.low.push(...patternsAnalysis.low);

  // Calcular score
  const totalIssues = issues.critical.length + issues.high.length + issues.medium.length + issues.low.length;
  const score = Math.max(0, 100 - (issues.critical.length * 20) - (issues.high.length * 10) - (issues.medium.length * 5) - (issues.low.length * 2));

  return {
    success: true,
    results: {
      structure: structureAnalysis,
      dependencies: dependencyAnalysis,
      organization: organizationAnalysis,
      patterns: patternsAnalysis,
      security: securityAnalysis,
      performance: performanceAnalysis,
      issues,
      score
    }
  };
}

/**
 * Analisa estrutura do projeto
 */
function analyzeProjectStructure() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  try {
    // Usar configuração centralizada do projeto
    const srcDir = PROJECT_DIR ? path.join(PROJECT_DIR, 'src') : null;
    const rootSrcDir = path.join(WORKSPACE_ROOT, 'src');
    
    // Verificar se o projeto Life Goals App está configurado
    if (PROJECT_DIR && fs.existsSync(PROJECT_DIR)) {
      // Projeto está configurado via PROJECT_DIR
      if (!fs.existsSync(srcDir)) {
        issues.critical.push({
          type: 'Structure',
          message: `Diretório src/ não encontrado em ${PROJECT_DIR}`,
          location: PROJECT_DIR,
          severity: 'P0'
        });
      } else {
        // src/ existe, verificar organização
        const files = fs.readdirSync(srcDir, { withFileTypes: true });
        const hasComponents = files.some(f => f.isDirectory() && (f.name === 'components' || f.name === 'Components'));
        
        if (!hasComponents && files.length > 5) {
          issues.high.push({
            type: 'Code Organization',
            message: 'Muitos arquivos na raiz de src/ - considere organizar em subdiretórios (components, hooks, utils)',
            location: path.join(PROJECT_DIR, 'src'),
            severity: 'P1'
          });
        }
      }
    } else if (fs.existsSync(rootSrcDir)) {
      // Projeto pode estar na raiz
      // Não é crítico, apenas informativo
    } else {
      // Não encontrou projeto em nenhum lugar esperado
      issues.critical.push({
        type: 'Structure',
        message: `Estrutura do projeto não encontrada - verificar se está em ${PROJECT_DIR || 'Agents/life-goals-app/'} ou na raiz`,
        location: 'root',
        severity: 'P0'
      });
    }

    // Verificar se há separação clara de responsabilidades no projeto principal
    if (PROJECT_DIR && fs.existsSync(PROJECT_DIR)) {
      const appSrc = path.join(PROJECT_DIR, 'src');
      if (fs.existsSync(appSrc)) {
        const appFiles = fs.readdirSync(appSrc);
        if (appFiles.length > 0 && !appFiles.some(f => f.includes('components') || f.includes('hooks'))) {
          issues.medium.push({
            type: 'Code Organization',
            message: 'Aplicação principal pode se beneficiar de melhor organização (components/, hooks/, utils/)',
            location: path.join(PROJECT_DIR, 'src'),
            severity: 'P2'
          });
        }
      }
    }
  } catch (error) {
    issues.critical.push({
      type: 'Structure',
      message: `Erro ao analisar estrutura: ${error.message}`,
      location: 'root',
      severity: 'P0'
    });
  }

  return issues;
}

/**
 * Analisa dependências
 */
function analyzeDependencies() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  try {
    // Usar configuração centralizada do projeto
    const packageJsonPath = config.PROJECT_PACKAGE_JSON;
    const rootPackageJsonPath = path.join(WORKSPACE_ROOT, 'package.json');
    
    // Priorizar package.json do projeto principal
    const packagePath = fs.existsSync(packageJsonPath) ? packageJsonPath : rootPackageJsonPath;
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Verificar dependências críticas
      const criticalDeps = ['react', 'firebase', 'vite'];
      const missingCritical = criticalDeps.filter(dep => !deps[dep]);
      
      if (missingCritical.length > 0) {
        issues.critical.push({
          type: 'Dependencies',
          message: `Dependências críticas faltando: ${missingCritical.join(', ')}`,
          location: 'package.json',
          severity: 'P0'
        });
      }

      // Verificar versões antigas (exemplo)
      if (deps.react && deps.react.startsWith('^17')) {
        issues.medium.push({
          type: 'Dependencies',
          message: 'React 17 detectado - considere atualizar para React 18',
          location: 'package.json',
          severity: 'P2'
        });
      }
    } else {
      // Verificar se existe em algum lugar
      if (!fs.existsSync(packageJsonPath) && !fs.existsSync(rootPackageJsonPath)) {
        issues.critical.push({
          type: 'Dependencies',
          message: `package.json não encontrado em ${PROJECT_DIR} nem na raiz`,
          location: PROJECT_DIR,
          severity: 'P0'
        });
      } else if (!fs.existsSync(packageJsonPath)) {
        issues.high.push({
          type: 'Dependencies',
          message: `package.json não encontrado em ${PROJECT_DIR} (existe apenas na raiz)`,
          location: PROJECT_DIR,
          severity: 'P1'
        });
      }
    }
  } catch (error) {
    issues.high.push({
      type: 'Dependencies',
      message: `Erro ao analisar dependências: ${error.message}`,
      location: 'package.json',
      severity: 'P1'
    });
  }

  return issues;
}

/**
 * Analisa organização de código
 */
function analyzeCodeOrganization() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  try {
    // Usar configuração centralizada do projeto
    const appDir = PROJECT_DIR ? path.join(PROJECT_DIR, 'src') : null;
    
    if (appDir && fs.existsSync(appDir)) {
      const appJsx = path.join(appDir, 'App.jsx');
      if (fs.existsSync(appJsx)) {
        const content = fs.readFileSync(appJsx, 'utf-8');
        const lines = content.split('\n').length;
        const appJsxRelative = path.relative(WORKSPACE_ROOT, appJsx);
        
        if (lines > 300) {
          issues.critical.push({
            type: 'Code Organization',
            message: `App.jsx muito grande (${lines} linhas) - deve ser dividido em componentes menores`,
            location: appJsxRelative,
            severity: 'P0'
          });
        } else if (lines > 200) {
          issues.high.push({
            type: 'Code Organization',
            message: `App.jsx grande (${lines} linhas) - considere extrair componentes`,
            location: appJsxRelative,
            severity: 'P1'
          });
        }

        // Verificar se há hooks inline que deveriam ser extraídos
        const useEffectCount = (content.match(/useEffect/g) || []).length;
        const useStateCount = (content.match(/useState/g) || []).length;
        
        if (useEffectCount > 3 || useStateCount > 5) {
          issues.high.push({
            type: 'Code Organization',
            message: 'Muitos hooks inline - considere extrair para custom hooks',
            location: appJsxRelative,
            severity: 'P1'
          });
        }
      }
    }
  } catch (error) {
    issues.medium.push({
      type: 'Code Organization',
      message: `Erro ao analisar organização: ${error.message}`,
      location: 'src/',
      severity: 'P2'
    });
  }

  return issues;
}

/**
 * Analisa padrões arquiteturais
 */
function analyzeArchitecturalPatterns() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  try {
    // Usar configuração centralizada do projeto
    const appDir = PROJECT_DIR ? path.join(PROJECT_DIR, 'src') : null;
    
    if (appDir && fs.existsSync(appDir)) {
      const appJsx = path.join(appDir, 'App.jsx');
      if (fs.existsSync(appJsx)) {
        const content = fs.readFileSync(appJsx, 'utf-8');
        const appJsxRelative = path.relative(WORKSPACE_ROOT, appJsx);
        
        // Verificar separação de responsabilidades
        const hasBusinessLogic = content.includes('addGoal') || content.includes('updateGoal');
        const hasUI = content.includes('return') && content.includes('JSX');
        const hasDataFetching = content.includes('onSnapshot') || content.includes('getDoc');
        
        if (hasBusinessLogic && hasUI && hasDataFetching && !content.includes('useGoal') && !content.includes('useAuth')) {
          issues.medium.push({
            type: 'Architectural Patterns',
            message: 'Lógica de negócio, UI e data fetching misturados - considere separar em camadas',
            location: appJsxRelative,
            severity: 'P2'
          });
        }
      }
    }
  } catch (error) {
    // Ignorar erros menores
  }

  return issues;
}

/**
 * Analisa segurança
 */
function analyzeSecurity() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  try {
    // Usar configuração centralizada do projeto
    const rulesPath = config.PROJECT_FIRESTORE_RULES;
    const rootRulesPath = path.join(WORKSPACE_ROOT, 'firestore.rules');
    
    // Verificar no projeto principal primeiro
    if (fs.existsSync(rulesPath)) {
      const rules = fs.readFileSync(rulesPath, 'utf-8');
      const rulesRelative = path.relative(WORKSPACE_ROOT, rulesPath);
      
      if (!rules.includes('request.auth.uid')) {
        issues.critical.push({
          type: 'Security',
          message: 'Firestore rules podem não estar validando autenticação adequadamente',
          location: rulesRelative,
          severity: 'P0'
        });
      }

      if (!rules.includes('activeGoalCount') && !rules.includes('getActiveGoalCount')) {
        issues.high.push({
          type: 'Security',
          message: 'Firestore rules podem não estar validando limite de 3 goals no servidor',
          location: rulesRelative,
          severity: 'P1'
        });
      }
    } else if (fs.existsSync(rootRulesPath)) {
      // Existe na raiz, verificar se está adequado
      const rules = fs.readFileSync(rootRulesPath, 'utf-8');
      if (!rules.includes('request.auth.uid')) {
        issues.high.push({
          type: 'Security',
          message: 'firestore.rules na raiz pode não estar validando autenticação adequadamente',
          location: 'root/firestore.rules',
          severity: 'P1'
        });
      }
    } else {
      issues.critical.push({
        type: 'Security',
        message: `firestore.rules não encontrado em ${PROJECT_DIR} - regras de segurança não configuradas`,
        location: PROJECT_DIR,
        severity: 'P0'
      });
    }

    // Verificar firebase.js para secrets
    const firebasePath = PROJECT_DIR ? path.join(PROJECT_DIR, 'src', 'firebase.js') : null;
    if (fs.existsSync(firebasePath)) {
      const content = fs.readFileSync(firebasePath, 'utf-8');
      
      // Verificar se usa variáveis de ambiente
      const usesEnvVars = content.includes('process.env') || content.includes('import.meta.env');
      
      if (content.includes('apiKey:') && !usesEnvVars) {
        // Verificar se são placeholders ou secrets reais
        const hasPlaceholders = /YOUR_|PLACEHOLDER|EXAMPLE|REPLACE/i.test(content);
        
        const firebaseRelative = path.relative(WORKSPACE_ROOT, firebasePath);
        
        if (hasPlaceholders) {
          // Placeholders - alta prioridade mas não crítico (não bloqueia deploy em dev)
          issues.high.push({
            type: 'Security',
            message: 'Firebase config usa placeholders hardcoded - migrar para variáveis de ambiente antes de deploy em produção',
            location: firebaseRelative,
            severity: 'P1'
          });
        } else {
          // Possíveis secrets reais - crítico
          issues.critical.push({
            type: 'Security',
            message: 'Possíveis secrets hardcoded em firebase.js - usar variáveis de ambiente imediatamente',
            location: firebaseRelative,
            severity: 'P0'
          });
        }
      }
    }
  } catch (error) {
    issues.high.push({
      type: 'Security',
      message: `Erro ao analisar segurança: ${error.message}`,
      location: 'security',
      severity: 'P1'
    });
  }

  return issues;
}

/**
 * Analisa performance
 */
function analyzePerformance() {
  const issues = { critical: [], high: [], medium: [], low: [] };
  
  try {
    // Usar configuração centralizada do projeto
    const appDir = PROJECT_DIR ? path.join(PROJECT_DIR, 'src') : null;
    
    if (appDir && fs.existsSync(appDir)) {
      const appJsx = path.join(appDir, 'App.jsx');
      if (fs.existsSync(appJsx)) {
        const content = fs.readFileSync(appJsx, 'utf-8');
        const appJsxRelative = path.relative(WORKSPACE_ROOT, appJsx);
        
        // Verificar uso de useMemo/useCallback
        const hasExpensiveOps = content.includes('goals.filter') || content.includes('activeGoals.length');
        const hasMemo = content.includes('useMemo');
        const hasCallback = content.includes('useCallback');
        
        if (hasExpensiveOps && !hasMemo && !hasCallback) {
          issues.high.push({
            type: 'Performance',
            message: 'Operações custosas detectadas sem memoização - considere usar useMemo/useCallback',
            location: appJsxRelative,
            severity: 'P1'
          });
        }

        // Verificar queries otimizadas
        if (content.includes('onSnapshot') && !content.includes('where') && !content.includes('limit')) {
          issues.medium.push({
            type: 'Performance',
            message: 'Queries Firestore podem não estar otimizadas - considere adicionar filtros e limites',
            location: appJsxRelative,
            severity: 'P2'
          });
        }
      }
    }
  } catch (error) {
    // Ignorar erros menores
  }

  return issues;
}

/**
 * Gera relatório formatado
 */
export function generateArchitectureReport(reviewResults, timestamp) {
  const { issues, score } = reviewResults;

  const criticalCount = issues.critical.length;
  const highCount = issues.high.length;
  const mediumCount = issues.medium.length;
  const lowCount = issues.low.length;

  let report = `# Resultado do Agente: Architecture Review

**Data:** ${new Date().toISOString()}
**Agente:** Architecture Review
**Status:** ✅ Completo

---

## 📊 Resumo Executivo

**Objetivo da Análise:**
Análise completa da arquitetura do sistema, incluindo estrutura, dependências, organização, padrões, segurança e performance.

**Principais Descobertas:**
- ${criticalCount} issues críticos identificados
- ${highCount} issues de alta prioridade
- ${mediumCount} issues de média prioridade
- ${lowCount} issues de baixa prioridade
- Score arquitetural: ${score}/100

**Score/Status Geral:**
${score >= 90 ? '✅ Excelente' : score >= 75 ? '⚠️ Bom' : score >= 60 ? '⚠️ Regular' : '❌ Precisa Melhorar'}

---

## 🚨 Issues Identificados

### Críticos (P0) - Bloqueadores

`;

  if (criticalCount > 0) {
    report += `| ID | Issue | Localização | Impacto | Esforço |\n`;
    report += `|----|-------|-------------|---------|---------|\n`;
    issues.critical.forEach((issue, idx) => {
      report += `| P0-${idx + 1} | ${issue.message} | ${issue.location} | Alto | ${issue.type === 'Security' ? 'Alto' : 'Médio'} |\n`;
    });
    report += `\n**Detalhes:**\n\n`;
    issues.critical.forEach((issue, idx) => {
      report += `- **P0-${idx + 1}**: ${issue.message}\n`;
      report += `  - **Localização**: ${issue.location}\n`;
      report += `  - **Tipo**: ${issue.type}\n\n`;
    });
  } else {
    report += `Nenhum issue crítico identificado. ✅\n\n`;
  }

  report += `### Alta Prioridade (P1) - Importantes\n\n`;

  if (highCount > 0) {
    report += `| ID | Issue | Localização | Impacto | Esforço |\n`;
    report += `|----|-------|-------------|---------|---------|\n`;
    issues.high.slice(0, 10).forEach((issue, idx) => {
      report += `| P1-${idx + 1} | ${issue.message} | ${issue.location} | Médio | Baixo |\n`;
    });
    if (highCount > 10) {
      report += `\n*... e mais ${highCount - 10} issues de alta prioridade*\n\n`;
    }
  } else {
    report += `Nenhum issue de alta prioridade identificado. ✅\n\n`;
  }

  report += `## 💡 Recomendações\n\n`;

  if (criticalCount > 0) {
    report += `### Imediatas (P0)\n\n`;
    report += `1. **Resolver Issues Críticos de Arquitetura**\n`;
    report += `   - **O que fazer**: Corrigir os ${criticalCount} issues críticos identificados\n`;
    report += `   - **Por que**: Issues críticos podem comprometer segurança, estrutura ou funcionalidade\n`;
    report += `   - **Esforço**: Alto\n\n`;
  }

  if (highCount > 0) {
    report += `### Curto Prazo (P1)\n\n`;
    report += `1. **Melhorar Organização e Padrões**\n`;
    report += `   - **O que fazer**: Revisar e implementar melhorias nos ${highCount} issues de alta prioridade\n`;
    report += `   - **Por que**: Melhoram significativamente a arquitetura e manutenibilidade\n`;
    report += `   - **Esforço**: Médio\n\n`;
  }

  report += `## 📈 Métricas e Scores\n\n`;
  report += `- **Score Arquitetural**: ${score}/100\n`;
  report += `- **Total de Issues**: ${criticalCount + highCount + mediumCount + lowCount}\n`;
  report += `  - Críticos (P0): ${criticalCount}\n`;
  report += `  - Alta (P1): ${highCount}\n`;
  report += `  - Média (P2): ${mediumCount}\n`;
  report += `  - Baixa (P3): ${lowCount}\n\n`;

  report += `**Gerado por:** Architecture Review Agent\n`;

  return report;
}

