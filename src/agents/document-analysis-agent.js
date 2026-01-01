/**
 * Document Analysis Agent
 * Analisa documentação do projeto
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
const KNOWLEDGE_DIR = config.KNOWLEDGE_DIR;
const ROADMAP_PATH = config.ROADMAP_PATH;
const BACKLOG_PATH = config.BACKLOG_PATH;

/**
 * Executa análise de documentação
 */
export async function runDocumentAnalysis() {
  const issues = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  const documents = {
    found: [],
    missing: [],
    outdated: []
  };

  // 1. Inventariar documentos
  const inventory = inventoryDocuments();
  documents.found = inventory.found;
  documents.missing = inventory.missing;

  // 2. Analisar qualidade da documentação
  const qualityAnalysis = analyzeDocumentQuality(inventory.found);
  issues.critical.push(...qualityAnalysis.critical);
  issues.high.push(...qualityAnalysis.high);
  issues.medium.push(...qualityAnalysis.medium);

  // 3. Analisar gaps de documentação
  const gapsAnalysis = analyzeDocumentationGaps();
  issues.high.push(...gapsAnalysis.high);
  issues.medium.push(...gapsAnalysis.medium);
  issues.low.push(...gapsAnalysis.low);

  // 4. Analisar consistência
  const consistencyAnalysis = analyzeConsistency(inventory.found);
  issues.medium.push(...consistencyAnalysis.medium);
  issues.low.push(...consistencyAnalysis.low);

  // Calcular score
  const totalIssues = issues.critical.length + issues.high.length + issues.medium.length + issues.low.length;
  const score = Math.max(0, 100 - (issues.critical.length * 25) - (issues.high.length * 10) - (issues.medium.length * 5) - (issues.low.length * 2));

  return {
    success: true,
    results: {
      documents,
      quality: qualityAnalysis,
      gaps: gapsAnalysis,
      consistency: consistencyAnalysis,
      issues,
      score
    }
  };
}

/**
 * Inventaria documentos do projeto
 */
function inventoryDocuments() {
  const found = [];
  const missing = [];

  // Verificar documentos no projeto principal e na raiz
  const lifeGoalsAppDir = PROJECT_DIR;
  
  const expectedDocs = [
    // Documentos críticos - verificar no projeto principal primeiro
    { name: 'README.md (projeto)', path: path.relative(WORKSPACE_ROOT, path.join(PROJECT_DIR, 'README.md')), critical: true, project: 'life-goals-app' },
    { name: 'README.md (raiz)', path: 'README.md', critical: false, project: 'root' },
    { name: 'package.json (projeto)', path: path.relative(WORKSPACE_ROOT, config.PROJECT_PACKAGE_JSON), critical: true, project: 'life-goals-app' },
    { name: 'package.json (raiz)', path: 'package.json', critical: false, project: 'root' },
    // Documentos de conhecimento
    { name: 'Architecture Review', path: 'knowledge/architecture/ARCHITECTURE_REVIEW.md', critical: false, project: 'knowledge' },
    { name: 'Code Quality Standard', path: 'knowledge/quality/CODE_QUALITY_STANDARD.md', critical: false, project: 'knowledge' },
    { name: 'Roadmap', path: 'knowledge/product/ROADMAP.md', critical: false, project: 'knowledge' },
    { name: 'Backlog', path: 'knowledge/product/BACKLOG.md', critical: false, project: 'knowledge' },
    { name: 'Build Summary', path: 'knowledge/implementation/BUILD_SUMMARY.md', critical: false, project: 'knowledge' },
    { name: 'Deploy Guide', path: 'knowledge/implementation/DEPLOY.md', critical: false, project: 'knowledge' }
  ];

  expectedDocs.forEach(doc => {
    const fullPath = path.join(WORKSPACE_ROOT, doc.path);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      found.push({
        name: doc.name,
        path: doc.path,
        critical: doc.critical,
        size: stats.size,
        modified: stats.mtime
      });
    } else {
      // Para documentos críticos, verificar se existe em outro local
      if (doc.critical) {
        // Se é README.md do projeto, verificar se existe na raiz
        if (doc.name.includes('README.md') && doc.project === 'life-goals-app') {
          const rootReadme = path.join(WORKSPACE_ROOT, 'README.md');
          if (fs.existsSync(rootReadme)) {
            // Existe na raiz, não é crítico mas pode ser informativo
            found.push({
              name: 'README.md (raiz)',
              path: 'README.md',
              critical: false,
              size: fs.statSync(rootReadme).size,
              modified: fs.statSync(rootReadme).mtime
            });
          } else {
            missing.push({
              name: doc.name,
              path: doc.path,
              critical: true
            });
          }
        } else if (doc.name.includes('package.json') && doc.project === 'life-goals-app') {
          // Se é package.json do projeto, verificar se existe na raiz
          const rootPackage = path.join(WORKSPACE_ROOT, 'package.json');
          if (fs.existsSync(rootPackage)) {
            // Existe na raiz, não é crítico mas pode ser informativo
            found.push({
              name: 'package.json (raiz)',
              path: 'package.json',
              critical: false,
              size: fs.statSync(rootPackage).size,
              modified: fs.statSync(rootPackage).mtime
            });
          } else {
            missing.push({
              name: doc.name,
              path: doc.path,
              critical: true
            });
          }
        } else {
          missing.push({
            name: doc.name,
            path: doc.path,
            critical: true
          });
        }
      }
    }
  });

  return { found, missing };
}

/**
 * Analisa qualidade da documentação
 */
function analyzeDocumentQuality(documents) {
  const issues = { critical: [], high: [], medium: [], low: [] };

  documents.forEach(doc => {
    try {
      // Se o path é relativo, usar WORKSPACE_ROOT, senão usar path absoluto
      const fullPath = path.isAbsolute(doc.path) ? doc.path : path.join(WORKSPACE_ROOT, doc.path);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n').length;

      // Verificar se documento está vazio ou muito pequeno
      if (doc.critical && lines < 10) {
        issues.critical.push({
          type: 'Document Quality',
          message: `${doc.name} está muito curto ou vazio (${lines} linhas)`,
          location: doc.path,
          severity: 'P0'
        });
      } else if (doc.critical && lines < 50) {
        issues.high.push({
          type: 'Document Quality',
          message: `${doc.name} pode estar incompleto (${lines} linhas)`,
          location: doc.path,
          severity: 'P1'
        });
      }

      // Verificar se tem estrutura básica
      if (doc.critical && !content.includes('#') && !content.includes('##')) {
        issues.high.push({
          type: 'Document Quality',
          message: `${doc.name} não tem estrutura clara (falta headings)`,
          location: doc.path,
          severity: 'P1'
        });
      }

      // Verificar se README tem informações essenciais
      if (doc.name === 'README.md') {
        const hasInstall = content.toLowerCase().includes('install') || content.toLowerCase().includes('setup');
        const hasUsage = content.toLowerCase().includes('usage') || content.toLowerCase().includes('como usar');
        
        if (!hasInstall && !hasUsage) {
          issues.medium.push({
            type: 'Document Quality',
            message: 'README.md pode estar faltando seções de instalação/uso',
            location: doc.path,
            severity: 'P2'
          });
        }
      }
    } catch (error) {
      issues.medium.push({
        type: 'Document Quality',
        message: `Erro ao analisar ${doc.name}: ${error.message}`,
        location: doc.path,
        severity: 'P2'
      });
    }
  });

  return issues;
}

/**
 * Analisa gaps de documentação
 */
function analyzeDocumentationGaps() {
  const issues = { critical: [], high: [], medium: [], low: [] };

  // Verificar se há documentação de API
  const hasApiDocs = fs.existsSync(path.join(WORKSPACE_ROOT, 'docs', 'api.md')) ||
                     fs.existsSync(path.join(WORKSPACE_ROOT, 'API.md'));

  if (!hasApiDocs) {
    issues.medium.push({
      type: 'Documentation Gaps',
      message: 'Documentação de API não encontrada',
      location: 'docs/',
      severity: 'P2'
    });
  }

  // Verificar se há guias de contribuição
  const hasContributing = fs.existsSync(path.join(PROJECT_DIR, 'CONTRIBUTING.md')) ||
                          fs.existsSync(path.join(PROJECT_DIR, 'docs', 'CONTRIBUTING.md')) ||
                          fs.existsSync(path.join(WORKSPACE_ROOT, 'CONTRIBUTING.md')) ||
                          fs.existsSync(path.join(WORKSPACE_ROOT, 'docs', 'CONTRIBUTING.md'));

  if (!hasContributing) {
    issues.low.push({
      type: 'Documentation Gaps',
      message: 'Guia de contribuição não encontrado',
      location: 'CONTRIBUTING.md',
      severity: 'P3'
    });
  }

  // Verificar documentação de componentes principais
      const appDir = config.PROJECT_SRC_DIR;
  if (fs.existsSync(appDir)) {
    const appJsx = path.join(appDir, 'App.jsx');
    if (fs.existsSync(appJsx)) {
      // Verificar se há documentação sobre a arquitetura da app
      const hasAppDocs = fs.existsSync(path.join(PROJECT_DIR, 'README.md'));
      if (!hasAppDocs) {
        issues.high.push({
          type: 'Documentation Gaps',
          message: 'README.md da aplicação principal não encontrado',
          location: path.relative(WORKSPACE_ROOT, path.join(PROJECT_DIR, 'README.md')),
          severity: 'P1'
        });
      }
    }
  }

  return issues;
}

/**
 * Analisa consistência entre documentos
 */
function analyzeConsistency(documents) {
  const issues = { critical: [], high: [], medium: [], low: [] };

  // Verificar se há referências cruzadas consistentes
  const roadmapPath = ROADMAP_PATH;
  const backlogPath = BACKLOG_PATH;

  if (fs.existsSync(roadmapPath) && fs.existsSync(backlogPath)) {
    try {
      const roadmap = fs.readFileSync(roadmapPath, 'utf-8');
      const backlog = fs.readFileSync(backlogPath, 'utf-8');

      // Verificar se há features mencionadas em ambos
      const roadmapFeatures = (roadmap.match(/- \[.*?\]/g) || []).length;
      const backlogItems = (backlog.match(/- \[.*?\]/g) || []).length;

      if (roadmapFeatures > 0 && backlogItems === 0) {
        issues.medium.push({
          type: 'Consistency',
          message: 'Roadmap tem features mas backlog está vazio - inconsistência possível',
          location: 'knowledge/product/',
          severity: 'P2'
        });
      }
    } catch (error) {
      // Ignorar erros menores
    }
  }

  return issues;
}

/**
 * Gera relatório formatado
 */
export function generateDocumentAnalysisReport(analysisResults, timestamp) {
  const { documents, issues, score } = analysisResults;

  const criticalCount = issues.critical.length;
  const highCount = issues.high.length;
  const mediumCount = issues.medium.length;
  const lowCount = issues.low.length;

  let report = `# Resultado do Agente: Document Analysis

**Data:** ${new Date().toISOString()}
**Agente:** Document Analysis
**Status:** ✅ Completo

---

## 📊 Resumo Executivo

**Objetivo da Análise:**
Análise completa da documentação do projeto, incluindo inventário, qualidade, gaps e consistência.

**Principais Descobertas:**
- ${documents.found.length} documento(s) encontrado(s)
- ${documents.missing.length} documento(s) crítico(s) faltando
- ${criticalCount} issues críticos identificados
- ${highCount} issues de alta prioridade
- Score de documentação: ${score}/100

**Score/Status Geral:**
${score >= 90 ? '✅ Excelente' : score >= 75 ? '⚠️ Bom' : score >= 60 ? '⚠️ Regular' : '❌ Precisa Melhorar'}

---

## 📚 Inventário de Documentos

### Documentos Encontrados

`;

  documents.found.forEach(doc => {
    report += `- **${doc.name}** (${doc.path})\n`;
    report += `  - Tamanho: ${doc.size} bytes\n`;
    report += `  - Modificado: ${new Date(doc.modified).toLocaleDateString()}\n`;
    report += `  - ${doc.critical ? '🔴 Crítico' : '⚪ Opcional'}\n\n`;
  });

  if (documents.missing.length > 0) {
    report += `### Documentos Faltando (Críticos)\n\n`;
    documents.missing.forEach(doc => {
      report += `- **${doc.name}** (${doc.path}) - 🔴 Crítico\n`;
    });
    report += `\n`;
  }

  report += `## 🚨 Issues Identificados\n\n`;
  report += `### Críticos (P0) - Bloqueadores\n\n`;

  if (criticalCount > 0) {
    report += `| ID | Issue | Localização | Impacto | Esforço |\n`;
    report += `|----|-------|-------------|---------|---------|\n`;
    issues.critical.forEach((issue, idx) => {
      report += `| P0-${idx + 1} | ${issue.message} | ${issue.location} | Alto | Baixo |\n`;
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

  if (documents.missing.length > 0) {
    report += `### Imediatas (P0)\n\n`;
    report += `1. **Criar Documentos Críticos Faltando**\n`;
    report += `   - **O que fazer**: Criar os ${documents.missing.length} documento(s) crítico(s) faltando\n`;
    report += `   - **Por que**: Documentos críticos são essenciais para o projeto\n`;
    report += `   - **Esforço**: Baixo\n\n`;
  }

  if (highCount > 0) {
    report += `### Curto Prazo (P1)\n\n`;
    report += `1. **Melhorar Qualidade da Documentação**\n`;
    report += `   - **O que fazer**: Revisar e melhorar os ${highCount} issues de alta prioridade\n`;
    report += `   - **Por que**: Melhor documentação facilita desenvolvimento e manutenção\n`;
    report += `   - **Esforço**: Médio\n\n`;
  }

  report += `## 📈 Métricas e Scores\n\n`;
  report += `- **Score de Documentação**: ${score}/100\n`;
  report += `- **Documentos Encontrados**: ${documents.found.length}\n`;
  report += `- **Documentos Faltando**: ${documents.missing.length}\n`;
  report += `- **Total de Issues**: ${criticalCount + highCount + mediumCount + lowCount}\n`;
  report += `  - Críticos (P0): ${criticalCount}\n`;
  report += `  - Alta (P1): ${highCount}\n`;
  report += `  - Média (P2): ${mediumCount}\n`;
  report += `  - Baixa (P3): ${lowCount}\n\n`;

  report += `**Gerado por:** Document Analysis Agent\n`;

  return report;
}

