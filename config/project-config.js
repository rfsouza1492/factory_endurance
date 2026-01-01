/**
 * Project Configuration
 * Configuração centralizada do projeto alvo do Maestro Workflow
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// WORKSPACE_ROOT: Raiz do workspace "Tasks Man"
// __dirname está em: maestro-workflow/config/
// Precisamos subir 2 níveis: ../.. = raiz do workspace "Tasks Man"
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../..');

// PROJECT_DIR: Diretório do projeto Life Goals App
// Este é o projeto que o Maestro Workflow deve analisar e trabalhar
const PROJECT_DIR = path.join(WORKSPACE_ROOT, 'Agents/life-goals-app');

// KNOWLEDGE_DIR: Base de conhecimento do projeto
const KNOWLEDGE_DIR = path.join(WORKSPACE_ROOT, 'knowledge');

// Product Manager paths
const PRODUCT_DIR = path.join(KNOWLEDGE_DIR, 'product');
const ROADMAP_PATH = path.join(PRODUCT_DIR, 'ROADMAP.md');
const BACKLOG_PATH = path.join(PRODUCT_DIR, 'BACKLOG.md');

// Architecture paths
const ARCHITECTURE_DIR = path.join(KNOWLEDGE_DIR, 'architecture');

// Implementation paths
const IMPLEMENTATION_DIR = path.join(KNOWLEDGE_DIR, 'implementation');

// Quality paths
const QUALITY_DIR = path.join(KNOWLEDGE_DIR, 'quality');

// Project structure paths
const PROJECT_SRC_DIR = path.join(PROJECT_DIR, 'src');
const PROJECT_PACKAGE_JSON = path.join(PROJECT_DIR, 'package.json');
const PROJECT_FIREBASE_JSON = path.join(PROJECT_DIR, 'firebase.json');
const PROJECT_FIRESTORE_RULES = path.join(PROJECT_DIR, 'firestore.rules');

import fs from 'fs';

/**
 * Verifica se o projeto está configurado corretamente
 */
export function validateProjectConfig() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(PROJECT_DIR)) {
    errors.push(`PROJECT_DIR não encontrado: ${PROJECT_DIR}`);
  }

  if (!fs.existsSync(PROJECT_SRC_DIR)) {
    warnings.push(`Diretório src não encontrado: ${PROJECT_SRC_DIR}`);
  }

  if (!fs.existsSync(PROJECT_PACKAGE_JSON)) {
    warnings.push(`package.json não encontrado: ${PROJECT_PACKAGE_JSON}`);
  }

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    warnings.push(`Knowledge base não encontrada: ${KNOWLEDGE_DIR}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Exporta configuração
 */
export const config = {
  WORKSPACE_ROOT,
  PROJECT_DIR,
  KNOWLEDGE_DIR,
  PRODUCT_DIR,
  ROADMAP_PATH,
  BACKLOG_PATH,
  ARCHITECTURE_DIR,
  IMPLEMENTATION_DIR,
  QUALITY_DIR,
  PROJECT_SRC_DIR,
  PROJECT_PACKAGE_JSON,
  PROJECT_FIREBASE_JSON,
  PROJECT_FIRESTORE_RULES
};

export default config;

