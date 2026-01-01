#!/usr/bin/env node
/**
 * Teste de AutoFix Generators
 * Valida geração de AutoFixTask a partir de issues
 */

import {
  canBeAutoFixed,
  determineTargetType,
  determineRiskLevel,
  determineRequiresApproval,
  generateFileTemplate,
  extractPackageName,
  generateInstallCommand
} from '../src/utils/autofix-generators.js';

console.log('🧪 Teste de AutoFix Generators\n');

// Teste 1: canBeAutoFixed
console.log('Teste 1: canBeAutoFixed()');
const autoFixableIssue = {
  type: 'Security',
  message: 'firestore.rules não encontrado',
  location: 'Agents/life-goals-app/firestore.rules'
};
const nonAutoFixableIssue = {
  type: 'Architecture',
  message: 'Arquitetura precisa ser refatorada para microserviços'
};

console.log(`  Issue auto-fixável: ${canBeAutoFixed(autoFixableIssue) ? '✅' : '❌'}`);
console.log(`  Issue não auto-fixável: ${!canBeAutoFixed(nonAutoFixableIssue) ? '✅' : '❌'}`);
console.log('');

// Teste 2: determineTargetType
console.log('Teste 2: determineTargetType()');
const fileIssue = { location: 'src/file.js', message: 'arquivo não encontrado' };
const commandIssue = { location: 'package.json', message: 'package express faltando' };
const configIssue = { location: '.eslintrc.json', message: 'config incorreta' };

console.log(`  File issue: ${determineTargetType(fileIssue) === 'file' ? '✅' : '❌'}`);
console.log(`  Command issue: ${determineTargetType(commandIssue) === 'command' ? '✅' : '❌'}`);
console.log(`  Config issue: ${determineTargetType(configIssue) === 'config' ? '✅' : '❌'}`);
console.log('');

// Teste 3: generateFileTemplate
console.log('Teste 3: generateFileTemplate()');
const firestoreRules = generateFileTemplate('firestore.rules');
const packageJson = generateFileTemplate('package.json');
const readme = generateFileTemplate('README.md');

console.log(`  firestore.rules template: ${firestoreRules.includes('rules_version') ? '✅' : '❌'}`);
console.log(`  package.json template: ${packageJson.includes('"name"') ? '✅' : '❌'}`);
console.log(`  README.md template: ${readme.includes('#') ? '✅' : '❌'}`);
console.log('');

// Teste 4: extractPackageName
console.log('Teste 4: extractPackageName()');
const packageMessages = [
  'package express não encontrado',
  'npm install express',
  'missing package: react'
];

packageMessages.forEach(msg => {
  const pkg = extractPackageName(msg);
  console.log(`  "${msg}" → ${pkg || 'null'} ${pkg ? '✅' : '❌'}`);
});
console.log('');

// Teste 5: generateInstallCommand
console.log('Teste 5: generateInstallCommand()');
const expressCmd = generateInstallCommand('express', 'package.json');
const reactCmd = generateInstallCommand('react', 'package.json');

console.log(`  express: ${expressCmd === 'npm install express' ? '✅' : '❌'} (${expressCmd})`);
console.log(`  react: ${reactCmd === 'npm install react' ? '✅' : '❌'} (${reactCmd})`);
console.log('');

// Teste 6: determineRiskLevel
console.log('Teste 6: determineRiskLevel()');
const criticalIssue = { severity: 'critical', priority: 'P0' };
const lowIssue = { severity: 'low', priority: 'P3' };

console.log(`  Critical issue: ${determineRiskLevel(criticalIssue, 'create') === 'high' ? '✅' : '❌'}`);
console.log(`  Low issue: ${determineRiskLevel(lowIssue, 'create') === 'low' ? '✅' : '❌'}`);
console.log('');

// Teste 7: determineRequiresApproval
console.log('Teste 7: determineRequiresApproval()');
const p0Issue = { severity: 'critical', priority: 'P0', location: 'test.js' };
const p1Issue = { severity: 'high', priority: 'P1', location: 'test.js' };

console.log(`  P0 issue: ${determineRequiresApproval(p0Issue, 'create') ? '✅' : '❌'}`);
console.log(`  P1 issue: ${!determineRequiresApproval(p1Issue, 'create') ? '✅' : '❌'}`);
console.log('');

console.log('✅ Testes concluídos!');

