/**
 * Test Execution Agent
 * Executa testes antes de produção usando a metodologia documentada
 * 
 * Responsabilidades:
 * - Validar estrutura de testes
 * - Executar suíte completa de testes
 * - Gerar relatório de testes
 * - Bloquear produção se testes falharem
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { saveAgentResultToFirestore } from '../firebase/agent-results-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAESTRO_WORKFLOW_ROOT = path.resolve(__dirname, '../..');
const SHARED_DIR = path.join(MAESTRO_WORKFLOW_ROOT, 'src/shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results');
const TEST_METHODOLOGY_DIR = path.join(MAESTRO_WORKFLOW_ROOT, 'docs/testing-methodology');
const TESTS_DIR = path.join(MAESTRO_WORKFLOW_ROOT, 'tests');
const FRAMEWORK_DIR = path.join(TESTS_DIR, 'framework');

/**
 * Carrega documentação da metodologia de testes
 */
function loadTestMethodology() {
  const methodology = {
    structure: null,
    framework: null,
    quickReference: null
  };

  try {
    // Carregar metodologia completa
    const methodologyPath = path.join(TEST_METHODOLOGY_DIR, 'TEST_CONSTRUCTION_METHODOLOGY.md');
    if (fs.existsSync(methodologyPath)) {
      methodology.structure = fs.readFileSync(methodologyPath, 'utf-8');
    }

    // Carregar guia rápido
    const quickRefPath = path.join(TEST_METHODOLOGY_DIR, 'TEST_QUICK_REFERENCE.md');
    if (fs.existsSync(quickRefPath)) {
      methodology.quickReference = fs.readFileSync(quickRefPath, 'utf-8');
    }

    // Carregar guia do framework
    const frameworkPath = path.join(TEST_METHODOLOGY_DIR, 'FRAMEWORK_GUIDE.md');
    if (fs.existsSync(frameworkPath)) {
      methodology.framework = fs.readFileSync(frameworkPath, 'utf-8');
    }
  } catch (error) {
    console.warn(`⚠️  Erro ao carregar metodologia: ${error.message}`);
  }

  return methodology;
}

/**
 * Valida estrutura de testes usando o framework
 */
async function validateTestStructure() {
  return new Promise((resolve) => {
    const validatorPath = path.join(FRAMEWORK_DIR, 'validate-structure.js');
    
    if (!fs.existsSync(validatorPath)) {
      resolve({
        valid: false,
        error: 'Validador de estrutura não encontrado'
      });
      return;
    }

    const proc = spawn('node', [validatorPath], {
      cwd: MAESTRO_WORKFLOW_ROOT,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        valid: code === 0,
        output: output + errorOutput,
        exitCode: code
      });
    });
  });
}

/**
 * Executa testes usando o framework
 */
async function runTests(testType) {
  return new Promise((resolve) => {
    const testScript = `test:${testType}`;
    const proc = spawn('npm', ['run', testScript], {
      cwd: MAESTRO_WORKFLOW_ROOT,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output + errorOutput,
        exitCode: code
      });
    });
  });
}

/**
 * Gera relatório de testes usando o framework
 */
async function generateTestReport() {
  return new Promise((resolve) => {
    const reportPath = path.join(FRAMEWORK_DIR, 'generate-report.js');
    
    if (!fs.existsSync(reportPath)) {
      resolve({
        success: false,
        error: 'Gerador de relatório não encontrado'
      });
      return;
    }

    const proc = spawn('node', [reportPath], {
      cwd: MAESTRO_WORKFLOW_ROOT,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output + errorOutput,
        exitCode: code,
        reportPath: path.join(TESTS_DIR, 'test-report.md')
      });
    });
  });
}

/**
 * Executa o Test Execution Agent
 */
export async function runTestExecutionAgent(options = {}) {
  const {
    skipValidation = false,
    testTypes = ['unit', 'integration', 'e2e'],
    blockProduction = true
  } = options;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const testExecutionId = `test-execution-${timestamp}`;
  const resultDir = path.join(RESULTS_DIR, 'test-execution');
  
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }

  const resultFile = path.join(resultDir, `${testExecutionId}.json`);
  const reportFile = path.join(resultDir, `${testExecutionId}-report.md`);

  console.log('\n🧪 Test Execution Agent');
  console.log('='.repeat(60));
  console.log(`📋 Executando testes antes de produção...\n`);

  const result = {
    id: testExecutionId,
    timestamp: new Date().toISOString(),
    methodology: {
      loaded: false,
      available: false
    },
    structure: {
      validated: false,
      valid: false
    },
    tests: {
      unit: null,
      integration: null,
      e2e: null
    },
    report: {
      generated: false,
      path: null
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: false
    },
    recommendations: []
  };

  // 1. Carregar metodologia
  console.log('📚 Carregando metodologia de testes...');
  const methodology = loadTestMethodology();
  result.methodology.loaded = true;
  result.methodology.available = !!methodology.structure;

  if (result.methodology.available) {
    console.log('  ✅ Metodologia carregada');
  } else {
    console.log('  ⚠️  Metodologia não encontrada (continuando mesmo assim)');
  }

  // 2. Validar estrutura
  if (!skipValidation) {
    console.log('\n🔍 Validando estrutura de testes...');
    const structureValidation = await validateTestStructure();
    result.structure.validated = true;
    result.structure.valid = structureValidation.valid;

    if (structureValidation.valid) {
      console.log('  ✅ Estrutura válida');
    } else {
      console.log('  ❌ Estrutura inválida');
      console.log(structureValidation.output);
      result.recommendations.push('Corrigir estrutura de testes antes de continuar');
    }
  }

  // 3. Executar testes
  console.log('\n🧪 Executando testes...');
  
  for (const testType of testTypes) {
    if (!['unit', 'integration', 'e2e'].includes(testType)) {
      console.log(`  ⚠️  Tipo de teste inválido: ${testType}`);
      continue;
    }

    console.log(`\n  📋 Executando testes ${testType}...`);
    const testResult = await runTests(testType);
    result.tests[testType] = testResult;
    result.summary.total++;

    if (testResult.success) {
      console.log(`  ✅ Testes ${testType} passaram`);
      result.summary.passed++;
    } else {
      console.log(`  ❌ Testes ${testType} falharam`);
      result.summary.failed++;
      console.log(testResult.output.substring(0, 500));
    }
  }

  // 4. Gerar relatório
  console.log('\n📊 Gerando relatório...');
  const reportResult = await generateTestReport();
  result.report.generated = reportResult.success;
  result.report.path = reportResult.reportPath;

  if (reportResult.success) {
    console.log(`  ✅ Relatório gerado: ${reportResult.reportPath}`);
    
    // Copiar relatório para diretório de resultados
    if (fs.existsSync(reportResult.reportPath)) {
      fs.copyFileSync(reportResult.reportPath, reportFile);
      result.report.path = reportFile;
    }
  } else {
    console.log('  ⚠️  Erro ao gerar relatório');
  }

  // 5. Decisão: Bloquear produção?
  if (blockProduction && result.summary.failed > 0) {
    result.summary.blocked = true;
    result.recommendations.push('🚫 PRODUÇÃO BLOQUEADA: Testes falharam');
    result.recommendations.push(`   ${result.summary.failed} tipo(s) de teste falharam`);
    result.recommendations.push('   Corrigir testes antes de prosseguir para produção');
  } else if (result.summary.failed > 0) {
    result.recommendations.push('⚠️  Testes falharam, mas produção não foi bloqueada');
    result.recommendations.push('   Revisar falhas antes de prosseguir');
  }

  if (result.summary.passed === result.summary.total && result.summary.total > 0) {
    result.recommendations.push('✅ Todos os testes passaram - Pronto para produção');
  }

  // 6. Salvar resultados
  fs.writeFileSync(resultFile, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n💾 Resultados salvos: ${resultFile}`);

  // 7. Salvar no Firestore
  try {
    // Remover undefined antes de salvar
    const firestoreData = {
      agent: 'TestExecutionAgent',
      timestamp: new Date().toISOString(),
      result: {
        id: result.id,
        timestamp: result.timestamp,
        methodology: result.methodology,
        structure: result.structure,
        tests: {
          unit: result.tests.unit ? {
            success: result.tests.unit.success,
            exitCode: result.tests.unit.exitCode
          } : null,
          integration: result.tests.integration ? {
            success: result.tests.integration.success,
            exitCode: result.tests.integration.exitCode
          } : null,
          e2e: result.tests.e2e ? {
            success: result.tests.e2e.success,
            exitCode: result.tests.e2e.exitCode
          } : null
        },
        summary: result.summary,
        recommendations: result.recommendations
      },
      summary: {
        total: result.summary.total,
        passed: result.summary.passed,
        failed: result.summary.failed,
        blocked: result.summary.blocked
      }
    };
    
    await saveAgentResultToFirestore(firestoreData, {
      resultId: testExecutionId,
      filePath: resultFile
    });
    console.log('  ✅ Resultados salvos no Firestore');
  } catch (error) {
    console.warn(`  ⚠️  Erro ao salvar no Firestore: ${error.message}`);
  }

  // 8. Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 Resumo da Execução de Testes');
  console.log('='.repeat(60));
  console.log(`Total de tipos de teste: ${result.summary.total}`);
  console.log(`✅ Passaram: ${result.summary.passed}`);
  console.log(`❌ Falharam: ${result.summary.failed}`);
  
  if (result.summary.blocked) {
    console.log('\n🚫 PRODUÇÃO BLOQUEADA');
  } else if (result.summary.failed === 0) {
    console.log('\n✅ PRONTO PARA PRODUÇÃO');
  }

  if (result.recommendations.length > 0) {
    console.log('\n📋 Recomendações:');
    result.recommendations.forEach(rec => console.log(`   ${rec}`));
  }

  console.log('='.repeat(60) + '\n');

  return result;
}

/**
 * Gera relatório markdown do Test Execution Agent
 */
export function generateTestExecutionReport(result) {
  const status = result.summary.blocked ? '🚫 BLOQUEADO' : 
                 result.summary.failed === 0 ? '✅ APROVADO' : 
                 '⚠️  COM FALHAS';

  return `# Relatório: Test Execution Agent

**Data:** ${new Date(result.timestamp).toLocaleString()}  
**Status:** ${status}  
**ID:** ${result.id}

---

## 📊 Resumo

| Métrica | Valor |
|---------|-------|
| **Total de Tipos** | ${result.summary.total} |
| **✅ Passaram** | ${result.summary.passed} |
| **❌ Falharam** | ${result.summary.failed} |
| **🚫 Bloqueado** | ${result.summary.blocked ? 'Sim' : 'Não'} |

---

## 📚 Metodologia

- **Carregada:** ${result.methodology.loaded ? '✅ Sim' : '❌ Não'}
- **Disponível:** ${result.methodology.available ? '✅ Sim' : '❌ Não'}

---

## 🔍 Estrutura

- **Validada:** ${result.structure.validated ? '✅ Sim' : '❌ Não'}
- **Válida:** ${result.structure.valid ? '✅ Sim' : '❌ Não'}

---

## 🧪 Resultados dos Testes

### Testes Unitários
${result.tests.unit ? (result.tests.unit.success ? '✅ **Passou**' : '❌ **Falhou**') : '⏭️  Não executado'}

### Testes de Integração
${result.tests.integration ? (result.tests.integration.success ? '✅ **Passou**' : '❌ **Falhou**') : '⏭️  Não executado'}

### Testes E2E
${result.tests.e2e ? (result.tests.e2e.success ? '✅ **Passou**' : '❌ **Falhou**') : '⏭️  Não executado'}

---

## 📋 Recomendações

${result.recommendations.length > 0 ? result.recommendations.map(r => `- ${r}`).join('\n') : '- Nenhuma recomendação'}

---

## 📄 Relatório Completo

${result.report.path ? `Relatório gerado: \`${result.report.path}\`` : 'Relatório não gerado'}

---

**Gerado por:** Test Execution Agent
`;
}

