/**
 * Projects Manager
 * Gerencia múltiplos projetos que o Maestro pode analisar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../../..');
const PROJECTS_CONFIG_FILE = path.join(WORKSPACE_ROOT, 'maestro-workflow/config/projects.json');

/**
 * Carrega configuração de projetos
 */
export function loadProjectsConfig() {
  if (!fs.existsSync(PROJECTS_CONFIG_FILE)) {
    // Criar arquivo padrão se não existir
    const defaultConfig = {
      projects: [
        {
          id: 'life-goals-app',
          name: 'Life Goals App',
          path: 'Agents/life-goals-app',
          type: 'react-app',
          status: 'active',
          lastAnalysis: null,
          firebaseProjectId: 'planning-with-ai-fa2a3'
        }
      ],
      defaultProject: 'life-goals-app'
    };
    
    // Garantir que o diretório existe
    const configDir = path.dirname(PROJECTS_CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(PROJECTS_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  
  try {
    const content = fs.readFileSync(PROJECTS_CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao carregar configuração de projetos:', error);
    return { projects: [], defaultProject: null };
  }
}

/**
 * Salva configuração de projetos
 */
export function saveProjectsConfig(config) {
  try {
    const configDir = path.dirname(PROJECTS_CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(PROJECTS_CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração de projetos:', error);
    return false;
  }
}

/**
 * Adiciona um novo projeto
 */
export function addProject(projectData) {
  const config = loadProjectsConfig();
  
  // Verificar se projeto já existe
  if (config.projects.find(p => p.id === projectData.id)) {
    return { success: false, error: 'Projeto com este ID já existe' };
  }
  
  // Validar caminho
  const projectPath = path.join(WORKSPACE_ROOT, projectData.path);
  if (!fs.existsSync(projectPath)) {
    return { success: false, error: `Caminho do projeto não encontrado: ${projectPath}` };
  }
  
  const newProject = {
    id: projectData.id,
    name: projectData.name,
    path: projectData.path,
    type: projectData.type || 'unknown',
    status: 'active',
    lastAnalysis: null,
    firebaseProjectId: projectData.firebaseProjectId || null,
    createdAt: new Date().toISOString()
  };
  
  config.projects.push(newProject);
  
  if (saveProjectsConfig(config)) {
    return { success: true, project: newProject };
  } else {
    return { success: false, error: 'Erro ao salvar configuração' };
  }
}

/**
 * Remove um projeto
 */
export function removeProject(projectId) {
  const config = loadProjectsConfig();
  
  const index = config.projects.findIndex(p => p.id === projectId);
  if (index === -1) {
    return { success: false, error: 'Projeto não encontrado' };
  }
  
  config.projects.splice(index, 1);
  
  // Se era o projeto padrão, remover
  if (config.defaultProject === projectId) {
    config.defaultProject = config.projects.length > 0 ? config.projects[0].id : null;
  }
  
  if (saveProjectsConfig(config)) {
    return { success: true };
  } else {
    return { success: false, error: 'Erro ao salvar configuração' };
  }
}

/**
 * Define projeto padrão
 */
export function setDefaultProject(projectId) {
  const config = loadProjectsConfig();
  
  if (!config.projects.find(p => p.id === projectId)) {
    return { success: false, error: 'Projeto não encontrado' };
  }
  
  config.defaultProject = projectId;
  
  if (saveProjectsConfig(config)) {
    return { success: true };
  } else {
    return { success: false, error: 'Erro ao salvar configuração' };
  }
}

/**
 * Atualiza último análise de um projeto
 */
export function updateLastAnalysis(projectId, analysisData) {
  const config = loadProjectsConfig();
  
  const project = config.projects.find(p => p.id === projectId);
  if (!project) {
    return { success: false, error: 'Projeto não encontrado' };
  }
  
  project.lastAnalysis = {
    timestamp: new Date().toISOString(),
    score: analysisData.score || null,
    status: analysisData.status || 'completed',
    agentsRun: analysisData.agentsRun || []
  };
  
  if (saveProjectsConfig(config)) {
    return { success: true, project };
  } else {
    return { success: false, error: 'Erro ao salvar configuração' };
  }
}

/**
 * Obtém todos os projetos
 */
export function getAllProjects() {
  return loadProjectsConfig().projects;
}

/**
 * Obtém projeto por ID
 */
export function getProject(projectId) {
  const config = loadProjectsConfig();
  return config.projects.find(p => p.id === projectId) || null;
}

/**
 * Obtém projeto padrão
 */
export function getDefaultProject() {
  const config = loadProjectsConfig();
  if (config.defaultProject) {
    return config.projects.find(p => p.id === config.defaultProject) || null;
  }
  return config.projects.length > 0 ? config.projects[0] : null;
}

/**
 * Valida se um projeto existe e está acessível
 */
export function validateProject(projectId) {
  const project = getProject(projectId);
  if (!project) {
    return { valid: false, error: 'Projeto não encontrado' };
  }
  
  const projectPath = path.join(WORKSPACE_ROOT, project.path);
  if (!fs.existsSync(projectPath)) {
    return { valid: false, error: `Caminho do projeto não existe: ${projectPath}` };
  }
  
  return { valid: true, project };
}

export default {
  loadProjectsConfig,
  saveProjectsConfig,
  addProject,
  removeProject,
  setDefaultProject,
  updateLastAnalysis,
  getAllProjects,
  getProject,
  getDefaultProject,
  validateProject
};

