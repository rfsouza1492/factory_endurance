/**
 * Dashboard com Integração Firestore
 * Substitui polling por atualizações em tempo real
 */

import { firestoreManager, integrateWithDashboard } from './firestore-integration.js';

// Estado global do dashboard
let dashboardState = {
  workflowStatus: 'pending',
  agents: {},
  scores: {},
  decisions: [],
  backlog: [],
  approvals: [],
  activities: [],
  progress: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Dashboard com Firestore...');
  
  // Integrar com Firestore
  integrateWithDashboard(dashboardState);
  
  // Inicializar UI
  initializeUI();
  
  // Mostrar status de conexão
  showConnectionStatus();
});

/**
 * Inicializar UI
 */
function initializeUI() {
  // Substituir funções de polling por listeners do Firestore
  // O Firestore já está escutando mudanças em tempo real
  
  // Atualizar UI periodicamente (apenas para animações, não para dados)
  setInterval(() => {
    updateUI();
  }, 1000);
}

/**
 * Atualizar UI com dados do estado
 */
function updateUI() {
  // Atualizar backlog
  updateBacklogDisplay();
  
  // Atualizar agentes
  updateAgentsDisplay();
  
  // Atualizar progresso
  updateProgressDisplay();
  
  // Atualizar atividades
  updateActivitiesDisplay();
}

/**
 * Atualizar display do backlog
 */
function updateBacklogDisplay() {
  const backlogElement = document.getElementById('backlog-list');
  if (!backlogElement || !dashboardState.backlog) return;

  backlogElement.innerHTML = dashboardState.backlog
    .map(item => `
      <div class="backlog-item">
        <h4>${item.title || item.text || 'Item sem título'}</h4>
        <p>${item.description || ''}</p>
        <span class="badge">${item.priority || 'medium'}</span>
      </div>
    `)
    .join('');
}

/**
 * Atualizar display dos agentes
 */
function updateAgentsDisplay() {
  const agentsElement = document.getElementById('agents-list');
  if (!agentsElement || !dashboardState.agents) return;

  const agentsList = Object.entries(dashboardState.agents)
    .map(([agentName, results]) => {
      const latestResult = results[0];
      return `
        <div class="agent-card">
          <h4>${agentName}</h4>
          <p>Último resultado: ${latestResult ? new Date(latestResult.processedAt).toLocaleString() : 'N/A'}</p>
          ${latestResult && latestResult.result ? `
            <div class="score">Score: ${latestResult.result.score || 'N/A'}</div>
          ` : ''}
        </div>
      `;
    })
    .join('');

  agentsElement.innerHTML = agentsList;
}

/**
 * Atualizar display do progresso
 */
function updateProgressDisplay() {
  const progressElement = document.getElementById('workflow-progress');
  if (!progressElement || !dashboardState.progress) return;

  const progress = dashboardState.progress;
  progressElement.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${progress.percentage || 0}%"></div>
    </div>
    <p>Status: ${progress.status || 'unknown'}</p>
    <p>Etapa atual: ${progress.currentStep || 'N/A'}</p>
  `;
}

/**
 * Atualizar display de atividades
 */
function updateActivitiesDisplay() {
  const activitiesElement = document.getElementById('activities-list');
  if (!activitiesElement || !dashboardState.activities) return;

  activitiesElement.innerHTML = dashboardState.activities
    .slice(0, 10) // Mostrar apenas os 10 mais recentes
    .map(activity => `
      <div class="activity-item">
        <span class="activity-time">${new Date(activity.migratedAt || activity.timestamp).toLocaleString()}</span>
        <span class="activity-type">${activity.type || 'event'}</span>
        <span class="activity-description">${activity.description || activity.content || ''}</span>
      </div>
    `)
    .join('');
}

/**
 * Mostrar status de conexão
 */
function showConnectionStatus() {
  const statusElement = document.getElementById('connection-status');
  if (!statusElement) return;

  // Verificar conexão
  firestoreManager.subscribeToBacklog((backlog, error) => {
    if (error) {
      statusElement.innerHTML = `
        <div class="status-indicator error">
          ❌ Erro de conexão: ${error.message}
        </div>
      `;
    } else {
      statusElement.innerHTML = `
        <div class="status-indicator success">
          ✅ Conectado ao Firestore
        </div>
      `;
    }
  });
}

/**
 * Função para executar workflow (mantida para compatibilidade)
 */
async function runWorkflow() {
  console.log('🚀 Executando workflow...');
  
  // Atualizar status
  dashboardState.workflowStatus = 'running';
  updateUI();
  
  // Aqui você chamaria a Cloud Function ou API para executar o workflow
  // Por exemplo:
  // const result = await callCloudFunction('processAgent', { agentName: 'architecture-agent', inputData: {} });
  
  console.log('✅ Workflow executado');
}

// Exportar para uso global
window.dashboardState = dashboardState;
window.runWorkflow = runWorkflow;

// Limpar listeners ao sair
window.addEventListener('beforeunload', () => {
  firestoreManager.unsubscribeAll();
});

