#!/usr/bin/env node
/**
 * Runner de Testes E2E
 * Executa todos os testes end-to-end
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const E2E_TESTS = [
  'test-workflow-happy-path.js',
  'test-workflow-with-errors.js',
  'test-workflow-firestore-down.js'
];

console.log('🧪 Executando Testes E2E\n');
console.log('⚠️  Nota: Testes E2E podem demorar e requerem Firebase emulators\n');

let passed = 0;
let failed = 0;

async function runTests() {
  for (const test of E2E_TESTS) {
    const testPath = `${__dirname}/e2e/${test}`;
    
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

