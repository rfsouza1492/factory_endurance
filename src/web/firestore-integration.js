/**
 * Integração Firestore para Dashboard Web
 * Fornece atualizações em tempo real e sincronização entre sessões
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  where,
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "planning-with-ai-fa2a3.firebaseapp.com",
  projectId: "planning-with-ai-fa2a3",
  storageBucket: "planning-with-ai-fa2a3.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Detectar ambiente
const USE_EMULATORS = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Conectar aos emuladores se em desenvolvimento
if (USE_EMULATORS) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('🔧 Conectado aos Firebase Emulators');
  } catch (error) {
    if (error.code !== 'failed-precondition') {
      console.warn('⚠️  Aviso ao conectar emuladores:', error.message);
    }
  }
}

// Autenticação anônima
let currentUser = null;
(async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    currentUser = userCredential.user;
    console.log('✅ Autenticado:', currentUser.uid);
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
  }
})();

/**
 * Classe para gerenciar listeners do Firestore
 */
class FirestoreManager {
  constructor() {
    this.listeners = new Map();
    this.subscribers = new Map();
  }

  /**
   * Escutar mudanças no backlog
   */
  subscribeToBacklog(callback) {
    const unsubscribe = onSnapshot(
      doc(collection(db, 'backlog'), 'current'),
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Erro ao escutar backlog:', error);
        callback(null, error);
      }
    );

    this.listeners.set('backlog', unsubscribe);
    return unsubscribe;
  }

  /**
   * Escutar resultados de agentes em tempo real
   */
  subscribeToAgentResults(agentName, callback, limitCount = 10) {
    const q = query(
      collection(db, 'results'),
      where('agent', '==', agentName),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(results);
      },
      (error) => {
        console.error(`Erro ao escutar resultados de ${agentName}:`, error);
        callback([], error);
      }
    );

    const key = `results-${agentName}`;
    this.listeners.set(key, unsubscribe);
    return unsubscribe;
  }

  /**
   * Escutar todas as avaliações
   */
  subscribeToEvaluations(callback, limitCount = 20) {
    const q = query(
      collection(db, 'evaluations'),
      orderBy('migratedAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const evaluations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(evaluations);
      },
      (error) => {
        console.error('Erro ao escutar avaliações:', error);
        callback([], error);
      }
    );

    this.listeners.set('evaluations', unsubscribe);
    return unsubscribe;
  }

  /**
   * Escutar decisões
   */
  subscribeToDecisions(callback, limitCount = 10) {
    const q = query(
      collection(db, 'decisions'),
      orderBy('migratedAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const decisions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(decisions);
      },
      (error) => {
        console.error('Erro ao escutar decisões:', error);
        callback([], error);
      }
    );

    this.listeners.set('decisions', unsubscribe);
    return unsubscribe;
  }

  /**
   * Escutar eventos do workflow
   */
  subscribeToEvents(callback, limitCount = 50) {
    const q = query(
      collection(db, 'events'),
      orderBy('migratedAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(events);
      },
      (error) => {
        console.error('Erro ao escutar eventos:', error);
        callback([], error);
      }
    );

    this.listeners.set('events', unsubscribe);
    return unsubscribe;
  }

  /**
   * Escutar progresso do workflow
   */
  subscribeToWorkflowProgress(callback) {
    const unsubscribe = onSnapshot(
      doc(collection(db, 'workflow'), 'progress'),
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Erro ao escutar progresso:', error);
        callback(null, error);
      }
    );

    this.listeners.set('workflow-progress', unsubscribe);
    return unsubscribe;
  }

  /**
   * Cancelar todos os listeners
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
    this.subscribers.clear();
  }

  /**
   * Cancelar listener específico
   */
  unsubscribe(key) {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }
}

// Instância global
const firestoreManager = new FirestoreManager();

/**
 * Integrar com dashboard existente
 */
export function integrateWithDashboard(dashboardState) {
  console.log('🔄 Integrando dashboard com Firestore...');

  // Escutar backlog
  firestoreManager.subscribeToBacklog((backlog, error) => {
    if (error) {
      console.error('Erro ao carregar backlog:', error);
      return;
    }
    if (backlog) {
      dashboardState.backlog = backlog.items || [];
      updateBacklogUI(dashboardState.backlog);
    }
  });

  // Escutar resultados de agentes
  const agents = ['architecture-agent', 'code-quality-agent', 'security-agent', 
                  'performance-agent', 'testing-agent'];
  
  agents.forEach(agentName => {
    firestoreManager.subscribeToAgentResults(agentName, (results, error) => {
      if (error) {
        console.error(`Erro ao carregar resultados de ${agentName}:`, error);
        return;
      }
      if (!dashboardState.agents) {
        dashboardState.agents = {};
      }
      dashboardState.agents[agentName] = results;
      updateAgentResultsUI(agentName, results);
    });
  });

  // Escutar avaliações
  firestoreManager.subscribeToEvaluations((evaluations, error) => {
    if (error) {
      console.error('Erro ao carregar avaliações:', error);
      return;
    }
    dashboardState.evaluations = evaluations;
    updateEvaluationsUI(evaluations);
  });

  // Escutar decisões
  firestoreManager.subscribeToDecisions((decisions, error) => {
    if (error) {
      console.error('Erro ao carregar decisões:', error);
      return;
    }
    dashboardState.decisions = decisions;
    updateDecisionsUI(decisions);
  });

  // Escutar eventos
  firestoreManager.subscribeToEvents((events, error) => {
    if (error) {
      console.error('Erro ao carregar eventos:', error);
      return;
    }
    dashboardState.activities = events;
    updateActivitiesUI(events);
  });

  // Escutar progresso do workflow
  firestoreManager.subscribeToWorkflowProgress((progress, error) => {
    if (error) {
      console.error('Erro ao carregar progresso:', error);
      return;
    }
    if (progress) {
      dashboardState.progress = progress;
      updateProgressUI(progress);
    }
  });

  console.log('✅ Dashboard integrado com Firestore em tempo real');
}

/**
 * Funções auxiliares para atualizar UI
 * (Adaptar conforme sua estrutura HTML)
 */
function updateBacklogUI(backlog) {
  const backlogElement = document.getElementById('backlog-list');
  if (backlogElement && backlog) {
    // Atualizar UI do backlog
    console.log('📋 Backlog atualizado:', backlog.length, 'itens');
  }
}

function updateAgentResultsUI(agentName, results) {
  console.log(`📊 Resultados de ${agentName} atualizados:`, results.length);
  // Atualizar UI específica do agente
}

function updateEvaluationsUI(evaluations) {
  console.log('📝 Avaliações atualizadas:', evaluations.length);
  // Atualizar UI de avaliações
}

function updateDecisionsUI(decisions) {
  console.log('✅ Decisões atualizadas:', decisions.length);
  // Atualizar UI de decisões
}

function updateActivitiesUI(events) {
  console.log('📅 Eventos atualizados:', events.length);
  // Atualizar UI de atividades
}

function updateProgressUI(progress) {
  console.log('📈 Progresso atualizado:', progress);
  // Atualizar UI de progresso
}

// Exportar
export { firestoreManager, db, auth, currentUser };
export default firestoreManager;

