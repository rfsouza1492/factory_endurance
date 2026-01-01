/**
 * Error Classifier
 * Classifica erros do workflow com prefixos claros para facilitar debugging
 */

/**
 * Tipos de erro do workflow
 */
export const ERROR_TYPES = {
  CONTRACT: 'CONTRACT_ERROR',
  INFRA: 'INFRA_ERROR',
  RUNTIME: 'RUNTIME_ERROR',
  VALIDATION: 'VALIDATION_ERROR'
};

/**
 * Classifica um erro e retorna mensagem formatada
 * @param {Error} error - Erro a classificar
 * @param {string} context - Contexto onde o erro ocorreu
 * @param {string} [entityType] - Tipo de entidade (AutoFixTask, WorkflowFeedbackEvent, etc.)
 * @returns {string} - Mensagem formatada
 */
export function classifyError(error, context, entityType = null) {
  const errorMessage = error.message || String(error);
  const errorType = detectErrorType(errorMessage, error);
  
  let prefix = `${errorType} [${context}]`;
  if (entityType) {
    prefix += ` [${entityType}]`;
  }
  
  return `${prefix} ${errorMessage}`;
}

/**
 * Detecta o tipo de erro baseado na mensagem e no objeto
 * @param {string} message - Mensagem de erro
 * @param {Error} error - Objeto de erro
 * @returns {string} - Tipo de erro
 */
function detectErrorType(message, error) {
  // Erro de contrato
  if (message.includes('CONTRATO VIOLADO') || 
      message.includes('CONTRACT_ERROR') ||
      message.includes('Campo obrigatório') ||
      message.includes('inválido') ||
      message.includes('contém campos undefined')) {
    return ERROR_TYPES.CONTRACT;
  }
  
  // Erro de infra (Firestore, rede, etc.)
  if (message.includes('FirebaseError') ||
      message.includes('PERMISSION_DENIED') ||
      message.includes('network') ||
      message.includes('UNAVAILABLE') ||
      message.includes('UNAUTHENTICATED') ||
      error.code?.startsWith('firestore/') ||
      error.code?.startsWith('auth/')) {
    return ERROR_TYPES.INFRA;
  }
  
  // Erro de validação
  if (message.includes('validate') ||
      message.includes('validation') ||
      message.includes('VALIDATION_ERROR')) {
    return ERROR_TYPES.VALIDATION;
  }
  
  // Erro de runtime (execução, aplicação de fix, etc.)
  return ERROR_TYPES.RUNTIME;
}

/**
 * Formata erro para log
 * @param {Error} error - Erro a formatar
 * @param {string} context - Contexto
 * @param {string} [entityType] - Tipo de entidade
 * @returns {Object} - Objeto formatado para log
 */
export function formatErrorForLog(error, context, entityType = null) {
  const classified = classifyError(error, context, entityType);
  const errorType = detectErrorType(error.message || String(error), error);
  
  return {
    type: errorType,
    message: classified,
    originalError: error.message || String(error),
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    entityType
  };
}

/**
 * Loga erro com classificação
 * @param {Error} error - Erro a logar
 * @param {string} context - Contexto
 * @param {string} [entityType] - Tipo de entidade
 */
export function logClassifiedError(error, context, entityType = null) {
  const formatted = formatErrorForLog(error, context, entityType);
  console.error(formatted.message);
  
  if (formatted.type === ERROR_TYPES.CONTRACT) {
    console.error('📋 Detalhes do contrato:', formatted.originalError);
  } else if (formatted.type === ERROR_TYPES.INFRA) {
    console.error('🔧 Erro de infraestrutura:', formatted.originalError);
  } else if (formatted.type === ERROR_TYPES.RUNTIME) {
    console.error('⚙️  Erro de execução:', formatted.originalError);
  }
  
  return formatted;
}

export default {
  ERROR_TYPES,
  classifyError,
  formatErrorForLog,
  logClassifiedError
};

