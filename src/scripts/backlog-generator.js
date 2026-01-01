/**
 * Backlog Generator
 * Converte issues identificados pelos agentes em tarefas estruturadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHARED_DIR = path.join(__dirname, '../shared');
const BACKLOG_DIR = path.join(SHARED_DIR, 'backlog');

/**
 * Gera backlog a partir de issues identificados pelos agentes
 */
export async function generateBacklogFromIssues(issues, options = {}) {
  const {
    backlogId = generateBacklogId(),
    milestone = 'Milestone 1.0',
    deadline = null
  } = options;
  
  // Converter issues em tarefas
  const tasks = [];
  
  // Verificar se há backlog existente para continuar numeração
  const currentBacklogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  let maxTaskId = 0;
  if (fs.existsSync(currentBacklogPath)) {
    try {
      const existingBacklog = JSON.parse(fs.readFileSync(currentBacklogPath, 'utf-8'));
      if (existingBacklog.tasks && existingBacklog.tasks.length > 0) {
        // Encontrar maior ID numérico
        existingBacklog.tasks.forEach(task => {
          const match = task.id?.match(/task-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxTaskId) maxTaskId = num;
          }
        });
      }
    } catch (error) {
      // Ignorar erro, começar do 1
    }
  }
  
  let taskId = maxTaskId + 1;
  
  // Agrupar issues por tipo
  const issuesByType = groupIssuesByType(issues);
  
  // Criar AutoFixTask para cada tipo (filtrar nulls)
  const nonAutoFixableIssues = [];
  
  for (const [type, typeIssues] of Object.entries(issuesByType)) {
    for (const issue of typeIssues) {
      const task = await convertIssueToTask(issue, taskId);
      if (task) {
        tasks.push(task);
        taskId++;
      } else {
        nonAutoFixableIssues.push(issue);
      }
    }
  }
  
  // Log issues não auto-fixáveis (para insights/manualActions)
  if (nonAutoFixableIssues.length > 0) {
    console.warn(`⚠️  ${nonAutoFixableIssues.length} issues não auto-fixáveis filtrados do backlog`);
    console.warn('   Esses issues devem ir para insights/ ou manualActions/');
  }
  
  // Priorizar tarefas
  const prioritizedTasks = prioritizeTasks(tasks);
  
  // Identificar dependências
  const tasksWithDeps = identifyDependencies(prioritizedTasks);
  
  // Agrupar tarefas
  const grouped = groupTasks(tasksWithDeps);
  
  // Calcular summary
  const summary = calculateSummary(tasksWithDeps);
  
  const backlog = {
    backlogId,
    createdAt: new Date().toISOString(),
    createdBy: 'Backlog Generator',
    milestone,
    deadline: deadline || estimateDeadline(tasksWithDeps),
    tasks: tasksWithDeps,
    groups: grouped,
    summary
  };

  // Validar contrato AutoFix antes de retornar
  try {
    const { validateAutoFixBacklog } = await import('../schemas/auto-fix-task.js');
    const validation = validateAutoFixBacklog(backlog);
    
    if (!validation.valid) {
      console.warn('⚠️  Backlog gerado contém tarefas não auto-fixáveis:');
      validation.invalidTasks.forEach(t => {
        console.warn(`  - ${t.taskId}: ${t.errors.join(', ')}`);
      });
      console.warn('⚠️  Essas tarefas serão filtradas do backlog.');
      
      // Filtrar apenas tarefas válidas
      const { filterAutoFixableTasks } = await import('../schemas/auto-fix-task.js');
      backlog.tasks = filterAutoFixableTasks(backlog.tasks);
      
      // Atualizar summary
      backlog.summary = {
        ...backlog.summary,
        totalTasks: backlog.tasks.length,
        filteredOut: tasksWithDeps.length - backlog.tasks.length
      };
    }
  } catch (error) {
    console.warn('⚠️  Erro ao validar backlog (continuando):', error.message);
  }

  return backlog;
}

/**
 * Gera ID único para backlog
 */
function generateBacklogId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `backlog-${timestamp}`;
}

/**
 * Agrupa issues por tipo
 */
function groupIssuesByType(issues) {
  const groups = {
    security: [],
    performance: [],
    codeQuality: [],
    architecture: [],
    documentation: [],
    testing: [],
    accessibility: [],
    other: []
  };
  
  for (const issue of issues) {
    const type = determineIssueType(issue);
    if (groups[type]) {
      groups[type].push(issue);
    } else {
      groups.other.push(issue);
    }
  }
  
  // Remover grupos vazios
  return Object.fromEntries(
    Object.entries(groups).filter(([_, issues]) => issues.length > 0)
  );
}

/**
 * Determina tipo do issue
 */
function determineIssueType(issue) {
  const message = (issue.message || '').toLowerCase();
  const type = (issue.type || '').toLowerCase();
  
  if (type.includes('security') || message.includes('security') || message.includes('vulnerability')) {
    return 'security';
  }
  if (type.includes('performance') || message.includes('performance') || message.includes('slow')) {
    return 'performance';
  }
  if (type.includes('architecture') || message.includes('architecture') || message.includes('structure')) {
    return 'architecture';
  }
  if (type.includes('documentation') || message.includes('documentation') || message.includes('readme')) {
    return 'documentation';
  }
  if (type.includes('test') || message.includes('test') || message.includes('coverage')) {
    return 'testing';
  }
  if (type.includes('accessibility') || message.includes('accessibility') || message.includes('aria')) {
    return 'accessibility';
  }
  if (type.includes('quality') || message.includes('quality') || message.includes('code smell')) {
    return 'codeQuality';
  }
  
  return 'other';
}

/**
 * Converte issue em AutoFixTask completa
 * Retorna null se não for possível gerar AutoFixTask completa
 */
async function convertIssueToTask(issue, taskId) {
  // Importar geradores
  const {
    canBeAutoFixed,
    determineTargetType,
    determineRiskLevel,
    determineRequiresApproval,
    generateFileTemplate,
    extractPackageName,
    generateInstallCommand,
    extractConfigKey,
    extractConfigValue
  } = await import('../utils/autofix-generators.js');
  
  // Verificar se pode ser auto-fixável
  if (!canBeAutoFixed(issue)) {
    return null; // Não entra no backlog
  }
  
  const message = (issue.message || '').toLowerCase();
  const location = issue.location || '';
  const priority = issue.priority || determinePriority(issue);
  
  // Determinar fixType e campos específicos
  let fixType = 'create'; // Default
  let fixFields = {};
  let targetType = determineTargetType(issue);
  let targetPath = location || `./${issue.type || 'unknown'}`;
  
  // Detectar tipo de fix necessário
  if (message.includes('não encontrado') || message.includes('não existe') || 
      message.includes('missing') || message.includes('faltando') ||
      message.includes('not found') || message.includes('does not exist')) {
    // Arquivo faltando → create
    fixType = 'create';
    fixFields.newContent = generateFileTemplate(targetPath, issue.type);
  } else if (message.includes('package') || message.includes('dependência') || 
             message.includes('dependency') || message.includes('npm install')) {
    // Dependência faltando → command
    fixType = 'command';
    const packageName = extractPackageName(issue.message || '');
    const command = generateInstallCommand(packageName, location);
    if (command) {
      fixFields.command = command;
    } else {
      return null; // Não foi possível gerar comando
    }
  } else if (message.includes('config') || message.includes('configuração') ||
             location.includes('.eslintrc') || location.includes('.prettierrc')) {
    // Config incorreta → config
    fixType = 'config';
    const configKey = extractConfigKey(issue.message || '');
    const configValue = extractConfigValue(issue.message || '');
    if (configKey) {
      fixFields.configKey = configKey;
      fixFields.newValue = configValue;
    } else {
      return null; // Não foi possível extrair config
    }
  } else if (message.includes('import') || message.includes('require')) {
    // Import faltando → patch
    fixType = 'patch';
    // Por enquanto, retornar null se não conseguir gerar patch
    // TODO: Implementar geração de patch com LLM
    return null;
  } else if (message.includes('não usado') || message.includes('unused') ||
             message.includes('remover') || message.includes('delete')) {
    // Código não usado → delete
    fixType = 'delete';
    // targetPath já está definido
  } else {
    // Por padrão, tentar create se tiver location
    if (location) {
      fixType = 'create';
      fixFields.newContent = generateFileTemplate(targetPath, issue.type);
    } else {
      // Sem location e sem tipo claro → não auto-fixável
      return null;
    }
  }
  
  // Validar que campos específicos do fixType estão presentes
  if (fixType === 'create' && !fixFields.newContent) {
    return null;
  }
  if (fixType === 'command' && !fixFields.command) {
    return null;
  }
  if (fixType === 'config' && (!fixFields.configKey || !fixFields.newValue)) {
    return null;
  }
  if (fixType === 'patch' && !fixFields.patch) {
    return null;
  }
  
  // Montar AutoFixTask completa
  const task = {
    id: `task-${String(taskId).padStart(3, '0')}`,
    title: generateTaskTitle(issue),
    description: issue.message || issue.description || 'Sem descrição',
    targetType,
    targetPath,
    fixType,
    ...fixFields,
    priority,
    riskLevel: determineRiskLevel(issue, fixType),
    requiresApproval: determineRequiresApproval(issue, fixType),
    dependencies: [],
    agent: issue.agent || 'Unknown',
    status: 'todo',
    createdAt: new Date().toISOString(),
    originalIssue: {
      id: issue.id,
      type: issue.type,
      severity: issue.severity
    }
  };
  
  return task;
}

/**
 * Determina tipo de tarefa
 */
function determineTaskType(issue) {
  const message = (issue.message || '').toLowerCase();
  
  if (message.includes('implement') || message.includes('add') || message.includes('create')) {
    return 'feature';
  }
  if (message.includes('fix') || message.includes('correct') || message.includes('resolve')) {
    return 'fix';
  }
  if (message.includes('refactor') || message.includes('improve') || message.includes('optimize')) {
    return 'refactor';
  }
  if (message.includes('test') || message.includes('coverage')) {
    return 'test';
  }
  if (message.includes('document') || message.includes('readme') || message.includes('doc')) {
    return 'docs';
  }
  
  return 'fix'; // Default
}

/**
 * Determina prioridade
 */
function determinePriority(issue) {
  if (issue.severity === 'critical' || issue.severity === 'P0') {
    return 'P0';
  }
  if (issue.severity === 'high' || issue.severity === 'P1') {
    return 'P1';
  }
  if (issue.severity === 'medium' || issue.severity === 'P2') {
    return 'P2';
  }
  return 'P3';
}

/**
 * Estima esforço
 */
function estimateEffort(issue) {
  const message = (issue.message || '').toLowerCase();
  const priority = issue.priority || determinePriority(issue);
  
  // Issues críticos geralmente requerem mais esforço
  if (priority === 'P0') {
    return 'M'; // 4-8 horas
  }
  
  // Baseado em palavras-chave
  if (message.includes('refactor') || message.includes('restructure')) {
    return 'L'; // 8-16 horas
  }
  if (message.includes('implement') || message.includes('add feature')) {
    return 'M'; // 4-8 horas
  }
  if (message.includes('fix') || message.includes('correct')) {
    return 'S'; // 1-4 horas
  }
  if (message.includes('document') || message.includes('update readme')) {
    return 'XS'; // < 1 hora
  }
  
  return 'S'; // Default
}

/**
 * Gera título da tarefa
 */
function generateTaskTitle(issue) {
  const message = issue.message || issue.description || 'Issue sem descrição';
  
  // Limitar tamanho
  if (message.length > 60) {
    return message.substring(0, 57) + '...';
  }
  
  return message;
}

/**
 * Gera critérios de aceitação
 */
function generateAcceptanceCriteria(issue, taskType) {
  const criteria = [];
  
  switch (taskType) {
    case 'feature':
      criteria.push('Feature funciona conforme especificação');
      criteria.push('Testes unitários passam');
      criteria.push('Documentação atualizada');
      break;
    case 'fix':
      criteria.push('Issue resolvido');
      criteria.push('Código validado');
      criteria.push('Testes passam');
      break;
    case 'refactor':
      criteria.push('Refatoração completa');
      criteria.push('Funcionalidade mantida');
      criteria.push('Testes atualizados');
      break;
    case 'test':
      criteria.push('Testes criados');
      criteria.push('Cobertura adequada');
      criteria.push('Todos os testes passam');
      break;
    case 'docs':
      criteria.push('Documentação criada/atualizada');
      criteria.push('Exemplos incluídos');
      criteria.push('Formato correto');
      break;
    default:
      criteria.push('Tarefa completada');
      criteria.push('Validado');
  }
  
  return criteria;
}

/**
 * Prioriza tarefas
 */
function prioritizeTasks(tasks) {
  // Ordenar por prioridade (P0 primeiro) e depois por esforço (menor primeiro)
  return tasks.sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const effortOrder = { XS: 0, S: 1, M: 2, L: 3, XL: 4 };
    
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return effortOrder[a.effort] - effortOrder[b.effort];
  });
}

/**
 * Identifica dependências entre tarefas
 */
function identifyDependencies(tasks) {
  // Análise simples de dependências baseada em palavras-chave
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const deps = [];
    
    // Verificar se tarefa menciona outras features/tarefas
    const description = task.description.toLowerCase();
    
    for (let j = 0; j < tasks.length; j++) {
      if (i === j) continue;
      
      const otherTask = tasks[j];
      const otherTitle = otherTask.title.toLowerCase();
      
      // Se descrição menciona título de outra tarefa
      if (description.includes(otherTitle.substring(0, 20))) {
        deps.push(otherTask.id);
      }
    }
    
    task.dependencies = deps;
  }
  
  return tasks;
}

/**
 * Agrupa tarefas
 */
function groupTasks(tasks) {
  return {
    byPriority: {
      P0: tasks.filter(t => t.priority === 'P0'),
      P1: tasks.filter(t => t.priority === 'P1'),
      P2: tasks.filter(t => t.priority === 'P2'),
      P3: tasks.filter(t => t.priority === 'P3')
    },
    byType: {
      feature: tasks.filter(t => t.type === 'feature'),
      fix: tasks.filter(t => t.type === 'fix'),
      refactor: tasks.filter(t => t.type === 'refactor'),
      test: tasks.filter(t => t.type === 'test'),
      docs: tasks.filter(t => t.type === 'docs')
    },
    byEffort: {
      XS: tasks.filter(t => t.effort === 'XS'),
      S: tasks.filter(t => t.effort === 'S'),
      M: tasks.filter(t => t.effort === 'M'),
      L: tasks.filter(t => t.effort === 'L'),
      XL: tasks.filter(t => t.effort === 'XL')
    }
  };
}

/**
 * Calcula summary
 */
function calculateSummary(tasks) {
  const effortMap = { XS: 0.5, S: 2, M: 6, L: 12, XL: 24 };
  const totalHours = tasks.reduce((sum, task) => {
    return sum + (effortMap[task.effort] || 0);
  }, 0);
  
  return {
    totalTasks: tasks.length,
    p0Tasks: tasks.filter(t => t.priority === 'P0').length,
    p1Tasks: tasks.filter(t => t.priority === 'P1').length,
    p2Tasks: tasks.filter(t => t.priority === 'P2').length,
    p3Tasks: tasks.filter(t => t.priority === 'P3').length,
    estimatedEffort: `${totalHours} hours`,
    estimatedCompletion: estimateCompletionDate(tasks)
  };
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
 * Estima deadline
 */
function estimateDeadline(tasks) {
  return estimateCompletionDate(tasks);
}

/**
 * Salva backlog em arquivo
 */
export function saveBacklog(backlog, filename = null) {
  if (!fs.existsSync(BACKLOG_DIR)) {
    fs.mkdirSync(BACKLOG_DIR, { recursive: true });
  }
  
  const filePath = filename 
    ? path.join(BACKLOG_DIR, filename)
    : path.join(BACKLOG_DIR, `${backlog.backlogId}.json`);
  
  fs.writeFileSync(filePath, JSON.stringify(backlog, null, 2), 'utf-8');
  
  // Também salvar como current-backlog.json
  const currentPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  fs.writeFileSync(currentPath, JSON.stringify(backlog, null, 2), 'utf-8');
  
  return filePath;
}

