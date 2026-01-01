#!/usr/bin/env node
/**
 * Teste Unitário: Firestore Validator
 * Valida detecção de undefined (aninhado, arrays, etc.)
 */

import { findUndefinedFields, validateForFirestore } from '../../src/schemas/firestore-validator.js';

console.log('🧪 Teste Unitário: Firestore Validator\n');

// Teste 1: Objeto com undefined top-level
console.log('Teste 1: Objeto com undefined top-level');
const obj1 = { a: 1, b: undefined, c: 3 };
const paths1 = findUndefinedFields(obj1);
console.log(`  Resultado: ${paths1.length === 1 && paths1[0] === 'b' ? '✅' : '❌'}`);
console.log(`  Paths encontrados: ${paths1.join(', ')}`);
console.log('');

// Teste 2: Objeto com undefined aninhado
console.log('Teste 2: Objeto com undefined aninhado');
const obj2 = { a: 1, nested: { b: 2, c: undefined, d: { e: undefined } } };
const paths2 = findUndefinedFields(obj2);
console.log(`  Resultado: ${paths2.length === 2 && paths2.includes('nested.c') && paths2.includes('nested.d.e') ? '✅' : '❌'}`);
console.log(`  Paths encontrados: ${paths2.join(', ')}`);
console.log('');

// Teste 3: Array com undefined
console.log('Teste 3: Array com undefined');
const obj3 = { items: [1, undefined, 3, { a: undefined }] };
const paths3 = findUndefinedFields(obj3);
console.log(`  Resultado: ${paths3.length >= 1 ? '✅' : '❌'}`);
console.log(`  Paths encontrados: ${paths3.join(', ')}`);
console.log('');

// Teste 4: Objeto sem undefined
console.log('Teste 4: Objeto sem undefined');
const obj4 = { a: 1, b: 2, c: { d: 3, e: null } };
const paths4 = findUndefinedFields(obj4);
console.log(`  Resultado: ${paths4.length === 0 ? '✅' : '❌'}`);
console.log(`  Paths encontrados: ${paths4.length === 0 ? 'nenhum' : paths4.join(', ')}`);
console.log('');

// Teste 5: validateForFirestore - válido
console.log('Teste 5: validateForFirestore - válido');
const validation1 = validateForFirestore(obj4, 'TestObject');
console.log(`  Resultado: ${validation1.valid ? '✅' : '❌'}`);
console.log(`  Erros: ${validation1.errors.length === 0 ? 'nenhum' : validation1.errors.join(', ')}`);
console.log('');

// Teste 6: validateForFirestore - inválido
console.log('Teste 6: validateForFirestore - inválido');
const validation2 = validateForFirestore(obj2, 'TestObject');
console.log(`  Resultado: ${!validation2.valid ? '✅' : '❌'}`);
console.log(`  Erros encontrados: ${validation2.errors.length}`);
console.log('');

// Teste 7: Objeto grande sem undefined
console.log('Teste 7: Objeto grande sem undefined');
const obj5 = {
  id: 'test',
  name: 'Test',
  data: {
    items: [1, 2, 3],
    metadata: {
      created: '2025-01-01',
      updated: '2025-01-02'
    }
  },
  tags: ['a', 'b', 'c'],
  config: {
    enabled: true,
    timeout: 1000
  }
};
const paths5 = findUndefinedFields(obj5);
console.log(`  Resultado: ${paths5.length === 0 ? '✅' : '❌'}`);
console.log(`  Paths encontrados: ${paths5.length === 0 ? 'nenhum' : paths5.join(', ')}`);
console.log('');

console.log('✅ Testes concluídos!');

