/**
 * Helper para salvar resultados de agentes no Firestore
 * Mantém compatibilidade com sistema de arquivos (modo híbrido)
 */

import { saveAgentResult } from './connection.js';
import fs from 'fs';
import path from 'path';

// Modo de salvamento: 'hybrid' (arquivos + Firestore) ou 'firestore' (apenas Firestore)
const SAVE_MODE = process.env.FIREBASE_SAVE_MODE || 'hybrid';

/**
 * Salva resultado de agente no Firestore e opcionalmente em arquivo
 * @param {string} agentName - Nome do agente (ex: 'architecture-review')
 * @param {object} resultData - Dados do resultado
 * @param {string} markdownContent - Conteúdo markdown do relatório (opcional)
 * @param {string} filePath - Caminho do arquivo para salvar (opcional, para modo híbrido)
 * @returns {Promise<object>} - Objeto com informações do salvamento
 */
export async function saveAgentResultToFirestore(agentName, resultData, options = {}) {
  const {
    markdownContent = null,
    filePath = null,
    timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5),
    projectId = process.env.PROJECT_ID || null
  } = options;

  const result = {
    success: false,
    firestoreId: null,
    filePath: null,
    error: null
  };

  try {
    // Preparar dados para Firestore
    const firestoreData = {
      ...resultData,
      agent: agentName,
      projectId: projectId, // Adicionar projectId para multi-projeto
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'agent-execution'
    };

    // Adicionar conteúdo markdown se disponível
    if (markdownContent) {
      firestoreData.markdownContent = markdownContent;
      firestoreData.hasMarkdown = true;
    }

    // Salvar no Firestore
    try {
      const firestoreId = await saveAgentResult(agentName, firestoreData);
      result.firestoreId = firestoreId;
      result.success = true;
      console.log(`✅ Resultado do ${agentName} salvo no Firestore: ${firestoreId}`);
    } catch (firestoreError) {
      console.warn(`⚠️  Erro ao salvar no Firestore: ${firestoreError.message}`);
      result.error = firestoreError.message;
      // Continuar mesmo se Firestore falhar (modo híbrido)
    }

    // Salvar em arquivo se modo híbrido ou se Firestore falhou
    if (SAVE_MODE === 'hybrid' || (SAVE_MODE === 'firestore' && !result.success)) {
      if (filePath) {
        try {
          // Garantir que o diretório existe
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Salvar markdown se disponível
          if (markdownContent) {
            fs.writeFileSync(filePath, markdownContent, 'utf-8');
            result.filePath = filePath;
            console.log(`✅ Resultado do ${agentName} salvo em arquivo: ${filePath}`);
          } else {
            // Salvar JSON se não houver markdown
            const jsonPath = filePath.replace(/\.md$/, '.json');
            fs.writeFileSync(jsonPath, JSON.stringify(resultData, null, 2), 'utf-8');
            result.filePath = jsonPath;
            console.log(`✅ Resultado do ${agentName} salvo em arquivo: ${jsonPath}`);
          }
        } catch (fileError) {
          console.warn(`⚠️  Erro ao salvar em arquivo: ${fileError.message}`);
          if (!result.success) {
            result.error = fileError.message;
          }
        }
      }
    }

    return result;
  } catch (error) {
    result.error = error.message;
    console.error(`❌ Erro ao salvar resultado do ${agentName}:`, error);
    return result;
  }
}

/**
 * Salva backlog no Firestore e opcionalmente em arquivo
 * @param {object} backlogData - Dados do backlog
 * @param {string} backlogId - ID do backlog (padrão: 'current')
 * @param {string} filePath - Caminho do arquivo para salvar (opcional)
 * @returns {Promise<object>} - Objeto com informações do salvamento
 */
export async function saveBacklogToFirestore(backlogData, options = {}) {
  const {
    backlogId = 'current',
    filePath = null
  } = options;

  const result = {
    success: false,
    firestoreId: null,
    filePath: null,
    error: null
  };

  // Validar contrato AutoFix antes de salvar (FAIL-FAST)
  try {
    const { validateAutoFixBacklog } = await import('../schemas/auto-fix-task.js');
    const validation = validateAutoFixBacklog(backlogData);
    
    if (!validation.valid) {
      const errorMsg = `❌ CONTRATO VIOLADO (backlog/${backlogId}):\n${validation.errors.join('\n')}`;
      console.error(errorMsg);
      result.error = errorMsg;
      return result;
    }
  } catch (error) {
    if (error.message && error.message.includes('CONTRATO VIOLADO')) {
      result.error = error.message;
      return result;
    }
    console.warn('⚠️  Aviso: Não foi possível validar backlog:', error.message);
  }

  try {
    const { saveBacklog } = await import('./connection.js');

    // Salvar no Firestore
    try {
      const firestoreId = await saveBacklog(backlogData, backlogId);
      result.firestoreId = firestoreId;
      result.success = true;
      console.log(`✅ Backlog salvo no Firestore: ${backlogId}`);
    } catch (firestoreError) {
      console.warn(`⚠️  Erro ao salvar backlog no Firestore: ${firestoreError.message}`);
      result.error = firestoreError.message;
    }

    // Salvar em arquivo se modo híbrido
    if (SAVE_MODE === 'hybrid' && filePath) {
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(backlogData, null, 2), 'utf-8');
        result.filePath = filePath;
        console.log(`✅ Backlog salvo em arquivo: ${filePath}`);
      } catch (fileError) {
        console.warn(`⚠️  Erro ao salvar backlog em arquivo: ${fileError.message}`);
      }
    }

    return result;
  } catch (error) {
    result.error = error.message;
    console.error(`❌ Erro ao salvar backlog:`, error);
    return result;
  }
}

/**
 * Salva avaliação no Firestore
 * @param {string} evaluationId - ID da avaliação
 * @param {object} evaluationData - Dados da avaliação
 * @param {string} markdownContent - Conteúdo markdown (opcional)
 * @param {string} filePath - Caminho do arquivo (opcional)
 * @returns {Promise<object>} - Objeto com informações do salvamento
 */
export async function saveEvaluationToFirestore(evaluationId, evaluationData, options = {}) {
  const {
    markdownContent = null,
    filePath = null
  } = options;

  const result = {
    success: false,
    firestoreId: null,
    filePath: null,
    error: null
  };

  try {
    const { saveEvaluation } = await import('./connection.js');

    const firestoreData = {
      ...evaluationData,
      markdownContent: markdownContent || null,
      hasMarkdown: !!markdownContent
    };

    // Salvar no Firestore
    try {
      const firestoreId = await saveEvaluation(firestoreData, evaluationId);
      result.firestoreId = firestoreId;
      result.success = true;
      console.log(`✅ Avaliação salva no Firestore: ${evaluationId}`);
    } catch (firestoreError) {
      console.warn(`⚠️  Erro ao salvar avaliação no Firestore: ${firestoreError.message}`);
      result.error = firestoreError.message;
    }

    // Salvar em arquivo se modo híbrido
    if (SAVE_MODE === 'hybrid' && filePath && markdownContent) {
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, markdownContent, 'utf-8');
        result.filePath = filePath;
      } catch (fileError) {
        console.warn(`⚠️  Erro ao salvar avaliação em arquivo: ${fileError.message}`);
      }
    }

    return result;
  } catch (error) {
    result.error = error.message;
    console.error(`❌ Erro ao salvar avaliação:`, error);
    return result;
  }
}

/**
 * Salva decisão no Firestore
 * @param {string} decisionId - ID da decisão
 * @param {object} decisionData - Dados da decisão
 * @param {string} markdownContent - Conteúdo markdown (opcional)
 * @param {string} filePath - Caminho do arquivo (opcional)
 * @returns {Promise<object>} - Objeto com informações do salvamento
 */
export async function saveDecisionToFirestore(decisionId, decisionData, options = {}) {
  const {
    markdownContent = null,
    filePath = null
  } = options;

  const result = {
    success: false,
    firestoreId: null,
    filePath: null,
    error: null
  };

  try {
    const { saveDecision } = await import('./connection.js');

    const firestoreData = {
      ...decisionData,
      markdownContent: markdownContent || null,
      hasMarkdown: !!markdownContent
    };

    // Salvar no Firestore
    try {
      const firestoreId = await saveDecision(firestoreData, decisionId);
      result.firestoreId = firestoreId;
      result.success = true;
      console.log(`✅ Decisão salva no Firestore: ${decisionId}`);
    } catch (firestoreError) {
      console.warn(`⚠️  Erro ao salvar decisão no Firestore: ${firestoreError.message}`);
      result.error = firestoreError.message;
    }

    // Salvar em arquivo se modo híbrido
    if (SAVE_MODE === 'hybrid' && filePath && markdownContent) {
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, markdownContent, 'utf-8');
        result.filePath = filePath;
      } catch (fileError) {
        console.warn(`⚠️  Erro ao salvar decisão em arquivo: ${fileError.message}`);
      }
    }

    return result;
  } catch (error) {
    result.error = error.message;
    console.error(`❌ Erro ao salvar decisão:`, error);
    return result;
  }
}

/**
 * Salva evento no Firestore
 * @param {string} eventId - ID do evento
 * @param {object} eventData - Dados do evento
 * @returns {Promise<object>} - Objeto com informações do salvamento
 */
export async function saveEventToFirestore(eventId, eventData) {
  // Validar contrato WorkflowFeedbackEvent antes de salvar (FAIL-FAST)
  if (eventId === 'workflow-feedback') {
    try {
      const { validateWorkflowFeedbackEvent } = await import('../schemas/workflow-feedback-event.js');
      const validation = validateWorkflowFeedbackEvent(eventData);
      
      if (!validation.valid) {
        const errorMsg = `❌ CONTRATO VIOLADO (workflow-feedback):\n${validation.errors.join('\n')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      if (error.message.includes('CONTRATO VIOLADO')) {
        throw error; // Re-throw erros de contrato
      }
      console.warn('⚠️  Aviso: Não foi possível validar evento:', error.message);
    }
  }
  const result = {
    success: false,
    firestoreId: null,
    error: null
  };

  try {
    const { saveEvent } = await import('./connection.js');

    const firestoreId = await saveEvent(eventData, eventId);
    result.firestoreId = firestoreId;
    result.success = true;
    console.log(`✅ Evento salvo no Firestore: ${eventId}`);

    return result;
  } catch (error) {
    result.error = error.message;
    console.error(`❌ Erro ao salvar evento:`, error);
    return result;
  }
}

