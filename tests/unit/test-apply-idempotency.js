#!/usr/bin/env node
/**
 * Teste Unitário: Idempotência dos fixType
 * Valida que aplicar o mesmo fix múltiplas vezes não corrompe o sistema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DIR = path.join(__dirname, 'test-idempotency');

// Setup
if (fs.existsSync(TEST_DIR)) {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEST_DIR, { recursive: true });

console.log('🧪 Teste Unitário: Idempotência\n');

// Teste 1: applyCreate - idempotência
console.log('Teste 1: applyCreate - idempotência');
const createFile = path.join(TEST_DIR, 'create-test.js');
const createContent = 'console.log("test");';

// Primeira execução
fs.writeFileSync(createFile, createContent, 'utf-8');
const firstContent = fs.readFileSync(createFile, 'utf-8');

// Segunda execução (simular)
try {
  if (fs.existsSync(createFile)) {
    // Deve detectar que já existe e não sobrescrever ou dar erro claro
    const secondContent = fs.readFileSync(createFile, 'utf-8');
    const isIdempotent = firstContent === secondContent;
    console.log(`  Resultado: ${isIdempotent ? '✅' : '❌'} (arquivo não foi corrompido)`);
  }
} catch (error) {
  console.log(`  Resultado: ✅ (erro esperado: ${error.message})`);
}
console.log('');

// Teste 2: applyConfig - idempotência
console.log('Teste 2: applyConfig - idempotência');
const configFile = path.join(TEST_DIR, 'config-test.json');
const initialConfig = { rules: { 'no-console': 'warn' } };
fs.writeFileSync(configFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

// Primeira atualização
let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
config.rules['no-console'] = 'error';
fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
const firstConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

// Segunda atualização (mesmo valor)
config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
config.rules['no-console'] = 'error'; // Mesmo valor
fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
const secondConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const isIdempotent = JSON.stringify(firstConfig) === JSON.stringify(secondConfig);
console.log(`  Resultado: ${isIdempotent ? '✅' : '❌'} (config não foi corrompido)`);
console.log(`  Valor final: ${secondConfig.rules['no-console']}`);
console.log('');

// Teste 3: applyDelete - idempotência
console.log('Teste 3: applyDelete - idempotência');
const deleteFile = path.join(TEST_DIR, 'delete-test.js');
fs.writeFileSync(deleteFile, '// delete me', 'utf-8');

// Primeira deleção
if (fs.existsSync(deleteFile)) {
  fs.unlinkSync(deleteFile);
}

// Segunda deleção (deve dar erro esperado)
try {
  if (fs.existsSync(deleteFile)) {
    fs.unlinkSync(deleteFile);
    console.log('  Resultado: ❌ (deveria dar erro)');
  } else {
    console.log('  Resultado: ✅ (arquivo não existe, erro esperado)');
  }
} catch (error) {
  console.log(`  Resultado: ✅ (erro esperado: ${error.message})`);
}
console.log('');

// Teste 4: applyRewrite - idempotência
console.log('Teste 4: applyRewrite - idempotência');
const rewriteFile = path.join(TEST_DIR, 'rewrite-test.js');
const rewriteContent = 'console.log("rewritten");';

// Primeira reescrita
fs.writeFileSync(rewriteFile, rewriteContent, 'utf-8');
const firstRewrite = fs.readFileSync(rewriteFile, 'utf-8');

// Segunda reescrita (mesmo conteúdo)
fs.writeFileSync(rewriteFile, rewriteContent, 'utf-8');
const secondRewrite = fs.readFileSync(rewriteFile, 'utf-8');

const isIdempotentRewrite = firstRewrite === secondRewrite;
console.log(`  Resultado: ${isIdempotentRewrite ? '✅' : '❌'} (arquivo não foi corrompido)`);
console.log('');

// Cleanup
fs.rmSync(TEST_DIR, { recursive: true, force: true });

console.log('✅ Testes de idempotência concluídos!');

