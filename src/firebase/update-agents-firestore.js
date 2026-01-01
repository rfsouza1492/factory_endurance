#!/usr/bin/env node
/**
 * Script para atualizar todos os agentes no run-workflow.js
 * para usar Firestore
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKFLOW_FILE = path.join(__dirname, '../scripts/run-workflow.js');

// Mapeamento de agentes
const AGENTS = [
  {
    name: 'document-analysis',
    agentName: 'document-analysis',
    varName: 'docs',
    displayName: 'Document Analysis',
    scorePath: 'docsAnalysis.results.score'
  },
  {
    name: 'security',
    agentName: 'security-audit',
    varName: 'security',
    displayName: 'Security Audit',
    scorePath: 'securityAudit.results.score'
  },
  {
    name: 'performance',
    agentName: 'performance-analysis',
    varName: 'perf',
    displayName: 'Performance Analysis',
    scorePath: 'perfAnalysis.results.score'
  },
  {
    name: 'dependency',
    agentName: 'dependency-management',
    varName: 'dep',
    displayName: 'Dependency Management',
    scorePath: 'depAnalysis.results.score'
  },
  {
    name: 'testing',
    agentName: 'testing-coverage',
    varName: 'testing',
    displayName: 'Testing Coverage',
    scorePath: 'testingAnalysis.results.score'
  },
  {
    name: 'accessibility',
    agentName: 'accessibility-audit',
    varName: 'accessibility',
    displayName: 'Accessibility Audit',
    scorePath: 'accessibilityAudit.results.score'
  },
  {
    name: 'api-design',
    agentName: 'api-design-review',
    varName: 'apiDesign',
    displayName: 'API Design Review',
    scorePath: 'apiDesignReview.results.score'
  },
  {
    name: 'implementation-tracking',
    agentName: 'implementation-tracking',
    varName: 'tracking',
    displayName: 'Implementation Tracking',
    scorePath: 'trackingAnalysis.results.score || 0'
  }
];

function updateAgentInFile(content, agent) {
  // Padrão a ser substituído
  const oldPattern = new RegExp(
    `(const ${agent.varName}Content = generate\\w+Report\\(${agent.varName}\\w+\\.results, timestamp\\);\\s*fs\\.writeFileSync\\(${agent.varName}Result\\.file, ${agent.varName}Content\\);\\s*results\\.${agent.name} = ${agent.varName}Result;)`,
    's'
  );

  // Novo código
  const newCode = `const ${agent.varName}Content = generate${agent.displayName.replace(/\s+/g, '')}Report(${agent.varName}${agent.varName === 'docs' ? 'Analysis' : agent.varName === 'perf' ? 'Analysis' : agent.varName === 'dep' ? 'Analysis' : agent.varName === 'testing' ? 'Analysis' : agent.varName === 'tracking' ? 'Analysis' : 'Audit'}.results, timestamp);
    
    // Salvar no Firestore e arquivo (modo híbrido)
    const ${agent.varName}SaveResult = await saveAgentResultToFirestore(
      '${agent.agentName}',
      {
        ...${agent.varName}${agent.varName === 'docs' ? 'Analysis' : agent.varName === 'perf' ? 'Analysis' : agent.varName === 'dep' ? 'Analysis' : agent.varName === 'testing' ? 'Analysis' : agent.varName === 'tracking' ? 'Analysis' : 'Audit'}.results,
        score: ${agent.scorePath} || 0,
        status: 'completed'
      },
      {
        markdownContent: ${agent.varName}Content,
        filePath: ${agent.varName}Result.file,
        timestamp
      }
    );
    
    // Manter compatibilidade com código existente
    if (!${agent.varName}SaveResult.filePath && ${agent.varName}Result.file) {
      fs.writeFileSync(${agent.varName}Result.file, ${agent.varName}Content);
    }
    
    results.${agent.name} = {
      ...${agent.varName}Result,
      firestoreId: ${agent.varName}SaveResult.firestoreId
    };`;

  if (oldPattern.test(content)) {
    return content.replace(oldPattern, newCode);
  }

  return content;
}

// Ler arquivo
let content = fs.readFileSync(WORKFLOW_FILE, 'utf-8');

// Atualizar cada agente
let updated = 0;
for (const agent of AGENTS) {
  const before = content;
  content = updateAgentInFile(content, agent);
  if (content !== before) {
    updated++;
    console.log(`✅ Atualizado: ${agent.displayName}`);
  } else {
    console.log(`⚠️  Não encontrado padrão para: ${agent.displayName}`);
  }
}

// Salvar arquivo
fs.writeFileSync(WORKFLOW_FILE, content, 'utf-8');

console.log(`\n✅ ${updated} agentes atualizados!`);

