#!/usr/bin/env node
/**
 * Teste E2E: Workflow com Firestore Indisponível
 * Valida que erros de infra são classificados corretamente
 */

import { classifyError, ERROR_TYPES } from '../../src/utils/error-classifier.js';

console.log('🧪 Teste E2E: Workflow com Firestore Indisponível\n');

// Simular Firestore indisponível
console.log('Cenário: Firestore emulator desligado ou credencial inválida\n');

// Teste 1: Simular erro de Firestore indisponível
console.log('Teste 1: Classificar erro de Firestore indisponível');
const firestoreErrors = [
  new Error('FirebaseError: PERMISSION_DENIED: Cloud Firestore API has not been used'),
  new Error('FirebaseError: UNAVAILABLE: Service temporarily unavailable'),
  new Error('network-request-failed'),
  new Error('FirebaseError: Code: 7 Message: 7 PERMISSION_DENIED')
];

let allClassifiedCorrectly = true;
firestoreErrors.forEach((error, index) => {
  const classified = classifyError(error, 'Firestore', 'test-firestore-down');
  const isInfraError = classified.includes(ERROR_TYPES.INFRA);
  
  if (!isInfraError) {
    allClassifiedCorrectly = false;
  }
  
  console.log(`  Erro ${index + 1}: ${isInfraError ? '✅' : '❌'} (${isInfraError ? 'INFRA_ERROR' : 'OUTRO'})`);
  console.log(`    Mensagem: ${error.message.substring(0, 80)}...`);
});

console.log(`  Resultado geral: ${allClassifiedCorrectly ? '✅' : '❌'} (todos classificados como INFRA_ERROR)`);
console.log('');

// Teste 2: Validar classificação de erro
console.log('Teste 2: Classificação de erro');
const infraErrors = [
  new Error('FirebaseError: PERMISSION_DENIED'),
  new Error('FirebaseError: UNAVAILABLE'),
  new Error('network-request-failed')
];

infraErrors.forEach((error, index) => {
  const classified = classifyError(error, 'Firestore', null);
  const isInfra = classified.includes(ERROR_TYPES.INFRA);
  console.log(`  Erro ${index + 1}: ${isInfra ? '✅' : '❌'} (${isInfra ? 'INFRA_ERROR' : 'OUTRO'})`);
});
console.log('');

// Teste 3: Workflow não confunde INFRA_ERROR com CONTRACT_ERROR
console.log('Teste 3: Não confundir INFRA_ERROR com CONTRACT_ERROR');
const contractError = new Error('CONTRATO VIOLADO: Campo obrigatório');
const infraError = new Error('FirebaseError: PERMISSION_DENIED');

const contractClassified = classifyError(contractError, 'Test', null);
const infraClassified = classifyError(infraError, 'Test', null);

const contractIsContract = contractClassified.includes(ERROR_TYPES.CONTRACT);
const infraIsInfra = infraClassified.includes(ERROR_TYPES.INFRA);
const notConfused = contractIsContract && infraIsInfra && 
                    !contractClassified.includes(ERROR_TYPES.INFRA) &&
                    !infraClassified.includes(ERROR_TYPES.CONTRACT);

console.log(`  Resultado: ${notConfused ? '✅' : '❌'} (erros não são confundidos)`);
console.log(`  CONTRACT_ERROR classificado como: ${contractIsContract ? 'CONTRACT' : 'OUTRO'}`);
console.log(`  INFRA_ERROR classificado como: ${infraIsInfra ? 'INFRA' : 'OUTRO'}`);
console.log('');

console.log('✅ Teste E2E concluído!');
console.log('\n📝 Nota: Para teste completo, desligue Firebase emulators e execute workflow real');

