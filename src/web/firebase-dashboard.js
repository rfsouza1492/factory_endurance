/**
 * Firebase Dashboard Integration
 * Integra o dashboard com Firestore para atualizações em tempo real
 */

// Configuração Firebase (usar do módulo de conexão ou config)
let firebaseInitialized = false;
let db = null;
let unsubscribeCallbacks = [];

/**
 * Inicializa Firebase no dashboard
 */
export async function initFirebaseDashboard() {
  if (firebaseInitialized) return;

  try {
    // Importar Firebase (client-side)
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, connectFirestoreEmulator, onSnapshot, collection, doc, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // Configuração (mesma do connection.js)
    const firebaseConfig = {
      apiKey: window.FIREBASE_API_KEY || "demo-api-key",
      authDomain: window.FIREBASE_AUTH_DOMAIN || "planning-with-ai-fa2a3.firebaseapp.com",
      projectId: window.FIREBASE_PROJECT_ID || "planning-with-ai-fa2a3",
      storageBucket: window.FIREBASE_STORAGE_BUCKET || "planning-with-ai-fa2a3.appspot.com",
      messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || "123456789",
      appId: window.FIREBASE_APP_ID || "demo-app-id"
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    // Conectar aos emuladores se em desenvolvimento
    const USE_EMULATORS = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (USE_EMULATORS) {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔧 Conectado aos Firebase Emulators');
      } catch (error) {
        // Já conectado ou erro
      }
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Dashboard inicializado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Dashboard:', error);
    return false;
  }
}

/**
 * Observa progresso do workflow em tempo real
 */
export function watchWorkflowProgress(callback) {
  if (!firebaseInitialized || !db) {
    console.warn('⚠️  Firebase não inicializado, usando polling');
    return null;
  }

  try {
    const { onSnapshot, doc, collection } = require('firebase/firestore');
    const progressRef = doc(collection(db, 'workflow-progress'), 'workflow-progress');
    
    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    }, (error) => {
      console.error('❌ Erro ao observar progresso:', error);
    });

    unsubscribeCallbacks.push(unsubscribe);
    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao configurar watch:', error);
    return null;
  }
}

/**
 * Observa resultados de agentes em tempo real
 */
export function watchAgentResults(agentName, callback) {
  if (!firebaseInitialized || !db) {
    return null;
  }

  try {
    const { onSnapshot, collection, query, where, orderBy } = require('firebase/firestore');
    const resultsRef = collection(db, 'agent-results');
    const q = query(
      resultsRef,
      where('agent', '==', agentName),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(results);
    }, (error) => {
      console.error(`❌ Erro ao observar resultados de ${agentName}:`, error);
    });

    unsubscribeCallbacks.push(unsubscribe);
    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao configurar watch:', error);
    return null;
  }
}

/**
 * Observa backlog em tempo real
 */
export function watchBacklog(callback) {
  if (!firebaseInitialized || !db) {
    return null;
  }

  try {
    const { onSnapshot, doc, collection } = require('firebase/firestore');
    const backlogRef = doc(collection(db, 'backlog'), 'backlog-current');
    
    const unsubscribe = onSnapshot(backlogRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    }, (error) => {
      console.error('❌ Erro ao observar backlog:', error);
    });

    unsubscribeCallbacks.push(unsubscribe);
    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao configurar watch:', error);
    return null;
  }
}

/**
 * Observa decisões em tempo real
 */
export function watchDecisions(callback) {
  if (!firebaseInitialized || !db) {
    return null;
  }

  try {
    const { onSnapshot, collection, query, orderBy, limit } = require('firebase/firestore');
    const decisionsRef = collection(db, 'decisions');
    const q = query(decisionsRef, orderBy('timestamp', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const decisions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      if (decisions.length > 0) {
        callback(decisions[0]);
      }
    }, (error) => {
      console.error('❌ Erro ao observar decisões:', error);
    });

    unsubscribeCallbacks.push(unsubscribe);
    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao configurar watch:', error);
    return null;
  }
}

/**
 * Limpa todas as assinaturas
 */
export function cleanupWatchers() {
  unsubscribeCallbacks.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  unsubscribeCallbacks = [];
}

/**
 * Versão simplificada usando fetch para API (fallback)
 */
export async function fetchWorkflowProgress() {
  try {
    const response = await fetch('/api/progress');
    const data = await response.json();
    return data.progress || {};
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    return {};
  }
}

export { firebaseInitialized, db };

