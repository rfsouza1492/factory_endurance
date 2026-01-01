/**
 * Firebase Migration Helper
 * Helper para migrar dados do sistema de arquivos para Firestore
 * Suporta migração híbrida (mantém arquivos) ou completa
 */

import { db } from './connection.js';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHARED_DIR = path.join(__dirname, '..', 'shared');
const RESULTS_DIR = path.join(SHARED_DIR, 'results');
const BACKLOG_DIR = path.join(SHARED_DIR, 'backlog');
const EVALUATIONS_DIR = path.join(SHARED_DIR, 'evaluations');
const DECISIONS_DIR = path.join(SHARED_DIR, 'decisions');
const EVENTS_DIR = path.join(SHARED_DIR, 'events');

/**
 * Migra backlog do sistema de arquivos para Firestore
 */
export async function migrateBacklog(hybrid = true) {
  console.log('📦 Migrando backlog...');
  
  try {
    const backlogFile = path.join(BACKLOG_DIR, 'current-backlog.json');
    const fileExists = await fs.access(backlogFile).then(() => true).catch(() => false);
    
    if (!fileExists) {
      console.log('⚠️  Arquivo de backlog não encontrado');
      return false;
    }
    
    const backlogData = JSON.parse(await fs.readFile(backlogFile, 'utf-8'));
    
    // Salvar no Firestore
    const backlogRef = doc(collection(db, 'backlog'), 'current');
    await setDoc(backlogRef, {
      ...backlogData,
      migratedAt: serverTimestamp(),
      migratedFrom: 'file-system'
    });
    
    console.log('✅ Backlog migrado para Firestore');
    
    if (!hybrid) {
      // Remover arquivo se migração completa
      await fs.unlink(backlogFile);
      console.log('🗑️  Arquivo de backlog removido');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao migrar backlog:', error);
    return false;
  }
}

/**
 * Migra resultados de agentes para Firestore
 */
export async function migrateAgentResults(agentName, hybrid = true) {
  console.log(`📦 Migrando resultados do ${agentName}...`);
  
  try {
    const agentDir = path.join(RESULTS_DIR, agentName);
    const dirExists = await fs.access(agentDir).then(() => true).catch(() => false);
    
    if (!dirExists) {
      console.log(`⚠️  Diretório do ${agentName} não encontrado`);
      return 0;
    }
    
    const files = await fs.readdir(agentDir);
    const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.json'));
    
    let migrated = 0;
    
    for (const file of mdFiles) {
      try {
        const filePath = path.join(agentDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extrair timestamp do nome do arquivo ou usar data de modificação
        const stats = await fs.stat(filePath);
        const timestamp = file.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0] || 
                         stats.mtime.toISOString().replace(/[:.]/g, '-');
        
        // Criar documento no Firestore
        const docId = `${agentName}-${timestamp}`;
        const resultRef = doc(collection(db, 'results'), docId);
        
        await setDoc(resultRef, {
          agent: agentName,
          content: content,
          filename: file,
          migratedAt: serverTimestamp(),
          migratedFrom: 'file-system',
          fileModifiedAt: stats.mtime.toISOString()
        });
        
        migrated++;
        
        if (!hybrid) {
          await fs.unlink(filePath);
        }
      } catch (error) {
        console.error(`⚠️  Erro ao migrar ${file}:`, error.message);
      }
    }
    
    console.log(`✅ ${migrated} resultados do ${agentName} migrados`);
    return migrated;
  } catch (error) {
    console.error(`❌ Erro ao migrar resultados do ${agentName}:`, error);
    return 0;
  }
}

/**
 * Migra todas as avaliações
 */
export async function migrateEvaluations(hybrid = true) {
  console.log('📦 Migrando avaliações...');
  
  try {
    const dirExists = await fs.access(EVALUATIONS_DIR).then(() => true).catch(() => false);
    if (!dirExists) {
      console.log('⚠️  Diretório de avaliações não encontrado');
      return 0;
    }
    
    const files = await fs.readdir(EVALUATIONS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    let migrated = 0;
    
    for (const file of mdFiles) {
      try {
        const filePath = path.join(EVALUATIONS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extrair ID do nome do arquivo
        const docId = file.replace('.md', '');
        const evalRef = doc(collection(db, 'evaluations'), docId);
        
        await setDoc(evalRef, {
          content: content,
          filename: file,
          migratedAt: serverTimestamp(),
          migratedFrom: 'file-system'
        });
        
        migrated++;
        
        if (!hybrid) {
          await fs.unlink(filePath);
        }
      } catch (error) {
        console.error(`⚠️  Erro ao migrar ${file}:`, error.message);
      }
    }
    
    console.log(`✅ ${migrated} avaliações migradas`);
    return migrated;
  } catch (error) {
    console.error('❌ Erro ao migrar avaliações:', error);
    return 0;
  }
}

/**
 * Migra todas as decisões
 */
export async function migrateDecisions(hybrid = true) {
  console.log('📦 Migrando decisões...');
  
  try {
    const dirExists = await fs.access(DECISIONS_DIR).then(() => true).catch(() => false);
    if (!dirExists) {
      console.log('⚠️  Diretório de decisões não encontrado');
      return 0;
    }
    
    const files = await fs.readdir(DECISIONS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    let migrated = 0;
    
    for (const file of mdFiles) {
      try {
        const filePath = path.join(DECISIONS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const docId = file.replace('.md', '');
        const decisionRef = doc(collection(db, 'decisions'), docId);
        
        await setDoc(decisionRef, {
          content: content,
          filename: file,
          migratedAt: serverTimestamp(),
          migratedFrom: 'file-system'
        });
        
        migrated++;
        
        if (!hybrid) {
          await fs.unlink(filePath);
        }
      } catch (error) {
        console.error(`⚠️  Erro ao migrar ${file}:`, error.message);
      }
    }
    
    console.log(`✅ ${migrated} decisões migradas`);
    return migrated;
  } catch (error) {
    console.error('❌ Erro ao migrar decisões:', error);
    return 0;
  }
}

/**
 * Migração completa (híbrida ou total)
 */
export async function migrateAll(hybrid = true) {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Iniciando migração ${hybrid ? 'HÍBRIDA' : 'COMPLETA'} para Firestore`);
  console.log('='.repeat(60) + '\n');
  
  const results = {
    backlog: false,
    architecture: 0,
    codeQuality: 0,
    documentAnalysis: 0,
    evaluations: 0,
    decisions: 0
  };
  
  // Migrar backlog
  results.backlog = await migrateBacklog(hybrid);
  
  // Migrar resultados de agentes
  results.architecture = await migrateAgentResults('architecture-review', hybrid);
  results.codeQuality = await migrateAgentResults('code-quality-review', hybrid);
  results.documentAnalysis = await migrateAgentResults('document-analysis', hybrid);
  
  // Migrar avaliações e decisões
  results.evaluations = await migrateEvaluations(hybrid);
  results.decisions = await migrateDecisions(hybrid);
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 Resumo da Migração');
  console.log('='.repeat(60));
  console.log(`Backlog: ${results.backlog ? '✅' : '❌'}`);
  console.log(`Resultados Architecture: ${results.architecture}`);
  console.log(`Resultados Code Quality: ${results.codeQuality}`);
  console.log(`Resultados Document Analysis: ${results.documentAnalysis}`);
  console.log(`Avaliações: ${results.evaluations}`);
  console.log(`Decisões: ${results.decisions}`);
  console.log(`\nModo: ${hybrid ? 'Híbrido (arquivos mantidos)' : 'Completo (arquivos removidos)'}`);
  console.log('='.repeat(60) + '\n');
  
  return results;
}

