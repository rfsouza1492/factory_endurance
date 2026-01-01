#!/usr/bin/env node
/**
 * Teste de Integração: Approvals Helper
 * Testa persistência de aprovações no Firestore
 */

import { saveApprovalToFirestore, loadApprovalFromFirestore, listApprovalsFromFirestore, updateApprovalStatus } from '../../src/firebase/approvals-helper.js';
import { db } from '../../src/firebase/connection.js';

console.log('🧪 Teste de Integração: Approvals Helper\n');

let passedTests = 0;
let failedTests = 0;

async function runTest(name, testFunction) {
  try {
    console.log(`📋 Executando: ${name}`);
    await testFunction();
    console.log(`  ✅ ${name} passou\n`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ ${name} falhou: ${error.message}\n`);
    failedTests++;
  }
}

(async () => {
  // Firebase já inicializado via connection.js
  console.log('✅ Firebase inicializado\n');

  // Teste 1: Salvar aprovação
  await runTest('Teste 1: Salvar aprovação no Firestore', async () => {
    const approval = {
      id: 'test-approval-001',
      decision: 'GO',
      status: 'pending',
      timestamp: new Date().toISOString(),
      scores: {
        overall: 85,
        architecture: 90,
        codeQuality: 80
      },
      concerns: {
        critical: [],
        high: []
      }
    };

    const result = await saveApprovalToFirestore(approval, {
      approvalId: 'test-approval-001'
    });

    if (!result.success) {
      throw new Error(`Falha ao salvar: ${result.error}`);
    }

    if (!result.firestoreId) {
      throw new Error('firestoreId não retornado');
    }
  });

  // Teste 2: Carregar aprovação
  await runTest('Teste 2: Carregar aprovação do Firestore', async () => {
    const approval = await loadApprovalFromFirestore('test-approval-001');

    if (!approval) {
      throw new Error('Aprovação não encontrada');
    }

    if (approval.decision !== 'GO') {
      throw new Error(`Decision incorreto: ${approval.decision}`);
    }

    if (approval.scores.overall !== 85) {
      throw new Error(`Score incorreto: ${approval.scores.overall}`);
    }
  });

  // Teste 3: Listar aprovações
  await runTest('Teste 3: Listar aprovações do Firestore', async () => {
    const approvals = await listApprovalsFromFirestore({
      limitCount: 10
    });

    if (!Array.isArray(approvals)) {
      throw new Error('Resultado não é um array');
    }

    const testApproval = approvals.find(a => a.id === 'test-approval-001');
    if (!testApproval) {
      throw new Error('Aprovação de teste não encontrada na lista');
    }
  });

  // Teste 4: Atualizar status
  await runTest('Teste 4: Atualizar status de aprovação', async () => {
    const result = await updateApprovalStatus('test-approval-001', 'approved', {
      approvedBy: 'Test User',
      approvedAt: new Date().toISOString()
    });

    if (!result.success) {
      throw new Error(`Falha ao atualizar: ${result.error}`);
    }

    // Verificar se foi atualizado
    const approval = await loadApprovalFromFirestore('test-approval-001');
    if (approval.status !== 'approved') {
      throw new Error(`Status não atualizado: ${approval.status}`);
    }

    if (approval.approvedBy !== 'Test User') {
      throw new Error(`approvedBy não atualizado: ${approval.approvedBy}`);
    }
  });

  // Teste 5: Filtrar por status
  await runTest('Teste 5: Filtrar aprovações por status', async () => {
    const approved = await listApprovalsFromFirestore({
      status: 'approved',
      limitCount: 10
    });

    if (!Array.isArray(approved)) {
      throw new Error('Resultado não é um array');
    }

    const allApproved = approved.every(a => a.status === 'approved');
    if (!allApproved) {
      throw new Error('Filtro por status não funcionou');
    }
  });

  // Teste 6: Validação de dados inválidos
  await runTest('Teste 6: Validar dados inválidos', async () => {
    const invalidApproval = {
      id: 'test-invalid',
      decision: 'GO',
      // status: undefined (deve falhar)
      timestamp: undefined
    };

    const result = await saveApprovalToFirestore(invalidApproval, {
      approvalId: 'test-invalid'
    });

    // Deve falhar na validação
    if (result.success) {
      throw new Error('Validação não detectou dados inválidos');
    }

    if (!result.error || !result.error.includes('CONTRACT_ERROR')) {
      throw new Error('Erro de validação não retornado corretamente');
    }
  });

  console.log('='.repeat(50));
  console.log(`📊 Resumo: ${passedTests} passaram, ${failedTests} falharam`);
  console.log('='.repeat(50));

  if (failedTests === 0) {
    console.log('✅ Todos os testes passaram!');
    process.exit(0);
  } else {
    console.error('❌ Alguns testes falharam.');
    process.exit(1);
  }
})();

