/**
 * Data Sync Module - Híbrido (Arquivos + Firestore)
 * 
 * Este módulo implementa uma estratégia híbrida:
 * - Mantém arquivos locais para compatibilidade
 * - Sincroniza com Firestore para tempo real e histórico
 * - Permite migração gradual
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração
const SYNC_ENABLED = process.env.FIREBASE_SYNC_ENABLED !== 'false'; // Default: true
const SYNC_MODE = process.env.FIREBASE_SYNC_MODE || 'hybrid'; // 'hybrid' | 'firestore' | 'files'

/**
 * Salva dados híbrido (arquivo + Firestore)
 */
export async function saveHybrid(collectionName, documentId, data, filePath = null) {
  const results = {
    file: false,
    firestore: false,
    error: null
  };

  // 1. Salvar em arquivo (se modo híbrido ou files)
  if (SYNC_MODE === 'hybrid' || SYNC_MODE === 'files') {
    try {
      if (filePath) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        results.file = true;
      }
    } catch (error) {
      results.error = `Erro ao salvar arquivo: ${error.message}`;
      console.error('❌ Erro ao salvar arquivo:', error);
    }
  }

  // 2. Salvar no Firestore (se modo híbrido ou firestore)
  if (SYNC_ENABLED && (SYNC_MODE === 'hybrid' || SYNC_MODE === 'firestore')) {
    try {
      const docRef = doc(collection(db, collectionName), documentId);
      await setDoc(docRef, {
        ...data,
        _syncedAt: serverTimestamp(),
        _syncedFrom: 'maestro-workflow',
        _filePath: filePath || null
      }, { merge: true });
      results.firestore = true;
    } catch (error) {
      results.error = results.error 
        ? `${results.error}; Erro Firestore: ${error.message}`
        : `Erro Firestore: ${error.message}`;
      console.error('❌ Erro ao salvar no Firestore:', error);
    }
  }

  return results;
}

/**
 * Carrega dados (tenta Firestore primeiro, depois arquivo)
 */
export async function loadHybrid(collectionName, documentId, filePath = null) {
  // 1. Tentar Firestore primeiro (se habilitado)
  if (SYNC_ENABLED && (SYNC_MODE === 'hybrid' || SYNC_MODE === 'firestore')) {
    try {
      const docRef = doc(collection(db, collectionName), documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Remover campos internos
        delete data._syncedAt;
        delete data._syncedFrom;
        delete data._filePath;
        return { source: 'firestore', data };
      }
    } catch (error) {
      console.warn('⚠️  Erro ao carregar do Firestore, tentando arquivo:', error.message);
    }
  }

  // 2. Fallback para arquivo
  if (filePath && fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return { source: 'file', data };
    } catch (error) {
      console.error('❌ Erro ao carregar arquivo:', error);
      return { source: 'error', data: null, error: error.message };
    }
  }

  return { source: 'not-found', data: null };
}

/**
 * Salva resultado de agente (híbrido)
 */
export async function saveAgentResult(agentName, result, filePath = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const documentId = `${agentName}-${timestamp}`;
  
  // Se não fornecido, gerar caminho padrão
  if (!filePath) {
    const resultsDir = path.join(__dirname, '..', 'shared', 'results', agentName);
    filePath = path.join(resultsDir, `${timestamp}-result.json`);
  }

  return await saveHybrid('agent-results', documentId, {
    agent: agentName,
    ...result,
    timestamp: new Date().toISOString()
  }, filePath);
}

/**
 * Salva backlog (híbrido)
 */
export async function saveBacklog(backlog, filename = null) {
  const backlogId = backlog.backlogId || `backlog-${Date.now()}`;
  const documentId = `backlog-${backlogId}`;
  
  // Caminho do arquivo
  const backlogDir = path.join(__dirname, '..', 'shared', 'backlog');
  const filePath = filename 
    ? path.join(backlogDir, filename)
    : path.join(backlogDir, `${backlogId}.json`);

  // Salvar current-backlog.json também
  const currentPath = path.join(backlogDir, 'current-backlog.json');
  
  const results = await saveHybrid('backlog', documentId, backlog, filePath);
  
  // Salvar current-backlog.json separadamente
  if (SYNC_MODE === 'hybrid' || SYNC_MODE === 'files') {
    try {
      fs.writeFileSync(currentPath, JSON.stringify(backlog, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Erro ao salvar current-backlog.json:', error);
    }
  }

  // Salvar current no Firestore também
  if (SYNC_ENABLED && (SYNC_MODE === 'hybrid' || SYNC_MODE === 'firestore')) {
    try {
      const currentRef = doc(collection(db, 'backlog'), 'current');
      await setDoc(currentRef, {
        ...backlog,
        _syncedAt: serverTimestamp(),
        _isCurrent: true
      }, { merge: true });
    } catch (error) {
      console.error('❌ Erro ao salvar current no Firestore:', error);
    }
  }

  return { ...results, filePath, currentPath };
}

/**
 * Carrega backlog (híbrido)
 */
export async function loadBacklog(backlogId = 'current') {
  const documentId = backlogId === 'current' ? 'backlog-current' : `backlog-${backlogId}`;
  
  // Tentar carregar do Firestore primeiro
  const result = await loadHybrid('backlog', documentId);
  
  if (result.source === 'firestore' || result.source === 'file') {
    return result.data;
  }

  // Fallback: tentar arquivo current-backlog.json
  const backlogDir = path.join(__dirname, '..', 'shared', 'backlog');
  const currentPath = path.join(backlogDir, 'current-backlog.json');
  
  if (fs.existsSync(currentPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(currentPath, 'utf-8'));
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar current-backlog.json:', error);
    }
  }

  return null;
}

/**
 * Salva progresso do workflow (híbrido)
 */
export async function saveWorkflowProgress(progress) {
  const documentId = 'workflow-progress';
  const filePath = path.join(__dirname, '..', 'shared', 'workflow-progress.json');
  
  return await saveHybrid('workflow-progress', documentId, progress, filePath);
}

/**
 * Carrega progresso do workflow (híbrido)
 */
export async function loadWorkflowProgress() {
  const filePath = path.join(__dirname, '..', 'shared', 'workflow-progress.json');
  const result = await loadHybrid('workflow-progress', 'workflow-progress', filePath);
  
  return result.data || {};
}

/**
 * Salva decisão Go/No-go (híbrido)
 */
export async function saveDecision(decision, filename = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const documentId = `decision-${timestamp}`;
  
  const decisionsDir = path.join(__dirname, '..', 'shared', 'decisions');
  const filePath = filename 
    ? path.join(decisionsDir, filename)
    : path.join(decisionsDir, `go-no-go-report.md`);

  // Salvar como JSON também
  const jsonPath = path.join(decisionsDir, `decision-${timestamp}.json`);
  
  const results = await saveHybrid('decisions', documentId, {
    ...decision,
    timestamp: new Date().toISOString()
  }, jsonPath);

  // Salvar markdown separadamente (apenas arquivo)
  if (SYNC_MODE === 'hybrid' || SYNC_MODE === 'files') {
    try {
      if (decision.markdown) {
        fs.writeFileSync(filePath, decision.markdown, 'utf-8');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar markdown:', error);
    }
  }

  return results;
}

/**
 * Lista resultados de agente do Firestore
 */
export async function listAgentResults(agentName = null, limitCount = 10) {
  if (!SYNC_ENABLED || SYNC_MODE === 'files') {
    return [];
  }

  try {
    const resultsRef = collection(db, 'agent-results');
    let q = query(resultsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    if (agentName) {
      q = query(resultsRef, where('agent', '==', agentName), orderBy('timestamp', 'desc'), limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Erro ao listar resultados:', error);
    return [];
  }
}

/**
 * Observa mudanças em tempo real (Firestore)
 */
export function watchCollection(collectionName, callback, filters = {}) {
  if (!SYNC_ENABLED || SYNC_MODE === 'files') {
    console.warn('⚠️  Watch desabilitado (Firestore não habilitado)');
    return () => {};
  }

  try {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef);

    // Aplicar filtros
    if (filters.where) {
      filters.where.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });
    }

    if (filters.orderBy) {
      q = query(q, orderBy(filters.orderBy.field, filters.orderBy.direction || 'desc'));
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('❌ Erro ao observar coleção:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao configurar watch:', error);
    return () => {};
  }
}

/**
 * Migra dados existentes do sistema de arquivos para Firestore
 */
export async function migrateFilesToFirestore() {
  if (!SYNC_ENABLED) {
    console.log('⚠️  Sincronização desabilitada. Pule a migração.');
    return;
  }

  console.log('📦 Iniciando migração de arquivos para Firestore...');

  const sharedDir = path.join(__dirname, '..', 'shared');
  const results = {
    backlog: 0,
    agentResults: 0,
    decisions: 0,
    progress: 0,
    errors: []
  };

  try {
    // Migrar backlog
    const backlogDir = path.join(sharedDir, 'backlog');
    if (fs.existsSync(backlogDir)) {
      const backlogFiles = fs.readdirSync(backlogDir).filter(f => f.endsWith('.json'));
      for (const file of backlogFiles) {
        try {
          const filePath = path.join(backlogDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const documentId = file === 'current-backlog.json' ? 'backlog-current' : `backlog-${data.backlogId || file}`;
          
          await saveHybrid('backlog', documentId, data, filePath);
          results.backlog++;
        } catch (error) {
          results.errors.push(`Backlog ${file}: ${error.message}`);
        }
      }
    }

    // Migrar progresso
    const progressPath = path.join(sharedDir, 'workflow-progress.json');
    if (fs.existsSync(progressPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
        await saveWorkflowProgress(data);
        results.progress++;
      } catch (error) {
        results.errors.push(`Progress: ${error.message}`);
      }
    }

    console.log('✅ Migração concluída:', results);
    return results;
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    results.errors.push(`Geral: ${error.message}`);
    return results;
  }
}

export { SYNC_ENABLED, SYNC_MODE };

