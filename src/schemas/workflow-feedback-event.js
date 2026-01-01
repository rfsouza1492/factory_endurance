/**
 * WorkflowFeedbackEvent Schema
 * Define o contrato para eventos de feedback do workflow
 * 
 * Usado para: events/workflow-feedback
 */

import { validateForFirestore } from './firestore-validator.js';
import { logClassifiedError } from '../utils/error-classifier.js';

/**
 * @typedef {Object} WorkflowFeedbackEvent
 * @property {string} event - Tipo de evento ('workflow-complete')
 * @property {string} workflowId - ID do workflow
 * @property {string} timestamp - Timestamp ISO
 * @property {string} decision - Decisão do workflow ('GO' | 'NO-GO' | 'CONDITIONAL')
 * @property {Object|null} scores - Scores de avaliação (ou null)
 * @property {Object} issues - Contagem de issues por severidade
 * @property {number} issues.critical - Número de issues críticas
 * @property {number} issues.high - Número de issues de alta prioridade
 * @property {number} issues.medium - Número de issues de média prioridade
 * @property {number} issues.low - Número de issues de baixa prioridade
 * @property {string[]} recommendations - Recomendações
 * @property {string|null} reportPath - Caminho do relatório (ou null)
 * @property {Object|null} updatedBacklog - Backlog atualizado (ou null)
 */

/**
 * Valida se um evento de feedback atende ao contrato WorkflowFeedbackEvent
 * @param {Object} event - Evento a validar
 * @returns {{valid: boolean, errors: string[]}} - Resultado da validação
 */
export function validateWorkflowFeedbackEvent(event) {
  const errors = [];

  // Campos obrigatórios
  if (!event.event) errors.push('Campo obrigatório: event');
  if (!event.workflowId) errors.push('Campo obrigatório: workflowId');
  if (!event.timestamp) errors.push('Campo obrigatório: timestamp');
  if (!event.decision) errors.push('Campo obrigatório: decision');

  // Validação de event
  if (event.event && event.event !== 'workflow-complete') {
    errors.push(`event inválido: ${event.event}. Deve ser 'workflow-complete'`);
  }

  // Validação de decision
  const validDecisions = ['GO', 'NO-GO', 'CONDITIONAL', 'UNKNOWN'];
  if (event.decision && !validDecisions.includes(event.decision)) {
    errors.push(`decision inválida: ${event.decision}. Deve ser um de: ${validDecisions.join(', ')}`);
  }

  // Validação de issues (deve ser objeto com números)
  if (event.issues) {
    if (typeof event.issues !== 'object' || Array.isArray(event.issues)) {
      errors.push('issues deve ser um objeto');
    } else {
      const requiredIssueFields = ['critical', 'high', 'medium', 'low'];
      for (const field of requiredIssueFields) {
        if (event.issues[field] === undefined) {
          errors.push(`issues.${field} é obrigatório`);
        } else if (typeof event.issues[field] !== 'number') {
          errors.push(`issues.${field} deve ser um número`);
        }
      }
    }
  } else {
    errors.push('Campo obrigatório: issues');
  }

  // Validação de recommendations (deve ser array)
  if (event.recommendations !== undefined && !Array.isArray(event.recommendations)) {
    errors.push('recommendations deve ser um array');
  }

  // scores, reportPath e updatedBacklog podem ser null, mas não undefined
  if (event.scores === undefined) {
    errors.push('scores não pode ser undefined (use null se não houver scores)');
  }
  if (event.reportPath === undefined) {
    errors.push('reportPath não pode ser undefined (use null se não houver relatório)');
  }
  if (event.updatedBacklog === undefined) {
    errors.push('updatedBacklog não pode ser undefined (use null se não houver backlog)');
  }

  // Validação Firestore-safe: verificar undefined
  const firestoreValidation = validateForFirestore(event, 'WorkflowFeedbackEvent');
  if (!firestoreValidation.valid) {
    errors.push(...firestoreValidation.errors);
  }

  // Se houver erros, logar com classificação
  if (errors.length > 0) {
    const error = new Error(`CONTRATO VIOLADO: ${errors.join('; ')}`);
    logClassifiedError(error, 'WorkflowFeedbackEvent', event.workflowId || 'sem ID');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  validateWorkflowFeedbackEvent
};

