#!/usr/bin/env node

/**
 * Maestro Workflow Execution Script
 * 
 * Orquestra a execução do workflow completo de coordenação de agentes:
 * 1. Execução paralela dos agentes
 * 2. Avaliação cruzada entre agentes
 * 3. Decisão Go/No-go
 * 4. Aprovação do usuário
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importar agentes reais
import { runCodeQualityEvaluation, generateCodeQualityReport } from '../agents/code-quality-agent.js';
import { runArchitectureReview, generateArchitectureReport } from '../agents/architecture-agent.js';
import { runDocumentAnalysis, generateDocumentAnalysisReport } from '../agents/document-analysis-agent.js';
import { runProductManagerAnalysis } from '../agents/product-manager-agent.js';
import { runSecurityAudit, generateSecurityReport } from '../agents/security-agent.js';
import { runPerformanceAnalysis, generatePerformanceReport } from '../agents/performance-agent.js';
import { runDependencyAnalysis, generateDependencyReport } from '../agents/dependency-agent.js';
import { runTestingAnalysis, generateTestingReport } from '../agents/testing-agent.js';
import { runAccessibilityAudit, generateAccessibilityReport } from '../agents/accessibility-agent.js';
import { runAPIDesignReview, generateAPIDesignReport } from '../agents/api-design-agent.js';
import { runImplementationTracking, generateTrackingReport } from '../agents/implementation-tracking-agent.js';

// Importar lógica de avaliação e decisão
import {
  architectureEvaluatesCode,
  architectureEvaluatesDocs,
  codeEvaluatesArchitecture,
  codeEvaluatesDocs,
  docsEvaluatesArchitecture,
  docsEvaluatesCode,
  generateCrossEvaluationReport
} from './evaluation-logic.js';

import {
  consolidateConcerns,
  identifyConflicts,
  makeDecision,
  calculateConsolidatedScores
} from './decision-logic.js';

import {
  generateBacklogFromIssues,
  saveBacklog
} from './backlog-generator.js';

import {
  runImplementationAgent
} from '../agents/implementation-agent.js';

// Importar helper do Firestore
import {
  saveAgentResultToFirestore,
  saveBacklogToFirestore,
  saveEvaluationToFirestore,
  saveDecisionToFirestore,
  saveEventToFirestore
} from '../firebase/agent-results-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../../..');
const MAESTRO_DIR = path.join(__dirname, '..');
const SHARED_DIR = path.join(MAESTRO_DIR, 'shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results');
const EVALUATIONS_DIR = path.join(SHARED_DIR, 'evaluations');
const DECISIONS_DIR = path.join(SHARED_DIR, 'decisions');
const BACKLOG_DIR = path.join(SHARED_DIR, 'backlog');
const EVENTS_DIR = path.join(SHARED_DIR, 'events');
const PROGRESS_FILE = path.join(SHARED_DIR, 'workflow-progress.json');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

// Função para atualizar progresso
function updateProgress(phase, agent, status, progress) {
  try {
    let currentProgress = {
      workflowStatus: 'running',
      currentPhase: phase === 'execution' ? 1 : phase === 'evaluation' ? 2 : phase === 'decision' ? 3 : 0,
      phases: {
        execution: {
          name: 'Execução dos Agentes',
          status: 'pending',
          progress: 0,
          agents: {
            'product-manager': { name: 'Product Manager', status: 'pending', progress: 0 },
            'architecture': { name: 'Architecture Review', status: 'pending', progress: 0 },
            'code-quality': { name: 'Code Quality Review', status: 'pending', progress: 0 },
            'document-analysis': { name: 'Document Analysis', status: 'pending', progress: 0 },
            'security': { name: 'Security Audit', status: 'pending', progress: 0 },
            'performance': { name: 'Performance Analysis', status: 'pending', progress: 0 },
            'dependency': { name: 'Dependency Management', status: 'pending', progress: 0 },
            'testing': { name: 'Testing Coverage', status: 'pending', progress: 0 },
            'accessibility': { name: 'Accessibility Audit', status: 'pending', progress: 0 },
            'api-design': { name: 'API Design Review', status: 'pending', progress: 0 },
            'implementation-tracking': { name: 'Implementation Tracking', status: 'pending', progress: 0 }
          }
        },
        evaluation: {
          name: 'Avaliação Cruzada',
          status: 'pending',
          progress: 0,
          evaluations: []
        },
        decision: {
          name: 'Decisão Go/No-go',
          status: 'pending',
          progress: 0
        }
      },
      startTime: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    // Carregar progresso existente se houver
    if (fs.existsSync(PROGRESS_FILE)) {
      try {
        currentProgress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      } catch (error) {
        // Ignorar erro, usar progresso padrão
      }
    }

    // Atualizar progresso
    if (phase && currentProgress.phases[phase]) {
      currentProgress.phases[phase].status = status || currentProgress.phases[phase].status;
      if (progress !== undefined) {
        currentProgress.phases[phase].progress = progress;
      }
      
      if (agent && currentProgress.phases[phase].agents && currentProgress.phases[phase].agents[agent]) {
        currentProgress.phases[phase].agents[agent].status = status;
        if (progress !== undefined) {
          currentProgress.phases[phase].agents[agent].progress = progress;
        }
      }
    }

    currentProgress.workflowStatus = 'running';
    currentProgress.timestamp = new Date().toISOString();
    
    // Salvar progresso
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(currentProgress, null, 2));
  } catch (error) {
    // Ignorar erros de progresso para não interromper o workflow
  }
}

function ensureDirectories() {
  const dirs = [
    SHARED_DIR,
    RESULTS_DIR,
    path.join(RESULTS_DIR, 'architecture-review'),
    path.join(RESULTS_DIR, 'code-quality-review'),
    path.join(RESULTS_DIR, 'document-analysis'),
    path.join(RESULTS_DIR, 'product-manager'),
    path.join(RESULTS_DIR, 'security-audit'),
    path.join(RESULTS_DIR, 'performance-analysis'),
    path.join(RESULTS_DIR, 'dependency-management'),
    EVALUATIONS_DIR,
    DECISIONS_DIR,
    BACKLOG_DIR,
    EVENTS_DIR,
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✓ Criado diretório: ${dir}`, 'green');
    }
  });
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    phase: 'all', // all, execution, evaluation, decision
    skipApproval: false,
    verbose: false,
  };

  args.forEach(arg => {
    if (arg.startsWith('--phase=')) {
      options.phase = arg.split('=')[1];
    } else if (arg === '--skip-approval') {
      options.skipApproval = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  });

  return options;
}

function showHelp() {
  console.log(`
🎭 Maestro Workflow - Sistema de Coordenação de Agentes

Uso:
  node run-workflow.js [opções]

Opções:
  --phase=<fase>     Executar fase específica:
                     - all: Todas as fases (padrão)
                     - execution: Apenas execução dos agentes
                     - evaluation: Apenas avaliação cruzada
                     - decision: Apenas decisão Go/No-go
  
  --skip-approval   Pular aprovação do usuário
  --verbose, -v     Modo verboso
  --help, -h        Mostrar esta ajuda

Exemplos:
  node run-workflow.js
  node run-workflow.js --phase=execution
  node run-workflow.js --phase=evaluation --verbose
  `);
}

// Fase 1: Execução Paralela dos Agentes
async function phase1Execution(options) {
  logSection('FASE 1: EXECUÇÃO PARALELA DOS AGENTES');

  const timestamp = getTimestamp();
  const results = {};

  // Inicializar progresso da fase
  updateProgress('execution', null, 'running', 0);

  // Architecture Review Agent
  log('\n📐 Executando Architecture Review Agent...', 'cyan');
  updateProgress('execution', 'architecture', 'running', 0);
  try {
    const archReview = await runArchitectureReview();
    const archResult = {
      agent: 'Architecture Review',
      timestamp,
      status: archReview.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'architecture-review', `${timestamp}-review.md`),
      data: archReview.results
    };
    
    const archContent = generateArchitectureReport(archReview.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const archSaveResult = await saveAgentResultToFirestore(
      'architecture-review',
      {
        ...archReview.results,
        score: archReview.results.score,
        status: 'completed'
      },
      {
        markdownContent: archContent,
        filePath: archResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!archSaveResult.filePath && archResult.file) {
      fs.writeFileSync(archResult.file, archContent);
    }
    
    results.architecture = {
      ...archResult,
      firestoreId: archSaveResult.firestoreId
    };
    updateProgress('execution', 'architecture', 'complete', 100);
    log(`✓ Architecture Review concluído (Score: ${archReview.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'architecture', 'error', 0);
    log(`✗ Erro no Architecture Review: ${error.message}`, 'red');
    results.architecture = { error: error.message };
  }

  // Code Quality Review Agent
  log('\n✅ Executando Code Quality Review Agent...', 'cyan');
  updateProgress('execution', 'code-quality', 'running', 0);
  try {
    const codeEvaluation = await runCodeQualityEvaluation();
    const codeResult = {
      agent: 'Code Quality Review',
      timestamp,
      status: codeEvaluation.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'code-quality-review', `${timestamp}-evaluation.md`),
      data: codeEvaluation.results
    };
    
    const codeContent = generateCodeQualityReport(codeEvaluation.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const codeSaveResult = await saveAgentResultToFirestore(
      'code-quality-review',
      {
        ...codeEvaluation.results,
        score: codeEvaluation.results.summary?.score || 0,
        status: 'completed'
      },
      {
        markdownContent: codeContent,
        filePath: codeResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!codeSaveResult.filePath && codeResult.file) {
      fs.writeFileSync(codeResult.file, codeContent);
    }
    
    results.codeQuality = {
      ...codeResult,
      firestoreId: codeSaveResult.firestoreId
    };
    updateProgress('execution', 'code-quality', 'complete', 100);
    log(`✓ Code Quality Review concluído (Score: ${codeEvaluation.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'code-quality', 'error', 0);
    log(`✗ Erro no Code Quality Review: ${error.message}`, 'red');
    results.codeQuality = { error: error.message };
  }

  // Document Analysis Agent
  log('\n📚 Executando Document Analysis Agent...', 'cyan');
  updateProgress('execution', 'document-analysis', 'running', 0);
  try {
    const docsAnalysis = await runDocumentAnalysis();
    const docsResult = {
      agent: 'Document Analysis',
      timestamp,
      status: docsAnalysis.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'document-analysis', `${timestamp}-analysis.md`),
      data: docsAnalysis.results
    };
    
    const docsContent = generateDocumentAnalysisReport(docsAnalysis.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const docsSaveResult = await saveAgentResultToFirestore(
      'document-analysis',
      {
        ...docsAnalysis.results,
        score: docsAnalysis.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: docsContent,
        filePath: docsResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!docsSaveResult.filePath && docsResult.file) {
      fs.writeFileSync(docsResult.file, docsContent);
    }
    
    results.documentAnalysis = {
      ...docsResult,
      firestoreId: docsSaveResult.firestoreId
    };
    updateProgress('execution', 'document-analysis', 'complete', 100);
    log(`✓ Document Analysis concluído (Score: ${docsAnalysis.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'document-analysis', 'error', 0);
    log(`✗ Erro no Document Analysis: ${error.message}`, 'red');
    results.documentAnalysis = { error: error.message };
  }

  // Security Audit Agent (Novo)
  log('\n🔒 Executando Security Audit Agent...', 'cyan');
  try {
    const securityAudit = await runSecurityAudit();
    const securityResult = {
      agent: 'Security Audit',
      timestamp,
      status: securityAudit.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'security-audit', `${timestamp}-audit.md`),
      data: securityAudit.results
    };
    
    const securityContent = generateSecurityReport(securityAudit.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const securitySaveResult = await saveAgentResultToFirestore(
      'security-audit',
      {
        ...securityAudit.results,
        score: securityAudit.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: securityContent,
        filePath: securityResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!securitySaveResult.filePath && securityResult.file) {
      fs.writeFileSync(securityResult.file, securityContent);
    }
    
    results.security = {
      ...securityResult,
      firestoreId: securitySaveResult.firestoreId
    };
    updateProgress('execution', 'security', 'complete', 100);
    log(`✓ Security Audit concluído (Score: ${securityAudit.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'security', 'error', 0);
    log(`✗ Erro no Security Audit: ${error.message}`, 'red');
    results.security = { error: error.message };
  }

  // Performance Analysis Agent (Novo)
  log('\n⚡ Executando Performance Analysis Agent...', 'cyan');
  updateProgress('execution', 'performance', 'running', 0);
  try {
    const perfAnalysis = await runPerformanceAnalysis();
    const perfResult = {
      agent: 'Performance Analysis',
      timestamp,
      status: perfAnalysis.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'performance-analysis', `${timestamp}-analysis.md`),
      data: perfAnalysis.results
    };
    
    const perfContent = generatePerformanceReport(perfAnalysis.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const perfSaveResult = await saveAgentResultToFirestore(
      'performance-analysis',
      {
        ...perfAnalysis.results,
        score: perfAnalysis.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: perfContent,
        filePath: perfResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!perfSaveResult.filePath && perfResult.file) {
      fs.writeFileSync(perfResult.file, perfContent);
    }
    
    results.performance = {
      ...perfResult,
      firestoreId: perfSaveResult.firestoreId
    };
    updateProgress('execution', 'performance', 'complete', 100);
    log(`✓ Performance Analysis concluído (Score: ${perfAnalysis.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'performance', 'error', 0);
    log(`✗ Erro no Performance Analysis: ${error.message}`, 'red');
    results.performance = { error: error.message };
  }

  // Dependency Management Agent (Novo)
  log('\n📦 Executando Dependency Management Agent...', 'cyan');
  updateProgress('execution', 'dependency', 'running', 0);
  try {
    const depAnalysis = await runDependencyAnalysis();
    const depResult = {
      agent: 'Dependency Management',
      timestamp,
      status: depAnalysis.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'dependency-management', `${timestamp}-analysis.md`),
      data: depAnalysis.results
    };
    
    const depContent = generateDependencyReport(depAnalysis.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const depSaveResult = await saveAgentResultToFirestore(
      'dependency-management',
      {
        ...depAnalysis.results,
        score: depAnalysis.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: depContent,
        filePath: depResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!depSaveResult.filePath && depResult.file) {
      fs.writeFileSync(depResult.file, depContent);
    }
    
    results.dependency = {
      ...depResult,
      firestoreId: depSaveResult.firestoreId
    };
    updateProgress('execution', 'dependency', 'complete', 100);
    log(`✓ Dependency Management concluído (Score: ${depAnalysis.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'dependency', 'error', 0);
    log(`✗ Erro no Dependency Management: ${error.message}`, 'red');
    results.dependency = { error: error.message };
  }

  // Testing Coverage Agent
  log('\n🧪 Executando Testing Coverage Agent...', 'cyan');
  updateProgress('execution', 'testing', 'running', 0);
  try {
    const testingAnalysis = await runTestingAnalysis();
    const testingResult = {
      agent: 'Testing Coverage',
      timestamp,
      status: testingAnalysis.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'testing-coverage', `${timestamp}-analysis.md`),
      data: testingAnalysis.results
    };
    
    const testingContent = generateTestingReport(testingAnalysis.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const testingSaveResult = await saveAgentResultToFirestore(
      'testing-coverage',
      {
        ...testingAnalysis.results,
        score: testingAnalysis.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: testingContent,
        filePath: testingResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!testingSaveResult.filePath && testingResult.file) {
      fs.writeFileSync(testingResult.file, testingContent);
    }
    
    results.testing = {
      ...testingResult,
      firestoreId: testingSaveResult.firestoreId
    };
    updateProgress('execution', 'testing', 'complete', 100);
    log(`✓ Testing Coverage concluído (Score: ${testingAnalysis.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'testing', 'error', 0);
    log(`✗ Erro no Testing Coverage: ${error.message}`, 'red');
    results.testing = { error: error.message };
  }

  // Accessibility Audit Agent
  log('\n♿ Executando Accessibility Audit Agent...', 'cyan');
  updateProgress('execution', 'accessibility', 'running', 0);
  try {
    const accessibilityAudit = await runAccessibilityAudit();
    const accessibilityResult = {
      agent: 'Accessibility Audit',
      timestamp,
      status: accessibilityAudit.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'accessibility-audit', `${timestamp}-audit.md`),
      data: accessibilityAudit.results
    };
    
    const accessibilityContent = generateAccessibilityReport(accessibilityAudit.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const accessibilitySaveResult = await saveAgentResultToFirestore(
      'accessibility-audit',
      {
        ...accessibilityAudit.results,
        score: accessibilityAudit.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: accessibilityContent,
        filePath: accessibilityResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!accessibilitySaveResult.filePath && accessibilityResult.file) {
      fs.writeFileSync(accessibilityResult.file, accessibilityContent);
    }
    
    results.accessibility = {
      ...accessibilityResult,
      firestoreId: accessibilitySaveResult.firestoreId
    };
    updateProgress('execution', 'accessibility', 'complete', 100);
    log(`✓ Accessibility Audit concluído (Score: ${accessibilityAudit.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'accessibility', 'error', 0);
    log(`✗ Erro no Accessibility Audit: ${error.message}`, 'red');
    results.accessibility = { error: error.message };
  }

  // API Design Review Agent
  log('\n🔌 Executando API Design Review Agent...', 'cyan');
  updateProgress('execution', 'api-design', 'running', 0);
  try {
    const apiDesignReview = await runAPIDesignReview();
    const apiDesignResult = {
      agent: 'API Design Review',
      timestamp,
      status: apiDesignReview.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'api-design-review', `${timestamp}-review.md`),
      data: apiDesignReview.results
    };
    
    const apiDesignContent = generateAPIDesignReport(apiDesignReview.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const apiDesignSaveResult = await saveAgentResultToFirestore(
      'api-design-review',
      {
        ...apiDesignReview.results,
        score: apiDesignReview.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: apiDesignContent,
        filePath: apiDesignResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!apiDesignSaveResult.filePath && apiDesignResult.file) {
      fs.writeFileSync(apiDesignResult.file, apiDesignContent);
    }
    
    results.apiDesign = {
      ...apiDesignResult,
      firestoreId: apiDesignSaveResult.firestoreId
    };
    updateProgress('execution', 'api-design', 'complete', 100);
    log(`✓ API Design Review concluído (Score: ${apiDesignReview.results.score}/100)`, 'green');
  } catch (error) {
    updateProgress('execution', 'api-design', 'error', 0);
    log(`✗ Erro no API Design Review: ${error.message}`, 'red');
    results.apiDesign = { error: error.message };
  }

  // Implementation Tracking Agent (executa após todas as análises)
  log('\n🔄 Executando Implementation Tracking Agent...', 'cyan');
  updateProgress('execution', 'implementation-tracking', 'running', 0);
  try {
    const trackingAnalysis = await runImplementationTracking();
    const trackingResult = {
      agent: 'Implementation Tracking',
      timestamp,
      status: trackingAnalysis.success ? 'completed' : 'error',
      file: path.join(RESULTS_DIR, 'implementation-tracking', `${timestamp}-tracking.md`),
      data: trackingAnalysis.results
    };
    
    const trackingContent = generateTrackingReport(trackingAnalysis.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const trackingSaveResult = await saveAgentResultToFirestore(
      'implementation-tracking',
      {
        ...trackingAnalysis.results,
        score: trackingAnalysis.results.score || 0,
        status: 'completed'
      },
      {
        markdownContent: trackingContent,
        filePath: trackingResult.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!trackingSaveResult.filePath && trackingResult.file) {
      fs.writeFileSync(trackingResult.file, trackingContent);
    }
    
    results.implementationTracking = {
      ...trackingResult,
      firestoreId: trackingSaveResult.firestoreId
    };
    updateProgress('execution', 'implementation-tracking', 'complete', 100);
    log(`✓ Implementation Tracking concluído`, 'green');
  } catch (error) {
    updateProgress('execution', 'implementation-tracking', 'error', 0);
    log(`✗ Erro no Implementation Tracking: ${error.message}`, 'red');
    results.implementationTracking = { error: error.message };
  }

  // Marcar fase de execução como completa
  updateProgress('execution', null, 'complete', 100);

  return { timestamp, results };
}

// Fase 2: Avaliação Cruzada
async function phase2Evaluation(executionResults) {
  logSection('FASE 2: AVALIAÇÃO CRUZADA');

  const evaluations = {};

  // Architecture avalia Code Quality
  log('\n📐 Architecture Review avaliando Code Quality...', 'cyan');
  try {
    const concerns = architectureEvaluatesCode(executionResults.results.codeQuality);
    const content = generateCrossEvaluationReport(
      'Architecture Review',
      'Code Quality Review',
      concerns,
      executionResults.timestamp
    );
    const archEvalCode = {
      file: path.join(EVALUATIONS_DIR, 'architecture-evaluates-code.md'),
      content,
      concerns
    };
    // Salvar no Firestore e arquivo
    const archEvalCodeSave = await saveEvaluationToFirestore(
      'architecture-evaluates-code',
      { concerns, evaluator: 'Architecture Review', evaluated: 'Code Quality Review' },
      { markdownContent: content, filePath: archEvalCode.file }
    );
    if (!archEvalCodeSave.filePath) {
      fs.writeFileSync(archEvalCode.file, archEvalCode.content);
    }
    evaluations.archEvalCode = { ...archEvalCode, firestoreId: archEvalCodeSave.firestoreId };
    log(`✓ Avaliação concluída (${concerns.critical.length} críticas, ${concerns.high.length} altas)`, 'green');
  } catch (error) {
    log(`✗ Erro na avaliação: ${error.message}`, 'red');
    evaluations.archEvalCode = { error: error.message };
  }

  // Architecture avalia Document Analysis
  log('\n📐 Architecture Review avaliando Document Analysis...', 'cyan');
  try {
    const concerns = architectureEvaluatesDocs(executionResults.results.documentAnalysis);
    const content = generateCrossEvaluationReport(
      'Architecture Review',
      'Document Analysis',
      concerns,
      executionResults.timestamp
    );
    const archEvalDocs = {
      file: path.join(EVALUATIONS_DIR, 'architecture-evaluates-docs.md'),
      content,
      concerns
    };
    // Salvar no Firestore e arquivo
    const archEvalDocsSave = await saveEvaluationToFirestore(
      'architecture-evaluates-docs',
      { concerns, evaluator: 'Architecture Review', evaluated: 'Document Analysis' },
      { markdownContent: content, filePath: archEvalDocs.file }
    );
    if (!archEvalDocsSave.filePath) {
      fs.writeFileSync(archEvalDocs.file, archEvalDocs.content);
    }
    evaluations.archEvalDocs = { ...archEvalDocs, firestoreId: archEvalDocsSave.firestoreId };
    log(`✓ Avaliação concluída (${concerns.critical.length} críticas, ${concerns.high.length} altas)`, 'green');
  } catch (error) {
    log(`✗ Erro na avaliação: ${error.message}`, 'red');
    evaluations.archEvalDocs = { error: error.message };
  }

  // Code Quality avalia Architecture
  log('\n✅ Code Quality Review avaliando Architecture Review...', 'cyan');
  try {
    const concerns = codeEvaluatesArchitecture(executionResults.results.architecture);
    const content = generateCrossEvaluationReport(
      'Code Quality Review',
      'Architecture Review',
      concerns,
      executionResults.timestamp
    );
    const codeEvalArch = {
      file: path.join(EVALUATIONS_DIR, 'code-evaluates-architecture.md'),
      content,
      concerns
    };
    // Salvar no Firestore e arquivo
    const codeEvalArchSave = await saveEvaluationToFirestore(
      'code-evaluates-architecture',
      { concerns, evaluator: 'Code Quality Review', evaluated: 'Architecture Review' },
      { markdownContent: content, filePath: codeEvalArch.file }
    );
    if (!codeEvalArchSave.filePath) {
      fs.writeFileSync(codeEvalArch.file, codeEvalArch.content);
    }
    evaluations.codeEvalArch = { ...codeEvalArch, firestoreId: codeEvalArchSave.firestoreId };
    log(`✓ Avaliação concluída (${concerns.critical.length} críticas, ${concerns.high.length} altas)`, 'green');
  } catch (error) {
    log(`✗ Erro na avaliação: ${error.message}`, 'red');
    evaluations.codeEvalArch = { error: error.message };
  }

  // Code Quality avalia Document Analysis
  log('\n✅ Code Quality Review avaliando Document Analysis...', 'cyan');
  try {
    const concerns = codeEvaluatesDocs(executionResults.results.documentAnalysis);
    const content = generateCrossEvaluationReport(
      'Code Quality Review',
      'Document Analysis',
      concerns,
      executionResults.timestamp
    );
    const codeEvalDocs = {
      file: path.join(EVALUATIONS_DIR, 'code-evaluates-docs.md'),
      content,
      concerns
    };
    // Salvar no Firestore e arquivo
    const codeEvalDocsSave = await saveEvaluationToFirestore(
      'code-evaluates-docs',
      { concerns, evaluator: 'Code Quality Review', evaluated: 'Document Analysis' },
      { markdownContent: content, filePath: codeEvalDocs.file }
    );
    if (!codeEvalDocsSave.filePath) {
      fs.writeFileSync(codeEvalDocs.file, codeEvalDocs.content);
    }
    evaluations.codeEvalDocs = { ...codeEvalDocs, firestoreId: codeEvalDocsSave.firestoreId };
    log(`✓ Avaliação concluída (${concerns.high.length} altas)`, 'green');
  } catch (error) {
    log(`✗ Erro na avaliação: ${error.message}`, 'red');
    evaluations.codeEvalDocs = { error: error.message };
  }

  // Document Analysis avalia Architecture
  log('\n📚 Document Analysis avaliando Architecture Review...', 'cyan');
  try {
    const concerns = docsEvaluatesArchitecture(executionResults.results.architecture);
    const content = generateCrossEvaluationReport(
      'Document Analysis',
      'Architecture Review',
      concerns,
      executionResults.timestamp
    );
    const docsEvalArch = {
      file: path.join(EVALUATIONS_DIR, 'docs-evaluates-architecture.md'),
      content,
      concerns
    };
    // Salvar no Firestore e arquivo
    const docsEvalArchSave = await saveEvaluationToFirestore(
      'docs-evaluates-architecture',
      { concerns, evaluator: 'Document Analysis', evaluated: 'Architecture Review' },
      { markdownContent: content, filePath: docsEvalArch.file }
    );
    if (!docsEvalArchSave.filePath) {
      fs.writeFileSync(docsEvalArch.file, docsEvalArch.content);
    }
    evaluations.docsEvalArch = { ...docsEvalArch, firestoreId: docsEvalArchSave.firestoreId };
    log(`✓ Avaliação concluída (${concerns.high.length} altas)`, 'green');
  } catch (error) {
    log(`✗ Erro na avaliação: ${error.message}`, 'red');
    evaluations.docsEvalArch = { error: error.message };
  }

  // Document Analysis avalia Code Quality
  log('\n📚 Document Analysis avaliando Code Quality Review...', 'cyan');
  try {
    const concerns = docsEvaluatesCode(executionResults.results.codeQuality);
    const content = generateCrossEvaluationReport(
      'Document Analysis',
      'Code Quality Review',
      concerns,
      executionResults.timestamp
    );
    const docsEvalCode = {
      file: path.join(EVALUATIONS_DIR, 'docs-evaluates-code.md'),
      content,
      concerns
    };
    // Salvar no Firestore e arquivo
    const docsEvalCodeSave = await saveEvaluationToFirestore(
      'docs-evaluates-code',
      { concerns, evaluator: 'Document Analysis', evaluated: 'Code Quality Review' },
      { markdownContent: content, filePath: docsEvalCode.file }
    );
    if (!docsEvalCodeSave.filePath) {
      fs.writeFileSync(docsEvalCode.file, docsEvalCode.content);
    }
    evaluations.docsEvalCode = { ...docsEvalCode, firestoreId: docsEvalCodeSave.firestoreId };
    log(`✓ Avaliação concluída (${concerns.high.length} altas)`, 'green');
  } catch (error) {
    log(`✗ Erro na avaliação: ${error.message}`, 'red');
    evaluations.docsEvalCode = { error: error.message };
  }

  // Marcar fase de avaliação como completa
  updateProgress('evaluation', null, 'complete', 100);

  return evaluations;
}

// Fase 3: Decisão Go/No-go
async function phase3Decision(executionResults, evaluations) {
  logSection('FASE 3: DECISÃO GO/NO-GO');
  updateProgress('decision', null, 'running', 0);

  // Consolidar todas as preocupações
  log('\n📊 Consolidando preocupações...', 'cyan');
  const consolidatedConcerns = consolidateConcerns(executionResults, evaluations);
  const criticalCount = consolidatedConcerns.critical.length;
  const highCount = consolidatedConcerns.high.length;
  const mediumCount = consolidatedConcerns.medium.length;
  const lowCount = consolidatedConcerns.low.length;

  // Identificar conflitos
  log('🔍 Identificando conflitos...', 'cyan');
  const conflicts = identifyConflicts(executionResults, evaluations);

  // Calcular scores
  log('📈 Calculando scores...', 'cyan');
  const scores = calculateConsolidatedScores(executionResults);

  // Tomar decisão
  log('🎯 Aplicando critérios de decisão...', 'cyan');
  const decision = makeDecision(consolidatedConcerns, conflicts, scores);

  // Gerar relatório
  const reportContent = generateGoNoGoReport(
    executionResults,
    evaluations,
    consolidatedConcerns,
    conflicts,
    scores,
    decision
  );

  const reportFile = path.join(DECISIONS_DIR, 'go-no-go-report.md');
  
  // Salvar no Firestore e arquivo
  const decisionSave = await saveDecisionToFirestore(
    'go-no-go-report',
    {
      decision: decision.decision,
      score: decision.score,
      concerns: decision.concerns,
      consolidatedScores: decision.consolidatedScores
    },
    { markdownContent: reportContent, filePath: reportFile }
  );
  if (!decisionSave.filePath) {
    fs.writeFileSync(reportFile, reportContent);
  }
  
  log(`✓ Relatório Go/No-go gerado: ${reportFile}`, 'green');
  updateProgress('decision', null, 'complete', 100);
  const decisionString = decision.decision || 'UNKNOWN';
  log(`\n📋 Decisão: ${decisionString}`, decisionString === 'GO' ? 'green' : decisionString === 'NO-GO' ? 'red' : 'yellow');
  log(`📊 Score Geral: ${scores.overall}/100`, 'cyan');
  log(`🚨 Issues Críticos: ${criticalCount}`, criticalCount > 0 ? 'red' : 'green');
  log(`⚠️  Issues Alta: ${highCount}`, highCount > 0 ? 'yellow' : 'green');
  log(`🔍 Conflitos: ${conflicts.length}`, conflicts.length > 0 ? 'yellow' : 'green');

  return { 
    decision, // Objeto com { decision, justification, confidence }
    reportFile, 
    scores, 
    concerns: consolidatedConcerns, 
    conflicts 
  };
}

// Fase 4: Implementação Automática
async function phase4Implementation(decisionResult, options = {}) {
  // Verificar se implementação é necessária
  if (!decisionResult) {
    return false;
  }

  // decisionResult.decision pode ser um objeto ou string
  const decisionObj = decisionResult.decision;
  const decisionString = typeof decisionObj === 'string' 
    ? decisionObj.toUpperCase() 
    : (decisionObj?.decision || '').toUpperCase();
  
  // Apenas executar se decisão é GO ou GO WITH CONCERNS
  if (decisionString !== 'GO' && decisionString !== 'GO WITH CONCERNS') {
    return false;
  }

  // Verificar se há backlog com tarefas
  const backlogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  if (!fs.existsSync(backlogPath)) {
    return false;
  }

  const backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
  if (!backlog.tasks || backlog.tasks.length === 0) {
    return false;
  }

  // Verificar se há tarefas auto-fixáveis
  const autoFixableTasks = backlog.tasks.filter(task => {
    if (task.status !== 'todo' && task.status !== 'in-progress') return false;
    if (task.priority === 'P0') return false; // P0 requer aprovação
    
    const message = (task.description || task.title || '').toLowerCase();
    return message.includes('format') || 
           message.includes('import') || 
           message.includes('unused') ||
           message.includes('readme') ||
           message.includes('jsdoc') ||
           message.includes('documentation') ||
           message.includes('config') ||
           message.includes('firestore.rules');
  });

  return autoFixableTasks.length > 0;
}

/**
 * Gera relatório Go/No-go completo
 */
function generateGoNoGoReport(executionResults, evaluations, concerns, conflicts, scores, decision) {
  const criticalCount = concerns.critical.length;
  const highCount = concerns.high.length;
  const mediumCount = concerns.medium.length;
  const lowCount = concerns.low.length;

  let report = `# Relatório Go/No-go - Decisão Final

**Data:** ${new Date().toISOString()}
**Workflow ID:** ${executionResults.timestamp}

---

## 🎯 Decisão Final

### ⚠️ **DECISÃO: ${typeof decision === 'object' && decision.decision ? decision.decision : (typeof decision === 'string' ? decision : 'UNKNOWN')}**

**Justificativa:**
${typeof decision === 'object' ? (decision.justification || 'N/A') : 'N/A'}

**Confiança na Decisão:** ${typeof decision === 'object' ? (decision.confidence || 'N/A') : 'N/A'}

---

## 📊 Resumo Executivo

### Métricas Gerais

| Métrica | Valor | Status |
|---------|-------|--------|
| **Score Geral** | ${scores.overall}/100 | ${scores.overall >= 90 ? '✅' : scores.overall >= 75 ? '⚠️' : '❌'} |
| **Score Architecture** | ${scores.architecture}/100 | ${scores.architecture >= 90 ? '✅' : scores.architecture >= 75 ? '⚠️' : '❌'} |
| **Score Code Quality** | ${scores.codeQuality}/100 | ${scores.codeQuality >= 90 ? '✅' : scores.codeQuality >= 75 ? '⚠️' : '❌'} |
| **Score Documentation** | ${scores.documentation}/100 | ${scores.documentation >= 90 ? '✅' : scores.documentation >= 75 ? '⚠️' : '❌'} |
| **Issues Críticos (P0)** | ${criticalCount} | ${criticalCount === 0 ? '✅' : '❌'} |
| **Issues Alta (P1)** | ${highCount} | ${highCount === 0 ? '✅' : '⚠️'} |
| **Conflitos Identificados** | ${conflicts.length} | ${conflicts.length === 0 ? '✅' : '⚠️'} |

---

## 🚨 Preocupações Críticas (P0) - Bloqueadores

`;

  if (criticalCount > 0) {
    report += `| ID | Preocupação | Origem | Impacto | Esforço |\n`;
    report += `|----|-------------|--------|---------|---------|\n`;
    concerns.critical.slice(0, 10).forEach((concern, idx) => {
      report += `| P0-${idx + 1} | ${concern.message} | ${concern.source || 'N/A'} | Alto | ${concern.type === 'Security' ? 'Alto' : 'Médio'} |\n`;
    });
    if (criticalCount > 10) {
      report += `\n*... e mais ${criticalCount - 10} issues críticos*\n\n`;
    }
    report += `\n**Detalhes:**\n\n`;
    concerns.critical.slice(0, 5).forEach((concern, idx) => {
      report += `- **P0-${idx + 1}**: ${concern.message}\n`;
      report += `  - **Origem**: ${concern.source || 'N/A'}\n`;
      report += `  - **Tipo**: ${concern.type || 'N/A'}\n\n`;
    });
  } else {
    report += `Nenhum issue crítico identificado. ✅\n\n`;
  }

  report += `## ⚠️ Preocupações de Alta Prioridade (P1)\n\n`;

  if (highCount > 0) {
    report += `| ID | Preocupação | Origem | Impacto | Esforço |\n`;
    report += `|----|-------------|--------|---------|---------|\n`;
    concerns.high.slice(0, 10).forEach((concern, idx) => {
      report += `| P1-${idx + 1} | ${concern.message} | ${concern.source || 'N/A'} | Médio | Baixo |\n`;
    });
    if (highCount > 10) {
      report += `\n*... e mais ${highCount - 10} issues de alta prioridade*\n\n`;
    }
  } else {
    report += `Nenhum issue de alta prioridade identificado. ✅\n\n`;
  }

  if (conflicts.length > 0) {
    report += `## 🔍 Conflitos Identificados\n\n`;
    report += `| ID | Conflito | Agentes | Impacto | Resolução |\n`;
    report += `|----|----------|---------|---------|-----------|\n`;
    conflicts.forEach((conflict, idx) => {
      report += `| C-${idx + 1} | ${conflict.message} | ${conflict.agents.join(', ')} | ${conflict.impact} | ${conflict.resolution} |\n`;
    });
    report += `\n`;
  }

  report += `## 💡 Recomendações\n\n`;

  if (criticalCount > 0) {
    report += `### Imediatas (Se NO-GO, resolver antes de prosseguir)\n\n`;
    report += `1. **Resolver Issues Críticos**\n`;
    report += `   - **O que fazer**: Corrigir os ${criticalCount} issues críticos identificados\n`;
    report += `   - **Por que**: Issues críticos bloqueiam progresso seguro\n`;
    report += `   - **Esforço**: Alto\n\n`;
  }

  if (highCount > 0) {
    report += `### Curto Prazo (Se GO WITH CONCERNS, resolver em breve)\n\n`;
    report += `1. **Resolver Issues de Alta Prioridade**\n`;
    report += `   - **O que fazer**: Revisar e corrigir os ${highCount} issues de alta prioridade\n`;
    report += `   - **Por que**: Melhoram significativamente a qualidade\n`;
    report += `   - **Esforço**: Médio\n\n`;
  }

  report += `## 📎 Anexos\n\n`;
  report += `### Resultados dos Agentes\n`;
  report += `- Architecture Review: \`${executionResults.results.architecture?.file || 'N/A'}\`\n`;
  report += `- Code Quality Review: \`${executionResults.results.codeQuality?.file || 'N/A'}\`\n`;
  report += `- Document Analysis: \`${executionResults.results.documentAnalysis?.file || 'N/A'}\`\n\n`;
  report += `### Avaliações Cruzadas\n`;
  report += `- Todas as avaliações em: \`maestro/shared/evaluations/\`\n\n`;

  report += `## 👤 Aprovação do Usuário\n\n`;
  report += `**Status:** ⏳ Aguardando Aprovação\n\n`;

  report += `**Gerado por:** Maestro - Sistema de Coordenação\n`;
  report += `**Versão:** 2.0\n`;

  return report;
}

// Fase 4: Aprovação do Usuário
async function phase4Approval(decisionResult, options) {
  if (options.skipApproval) {
    log('\n⏭️  Aprovação pulada (--skip-approval)', 'yellow');
    return { approved: true, reason: 'Skipped' };
  }

  logSection('FASE 4: APROVAÇÃO DO USUÁRIO');

  log('\n📋 Relatório Go/No-go disponível em:', 'cyan');
  log(`   ${decisionResult.reportFile}`, 'bright');
  
  log('\n📊 Resumo da Decisão:', 'cyan');
    const decisionObj = decisionResult.decision;
    const decisionString = typeof decisionObj === 'string' 
      ? decisionObj 
      : (decisionObj?.decision || 'UNKNOWN');
    log(`   Decisão: ${decisionString}`, 'bright');
    log(`   Score: ${decisionResult.scores?.overall || 0}/100`, 'bright');
    log(`   Issues Críticos: ${decisionResult.concerns?.critical?.length || 0}`, 'bright');
    log(`   Issues Alta: ${decisionResult.concerns?.high?.length || 0}`, 'bright');

  // Em produção, isso seria uma interface interativa
  // Por enquanto, apenas informamos
  log('\n💡 Para aprovar/rejeitar, edite o arquivo do relatório', 'yellow');
  log('   e atualize a seção "Aprovação do Usuário"', 'yellow');

  return { approved: null, reason: 'Manual approval required' };
}

/**
 * Verifica se há backlog do Product Manager
 */
function checkForBacklog() {
  const eventPath = path.join(EVENTS_DIR, 'backlog-ready.json');
  const currentBacklogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  
  if (fs.existsSync(eventPath)) {
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    return {
      hasBacklog: true,
      backlogId: event.backlogId,
      backlogPath: event.backlogPath || path.join(BACKLOG_DIR, `${event.backlogId}.json`)
    };
  }
  
  if (fs.existsSync(currentBacklogPath)) {
    const backlog = JSON.parse(fs.readFileSync(currentBacklogPath, 'utf-8'));
    return {
      hasBacklog: true,
      backlogId: backlog.backlogId,
      backlogPath: currentBacklogPath
    };
  }
  
  return { hasBacklog: false };
}

/**
 * Carrega backlog do Product Manager
 */
function loadBacklog(backlogPath) {
  if (!fs.existsSync(backlogPath)) {
    return null;
  }
  
  return JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
}

/**
 * Retorna feedback para Product Manager
 */
async function returnFeedbackToProductManager(workflowResults, decisionResult) {
  const feedback = {
    event: 'workflow-complete',
    workflowId: getTimestamp(),
    timestamp: new Date().toISOString(),
    decision: typeof decisionResult.decision === 'string' 
      ? decisionResult.decision 
      : (decisionResult.decision?.decision || 'UNKNOWN'),
    scores: decisionResult.scores || null, // Garantir que não seja undefined
    issues: {
      critical: decisionResult.concerns?.critical?.length || 0,
      high: decisionResult.concerns?.high?.length || 0,
      medium: decisionResult.concerns?.medium?.length || 0,
      low: decisionResult.concerns?.low?.length || 0
    },
    recommendations: [],
    reportPath: decisionResult.reportFile || null, // Garantir que não seja undefined
    updatedBacklog: null
  };
  
  // Gerar backlog atualizado com melhorias identificadas
  if (decisionResult.concerns) {
    const allIssues = [
      ...(decisionResult.concerns.critical || []).map(i => ({ ...i, priority: 'P0' })),
      ...(decisionResult.concerns.high || []).map(i => ({ ...i, priority: 'P1' })),
      ...(decisionResult.concerns.medium || []).map(i => ({ ...i, priority: 'P2' })),
      ...(decisionResult.concerns.low || []).map(i => ({ ...i, priority: 'P3' }))
    ];
    
    if (allIssues.length > 0) {
      // Verificar se há backlog existente para mesclar
      const backlogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
      let existingBacklog = null;
      if (fs.existsSync(backlogPath)) {
        try {
          existingBacklog = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
        } catch (error) {
          // Ignorar erro ao ler backlog existente
        }
      }
      
      // Converter issues em tarefas de melhoria
      const improvementBacklog = await generateBacklogFromIssues(allIssues, {
        backlogId: existingBacklog?.backlogId || `backlog-improvements-${getTimestamp()}`,
        milestone: existingBacklog?.milestone || 'Improvements'
      });
      
      // Mesclar com backlog existente se houver
      if (existingBacklog && existingBacklog.tasks && existingBacklog.tasks.length > 0) {
        const existingTaskIds = new Set(existingBacklog.tasks.map(t => t.id));
        const existingTaskTitles = new Set(existingBacklog.tasks.map(t => t.title?.toLowerCase().trim()));
        
        const newTasks = improvementBacklog.tasks.filter(task => {
          if (existingTaskIds.has(task.id)) return false;
          if (task.title && existingTaskTitles.has(task.title.toLowerCase().trim())) return false;
          const existingTask = existingBacklog.tasks.find(t => 
            t.title?.toLowerCase().trim() === task.title?.toLowerCase().trim()
          );
          if (existingTask && (existingTask.status === 'done' || existingTask.status === 'complete')) return false;
          return true;
        });
        
        improvementBacklog.tasks = [...existingBacklog.tasks, ...newTasks];
        improvementBacklog.backlogId = existingBacklog.backlogId;
        
        // Atualizar summary
        const summary = improvementBacklog.summary || {};
        improvementBacklog.summary = {
          ...summary,
          totalTasks: improvementBacklog.tasks.length,
          p0Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P0').length,
          p1Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P1').length,
          p2Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P2').length,
          p3Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P3').length
        };
      }
      
      feedback.updatedBacklog = improvementBacklog;
      
      // Validar contrato AutoFix antes de salvar (FAIL-FAST)
      try {
        const { validateAutoFixBacklog } = await import('../schemas/auto-fix-task.js');
        const validation = validateAutoFixBacklog(improvementBacklog);
        
        if (!validation.valid) {
          const errorMsg = `❌ CONTRATO VIOLADO ao salvar backlog:\n${validation.errors.join('\n')}`;
          log(errorMsg, 'red');
          throw new Error(errorMsg);
        }
      } catch (error) {
        if (error.message.includes('CONTRATO VIOLADO')) {
          throw error; // Re-throw erros de contrato
        }
        console.warn('⚠️  Aviso: Não foi possível validar backlog:', error.message);
      }
      
      // Salvar backlog no Firestore e arquivo (backlogPath já declarado acima)
      await saveBacklogToFirestore(improvementBacklog, {
        backlogId: 'current',
        filePath: backlogPath
      });
      
      // Manter compatibilidade
      saveBacklog(improvementBacklog);
    }
  }
  
  // Validar contrato WorkflowFeedbackEvent antes de salvar (FAIL-FAST)
  try {
    const { validateWorkflowFeedbackEvent } = await import('../schemas/workflow-feedback-event.js');
    const validation = validateWorkflowFeedbackEvent(feedback);
    
    if (!validation.valid) {
      const errorMsg = `❌ CONTRATO VIOLADO (workflow-feedback):\n${validation.errors.join('\n')}`;
      log(errorMsg, 'red');
      throw new Error(errorMsg);
    }
  } catch (error) {
    if (error.message.includes('CONTRATO VIOLADO')) {
      throw error; // Re-throw erros de contrato
    }
    console.warn('⚠️  Aviso: Não foi possível validar feedback:', error.message);
  }
  
  // Salvar feedback como evento
  const feedbackPath = path.join(EVENTS_DIR, 'workflow-feedback.json');
  await saveEventToFirestore('workflow-feedback', feedback);
  fs.writeFileSync(feedbackPath, JSON.stringify(feedback, null, 2), 'utf-8');
  
  // Remover evento de backlog-ready se existir
  const eventPath = path.join(EVENTS_DIR, 'backlog-ready.json');
  if (fs.existsSync(eventPath)) {
    fs.unlinkSync(eventPath);
  }
  
  log('\n📤 Feedback enviado para Product Manager', 'cyan');
  
  return feedback;
}

// Função principal
async function main() {
  log('\n🎭 MAESTRO - Sistema de Coordenação de Agentes', 'bright');
  log('='.repeat(60), 'bright');

  const options = parseArgs();
  
  if (options.verbose) {
    log('\n⚙️  Opções:', 'cyan');
    log(`   Fase: ${options.phase}`, 'cyan');
    log(`   Pular Aprovação: ${options.skipApproval}`, 'cyan');
  }

  // Preparar ambiente
  ensureDirectories();
  
  // Verificar se há backlog do Product Manager
  const backlogCheck = checkForBacklog();
  let backlog = null;
  
  if (backlogCheck.hasBacklog) {
    log(`\n📋 Backlog detectado: ${backlogCheck.backlogId}`, 'cyan');
    backlog = loadBacklog(backlogCheck.backlogPath);
    if (backlog) {
      log(`   Tarefas no backlog: ${backlog.tasks.length}`, 'cyan');
    }
  } else {
    log('\n💡 Nenhum backlog do Product Manager encontrado. Executando workflow padrão.', 'yellow');
  }

  let executionResults = null;
  let evaluations = null;
  let decisionResult = null;

  try {
    // Fase 1: Execução
    if (options.phase === 'all' || options.phase === 'execution') {
      executionResults = await phase1Execution(options);
    }

    // Fase 2: Avaliação Cruzada
    if (options.phase === 'all' || options.phase === 'evaluation') {
      if (!executionResults && options.phase === 'evaluation') {
        log('\n⚠️  Executando fase de execução primeiro...', 'yellow');
        executionResults = await phase1Execution(options);
      }
      evaluations = await phase2Evaluation(executionResults);
    }

    // Fase 3: Decisão
    if (options.phase === 'all' || options.phase === 'decision') {
      if (!executionResults || !evaluations) {
        log('\n⚠️  Executando fases anteriores primeiro...', 'yellow');
        if (!executionResults) executionResults = await phase1Execution(options);
        if (!evaluations) evaluations = await phase2Evaluation(executionResults);
      }
      decisionResult = await phase3Decision(executionResults, evaluations);
      
      // Gerar backlog atualizado com melhorias
      if (decisionResult.concerns) {
        log('\n📋 Gerando backlog atualizado com melhorias...', 'cyan');
        const allIssues = [
          ...(decisionResult.concerns.critical || []).map(i => ({ ...i, priority: 'P0', agent: i.source || 'Unknown' })),
          ...(decisionResult.concerns.high || []).map(i => ({ ...i, priority: 'P1', agent: i.source || 'Unknown' })),
          ...(decisionResult.concerns.medium || []).map(i => ({ ...i, priority: 'P2', agent: i.source || 'Unknown' })),
          ...(decisionResult.concerns.low || []).map(i => ({ ...i, priority: 'P3', agent: i.source || 'Unknown' }))
        ];
        
        if (allIssues.length > 0) {
          const improvementBacklog = await generateBacklogFromIssues(allIssues, {
            backlogId: `backlog-improvements-${getTimestamp()}`,
            milestone: backlog?.milestone || 'Improvements'
          });
          
          // Se havia backlog original, mesclar tarefas (evitando duplicatas)
          if (backlog && backlog.tasks && backlog.tasks.length > 0) {
            // Filtrar tarefas existentes para evitar duplicatas
            const existingTaskIds = new Set(backlog.tasks.map(t => t.id));
            const existingTaskTitles = new Set(backlog.tasks.map(t => t.title?.toLowerCase().trim()));
            
            // Adicionar apenas tarefas novas (não duplicadas)
            const newTasks = improvementBacklog.tasks.filter(task => {
              // Verificar por ID
              if (existingTaskIds.has(task.id)) {
                return false;
              }
              // Verificar por título (case-insensitive)
              if (task.title && existingTaskTitles.has(task.title.toLowerCase().trim())) {
                return false;
              }
              // Não adicionar se tarefa já foi concluída no backlog original
              const existingTask = backlog.tasks.find(t => 
                t.title?.toLowerCase().trim() === task.title?.toLowerCase().trim()
              );
              if (existingTask && (existingTask.status === 'done' || existingTask.status === 'complete')) {
                return false;
              }
              return true;
            });
            
            // Mesclar: manter tarefas existentes + adicionar novas
            improvementBacklog.tasks = [...backlog.tasks, ...newTasks];
            
            // Manter backlogId original
            improvementBacklog.backlogId = backlog.backlogId;
            
            // Atualizar summary com tarefas mescladas
            const summary = improvementBacklog.summary || {};
            improvementBacklog.summary = {
              ...summary,
              totalTasks: improvementBacklog.tasks.length,
              p0Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P0').length,
              p1Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P1').length,
              p2Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P2').length,
              p3Tasks: improvementBacklog.tasks.filter(t => t.priority === 'P3').length
            };
            
            log(`   Mesclando com backlog existente: ${backlog.tasks.length} tarefas existentes + ${newTasks.length} novas`, 'cyan');
          }
          
          // Validar contrato AutoFix antes de salvar (FAIL-FAST)
          try {
            const { validateAutoFixBacklog } = await import('../schemas/auto-fix-task.js');
            const validation = validateAutoFixBacklog(improvementBacklog);
            
            if (!validation.valid) {
              const errorMsg = `❌ CONTRATO VIOLADO ao salvar backlog:\n${validation.errors.join('\n')}`;
              log(errorMsg, 'red');
              throw new Error(errorMsg);
            }
          } catch (error) {
            if (error.message.includes('CONTRATO VIOLADO')) {
              throw error; // Re-throw erros de contrato
            }
            console.warn('⚠️  Aviso: Não foi possível validar backlog:', error.message);
          }
          
          // Salvar backlog no Firestore e arquivo
          const backlogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
          await saveBacklogToFirestore(improvementBacklog, {
            backlogId: 'current',
            filePath: backlogPath
          });
          
          // Manter compatibilidade
          saveBacklog(improvementBacklog);
          log(`✓ Backlog atualizado: ${improvementBacklog.tasks.length} tarefas (todas auto-fixáveis)`, 'green');
        }
      }
      
      // Retornar feedback para Product Manager
      if (backlogCheck.hasBacklog) {
        await returnFeedbackToProductManager(executionResults, decisionResult);
      }
    }

    // Fase 4: Implementação Automática (Opcional)
    if (options.phase === 'all' || options.phase === 'implementation') {
      if (!decisionResult) {
        log('\n⚠️  Executando fases anteriores primeiro...', 'yellow');
        if (!executionResults) executionResults = await phase1Execution(options);
        if (!evaluations) evaluations = await phase2Evaluation(executionResults);
        decisionResult = await phase3Decision(executionResults, evaluations);
      }
      
      // Verificar se implementação é necessária
      const shouldImplement = await phase4Implementation(decisionResult, options);
      
      if (shouldImplement) {
        logSection('FASE 4: IMPLEMENTAÇÃO AUTOMÁTICA');
        log('\n🔧 Executando Implementation Agent...', 'cyan');
        const implementationResult = await runImplementationAgent({
          maxTasks: options.maxImplementationTasks || 10,
          autoCommit: options.autoCommit !== false,
          dryRun: options.dryRun || false
        });
        
        if (implementationResult.tasksCompleted > 0) {
          log(`✓ ${implementationResult.tasksCompleted} tarefas implementadas com sucesso`, 'green');
          if (implementationResult.tasksError > 0) {
            log(`  ⚠️  ${implementationResult.tasksError} tarefas com erro`, 'yellow');
          }
          log(`  📊 Taxa de sucesso: ${implementationResult.successRate}%`, 'cyan');
          log(`  📁 Relatório: ${path.join(IMPLEMENTATIONS_DIR, implementationResult.id)}`, 'bright');
        } else {
          log('ℹ️  Nenhuma tarefa foi implementada', 'yellow');
          log('   Razão: Não há tarefas auto-fixáveis no backlog', 'yellow');
        }
      } else {
        log('\n⏭️  Implementação automática não será executada', 'yellow');
        log('   Razão: Decisão não permite ou não há tarefas auto-fixáveis', 'yellow');
      }
    }

    // Fase 5: Aprovação
    if (options.phase === 'all') {
      if (!decisionResult) {
        log('\n⚠️  Executando decisão primeiro...', 'yellow');
        if (!executionResults) executionResults = await phase1Execution(options);
        if (!evaluations) evaluations = await phase2Evaluation(executionResults);
        decisionResult = await phase3Decision(executionResults, evaluations);
      }
      await phase4Approval(decisionResult, options);
    }

    // Resumo final
    logSection('WORKFLOW CONCLUÍDO');
    log('✅ Todas as fases foram executadas com sucesso!', 'green');
    log('\n📁 Arquivos gerados:', 'cyan');
    log(`   Resultados: ${RESULTS_DIR}`, 'bright');
    log(`   Avaliações: ${EVALUATIONS_DIR}`, 'bright');
    log(`   Decisões: ${DECISIONS_DIR}`, 'bright');
    if (backlogCheck.hasBacklog) {
      log(`   Backlog: ${BACKLOG_DIR}`, 'bright');
    }

  } catch (error) {
    log(`\n✗ Erro no workflow: ${error.message}`, 'red');
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Executar
main().catch(error => {
  log(`\n✗ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

export { main, phase1Execution, phase2Evaluation, phase3Decision, phase4Approval, phase4Implementation };

