#!/usr/bin/env node
// Teste completo de integração Firebase - Maestro Workflow
// Testa conexão, migração, sincronização híbrida e real-time updates

import { db, auth, storage, functions, USE_EMULATORS } from './connection.js';
import {
  migrateFilesToFirestore,
  saveWorkflowProgress,
  getWorkflowProgress,
  saveAgentResult,
  getAgentResults,
  watchWorkflowProgress,
  watchAgentResults
} from './migration.js';
import { collection, doc, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

console.log('🧪 Teste Completo de Integração Firebase - Maestro Workflow\n');
console.log(`📌 Ambiente: ${USE_EMULATORS ? '🔧 Emuladores' : '🌐 Produção'}\n`);

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  return async () => {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Teste: ${name}`);
      console.log('='.repeat(60));
      await fn();
      testsPassed++;
      console.log(`✅ ${name} - PASSOU`);
    } catch (error) {
      testsFailed++;
      console.error(`❌ ${name} - FALHOU`);
      console.error(`   Erro: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.split('\n')[1]}`);
      }
    }
  };
}

// Teste 1: Conexão básica
const testConnection = test('Conexão Básica', async () => {
  // Testar Firestore
  const testRef = doc(collection(db, 'test'));
  await setDoc(testRef, {
    message: 'Teste de conexão',
    timestamp: new Date().toISOString()
  });
  console.log('   ✅ Firestore conectado');

  // Testar Auth
  const userCredential = await signInAnonymously(auth);
  console.log(`   ✅ Auth conectado (User ID: ${userCredential.user.uid})`);

  // Testar Storage
  const { ref, uploadString } = await import('firebase/storage');
  const storageRef = ref(storage, 'test/connection.txt');
  await uploadString(storageRef, 'Teste de conexão Storage');
  console.log('   ✅ Storage conectado');
});

// Teste 2: Migração de dados
const testMigration = test('Migração de Dados', async () => {
  const results = await migrateFilesToFirestore();
  
  console.log('\n   📊 Resultados da migração:');
  console.log(`      Progress: ${results.progress ? '✅' : '❌'}`);
  console.log(`      Results: ${results.results ? '✅' : '❌'}`);
  console.log(`      Backlog: ${results.backlog ? '✅' : '❌'}`);
  console.log(`      Decisions: ${results.decisions ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log(`\n   ⚠️  Erros: ${results.errors.length}`);
    results.errors.forEach(err => console.log(`      - ${err}`));
  }
});

// Teste 3: Sincronização híbrida (arquivo + Firestore)
const testHybridSync = test('Sincronização Híbrida', async () => {
  const testProgress = {
    workflowStatus: 'running',
    currentPhase: 1,
    phases: {
      execution: {
        name: 'Execução dos Agentes',
        status: 'running',
        progress: 50
      }
    },
    timestamp: new Date().toISOString()
  };

  // Salvar
  await saveWorkflowProgress(testProgress);
  console.log('   ✅ Progresso salvo (arquivo + Firestore)');

  // Ler
  const retrieved = await getWorkflowProgress();
  if (!retrieved) {
    throw new Error('Não foi possível recuperar o progresso');
  }
  console.log('   ✅ Progresso recuperado');
  console.log(`      Status: ${retrieved.workflowStatus}`);
  console.log(`      Fase: ${retrieved.currentPhase}`);
});

// Teste 4: Salvar e recuperar resultados de agentes
const testAgentResults = test('Resultados de Agentes', async () => {
  const testResult = {
    agent: 'test-agent',
    score: 85,
    status: 'completed',
    summary: 'Teste de resultado de agente'
  };

  const testContent = `# Resultado do Test Agent

Score: 85
Status: completed
Timestamp: ${new Date().toISOString()}
`;

  // Salvar
  const resultId = await saveAgentResult('test-agent', testResult, testContent);
  console.log(`   ✅ Resultado salvo (ID: ${resultId})`);

  // Recuperar
  const results = await getAgentResults('test-agent', 1);
  if (results.length === 0) {
    throw new Error('Nenhum resultado encontrado');
  }
  console.log(`   ✅ Resultado recuperado`);
  console.log(`      Agente: ${results[0].agent}`);
  console.log(`      Score: ${results[0].score}`);
});

// Teste 5: Real-time updates (watch)
const testRealtimeUpdates = test('Atualizações em Tempo Real', async () => {
  return new Promise((resolve, reject) => {
    let updateReceived = false;

    // Observar progresso
    const unsubscribe = watchWorkflowProgress((progress) => {
      if (!updateReceived) {
        updateReceived = true;
        console.log('   ✅ Atualização em tempo real recebida');
        console.log(`      Status: ${progress.workflowStatus}`);
        unsubscribe();
        resolve();
      }
    });

    // Atualizar progresso para triggerar o watch
    setTimeout(async () => {
      await saveWorkflowProgress({
        workflowStatus: 'testing',
        currentPhase: 0,
        timestamp: new Date().toISOString()
      });
    }, 500);

    // Timeout de segurança
    setTimeout(() => {
      if (!updateReceived) {
        unsubscribe();
        reject(new Error('Timeout aguardando atualização em tempo real'));
      }
    }, 5000);
  });
});

// Teste 6: Performance e escalabilidade
const testPerformance = test('Performance', async () => {
  const startTime = Date.now();
  const batchSize = 10;

  // Criar múltiplos documentos
  const promises = [];
  for (let i = 0; i < batchSize; i++) {
    promises.push(
      setDoc(doc(collection(db, 'performance-test')), {
        index: i,
        timestamp: new Date().toISOString(),
        data: `Test data ${i}`
      })
    );
  }

  await Promise.all(promises);
  const duration = Date.now() - startTime;

  console.log(`   ✅ ${batchSize} documentos criados em ${duration}ms`);
  console.log(`      Média: ${(duration / batchSize).toFixed(2)}ms por documento`);

  if (duration > 5000) {
    throw new Error(`Performance abaixo do esperado: ${duration}ms`);
  }
});

// Executar todos os testes
async function runAllTests() {
  const tests = [
    testConnection,
    testMigration,
    testHybridSync,
    testAgentResults,
    testRealtimeUpdates,
    testPerformance
  ];

  for (const testFn of tests) {
    await testFn();
    // Pequeno delay entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  console.log(`✅ Testes passados: ${testsPassed}`);
  console.log(`❌ Testes falhados: ${testsFailed}`);
  console.log(`📈 Taxa de sucesso: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (testsFailed === 0) {
    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ Integração Firebase está funcionando corretamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam.');
    console.log('💡 Verifique:');
    console.log('   1. Emuladores estão rodando? (npm run firebase:dev)');
    console.log('   2. Variáveis de ambiente estão configuradas?');
    console.log('   3. Permissões do Firestore estão corretas?');
  }

  process.exit(testsFailed === 0 ? 0 : 1);
}

// Executar
runAllTests().catch(error => {
  console.error('\n❌ Erro fatal nos testes:', error);
  process.exit(1);
});

