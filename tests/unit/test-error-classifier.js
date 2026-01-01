#!/usr/bin/env node
/**
 * Teste Unitário: Error Classifier
 * Valida classificação de erros e estrutura de logs
 */

import { classifyError, formatErrorForLog, logClassifiedError, ERROR_TYPES } from '../../src/utils/error-classifier.js';

console.log('🧪 Teste Unitário: Error Classifier\n');

// Teste 1: CONTRACT_ERROR
console.log('Teste 1: CONTRACT_ERROR');
const contractError = new Error('CONTRATO VIOLADO: Campo obrigatório: targetPath');
const classified1 = classifyError(contractError, 'AutoFixTask', 'task-001');
console.log(`  Resultado: ${classified1.includes('CONTRACT_ERROR') ? '✅' : '❌'}`);
console.log(`  Mensagem: ${classified1}`);
console.log('');

// Teste 2: INFRA_ERROR
console.log('Teste 2: INFRA_ERROR');
const infraError = new Error('FirebaseError: PERMISSION_DENIED');
infraError.code = 'firestore/permission-denied';
const classified2 = classifyError(infraError, 'Firestore', null);
console.log(`  Resultado: ${classified2.includes('INFRA_ERROR') ? '✅' : '❌'}`);
console.log(`  Mensagem: ${classified2}`);
console.log('');

// Teste 3: RUNTIME_ERROR
console.log('Teste 3: RUNTIME_ERROR');
const runtimeError = new Error('Arquivo não encontrado: /path/to/file');
const classified3 = classifyError(runtimeError, 'ImplementationAgent', 'task-002');
console.log(`  Resultado: ${classified3.includes('RUNTIME_ERROR') ? '✅' : '❌'}`);
console.log(`  Mensagem: ${classified3}`);
console.log('');

// Teste 4: formatErrorForLog
console.log('Teste 4: formatErrorForLog');
const formatted = formatErrorForLog(contractError, 'AutoFixTask', 'task-001');
console.log(`  Tipo: ${formatted.type === ERROR_TYPES.CONTRACT ? '✅' : '❌'}`);
console.log(`  Context: ${formatted.context === 'AutoFixTask' ? '✅' : '❌'}`);
console.log(`  EntityType: ${formatted.entityType === 'task-001' ? '✅' : '❌'}`);
console.log(`  Timestamp: ${formatted.timestamp ? '✅' : '❌'}`);
console.log('');

// Teste 5: Estrutura completa
console.log('Teste 5: Estrutura completa do log');
const complete = formatErrorForLog(runtimeError, 'ImplementationAgent', 'task-003');
const hasAllFields = complete.type && complete.message && complete.originalError && 
                     complete.context && complete.timestamp;
console.log(`  Resultado: ${hasAllFields ? '✅' : '❌'}`);
console.log(`  Campos: type, message, originalError, context, timestamp`);
console.log('');

// Teste 6: Diferentes tipos de erro
console.log('Teste 6: Diferentes tipos de erro');
const errors = [
  { error: new Error('CONTRATO VIOLADO'), expected: ERROR_TYPES.CONTRACT },
  { error: new Error('FirebaseError: UNAVAILABLE'), expected: ERROR_TYPES.INFRA },
  { error: new Error('Arquivo não encontrado'), expected: ERROR_TYPES.RUNTIME }
];

let allCorrect = true;
errors.forEach(({ error, expected }, index) => {
  const classified = classifyError(error, 'Test', null);
  const isCorrect = classified.includes(expected);
  if (!isCorrect) allCorrect = false;
  console.log(`  Erro ${index + 1}: ${isCorrect ? '✅' : '❌'} (esperado: ${expected})`);
});
console.log(`  Resultado geral: ${allCorrect ? '✅' : '❌'}`);
console.log('');

console.log('✅ Testes concluídos!');

