#!/usr/bin/env node
/**
 * Teste de Integração: Background Jobs
 * Testa execução de jobs em background
 */

import { startBackgroundJob, getJobStatus, listJobs, cancelJob } from '../../src/utils/background-jobs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Teste de Integração: Background Jobs\n');

let passedTests = 0;
let failedTests = 0;

async function runTest(name, testFunction) {
  try {
    console.log(`📋 Executando: ${name}`);
    await testFunction();
    console.log(`  ✅ ${name} passou\n`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ ${name} falhou: ${error.message}\n`);
    failedTests++;
  }
}

(async () => {
  // Teste 1: Criar job
  await runTest('Teste 1: Criar job em background', async () => {
    const result = await startBackgroundJob('workflow', {
      phase: 'all',
      env: { TEST_MODE: 'true' }
    });

    if (!result.jobId) {
      throw new Error('jobId não retornado');
    }

    if (!result.status || (result.status !== 'queued' && result.status !== 'running')) {
      throw new Error(`Status inválido: ${result.status}`);
    }

    // Aguardar um pouco para o job iniciar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se arquivo foi criado
    const jobsDir = path.join(__dirname, '../../src/shared/jobs');
    const jobDir = path.join(jobsDir, result.jobId);
    
    if (!fs.existsSync(jobDir)) {
      throw new Error('Diretório do job não foi criado');
    }

    const jobInfoPath = path.join(jobDir, 'job-info.json');
    if (!fs.existsSync(jobInfoPath)) {
      throw new Error('Arquivo job-info.json não foi criado');
    }
  });

  // Teste 2: Obter status do job
  await runTest('Teste 2: Obter status do job', async () => {
    // Criar um job primeiro
    const createResult = await startBackgroundJob('workflow', {
      phase: 'all'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const status = getJobStatus(createResult.jobId);

    if (!status) {
      throw new Error('Status do job não encontrado');
    }

    if (!status.id || status.id !== createResult.jobId) {
      throw new Error('ID do job incorreto');
    }

    if (!status.type || status.type !== 'workflow') {
      throw new Error('Tipo do job incorreto');
    }

    if (!status.status) {
      throw new Error('Status não definido');
    }
  });

  // Teste 3: Listar jobs
  await runTest('Teste 3: Listar jobs', async () => {
    // Criar alguns jobs
    await startBackgroundJob('workflow', { phase: 'all' });
    await startBackgroundJob('workflow', { phase: 'execution' });

    await new Promise(resolve => setTimeout(resolve, 500));

    const jobs = listJobs({ limitCount: 10 });

    if (!Array.isArray(jobs)) {
      throw new Error('Resultado não é um array');
    }

    if (jobs.length === 0) {
      throw new Error('Nenhum job encontrado');
    }

    // Verificar estrutura dos jobs
    const firstJob = jobs[0];
    if (!firstJob.id || !firstJob.type || !firstJob.status) {
      throw new Error('Estrutura do job inválida');
    }
  });

  // Teste 4: Filtrar jobs por status
  await runTest('Teste 4: Filtrar jobs por status', async () => {
    const queuedJobs = listJobs({ status: 'queued', limitCount: 10 });
    const runningJobs = listJobs({ status: 'running', limitCount: 10 });
    const completedJobs = listJobs({ status: 'completed', limitCount: 10 });

    // Verificar que são arrays
    if (!Array.isArray(queuedJobs) || !Array.isArray(runningJobs) || !Array.isArray(completedJobs)) {
      throw new Error('Filtros não retornam arrays');
    }

    // Verificar que todos os jobs filtrados têm o status correto
    const allQueued = queuedJobs.every(j => j.status === 'queued');
    const allRunning = runningJobs.every(j => j.status === 'running');
    const allCompleted = completedJobs.every(j => j.status === 'completed');

    if (!allQueued && queuedJobs.length > 0) {
      throw new Error('Filtro por status "queued" não funcionou');
    }

    if (!allRunning && runningJobs.length > 0) {
      throw new Error('Filtro por status "running" não funcionou');
    }

    if (!allCompleted && completedJobs.length > 0) {
      throw new Error('Filtro por status "completed" não funcionou');
    }
  });

  // Teste 5: Cancelar job (se estiver rodando)
  await runTest('Teste 5: Cancelar job', async () => {
    // Criar um job
    const createResult = await startBackgroundJob('workflow', {
      phase: 'all'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Tentar cancelar (pode não estar rodando ainda)
    const cancelResult = await cancelJob(createResult.jobId);

    // Se o job não estava rodando, o cancelamento deve retornar erro
    // Isso é esperado e não é um erro do teste
    if (cancelResult.success) {
      // Verificar se foi marcado como cancelado
      const status = getJobStatus(createResult.jobId);
      if (status && status.status !== 'cancelled') {
        throw new Error('Job não foi marcado como cancelado');
      }
    }
  });

  // Teste 6: Persistência de status
  await runTest('Teste 6: Persistência de status em arquivo', async () => {
    const createResult = await startBackgroundJob('workflow', {
      phase: 'all'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificar se arquivo foi criado
    const jobsDir = path.join(__dirname, '../../src/shared/jobs');
    const jobDir = path.join(jobsDir, createResult.jobId);
    const jobInfoPath = path.join(jobDir, 'job-info.json');

    if (!fs.existsSync(jobInfoPath)) {
      throw new Error('Arquivo de status não foi criado');
    }

    // Ler arquivo
    const jobInfo = JSON.parse(fs.readFileSync(jobInfoPath, 'utf-8'));

    if (jobInfo.id !== createResult.jobId) {
      throw new Error('ID do job no arquivo não corresponde');
    }

    if (jobInfo.type !== 'workflow') {
      throw new Error('Tipo do job no arquivo não corresponde');
    }
  });

  console.log('='.repeat(50));
  console.log(`📊 Resumo: ${passedTests} passaram, ${failedTests} falharam`);
  console.log('='.repeat(50));

  if (failedTests === 0) {
    console.log('✅ Todos os testes passaram!');
    process.exit(0);
  } else {
    console.error('❌ Alguns testes falharam.');
    process.exit(1);
  }
})();

