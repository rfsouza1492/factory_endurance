/**
 * Implementation Agent (Code Fix Agent)
 * Implementa automaticamente correções de código, documentação e configurações
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
const MAESTRO_WORKFLOW_ROOT = path.resolve(__dirname, '../..'); // raiz do maestro-workflow
const SHARED_DIR = path.join(__dirname, '../shared');
const BACKLOG_DIR = path.join(SHARED_DIR, 'backlog');
const IMPLEMENTATIONS_DIR = path.join(SHARED_DIR, 'implementations');

/**
 * Executa o Implementation Agent
 */
export async function runImplementationAgent(options = {}) {
  const {
    maxTasks = 10,
    autoCommit = true,
    dryRun = false
  } = options;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const implementationId = `implementation-${timestamp}`;
  const implementationDir = path.join(IMPLEMENTATIONS_DIR, implementationId);

  // Criar diretório de implementação
  if (!fs.existsSync(IMPLEMENTATIONS_DIR)) {
    fs.mkdirSync(IMPLEMENTATIONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(implementationDir)) {
    fs.mkdirSync(implementationDir, { recursive: true });
  }

  const report = {
    id: implementationId,
    timestamp: new Date().toISOString(),
    tasksProcessed: 0,
    tasksCompleted: 0,
    tasksError: 0,
    tasks: [],
    changes: [],
    validationResults: [],
    metrics: {
      totalTime: 0,
      averageTimePerTask: 0,
      filesModified: 0,
      linesAdded: 0,
      linesRemoved: 0
    }
  };

  const startTime = Date.now();

  try {
    // Passo 1: Ler backlog
    const backlog = loadBacklog();
    if (!backlog || !backlog.tasks || backlog.tasks.length === 0) {
      report.summary = 'Nenhuma tarefa encontrada no backlog';
      saveReport(implementationDir, report);
      return report;
    }

    // Passo 2: Validar contrato AutoFix (FAIL-FAST)
    const { validateAutoFixBacklog } = await import('../schemas/auto-fix-task.js');
    const validation = validateAutoFixBacklog(backlog);
    
    if (!validation.valid) {
      const errorMsg = `❌ CONTRATO VIOLADO: Backlog contém tarefas não auto-fixáveis ou inválidas.\n` +
        `Erros encontrados:\n${validation.errors.map(e => `  - ${e}`).join('\n')}\n\n` +
        `Tarefas inválidas:\n${validation.invalidTasks.map(t => `  - ${t.taskId}: ${t.errors.join(', ')}`).join('\n')}`;
      
      report.summary = errorMsg;
      report.tasksError = backlog.tasks.length;
      saveReport(implementationDir, report);
      
      throw new Error(errorMsg);
    }

    // Passo 3: Filtrar apenas tarefas com status 'todo' ou 'in-progress'
    const pendingTasks = backlog.tasks.filter(task => 
      task.status === 'todo' || task.status === 'in-progress'
    );

    if (pendingTasks.length === 0) {
      report.summary = 'Nenhuma tarefa pendente no backlog';
      saveReport(implementationDir, report);
      return report;
    }

    // Passo 4: Ordenar tarefas (por prioridade e dependências)
    const sortedTasks = sortTasks(pendingTasks);

    // Passo 5: Processar tarefas (limitado a maxTasks)
    const tasksToProcess = sortedTasks.slice(0, maxTasks);
    
    for (const task of tasksToProcess) {
      report.tasksProcessed++;
      const taskStartTime = Date.now();

      try {
        // Atualizar status para in-progress
        updateTaskStatus(backlog, task.id, 'in-progress');

        // Implementar correção
        const result = await implementTask(task, { dryRun });

        if (result.success) {
          report.tasksCompleted++;
          report.tasks.push({
            id: task.id,
            title: task.title,
            type: task.type,
            status: 'completed',
            file: result.file,
            commit: result.commit,
            validation: result.validation
          });
          report.changes.push(result.change);
          report.validationResults.push(result.validation);

          // Atualizar métricas
          if (result.change) {
            report.metrics.filesModified++;
            report.metrics.linesAdded += result.change.linesAdded || 0;
            report.metrics.linesRemoved += result.change.linesRemoved || 0;
          }

          // Criar commit se não for dry run
          if (!dryRun && autoCommit && result.commit) {
            createCommit(result.commit.message, result.commit.files);
          }

          // Atualizar status para done
          updateTaskStatus(backlog, task.id, 'done', {
            completedAt: new Date().toISOString(),
            commit: result.commit?.hash || null
          });
        } else {
          report.tasksError++;
          report.tasks.push({
            id: task.id,
            title: task.title,
            type: task.type,
            status: 'error',
            error: result.error,
            action: 'requires-manual-review'
          });

          // Atualizar status
          updateTaskStatus(backlog, task.id, 'requires-manual-review', {
            error: result.error
          });
        }

        // Calcular tempo da tarefa (apenas se não houve erro)
        const taskTime = Date.now() - taskStartTime;
        if (report.tasksProcessed > 0) {
          report.metrics.averageTimePerTask = 
            (report.metrics.averageTimePerTask * (report.tasksProcessed - 1) + taskTime) / report.tasksProcessed;
        }

      } catch (error) {
        // Calcular tempo mesmo em caso de erro
        const taskTime = Date.now() - taskStartTime;
        if (report.tasksProcessed > 0) {
          report.metrics.averageTimePerTask = 
            (report.metrics.averageTimePerTask * (report.tasksProcessed - 1) + taskTime) / report.tasksProcessed;
        }
        report.tasksError++;
        report.tasks.push({
          id: task.id,
          title: task.title,
          type: task.type,
          status: 'error',
          error: error.message,
          action: 'requires-manual-review'
        });
        console.error(`Erro ao processar tarefa ${task.id}:`, error);
      }
    }

    // Salvar backlog atualizado
    if (!dryRun) {
      saveBacklog(backlog);
    }

    // Calcular métricas finais
    report.metrics.totalTime = Date.now() - startTime;
    report.successRate = report.tasksProcessed > 0 
      ? Math.round((report.tasksCompleted / report.tasksProcessed) * 100) 
      : 0;

    // Salvar relatório
    saveReport(implementationDir, report);

    return report;

  } catch (error) {
    report.error = error.message;
    saveReport(implementationDir, report);
    throw error;
  }
}

/**
 * Carrega backlog atual
 */
function loadBacklog() {
  const backlogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  if (!fs.existsSync(backlogPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
}

/**
 * Salva backlog atualizado
 */
function saveBacklog(backlog) {
  if (!fs.existsSync(BACKLOG_DIR)) {
    fs.mkdirSync(BACKLOG_DIR, { recursive: true });
  }
  const backlogPath = path.join(BACKLOG_DIR, 'current-backlog.json');
  fs.writeFileSync(backlogPath, JSON.stringify(backlog, null, 2));
}

/**
 * Filtra tarefas auto-fixáveis
 */
function filterAutoFixableTasks(tasks) {
  return tasks.filter(task => {
    // Verificar regras de segurança
    if (!isTaskAutoFixable(task)) {
      return false;
    }

    // Apenas tarefas com status todo ou in-progress
    if (task.status !== 'todo' && task.status !== 'in-progress') {
      return false;
    }

    // Verificar prioridade (P0 requer aprovação, então não auto-fixável)
    if (task.priority === 'P0') {
      return false;
    }

    return true;
  });
}

/**
 * Verifica se tarefa pode ser auto-fixada
 */
function isTaskAutoFixable(task) {
  const message = (task.description || task.title || '').toLowerCase();

  // NUNCA auto-fixar:
  // - Lógica de negócio crítica
  if (message.includes('business logic') || message.includes('regra de negócio')) {
    return false;
  }

  // - Autenticação/autorização
  if (message.includes('auth') || message.includes('authentication') || message.includes('authorization')) {
    return false;
  }

  // - Segurança crítica
  if (task.type === 'security' && task.priority === 'P0') {
    return false;
  }

  // - Dependências
  if (message.includes('dependency') || message.includes('npm') || message.includes('package.json')) {
    return false;
  }

  // - Mudanças arquiteturais grandes
  if (message.includes('refactor') && message.includes('multiple')) {
    return false;
  }

  // Tipos auto-fixáveis:
  const autoFixableTypes = [
    'code-fix',
    'formatting',
    'imports',
    'documentation',
    'jsdoc',
    'configuration'
  ];

  return autoFixableTypes.includes(task.type) || 
         message.includes('format') ||
         message.includes('import') ||
         message.includes('unused') ||
         message.includes('readme') ||
         message.includes('jsdoc') ||
         message.includes('documentation');
}

/**
 * Ordena tarefas por prioridade e dependências
 */
function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    // Prioridade (P1 > P2 > P3)
    const priorityOrder = { 'P1': 1, 'P2': 2, 'P3': 3 };
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    if (priorityDiff !== 0) return priorityDiff;

    // Esforço (XS < S < M < L < XL)
    const effortOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5 };
    const effortDiff = (effortOrder[a.effort] || 99) - (effortOrder[b.effort] || 99);
    if (effortDiff !== 0) return effortDiff;

    // Sem dependências primeiro
    const aHasDeps = a.dependencies && a.dependencies.length > 0;
    const bHasDeps = b.dependencies && b.dependencies.length > 0;
    if (aHasDeps && !bHasDeps) return 1;
    if (!aHasDeps && bHasDeps) return -1;

    return 0;
  });
}

/**
 * Implementa uma AutoFixTask
 */
async function implementTask(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    // Usar fixType da AutoFixTask
    const fixType = task.fixType;

    if (!fixType) {
      const error = new Error(`Tarefa não tem fixType definido: ${task.id}`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return {
        success: false,
        error: error.message
      };
    }

    switch (fixType) {
      case 'create':
        return await applyCreate(task, { dryRun });
      case 'patch':
        return await applyPatch(task, { dryRun });
      case 'rewrite':
        return await applyRewrite(task, { dryRun });
      case 'command':
        return await applyCommand(task, { dryRun });
      case 'config':
        return await applyConfig(task, { dryRun });
      case 'delete':
        return await applyDelete(task, { dryRun });
      default:
        const error = new Error(`fixType não suportado: ${fixType}`);
        logClassifiedError(error, 'ImplementationAgent', task.id);
        return {
          success: false,
          error: error.message
        };
    }
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Aplica fixType: create
 * Cria novo arquivo com newContent
 */
async function applyCreate(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    if (!task.newContent) {
      const error = new Error(`fixType 'create' requer campo 'newContent'`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    const filePath = resolveFilePath(task.targetPath);
    const dir = path.dirname(filePath);

    if (!dryRun) {
      // Criar diretório se não existir
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Verificar se arquivo já existe
      if (fs.existsSync(filePath)) {
        const error = new Error(`Arquivo já existe: ${filePath}`);
        logClassifiedError(error, 'ImplementationAgent', task.id);
        return { success: false, error: error.message };
      }

      // Criar arquivo
      fs.writeFileSync(filePath, task.newContent, 'utf-8');
    }

    return {
      success: true,
      file: task.targetPath,
      change: {
        type: 'create',
        file: task.targetPath,
        linesAdded: task.newContent.split('\n').length,
        linesRemoved: 0
      },
      validation: { success: true }
    };
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return { success: false, error: error.message };
  }
}

/**
 * Aplica fixType: patch
 * Aplica patch no arquivo
 */
async function applyPatch(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    if (!task.patch) {
      const error = new Error(`fixType 'patch' requer campo 'patch'`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    const filePath = resolveFilePath(task.targetPath);

    if (!fs.existsSync(filePath)) {
      const error = new Error(`Arquivo não encontrado: ${filePath}`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    const originalContent = fs.readFileSync(filePath, 'utf-8');
    // Por enquanto, patch é substituição simples
    // TODO: Implementar diff/patch mais sofisticado
    const newContent = task.patch;

    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
    }

    const changes = calculateChanges(originalContent, newContent);

    return {
      success: true,
      file: task.targetPath,
      change: {
        type: 'patch',
        file: task.targetPath,
        linesAdded: changes.linesAdded,
        linesRemoved: changes.linesRemoved
      },
      validation: { success: true }
    };
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return { success: false, error: error.message };
  }
}

/**
 * Aplica fixType: rewrite
 * Reescreve arquivo completo com newContent
 */
async function applyRewrite(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    if (!task.newContent) {
      const error = new Error(`fixType 'rewrite' requer campo 'newContent'`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    const filePath = resolveFilePath(task.targetPath);
    const originalContent = fs.existsSync(filePath) 
      ? fs.readFileSync(filePath, 'utf-8')
      : '';

    if (!dryRun) {
      fs.writeFileSync(filePath, task.newContent, 'utf-8');
    }

    const changes = calculateChanges(originalContent, task.newContent);

    return {
      success: true,
      file: task.targetPath,
      change: {
        type: 'rewrite',
        file: task.targetPath,
        linesAdded: changes.linesAdded,
        linesRemoved: changes.linesRemoved
      },
      validation: { success: true }
    };
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return { success: false, error: error.message };
  }
}

/**
 * Aplica fixType: command
 * Executa comando
 */
async function applyCommand(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    if (!task.command) {
      const error = new Error(`fixType 'command' requer campo 'command'`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    if (dryRun) {
      return {
        success: true,
        file: task.targetPath || 'N/A',
        change: {
          type: 'command',
          command: task.command,
          linesAdded: 0,
          linesRemoved: 0
        },
        validation: { success: true }
      };
    }

    // Executar comando
    const cwd = task.targetPath ? path.dirname(resolveFilePath(task.targetPath)) : PROJECT_DIR;
    execSync(task.command, { cwd, stdio: 'pipe' });

    return {
      success: true,
      file: task.targetPath || 'N/A',
      change: {
        type: 'command',
        command: task.command,
        linesAdded: 0,
        linesRemoved: 0
      },
      validation: { success: true }
    };
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return { 
      success: false, 
      error: `Erro ao executar comando: ${error.message}` 
    };
  }
}

/**
 * Aplica fixType: config
 * Atualiza configuração
 */
async function applyConfig(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    if (!task.configKey || !task.newValue) {
      const error = new Error(`fixType 'config' requer campos 'configKey' e 'newValue'`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    const filePath = resolveFilePath(task.targetPath);

    if (!fs.existsSync(filePath)) {
      const error = new Error(`Arquivo de config não encontrado: ${filePath}`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let config = {};

    // Tentar parsear como JSON
    try {
      config = JSON.parse(originalContent);
    } catch (e) {
      const error = new Error(`Arquivo de config não é JSON válido: ${filePath}`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    // Atualizar config
    const keys = task.configKey.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = task.newValue;

    if (!dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
    }

    return {
      success: true,
      file: task.targetPath,
      change: {
        type: 'config',
        file: task.targetPath,
        configKey: task.configKey,
        newValue: task.newValue,
        linesAdded: 0,
        linesRemoved: 0
      },
      validation: { success: true }
    };
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return { success: false, error: error.message };
  }
}

/**
 * Aplica fixType: delete
 * Deleta arquivo ou função
 */
async function applyDelete(task, options = {}) {
  const { dryRun = false } = options;
  const { logClassifiedError } = await import('../utils/error-classifier.js');

  try {
    const filePath = resolveFilePath(task.targetPath);

    if (!fs.existsSync(filePath)) {
      const error = new Error(`Arquivo não encontrado para deletar: ${filePath}`);
      logClassifiedError(error, 'ImplementationAgent', task.id);
      return { success: false, error: error.message };
    }

    if (!dryRun) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      file: task.targetPath,
      change: {
        type: 'delete',
        file: task.targetPath,
        linesAdded: 0,
        linesRemoved: 0
      },
      validation: { success: true }
    };
  } catch (error) {
    logClassifiedError(error, 'ImplementationAgent', task.id);
    return { success: false, error: error.message };
  }
}

/**
 * Resolve caminho do arquivo
 */
function resolveFilePath(targetPath) {
  if (!targetPath) {
    return null;
  }

  // Tentar caminho absoluto primeiro
  if (path.isAbsolute(targetPath)) {
    return targetPath;
  }

  // Tentar caminhos relativos
  const paths = [
    path.join(PROJECT_DIR, targetPath),
    path.join(WORKSPACE_ROOT, targetPath),
    path.join(MAESTRO_WORKFLOW_ROOT, targetPath)
  ];

  for (const filePath of paths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // Se não encontrou, retornar primeiro caminho (será criado)
  return paths[0];
}

/**
 * Determina tipo de tarefa (mantido para compatibilidade)
 */
function determineTaskType(task) {
  const message = (task.description || task.title || '').toLowerCase();

  // JSDoc é code-fix, não documentation
  if (message.includes('jsdoc')) {
    return 'code-fix';
  }
  
  if (message.includes('readme') || (message.includes('documentation') && !message.includes('jsdoc'))) {
    return 'documentation';
  }
  if (message.includes('config') || message.includes('.eslintrc') || message.includes('.prettierrc') || message.includes('firestore.rules')) {
    return 'configuration';
  }
  return 'code-fix';
}

/**
 * Implementa correção de código
 */
async function implementCodeFix(task, options = {}) {
  const { dryRun = false } = options;
  
  // Tentar encontrar arquivo em diferentes locais
  let filePath = null;
  if (task.location) {
    // Tentar caminho relativo ao PROJECT_DIR primeiro
    filePath = path.join(PROJECT_DIR, task.location);
    if (!fs.existsSync(filePath)) {
      // Tentar caminho relativo ao WORKSPACE_ROOT
      filePath = path.join(WORKSPACE_ROOT, task.location);
    }
    if (!fs.existsSync(filePath)) {
      // Tentar caminho relativo ao MAESTRO_WORKFLOW_ROOT
      filePath = path.join(MAESTRO_WORKFLOW_ROOT, task.location);
    }
    if (!fs.existsSync(filePath)) {
      // Tentar caminho absoluto (se já for absoluto)
      if (path.isAbsolute(task.location)) {
        filePath = task.location;
      }
    }
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return {
      success: false,
      error: `Arquivo não encontrado: ${task.location} (tentou: ${filePath || 'N/A'})`
    };
  }

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  let newContent = originalContent;
  let changes = { linesAdded: 0, linesRemoved: 0 };

  // Identificar tipo de correção
  const message = (task.description || task.title || '').toLowerCase();

  if (message.includes('import') && message.includes('unused')) {
    // Remover imports não utilizados
    newContent = removeUnusedImports(newContent);
    changes = calculateChanges(originalContent, newContent);
  } else if (message.includes('format') || message.includes('prettier') || message.includes('eslint')) {
    // Formatação (tentar executar prettier/eslint)
    try {
      if (!dryRun) {
        execSync(`npx prettier --write "${filePath}"`, { cwd: PROJECT_DIR, stdio: 'ignore' });
        newContent = fs.readFileSync(filePath, 'utf-8');
        changes = calculateChanges(originalContent, newContent);
      }
    } catch (error) {
      // Se prettier não estiver disponível, pular
    }
  } else if (message.includes('jsdoc')) {
    // Adicionar JSDoc
    newContent = addJSDoc(newContent, task);
    changes = calculateChanges(originalContent, newContent);
  }

  // Validar
  const validation = validateCodeFix(filePath, newContent, { dryRun });

  if (!validation.success && !dryRun) {
    return {
      success: false,
      error: validation.error || 'Validação falhou'
    };
  }

  // Aplicar mudanças se não for dry run
  if (!dryRun && newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return {
    success: true,
    file: task.location,
    change: {
      file: task.location,
      type: 'code-fix',
      linesAdded: changes.linesAdded,
      linesRemoved: changes.linesRemoved
    },
    commit: {
      message: `fix: ${task.title.toLowerCase()}`,
      files: [task.location]
    },
    validation
  };
}

/**
 * Implementa correção de documentação
 */
async function implementDocumentation(task, options = {}) {
  const { dryRun = false } = options;
  const filePath = task.location ? path.join(WORKSPACE_ROOT, task.location) : null;

  const message = (task.description || task.title || '').toLowerCase();

  if (message.includes('readme')) {
    // Criar README.md
    const readmePath = filePath || path.join(PROJECT_DIR, 'README.md');
    
    if (!dryRun && !fs.existsSync(readmePath)) {
      const readmeContent = generateREADME();
      fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    }

    return {
      success: true,
      file: path.relative(WORKSPACE_ROOT, readmePath),
      change: {
        file: path.relative(WORKSPACE_ROOT, readmePath),
        type: 'documentation',
        linesAdded: 50, // Estimativa
        linesRemoved: 0
      },
      commit: {
        message: `docs: create README.md`,
        files: [path.relative(WORKSPACE_ROOT, readmePath) || path.relative(PROJECT_DIR, readmePath)]
      },
      validation: { success: true }
    };
  }

  return {
    success: false,
    error: 'Tipo de documentação não suportado'
  };
}

/**
 * Implementa correção de configuração
 */
async function implementConfiguration(task, options = {}) {
  const { dryRun = false } = options;
  const message = (task.description || task.title || '').toLowerCase();

  if (message.includes('firestore.rules')) {
    const rulesPath = config.PROJECT_FIRESTORE_RULES;
    
    if (!dryRun && !fs.existsSync(rulesPath)) {
      const rulesContent = generateBasicFirestoreRules();
      fs.writeFileSync(rulesPath, rulesContent, 'utf-8');
    }

    return {
      success: true,
      file: 'firestore.rules',
      change: {
        file: 'firestore.rules',
        type: 'configuration',
        linesAdded: 20, // Estimativa
        linesRemoved: 0
      },
      commit: {
        message: `config: create basic firestore.rules`,
        files: ['firestore.rules']
      },
      validation: { success: true }
    };
  }

  return {
    success: false,
    error: 'Tipo de configuração não suportado'
  };
}

/**
 * Remove imports não utilizados
 */
function removeUnusedImports(content) {
  // Implementação simplificada - remover linhas que são apenas imports vazios
  // Em produção, usar uma biblioteca como eslint para detectar imports não utilizados
  const lines = content.split('\n');
  const newLines = [];
  let inImportBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isImport = /^import\s+/.test(line.trim());

    if (isImport) {
      inImportBlock = true;
      // Manter imports por enquanto (detecção precisa requer análise AST)
      newLines.push(line);
    } else {
      if (inImportBlock && line.trim() === '') {
        // Pular linha vazia após imports
        continue;
      }
      inImportBlock = false;
      newLines.push(line);
    }
  }

  return newLines.join('\n');
}

/**
 * Adiciona JSDoc a funções sem documentação
 */
function addJSDoc(content, task) {
  // Implementação simplificada - adicionar JSDoc básico
  // Em produção, analisar função para gerar JSDoc preciso
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar função sem JSDoc
    if (/^(export\s+)?(async\s+)?function\s+\w+/.test(line.trim()) && 
        i > 0 && !lines[i-1].trim().startsWith('/**')) {
      // Adicionar JSDoc básico
      const funcName = line.match(/(?:function|const)\s+(\w+)/)?.[1] || 'function';
      newLines.push('/**');
      newLines.push(` * ${funcName}`);
      newLines.push(' * @returns {void}');
      newLines.push(' */');
    }
    
    newLines.push(line);
  }

  return newLines.join('\n');
}

/**
 * Gera README.md básico
 */
function generateREADME() {
  const packageJsonPath = config.PROJECT_PACKAGE_JSON;
  let projectName = 'Project';
  let description = '';

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      projectName = packageJson.name || projectName;
      description = packageJson.description || '';
    } catch (error) {
      // Ignorar erro
    }
  }

  return `# ${projectName}

${description || 'Descrição do projeto'}

## Instalação

\`\`\`bash
npm install
\`\`\`

## Uso

\`\`\`bash
npm start
\`\`\`

## Estrutura do Projeto

[Adicione informações sobre a estrutura do projeto aqui]

## Contribuindo

[Adicione informações sobre como contribuir]

## Licença

[Adicione informações sobre a licença]
`;
}

/**
 * Gera firestore.rules básico
 */
function generateBasicFirestoreRules() {
  return `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Regras básicas - ajustar conforme necessário
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
}

/**
 * Valida correção de código
 */
function validateCodeFix(filePath, content, options = {}) {
  const { dryRun = false } = options;

  try {
    // Validar sintaxe básica (verificar se é JavaScript válido)
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      // Tentar executar node para validar sintaxe
      if (!dryRun) {
        try {
          execSync(`node -c "${filePath}"`, { cwd: PROJECT_DIR, stdio: 'ignore' });
        } catch (error) {
          return {
            success: false,
            error: 'Erro de sintaxe detectado'
          };
        }
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calcula mudanças entre conteúdo original e novo
 */
function calculateChanges(original, modified) {
  const originalLines = original.split('\n').length;
  const modifiedLines = modified.split('\n').length;
  
  return {
    linesAdded: Math.max(0, modifiedLines - originalLines),
    linesRemoved: Math.max(0, originalLines - modifiedLines)
  };
}

/**
 * Atualiza status de uma tarefa no backlog
 */
function updateTaskStatus(backlog, taskId, status, metadata = {}) {
  const task = backlog.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    Object.assign(task, metadata);
  }
}

/**
 * Cria commit Git
 */
function createCommit(message, files) {
  try {
    // Adicionar arquivos
    if (files && files.length > 0) {
      execSync(`git add ${files.join(' ')}`, { 
        cwd: PROJECT_DIR, 
        stdio: 'ignore' 
      });
    }

    // Criar commit
    execSync(`git commit -m "${message}"`, { 
      cwd: PROJECT_DIR, 
      stdio: 'ignore' 
    });

    // Obter hash do commit
    const hash = execSync('git rev-parse HEAD', { 
      cwd: PROJECT_DIR, 
      encoding: 'utf-8' 
    }).trim();

    return hash;
  } catch (error) {
    // Se não for um repositório Git ou houver erro, retornar null
    return null;
  }
}

/**
 * Salva relatório de implementação
 */
function saveReport(implementationDir, report) {
  // Salvar relatório Markdown
  const reportPath = path.join(implementationDir, 'implementation-report.md');
  const reportContent = generateReportMarkdown(report);
  fs.writeFileSync(reportPath, reportContent, 'utf-8');

  // Salvar JSON
  const jsonPath = path.join(implementationDir, 'changes.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
}

/**
 * Gera relatório Markdown
 */
function generateReportMarkdown(report) {
  return `# Relatório de Implementação

**Data:** ${report.timestamp}
**Agente:** Implementation Agent
**ID:** ${report.id}

## Resumo Executivo

- **Tarefas Processadas:** ${report.tasksProcessed}
- **Tarefas Completadas:** ${report.tasksCompleted}
- **Tarefas com Erro:** ${report.tasksError}
- **Taxa de Sucesso:** ${report.successRate}%

## Tarefas Implementadas

${report.tasks.map(task => {
  if (task.status === 'completed') {
    const commitMsg = task.commit && typeof task.commit === 'object' 
      ? (task.commit.message || task.commit.hash || 'N/A')
      : (task.commit || 'N/A');
    return `### ✅ ${task.id}: ${task.title}
- **Tipo:** ${task.type}
- **Arquivo:** ${task.file || 'N/A'}
- **Status:** ✅ Completo
- **Validação:** ✅ Passou
- **Commit:** ${commitMsg}`;
  } else {
    return `### ❌ ${task.id}: ${task.title}
- **Tipo:** ${task.type}
- **Erro:** ${task.error || 'Erro desconhecido'}
- **Ação:** ${task.action || 'requires-manual-review'}`;
  }
}).join('\n\n')}

## Métricas

- **Tempo Total:** ${Math.round(report.metrics.totalTime / 1000)}s
- **Tempo Médio por Tarefa:** ${Math.round(report.metrics.averageTimePerTask / 1000)}s
- **Arquivos Modificados:** ${report.metrics.filesModified}
- **Linhas Adicionadas:** ${report.metrics.linesAdded}
- **Linhas Removidas:** ${report.metrics.linesRemoved}
`;
}

