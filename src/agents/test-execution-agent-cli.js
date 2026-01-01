#!/usr/bin/env node
/**
 * CLI para Test Execution Agent
 * Executa testes antes de produção
 */

import { runTestExecutionAgent, generateTestExecutionReport } from './test-execution-agent.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

// Parse arguments
const options = {
  skipValidation: args.includes('--skip-validation'),
  testTypes: args.find(arg => arg.startsWith('--test-types='))?.split('=')[1]?.split(',') || ['unit', 'integration', 'e2e'],
  blockProduction: !args.includes('--no-block')
};

console.log('🧪 Test Execution Agent - CLI\n');
console.log('Opções:', options);
console.log('');

// Execute
runTestExecutionAgent(options)
  .then(result => {
    // Generate markdown report
    const reportContent = generateTestExecutionReport(result);
    const reportPath = path.join(__dirname, '../../src/shared/results/test-execution', `${result.id}-report.md`);
    
    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, reportContent, 'utf-8');
    console.log(`\n📄 Relatório salvo: ${reportPath}`);
    
    // Exit with appropriate code
    if (result.summary.blocked || result.summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('❌ Erro ao executar Test Execution Agent:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  });

