// Firebase Connection Module for Maestro Workflow
// Conecta o Maestro Workflow aos Firebase Emulators ou produção

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator,
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
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { sanitizeDocument } from './firestore-sanitizer.js';

// Firebase configuration
// Usa variáveis de ambiente se disponíveis, senão usa credenciais de produção como fallback
// ⚠️ IMPORTANTE: Em produção, sempre use variáveis de ambiente!
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "planning-with-ai-fa2a3.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "planning-with-ai-fa2a3",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "planning-with-ai-fa2a3.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "341098460420",
  appId: process.env.FIREBASE_APP_ID || "1:341098460420:web:78b96216c227100dd44c51"
};

// Detectar ambiente
const USE_EMULATORS = process.env.NODE_ENV === 'development' || 
                     process.env.USE_FIREBASE_EMULATORS === 'true' ||
                     !process.env.FIREBASE_API_KEY;

// Validação de variáveis obrigatórias (apenas em produção)
if (!USE_EMULATORS) {
  const requiredVars = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não encontradas:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('   Configure as variáveis no arquivo .env ou variáveis de ambiente do sistema');
    throw new Error(`Missing required Firebase env vars: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ Variáveis de ambiente do Firebase validadas');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Conectar aos emuladores se em desenvolvimento
if (USE_EMULATORS) {
  console.log('🔧 Conectando aos Firebase Emulators...');
  console.log('   - Firestore: localhost:8080');
  console.log('   - Auth: localhost:9099');
  console.log('   - Storage: localhost:9199');
  console.log('   - Functions: localhost:5001');
  console.log('   - UI: http://localhost:4000');
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('✅ Conectado aos Firebase Emulators');
  } catch (error) {
    // Emuladores já conectados ou erro
    if (error.code !== 'failed-precondition') {
      console.warn('⚠️  Aviso ao conectar emuladores:', error.message);
      console.warn('   Certifique-se de que os emuladores estão rodando:');
      console.warn('   npm run firebase:emulators:start');
    }
  }
} else {
  console.log('🌐 Conectando ao Firebase em produção...');
  console.log(`   - Project: ${firebaseConfig.projectId}`);
  console.log(`   - Auth Domain: ${firebaseConfig.authDomain}`);
}

// Função para validar conectividade
export async function validateConnection() {
  try {
    // Tentar ler um documento de teste
    const testRef = doc(db, '_test', 'connection');
    await getDoc(testRef);
    
    return { 
      connected: true, 
      mode: USE_EMULATORS ? 'emulators' : 'production',
      projectId: firebaseConfig.projectId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { 
      connected: false, 
      error: error.message,
      mode: USE_EMULATORS ? 'emulators' : 'production',
      projectId: firebaseConfig.projectId,
      timestamp: new Date().toISOString()
    };
  }
}

// Validar na inicialização (não bloqueia, apenas avisa)
if (USE_EMULATORS) {
  // Validar de forma assíncrona sem bloquear
  setTimeout(async () => {
    try {
      const result = await validateConnection();
      if (!result.connected) {
        console.warn('⚠️  Não foi possível conectar aos emuladores');
        console.warn('   Certifique-se de que os emuladores estão rodando:');
        console.warn('   npm run firebase:emulators:start');
      } else {
        console.log(`✅ Validação de conexão: Conectado (${result.mode})`);
      }
    } catch (err) {
      console.warn('⚠️  Erro ao validar conexão:', err.message);
    }
  }, 1000); // Aguardar 1 segundo para dar tempo dos emuladores iniciarem
}

// Exportar instâncias
export { app, db, auth, storage, functions, USE_EMULATORS };

// Helper para migrar dados do sistema de arquivos para Firestore
export async function migrateToFirestore() {
  console.log('📦 Iniciando migração para Firestore...');
  
  // Exemplo: migrar backlog
  // const backlogData = await loadBacklogFromFiles();
  // await setDoc(doc(collection(db, 'backlog'), 'current'), backlogData);
  
  console.log('✅ Migração concluída');
}

/**
 * Remove valores undefined de um objeto (Firestore não aceita undefined)
 * @deprecated Use sanitizeDocument() do firestore-sanitizer.js
 * Mantido para compatibilidade
 */
function removeUndefined(obj) {
  const sanitized = sanitizeDocument(obj);
  return sanitized;
}

// Helper para salvar resultado de agente
export async function saveAgentResult(agentName, result) {
  const resultRef = doc(collection(db, 'results'), `${agentName}-${Date.now()}`);
  
  // Remover valores undefined antes de salvar
  const cleanedResult = removeUndefined(result);
  
  await setDoc(resultRef, {
    ...cleanedResult,
    agent: agentName,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString()
  });
  
  console.log(`✅ Resultado do ${agentName} salvo no Firestore`);
  return resultRef.id;
}

// Helper para ler resultados
export async function getAgentResults(agentName) {
  const resultsRef = collection(db, 'results');
  const q = query(
    resultsRef,
    where('agent', '==', agentName),
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Helper para salvar backlog
export async function saveBacklog(backlogData, backlogId = 'current') {
  const backlogRef = doc(collection(db, 'backlog'), backlogId);
  
  // Remover valores undefined antes de salvar
  const cleanedData = removeUndefined(backlogData);
  
  await setDoc(backlogRef, {
    ...cleanedData,
    updatedAt: serverTimestamp(),
    lastModified: new Date().toISOString()
  }, { merge: true });
  
  console.log(`✅ Backlog salvo no Firestore: ${backlogId}`);
  return backlogRef.id;
}

// Helper para ler backlog
export async function getBacklog(backlogId = 'current') {
  const backlogRef = doc(collection(db, 'backlog'), backlogId);
  const docSnap = await getDoc(backlogRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// Helper para salvar decisão
export async function saveDecision(decisionData, decisionId) {
  const decisionRef = doc(collection(db, 'decisions'), decisionId || `decision-${Date.now()}`);
  
  // Remover valores undefined antes de salvar
  const cleanedData = removeUndefined(decisionData);
  
  await setDoc(decisionRef, {
    ...cleanedData,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString()
  });
  
  console.log(`✅ Decisão salva no Firestore: ${decisionRef.id}`);
  return decisionRef.id;
}

// Helper para salvar avaliação
export async function saveEvaluation(evaluationData, evaluationId) {
  const evaluationRef = doc(collection(db, 'evaluations'), evaluationId || `evaluation-${Date.now()}`);
  
  // Remover valores undefined antes de salvar
  const cleanedData = removeUndefined(evaluationData);
  
  await setDoc(evaluationRef, {
    ...cleanedData,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString()
  });
  
  console.log(`✅ Avaliação salva no Firestore: ${evaluationRef.id}`);
  return evaluationRef.id;
}

// Helper para salvar evento
export async function saveEvent(eventData, eventId) {
  // Validar contrato WorkflowFeedbackEvent se for workflow-feedback (FAIL-FAST)
  if (eventId === 'workflow-feedback') {
    try {
      const { validateWorkflowFeedbackEvent } = await import('../schemas/workflow-feedback-event.js');
      const validation = validateWorkflowFeedbackEvent(eventData);
      
      if (!validation.valid) {
        const errorMsg = `❌ CONTRATO VIOLADO (events/${eventId}):\n${validation.errors.join('\n')}`;
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

  const eventRef = doc(collection(db, 'events'), eventId || `event-${Date.now()}`);
  
  // Remover valores undefined antes de salvar (redundante, mas seguro)
  const cleanedData = removeUndefined(eventData);
  
  await setDoc(eventRef, {
    ...cleanedData,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString()
  });
  
  return eventRef.id;
}

// Helper para observar mudanças em tempo real (para dashboard)
export function subscribeToCollection(collectionName, callback, options = {}) {
  const collectionRef = collection(db, collectionName);
  let q = collectionRef;
  
  if (options.orderBy) {
    q = query(collectionRef, orderBy(options.orderBy.field, options.orderBy.direction || 'desc'));
  }
  
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Erro ao observar ${collectionName}:`, error);
  });
}

// Helper para observar documento específico
export function subscribeToDocument(collectionName, docId, callback) {
  const docRef = doc(collection(db, collectionName), docId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Erro ao observar documento ${docId}:`, error);
  });
}

