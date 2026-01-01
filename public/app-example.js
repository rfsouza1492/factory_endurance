// Exemplo de app conectado aos Firebase Emulators
// Use este código como base para conectar seu app aos emuladores

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Importar configuração
import { firebaseConfig, USE_EMULATORS } from './firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Conectar aos emuladores apenas em desenvolvimento
if (USE_EMULATORS) {
  console.log('🔧 Conectando aos Firebase Emulators...');
  
  // Firestore
  const db = getFirestore(app);
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('✅ Firestore conectado: localhost:8080');
  
  // Authentication
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  console.log('✅ Auth conectado: localhost:9099');
  
  // Storage
  const storage = getStorage(app);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('✅ Storage conectado: localhost:9199');
  
  // Functions
  const functions = getFunctions(app);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('✅ Functions conectado: localhost:5001');
  
  console.log('🎉 Todos os emuladores conectados!');
} else {
  console.log('🌐 Conectando ao Firebase em produção...');
}

// Exportar instâncias
export { app, db, auth, storage, functions };

// Exemplo de uso
export async function testFirestore() {
  const { collection, addDoc, getDocs } = await import('firebase/firestore');
  
  try {
    // Criar documento de teste
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello from Emulator!',
      timestamp: new Date()
    });
    console.log('✅ Documento criado:', docRef.id);
    
    // Ler documentos
    const querySnapshot = await getDocs(collection(db, 'test'));
    querySnapshot.forEach((doc) => {
      console.log('📄 Documento:', doc.id, doc.data());
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

