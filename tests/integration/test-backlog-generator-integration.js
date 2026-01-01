#!/usr/bin/env node
/**
 * Teste de Integração: Backlog Generator
 * Valida conversão de issues em AutoFixTask completas
 */

import { generateBacklogFromIssues } from '../../src/scripts/backlog-generator.js';
import { validateAutoFixBacklog } from '../../src/schemas/auto-fix-task.js';

console.log('🧪 Teste de Integração: Backlog Generator\n');

// Teste 1: Issues válidos geram AutoFixTask completas
console.log('Teste 1: Issues válidos → AutoFixTask completas');
const validIssues = [
  {
    type: 'Security',
    message: 'firestore.rules não encontrado',
    location: 'test/firestore.rules',
    severity: 'critical',
    priority: 'P0'
  },
  {
    type: 'Dependency',
    message: 'package express não encontrado',
    location: 'package.json',
    severity: 'high',
    priority: 'P1'
  }
];

try {
  const backlog = await generateBacklogFromIssues(validIssues);
  const validation = validateAutoFixBacklog(backlog);
  
  console.log(`  Tarefas geradas: ${backlog.tasks.length}`);
  console.log(`  Validação: ${validation.valid ? '✅' : '❌'}`);
  
  if (validation.valid) {
    backlog.tasks.forEach((task, index) => {
      console.log(`  Tarefa ${index + 1}: ${task.fixType} - ${task.targetPath ? '✅' : '❌'}`);
    });
  } else {
    console.log(`  Erros: ${validation.errors.join(', ')}`);
  }
} catch (error) {
  console.log(`  ❌ Erro: ${error.message}`);
}
console.log('');

// Teste 2: Issues inválidos são filtrados
console.log('Teste 2: Issues inválidos são filtrados');
const mixedIssues = [
  {
    type: 'Security',
    message: 'firestore.rules não encontrado',
    location: 'test/firestore.rules',
    severity: 'critical'
  },
  {
    type: 'Architecture',
    message: 'Arquitetura precisa ser refatorada para microserviços',
    severity: 'high'
    // Sem location, não auto-fixável
  }
];

try {
  const backlog = await generateBacklogFromIssues(mixedIssues);
  const validation = validateAutoFixBacklog(backlog);
  
  console.log(`  Issues de entrada: ${mixedIssues.length}`);
  console.log(`  Tarefas geradas: ${backlog.tasks.length}`);
  console.log(`  Issues filtrados: ${mixedIssues.length - backlog.tasks.length}`);
  console.log(`  Validação: ${validation.valid ? '✅' : '❌'}`);
  
  if (backlog.tasks.length < mixedIssues.length) {
    console.log('  ✅ Issues não auto-fixáveis foram filtrados');
  }
} catch (error) {
  console.log(`  ❌ Erro: ${error.message}`);
}
console.log('');

// Teste 3: Backlog completo é válido
console.log('Teste 3: Backlog completo é válido');
const completeIssues = [
  { type: 'Security', message: 'firestore.rules não encontrado', location: 'test/firestore.rules', severity: 'critical' },
  { type: 'Dependency', message: 'package react não encontrado', location: 'package.json', severity: 'high' },
  { type: 'Documentation', message: 'README.md não encontrado', location: 'README.md', severity: 'medium' }
];

try {
  const backlog = await generateBacklogFromIssues(completeIssues);
  const validation = validateAutoFixBacklog(backlog);
  
  console.log(`  Tarefas geradas: ${backlog.tasks.length}`);
  console.log(`  Validação: ${validation.valid ? '✅' : '❌'}`);
  console.log(`  Todas são AutoFixTask: ${backlog.tasks.every(t => t.fixType && t.targetPath) ? '✅' : '❌'}`);
  
  if (validation.valid) {
    console.log('  ✅ Backlog completo é válido');
  } else {
    console.log(`  ❌ Erros: ${validation.errors.slice(0, 3).join(', ')}`);
  }
} catch (error) {
  console.log(`  ❌ Erro: ${error.message}`);
}
console.log('');

console.log('✅ Testes de integração concluídos!');

