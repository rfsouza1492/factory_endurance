/**
 * AutoFixTask Schema
 * Define o contrato para tarefas auto-fixáveis no backlog
 * 
 * REGRA DE OURO: Se está no backlog, DEVE ser auto-fixável
 */

import { validateForFirestore } from './firestore-validator.js';
import { logClassifiedError } from '../utils/error-classifier.js';

/**
 * @typedef {Object} AutoFixTask
 * @property {string} id - ID único da tarefa
 * @property {string} title - Título da tarefa
 * @property {string} description - Descrição do problema
 * @property {'file' | 'function' | 'config' | 'doc' | 'command'} targetType - Tipo de alvo
 * @property {string} targetPath - Caminho do arquivo/função/config
 * @property {string} [targetLocator] - Localizador específico (nome da função, linha, etc.)
 * @property {'patch' | 'rewrite' | 'command' | 'create' | 'delete'} fixType - Tipo de correção
 * @property {string} [patch] - Diff unificado ou trecho substituto
 * @property {string} [command] - Comando a ser executado
 * @property {string} [configKey] - Chave de configuração (se fixType === 'config')
 * @property {string} [newContent] - Conteúdo completo novo (se fixType === 'rewrite' ou 'create')
 * @property {'P0' | 'P1' | 'P2' | 'P3'} priority - Prioridade
 * @property {'low' | 'medium' | 'high'} riskLevel - Nível de risco
 * @property {boolean} requiresApproval - Se requer aprovação antes de aplicar
 * @property {string[]} [dependencies] - IDs de tarefas dependentes
 * @property {string} [agent] - Agente que identificou o problema
 * @property {string} status - Status atual ('todo' | 'in-progress' | 'done' | 'error')
 * @property {string} createdAt - Data de criação
 * @property {Object} [originalIssue] - Issue original que gerou a tarefa
 */

/**
 * Valida se uma tarefa atende ao contrato AutoFixTask
 * @param {Object} task - Tarefa a validar
 * @returns {{valid: boolean, errors: string[]}} - Resultado da validação
 */
export function validateAutoFixTask(task) {
  const errors = [];

  // Campos obrigatórios
  if (!task.id) errors.push('Campo obrigatório: id');
  if (!task.title) errors.push('Campo obrigatório: title');
  if (!task.description) errors.push('Campo obrigatório: description');
  if (!task.targetType) errors.push('Campo obrigatório: targetType');
  if (!task.targetPath) errors.push('Campo obrigatório: targetPath');
  if (!task.fixType) errors.push('Campo obrigatório: fixType');
  if (!task.priority) errors.push('Campo obrigatório: priority');
  if (!task.riskLevel) errors.push('Campo obrigatório: riskLevel');
  if (task.requiresApproval === undefined) errors.push('Campo obrigatório: requiresApproval');

  // Validação de targetType
  const validTargetTypes = ['file', 'function', 'config', 'doc', 'command'];
  if (task.targetType && !validTargetTypes.includes(task.targetType)) {
    errors.push(`targetType inválido: ${task.targetType}. Deve ser um de: ${validTargetTypes.join(', ')}`);
  }

  // Validação de fixType
  const validFixTypes = ['patch', 'rewrite', 'command', 'create', 'delete'];
  if (task.fixType && !validFixTypes.includes(task.fixType)) {
    errors.push(`fixType inválido: ${task.fixType}. Deve ser um de: ${validFixTypes.join(', ')}`);
  }

  // Validação de campos específicos por fixType
  if (task.fixType === 'patch' && !task.patch) {
    errors.push('fixType "patch" requer campo "patch"');
  }
  if (task.fixType === 'rewrite' && !task.newContent) {
    errors.push('fixType "rewrite" requer campo "newContent"');
  }
  if (task.fixType === 'command' && !task.command) {
    errors.push('fixType "command" requer campo "command"');
  }
  if (task.fixType === 'create' && !task.newContent) {
    errors.push('fixType "create" requer campo "newContent"');
  }
  if (task.fixType === 'config' && !task.configKey) {
    errors.push('fixType "config" requer campo "configKey"');
  }

  // Validação de priority
  const validPriorities = ['P0', 'P1', 'P2', 'P3'];
  if (task.priority && !validPriorities.includes(task.priority)) {
    errors.push(`priority inválida: ${task.priority}. Deve ser um de: ${validPriorities.join(', ')}`);
  }

  // Validação de riskLevel
  const validRiskLevels = ['low', 'medium', 'high'];
  if (task.riskLevel && !validRiskLevels.includes(task.riskLevel)) {
    errors.push(`riskLevel inválido: ${task.riskLevel}. Deve ser um de: ${validRiskLevels.join(', ')}`);
  }

  // Validação Firestore-safe: verificar undefined
  const firestoreValidation = validateForFirestore(task, `Tarefa ${task.id || 'sem ID'}`);
  if (!firestoreValidation.valid) {
    errors.push(...firestoreValidation.errors);
  }

  // Se houver erros, logar com classificação
  if (errors.length > 0) {
    const error = new Error(`CONTRATO VIOLADO: ${errors.join('; ')}`);
    logClassifiedError(error, 'AutoFixTask', task.id || 'sem ID');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida um backlog completo (todas as tarefas devem ser AutoFixTask válidas)
 * @param {Object} backlog - Backlog a validar
 * @returns {{valid: boolean, errors: string[], invalidTasks: Array<{taskId: string, errors: string[]}>}} - Resultado
 */
export function validateAutoFixBacklog(backlog) {
  const errors = [];
  const invalidTasks = [];

  if (!backlog || !backlog.tasks || !Array.isArray(backlog.tasks)) {
    return {
      valid: false,
      errors: ['Backlog inválido: campo "tasks" deve ser um array'],
      invalidTasks: []
    };
  }

  if (backlog.tasks.length === 0) {
    return {
      valid: true,
      errors: [],
      invalidTasks: []
    };
  }

  backlog.tasks.forEach((task, index) => {
    const validation = validateAutoFixTask(task);
    if (!validation.valid) {
      invalidTasks.push({
        taskId: task.id || `task[${index}]`,
        errors: validation.errors
      });
      errors.push(`Tarefa ${task.id || index}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    invalidTasks
  };
}

/**
 * Converte uma tarefa antiga para AutoFixTask (quando possível)
 * @param {Object} oldTask - Tarefa no formato antigo
 * @returns {AutoFixTask | null} - Tarefa convertida ou null se não for possível
 */
export function convertToAutoFixTask(oldTask) {
  // Se já é uma AutoFixTask válida, retornar como está
  const validation = validateAutoFixTask(oldTask);
  if (validation.valid) {
    return oldTask;
  }

  // Tentar inferir campos faltantes baseado no tipo e descrição
  // Se não for possível criar uma AutoFixTask completa, retornar null
  return null;
}

/**
 * Filtra apenas tarefas que podem ser convertidas para AutoFixTask
 * @param {Object[]} tasks - Lista de tarefas
 * @returns {Object[]} - Apenas tarefas auto-fixáveis válidas
 */
export function filterAutoFixableTasks(tasks) {
  return tasks
    .map(task => convertToAutoFixTask(task))
    .filter(task => task !== null);
}

export default {
  validateAutoFixTask,
  validateAutoFixBacklog,
  convertToAutoFixTask,
  filterAutoFixableTasks
};

