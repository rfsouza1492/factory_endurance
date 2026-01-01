#!/usr/bin/env node
/**
 * Teste do Firestore Sanitizer
 * Valida que a sanitização funciona corretamente
 */

import { sanitizeDocument, validateForFirestore, sanitizeAndValidate } from './firestore-sanitizer.js';

console.log('🧪 Testando Firestore Sanitizer...\n');

// Teste 1: Objeto com undefined
console.log('Teste 1: Objeto com undefined');
const obj1 = {
  name: 'Test',
  value: undefined,
  nested: {
    field1: 'ok',
    field2: undefined,
    field3: null
  },
  array: [1, undefined, 3, null]
};

const sanitized1 = sanitizeDocument(obj1);
console.log('Original:', JSON.stringify(obj1, null, 2));
console.log('Sanitizado:', JSON.stringify(sanitized1, null, 2));
const validation1 = validateForFirestore(sanitized1);
console.log('Válido:', validation1.valid);
if (!validation1.valid) {
  console.log('Erros:', validation1.errors);
}
console.log('');

// Teste 2: Backlog com campos undefined
console.log('Teste 2: Backlog com campos undefined');
const backlog = {
  backlogId: 'test-001',
  tasks: [
    { id: '1', title: 'Task 1', description: undefined, assignee: undefined },
    { id: '2', title: 'Task 2', priority: 'P1', status: undefined }
  ],
  summary: {
    totalTasks: 2,
    completedTasks: undefined,
    p0Tasks: 0
  },
  milestone: 'Test',
  deadline: null
};

const sanitized2 = sanitizeDocument(backlog);
const validation2 = validateForFirestore(sanitized2);
console.log('Backlog válido:', validation2.valid);
if (!validation2.valid) {
  console.log('Erros:', validation2.errors);
} else {
  console.log('✅ Backlog sanitizado com sucesso');
}
console.log('');

// Teste 3: Feedback com campos undefined
console.log('Teste 3: Feedback com campos undefined');
const feedback = {
  event: 'workflow-complete',
  workflowId: 'test-001',
  timestamp: new Date().toISOString(),
  decision: 'GO',
  scores: undefined,
  issues: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  recommendations: [],
  reportPath: undefined,
  updatedBacklog: null
};

const sanitized3 = sanitizeDocument(feedback);
const validation3 = validateForFirestore(sanitized3);
console.log('Feedback válido:', validation3.valid);
if (!validation3.valid) {
  console.log('Erros:', validation3.errors);
} else {
  console.log('✅ Feedback sanitizado com sucesso');
}
console.log('');

// Teste 4: sanitizeAndValidate
console.log('Teste 4: sanitizeAndValidate');
const result = sanitizeAndValidate({
  name: 'Test',
  value: undefined,
  nested: { field: undefined }
});

console.log('Resultado:', {
  valid: result.valid,
  errors: result.errors,
  sanitized: JSON.stringify(result.sanitized, null, 2)
});

console.log('\n✅ Todos os testes concluídos!');

