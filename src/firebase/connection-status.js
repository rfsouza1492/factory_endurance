/**
 * Connection Status Module
 * Fornece informações detalhadas sobre o status da conexão Firebase
 */

import { db, auth, storage, functions, USE_EMULATORS, validateConnection } from './connection.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Obtém status detalhado de todos os serviços Firebase
 */
export async function getDetailedStatus() {
  const status = {
    connected: false,
    mode: USE_EMULATORS ? 'emulators' : 'production',
    timestamp: new Date().toISOString(),
    services: {
      firestore: { available: false, error: null },
      auth: { available: false, error: null },
      storage: { available: false, error: null },
      functions: { available: false, error: null }
    },
    collections: {},
    validation: null
  };

  // Validar conexão geral
  try {
    status.validation = await validateConnection();
    status.connected = status.validation.connected;
  } catch (error) {
    status.validation = {
      connected: false,
      error: error.message
    };
  }

  // Testar Firestore
  try {
    const testRef = doc(collection(db, '_test'), 'status-check');
    await getDoc(testRef);
    status.services.firestore.available = true;
    
    // Contar documentos em coleções principais
    const collections = ['backlog', 'results', 'evaluations', 'decisions', 'events'];
    for (const colName of collections) {
      try {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        status.collections[colName] = snapshot.size;
      } catch (error) {
        status.collections[colName] = 0;
      }
    }
  } catch (error) {
    status.services.firestore.available = false;
    status.services.firestore.error = error.message;
  }

  // Testar Auth
  try {
    // Auth está disponível se não houver erro ao acessar
    status.services.auth.available = auth !== null;
  } catch (error) {
    status.services.auth.available = false;
    status.services.auth.error = error.message;
  }

  // Testar Storage
  try {
    status.services.storage.available = storage !== null;
  } catch (error) {
    status.services.storage.available = false;
    status.services.storage.error = error.message;
  }

  // Testar Functions
  try {
    status.services.functions.available = functions !== null;
  } catch (error) {
    status.services.functions.available = false;
    status.services.functions.error = error.message;
  }

  return status;
}

/**
 * Health check simples - retorna true se tudo estiver OK
 */
export async function healthCheck() {
  try {
    const status = await getDetailedStatus();
    return status.connected && 
           status.services.firestore.available &&
           status.services.auth.available;
  } catch (error) {
    return false;
  }
}

