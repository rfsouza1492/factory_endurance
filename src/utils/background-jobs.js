/**
 * Background Jobs Manager
 * Gerencia execução de workflows em background
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JOBS_DIR = path.join(__dirname, '../../src/shared/jobs');
const MAX_CONCURRENT_JOBS = 3;

// Gerenciar jobs ativos
const activeJobs = new Map();

/**
 * Inicia um job em background
 * @param {string} jobType - Tipo do job ('workflow', 'implementation', etc.)
 * @param {Object} options - Opções do job
 * @returns {Promise<{jobId: string, status: string}>}
 */
export async function startBackgroundJob(jobType, options = {}) {
  const jobId = `${jobType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const jobDir = path.join(JOBS_DIR, jobId);

  // Criar diretório do job
  if (!fs.existsSync(JOBS_DIR)) {
    fs.mkdirSync(JOBS_DIR, { recursive: true });
  }
  fs.mkdirSync(jobDir, { recursive: true });

  const jobInfo = {
    id: jobId,
    type: jobType,
    status: 'queued',
    startedAt: new Date().toISOString(),
    options,
    output: [],
    error: null,
    exitCode: null
  };

  // Salvar info do job
  fs.writeFileSync(
    path.join(jobDir, 'job-info.json'),
    JSON.stringify(jobInfo, null, 2),
    'utf-8'
  );

  // Verificar se há espaço para novo job
  const runningJobs = Array.from(activeJobs.values()).filter(j => j.status === 'running');
  if (runningJobs.length >= MAX_CONCURRENT_JOBS) {
    jobInfo.status = 'queued';
    activeJobs.set(jobId, jobInfo);
    return { jobId, status: 'queued', message: 'Job adicionado à fila' };
  }

  // Executar job
  await executeJob(jobId, jobType, options, jobDir);

  return { jobId, status: jobInfo.status };
}

/**
 * Executa um job
 */
async function executeJob(jobId, jobType, options, jobDir) {
  const jobInfo = activeJobs.get(jobId) || {
    id: jobId,
    type: jobType,
    status: 'running',
    startedAt: new Date().toISOString(),
    options,
    output: [],
    error: null,
    exitCode: null
  };

  jobInfo.status = 'running';
  activeJobs.set(jobId, jobInfo);

  try {
    let command;
    let args = [];

    switch (jobType) {
      case 'workflow':
        command = 'node';
        args = [
          path.join(__dirname, '../scripts/run-workflow.js'),
          '--skip-approval'
        ];
        if (options.phase) {
          args.push(`--phase=${options.phase}`);
        }
        break;

      case 'implementation':
        command = 'node';
        args = [
          path.join(__dirname, '../agents/implementation-agent.js')
        ];
        break;

      default:
        throw new Error(`Tipo de job não suportado: ${jobType}`);
    }

    const proc = spawn(command, args, {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const outputFile = path.join(jobDir, 'output.log');
    const errorFile = path.join(jobDir, 'error.log');
    const outputStream = fs.createWriteStream(outputFile);
    const errorStream = fs.createWriteStream(errorFile);

    proc.stdout.on('data', (data) => {
      const line = data.toString();
      jobInfo.output.push({
        timestamp: new Date().toISOString(),
        line
      });
      outputStream.write(line);
      
      // Limitar output a 1000 linhas
      if (jobInfo.output.length > 1000) {
        jobInfo.output.shift();
      }
    });

    proc.stderr.on('data', (data) => {
      const line = data.toString();
      errorStream.write(line);
    });

    proc.on('close', (code) => {
      jobInfo.status = code === 0 ? 'completed' : 'failed';
      jobInfo.exitCode = code;
      jobInfo.completedAt = new Date().toISOString();

      outputStream.end();
      errorStream.end();

      // Salvar info final
      fs.writeFileSync(
        path.join(jobDir, 'job-info.json'),
        JSON.stringify(jobInfo, null, 2),
        'utf-8'
      );

      activeJobs.set(jobId, jobInfo);

      // Processar próximo job na fila
      processNextQueuedJob();
    });

    proc.on('error', (error) => {
      jobInfo.status = 'failed';
      jobInfo.error = error.message;
      jobInfo.completedAt = new Date().toISOString();

      errorStream.end();
      outputStream.end();

      fs.writeFileSync(
        path.join(jobDir, 'job-info.json'),
        JSON.stringify(jobInfo, null, 2),
        'utf-8'
      );

      activeJobs.set(jobId, jobInfo);
      processNextQueuedJob();
    });

  } catch (error) {
    jobInfo.status = 'failed';
    jobInfo.error = error.message;
    jobInfo.completedAt = new Date().toISOString();

    fs.writeFileSync(
      path.join(jobDir, 'job-info.json'),
      JSON.stringify(jobInfo, null, 2),
      'utf-8'
    );

    activeJobs.set(jobId, jobInfo);
  }
}

/**
 * Processa próximo job na fila
 */
function processNextQueuedJob() {
  const queuedJobs = Array.from(activeJobs.values())
    .filter(j => j.status === 'queued')
    .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

  if (queuedJobs.length === 0) return;

  const runningJobs = Array.from(activeJobs.values()).filter(j => j.status === 'running');
  if (runningJobs.length >= MAX_CONCURRENT_JOBS) return;

  const nextJob = queuedJobs[0];
  const jobDir = path.join(JOBS_DIR, nextJob.id);
  executeJob(nextJob.id, nextJob.type, nextJob.options, jobDir);
}

/**
 * Obtém status de um job
 * @param {string} jobId - ID do job
 * @returns {Object | null}
 */
export function getJobStatus(jobId) {
  const jobInfo = activeJobs.get(jobId);
  if (jobInfo) {
    return {
      id: jobInfo.id,
      type: jobInfo.type,
      status: jobInfo.status,
      startedAt: jobInfo.startedAt,
      completedAt: jobInfo.completedAt,
      exitCode: jobInfo.exitCode,
      error: jobInfo.error,
      outputLines: jobInfo.output.length
    };
  }

  // Tentar carregar do arquivo
  const jobDir = path.join(JOBS_DIR, jobId);
  const jobInfoPath = path.join(jobDir, 'job-info.json');
  
  if (fs.existsSync(jobInfoPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(jobInfoPath, 'utf-8'));
      return {
        id: saved.id,
        type: saved.type,
        status: saved.status,
        startedAt: saved.startedAt,
        completedAt: saved.completedAt,
        exitCode: saved.exitCode,
        error: saved.error,
        outputLines: saved.output?.length || 0
      };
    } catch (error) {
      return null;
    }
  }

  return null;
}

/**
 * Lista todos os jobs
 * @param {Object} options - Opções (status, limit)
 * @returns {Array}
 */
export function listJobs(options = {}) {
  const { status = null, limitCount = 50 } = options;
  
  let jobs = Array.from(activeJobs.values());

  // Adicionar jobs salvos em arquivo
  if (fs.existsSync(JOBS_DIR)) {
    const jobDirs = fs.readdirSync(JOBS_DIR).filter(dir => {
      const dirPath = path.join(JOBS_DIR, dir);
      return fs.statSync(dirPath).isDirectory();
    });

    jobDirs.forEach(jobId => {
      if (!activeJobs.has(jobId)) {
        const jobInfoPath = path.join(JOBS_DIR, jobId, 'job-info.json');
        if (fs.existsSync(jobInfoPath)) {
          try {
            const saved = JSON.parse(fs.readFileSync(jobInfoPath, 'utf-8'));
            jobs.push(saved);
          } catch (error) {
            // Ignorar erros
          }
        }
      }
    });
  }

  // Filtrar por status
  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }

  // Ordenar por data (mais recente primeiro)
  jobs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  // Limitar
  return jobs.slice(0, limitCount);
}

/**
 * Cancela um job
 * @param {string} jobId - ID do job
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export async function cancelJob(jobId) {
  const jobInfo = activeJobs.get(jobId);
  
  if (!jobInfo) {
    return { success: false, error: 'Job não encontrado' };
  }

  if (jobInfo.status !== 'running') {
    return { success: false, error: 'Job não está em execução' };
  }

  // TODO: Implementar cancelamento do processo
  // Por enquanto, apenas marcar como cancelado
  jobInfo.status = 'cancelled';
  jobInfo.cancelledAt = new Date().toISOString();

  const jobDir = path.join(JOBS_DIR, jobId);
  fs.writeFileSync(
    path.join(jobDir, 'job-info.json'),
    JSON.stringify(jobInfo, null, 2),
    'utf-8'
  );

  activeJobs.set(jobId, jobInfo);

  return { success: true, error: null };
}

