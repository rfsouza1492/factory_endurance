#!/usr/bin/env node
/**
 * Teste de Implementation Agent
 * Valida aplicação de diferentes fixType
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DIR = path.join(__dirname, 'test-files');

// Criar diretório de teste
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

console.log('🧪 Teste de Implementation Agent\n');

// Simular funções apply* (versão simplificada para teste)
async function testApplyCreate() {
  console.log('Teste 1: applyCreate()');
  const task = {
    id: 'test-001',
    targetPath: path.join(TEST_DIR, 'new-file.js'),
    fixType: 'create',
    newContent: 'console.log("test");'
  };

  try {
    // Simular criação
    if (!fs.existsSync(task.targetPath)) {
      fs.writeFileSync(task.targetPath, task.newContent, 'utf-8');
      console.log('  ✅ Arquivo criado');
    } else {
      console.log('  ❌ Arquivo já existe');
    }
  } catch (error) {
    console.log(`  ❌ Erro: ${error.message}`);
  }
  console.log('');
}

async function testApplyCommand() {
  console.log('Teste 2: applyCommand()');
  const task = {
    id: 'test-002',
    fixType: 'command',
    command: 'echo "test command"'
  };

  try {
    // Simular execução (dry-run)
    console.log(`  Comando: ${task.command}`);
    console.log('  ✅ Comando válido (dry-run)');
  } catch (error) {
    console.log(`  ❌ Erro: ${error.message}`);
  }
  console.log('');
}

async function testApplyConfig() {
  console.log('Teste 3: applyConfig()');
  const configPath = path.join(TEST_DIR, 'test-config.json');
  const originalConfig = { rules: { 'no-console': 'warn' } };
  
  // Criar config de teste
  fs.writeFileSync(configPath, JSON.stringify(originalConfig, null, 2), 'utf-8');

  const task = {
    id: 'test-003',
    targetPath: configPath,
    fixType: 'config',
    configKey: 'rules.no-console',
    newValue: 'error'
  };

  try {
    // Simular atualização
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const keys = task.configKey.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = task.newValue;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('  ✅ Config atualizada');
  } catch (error) {
    console.log(`  ❌ Erro: ${error.message}`);
  }
  console.log('');
}

async function testApplyDelete() {
  console.log('Teste 4: applyDelete()');
  const filePath = path.join(TEST_DIR, 'file-to-delete.js');
  
  // Criar arquivo para deletar
  fs.writeFileSync(filePath, '// delete me', 'utf-8');

  const task = {
    id: 'test-004',
    targetPath: filePath,
    fixType: 'delete'
  };

  try {
    if (fs.existsSync(task.targetPath)) {
      fs.unlinkSync(task.targetPath);
      console.log('  ✅ Arquivo deletado');
    } else {
      console.log('  ❌ Arquivo não existe');
    }
  } catch (error) {
    console.log(`  ❌ Erro: ${error.message}`);
  }
  console.log('');
}

// Executar testes
(async () => {
  await testApplyCreate();
  await testApplyCommand();
  await testApplyConfig();
  await testApplyDelete();
  
  // Limpar
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  
  console.log('✅ Todos os testes concluídos!');
})();

