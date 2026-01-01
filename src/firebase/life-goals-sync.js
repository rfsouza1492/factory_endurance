/**
 * Life Goals App + Maestro Sync
 * Sincroniza dados entre Life Goals App e Maestro Workflow
 */

import { db } from './connection.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Sincroniza backlog do Maestro com tarefas do Life Goals App
 * Converte itens do backlog em tarefas que podem ser adicionadas ao app
 */
export async function syncBacklogToLifeGoals(userId, backlogId = 'current') {
  try {
    // Buscar backlog do Maestro
    const backlogRef = doc(db, 'maestro/backlog', backlogId);
    const backlogSnap = await getDoc(backlogRef);
    
    if (!backlogSnap.exists()) {
      console.warn(`Backlog ${backlogId} não encontrado`);
      return { success: false, message: 'Backlog não encontrado' };
    }
    
    const backlog = backlogSnap.data();
    
    // Converter tarefas do backlog em formato do Life Goals App
    const tasks = backlog.tasks || [];
    const highPriorityTasks = tasks
      .filter(task => task.priority === 'P0' || task.priority === 'P1')
      .slice(0, 5); // Limitar a 5 tarefas mais importantes
    
    // Criar coleção de tarefas sincronizadas
    const syncRef = collection(db, `users/${userId}/maestro-tasks`);
    
    const syncResults = [];
    for (const task of highPriorityTasks) {
      const taskRef = doc(syncRef);
      const taskData = {
        id: task.id || taskRef.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status || 'pending',
        source: 'maestro-backlog',
        backlogId: backlogId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(taskRef, taskData);
      syncResults.push(taskData);
    }
    
    console.log(`✅ ${syncResults.length} tarefas sincronizadas do Maestro para Life Goals App`);
    
    return {
      success: true,
      tasksSynced: syncResults.length,
      tasks: syncResults
    };
  } catch (error) {
    console.error('❌ Erro ao sincronizar backlog:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém métricas combinadas do Life Goals App e Maestro
 */
export async function getCombinedMetrics(userId) {
  try {
    // Métricas do Life Goals App
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );
    const goalsSnap = await getDocs(goalsQuery);
    
    const goals = goalsSnap.docs.map(doc => doc.data());
    const completedGoals = goals.filter(g => g.completed).length;
    const activeGoals = goals.filter(g => !g.completed).length;
    
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId)
    );
    const habitsSnap = await getDocs(habitsQuery);
    
    const habits = habitsSnap.docs.map(doc => doc.data());
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    
    // Métricas do Maestro
    const latestResultsQuery = query(
      collection(db, 'maestro/results'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const resultsSnap = await getDocs(latestResultsQuery);
    
    let latestScore = null;
    if (!resultsSnap.empty) {
      const latestResult = resultsSnap.docs[0].data();
      // Tentar encontrar score do Code Quality Agent
      if (latestResult.agent === 'code-quality-review' && latestResult.score) {
        latestScore = latestResult.score;
      }
    }
    
    // Backlog do Maestro
    const backlogRef = doc(db, 'maestro/backlog', 'current');
    const backlogSnap = await getDoc(backlogRef);
    
    let backlogTasks = 0;
    if (backlogSnap.exists()) {
      const backlog = backlogSnap.data();
      backlogTasks = backlog.tasks?.length || 0;
    }
    
    return {
      lifeGoals: {
        totalGoals: goals.length,
        completedGoals,
        activeGoals,
        totalHabits: habits.length,
        totalStreak,
        completionRate: goals.length > 0 ? (completedGoals / goals.length) * 100 : 0
      },
      maestro: {
        latestCodeQualityScore: latestScore,
        backlogTasks,
        hasBacklog: backlogSnap.exists()
      },
      combined: {
        overallProgress: latestScore ? (latestScore + (completedGoals / Math.max(goals.length, 1)) * 100) / 2 : 0
      }
    };
  } catch (error) {
    console.error('❌ Erro ao obter métricas combinadas:', error);
    return {
      error: error.message
    };
  }
}

/**
 * Observa mudanças no backlog do Maestro e notifica Life Goals App
 */
export function watchMaestroBacklog(callback) {
  const backlogRef = doc(db, 'maestro/backlog', 'current');
  
  return onSnapshot(backlogRef, (snap) => {
    if (snap.exists()) {
      const backlog = snap.data();
      callback({
        hasBacklog: true,
        taskCount: backlog.tasks?.length || 0,
        highPriorityTasks: backlog.tasks?.filter(t => t.priority === 'P0' || t.priority === 'P1').length || 0,
        backlog: backlog
      });
    } else {
      callback({
        hasBacklog: false,
        taskCount: 0,
        highPriorityTasks: 0
      });
    }
  }, (error) => {
    console.error('❌ Erro ao observar backlog:', error);
    callback({ error: error.message });
  });
}

/**
 * Observa resultados do Maestro e atualiza métricas
 */
export function watchMaestroResults(callback) {
  const resultsQuery = query(
    collection(db, 'maestro/results'),
    orderBy('timestamp', 'desc'),
    limit(10)
  );
  
  return onSnapshot(resultsQuery, (snap) => {
    const results = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Agrupar por agente
    const byAgent = {};
    results.forEach(result => {
      if (!byAgent[result.agent]) {
        byAgent[result.agent] = [];
      }
      byAgent[result.agent].push(result);
    });
    
    // Calcular scores médios
    const scores = {};
    Object.keys(byAgent).forEach(agent => {
      const agentResults = byAgent[agent];
      const scoresList = agentResults
        .map(r => r.score)
        .filter(s => s !== null && s !== undefined);
      
      if (scoresList.length > 0) {
        scores[agent] = scoresList.reduce((a, b) => a + b, 0) / scoresList.length;
      }
    });
    
    callback({
      results,
      byAgent,
      scores,
      latest: results[0] || null
    });
  }, (error) => {
    console.error('❌ Erro ao observar resultados:', error);
    callback({ error: error.message });
  });
}

/**
 * Cria uma meta no Life Goals App baseada em uma tarefa do Maestro
 */
export async function createGoalFromMaestroTask(userId, maestroTask) {
  try {
    const goalRef = doc(collection(db, 'goals'));
    const goalData = {
      userId: userId,
      text: `Melhorar: ${maestroTask.title}`,
      completed: false,
      tasks: maestroTask.subtasks?.map((subtask, idx) => ({
        id: Date.now() + idx,
        text: subtask,
        completed: false,
        subtasks: []
      })) || [],
      source: 'maestro',
      maestroTaskId: maestroTask.id,
      createdAt: serverTimestamp()
    };
    
    await setDoc(goalRef, goalData);
    
    console.log(`✅ Meta criada no Life Goals App a partir da tarefa do Maestro: ${maestroTask.title}`);
    
    return {
      success: true,
      goalId: goalRef.id,
      goal: goalData
    };
  } catch (error) {
    console.error('❌ Erro ao criar meta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exporta todas as funções
 */
export default {
  syncBacklogToLifeGoals,
  getCombinedMetrics,
  watchMaestroBacklog,
  watchMaestroResults,
  createGoalFromMaestroTask
};

