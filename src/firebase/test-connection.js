#!/usr/bin/env node

/**
 * Script de Teste de Conexão Firebase
 * Verifica se a conexão com Firebase/Firestore está funcionando
 */

import { app, db, auth, USE_EMULATORS } from './connection.js';
import { collection, doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  log('\n🔍 Testando Conexão Firebase/Firestore...\n', 'cyan');
  
  const results = {
    app: false,
    firestore: false,
    auth: false,
    write: false,
    read: false,
    cleanup: false
  };

  try {
    // Test 1: App Initialization
    log('1️⃣  Testando inicialização do app...', 'blue');
    if (app) {
      log('   ✅ App inicializado', 'green');
      results.app = true;
    } else {
      log('   ❌ App não inicializado', 'red');
      return results;
    }

    // Test 2: Firestore Connection
    log('\n2️⃣  Testando conexão Firestore...', 'blue');
    try {
      const testRef = doc(collection(db, '_test'), 'connection');
      await setDoc(testRef, {
        test: true,
        timestamp: serverTimestamp(),
        environment: USE_EMULATORS ? 'emulator' : 'production'
      });
      log('   ✅ Firestore conectado (escrita OK)', 'green');
      results.firestore = true;
      results.write = true;

      // Test 3: Read from Firestore
      log('\n3️⃣  Testando leitura do Firestore...', 'blue');
      const docSnap = await getDoc(testRef);
      if (docSnap.exists()) {
        log('   ✅ Firestore leitura OK', 'green');
        results.read = true;
        log(`   📄 Dados: ${JSON.stringify(docSnap.data(), null, 2)}`, 'cyan');
      } else {
        log('   ❌ Documento não encontrado', 'red');
      }

      // Cleanup
      log('\n4️⃣  Limpando dados de teste...', 'blue');
      await deleteDoc(testRef);
      log('   ✅ Dados de teste removidos', 'green');
      results.cleanup = true;

    } catch (error) {
      log(`   ❌ Erro no Firestore: ${error.message}`, 'red');
      if (USE_EMULATORS) {
        log('   💡 Dica: Certifique-se de que os emuladores estão rodando:', 'yellow');
        log('      firebase emulators:start', 'yellow');
      }
    }

    // Test 4: Auth Connection
    log('\n5️⃣  Testando conexão Auth...', 'blue');
    try {
      await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) {
            log('   ✅ Auth conectado', 'green');
            log(`   👤 Usuário: ${user.uid}`, 'cyan');
            results.auth = true;
            resolve();
          } else {
            // Try anonymous sign in
            signInAnonymously(auth)
              .then(() => {
                log('   ✅ Auth conectado (anônimo)', 'green');
                results.auth = true;
                resolve();
              })
              .catch(reject);
          }
        });
      });
    } catch (error) {
      log(`   ❌ Erro no Auth: ${error.message}`, 'red');
      if (USE_EMULATORS) {
        log('   💡 Dica: Certifique-se de que os emuladores estão rodando', 'yellow');
      }
    }

    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Resumo dos Testes:', 'cyan');
    log('='.repeat(50), 'cyan');
    
    const allTests = Object.entries(results);
    allTests.forEach(([test, passed]) => {
      const icon = passed ? '✅' : '❌';
      const color = passed ? 'green' : 'red';
      log(`   ${icon} ${test}: ${passed ? 'PASSOU' : 'FALHOU'}`, color);
    });

    const allPassed = Object.values(results).every(v => v);
    
    if (allPassed) {
      log('\n🎉 Todos os testes passaram! Firebase está funcionando corretamente.', 'green');
    } else {
      log('\n⚠️  Alguns testes falharam. Verifique a configuração.', 'yellow');
    }

    log(`\n🌐 Ambiente: ${USE_EMULATORS ? 'Emuladores (Desenvolvimento)' : 'Produção'}`, 'cyan');
    
    return results;

  } catch (error) {
    log(`\n❌ Erro geral: ${error.message}`, 'red');
    log(`   Stack: ${error.stack}`, 'red');
    return results;
  }
}

// Executar teste
testConnection()
  .then((results) => {
    const allPassed = Object.values(results).every(v => v);
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    log(`\n💥 Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
