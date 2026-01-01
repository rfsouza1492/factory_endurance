#!/usr/bin/env node
/**
 * Script de Migração de Dados
 * Migra dados do sistema de arquivos para Firestore
 * 
 * Opções:
 * - Opção A: Híbrido (manter arquivos + Firestore)
 * - Opção B: Migração completa (apenas Firestore)
 */

import { db } from './connection.js';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Configuração
const SHARED_DIR = join(__dirname, '../../src/shared');
const MIGRATION_MODE = process.env.MIGRATION_MODE || 'hybrid'; // 'hybrid' ou 'complete'

const stats = {
  migrated: 0,
  skipped: 0,
  errors: 0,
  collections: {}
};

// Ler arquivo JSON
function readJSONFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logError(`Erro ao ler ${filePath}: ${error.message}`);
    return null;
  }
}

// Migrar backlog
async function migrateBacklog() {
  logInfo('Migrando backlog...');
  
  const backlogDir = join(SHARED_DIR, 'backlog');
  if (!existsSync(backlogDir)) {
    logWarning('Diretório backlog não encontrado');
    return;
  }
  
  try {
    // Migrar current-backlog.json
    const currentBacklogPath = join(backlogDir, 'current-backlog.json');
    if (existsSync(currentBacklogPath)) {
      const backlogData = readJSONFile(currentBacklogPath);
      if (backlogData) {
        await setDoc(doc(collection(db, 'backlog'), 'current'), {
          ...backlogData,
          migratedAt: serverTimestamp(),
          source: 'file-system'
        });
        logSuccess('Backlog atual migrado');
        stats.migrated++;
        stats.collections.backlog = (stats.collections.backlog || 0) + 1;
      }
    }
    
    // Migrar histórico de melhorias
    const files = readdirSync(backlogDir).filter(f => f.endsWith('.json') && f !== 'current-backlog.json');
    for (const file of files) {
      const filePath = join(backlogDir, file);
      const data = readJSONFile(filePath);
      if (data) {
        const docId = basename(file, '.json');
        await setDoc(doc(collection(db, 'backlog'), docId), {
          ...data,
          migratedAt: serverTimestamp(),
          source: 'file-system',
          originalFile: file
        });
        stats.migrated++;
        stats.collections.backlog = (stats.collections.backlog || 0) + 1;
      }
    }
    
    logSuccess(`Backlog migrado: ${stats.collections.backlog || 0} documentos`);
  } catch (error) {
    logError(`Erro ao migrar backlog: ${error.message}`);
    stats.errors++;
  }
}

// Migrar resultados de agentes
async function migrateAgentResults() {
  logInfo('Migrando resultados de agentes...');
  
  const resultsDir = join(SHARED_DIR, 'results');
  if (!existsSync(resultsDir)) {
    logWarning('Diretório results não encontrado');
    return;
  }
  
  try {
    const agentDirs = readdirSync(resultsDir).filter(f => {
      const fullPath = join(resultsDir, f);
      return statSync(fullPath).isDirectory();
    });
    
    for (const agentDir of agentDirs) {
      const agentPath = join(resultsDir, agentDir);
      const files = readdirSync(agentPath).filter(f => f.endsWith('.md') || f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = join(agentPath, file);
        let content;
        
        if (file.endsWith('.json')) {
          content = readJSONFile(filePath);
        } else {
          // Arquivo markdown
          content = {
            content: readFileSync(filePath, 'utf-8'),
            type: 'markdown',
            agent: agentDir,
            originalFile: file
          };
        }
        
        if (content) {
          const docId = `${agentDir}-${basename(file, file.endsWith('.json') ? '.json' : '.md')}`;
          await setDoc(doc(collection(db, 'results'), docId), {
            ...content,
            agent: agentDir,
            migratedAt: serverTimestamp(),
            source: 'file-system',
            originalFile: file
          });
          stats.migrated++;
          stats.collections.results = (stats.collections.results || 0) + 1;
        }
      }
    }
    
    logSuccess(`Resultados migrados: ${stats.collections.results || 0} documentos`);
  } catch (error) {
    logError(`Erro ao migrar resultados: ${error.message}`);
    stats.errors++;
  }
}

// Migrar avaliações
async function migrateEvaluations() {
  logInfo('Migrando avaliações...');
  
  const evaluationsDir = join(SHARED_DIR, 'evaluations');
  if (!existsSync(evaluationsDir)) {
    logWarning('Diretório evaluations não encontrado');
    return;
  }
  
  try {
    const files = readdirSync(evaluationsDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = join(evaluationsDir, file);
      const content = readFileSync(filePath, 'utf-8');
      
      const docId = basename(file, '.md');
      await setDoc(doc(collection(db, 'evaluations'), docId), {
        content,
        type: 'markdown',
        migratedAt: serverTimestamp(),
        source: 'file-system',
        originalFile: file
      });
      stats.migrated++;
      stats.collections.evaluations = (stats.collections.evaluations || 0) + 1;
    }
    
    logSuccess(`Avaliações migradas: ${stats.collections.evaluations || 0} documentos`);
  } catch (error) {
    logError(`Erro ao migrar avaliações: ${error.message}`);
    stats.errors++;
  }
}

// Migrar decisões
async function migrateDecisions() {
  logInfo('Migrando decisões...');
  
  const decisionsDir = join(SHARED_DIR, 'decisions');
  if (!existsSync(decisionsDir)) {
    logWarning('Diretório decisions não encontrado');
    return;
  }
  
  try {
    const files = readdirSync(decisionsDir).filter(f => f.endsWith('.md') || f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = join(decisionsDir, file);
      let content;
      
      if (file.endsWith('.json')) {
        content = readJSONFile(filePath);
      } else {
        content = {
          content: readFileSync(filePath, 'utf-8'),
          type: 'markdown'
        };
      }
      
      if (content) {
        const docId = basename(file, file.endsWith('.json') ? '.json' : '.md');
        await setDoc(doc(collection(db, 'decisions'), docId), {
          ...content,
          migratedAt: serverTimestamp(),
          source: 'file-system',
          originalFile: file
        });
        stats.migrated++;
        stats.collections.decisions = (stats.collections.decisions || 0) + 1;
      }
    }
    
    logSuccess(`Decisões migradas: ${stats.collections.decisions || 0} documentos`);
  } catch (error) {
    logError(`Erro ao migrar decisões: ${error.message}`);
    stats.errors++;
  }
}

// Migrar eventos
async function migrateEvents() {
  logInfo('Migrando eventos...');
  
  const eventsDir = join(SHARED_DIR, 'events');
  if (!existsSync(eventsDir)) {
    logWarning('Diretório events não encontrado');
    return;
  }
  
  try {
    const files = readdirSync(eventsDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = join(eventsDir, file);
      const content = readJSONFile(filePath);
      
      if (content) {
        const docId = basename(file, '.json');
        await setDoc(doc(collection(db, 'events'), docId), {
          ...content,
          migratedAt: serverTimestamp(),
          source: 'file-system',
          originalFile: file
        });
        stats.migrated++;
        stats.collections.events = (stats.collections.events || 0) + 1;
      }
    }
    
    logSuccess(`Eventos migrados: ${stats.collections.events || 0} documentos`);
  } catch (error) {
    logError(`Erro ao migrar eventos: ${error.message}`);
    stats.errors++;
  }
}

// Migrar implementações
async function migrateImplementations() {
  logInfo('Migrando implementações...');
  
  const implementationsDir = join(SHARED_DIR, 'implementations');
  if (!existsSync(implementationsDir)) {
    logWarning('Diretório implementations não encontrado');
    return;
  }
  
  try {
    const implDirs = readdirSync(implementationsDir).filter(f => {
      const fullPath = join(implementationsDir, f);
      return statSync(fullPath).isDirectory();
    });
    
    for (const implDir of implDirs) {
      const implPath = join(implementationsDir, implDir);
      const files = readdirSync(implPath);
      
      const implementationData = {
        id: implDir,
        migratedAt: serverTimestamp(),
        source: 'file-system'
      };
      
      for (const file of files) {
        const filePath = join(implPath, file);
        
        if (file.endsWith('.json')) {
          const data = readJSONFile(filePath);
          if (data) {
            implementationData[basename(file, '.json')] = data;
          }
        } else if (file.endsWith('.md')) {
          implementationData[basename(file, '.md')] = readFileSync(filePath, 'utf-8');
        }
      }
      
      await setDoc(doc(collection(db, 'implementations'), implDir), implementationData);
      stats.migrated++;
      stats.collections.implementations = (stats.collections.implementations || 0) + 1;
    }
    
    logSuccess(`Implementações migradas: ${stats.collections.implementations || 0} documentos`);
  } catch (error) {
    logError(`Erro ao migrar implementações: ${error.message}`);
    stats.errors++;
  }
}

// Função principal
async function migrate() {
  log('\n' + '='.repeat(60), 'bold');
  log('📦 Migração de Dados para Firestore', 'bold');
  log('='.repeat(60) + '\n', 'bold');
  
  logInfo(`Modo: ${MIGRATION_MODE === 'hybrid' ? 'Híbrido (arquivos + Firestore)' : 'Completo (apenas Firestore)'}`);
  logInfo(`Diretório: ${SHARED_DIR}\n`);
  
  // Verificar se diretório existe
  if (!existsSync(SHARED_DIR)) {
    logError(`Diretório não encontrado: ${SHARED_DIR}`);
    process.exit(1);
  }
  
  // Executar migrações
  await migrateBacklog();
  await migrateAgentResults();
  await migrateEvaluations();
  await migrateDecisions();
  await migrateEvents();
  await migrateImplementations();
  
  // Resumo
  log('\n' + '='.repeat(60), 'bold');
  log('📊 Resumo da Migração', 'bold');
  log('='.repeat(60), 'bold');
  
  log(`\n✅ Documentos migrados: ${stats.migrated}`, 'green');
  log(`❌ Erros: ${stats.errors}`, stats.errors > 0 ? 'red' : 'reset');
  
  log('\n📁 Por coleção:', 'bold');
  for (const [collection, count] of Object.entries(stats.collections)) {
    log(`   ${collection}: ${count} documentos`, 'blue');
  }
  
  log('\n' + '='.repeat(60), 'bold');
  if (stats.errors === 0) {
    logSuccess('🎉 Migração concluída com sucesso!');
    process.exit(0);
  } else {
    logWarning('⚠️  Migração concluída com alguns erros. Verifique os logs acima.');
    process.exit(1);
  }
}

// Executar
migrate().catch(error => {
  logError(`Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});

