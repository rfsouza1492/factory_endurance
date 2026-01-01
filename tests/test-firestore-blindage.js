#!/usr/bin/env node
/**
 * Teste de Blindagem do Firestore
 * 
 * Cenários:
 * 1. Backlog válido → deve salvar sem erro
 * 2. Backlog inválido (undefined) → deve falhar com CONTRACT_ERROR
 * 3. Evento válido → deve salvar sem erro
 * 4. Evento inválido (undefined) → deve falhar com CONTRACT_ERROR
 */

import { validateAutoFixBacklog } from '../src/schemas/auto-fix-task.js';
import { validateWorkflowFeedbackEvent } from '../src/schemas/workflow-feedback-event.js';

console.log('🧪 Teste de Blindagem do Firestore\n');

// Teste 1: Backlog válido
console.log('Teste 1: Backlog válido');
const validBacklog = {
  backlogId: 'test-001',
  createdAt: new Date().toISOString(),
  tasks: [
    {
      id: 'task-001',
      title: 'Test Task',
      description: 'Test Description',
      targetType: 'file',
      targetPath: '/test/path',
      fixType: 'create',
      newContent: 'test content',
      priority: 'P1',
      riskLevel: 'low',
      requiresApproval: false,
      status: 'todo'
    }
  ]
};

const validation1 = validateAutoFixBacklog(validBacklog);
console.log(`  Resultado: ${validation1.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
if (!validation1.valid) {
  console.log('  Erros:', validation1.errors);
}
console.log('');

// Teste 2: Backlog inválido (com undefined)
console.log('Teste 2: Backlog inválido (com undefined)');
const invalidBacklog = {
  backlogId: 'test-002',
  createdAt: new Date().toISOString(),
  tasks: [
    {
      id: 'task-002',
      title: 'Test Task',
      description: 'Test Description',
      targetType: 'file',
      targetPath: '/test/path',
      fixType: 'patch',
      patch: undefined, // ❌ undefined
      priority: 'P1',
      riskLevel: 'low',
      requiresApproval: false,
      status: 'todo'
    }
  ]
};

const validation2 = validateAutoFixBacklog(invalidBacklog);
console.log(`  Resultado: ${validation2.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO (esperado)'}`);
if (!validation2.valid) {
  console.log(`  ✅ Erro detectado corretamente`);
  console.log(`  Erros encontrados: ${validation2.errors.length}`);
  console.log(`  Tarefas inválidas: ${validation2.invalidTasks.length}`);
}
console.log('');

// Teste 3: Evento válido
console.log('Teste 3: Evento válido');
const validEvent = {
  event: 'workflow-complete',
  workflowId: 'test-001',
  timestamp: new Date().toISOString(),
  decision: 'GO',
  scores: null,
  issues: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  recommendations: [],
  reportPath: null,
  updatedBacklog: null
};

const validation3 = validateWorkflowFeedbackEvent(validEvent);
console.log(`  Resultado: ${validation3.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
if (!validation3.valid) {
  console.log('  Erros:', validation3.errors);
}
console.log('');

// Teste 4: Evento inválido (com undefined)
console.log('Teste 4: Evento inválido (com undefined)');
const invalidEvent = {
  event: 'workflow-complete',
  workflowId: 'test-002',
  timestamp: new Date().toISOString(),
  decision: 'GO',
  scores: undefined, // ❌ undefined (deveria ser null)
  issues: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  recommendations: [],
  reportPath: undefined, // ❌ undefined (deveria ser null)
  updatedBacklog: null
};

const validation4 = validateWorkflowFeedbackEvent(invalidEvent);
console.log(`  Resultado: ${validation4.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO (esperado)'}`);
if (!validation4.valid) {
  console.log(`  ✅ Erro detectado corretamente`);
  console.log(`  Erros encontrados: ${validation4.errors.length}`);
}
console.log('');

// Resumo
console.log('📊 Resumo dos Testes:');
console.log(`  ✅ Backlog válido: ${validation1.valid ? 'PASSOU' : 'FALHOU'}`);
console.log(`  ✅ Backlog inválido detectado: ${!validation2.valid ? 'PASSOU' : 'FALHOU'}`);
console.log(`  ✅ Evento válido: ${validation3.valid ? 'PASSOU' : 'FALHOU'}`);
console.log(`  ✅ Evento inválido detectado: ${!validation4.valid ? 'PASSOU' : 'FALHOU'}`);

const allPassed = validation1.valid && !validation2.valid && validation3.valid && !validation4.valid;
console.log(`\n${allPassed ? '✅' : '❌'} Todos os testes: ${allPassed ? 'PASSARAM' : 'FALHARAM'}`);

