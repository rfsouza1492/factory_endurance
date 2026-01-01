#!/usr/bin/env node
/**
 * Setup de Ambiente de Teste
 * Prepara ambiente isolado para testes E2E
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const E2E_PROJECT_DIR = path.join(__dirname, '..', 'tmp', 'maestro-e2e-project');
const E2E_WORKSPACE = path.join(__dirname, '..', 'tmp', 'maestro-e2e-workspace');

/**
 * Limpa ambiente de teste
 */
export function cleanupTestEnv() {
  if (fs.existsSync(E2E_PROJECT_DIR)) {
    fs.rmSync(E2E_PROJECT_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(E2E_WORKSPACE)) {
    fs.rmSync(E2E_WORKSPACE, { recursive: true, force: true });
  }
}

/**
 * Cria ambiente de teste
 */
export function setupTestEnv() {
  cleanupTestEnv();
  
  // Criar diretórios
  fs.mkdirSync(E2E_PROJECT_DIR, { recursive: true });
  fs.mkdirSync(E2E_WORKSPACE, { recursive: true });
  
  // Criar estrutura básica
  fs.writeFileSync(
    path.join(E2E_PROJECT_DIR, 'package.json'),
    JSON.stringify({
      name: 'maestro-e2e-test',
      version: '1.0.0',
      type: 'module'
    }, null, 2),
    'utf-8'
  );
  
  fs.writeFileSync(
    path.join(E2E_PROJECT_DIR, 'index.js'),
    'console.log("E2E Test Project");\n',
    'utf-8'
  );
  
  return {
    projectDir: E2E_PROJECT_DIR,
    workspace: E2E_WORKSPACE
  };
}

/**
 * Reset Firebase emulators (se rodando)
 */
export async function resetFirebaseEmulators() {
  // Por enquanto, apenas log
  // TODO: Implementar reset via API dos emulators
  console.log('⚠️  Reset de emulators requer implementação via API');
  console.log('   Por enquanto, reinicie manualmente: npm run firebase:dev');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'setup';
  
  if (command === 'setup') {
    const env = setupTestEnv();
    console.log('✅ Ambiente de teste criado:');
    console.log(`   Project: ${env.projectDir}`);
    console.log(`   Workspace: ${env.workspace}`);
  } else if (command === 'cleanup') {
    cleanupTestEnv();
    console.log('✅ Ambiente de teste limpo');
  }
}

export default {
  setupTestEnv,
  cleanupTestEnv,
  resetFirebaseEmulators
};

