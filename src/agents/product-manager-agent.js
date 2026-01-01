/**
 * Product Manager Agent
 * Avalia status de desenvolvimento, cria backlog, aciona Maestro
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
const KNOWLEDGE_DIR = config.KNOWLEDGE_DIR;
const PRODUCT_DIR = config.PRODUCT_DIR;
const PROJECT_DIR = config.PROJECT_DIR;
const SHARED_DIR = path.join(__dirname, '../../shared');
const BACKLOG_DIR = path.join(SHARED_DIR, 'backlog');
const RESULTS_DIR = path.join(SHARED_DIR, 'results', 'product-manager');

/**
 * Executa análise do Product Manager
 */
export async function runProductManagerAnalysis() {
  try {
    ensureDirectories();
    
    console.log('📊 Product Manager Agent: Iniciando análise...');
    
    // 1. Ler roadmap e milestones
    console.log('📖 Lendo roadmap e milestones...');
    const roadmap = await readRoadmap();
    
    // 2. Analisar código atual
    console.log('🔍 Analisando código atual...');
    const currentStatus = await analyzeCurrentCode();
    
    // 3. Comparar com milestones
    console.log('⚖️ Comparando progresso vs. objetivos...');
    const gaps = await compareWithMilestones(roadmap, currentStatus);
    
    // 4. Gerar backlog
    console.log('📋 Gerando backlog de tarefas...');
    const backlog = await generateBacklog(gaps);
    
    // 5. Salvar backlog
    console.log('💾 Salvando backlog...');
    await saveBacklog(backlog);
    
    // 6. Gerar relatório de status
    console.log('📄 Gerando relatório de status...');
    await generateStatusReport(roadmap, currentStatus, gaps, backlog);
    
    // 7. Acionar Maestro
    console.log('🚀 Acionando Maestro...');
    await notifyMaestro(backlog.backlogId);
    
    console.log('✅ Product Manager Agent: Análise completa!');
    
    return {
      success: true,
      backlogId: backlog.backlogId,
      tasksCreated: backlog.tasks.length,
      backlogPath: path.join(BACKLOG_DIR, `${backlog.backlogId}.json`)
    };
  } catch (error) {
    console.error('❌ Erro no Product Manager Agent:', error);
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
  const dirs = [BACKLOG_DIR, RESULTS_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Lê roadmap e milestones
 */
async function readRoadmap() {
  const roadmapPath = path.join(PRODUCT_DIR, 'ROADMAP.md');
  const backlogPath = path.join(PRODUCT_DIR, 'BACKLOG.md');
  const buildSummaryPath = path.join(KNOWLEDGE_DIR, 'implementation', 'BUILD_SUMMARY.md');
  
  const roadmap = {
    milestones: [],
    features: [],
    deadlines: {}
  };
  
  // Ler ROADMAP.md
  if (fs.existsSync(roadmapPath)) {
    const content = fs.readFileSync(roadmapPath, 'utf-8');
    
    // Extrair milestones (simplificado - pode ser melhorado com parsing mais sofisticado)
    const milestoneMatches = content.matchAll(/## Release (v\d+\.\d+)[\s\S]*?Status:.*?(\w+)/g);
    for (const match of milestoneMatches) {
      const version = match[1];
      const status = match[2];
      
      // Extrair features do milestone
      const milestoneSection = content.split(`## Release ${version}`)[1]?.split('## Release')[0] || '';
      const featureMatches = milestoneSection.matchAll(/- \*\*(.+?)\*\*/g);
      const features = Array.from(featureMatches).map(m => m[1]);
      
      roadmap.milestones.push({
        version,
        status: status.toLowerCase(),
        features: features,
        deadline: extractDeadline(milestoneSection)
      });
    }
  }
  
  // Ler BACKLOG.md
  if (fs.existsSync(backlogPath)) {
    const content = fs.readFileSync(backlogPath, 'utf-8');
    // Extrair features do backlog
    const featureMatches = content.matchAll(/- \*\*(.+?)\*\*/g);
    roadmap.features = Array.from(featureMatches).map(m => m[1]);
  }
  
  return roadmap;
}

/**
 * Extrai deadline de uma seção
 */
function extractDeadline(section) {
  const deadlineMatch = section.match(/deadline[:\s]+(\d{4}-\d{2}-\d{2})/i);
  return deadlineMatch ? deadlineMatch[1] : null;
}

/**
 * Analisa código atual
 */
async function analyzeCurrentCode() {
  const status = {
    features: [],
    files: [],
    structure: {},
    quality: {
      hasTests: false,
      hasDocs: false,
      score: 0
    }
  };
  
  // Analisar estrutura do projeto
  if (fs.existsSync(PROJECT_DIR)) {
    status.structure = analyzeProjectStructure();
    
    // Listar arquivos principais
    const srcDir = path.join(PROJECT_DIR, 'src');
    if (fs.existsSync(srcDir)) {
      status.files = listFiles(srcDir);
    }
    
    // Verificar features implementadas (baseado em arquivos e código)
    status.features = detectFeatures();
    
    // Verificar qualidade básica
    status.quality.hasTests = fs.existsSync(path.join(PROJECT_DIR, 'tests')) || 
                               fs.existsSync(path.join(PROJECT_DIR, '__tests__'));
    status.quality.hasDocs = fs.existsSync(path.join(PROJECT_DIR, 'README.md'));
  }
  
  return status;
}

/**
 * Analisa estrutura do projeto
 */
function analyzeProjectStructure() {
  const structure = {
    hasSrc: fs.existsSync(path.join(PROJECT_DIR, 'src')),
    hasPackageJson: fs.existsSync(path.join(PROJECT_DIR, 'package.json')),
    hasConfig: fs.existsSync(path.join(PROJECT_DIR, 'firebase.json')),
    hasRules: fs.existsSync(path.join(PROJECT_DIR, 'firestore.rules'))
  };
  
  return structure;
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
 * Detecta features implementadas (baseado em análise de código)
 */
function detectFeatures() {
  const features = [];
  const srcDir = path.join(PROJECT_DIR, 'src');
  
  if (!fs.existsSync(srcDir)) return features;
  
  // Verificar App.jsx para features principais
  const appPath = path.join(srcDir, 'App.jsx');
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf-8');
    
    // Detectar features baseado em código
    if (content.includes('firebase') || content.includes('Firebase')) {
      features.push('Firebase Integration');
    }
    if (content.includes('auth') || content.includes('signIn') || content.includes('signOut')) {
      features.push('Authentication');
    }
    if (content.includes('goal') || content.includes('Goal')) {
      features.push('Goal Management');
    }
    if (content.includes('limit') || content.includes('3') || content.includes('three')) {
      features.push('3-Goal Limit');
    }
  }
  
  return features;
}

/**
 * Compara com milestones e identifica gaps
 */
async function compareWithMilestones(roadmap, currentStatus) {
  const gaps = {
    missingFeatures: [],
    incompleteFeatures: [],
    qualityIssues: [],
    documentationGaps: [],
    testGaps: []
  };
  
  // Para cada milestone
  for (const milestone of roadmap.milestones) {
    if (milestone.status === 'completed' || milestone.status === 'shipped') {
      continue; // Milestone já completo
    }
    
    // Verificar features do milestone
    for (const feature of milestone.features) {
      const isImplemented = currentStatus.features.some(f => 
        f.toLowerCase().includes(feature.toLowerCase()) || 
        feature.toLowerCase().includes(f.toLowerCase())
      );
      
      if (!isImplemented) {
        gaps.missingFeatures.push({
          feature,
          milestone: milestone.version,
          priority: milestone.deadline ? 'P1' : 'P2'
        });
      }
    }
  }
  
  // Verificar qualidade
  if (!currentStatus.quality.hasTests) {
    gaps.testGaps.push({
      issue: 'Testes não encontrados',
      priority: 'P1'
    });
  }
  
  if (!currentStatus.quality.hasDocs) {
    gaps.documentationGaps.push({
      issue: 'README.md não encontrado ou incompleto',
      priority: 'P1'
    });
  }
  
  // Verificar estrutura
  if (!currentStatus.structure.hasSrc) {
    gaps.qualityIssues.push({
      issue: 'Diretório src/ não encontrado',
      priority: 'P0'
    });
  }
  
  return gaps;
}

/**
 * Gera backlog de tarefas
 */
async function generateBacklog(gaps) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backlogId = `backlog-${timestamp}`;
  
  const tasks = [];
  let taskId = 1;
  
  // Criar tarefas para features faltantes
  for (const gap of gaps.missingFeatures) {
    tasks.push({
      id: `task-${String(taskId).padStart(3, '0')}`,
      title: `Implementar ${gap.feature}`,
      type: 'feature',
      priority: gap.priority,
      effort: estimateEffort(gap.feature),
      description: `Implementar feature "${gap.feature}" conforme especificado no milestone ${gap.milestone}`,
      acceptanceCriteria: [
        `Feature "${gap.feature}" funciona conforme especificação`,
        'Testes unitários passam',
        'Documentação atualizada'
      ],
      dependencies: [],
      milestone: gap.milestone,
      status: 'todo',
      createdAt: new Date().toISOString()
    });
    taskId++;
  }
  
  // Criar tarefas para issues de qualidade
  for (const issue of gaps.qualityIssues) {
    tasks.push({
      id: `task-${String(taskId).padStart(3, '0')}`,
      title: `Corrigir: ${issue.issue}`,
      type: 'fix',
      priority: issue.priority,
      effort: estimateEffort(issue.issue),
      description: issue.issue,
      acceptanceCriteria: [
        'Issue resolvido',
        'Código validado',
        'Testes passam'
      ],
      dependencies: [],
      status: 'todo',
      createdAt: new Date().toISOString()
    });
    taskId++;
  }
  
  // Criar tarefas para gaps de documentação
  for (const gap of gaps.documentationGaps) {
    tasks.push({
      id: `task-${String(taskId).padStart(3, '0')}`,
      title: `Documentar: ${gap.issue}`,
      type: 'docs',
      priority: gap.priority,
      effort: 'S',
      description: gap.issue,
      acceptanceCriteria: [
        'Documentação criada/atualizada',
        'Exemplos incluídos',
        'Formato correto'
      ],
      dependencies: [],
      status: 'todo',
      createdAt: new Date().toISOString()
    });
    taskId++;
  }
  
  // Criar tarefas para gaps de testes
  for (const gap of gaps.testGaps) {
    tasks.push({
      id: `task-${String(taskId).padStart(3, '0')}`,
      title: `Adicionar testes: ${gap.issue}`,
      type: 'test',
      priority: gap.priority,
      effort: 'M',
      description: gap.issue,
      acceptanceCriteria: [
        'Testes criados',
        'Cobertura adequada',
        'Todos os testes passam'
      ],
      dependencies: [],
      status: 'todo',
      createdAt: new Date().toISOString()
    });
    taskId++;
  }
  
  // Calcular summary
  const summary = {
    totalTasks: tasks.length,
    p0Tasks: tasks.filter(t => t.priority === 'P0').length,
    p1Tasks: tasks.filter(t => t.priority === 'P1').length,
    p2Tasks: tasks.filter(t => t.priority === 'P2').length,
    estimatedEffort: calculateTotalEffort(tasks),
    estimatedCompletion: estimateCompletionDate(tasks)
  };
  
  return {
    backlogId,
    createdAt: new Date().toISOString(),
    createdBy: 'Product Manager Agent',
    milestone: getCurrentMilestone(),
    deadline: getCurrentMilestoneDeadline(),
    tasks,
    summary
  };
}

/**
 * Estima esforço baseado no tipo de tarefa
 */
function estimateEffort(item) {
  const itemLower = item.toLowerCase();
  
  if (itemLower.includes('autenticação') || itemLower.includes('authentication')) {
    return 'M'; // 4-8 horas
  }
  if (itemLower.includes('feature') || itemLower.includes('implementar')) {
    return 'M'; // 4-8 horas
  }
  if (itemLower.includes('fix') || itemLower.includes('corrigir')) {
    return 'S'; // 1-4 horas
  }
  if (itemLower.includes('test') || itemLower.includes('teste')) {
    return 'S'; // 1-4 horas
  }
  if (itemLower.includes('doc') || itemLower.includes('document')) {
    return 'XS'; // < 1 hora
  }
  
  return 'S'; // Default
}

/**
 * Calcula esforço total
 */
function calculateTotalEffort(tasks) {
  const effortMap = { XS: 0.5, S: 2, M: 6, L: 12, XL: 24 };
  const total = tasks.reduce((sum, task) => {
    return sum + (effortMap[task.effort] || 0);
  }, 0);
  
  return `${total} hours`;
}

/**
 * Estima data de conclusão
 */
function estimateCompletionDate(tasks) {
  const effortMap = { XS: 0.5, S: 2, M: 6, L: 12, XL: 24 };
  const totalHours = tasks.reduce((sum, task) => {
    return sum + (effortMap[task.effort] || 0);
  }, 0);
  
  // Assumindo 4 horas por dia de trabalho
  const days = Math.ceil(totalHours / 4);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + days);
  
  return completionDate.toISOString().split('T')[0];
}

/**
 * Obtém milestone atual
 */
function getCurrentMilestone() {
  // Simplificado - pode ser melhorado
  return 'Milestone 1.0';
}

/**
 * Obtém deadline do milestone atual
 */
function getCurrentMilestoneDeadline() {
  // Simplificado - pode ser melhorado
  const date = new Date();
  date.setDate(date.getDate() + 14); // 2 semanas
  return date.toISOString().split('T')[0];
}

/**
 * Salva backlog em arquivo
 */
async function saveBacklog(backlog) {
  const filePath = path.join(BACKLOG_DIR, `${backlog.backlogId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(backlog, null, 2), 'utf-8');
  
  // Também salvar como current-backlog.json
  const currentPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  fs.writeFileSync(currentPath, JSON.stringify(backlog, null, 2), 'utf-8');
  
  return filePath;
}

/**
 * Gera relatório de status
 */
async function generateStatusReport(roadmap, currentStatus, gaps, backlog) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(RESULTS_DIR, `${timestamp}-status.md`);
  
  let report = `# 📊 Status de Desenvolvimento - ${new Date().toLocaleDateString()}\n\n`;
  report += `**Gerado por:** Product Manager Agent\n`;
  report += `**Data:** ${new Date().toISOString()}\n\n`;
  report += `---\n\n`;
  
  report += `## 📊 Resumo Executivo\n\n`;
  report += `- **Milestone Atual:** ${getCurrentMilestone()}\n`;
  report += `- **Features Implementadas:** ${currentStatus.features.length}\n`;
  report += `- **Features Faltantes:** ${gaps.missingFeatures.length}\n`;
  report += `- **Tarefas Criadas:** ${backlog.tasks.length}\n`;
  report += `- **Esforço Estimado:** ${backlog.summary.estimatedEffort}\n\n`;
  
  report += `## 🎯 Milestones\n\n`;
  for (const milestone of roadmap.milestones) {
    const completed = milestone.features.filter(f => 
      currentStatus.features.some(cf => 
        cf.toLowerCase().includes(f.toLowerCase())
      )
    ).length;
    const progress = milestone.features.length > 0 
      ? Math.round((completed / milestone.features.length) * 100)
      : 0;
    
    report += `### ${milestone.version}\n`;
    report += `- **Status:** ${milestone.status}\n`;
    report += `- **Progresso:** ${progress}% (${completed}/${milestone.features.length})\n`;
    report += `- **Deadline:** ${milestone.deadline || 'N/A'}\n\n`;
  }
  
  report += `## 📋 Backlog Gerado\n\n`;
  report += `### Resumo\n`;
  report += `- **Total de Tarefas:** ${backlog.summary.totalTasks}\n`;
  report += `- **P0 (Crítico):** ${backlog.summary.p0Tasks}\n`;
  report += `- **P1 (Alta):** ${backlog.summary.p1Tasks}\n`;
  report += `- **P2 (Média):** ${backlog.summary.p2Tasks}\n\n`;
  
  report += `### Tarefas por Prioridade\n\n`;
  const byPriority = {
    P0: backlog.tasks.filter(t => t.priority === 'P0'),
    P1: backlog.tasks.filter(t => t.priority === 'P1'),
    P2: backlog.tasks.filter(t => t.priority === 'P2')
  };
  
  for (const [priority, tasks] of Object.entries(byPriority)) {
    if (tasks.length > 0) {
      report += `#### ${priority} - ${priority === 'P0' ? 'Crítico' : priority === 'P1' ? 'Alta' : 'Média'}\n\n`;
      tasks.forEach(task => {
        report += `- **${task.id}**: ${task.title} (${task.effort})\n`;
      });
      report += `\n`;
    }
  }
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  return reportPath;
}

/**
 * Notifica Maestro sobre novo backlog
 */
async function notifyMaestro(backlogId) {
  // Criar arquivo de evento para o Maestro detectar
  const eventPath = path.join(SHARED_DIR, 'events', 'backlog-ready.json');
  const eventDir = path.dirname(eventPath);
  
  if (!fs.existsSync(eventDir)) {
    fs.mkdirSync(eventDir, { recursive: true });
  }
  
  const event = {
    type: 'backlog-ready',
    backlogId,
    timestamp: new Date().toISOString(),
    backlogPath: path.join(BACKLOG_DIR, `${backlogId}.json`)
  };
  
  fs.writeFileSync(eventPath, JSON.stringify(event, null, 2), 'utf-8');
  
  return event;
}

