#!/usr/bin/env node

/**
 * Maestro Web Server
 * Servidor HTTP para interface web do Maestro
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Importar módulo de sincronização Firebase (híbrido)
import {
  loadHybrid,
  saveHybrid,
  loadBacklog,
  saveBacklog,
  loadWorkflowProgress,
  saveWorkflowProgress,
  watchCollection,
  SYNC_ENABLED,
  SYNC_MODE
} from '../firebase/data-sync.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Use 3001 to avoid conflict with Life Goals App (Vite on 3000)

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rate Limiting (importar dinamicamente)
let rateLimiter;
(async () => {
  try {
    const rateLimiterModule = await import('../middleware/rate-limiter.js');
    rateLimiter = rateLimiterModule.rateLimiter;
    const workflowRateLimiter = rateLimiterModule.workflowRateLimiter;
    
    // Aplicar rate limiting em endpoints críticos
    app.use('/api/workflow/run', workflowRateLimiter);
    app.use('/api/projects/:id/analyze', workflowRateLimiter);
    app.use('/api', rateLimiter({ max: 100, window: 60 * 1000 }));
  } catch (error) {
    console.warn('⚠️  Rate limiter não disponível:', error.message);
  }
})();

// Authentication (importar dinamicamente)
let requireAuth, requireAdmin;
(async () => {
  try {
    const authModule = await import('../middleware/auth.js');
    requireAuth = authModule.requireAuth;
    requireAdmin = authModule.requireAdmin;
    
    // Aplicar autenticação em endpoints sensíveis (se configurado)
    if (process.env.REQUIRE_AUTH === 'true') {
      app.use('/api/approvals/:id/approve', requireAuth);
      app.use('/api/approvals/:id/reject', requireAuth);
      app.use('/api/projects', requireAuth);
      app.use('/api/projects/:id', requireAuth);
      app.use('/api/firebase/migrate', requireAdmin);
    }
  } catch (error) {
    console.warn('⚠️  Auth middleware não disponível:', error.message);
  }
})();

// Favicon - retorna 204 (No Content) para evitar erro 404
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Caminhos
const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const SHARED_DIR = path.join(__dirname, '..', 'shared');
const DECISIONS_DIR = path.join(SHARED_DIR, 'decisions');
const RESULTS_DIR = path.join(SHARED_DIR, 'results');
const BACKLOG_DIR = path.join(SHARED_DIR, 'backlog');
const IMPLEMENTATIONS_DIR = path.join(SHARED_DIR, 'implementations');
const LOGS_FILE = path.join(SHARED_DIR, 'workflow.log');
const PROGRESS_FILE = path.join(SHARED_DIR, 'workflow-progress.json');

// Armazenamento em memória (logs - limitado)
const logs = [];

// Importar helpers de aprovações e background jobs
let approvalsHelper;
let backgroundJobs;

(async () => {
  try {
    approvalsHelper = await import('../firebase/approvals-helper.js');
    backgroundJobs = await import('../utils/background-jobs.js');
  } catch (error) {
    console.warn('⚠️  Erro ao carregar helpers:', error.message);
  }
})();

// Função auxiliar para ler arquivo JSON
function readJSONFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error);
  }
  return null;
}

// Função auxiliar para escrever arquivo JSON
function writeJSONFile(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever ${filePath}:`, error);
    return false;
  }
}

// Gerar plano de ação para transformar NO-GO em GO
function generateActionPlan(criticalIssues, highIssues, scores) {
  const actions = [];
  const priorities = {
    immediate: [],
    shortTerm: [],
    mediumTerm: []
  };

  // Função para detectar tipo de issue baseado na mensagem
  function detectIssueType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('firestore.rules') || lowerMessage.includes('segurança') || 
        lowerMessage.includes('security') || lowerMessage.includes('regras de segurança')) {
      return 'Security';
    }
    if (lowerMessage.includes('src/') || lowerMessage.includes('diretório') || 
        lowerMessage.includes('estrutura') || lowerMessage.includes('structure')) {
      return 'Structure';
    }
    if (lowerMessage.includes('readme') || lowerMessage.includes('documento') || 
        lowerMessage.includes('documentation') || lowerMessage.includes('package.json')) {
      return 'Documentation';
    }
    if (lowerMessage.includes('score') || lowerMessage.includes('qualidade') || 
        lowerMessage.includes('quality') || lowerMessage.includes('arquiteturais')) {
      return 'Quality';
    }
    if (lowerMessage.includes('organização') || lowerMessage.includes('organization') || 
        lowerMessage.includes('componente') || lowerMessage.includes('component')) {
      return 'Code Organization';
    }
    
    return 'General';
  }

  // Agrupar issues críticos por tipo detectado
  const issuesByType = {};
  criticalIssues.forEach(issue => {
    const type = detectIssueType(issue.message);
    if (!issuesByType[type]) issuesByType[type] = [];
    issuesByType[type].push(issue);
  });

  // Ações imediatas para issues críticos
  Object.entries(issuesByType).forEach(([type, issues]) => {
    // Determinar esforço baseado no tipo e quantidade
    let effort = 'Alto';
    if (type === 'Documentation' && issues.length <= 2) {
      effort = 'Baixo';
    } else if (type === 'Structure' && issues.length === 1) {
      effort = 'Médio';
    }

    // Criar título mais descritivo
    let title = '';
    if (type === 'Security') {
      title = `Corrigir ${issues.length} problema(s) de Segurança`;
    } else if (type === 'Structure') {
      title = `Organizar Estrutura do Projeto (${issues.length} issue(s))`;
    } else if (type === 'Documentation') {
      title = `Completar Documentação (${issues.length} documento(s) faltando)`;
    } else if (type === 'Quality') {
      title = `Melhorar Qualidade do Código (Score muito baixo)`;
    } else if (type === 'Code Organization') {
      title = `Reorganizar Código (${issues.length} issue(s))`;
    } else {
      title = `Resolver ${issues.length} issue(s) crítico(s)`;
    }

    priorities.immediate.push({
      title: title,
      description: issues.length === 1 
        ? issues[0].message 
        : `${issues.length} issues identificados: ${issues.slice(0, 2).map(i => i.message.substring(0, 60)).join('; ')}${issues.length > 2 ? '...' : ''}`,
      issues: issues,
      effort: effort,
      impact: 'Crítico - Bloqueia GO',
      steps: generateStepsForIssueType(type, issues)
    });
  });

  // Ações de curto prazo para issues de alta prioridade
  if (highIssues.length > 0) {
    priorities.shortTerm.push({
      title: `Resolver ${highIssues.length} issue(s) de alta prioridade`,
      description: 'Issues que devem ser resolvidos para melhorar qualidade',
      issues: highIssues,
      effort: 'Médio',
      impact: 'Alto - Melhora significativamente o score',
      steps: ['Revisar cada issue identificado', 'Priorizar por impacto', 'Implementar correções', 'Re-executar workflow']
    });
  }

  // Ações para melhorar scores baixos
  if (scores.architecture < 60) {
    priorities.immediate.push({
      title: 'Melhorar Score de Arquitetura',
      description: `Score atual: ${scores.architecture}/100. Meta: 75+`,
      effort: 'Alto',
      impact: 'Crítico - Score muito baixo',
      steps: [
        'Revisar estrutura do projeto',
        'Organizar código em módulos/componentes',
        'Implementar padrões arquiteturais',
        'Documentar decisões arquiteturais'
      ]
    });
  }

  if (scores.codeQuality < 60) {
    priorities.immediate.push({
      title: 'Melhorar Score de Qualidade de Código',
      description: `Score atual: ${scores.codeQuality}/100. Meta: 75+`,
      effort: 'Alto',
      impact: 'Crítico - Score muito baixo',
      steps: [
        'Corrigir issues críticos identificados',
        'Implementar padrões de código',
        'Adicionar tratamento de erros',
        'Melhorar organização do código'
      ]
    });
  }

  return {
    summary: `Para transformar NO-GO em GO, é necessário resolver ${criticalIssues.length} issue(s) crítico(s) e ${highIssues.length} issue(s) de alta prioridade.`,
    priorities,
    estimatedTime: calculateEstimatedTime(priorities),
    targetScore: {
      overall: 75,
      architecture: 75,
      codeQuality: 75,
      documentation: 80
    }
  };
}

// Gerar passos específicos por tipo de issue
function generateStepsForIssueType(type, issues) {
  const steps = [];
  const allMessages = issues.map(i => i.message.toLowerCase()).join(' ');
  
  if (type === 'Security') {
    if (allMessages.includes('firestore.rules')) {
      steps.push('Criar arquivo firestore.rules na raiz do projeto');
      steps.push('Definir regras de segurança para collections (goals, habits, tasks)');
      steps.push('Validar que request.auth.uid corresponde ao userId do documento');
      steps.push('Implementar validação de limite de 3 goals ativos no servidor');
      steps.push('Testar regras com diferentes usuários');
    }
    if (allMessages.includes('secret') || allMessages.includes('api key')) {
      steps.push('Identificar todos os secrets hardcoded no código');
      steps.push('Mover secrets para variáveis de ambiente (.env)');
      steps.push('Adicionar .env ao .gitignore');
      steps.push('Criar .env.example com placeholders');
      steps.push('Atualizar código para usar process.env');
    }
    if (steps.length === 0) {
      steps.push('Revisar configurações de segurança');
      steps.push('Validar autenticação em todas as operações');
      steps.push('Verificar isolamento de dados por usuário');
    }
  } else if (type === 'Structure') {
    if (allMessages.includes('src/')) {
      steps.push('Criar diretório src/ na raiz do projeto');
      steps.push('Mover arquivos de código para src/');
      steps.push('Organizar em subdiretórios: components/, hooks/, utils/, services/');
      steps.push('Atualizar imports nos arquivos');
      steps.push('Verificar que build ainda funciona');
    } else {
      steps.push('Revisar estrutura atual do projeto');
      steps.push('Organizar código em módulos lógicos');
      steps.push('Separar responsabilidades por diretório');
      steps.push('Documentar estrutura escolhida');
    }
  } else if (type === 'Documentation') {
    if (allMessages.includes('readme')) {
      steps.push('Criar README.md na raiz do projeto');
      steps.push('Incluir: descrição do projeto, instalação, uso, estrutura');
      steps.push('Adicionar badges (status, versão, etc)');
      steps.push('Incluir exemplos de uso');
    }
    if (allMessages.includes('package.json')) {
      steps.push('Verificar se package.json existe na raiz');
      steps.push('Se não existir, criar com informações básicas do projeto');
      steps.push('Incluir: name, version, description, scripts, dependencies');
    }
    steps.push('Documentar arquitetura do sistema');
    steps.push('Documentar padrões de código utilizados');
    steps.push('Atualizar documentação existente se necessário');
  } else if (type === 'Quality') {
    if (allMessages.includes('score') && allMessages.includes('0')) {
      steps.push('Executar avaliação de qualidade: npm run evaluate');
      steps.push('Revisar todos os issues críticos identificados');
      steps.push('Corrigir issues de segurança primeiro');
      steps.push('Corrigir issues de organização de código');
      steps.push('Re-executar avaliação até score >= 75');
    } else {
      steps.push('Revisar issues de qualidade identificados');
      steps.push('Priorizar correção por severidade');
      steps.push('Implementar melhorias gradualmente');
      steps.push('Re-executar workflow para validar');
    }
  } else if (type === 'Code Organization') {
    steps.push('Identificar componentes muito grandes (>300 linhas)');
    steps.push('Dividir em componentes menores e focados');
    steps.push('Extrair lógica de negócio para hooks customizados');
    steps.push('Separar lógica de apresentação da lógica de negócio');
    steps.push('Reorganizar imports e dependências');
  } else {
    // Para issues gerais, analisar mensagem específica
    const firstIssue = issues[0];
    if (firstIssue.message.includes('não encontrado')) {
      steps.push(`Verificar se o arquivo/diretório mencionado existe`);
      steps.push('Criar arquivo/diretório se necessário');
      steps.push('Verificar permissões e localização correta');
    } else {
      steps.push('Analisar issue específico em detalhes');
      steps.push('Identificar causa raiz do problema');
      steps.push('Implementar correção apropriada');
      steps.push('Testar solução');
      steps.push('Re-executar workflow para validar');
    }
  }
  
  return steps;
}

// Calcular tempo estimado
function calculateEstimatedTime(priorities) {
  let hours = 0;
  
  priorities.immediate.forEach(action => {
    hours += action.effort === 'Alto' ? 8 : action.effort === 'Médio' ? 4 : 2;
  });
  
  priorities.shortTerm.forEach(action => {
    hours += action.effort === 'Alto' ? 4 : action.effort === 'Médio' ? 2 : 1;
  });
  
  return {
    hours,
    days: Math.ceil(hours / 8),
    description: hours < 8 ? `${hours} horas` : `${Math.ceil(hours / 8)} dia(s)`
  };
}

// Função para parsear relatório Go/No-go
function parseGoNoGoReport(reportPath) {
  try {
    if (!fs.existsSync(reportPath)) {
      return null;
    }

    const content = fs.readFileSync(reportPath, 'utf-8');
    const lines = content.split('\n');

    // Extrair decisão (pode ser "GO", "NO-GO", "GO WITH CONCERNS")
    const decisionMatch = content.match(/DECISÃO:\s*(\*?\*?)(GO|NO-GO|NO|GO WITH CONCERNS)(\*?\*?)/i);
    let decision = 'UNKNOWN';
    if (decisionMatch) {
      decision = decisionMatch[2].toUpperCase();
      if (decision === 'NO') decision = 'NO-GO';
      if (decision === 'GO WITH CONCERNS') decision = 'GO WITH CONCERNS';
    }

    // Extrair justificativa
    const justificationMatch = content.match(/\*\*Justificativa:\*\*\s*\n(.+?)(?=\n\n|$)/s);
    const justification = justificationMatch ? justificationMatch[1].trim() : '';

    // Extrair confiança
    const confidenceMatch = content.match(/\*\*Confiança na Decisão:\*\*\s*(\w+)/);
    const confidence = confidenceMatch ? confidenceMatch[1] : 'Média';

    // Extrair scores
    const scores = {
      overall: 0,
      architecture: 0,
      codeQuality: 0,
      documentation: 0,
      security: 0,
      performance: 0,
      dependency: 0,
      testing: 0,
      accessibility: 0,
      apiDesign: 0,
      implementationTracking: 0
    };

    // Padrões para extrair scores da tabela
    const scorePatterns = {
      overall: [
        /\*\*Score\s+Geral\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Geral.*?(\d+)\/100/i,
        /Score Geral.*?(\d+)\/100/i,
        /Score:\s*(\d+)\/100/i
      ],
      architecture: [
        /\*\*Score\s+Architecture\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Architecture.*?(\d+)\/100/i,
        /Architecture.*?(\d+)\/100/i
      ],
      codeQuality: [
        /\*\*Score\s+Code\s+Quality\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Code\s+Quality.*?(\d+)\/100/i,
        /Code\s+Quality.*?(\d+)\/100/i
      ],
      documentation: [
        /\*\*Score\s+Documentation\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Documentation.*?(\d+)\/100/i,
        /Documentation.*?(\d+)\/100/i
      ],
      security: [
        /\*\*Score\s+Security\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Security.*?(\d+)\/100/i,
        /Security.*?(\d+)\/100/i
      ],
      performance: [
        /\*\*Score\s+Performance\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Performance.*?(\d+)\/100/i,
        /Performance.*?(\d+)\/100/i
      ],
      dependency: [
        /\*\*Score\s+Dependency\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Dependency.*?(\d+)\/100/i,
        /Dependency.*?(\d+)\/100/i
      ],
      testing: [
        /\*\*Score\s+Testing\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Testing.*?(\d+)\/100/i,
        /Testing.*?(\d+)\/100/i
      ],
      accessibility: [
        /\*\*Score\s+Accessibility\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Accessibility.*?(\d+)\/100/i,
        /Accessibility.*?(\d+)\/100/i
      ],
      apiDesign: [
        /\*\*Score\s+API\s+Design\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+API\s+Design.*?(\d+)\/100/i,
        /API\s+Design.*?(\d+)\/100/i
      ],
      implementationTracking: [
        /\*\*Score\s+Implementation\s+Tracking\*\*\s*\|\s*(\d+)\/100/i,
        /Score\s+Implementation\s+Tracking.*?(\d+)\/100/i,
        /Implementation\s+Tracking.*?(\d+)\/100/i
      ]
    };

    // Extrair cada score
    Object.keys(scorePatterns).forEach(key => {
      for (const pattern of scorePatterns[key]) {
        const match = content.match(pattern);
        if (match) {
          scores[key] = parseInt(match[1]);
          break;
        }
      }
    });

    // Extrair scores individuais
    const archMatch = content.match(/\*\*Score\s+Architecture\*\*\s*\|\s*(\d+)\/100/);
    if (archMatch) scores.architecture = parseInt(archMatch[1]);

    const codeMatch = content.match(/\*\*Score\s+Code\s+Quality\*\*\s*\|\s*(\d+)\/100/);
    if (codeMatch) scores.codeQuality = parseInt(codeMatch[1]);

    const docsMatch = content.match(/\*\*Score\s+Documentation\*\*\s*\|\s*(\d+)\/100/);
    if (docsMatch) scores.documentation = parseInt(docsMatch[1]);

    // Extrair issues críticos
    const criticalIssues = [];
    const criticalSection = content.match(/## 🚨 Preocupações Críticas.*?##/s);
    if (criticalSection) {
      const issueMatches = criticalSection[0].matchAll(/\| P0-\d+ \| (.+?) \|/g);
      for (const match of issueMatches) {
        criticalIssues.push({ message: match[1].trim(), priority: 'P0' });
      }
    }

    // Extrair issues alta prioridade
    const highIssues = [];
    const highSection = content.match(/## ⚠️ Preocupações de Alta Prioridade.*?##/s);
    if (highSection) {
      const issueMatches = highSection[0].matchAll(/\| P1-\d+ \| (.+?) \|/g);
      for (const match of issueMatches) {
        highIssues.push({ message: match[1].trim(), priority: 'P1' });
      }
    }

    // Extrair workflow ID
    const workflowIdMatch = content.match(/\*\*Workflow ID:\*\*\s*(.+)/);
    const workflowId = workflowIdMatch ? workflowIdMatch[1].trim() : '';

    // Extrair timestamp
    const timestampMatch = content.match(/\*\*Data:\*\*\s*(.+)/);
    const timestamp = timestampMatch ? new Date(timestampMatch[1].trim()).toISOString() : new Date().toISOString();

    // Gerar plano de ação se for NO-GO ou GO WITH CONCERNS
    const actionPlan = (decision === 'NO-GO' || decision === 'NO') ? generateActionPlan(criticalIssues, highIssues, scores) : null;

    return {
      id: workflowId || Date.now().toString(),
      decision,
      justification,
      confidence,
      scores,
      concerns: {
        critical: criticalIssues,
        high: highIssues
      },
      actionPlan, // Plano para transformar NO-GO em GO
      timestamp,
      status: 'pending' // TODAS as decisões precisam de aprovação (GO, NO-GO, GO WITH CONCERNS)
    };
  } catch (error) {
    console.error('Erro ao parsear relatório:', error);
    return null;
  }
}

// Função para executar workflow
async function runWorkflow() {
  const workflowScript = path.join(__dirname, '..', 'scripts', 'run-workflow.js');
  
  return new Promise((resolve, reject) => {
    const process = exec(`node "${workflowScript}" --skip-approval`, {
      cwd: WORKSPACE_ROOT,
      maxBuffer: 10 * 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        // Mesmo com erro, pode ter gerado resultados
        resolve({ success: false, error: error.message, stdout, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });

    // Capturar logs em tempo real
    process.stdout.on('data', (data) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: data.toString().trim()
      };
      logs.push(logEntry);
      if (logs.length > 1000) logs.shift(); // Limitar a 1000 logs
    });

    process.stderr.on('data', (data) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: data.toString().trim()
      };
      logs.push(logEntry);
      if (logs.length > 1000) logs.shift();
    });
  });
}

// Rotas

// Servir página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Servir dashboard
// Real-time monitoring dashboard
app.get('/realtime-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'realtime-dashboard.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Status atual
app.get('/api/status', async (req, res) => {
  try {
    const reportPath = path.join(DECISIONS_DIR, 'go-no-go-report.md');
    const report = parseGoNoGoReport(reportPath);

    // Determinar fase atual
    let currentPhase = 0;
    const resultsDir = path.join(RESULTS_DIR);
    if (fs.existsSync(resultsDir)) {
      const hasResults = fs.readdirSync(resultsDir).some(dir => {
        const dirPath = path.join(resultsDir, dir);
        return fs.statSync(dirPath).isDirectory() && fs.readdirSync(dirPath).length > 0;
      });
      if (hasResults) currentPhase = 1;
    }

    const evalsDir = path.join(SHARED_DIR, 'evaluations');
    if (fs.existsSync(evalsDir) && fs.readdirSync(evalsDir).length > 0) {
      currentPhase = 2;
    }

    if (report) {
      currentPhase = 3;
      if (report.status === 'approved' || report.status === 'rejected') {
        currentPhase = 4;
      }
    }

    // Determinar status real baseado em arquivos
    let actualStatus = 'pending';
    if (currentPhase === 4) {
      actualStatus = 'complete';
    } else if (currentPhase === 3) {
      // Se há decisão mas não foi aprovada, workflow está completo aguardando aprovação
      actualStatus = 'complete';
    } else if (currentPhase > 0) {
      // Verificar se workflow está realmente rodando ou se já completou
      const progressFile = path.join(SHARED_DIR, 'workflow-progress.json');
      if (fs.existsSync(progressFile)) {
        try {
          const savedProgress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
          if (savedProgress.workflowStatus === 'complete') {
            actualStatus = 'complete';
          } else if (savedProgress.workflowStatus === 'running') {
            actualStatus = 'running';
          }
        } catch (error) {
          // Se não conseguir ler, usar lógica padrão
        }
      }
    }

    // Obter status do Firebase (não bloqueia se houver erro)
    let firebaseStatus = {
      connected: SYNC_ENABLED,
      mode: SYNC_MODE
    };
    
    try {
      const { validateConnection } = await import('../firebase/connection.js');
      const validation = await validateConnection();
      firebaseStatus = {
        connected: validation.connected,
        mode: validation.mode,
        projectId: validation.projectId
      };
    } catch (error) {
      // Firebase não disponível, usar status básico
      firebaseStatus.error = error.message;
    }

    if (report) {
      res.json({
        success: true,
        status: actualStatus,
        currentPhase,
        scores: report.scores || {},
        decision: report.decision,
        timestamp: report.timestamp,
        firebase: firebaseStatus
      });
    } else {
      // Tentar ler scores dos resultados individuais
      const scores = { overall: 0 };
      
      const agentDirs = {
        'architecture-review': 'architecture',
        'code-quality-review': 'codeQuality',
        'document-analysis': 'documentation',
        'security-audit': 'security',
        'performance-analysis': 'performance',
        'dependency-management': 'dependency'
      };

      Object.entries(agentDirs).forEach(([dir, key]) => {
        const resultDir = path.join(RESULTS_DIR, dir);
        if (fs.existsSync(resultDir)) {
          // Tentar ler do arquivo latest.json primeiro
          const latestJson = readJSONFile(path.join(resultDir, 'latest.json'));
          if (latestJson && latestJson.score !== undefined) {
            scores[key] = latestJson.score;
          } else {
            // Tentar ler dos arquivos .md
            const files = fs.readdirSync(resultDir).filter(f => f.endsWith('.md'));
            const latestFile = files.sort().reverse()[0];
            
            if (latestFile) {
              const content = fs.readFileSync(path.join(resultDir, latestFile), 'utf-8');
              // Procurar por padrões de score
              const scorePatterns = [
                /Score[:\s]+(\d+)/i,
                /Score:\s*(\d+)/i,
                /Overall Score[:\s]+(\d+)/i,
                /(\d+)\s*\/\s*100/i
              ];
              
              for (const pattern of scorePatterns) {
                const match = content.match(pattern);
                if (match) {
                  scores[key] = parseInt(match[1]);
                  break;
                }
              }
            }
          }
        }
      });

      // Calcular overall
      const values = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
      scores.overall = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

      res.json({
        success: true,
        status: actualStatus,
        currentPhase,
        scores,
        decision: 'UNKNOWN',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Executar workflow
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
            'dependency': { name: 'Dependency Management', status: 'pending', progress: 0 }
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
        console.error('Erro ao ler progresso:', error);
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
    console.error('Erro ao atualizar progresso:', error);
  }
}

app.post('/api/workflow/run', async (req, res) => {
  try {
    // Verificar se deve executar em background
    const runInBackground = req.body.background !== false; // Default: true

    if (runInBackground && backgroundJobs) {
      // Executar em background
      const job = await backgroundJobs.startBackgroundJob('workflow', {
        phase: req.body.phase || 'all',
        env: {
          PROJECT_ID: req.body.projectId,
          PROJECT_DIR: req.body.projectDir
        }
      });

      res.json({
        success: true,
        jobId: job.jobId,
        status: job.status,
        message: 'Workflow iniciado em background'
      });
    } else {
      // Executar síncrono (compatibilidade)
      updateProgress(null, null, 'running', 0);
      
      const result = await runWorkflow();

      // Após executar, verificar se há novo relatório e salvar aprovação
      setTimeout(async () => {
        const reportPath = path.join(DECISIONS_DIR, 'go-no-go-report.md');
        const report = parseGoNoGoReport(reportPath);
        
        if (report && approvalsHelper) {
          // Salvar no Firestore
          await approvalsHelper.saveApprovalToFirestore(report, {
            approvalId: report.id,
            filePath: reportPath
          });
        } else if (report) {
          // Fallback: salvar em arquivo
          const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
          const allApprovals = readJSONFile(approvalsFile) || [];
          const existingIndex = allApprovals.findIndex(a => a.id === report.id);
          
          if (existingIndex >= 0) {
            allApprovals[existingIndex] = report;
          } else {
            allApprovals.push(report);
          }
          
          writeJSONFile(approvalsFile, allApprovals);
        }
      }, 2000);

      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Executar Implementation Agent manualmente
app.post('/api/implementation/run', async (req, res) => {
  try {
    const { maxTasks = 10, autoCommit = true, dryRun = false } = req.body;
    
    // Importar dinamicamente para evitar erro se não existir
    const { runImplementationAgent } = await import('../agents/implementation-agent.js');
    
    const result = await runImplementationAgent({
      maxTasks,
      autoCommit,
      dryRun
    });

    res.json({
      success: true,
      result: {
        id: result.id,
        tasksProcessed: result.tasksProcessed,
        tasksCompleted: result.tasksCompleted,
        tasksError: result.tasksError,
        successRate: result.successRate,
        metrics: result.metrics,
        reportPath: result.id ? path.join(SHARED_DIR, 'implementations', result.id, 'implementation-report.md') : null
      }
    });
  } catch (error) {
    console.error('Erro ao executar Implementation Agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar implementações
app.get('/api/implementations', (req, res) => {
  try {
    const implementations = [];
    
    if (fs.existsSync(IMPLEMENTATIONS_DIR)) {
      const dirs = fs.readdirSync(IMPLEMENTATIONS_DIR).filter(dir => {
        const dirPath = path.join(IMPLEMENTATIONS_DIR, dir);
        return fs.statSync(dirPath).isDirectory();
      });

      for (const dir of dirs) {
        const reportPath = path.join(IMPLEMENTATIONS_DIR, dir, 'implementation-report.md');
        if (fs.existsSync(reportPath)) {
          const stats = fs.statSync(reportPath);
          implementations.push({
            id: dir,
            timestamp: stats.mtime.toISOString(),
            reportPath: path.relative(SHARED_DIR, reportPath)
          });
        }
      }
    }

    implementations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ success: true, implementations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar aprovações pendentes
app.get('/api/approvals/pending', async (req, res) => {
  try {
    if (approvalsHelper) {
      // Usar Firestore
      const pending = await approvalsHelper.listApprovalsFromFirestore({
        status: 'pending',
        limitCount: 100
      });
      res.json({ success: true, approvals: pending });
    } else {
      // Fallback: carregar do arquivo
      const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
      const saved = readJSONFile(approvalsFile);
      const pending = (saved || [])
        .filter(a => a.status === 'pending')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json({ success: true, approvals: pending });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar backlog
app.get('/api/approvals/backlog', async (req, res) => {
  try {
    if (approvalsHelper) {
      // Usar Firestore
      const backlog = await approvalsHelper.listApprovalsFromFirestore({
        limitCount: 20
      });
      res.json({ success: true, backlog });
    } else {
      // Fallback: carregar do arquivo
      const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
      const saved = readJSONFile(approvalsFile);
      const backlog = (saved || [])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
      res.json({ success: true, backlog });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Aprovar decisão
app.post('/api/approvals/:id/approve', async (req, res) => {
  try {
    const id = req.params.id;

    if (approvalsHelper) {
      // Usar Firestore
      const result = await approvalsHelper.updateApprovalStatus(id, 'approved', {
        approvedBy: req.body.user || 'Usuário',
        approvedAt: new Date().toISOString()
      });

      if (result.success) {
        const approval = await approvalsHelper.loadApprovalFromFirestore(id);
        res.json({ success: true, approval });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } else {
      // Fallback: usar arquivo
      const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
      const allApprovals = readJSONFile(approvalsFile) || [];
      const approval = allApprovals.find(a => a.id === id);

      if (!approval) {
        return res.status(404).json({ success: false, error: 'Aprovação não encontrada' });
      }

      approval.status = 'approved';
      approval.approvedBy = req.body.user || 'Usuário';
      approval.approvedAt = new Date().toISOString();

      writeJSONFile(approvalsFile, allApprovals);
      res.json({ success: true, approval });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rejeitar decisão
app.post('/api/approvals/:id/reject', async (req, res) => {
  try {
    const id = req.params.id;

    if (approvalsHelper) {
      // Usar Firestore
      const result = await approvalsHelper.updateApprovalStatus(id, 'rejected', {
        rejectedBy: req.body.user || 'Usuário',
        rejectedAt: new Date().toISOString(),
        rejectionReason: req.body.reason || ''
      });

      if (result.success) {
        const approval = await approvalsHelper.loadApprovalFromFirestore(id);
        res.json({ success: true, approval });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } else {
      // Fallback: usar arquivo
      const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
      const allApprovals = readJSONFile(approvalsFile) || [];
      const approval = allApprovals.find(a => a.id === id);

      if (!approval) {
        return res.status(404).json({ success: false, error: 'Aprovação não encontrada' });
      }

      approval.status = 'rejected';
      approval.rejectedBy = req.body.user || 'Usuário';
      approval.rejectedAt = new Date().toISOString();
      approval.rejectionReason = req.body.reason || '';

      writeJSONFile(approvalsFile, allApprovals);
      res.json({ success: true, approval });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ver relatório completo
app.get('/api/approvals/:id/report', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Primeiro, tentar buscar o relatório específico por ID nos resultados
    // Se não encontrar, usar o relatório mais recente
    let reportPath = path.join(DECISIONS_DIR, 'go-no-go-report.md');
    
    // Verificar se há um relatório específico salvo para esse ID
    let approval = null;
    if (approvalsHelper) {
      approval = await approvalsHelper.loadApprovalFromFirestore(id);
    } else {
      const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
      const allApprovals = readJSONFile(approvalsFile) || [];
      approval = allApprovals.find(a => a.id === id);
    }
    
    if (approval && approval.timestamp) {
      // Tentar encontrar relatório histórico (se existir sistema de versionamento)
      const historicalPath = path.join(DECISIONS_DIR, `${id}-report.md`);
      if (fs.existsSync(historicalPath)) {
        reportPath = historicalPath;
      }
    }
    
    // Se não encontrou específico, usar o mais recente
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      // Verificar se o ID do relatório corresponde ao solicitado
      const workflowIdMatch = content.match(/\*\*Workflow ID:\*\*\s*(.+)/);
      const workflowId = workflowIdMatch ? workflowIdMatch[1].trim() : '';
      
      // Se o ID não corresponde mas é o mais recente, retornar mesmo assim
      // (para compatibilidade com relatórios antigos que não foram versionados)
      res.setHeader('Content-Type', 'text/markdown');
      res.send(content);
    } else {
      res.status(404).json({ success: false, error: 'Relatório não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logs
app.get('/api/logs', (req, res) => {
  res.json({ success: true, logs: logs.slice(-100) }); // Últimos 100 logs
});

// Dashboard endpoints

// Agentes
app.get('/api/agents', (req, res) => {
  try {
    const agents = [];
    const agentDirs = [
      'product-manager',
      'architecture-review', 
      'code-quality-review', 
      'document-analysis', 
      'security-audit', 
      'performance-analysis', 
      'dependency-management',
      'testing-coverage',
      'accessibility-audit',
      'api-design-review',
      'implementation-tracking'
    ];
    const agentConfig = {
      'product-manager': { name: 'Product Manager', icon: '📋' },
      'architecture-review': { name: 'Architecture', icon: '🏗️' },
      'code-quality-review': { name: 'Code Quality', icon: '✅' },
      'document-analysis': { name: 'Document Analysis', icon: '📚' },
      'security-audit': { name: 'Security', icon: '🔒' },
      'performance-analysis': { name: 'Performance', icon: '⚡' },
      'dependency-management': { name: 'Dependency', icon: '📦' },
      'testing-coverage': { name: 'Testing Coverage', icon: '🧪' },
      'accessibility-audit': { name: 'Accessibility', icon: '♿' },
      'api-design-review': { name: 'API Design', icon: '🔌' },
      'implementation-tracking': { name: 'Implementation Tracking', icon: '🔄' }
    };

    agentDirs.forEach(dir => {
      const resultDir = path.join(RESULTS_DIR, dir);
      if (fs.existsSync(resultDir)) {
        const files = fs.readdirSync(resultDir).filter(f => f.endsWith('.md'));
        const latestFile = files.sort().reverse()[0];
        
        if (latestFile) {
          const content = fs.readFileSync(path.join(resultDir, latestFile), 'utf-8');
          const scoreMatch = content.match(/Score[:\s]+(\d+)/i);
          const issuesMatch = content.match(/(\d+)\s+issues?/i) || content.match(/Issues[:\s]+(\d+)/i);
          
          agents.push({
            name: agentConfig[dir].name,
            icon: agentConfig[dir].icon,
            status: 'complete',
            score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
            issues: issuesMatch ? parseInt(issuesMatch[1]) : 0,
            lastRun: latestFile
          });
        } else {
          agents.push({
            name: agentConfig[dir].name,
            icon: agentConfig[dir].icon,
            status: 'pending',
            score: 0,
            issues: 0
          });
        }
      } else {
        agents.push({
          name: agentConfig[dir].name,
          icon: agentConfig[dir].icon,
          status: 'pending',
          score: 0,
          issues: 0
        });
      }
    });

    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scores
app.get('/api/scores', (req, res) => {
  try {
    const reportPath = path.join(DECISIONS_DIR, 'go-no-go-report.md');
    const report = parseGoNoGoReport(reportPath);
    
    if (report && report.scores) {
      res.json({ success: true, scores: report.scores });
    } else {
      // Ler dos resultados individuais
      const scores = { overall: 0 };
      
      const agentDirs = {
        'architecture-review': 'architecture',
        'code-quality-review': 'codeQuality',
        'document-analysis': 'documentation',
        'security-audit': 'security',
        'performance-analysis': 'performance',
        'dependency-management': 'dependency'
      };

      Object.entries(agentDirs).forEach(([dir, key]) => {
        const resultDir = path.join(RESULTS_DIR, dir);
        if (fs.existsSync(resultDir)) {
          const files = fs.readdirSync(resultDir).filter(f => f.endsWith('.md'));
          const latestFile = files.sort().reverse()[0];
          
          if (latestFile) {
            const content = fs.readFileSync(path.join(resultDir, latestFile), 'utf-8');
            // Procurar score com múltiplos padrões
            const scorePatterns = [
              /Score[:\s]+(\d+)/i,
              /Score:\s*(\d+)/i,
              /Overall Score[:\s]+(\d+)/i,
              /(\d+)\s*\/\s*100/i,
              /Score arquitetural[:\s]+(\d+)/i,
              /Score geral[:\s]+(\d+)/i
            ];
            
            for (const pattern of scorePatterns) {
              const match = content.match(pattern);
              if (match) {
                scores[key] = parseInt(match[1]);
                break;
              }
            }
          }
        }
      });

      // Calcular overall
      const values = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
      scores.overall = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

      res.json({ success: true, scores });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Decisões
app.get('/api/decisions', (req, res) => {
  try {
    const reportPath = path.join(DECISIONS_DIR, 'go-no-go-report.md');
    const report = parseGoNoGoReport(reportPath);
    
    const decisions = [];
    if (report) {
      decisions.push({
        id: report.id,
        decision: report.decision,
        score: report.scores?.overall || 0,
        issuesP0: report.concerns?.critical?.length || 0,
        issuesP1: report.concerns?.high?.length || 0,
        timestamp: report.timestamp
      });
    }

    res.json({ success: true, decisions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backlog
app.get('/api/backlog', (req, res) => {
  try {
    const backlogPath = path.join(SHARED_DIR, 'backlog', 'current-backlog.json');
    const backlog = readJSONFile(backlogPath);
    
    if (backlog && backlog.tasks) {
      res.json({ success: true, tasks: backlog.tasks, summary: backlog.summary });
    } else {
      res.json({ success: true, tasks: [], summary: { totalTasks: 0 } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Função para remover códigos ANSI
function stripAnsiCodes(str) {
  if (!str) return '';
  return str
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove códigos ANSI de cor
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '') // Remove outros códigos ANSI
    .replace(/\[1m/g, '') // Remove bold
    .replace(/\[0m/g, '') // Remove reset
    .replace(/\[36m/g, '') // Remove cyan
    .replace(/\[32m/g, '') // Remove green
    .replace(/\[31m/g, '') // Remove red
    .replace(/\[33m/g, '') // Remove yellow
    .trim();
}

// Função para formatar mensagem de atividade
function formatActivityMessage(message) {
  if (!message) return '';
  
  // Remover códigos ANSI
  let cleanMessage = stripAnsiCodes(message);
  
  // Remover separadores longos
  cleanMessage = cleanMessage.replace(/={3,}/g, '');
  
  // Limpar espaços múltiplos
  cleanMessage = cleanMessage.replace(/\s+/g, ' ').trim();
  
  // Extrair informações importantes
  if (cleanMessage.includes('FASE')) {
    const faseMatch = cleanMessage.match(/FASE\s+(\d+):\s*(.+)/i);
    if (faseMatch) {
      return `Fase ${faseMatch[1]}: ${faseMatch[2]}`;
    }
  }
  
  // Remover prefixos comuns
  cleanMessage = cleanMessage.replace(/^(✓|📊|🔍|📈|🎯|📋|📤|⏭️|✅|📁|🚨|⚠️)\s*/g, '');
  
  return cleanMessage;
}

// Progresso do workflow
// Progress endpoint - usa Firestore híbrido
app.get('/api/progress', async (req, res) => {
  try {
    let progress = {
      workflowStatus: 'idle', // idle, running, complete, error
      currentPhase: 0, // 0: idle, 1: execution, 2: evaluation, 3: decision, 4: complete
      phases: {
        execution: {
          name: 'Execução dos Agentes',
          status: 'pending', // pending, running, complete, error
          progress: 0,
          agents: {
            'product-manager': { name: 'Product Manager', status: 'pending', progress: 0 },
            'architecture': { name: 'Architecture Review', status: 'pending', progress: 0 },
            'code-quality': { name: 'Code Quality Review', status: 'pending', progress: 0 },
            'document-analysis': { name: 'Document Analysis', status: 'pending', progress: 0 },
            'security': { name: 'Security Audit', status: 'pending', progress: 0 },
            'performance': { name: 'Performance Analysis', status: 'pending', progress: 0 },
            'dependency': { name: 'Dependency Management', status: 'pending', progress: 0 }
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
      startTime: null,
      endTime: null,
      timestamp: new Date().toISOString()
    };

    // Verificar status real baseado em arquivos PRIMEIRO (sempre usar estado real)
    const hasResults = fs.existsSync(RESULTS_DIR) && 
      fs.readdirSync(RESULTS_DIR).some(dir => {
        const dirPath = path.join(RESULTS_DIR, dir);
        return fs.statSync(dirPath).isDirectory() && fs.readdirSync(dirPath).length > 0;
      });

    const hasEvaluations = fs.existsSync(path.join(SHARED_DIR, 'evaluations')) &&
      fs.readdirSync(path.join(SHARED_DIR, 'evaluations')).length > 0;

    const hasDecision = fs.existsSync(path.join(DECISIONS_DIR, 'go-no-go-report.md'));
    
    // Verificar timestamp do relatório para determinar se é recente
    let decisionTimestamp = null;
    if (hasDecision) {
      try {
        const stats = fs.statSync(path.join(DECISIONS_DIR, 'go-no-go-report.md'));
        decisionTimestamp = stats.mtime;
      } catch (error) {
        // Ignorar erro
      }
    }

    // Atualizar status baseado em arquivos (sempre sobrescrever com estado real)
    if (hasDecision) {
      progress.currentPhase = 3;
      progress.phases.execution.status = 'complete';
      progress.phases.evaluation.status = 'complete';
      progress.phases.decision.status = 'complete';
      progress.workflowStatus = 'complete'; // Workflow completou, mesmo sem aprovação
      progress.endTime = progress.endTime || (decisionTimestamp ? decisionTimestamp.toISOString() : new Date().toISOString());
      
      // Calcular progresso dos agentes baseado em resultados
      const agentDirs = [
        'product-manager', 
        'architecture-review', 
        'code-quality-review', 
        'document-analysis', 
        'security-audit', 
        'performance-analysis', 
        'dependency-management',
        'testing-coverage',
        'accessibility-audit',
        'api-design-review',
        'implementation-tracking'
      ];
      agentDirs.forEach(dir => {
        const resultDir = path.join(RESULTS_DIR, dir);
        if (fs.existsSync(resultDir) && fs.readdirSync(resultDir).length > 0) {
          let key = dir.replace('-review', '').replace('-analysis', '').replace('-audit', '').replace('-management', '').replace('-coverage', '');
          // Mapear nomes específicos
          if (dir === 'api-design-review') key = 'api-design';
          if (dir === 'implementation-tracking') key = 'implementation-tracking';
          if (progress.phases.execution.agents[key]) {
            progress.phases.execution.agents[key].status = 'complete';
            progress.phases.execution.agents[key].progress = 100;
          }
        }
      });
      
      progress.phases.execution.progress = 100;
      progress.phases.evaluation.progress = 100;
      progress.phases.decision.progress = 100;
    } else if (hasEvaluations) {
      progress.currentPhase = 2;
      progress.phases.execution.status = 'complete';
      progress.phases.execution.progress = 100;
      progress.phases.evaluation.status = 'complete';
      progress.phases.evaluation.progress = 100;
      // Se não há decisão ainda, workflow pode estar rodando ou travado
      if (progress.workflowStatus === 'running' && !hasDecision) {
        // Manter como running se estava rodando
      } else {
        progress.workflowStatus = 'idle'; // Aguardando próxima fase
      }
    } else if (hasResults) {
      progress.currentPhase = 1;
      progress.phases.execution.status = 'complete';
      progress.phases.execution.progress = 100;
      // Se não há avaliações ainda, workflow pode estar rodando ou travado
      if (progress.workflowStatus === 'running' && !hasEvaluations) {
        // Manter como running se estava rodando
      } else {
        progress.workflowStatus = 'idle'; // Aguardando próxima fase
      }
    } else {
      // Sem resultados, workflow está idle
      progress.workflowStatus = 'idle';
      progress.currentPhase = 0;
    }

    // Carregar progresso salvo apenas para informações adicionais (não sobrescrever estado real)
    if (fs.existsSync(PROGRESS_FILE)) {
      try {
        const savedProgress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        // Manter informações úteis do progresso salvo (como startTime) mas usar estado real
        if (savedProgress.startTime && !progress.startTime) {
          progress.startTime = savedProgress.startTime;
        }
        // Atualizar timestamp
        progress.timestamp = new Date().toISOString();
      } catch (error) {
        console.error('Erro ao ler progresso:', error);
      }
    }

    // Salvar progresso atualizado (híbrido: arquivo + Firestore)
    try {
      await saveWorkflowProgress(progress);
    } catch (error) {
      console.warn('⚠️  Erro ao salvar progresso (híbrido), salvando apenas em arquivo:', error.message);
      // Fallback para arquivo
      try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      } catch (fileError) {
        console.error('Erro ao salvar progresso em arquivo:', fileError);
      }
    }

    res.json({ success: true, progress, firestoreEnabled: SYNC_ENABLED });
  } catch (error) {
    console.error('Erro ao obter progresso:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API para métricas em tempo real
app.get('/api/metrics', (req, res) => {
  try {
    let progress = {
      workflowStatus: 'idle',
      currentPhase: 0,
      phases: {
        execution: {
          name: 'Execução dos Agentes',
          status: 'pending',
          progress: 0,
          agents: {}
        },
        evaluation: {
          name: 'Avaliação Cruzada',
          status: 'pending',
          progress: 0
        },
        decision: {
          name: 'Decisão Go/No-go',
          status: 'pending',
          progress: 0
        }
      },
      startTime: null,
      endTime: null,
      timestamp: new Date().toISOString()
    };

    // Carregar progresso real
    if (fs.existsSync(PROGRESS_FILE)) {
      try {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      } catch (error) {
        console.error('Erro ao ler progresso:', error);
      }
    }

    // Calcular métricas
    const agents = Object.values(progress.phases.execution.agents || {});
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'running').length;
    const completedAgents = agents.filter(a => a.status === 'complete').length;
    const errorAgents = agents.filter(a => a.status === 'error').length;
    const pendingAgents = agents.filter(a => a.status === 'pending').length;

    // Calcular tempo de execução
    let executionTime = 0;
    if (progress.startTime) {
      const start = new Date(progress.startTime);
      const end = progress.endTime ? new Date(progress.endTime) : new Date();
      executionTime = Math.floor((end - start) / 1000);
    }

    // Calcular progresso geral
    const overallProgress = Math.round(
      (progress.phases.execution.progress + 
       progress.phases.evaluation.progress + 
       progress.phases.decision.progress) / 3
    );

    const metrics = {
      workflow: {
        status: progress.workflowStatus,
        currentPhase: progress.currentPhase,
        overallProgress,
        executionTime
      },
      agents: {
        total: totalAgents,
        active: activeAgents,
        completed: completedAgents,
        error: errorAgents,
        pending: pendingAgents,
        completionRate: totalAgents > 0 ? Math.round((completedAgents / totalAgents) * 100) : 0
      },
      phases: {
        execution: {
          status: progress.phases.execution.status,
          progress: progress.phases.execution.progress,
          agentsCount: Object.keys(progress.phases.execution.agents || {}).length
        },
        evaluation: {
          status: progress.phases.evaluation.status,
          progress: progress.phases.evaluation.progress
        },
        decision: {
          status: progress.phases.decision.status,
          progress: progress.phases.decision.progress
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atividades
app.get('/api/activities', (req, res) => {
  try {
    const activities = [];
    
    // Adicionar logs recentes
    logs.slice(-30).forEach(log => {
      const cleanMessage = formatActivityMessage(log.message);
      if (cleanMessage && cleanMessage.length > 0) {
        // Determinar tipo baseado no conteúdo
        let type = 'info';
        if (log.level === 'error') {
          type = 'error';
        } else if (cleanMessage.includes('completou') || cleanMessage.includes('concluída') || cleanMessage.includes('✓')) {
          type = 'success';
        } else if (cleanMessage.includes('Fase') || cleanMessage.includes('FASE')) {
          type = 'workflow';
        } else if (cleanMessage.includes('Avaliação') || cleanMessage.includes('avaliando')) {
          type = 'agent';
        } else if (cleanMessage.includes('Decisão') || cleanMessage.includes('NO-GO') || cleanMessage.includes('GO')) {
          type = 'decision';
        }
        
        activities.push({
          type: type,
          time: new Date(log.timestamp).toLocaleTimeString('pt-BR'),
          message: cleanMessage
        });
      }
    });

    // Adicionar atividades dos agentes (apenas se não estiverem nos logs)
    const agentDirs = ['architecture-review', 'code-quality-review', 'document-analysis', 'security-audit', 'performance-analysis', 'dependency-management'];
    const agentNames = {
      'architecture-review': 'Architecture Review',
      'code-quality-review': 'Code Quality Review',
      'document-analysis': 'Document Analysis',
      'security-audit': 'Security Audit',
      'performance-analysis': 'Performance Analysis',
      'dependency-management': 'Dependency Management'
    };
    
    agentDirs.forEach(dir => {
      const resultDir = path.join(RESULTS_DIR, dir);
      if (fs.existsSync(resultDir)) {
        const files = fs.readdirSync(resultDir).filter(f => f.endsWith('.md'));
        const latestFile = files.sort().reverse()[0];
        
        if (latestFile) {
          const stats = fs.statSync(path.join(resultDir, latestFile));
          const agentName = agentNames[dir] || dir.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          // Verificar se já existe nos logs
          const alreadyInLogs = activities.some(a => 
            a.message.includes(agentName) && a.message.includes('completou')
          );
          
          if (!alreadyInLogs) {
            activities.push({
              type: 'agent',
              time: new Date(stats.mtime).toLocaleTimeString('pt-BR'),
              message: `${agentName} completou análise`
            });
          }
        }
      }
    });

    // Ordenar por tempo (mais recente primeiro)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, activities: activities.slice(0, 50) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Carregar aprovações salvas ao iniciar
async function loadSavedApprovals() {
  if (approvalsHelper) {
    // Carregar do Firestore
    try {
      const saved = await approvalsHelper.listApprovalsFromFirestore({ limitCount: 100 });
      console.log(`✅ Carregadas ${saved.length} aprovação(ões) do Firestore`);
    } catch (error) {
      console.warn('⚠️  Erro ao carregar aprovações do Firestore:', error.message);
    }
  }

  // SEMPRE verificar e priorizar o relatório mais recente do arquivo markdown
  const reportPath = path.join(DECISIONS_DIR, 'go-no-go-report.md');
  const report = parseGoNoGoReport(reportPath);
  
  if (report) {
    if (approvalsHelper) {
      // Salvar no Firestore
      try {
        await approvalsHelper.saveApprovalToFirestore(report, {
          approvalId: report.id,
          filePath: reportPath
        });
        console.log(`✅ Relatório mais recente salvo no Firestore: ${report.id}`);
      } catch (error) {
        console.warn('⚠️  Erro ao salvar relatório no Firestore:', error.message);
      }
    } else {
      // Fallback: salvar em arquivo
      const approvalsFile = path.join(SHARED_DIR, 'approvals.json');
      const allApprovals = readJSONFile(approvalsFile) || [];
      const existingIndex = allApprovals.findIndex(a => a.id === report.id);
      
      if (existingIndex >= 0) {
        // Se estava aprovado mas o arquivo foi atualizado, resetar para pendente
        if (allApprovals[existingIndex].status === 'approved' && 
            report.timestamp !== allApprovals[existingIndex].timestamp) {
          report.status = 'pending';
        }
        allApprovals[existingIndex] = report;
      } else {
        allApprovals.push(report);
      }
      
      writeJSONFile(approvalsFile, allApprovals);
    }
  }
}

// API: Migração de dados para Firestore
app.post('/api/firebase/migrate', async (req, res) => {
  try {
    const { migrateToFirestore } = await import('../firebase/migration.js');
    const results = await migrateToFirestore();
    res.json({ success: true, results });
  } catch (error) {
    console.error('Erro na migração:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Status do Firebase (detalhado)
app.get('/api/firebase/status', async (req, res) => {
  try {
    const { getDetailedStatus } = await import('../firebase/connection-status.js');
    const status = await getDetailedStatus();
    
    if (!status.connected) {
      return res.status(503).json(status);
    }
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API: Health Check do Firebase (simples)
app.get('/api/firebase/health', async (req, res) => {
  try {
    const { healthCheck } = await import('../firebase/connection-status.js');
    const isHealthy = await healthCheck();
    
    if (isHealthy) {
      res.json({ healthy: true, timestamp: new Date().toISOString() });
    } else {
      res.status(503).json({ healthy: false, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    res.status(503).json({ 
      healthy: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API: Status do Firebase (legacy - mantido para compatibilidade)
app.get('/api/firebase/status/legacy', async (req, res) => {
  try {
    const { db, validateConnection } = await import('../firebase/connection.js');
    const { collection, getDocs } = await import('firebase/firestore');
    
    // Testar conexão
    const testRef = collection(db, 'test');
    await getDocs(testRef);
    
    res.json({
      success: true,
      firestoreEnabled: true,
      connected: true
    });
  } catch (error) {
    res.json({
      success: false,
      firestoreEnabled: false,
      connected: false,
      error: error.message
    });
  }
});

// ============================================
// API: Multi-Project Management
// ============================================

// Servir dashboard multi-projeto
app.get('/multi-project', (req, res) => {
  res.sendFile(path.join(__dirname, 'multi-project-dashboard.html'));
});

// GET: Listar todos os projetos
app.get('/api/projects', async (req, res) => {
  try {
    const projectsManager = await import('../config/projects-manager.js');
    const projects = projectsManager.getAllProjects();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Adicionar novo projeto
app.post('/api/projects', async (req, res) => {
  try {
    const { id, name, path, type, firebaseProjectId } = req.body;
    
    if (!id || !name || !path) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID, nome e caminho são obrigatórios' 
      });
    }
    
    const projectsManager = await import('../config/projects-manager.js');
    const result = projectsManager.addProject({
      id,
      name,
      path,
      type: type || 'unknown',
      firebaseProjectId: firebaseProjectId || null
    });
    
    if (result.success) {
      res.json({ success: true, project: result.project });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Obter projeto específico
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectsManager = await import('../config/projects-manager.js');
    const project = projectsManager.getProject(id);
    
    if (project) {
      res.json({ success: true, project });
    } else {
      res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remover projeto
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectsManager = await import('../config/projects-manager.js');
    const result = projectsManager.removeProject(id);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Executar análise em um projeto específico
app.post('/api/projects/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const projectsManager = await import('../config/projects-manager.js');
    const project = projectsManager.getProject(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }
    
    // Validar projeto
    const validation = projectsManager.validateProject(id);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    // Executar workflow em background para o projeto específico
    // Por enquanto, retornar sucesso e executar em background
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Executar workflow com variável de ambiente para o projeto
    const projectPath = path.join(WORKSPACE_ROOT, project.path);
    process.env.PROJECT_DIR = projectPath;
    process.env.PROJECT_ID = id;
    
    // Executar em background (não bloquear resposta)
    execAsync(`cd "${WORKSPACE_ROOT}/maestro-workflow" && PROJECT_ID=${id} PROJECT_DIR="${projectPath}" node src/scripts/run-workflow.js`, {
      cwd: WORKSPACE_ROOT,
      env: { ...process.env, PROJECT_ID: id, PROJECT_DIR: projectPath }
    }).catch(err => {
      console.error(`Erro ao executar análise do projeto ${id}:`, err);
    });
    
    res.json({ 
      success: true, 
      message: 'Análise iniciada em background',
      projectId: id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Obter resultados de um projeto específico
app.get('/api/projects/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const { db } = await import('../firebase/connection.js');
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const resultsQuery = query(
      collection(db, 'maestro/results'),
      where('projectId', '==', id),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(resultsQuery);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoints de Background Jobs
app.get('/api/jobs', (req, res) => {
  try {
    if (!backgroundJobs) {
      return res.status(503).json({ success: false, error: 'Background jobs não disponível' });
    }
    
    const { status, limit } = req.query;
    const jobs = backgroundJobs.listJobs({
      status: status || null,
      limitCount: limit ? parseInt(limit) : 50
    });
    
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    if (!backgroundJobs) {
      return res.status(503).json({ success: false, error: 'Background jobs não disponível' });
    }
    
    const { id } = req.params;
    const job = backgroundJobs.getJobStatus(id);
    
    if (job) {
      res.json({ success: true, job });
    } else {
      res.status(404).json({ success: false, error: 'Job não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/jobs/:id/cancel', async (req, res) => {
  try {
    if (!backgroundJobs) {
      return res.status(503).json({ success: false, error: 'Background jobs não disponível' });
    }
    
    const { id } = req.params;
    const result = await backgroundJobs.cancelJob(id);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🎭 Maestro Web Server rodando em http://localhost:${PORT}`);
  
  // Carregar aprovações
  await loadSavedApprovals();
  
  // Mostrar status do Firebase
  if (SYNC_ENABLED) {
    console.log(`🔥 Firebase sincronização: ${SYNC_MODE}`);
  } else {
    console.log(`📁 Modo: Sistema de arquivos apenas`);
  }
  
  // Mostrar status de melhorias
  if (approvalsHelper) {
    console.log(`✅ Aprovações: Persistência no Firestore habilitada`);
  } else {
    console.log(`⚠️  Aprovações: Modo fallback (arquivo)`);
  }
  
  if (backgroundJobs) {
    console.log(`✅ Background Jobs: Habilitado (max 3 concorrentes)`);
  } else {
    console.log(`⚠️  Background Jobs: Não disponível`);
  }
});

