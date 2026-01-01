#!/usr/bin/env node
/**
 * Teste de Integração: Salvamento no Firestore
 * Valida que validação é executada antes de salvar
 */

import { validateAutoFixBacklog } from '../../src/schemas/auto-fix-task.js';
import { validateWorkflowFeedbackEvent } from '../../src/schemas/workflow-feedback-event.js';

console.log('🧪 Teste de Integração: Salvamento no Firestore\n');

// Teste 1: Backlog válido pode ser salvo
console.log('Teste 1: Backlog válido pode ser salvo');
const validBacklog = {
  backlogId: 'test-001',
  createdAt: new Date().toISOString(),
  tasks: [
    {
      id: 'task-001',
      title: 'Test',
      description: 'Test',
      targetType: 'file',
      targetPath: '/test',
      fixType: 'create',
      newContent: 'test',
      priority: 'P1',
      riskLevel: 'low',
      requiresApproval: false,
      status: 'todo'
    }
  ]
};

const validation1 = validateAutoFixBacklog(validBacklog);
console.log(`  Validação: ${validation1.valid ? '✅' : '❌'}`);
console.log(`  Pode ser salvo: ${validation1.valid ? '✅' : '❌'}`);
console.log('');

// Teste 2: Backlog inválido não pode ser salvo
console.log('Teste 2: Backlog inválido não pode ser salvo');
const invalidBacklog = {
  backlogId: 'test-002',
  createdAt: new Date().toISOString(),
  tasks: [
    {
      id: 'task-002',
      title: 'Test',
      description: 'Test',
      targetType: 'file',
      targetPath: '/test',
      fixType: 'patch',
      patch: undefined, // ❌ undefined
      priority: 'P1',
      riskLevel: 'low',
      requiresApproval: false
    }
  ]
};

const validation2 = validateAutoFixBacklog(invalidBacklog);
console.log(`  Validação: ${!validation2.valid ? '✅' : '❌'} (deve falhar)`);
console.log(`  Pode ser salvo: ${!validation2.valid ? '❌' : '✅'} (não deve)`);
console.log(`  Erros: ${validation2.errors.length}`);
console.log('');

// Teste 3: Evento válido pode ser salvo
console.log('Teste 3: Evento válido pode ser salvo');
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
console.log(`  Validação: ${validation3.valid ? '✅' : '❌'}`);
console.log(`  Pode ser salvo: ${validation3.valid ? '✅' : '❌'}`);
console.log('');

// Teste 4: Evento inválido não pode ser salvo
console.log('Teste 4: Evento inválido não pode ser salvo');
const invalidEvent = {
  event: 'workflow-complete',
  workflowId: 'test-002',
  timestamp: new Date().toISOString(),
  decision: 'GO',
  scores: undefined, // ❌ undefined
  issues: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  recommendations: [],
  reportPath: undefined, // ❌ undefined
  updatedBacklog: null
};

const validation4 = validateWorkflowFeedbackEvent(invalidEvent);
console.log(`  Validação: ${!validation4.valid ? '✅' : '❌'} (deve falhar)`);
console.log(`  Pode ser salvo: ${!validation4.valid ? '❌' : '✅'} (não deve)`);
console.log(`  Erros: ${validation4.errors.length}`);
console.log('');

console.log('✅ Testes de integração concluídos!');

