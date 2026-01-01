/**
 * Firebase Realtime Module for Web Dashboard
 * Fornece atualizações em tempo real usando Firestore
 * 
 * Uso no navegador (via CDN ou módulo):
 * - Importar Firebase SDK
 * - Conectar aos emuladores em desenvolvimento
 * - Observar mudanças em tempo real
 */

// Configuração Firebase (pode ser injetada via script tag)
const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "demo-api-key",
  authDomain: "planning-with-ai-fa2a3.firebaseapp.com",
  projectId: "planning-with-ai-fa2a3",
  storageBucket: "planning-with-ai-fa2a3.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Detectar se estamos em desenvolvimento (emuladores)
const USE_EMULATORS = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.USE_FIREBASE_EMULATORS === true;

let db = null;
let initialized = false;

// Inicializar Firebase (deve ser chamado após carregar Firebase SDK)
async function initializeFirebase() {
  if (initialized) return;
  
  try {
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK não carregado. Adicione o script do Firebase antes de usar este módulo.');
      return false;
    }
    
    const { initializeApp } = firebase.app;
    const { getFirestore, connectFirestoreEmulator } = firebase.firestore;
    const { getAuth, connectAuthEmulator } = firebase.auth;
    
    // Inicializar app
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    
    // Conectar aos emuladores se em desenvolvimento
    if (USE_EMULATORS) {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Conectado ao Firestore Emulator');
      } catch (error) {
        if (error.code !== 'failed-precondition') {
          console.warn('⚠️  Aviso ao conectar emulador:', error.message);
        }
      }
    }
    
    initialized = true;
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    return false;
  }
}

// Observar backlog em tempo real
function subscribeToBacklog(callback, backlogId = 'current') {
  if (!db) {
    console.error('Firebase não inicializado. Chame initializeFirebase() primeiro.');
    return null;
  }
  
  const { doc, onSnapshot } = firebase.firestore;
  const backlogRef = doc(db, 'backlog', backlogId);
  
  return onSnapshot(backlogRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro ao observar backlog:', error);
    callback(null);
  });
}

// Observar resultados de agentes em tempo real
function subscribeToAgentResults(agentName, callback, limit = 10) {
  if (!db) {
    console.error('Firebase não inicializado. Chame initializeFirebase() primeiro.');
    return null;
  }
  
  const { collection, query, where, orderBy, limit: limitFn, onSnapshot } = firebase.firestore;
  const resultsRef = collection(db, 'results');
  
  let q = query(resultsRef, where('agent', '==', agentName), orderBy('timestamp', 'desc'));
  if (limit) {
    q = query(q, limitFn(limit));
  }
  
  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(results);
  }, (error) => {
    console.error(`Erro ao observar resultados de ${agentName}:`, error);
    callback([]);
  });
}

// Observar todas as avaliações
function subscribeToEvaluations(callback, limit = 20) {
  if (!db) {
    console.error('Firebase não inicializado. Chame initializeFirebase() primeiro.');
    return null;
  }
  
  const { collection, query, orderBy, limit: limitFn, onSnapshot } = firebase.firestore;
  const evaluationsRef = collection(db, 'evaluations');
  
  let q = query(evaluationsRef, orderBy('timestamp', 'desc'));
  if (limit) {
    q = query(q, limitFn(limit));
  }
  
  return onSnapshot(q, (snapshot) => {
    const evaluations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(evaluations);
  }, (error) => {
    console.error('Erro ao observar avaliações:', error);
    callback([]);
  });
}

// Observar decisões
function subscribeToDecisions(callback, limit = 10) {
  if (!db) {
    console.error('Firebase não inicializado. Chame initializeFirebase() primeiro.');
    return null;
  }
  
  const { collection, query, orderBy, limit: limitFn, onSnapshot } = firebase.firestore;
  const decisionsRef = collection(db, 'decisions');
  
  let q = query(decisionsRef, orderBy('timestamp', 'desc'));
  if (limit) {
    q = query(q, limitFn(limit));
  }
  
  return onSnapshot(q, (snapshot) => {
    const decisions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(decisions);
  }, (error) => {
    console.error('Erro ao observar decisões:', error);
    callback([]);
  });
}

// Observar eventos
function subscribeToEvents(callback, limit = 50) {
  if (!db) {
    console.error('Firebase não inicializado. Chame initializeFirebase() primeiro.');
    return null;
  }
  
  const { collection, query, orderBy, limit: limitFn, onSnapshot } = firebase.firestore;
  const eventsRef = collection(db, 'events');
  
  let q = query(eventsRef, orderBy('timestamp', 'desc'));
  if (limit) {
    q = query(q, limitFn(limit));
  }
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(events);
  }, (error) => {
    console.error('Erro ao observar eventos:', error);
    callback([]);
  });
}

// Observar progresso do workflow
function subscribeToWorkflowProgress(callback) {
  if (!db) {
    console.error('Firebase não inicializado. Chame initializeFirebase() primeiro.');
    return null;
  }
  
  const { collection, query, where, orderBy, limit, onSnapshot } = firebase.firestore;
  const eventsRef = collection(db, 'events');
  
  // Observar eventos relacionados ao workflow
  const q = query(
    eventsRef,
    where('type', '==', 'workflow'),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const latestEvent = snapshot.docs[0].data();
      callback(latestEvent);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro ao observar progresso do workflow:', error);
    callback(null);
  });
}

// Exportar funções (para uso em módulos ES6)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeFirebase,
    subscribeToBacklog,
    subscribeToAgentResults,
    subscribeToEvaluations,
    subscribeToDecisions,
    subscribeToEvents,
    subscribeToWorkflowProgress
  };
}

// Exportar para uso global (window)
if (typeof window !== 'undefined') {
  window.FirebaseRealtime = {
    initializeFirebase,
    subscribeToBacklog,
    subscribeToAgentResults,
    subscribeToEvaluations,
    subscribeToDecisions,
    subscribeToEvents,
    subscribeToWorkflowProgress
  };
}

