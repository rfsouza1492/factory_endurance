/**
 * Test Suite for Maestro Workflow
 * 
 * Execute: node tests/test-workflow.js
 */

import { runArchitectureReview } from '../src/agents/architecture-agent.js';
import { runCodeQualityEvaluation } from '../src/agents/code-quality-agent.js';
import { runDocumentAnalysis } from '../src/agents/document-analysis-agent.js';
import { runSecurityAudit } from '../src/agents/security-agent.js';
import { runPerformanceAnalysis } from '../src/agents/performance-agent.js';
import { runDependencyAnalysis } from '../src/agents/dependency-agent.js';
import { runProductManagerAnalysis } from '../src/agents/product-manager-agent.js';
import { consolidateConcerns, identifyConflicts, makeDecision, calculateConsolidatedScores } from '../src/scripts/decision-logic.js';
import { generateBacklogFromIssues, saveBacklog } from '../src/scripts/backlog-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || (result && result.success !== false)) {
      results.passed++;
      results.tests.push({ name, status: 'PASS', message: 'OK' });
      console.log(`✅ ${name}`);
      return true;
    } else {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', message: result.message || 'Failed' });
      console.log(`❌ ${name}: ${result.message || 'Failed'}`);
      return false;
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'ERROR', message: error.message });
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

// Test 1: Architecture Agent
async function testArchitectureAgent() {
  return test('Architecture Agent executes', async () => {
    const result = await runArchitectureReview();
    return result.success === true && 
           result.results.score >= 0 && 
           result.results.score <= 100 &&
           Array.isArray(result.results.issues.critical);
  });
}

// Test 2: Code Quality Agent
async function testCodeQualityAgent() {
  return test('Code Quality Agent executes', async () => {
    const result = await runCodeQualityEvaluation();
    return result.success === true && 
           result.results.score >= 0 && 
           result.results.score <= 100;
  });
}

// Test 3: Document Analysis Agent
async function testDocumentAnalysisAgent() {
  return test('Document Analysis Agent executes', async () => {
    const result = await runDocumentAnalysis();
    return result.success === true && 
           result.results.score >= 0 && 
           result.results.score <= 100;
  });
}

// Test 4: Security Agent
async function testSecurityAgent() {
  return test('Security Agent executes', async () => {
    const result = await runSecurityAudit();
    return result.success === true && 
           result.results.score >= 0 && 
           result.results.score <= 100;
  });
}

// Test 5: Performance Agent
async function testPerformanceAgent() {
  return test('Performance Agent executes', async () => {
    const result = await runPerformanceAnalysis();
    return result.success === true && 
           result.results.score >= 0 && 
           result.results.score <= 100;
  });
}

// Test 6: Dependency Agent
async function testDependencyAgent() {
  return test('Dependency Agent executes', async () => {
    const result = await runDependencyAnalysis();
    return result.success === true && 
           result.results.score >= 0 && 
           result.results.score <= 100;
  });
}

// Test 7: Product Manager Agent
async function testProductManagerAgent() {
  return test('Product Manager Agent executes', async () => {
    const result = await runProductManagerAnalysis();
    return result.success === true && 
           result.backlogId !== undefined;
  });
}

// Test 8: Decision Logic
async function testDecisionLogic() {
  return test('Decision Logic functions work', () => {
    // Mock execution results
    const mockResults = {
      results: {
        architecture: { data: { score: 60, issues: { critical: [], high: [], medium: [], low: [] } } },
        codeQuality: { data: { score: 90, issues: { critical: [], high: [], medium: [], low: [] } } },
        documentAnalysis: { data: { score: 73, issues: { critical: [], high: [], medium: [], low: [] } } }
      }
    };
    
    const mockEvals = {};
    
    const scores = calculateConsolidatedScores(mockResults);
    const concerns = consolidateConcerns(mockResults, mockEvals);
    const conflicts = identifyConflicts(mockResults, mockEvals);
    const decision = makeDecision(concerns, conflicts, scores);
    
    return scores.overall >= 0 && 
           scores.overall <= 100 &&
           decision.decision !== undefined;
  });
}

// Test 9: Backlog Generator
async function testBacklogGenerator() {
  return test('Backlog Generator works', () => {
    const mockIssues = [
      { type: 'Security', message: 'Test issue', priority: 'P1', agent: 'Security' }
    ];
    
    const backlog = generateBacklogFromIssues(mockIssues);
    
    return backlog.backlogId !== undefined &&
           backlog.tasks.length > 0 &&
           backlog.summary.totalTasks > 0;
  });
}

// Test 10: File Structure
async function testFileStructure() {
  return test('File structure exists', () => {
    const requiredDirs = [
      'src/agents',
      'src/scripts',
      'src/shared',
      'src/web'
    ];
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(fullPath)) {
        return { success: false, message: `Directory ${dir} not found` };
      }
    }
    
    return true;
  });
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Executando Testes - Maestro Workflow\n');
  console.log('='.repeat(60));
  console.log('');
  
  await testFileStructure();
  await testArchitectureAgent();
  await testCodeQualityAgent();
  await testDocumentAnalysisAgent();
  await testSecurityAgent();
  await testPerformanceAgent();
  await testDependencyAgent();
  await testProductManagerAgent();
  await testDecisionLogic();
  await testBacklogGenerator();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  console.log('');
  
  if (results.failed === 0) {
    console.log('🎉 Todos os testes passaram!');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
    process.exit(1);
  }
}

// Execute
runAllTests().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

