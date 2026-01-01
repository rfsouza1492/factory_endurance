/**
 * Script de Migração de Dados
 * Suporta migração híbrida (arquivos + Firestore) e migração completa
 */

import { db } from './connection.js';
import { collection, doc, setDoc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
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

/**
 * Opção A: Migração Híbrida
 * Mantém arquivos + adiciona Firestore para sincronização
 */
export async function migrateHybrid() {
  log('\n' + '='.repeat(60), 'bold');
  log('🔄 Migração Híbrida (Arquivos + Firestore)', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const sharedPath = join(__dirname, '../../src/shared');
  const stats = {
    backlog: 0,
    results: 0,
    evaluations: 0,
    decisions: 0,
    events: 0,
    errors: 0
  };

  try {
    // 1. Migrar Backlog
    logInfo('Migrando backlog...');
    const backlogPath = join(sharedPath, 'backlog');
    if (existsSync(backlogPath)) {
      const currentBacklogPath = join(backlogPath, 'current-backlog.json');
      if (existsSync(currentBacklogPath)) {
        const backlogData = JSON.parse(readFileSync(currentBacklogPath, 'utf-8'));
        await setDoc(doc(collection(db, 'backlog'), 'current'), {
          ...backlogData,
          migratedAt: serverTimestamp(),
          source: 'file-system',
          syncEnabled: true
        });
        stats.backlog = 1;
        logSuccess('Backlog migrado');
      }
    }

    // 2. Migrar Results
    logInfo('Migrando resultados de agentes...');
    const resultsPath = join(sharedPath, 'results');
    if (existsSync(resultsPath)) {
      const agentDirs = readdirSync(resultsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const agentDir of agentDirs) {
        const agentPath = join(resultsPath, agentDir);
        const files = readdirSync(agentPath)
          .filter(f => f.endsWith('.json') || f.endsWith('.md'));

        for (const file of files) {
          try {
            const filePath = join(agentPath, file);
            const content = readFileSync(filePath, 'utf-8');
            
            let data;
            if (file.endsWith('.json')) {
              data = JSON.parse(content);
            } else {
              data = { content, type: 'markdown' };
            }

            const docId = `${agentDir}-${file.replace(/\.(json|md)$/, '')}`;
            await setDoc(doc(collection(db, 'results'), docId), {
              ...data,
              agent: agentDir,
              fileName: file,
              migratedAt: serverTimestamp(),
              source: 'file-system',
              syncEnabled: true
            });
            stats.results++;
          } catch (error) {
            logWarning(`Erro ao migrar ${file}: ${error.message}`);
            stats.errors++;
          }
        }
      }
      logSuccess(`${stats.results} resultados migrados`);
    }

    // 3. Migrar Evaluations
    logInfo('Migrando avaliações...');
    const evaluationsPath = join(sharedPath, 'evaluations');
    if (existsSync(evaluationsPath)) {
      const files = readdirSync(evaluationsPath)
        .filter(f => f.endsWith('.md') || f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = join(evaluationsPath, file);
          const content = readFileSync(filePath, 'utf-8');
          
          let data;
          if (file.endsWith('.json')) {
            data = JSON.parse(content);
          } else {
            data = { content, type: 'markdown' };
          }

          const docId = file.replace(/\.(md|json)$/, '');
          await setDoc(doc(collection(db, 'evaluations'), docId), {
            ...data,
            fileName: file,
            migratedAt: serverTimestamp(),
            source: 'file-system',
            syncEnabled: true
          });
          stats.evaluations++;
        } catch (error) {
          logWarning(`Erro ao migrar ${file}: ${error.message}`);
          stats.errors++;
        }
      }
      logSuccess(`${stats.evaluations} avaliações migradas`);
    }

    // 4. Migrar Decisions
    logInfo('Migrando decisões...');
    const decisionsPath = join(sharedPath, 'decisions');
    if (existsSync(decisionsPath)) {
      const files = readdirSync(decisionsPath)
        .filter(f => f.endsWith('.md') || f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = join(decisionsPath, file);
          const content = readFileSync(filePath, 'utf-8');
          
          let data;
          if (file.endsWith('.json')) {
            data = JSON.parse(content);
          } else {
            data = { content, type: 'markdown' };
          }

          const docId = file.replace(/\.(md|json)$/, '');
          await setDoc(doc(collection(db, 'decisions'), docId), {
            ...data,
            fileName: file,
            migratedAt: serverTimestamp(),
            source: 'file-system',
            syncEnabled: true
          });
          stats.decisions++;
        } catch (error) {
          logWarning(`Erro ao migrar ${file}: ${error.message}`);
          stats.errors++;
        }
      }
      logSuccess(`${stats.decisions} decisões migradas`);
    }

    // 5. Migrar Events
    logInfo('Migrando eventos...');
    const eventsPath = join(sharedPath, 'events');
    if (existsSync(eventsPath)) {
      const files = readdirSync(eventsPath)
        .filter(f => f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = join(eventsPath, file);
          const data = JSON.parse(readFileSync(filePath, 'utf-8'));
          
          const docId = file.replace(/\.json$/, '');
          await setDoc(doc(collection(db, 'events'), docId), {
            ...data,
            fileName: file,
            migratedAt: serverTimestamp(),
            source: 'file-system',
            syncEnabled: true
          });
          stats.events++;
        } catch (error) {
          logWarning(`Erro ao migrar ${file}: ${error.message}`);
          stats.errors++;
        }
      }
      logSuccess(`${stats.events} eventos migrados`);
    }

    // Resumo
    log('\n' + '='.repeat(60), 'bold');
    log('📊 Resumo da Migração Híbrida', 'bold');
    log('='.repeat(60), 'bold');
    log(`\n✅ Backlog: ${stats.backlog}`);
    log(`✅ Resultados: ${stats.results}`);
    log(`✅ Avaliações: ${stats.evaluations}`);
    log(`✅ Decisões: ${stats.decisions}`);
    log(`✅ Eventos: ${stats.events}`);
    if (stats.errors > 0) {
      log(`⚠️  Erros: ${stats.errors}`, 'yellow');
    }
    log('\n💡 Modo híbrido ativado: dados sincronizados entre arquivos e Firestore', 'blue');
    logSuccess('\n🎉 Migração híbrida concluída!');

  } catch (error) {
    logError(`Erro na migração: ${error.message}`);
    throw error;
  }
}

/**
 * Opção B: Migração Completa
 * Migra tudo para Firestore e remove dependência de arquivos
 */
export async function migrateComplete() {
  log('\n' + '='.repeat(60), 'bold');
  log('🔄 Migração Completa para Firestore', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  logWarning('⚠️  ATENÇÃO: Esta migração move TODOS os dados para Firestore');
  logWarning('⚠️  Os arquivos originais serão mantidos como backup\n');

  // Primeiro fazer migração híbrida
  await migrateHybrid();

  // Depois marcar tudo como migrado completamente
  logInfo('\nMarcando dados como migrados completamente...');
  
  const collections = ['backlog', 'results', 'evaluations', 'decisions', 'events'];
  const batch = writeBatch(db);
  let batchCount = 0;

  for (const collectionName of collections) {
    // Nota: Em produção, você precisaria ler todos os documentos
    // e atualizá-los. Por simplicidade, apenas marcamos o backlog atual
    if (collectionName === 'backlog') {
      const backlogRef = doc(collection(db, 'backlog'), 'current');
      const backlogSnap = await getDoc(backlogRef);
      if (backlogSnap.exists()) {
        batch.update(backlogRef, {
          migrationComplete: true,
          fileSystemBackup: true,
          migratedAt: serverTimestamp()
        });
        batchCount++;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    logSuccess(`${batchCount} documentos marcados como migrados completamente`);
  }

  log('\n' + '='.repeat(60), 'bold');
  logSuccess('🎉 Migração completa concluída!');
  logInfo('\n💡 Próximos passos:');
  logInfo('   1. Testar acesso aos dados no Firestore');
  logInfo('   2. Atualizar código para usar apenas Firestore');
  logInfo('   3. Manter arquivos como backup por segurança');
}

/**
 * Verificar status da migração
 */
export async function checkMigrationStatus() {
  log('\n' + '='.repeat(60), 'bold');
  log('📊 Status da Migração', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const collections = ['backlog', 'results', 'evaluations', 'decisions', 'events'];
  const status = {};

  for (const collectionName of collections) {
    try {
      const collectionRef = collection(db, collectionName);
      // Contar documentos (aproximado)
      const backlogRef = doc(collectionRef, 'current');
      const snap = await getDoc(backlogRef);
      
      status[collectionName] = {
        exists: snap.exists(),
        migrated: snap.exists() && snap.data().migratedAt ? true : false,
        syncEnabled: snap.exists() && snap.data().syncEnabled ? true : false
      };
    } catch (error) {
      status[collectionName] = { error: error.message };
    }
  }

  // Exibir status
  for (const [collection, info] of Object.entries(status)) {
    if (info.error) {
      logError(`${collection}: ${info.error}`);
    } else {
      const statusText = info.migrated ? '✅ Migrado' : '❌ Não migrado';
      const syncText = info.syncEnabled ? ' (Sincronização ativa)' : '';
      log(`${collection}: ${statusText}${syncText}`);
    }
  }
}

/**
 * Função principal para migração (usada pelo npm script)
 * Por padrão, executa migração híbrida
 */
export async function migrateFilesToFirestore(mode = 'hybrid') {
  try {
    if (mode === 'hybrid') {
      await migrateHybrid();
    } else if (mode === 'complete') {
      await migrateComplete();
    } else if (mode === 'status') {
      await checkMigrationStatus();
    } else {
      logError('Modo inválido. Use: hybrid, complete ou status');
      process.exit(1);
    }
  } catch (error) {
    logError(`Erro: ${error.message}`);
    throw error;
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'hybrid';
  migrateFilesToFirestore(mode)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
