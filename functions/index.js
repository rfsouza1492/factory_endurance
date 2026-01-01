/**
 * Cloud Functions para Maestro Workflow
 * Processamento pesado de agentes, geração de relatórios e cálculos complexos
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Function: processAgent
 * Processa um agente específico e salva o resultado
 */
exports.processAgent = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  const { agentName, inputData } = data;

  if (!agentName || !inputData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'agentName e inputData são obrigatórios'
    );
  }

  try {
    // Registrar início do processamento
    const processId = `process-${Date.now()}`;
    await db.collection('processes').doc(processId).set({
      agentName,
      status: 'processing',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      inputData
    });

    // Simular processamento pesado
    // Em produção, aqui você chamaria o agente real
    const result = await processAgentLogic(agentName, inputData);

    // Salvar resultado
    const resultRef = db.collection('results').doc(`${agentName}-${Date.now()}`);
    await resultRef.set({
      agent: agentName,
      result,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processId
    });

    // Atualizar status do processo
    await db.collection('processes').doc(processId).update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      resultId: resultRef.id
    });

    return {
      success: true,
      resultId: resultRef.id,
      processId
    };
  } catch (error) {
    console.error('Erro ao processar agente:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erro ao processar agente: ${error.message}`
    );
  }
});

/**
 * Function: generateReport
 * Gera relatório agregado de múltiplos agentes
 */
exports.generateReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  const { agentNames, dateRange } = data;

  try {
    // Buscar resultados dos agentes
    const results = [];
    for (const agentName of agentNames || []) {
      const snapshot = await db.collection('results')
        .where('agent', '==', agentName)
        .orderBy('processedAt', 'desc')
        .limit(10)
        .get();

      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Processar e agregar dados
    const report = {
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      agents: agentNames,
      totalResults: results.length,
      summary: aggregateResults(results),
      details: results
    };

    // Salvar relatório
    const reportRef = db.collection('reports').doc(`report-${Date.now()}`);
    await reportRef.set(report);

    return {
      success: true,
      reportId: reportRef.id,
      report
    };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erro ao gerar relatório: ${error.message}`
    );
  }
});

/**
 * Function: calculateMetrics
 * Calcula métricas complexas do workflow
 */
exports.calculateMetrics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  try {
    // Buscar todos os resultados
    const resultsSnapshot = await db.collection('results')
      .orderBy('processedAt', 'desc')
      .limit(100)
      .get();

    const results = [];
    resultsSnapshot.forEach(doc => {
      results.push(doc.data());
    });

    // Calcular métricas
    const metrics = {
      totalAgents: new Set(results.map(r => r.agent)).size,
      totalResults: results.length,
      averageProcessingTime: calculateAverageProcessingTime(results),
      successRate: calculateSuccessRate(results),
      agentPerformance: calculateAgentPerformance(results),
      calculatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Salvar métricas
    await db.collection('metrics').doc('current').set(metrics);

    return {
      success: true,
      metrics
    };
  } catch (error) {
    console.error('Erro ao calcular métricas:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erro ao calcular métricas: ${error.message}`
    );
  }
});

/**
 * Function: batchProcessAgents
 * Processa múltiplos agentes em lote
 */
exports.batchProcessAgents = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  const { agentConfigs } = data;

  if (!agentConfigs || !Array.isArray(agentConfigs)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'agentConfigs deve ser um array'
    );
  }

  try {
    const batchId = `batch-${Date.now()}`;
    const results = [];

    // Processar cada agente
    for (const config of agentConfigs) {
      try {
        const result = await processAgentLogic(config.agentName, config.inputData);
        results.push({
          agentName: config.agentName,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          agentName: config.agentName,
          success: false,
          error: error.message
        });
      }
    }

    // Salvar batch
    await db.collection('batches').doc(batchId).set({
      batchId,
      agentConfigs,
      results,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalAgents: agentConfigs.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return {
      success: true,
      batchId,
      results
    };
  } catch (error) {
    console.error('Erro ao processar batch:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erro ao processar batch: ${error.message}`
    );
  }
});

/**
 * Trigger: onResultCreated
 * Executa ações quando um resultado é criado
 */
exports.onResultCreated = functions.firestore
  .document('results/{resultId}')
  .onCreate(async (snap, context) => {
    const result = snap.data();
    
    // Atualizar métricas
    await updateMetrics(result);
    
    // Notificar se necessário
    if (result.notifyOnComplete) {
      await sendNotification(result);
    }

    console.log(`Resultado criado: ${context.params.resultId}`);
  });

/**
 * Trigger: onWorkflowProgressUpdated
 * Atualiza progresso do workflow
 */
exports.onWorkflowProgressUpdated = functions.firestore
  .document('workflow/progress')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Verificar se workflow foi completado
    if (newData.status === 'completed' && oldData.status !== 'completed') {
      await db.collection('events').add({
        type: 'workflow-completed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        workflowData: newData
      });
    }
  });

// Funções auxiliares

async function processAgentLogic(agentName, inputData) {
  // Simular processamento
  // Em produção, aqui você chamaria o agente real
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    agent: agentName,
    score: Math.floor(Math.random() * 100),
    issues: [`Issue from ${agentName}`],
    recommendations: [`Recommendation from ${agentName}`],
    processedAt: new Date().toISOString()
  };
}

function aggregateResults(results) {
  const summary = {
    total: results.length,
    byAgent: {},
    averageScore: 0,
    totalIssues: 0,
    totalRecommendations: 0
  };

  let totalScore = 0;
  results.forEach(result => {
    const agent = result.agent || 'unknown';
    if (!summary.byAgent[agent]) {
      summary.byAgent[agent] = { count: 0, scores: [] };
    }
    summary.byAgent[agent].count++;
    
    if (result.result && result.result.score) {
      totalScore += result.result.score;
      summary.byAgent[agent].scores.push(result.result.score);
    }
    
    if (result.result && result.result.issues) {
      summary.totalIssues += result.result.issues.length;
    }
    
    if (result.result && result.result.recommendations) {
      summary.totalRecommendations += result.result.recommendations.length;
    }
  });

  summary.averageScore = results.length > 0 ? totalScore / results.length : 0;

  return summary;
}

function calculateAverageProcessingTime(results) {
  // Calcular tempo médio de processamento
  // Implementar lógica real baseada em timestamps
  return 1500; // ms
}

function calculateSuccessRate(results) {
  const successful = results.filter(r => r.result && !r.result.error).length;
  return results.length > 0 ? (successful / results.length) * 100 : 0;
}

function calculateAgentPerformance(results) {
  const performance = {};
  results.forEach(result => {
    const agent = result.agent || 'unknown';
    if (!performance[agent]) {
      performance[agent] = { count: 0, totalScore: 0 };
    }
    performance[agent].count++;
    if (result.result && result.result.score) {
      performance[agent].totalScore += result.result.score;
    }
  });

  Object.keys(performance).forEach(agent => {
    performance[agent].averageScore = performance[agent].count > 0
      ? performance[agent].totalScore / performance[agent].count
      : 0;
  });

  return performance;
}

async function updateMetrics(result) {
  // Atualizar métricas agregadas
  const metricsRef = db.collection('metrics').doc('current');
  const metrics = await metricsRef.get();
  
  if (metrics.exists()) {
    await metricsRef.update({
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      totalResults: admin.firestore.FieldValue.increment(1)
    });
  }
}

async function sendNotification(result) {
  // Enviar notificação (email, push, etc.)
  console.log('Notificação enviada para resultado:', result);
}
