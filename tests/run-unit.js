#!/usr/bin/env node
/**
 * Runner de Testes Unitários
 * Executa todos os testes unitários
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UNIT_TESTS = [
  'test-firestore-validator.js',
  'test-error-classifier.js',
  'test-autofix-generators.js',
  'test-apply-idempotency.js',
  'test-rate-limiter.js',
  'test-auth-simple.js'
];

console.log('🧪 Executando Testes Unitários\n');

let passed = 0;
let failed = 0;

async function runTests() {
  for (const test of UNIT_TESTS) {
    const testPath = `${__dirname}/unit/${test}`;
    
    if (!fs.existsSync(testPath)) {
      console.log(`⚠️  Teste não encontrado: ${test}`);
      continue;
    }
    
    console.log(`\n📋 Executando: ${test}`);
    console.log('─'.repeat(50));
    
    const result = await new Promise((resolve) => {
      const proc = spawn('node', [testPath], {
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      proc.on('close', (code) => {
        resolve(code === 0);
      });
    });
    
    if (result) {
      passed++;
      console.log(`✅ ${test} passou\n`);
    } else {
      failed++;
      console.log(`❌ ${test} falhou\n`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resumo: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

console.log('\n' + '='.repeat(50));
console.log(`📊 Resumo: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);

