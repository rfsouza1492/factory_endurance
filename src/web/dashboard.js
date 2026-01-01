/**
 * Maestro Dashboard - JavaScript
 * Gerencia toda a lógica do dashboard
 */

// Estado global
let dashboardState = {
    workflowStatus: 'pending',
    agents: [],
    scores: {},
    decisions: [],
    backlog: [],
    approvals: [],
    activities: [],
    progress: null,
    lastProgressState: null // Para rastrear mudanças de estado
};

// Rastreamento de aprovações em andamento para prevenir múltiplos cliques
const pendingApprovals = new Set();

// Referências dos gráficos Chart.js
let charts = {
    scoresChart: null,
    issuesChart: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    startPolling();
    
    // Adicionar event listener ao botão de executar workflow
    const runWorkflowBtn = document.getElementById('runWorkflowBtn');
    if (runWorkflowBtn) {
        runWorkflowBtn.addEventListener('click', runWorkflow);
    }
});

// Inicializar dashboard
async function initializeDashboard() {
    try {
        await Promise.all([
            loadWorkflowStatus(),
            loadProgress(),
            loadAgents(),
            loadScores(),
            loadDecisions(),
            loadBacklog(),
            loadApprovals(),
            loadActivities()
        ]);
        
        renderDashboard();
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        showError('Erro ao carregar dados do dashboard');
    }
}

// Carregar progresso do workflow
async function loadProgress() {
    try {
        const response = await fetch('/api/progress');
        const data = await response.json();
        if (data.success && data.progress) {
            dashboardState.progress = data.progress;
        }
        return data;
    } catch (error) {
        console.error('Erro ao carregar progresso:', error);
        return null;
    }
}

// Carregar status do workflow
async function loadWorkflowStatus() {
    try {
        // Usar /api/progress que tem informações mais completas
        const response = await fetch('/api/progress');
        const data = await response.json();
        if (data.success && data.progress) {
            dashboardState.workflowStatus = data.progress.workflowStatus || 'pending';
            dashboardState.currentPhase = data.progress.currentPhase || 0;
        } else {
            // Fallback para /api/status
            const statusResponse = await fetch('/api/status');
            const statusData = await statusResponse.json();
            dashboardState.workflowStatus = statusData.status || 'pending';
            dashboardState.currentPhase = statusData.currentPhase || 0;
        }
        return data;
    } catch (error) {
        console.error('Erro ao carregar status:', error);
        dashboardState.workflowStatus = 'pending';
        dashboardState.currentPhase = 0;
        return null;
    }
}

// Carregar agentes
async function loadAgents() {
    try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        dashboardState.agents = data.agents || [];
        return data;
    } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        // Fallback: criar agentes padrão
        dashboardState.agents = [
            { name: 'Architecture', icon: '🏗️', status: 'complete', score: 60, issues: 6 },
            { name: 'Code Quality', icon: '✅', status: 'complete', score: 90, issues: 2 },
            { name: 'Document Analysis', icon: '📚', status: 'complete', score: 73, issues: 3 },
            { name: 'Security', icon: '🔒', status: 'complete', score: 80, issues: 0 },
            { name: 'Performance', icon: '⚡', status: 'complete', score: 100, issues: 0 },
            { name: 'Dependency', icon: '📦', status: 'complete', score: 80, issues: 0 }
        ];
        return { agents: dashboardState.agents };
    }
}

// Carregar scores
async function loadScores() {
    try {
        const response = await fetch('/api/scores');
        const data = await response.json();
        dashboardState.scores = data.scores || {};
        return data;
    } catch (error) {
        console.error('Erro ao carregar scores:', error);
        // Fallback: scores padrão
        dashboardState.scores = {
            overall: 75,
            architecture: 60,
            codeQuality: 90,
            documentation: 73,
            security: 80,
            performance: 100,
            dependency: 80
        };
        return { scores: dashboardState.scores };
    }
}

// Carregar decisões
async function loadDecisions() {
    try {
        const response = await fetch('/api/decisions');
        const data = await response.json();
        dashboardState.decisions = data.decisions || [];
        return data;
    } catch (error) {
        console.error('Erro ao carregar decisões:', error);
        return { decisions: [] };
    }
}

// Carregar backlog
async function loadBacklog() {
    try {
        const response = await fetch('/api/backlog');
        const data = await response.json();
        dashboardState.backlog = data.tasks || [];
        return data;
    } catch (error) {
        console.error('Erro ao carregar backlog:', error);
        return { tasks: [] };
    }
}

// Carregar aprovações
async function loadApprovals() {
    try {
        const response = await fetch('/api/approvals/pending');
        const data = await response.json();
        dashboardState.approvals = data.approvals || [];
        updateNotificationBadge(data.approvals.length);
        return data;
    } catch (error) {
        console.error('Erro ao carregar aprovações:', error);
        return { approvals: [] };
    }
}

// Carregar atividades
async function loadActivities() {
    try {
        const response = await fetch('/api/activities');
        const data = await response.json();
        dashboardState.activities = data.activities || [];
        return data;
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        return { activities: [] };
    }
}

// Renderizar dashboard
function renderDashboard() {
    renderProgress();
    renderStatusCards();
    renderScoreCards();
    renderTimeline();
    renderAgents();
    renderBacklog();
    renderDecisions();
    renderCharts();
    renderApprovals();
    renderActivities();
}

// Renderizar progresso do workflow
function renderProgress() {
    const progressContainer = document.getElementById('workflowProgress');
    if (!progressContainer || !dashboardState.progress) {
        if (progressContainer) {
            progressContainer.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">Nenhum workflow em execução</p>';
        }
        return;
    }

    const progress = dashboardState.progress;
    const phases = progress.phases || {};

    let html = '';

    // Fase 1: Execução dos Agentes
    if (phases.execution) {
        const execPhase = phases.execution;
        const agents = execPhase.agents || {};
        const agentCount = Object.keys(agents).length;
        const completedAgents = Object.values(agents).filter(a => a.status === 'complete').length;
        
        html += `
            <div class="progress-bar-container">
                <div class="progress-bar-header">
                    <span class="progress-bar-label">${execPhase.name || 'Execução dos Agentes'}</span>
                    <span class="progress-bar-percentage">${execPhase.progress || 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill ${execPhase.status || 'pending'}" style="width: ${execPhase.progress || 0}%"></div>
                </div>
                <div class="agent-progress">
        `;

        Object.entries(agents).forEach(([key, agent]) => {
            const status = agent.status || 'pending';
            const agentProgress = agent.progress || 0;
            html += `
                <div class="agent-progress-item">
                    <div class="agent-progress-label">
                        <span class="agent-progress-name">${agent.name || key}</span>
                        <span class="agent-progress-status ${status}">${status === 'running' ? '🔄 Executando' : status === 'complete' ? '✅ Completo' : '⏳ Pendente'}</span>
                    </div>
                    <div class="agent-progress-bar">
                        <div class="agent-progress-bar-fill ${status}" style="width: ${agentProgress}%"></div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Fase 2: Avaliação Cruzada
    if (phases.evaluation) {
        const evalPhase = phases.evaluation;
        html += `
            <div class="progress-bar-container">
                <div class="progress-bar-header">
                    <span class="progress-bar-label">${evalPhase.name || 'Avaliação Cruzada'}</span>
                    <span class="progress-bar-percentage">${evalPhase.progress || 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill ${evalPhase.status || 'pending'}" style="width: ${evalPhase.progress || 0}%"></div>
                </div>
            </div>
        `;
    }

    // Fase 3: Decisão Go/No-go
    if (phases.decision) {
        const decisionPhase = phases.decision;
        html += `
            <div class="progress-bar-container">
                <div class="progress-bar-header">
                    <span class="progress-bar-label">${decisionPhase.name || 'Decisão Go/No-go'}</span>
                    <span class="progress-bar-percentage">${decisionPhase.progress || 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill ${decisionPhase.status || 'pending'}" style="width: ${decisionPhase.progress || 0}%"></div>
                </div>
            </div>
        `;
    }

    progressContainer.innerHTML = html || '<p style="color: #6b7280; text-align: center; padding: 1rem;">Nenhum progresso disponível</p>';
}

// Renderizar cards de status
function renderStatusCards() {
    const statusCards = document.getElementById('statusCards');
    if (!statusCards) return;

    const agentsActive = dashboardState.agents.filter(a => a.status === 'complete' || a.status === 'running').length;
    const tasksComplete = dashboardState.backlog.filter(t => t.status === 'done').length;
    const tasksTotal = dashboardState.backlog.length || 25;
    const milestoneProgress = Math.round((tasksComplete / tasksTotal) * 100) || 60;

    statusCards.innerHTML = `
        <div class="status-card workflow">
            <h3>Workflow Status</h3>
            <div class="value">${getStatusIcon(dashboardState.workflowStatus)} ${capitalize(dashboardState.workflowStatus)}</div>
            <div class="subtitle">Fase ${dashboardState.currentPhase || 0}/4</div>
        </div>
        <div class="status-card agents">
            <h3>Agentes Ativos</h3>
            <div class="value">${agentsActive}/${dashboardState.agents.length || 6}</div>
            <div class="subtitle">Todos executando</div>
        </div>
        <div class="status-card tasks">
            <h3>Tarefas Completas</h3>
            <div class="value">${tasksComplete}/${tasksTotal}</div>
            <div class="subtitle">${milestoneProgress}% Done</div>
        </div>
        <div class="status-card milestone">
            <h3>Milestone Progresso</h3>
            <div class="value">${milestoneProgress}%</div>
            <div class="subtitle">Milestone 1.0</div>
        </div>
    `;
}

// Renderizar cards de score
function renderScoreCards() {
    const scoreCards = document.getElementById('scoreCards');
    if (!scoreCards) return;

    const scores = dashboardState.scores;
    const scoreItems = [
        { label: 'Overall', score: scores.overall || 0 },
        { label: 'Architecture', score: scores.architecture || 0 },
        { label: 'Code Quality', score: scores.codeQuality || 0 },
        { label: 'Documentation', score: scores.documentation || 0 },
        { label: 'Security', score: scores.security || 0 },
        { label: 'Performance', score: scores.performance || 0 },
        { label: 'Dependency', score: scores.dependency || 0 },
        { label: 'Testing', score: scores.testing || 0 },
        { label: 'Accessibility', score: scores.accessibility || 0 },
        { label: 'API Design', score: scores.apiDesign || 0 }
    ];

    scoreCards.innerHTML = scoreItems.map(item => {
        const scoreClass = getScoreClass(item.score);
        const indicator = getScoreIndicator(item.score);
        return `
            <div class="score-card">
                <div class="label">${item.label}</div>
                <div class="score ${scoreClass}">${item.score}</div>
                <div class="indicator">${indicator}</div>
            </div>
        `;
    }).join('');
}

// Renderizar timeline
function renderTimeline() {
    const timeline = document.getElementById('workflowTimeline');
    if (!timeline) return;

    // Usar dados reais do progresso
    const progress = dashboardState.progress || {};
    const phasesData = progress.phases || {};
    
    const phases = [
        { 
            name: 'Product Manager', 
            status: progress.currentPhase >= 0 ? (progress.currentPhase > 0 ? 'complete' : 'running') : 'pending', 
            time: progress.startTime ? new Date(progress.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Aguardando' 
        },
        { 
            name: 'Execução', 
            status: phasesData.execution?.status || (progress.currentPhase >= 1 ? 'complete' : (progress.currentPhase === 1 ? 'running' : 'pending')), 
            time: phasesData.execution?.status === 'complete' ? 'Concluído' : (phasesData.execution?.status === 'running' ? 'Executando...' : 'Aguardando') 
        },
        { 
            name: 'Avaliação', 
            status: phasesData.evaluation?.status || (progress.currentPhase >= 2 ? 'complete' : (progress.currentPhase === 2 ? 'running' : 'pending')), 
            time: phasesData.evaluation?.status === 'complete' ? 'Concluído' : (phasesData.evaluation?.status === 'running' ? 'Executando...' : 'Aguardando') 
        },
        { 
            name: 'Decisão', 
            status: phasesData.decision?.status || (progress.currentPhase >= 3 ? 'complete' : (progress.currentPhase === 3 ? 'running' : 'pending')), 
            time: phasesData.decision?.status === 'complete' ? 'Concluído' : (phasesData.decision?.status === 'running' ? 'Executando...' : 'Aguardando') 
        },
        { 
            name: 'Aprovação', 
            status: progress.currentPhase >= 4 ? 'complete' : (dashboardState.approvals?.some(a => a.status === 'approved' || a.status === 'rejected') ? 'complete' : 'pending'), 
            time: dashboardState.approvals?.some(a => a.status === 'approved' || a.status === 'rejected') ? 'Concluído' : 'Aguardando' 
        }
    ];

    timeline.innerHTML = phases.map(phase => {
        const icon = getPhaseIcon(phase.status);
        const iconClass = phase.status;
        return `
            <div class="timeline-item">
                <div class="timeline-icon ${iconClass}">${icon}</div>
                <div class="timeline-content">
                    <h4>Fase ${phases.indexOf(phase)}: ${phase.name}</h4>
                    <p>${phase.time}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar agentes
function renderAgents() {
    const agentsGrid = document.getElementById('agentsGrid');
    if (!agentsGrid) return;

    agentsGrid.innerHTML = dashboardState.agents.map(agent => {
        const statusClass = agent.status || 'pending';
        return `
            <div class="agent-card" onclick="showAgentDetails('${agent.name}')">
                <div class="header">
                    <h3>${agent.icon || '🤖'} ${agent.name}</h3>
                    <span class="agent-status ${statusClass}">${capitalize(statusClass)}</span>
                </div>
                <div class="agent-metrics">
                    <div class="agent-metric">
                        <div class="value">${agent.score || 0}</div>
                        <div class="label">Score</div>
                    </div>
                    <div class="agent-metric">
                        <div class="value">${agent.issues || 0}</div>
                        <div class="label">Issues</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Mapear status do workflow para status das tarefas
function mapWorkflowStatusToTaskStatus(task, workflowProgress) {
    // Mapear baseado no tipo de tarefa e progresso do workflow
    const taskType = task.type || 'other';
    const taskAgent = task.agent || '';
    const taskLocation = task.location || '';

    // Se o workflow está completo, aplicar mapeamento baseado na prioridade
    if (workflowProgress && workflowProgress.workflowStatus === 'complete') {
        // Tarefas críticas que não foram resolvidas ainda estão em progresso
        if (task.priority === 'P0') {
            return 'in-progress';
        }
        // Tarefas de alta prioridade vão para review
        if (task.priority === 'P1') {
            return 'review';
        }
        // Outras tarefas podem estar done
        if (task.priority === 'P2' || task.priority === 'P3') {
            return 'done';
        }
        // Fallback para P0/P1
        return task.priority === 'P0' ? 'in-progress' : 'review';
    }

    // Se o workflow está rodando, verificar se a tarefa está sendo trabalhada
    if (workflowProgress && workflowProgress.workflowStatus === 'running') {
        const currentPhase = workflowProgress.currentPhase || 0;
        const phases = workflowProgress.phases || {};

        // Fase 1: Execução dos Agentes
        if (currentPhase >= 1 && phases.execution) {
            const agents = phases.execution.agents || {};
            
            // Mapear agente da tarefa para agente do workflow
            const agentMap = {
                'Architecture Review': 'architecture',
                'Code Quality Review': 'code-quality',
                'Document Analysis': 'document-analysis',
                'Security Audit': 'security',
                'Performance Analysis': 'performance',
                'Dependency Management': 'dependency',
                'Product Manager': 'product-manager'
            };

            // Verificar se o agente relacionado à tarefa está rodando
            for (const [agentName, agentKey] of Object.entries(agentMap)) {
                if (taskAgent.includes(agentName) || taskLocation.includes(agentName.toLowerCase())) {
                    const agentStatus = agents[agentKey];
                    if (agentStatus) {
                        if (agentStatus.status === 'running') {
                            return 'in-progress';
                        } else if (agentStatus.status === 'complete') {
                            // Se o agente completou, verificar se a tarefa foi resolvida
                            // Tarefas relacionadas a issues críticos vão para review
                            if (task.priority === 'P0' || task.priority === 'P1') {
                                return 'review';
                            }
                            // Outras tarefas podem ir direto para done se o agente completou
                            if (currentPhase >= 2) {
                                return 'done';
                            }
                            return 'review';
                        }
                    }
                }
            }

            // Se estamos na fase de execução e a tarefa é relacionada a um agente que está rodando
            if (phases.execution.status === 'running') {
                // Tarefas de alta prioridade começam a ser trabalhadas
                if (task.priority === 'P0' && currentPhase >= 1) {
                    return 'in-progress';
                }
            }
        }

        // Fase 2: Avaliação Cruzada
        if (currentPhase >= 2 && phases.evaluation) {
            if (phases.evaluation.status === 'running') {
                // Tarefas relacionadas a issues identificados na avaliação
                if (task.priority === 'P0' || task.priority === 'P1') {
                    return 'in-progress';
                }
            } else if (phases.evaluation.status === 'complete') {
                // Tarefas de alta prioridade vão para review após avaliação
                if (task.priority === 'P0' || task.priority === 'P1') {
                    return 'review';
                }
            }
        }

        // Fase 3: Decisão
        if (currentPhase >= 3 && phases.decision) {
            if (phases.decision.status === 'complete') {
                // Se a decisão foi GO, tarefas críticas resolvidas vão para done
                // Se foi NO-GO, tarefas críticas precisam ser trabalhadas
                if (task.priority === 'P0') {
                    return 'in-progress';
                } else if (task.priority === 'P1' && currentPhase >= 3) {
                    return 'review';
                } else if (task.priority === 'P2' || task.priority === 'P3') {
                    return 'done';
                }
            }
        }
    }

    // Se não há progresso do workflow ou está idle, usar status padrão baseado na prioridade
    if (!workflowProgress || workflowProgress.workflowStatus === 'idle') {
        if (task.priority === 'P0') {
            return 'in-progress'; // Tarefas críticas começam em progresso
        } else if (task.priority === 'P1') {
            return 'todo'; // Tarefas de alta prioridade começam em todo
        }
        return 'todo';
    }

    // Status padrão baseado na prioridade (fallback)
    if (task.priority === 'P0') {
        return 'in-progress';
    } else if (task.priority === 'P1') {
        return 'review';
    } else if (task.priority === 'P2' || task.priority === 'P3') {
        return 'done';
    }

    // Status padrão
    return 'todo';
}

// Renderizar backlog
function renderBacklog() {
    const tasks = dashboardState.backlog;
    const workflowProgress = dashboardState.progress;

    // Debug: verificar se progresso está carregado (apenas se mudou)
    if (!workflowProgress) {
        // Log apenas uma vez se não houver progresso
        if (!dashboardState.lastProgressState) {
            console.warn('⚠️ Progresso do workflow não carregado. Tarefas usarão status padrão.');
        }
    } else {
        // Log apenas se o estado mudou
        const currentState = `${workflowProgress.workflowStatus}-${workflowProgress.currentPhase}`;
        if (dashboardState.lastProgressState !== currentState) {
            console.log('📊 Progresso do workflow:', workflowProgress.workflowStatus, 'Fase:', workflowProgress.currentPhase);
            dashboardState.lastProgressState = currentState;
        }
    }

    // Mapear status das tarefas baseado no progresso do workflow
    const tasksWithStatus = tasks.map(task => {
        const mappedStatus = mapWorkflowStatusToTaskStatus(task, workflowProgress);
        return {
            ...task,
            status: mappedStatus
        };
    });
    
    // Contar tarefas por status
    const statusCount = {
        todo: tasksWithStatus.filter(t => t.status === 'todo').length,
        'in-progress': tasksWithStatus.filter(t => t.status === 'in-progress').length,
        review: tasksWithStatus.filter(t => t.status === 'review').length,
        done: tasksWithStatus.filter(t => t.status === 'done').length
    };
    
    // Atualizar estatísticas do backlog no header
    updateBacklogStats(statusCount, tasksWithStatus.length);
    
    // Filtrar tarefas por status
    const todoTasks = tasksWithStatus.filter(t => t.status === 'todo' || !t.status);
    const inProgressTasks = tasksWithStatus.filter(t => t.status === 'in-progress');
    const reviewTasks = tasksWithStatus.filter(t => t.status === 'review');
    const doneTasks = tasksWithStatus.filter(t => t.status === 'done');

    renderTaskColumn('todoTasks', todoTasks);
    renderTaskColumn('inProgressTasks', inProgressTasks);
    renderTaskColumn('reviewTasks', reviewTasks);
    renderTaskColumn('doneTasks', doneTasks);
}

// Atualizar estatísticas do backlog no header
function updateBacklogStats(statusCount, total) {
    const backlogSection = document.querySelector('.backlog-section');
    if (!backlogSection) return;

    // Verificar se já existe o header de estatísticas
    let statsHeader = backlogSection.querySelector('.backlog-header');
    if (!statsHeader) {
        // Criar header se não existir
        const h2 = backlogSection.querySelector('h2');
        if (h2) {
            statsHeader = document.createElement('div');
            statsHeader.className = 'backlog-header';
            statsHeader.innerHTML = `
                <div class="backlog-status">
                    <span class="backlog-status-indicator"></span>
                    <span>Atualização em tempo real</span>
                </div>
                <div class="backlog-stats" id="backlogStats"></div>
            `;
            h2.parentNode.insertBefore(statsHeader, h2.nextSibling);
        }
    }

    // Atualizar estatísticas
    const statsContainer = document.getElementById('backlogStats');
    if (statsContainer) {
        const progress = total > 0 ? Math.round((statusCount.done / total) * 100) : 0;
        statsContainer.innerHTML = `
            <div class="backlog-stat">
                <span>📝</span>
                <span><strong>${statusCount.todo}</strong> TODO</span>
            </div>
            <div class="backlog-stat">
                <span>🔄</span>
                <span><strong>${statusCount['in-progress']}</strong> IN PROGRESS</span>
            </div>
            <div class="backlog-stat">
                <span>👀</span>
                <span><strong>${statusCount.review}</strong> REVIEW</span>
            </div>
            <div class="backlog-stat">
                <span>✅</span>
                <span><strong>${statusCount.done}</strong> DONE</span>
            </div>
            <div class="backlog-stat">
                <span>📊</span>
                <span><strong>${progress}%</strong> Completo</span>
            </div>
        `;
    }
}

// Renderizar coluna de tarefas
function renderTaskColumn(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; font-size: 0.875rem; text-align: center; padding: 1rem;">Nenhuma tarefa</p>';
        return;
    }

    container.innerHTML = tasks.map(task => {
        const priority = task.priority || 'P2';
        const priorityClass = priority.toLowerCase();
        return `
            <div class="task-card" draggable="true">
                <span class="priority ${priorityClass}">${priority}</span>
                <h4>${task.title || task.id}</h4>
                <div class="effort">${task.effort || 'N/A'}</div>
            </div>
        `;
    }).join('');
}

// Renderizar decisões
function renderDecisions() {
    const container = document.getElementById('decisionsContainer');
    if (!container) return;

    if (dashboardState.decisions.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">Nenhuma decisão disponível</p>';
        return;
    }

    container.innerHTML = dashboardState.decisions.map(decision => {
        const decisionClass = decision.decision.toLowerCase().replace(/\s+/g, '-');
        const decisionId = decision.id || decision.timestamp || Date.now().toString();
        return `
            <div class="decision-card ${decisionClass}">
                <div class="decision-header">
                    <h3>🎯 Decisão Go/No-go - Workflow #${decisionId}</h3>
                    <span class="decision-status ${decisionClass}">${decision.decision}</span>
                </div>
                <div class="decision-metrics">
                    <div class="decision-metric">
                        <div class="value">${decision.score || 0}</div>
                        <div class="label">Score Geral</div>
                    </div>
                    <div class="decision-metric">
                        <div class="value">${decision.issuesP0 || 0}</div>
                        <div class="label">Issues P0</div>
                    </div>
                    <div class="decision-metric">
                        <div class="value">${decision.issuesP1 || 0}</div>
                        <div class="label">Issues P1</div>
                    </div>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-success" data-action="approve" data-decision-id="${decisionId}">Aprovar</button>
                    <button class="btn btn-danger" data-action="reject" data-decision-id="${decisionId}">Rejeitar</button>
                    <button class="btn btn-primary" data-action="view" data-decision-id="${decisionId}">Ver Detalhes</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Adicionar event listeners aos botões de decisão
    setTimeout(() => {
        // Remover listeners antigos antes de adicionar novos
        container.querySelectorAll('[data-action="approve"]').forEach(btn => {
            // Clonar o botão para remover todos os event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        container.querySelectorAll('[data-action="approve"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = e.target.getAttribute('data-decision-id');
                if (id && !pendingApprovals.has(id)) {
                    console.log('Botão Aprovar (decisão) clicado, ID:', id);
                    approveDecision(id);
                }
            }, { once: false });
        });
        
        container.querySelectorAll('[data-action="reject"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-decision-id');
                console.log('Botão Rejeitar (decisão) clicado, ID:', id);
                rejectDecision(id);
            });
        });
        
        container.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-decision-id');
                console.log('Botão Ver Detalhes (decisão) clicado, ID:', id);
                viewDecisionDetails(id);
            });
        });
    }, 100);
}

// Renderizar gráficos
let chartsRendered = false;
function renderCharts() {
    // Só renderizar gráficos uma vez na inicialização
    // Atualizações serão feitas via updateCharts()
    if (!chartsRendered) {
        renderScoresChart();
        renderIssuesChart();
        chartsRendered = true;
    }
}

// Renderizar gráfico de scores
function renderScoresChart() {
    const canvas = document.getElementById('scoresChart');
    if (!canvas) return;

    try {
        // Método 1: Usar Chart.getChart() (método oficial do Chart.js)
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    } catch (e) {
        // Se Chart.getChart não funcionar, tentar método alternativo
        console.warn('Chart.getChart() falhou, tentando método alternativo:', e);
    }

    // Método 2: Destruir gráfico existente se houver na referência
    if (charts.scoresChart) {
        try {
            charts.scoresChart.destroy();
        } catch (e) {
            console.warn('Erro ao destruir scoresChart:', e);
        }
        charts.scoresChart = null;
    }

    // Limpar canvas antes de criar novo gráfico
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scores = dashboardState.scores;

    charts.scoresChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Overall', 'Architecture', 'Code Quality', 'Documentation', 'Security', 'Performance'],
            datasets: [{
                label: 'Scores',
                data: [
                    scores.overall || 0,
                    scores.architecture || 0,
                    scores.codeQuality || 0,
                    scores.documentation || 0,
                    scores.security || 0,
                    scores.performance || 0
                ],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Renderizar gráfico de issues
function renderIssuesChart() {
    const canvas = document.getElementById('issuesChart');
    if (!canvas) return;

    try {
        // Método 1: Usar Chart.getChart() (método oficial do Chart.js)
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    } catch (e) {
        // Se Chart.getChart não funcionar, tentar método alternativo
        console.warn('Chart.getChart() falhou, tentando método alternativo:', e);
    }

    // Método 2: Destruir gráfico existente se houver na referência
    if (charts.issuesChart) {
        try {
            charts.issuesChart.destroy();
        } catch (e) {
            console.warn('Erro ao destruir issuesChart:', e);
        }
        charts.issuesChart = null;
    }

    // Limpar canvas antes de criar novo gráfico
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const agents = dashboardState.agents;

    const issuesByType = {
        'Security': 0,
        'Performance': 0,
        'Code Quality': 0,
        'Documentation': 0
    };

    agents.forEach(agent => {
        const issues = agent.issues || 0;
        if (agent.name.includes('Security')) issuesByType['Security'] += issues;
        else if (agent.name.includes('Performance')) issuesByType['Performance'] += issues;
        else if (agent.name.includes('Code Quality')) issuesByType['Code Quality'] += issues;
        else if (agent.name.includes('Document')) issuesByType['Documentation'] += issues;
    });

    charts.issuesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(issuesByType),
            datasets: [{
                data: Object.values(issuesByType),
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#3b82f6',
                    '#6b7280'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Renderizar aprovações
function renderApprovals() {
    const container = document.getElementById('approvalsContainer');
    if (!container) return;

    if (dashboardState.approvals.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">Nenhuma aprovação pendente</p>';
        return;
    }

    container.innerHTML = dashboardState.approvals.map(approval => {
        const approvalId = approval.id || approval.timestamp || Date.now().toString();
        return `
            <div class="approval-card">
                <h3>${approval.title || 'Aprovação Pendente'}</h3>
                <p>${approval.description || ''}</p>
                <div class="approval-actions">
                    <button class="btn btn-success" data-action="approve-item" data-approval-id="${approvalId}">Aprovar</button>
                    <button class="btn btn-danger" data-action="reject-item" data-approval-id="${approvalId}">Rejeitar</button>
                    <button class="btn btn-primary" data-action="view-item" data-approval-id="${approvalId}">Ver Detalhes</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Adicionar event listeners aos botões de aprovação
    setTimeout(() => {
        // Remover listeners antigos antes de adicionar novos
        container.querySelectorAll('[data-action="approve-item"]').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        container.querySelectorAll('[data-action="approve-item"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = e.target.getAttribute('data-approval-id');
                if (id && !pendingApprovals.has(id)) {
                    console.log('Botão Aprovar (item) clicado, ID:', id);
                    approveDecision(id);
                }
            }, { once: false });
        });
        
        container.querySelectorAll('[data-action="reject-item"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-approval-id');
                console.log('Botão Rejeitar (item) clicado, ID:', id);
                rejectDecision(id);
            });
        });
        
        container.querySelectorAll('[data-action="view-item"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-approval-id');
                console.log('Botão Ver Detalhes (item) clicado, ID:', id);
                viewDecisionDetails(id);
            });
        });
    }, 100);
}

// Renderizar atividades
function renderActivities() {
    const timeline = document.getElementById('activityTimeline');
    if (!timeline) return;

    if (dashboardState.activities.length === 0) {
        timeline.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">Nenhuma atividade recente</p>';
        return;
    }

    timeline.innerHTML = dashboardState.activities.map(activity => {
        const icon = getActivityIcon(activity.type);
        return `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${getActivityColor(activity.type)}20; color: ${getActivityColor(activity.type)};">
                    ${icon}
                </div>
                <div class="activity-content">
                    <div class="activity-time">${activity.time || 'Agora'}</div>
                    <div class="activity-message">${activity.message || ''}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Funções auxiliares
function getStatusIcon(status) {
    const icons = {
        'running': '🔄',
        'complete': '✅',
        'error': '❌',
        'pending': '⏳',
        'paused': '⏸️'
    };
    return icons[status] || '⏳';
}

function getPhaseIcon(status) {
    const icons = {
        'complete': '✅',
        'running': '🔄',
        'pending': '⏳'
    };
    return icons[status] || '⏳';
}

function getScoreClass(score) {
    if (score >= 75) return 'excellent';
    if (score >= 50) return 'good';
    return 'poor';
}

function getScoreIndicator(score) {
    if (score >= 75) return '✅';
    if (score >= 50) return '⚠️';
    return '❌';
}

function getActivityIcon(type) {
    const icons = {
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️',
        'workflow': '🔄',
        'agent': '🤖',
        'decision': '🎯'
    };
    return icons[type] || 'ℹ️';
}

function getActivityColor(type) {
    const colors = {
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
        'workflow': '#3b82f6',
        'agent': '#10b981',
        'decision': '#f59e0b'
    };
    return colors[type] || '#6b7280';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notifications');
    if (badge) {
        badge.setAttribute('data-count', count);
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Ações
function runWorkflow(event) {
    console.log('Executando workflow...');
    const button = event?.target || document.getElementById('runWorkflowBtn');
    if (button) {
        button.disabled = true;
        button.textContent = '⏳ Executando...';
    }
    
    fetch('/api/workflow/run', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            console.log('Workflow executado:', data);
            showSuccess('Workflow iniciado!');
            if (button) {
                button.disabled = false;
                button.textContent = '▶️ Executar Workflow';
            }
            setTimeout(() => {
                initializeDashboard();
            }, 2000);
        })
        .catch(error => {
            console.error('Erro ao executar workflow:', error);
            showError('Erro ao executar workflow: ' + error.message);
            if (button) {
                button.disabled = false;
                button.textContent = '▶️ Executar Workflow';
            }
        });
}

function approveDecision(id) {
    // Prevenir múltiplos cliques
    if (pendingApprovals.has(id)) {
        console.log('Aprovação já em andamento para:', id);
        return;
    }

    console.log('Aprovando decisão:', id);
    if (!id) {
        showError('ID da decisão não fornecido');
        return;
    }

    // Marcar como em andamento
    pendingApprovals.add(id);

    // Desabilitar todos os botões de aprovar para esta decisão
    const approveButtons = document.querySelectorAll(`[data-decision-id="${id}"][data-action="approve"], [data-approval-id="${id}"][data-action="approve-item"]`);
    approveButtons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = '⏳ Aprovando...';
    });
    
    fetch(`/api/approvals/${id}/approve`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: 'Usuário' })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Decisão aprovada:', data);
            showSuccess('Decisão aprovada com sucesso!');
            
            // Remover do conjunto de aprovações pendentes
            pendingApprovals.delete(id);
            
            // Recarregar dados
            loadApprovals().then(() => {
                loadDecisions().then(() => {
                    renderApprovals();
                    renderDecisions();
                });
            });
        })
        .catch(error => {
            console.error('Erro ao aprovar decisão:', error);
            showError('Erro ao aprovar decisão: ' + error.message);
            
            // Remover do conjunto de aprovações pendentes
            pendingApprovals.delete(id);
            
            // Reabilitar botões em caso de erro
            approveButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = 'Aprovar';
            });
        });
}

function rejectDecision(id) {
    // Prevenir múltiplos cliques
    if (pendingApprovals.has(id)) {
        console.log('Operação já em andamento para:', id);
        return;
    }

    console.log('Rejeitando decisão:', id);
    if (!id) {
        showError('ID da decisão não fornecido');
        return;
    }

    // Marcar como em andamento
    pendingApprovals.add(id);

    // Desabilitar botões
    const rejectButtons = document.querySelectorAll(`[data-decision-id="${id}"][data-action="reject"], [data-approval-id="${id}"][data-action="reject-item"]`);
    rejectButtons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = '⏳ Processando...';
    });
    
    const reason = prompt('Motivo da rejeição (opcional):') || '';
    
    fetch(`/api/approvals/${id}/reject`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            user: 'Usuário',
            reason: reason
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Decisão rejeitada:', data);
            showSuccess('Decisão rejeitada com sucesso!');
            
            // Remover do conjunto
            pendingApprovals.delete(id);
            
            // Recarregar dados
            loadApprovals().then(() => {
                loadDecisions().then(() => {
                    renderApprovals();
                    renderDecisions();
                });
            });
        })
        .catch(error => {
            console.error('Erro ao rejeitar decisão:', error);
            showError('Erro ao rejeitar decisão: ' + error.message);
            
            // Remover do conjunto
            pendingApprovals.delete(id);
            
            // Reabilitar botões
            rejectButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = 'Rejeitar';
            });
        });
}

function viewDecisionDetails(id) {
    console.log('Visualizando detalhes da decisão:', id);
    if (!id) {
        showError('ID da decisão não fornecido');
        return;
    }
    
    // Abrir em nova aba
    window.open(`/api/approvals/${id}/report`, '_blank');
}

function showAgentDetails(name) {
    alert(`Detalhes do agente: ${name}`);
    // Implementar modal de detalhes
}

// Funções auxiliares (mantidas para compatibilidade)
function approveItem(id) {
    approveDecision(id);
}

function rejectItem(id) {
    rejectDecision(id);
}

function viewDetails(id) {
    viewDecisionDetails(id);
}

// Garantir que funções estejam no escopo global
window.approveDecision = approveDecision;
window.rejectDecision = rejectDecision;
window.viewDecisionDetails = viewDecisionDetails;
window.runWorkflow = runWorkflow;

// Polling para atualização automática
let pollingInterval = null;
let backlogPollingInterval = null;

function startPolling() {
    // Limpar intervalos anteriores se existirem
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    if (backlogPollingInterval) {
        clearInterval(backlogPollingInterval);
    }
    
    // Polling geral do dashboard (menos frequente)
    pollingInterval = setInterval(() => {
        updateDashboard();
    }, 10000); // Atualizar a cada 10 segundos
    
    // Polling específico do backlog (mais frequente quando workflow está rodando)
    // Usar intervalo maior para evitar sobrecarga
    backlogPollingInterval = setInterval(() => {
        updateBacklogOnly();
    }, 5000); // Atualizar backlog a cada 5 segundos (reduzido de 3 para evitar spam)
}

// Cache para evitar atualizações desnecessárias
let lastBacklogUpdate = null;
let lastProgressUpdate = null;

// Atualizar apenas o backlog (mais rápido)
async function updateBacklogOnly() {
    try {
        // Verificar se workflow está rodando
        const statusResponse = await fetch('/api/status');
        const statusData = await statusResponse.json();
        
        const isRunning = statusData.status === 'running' || statusData.currentPhase > 0;
        
        if (isRunning) {
            // Carregar progresso e backlog
            const [progressData, backlogData] = await Promise.all([
                fetch('/api/progress').then(r => r.json()),
                fetch('/api/backlog').then(r => r.json())
            ]);
            
            // Verificar se houve mudanças antes de atualizar
            const progressKey = progressData.progress ? 
                `${progressData.progress.workflowStatus}-${progressData.progress.currentPhase}-${progressData.progress.timestamp}` : null;
            const backlogKey = backlogData.tasks ? 
                `${backlogData.tasks.length}-${JSON.stringify(backlogData.tasks.map(t => t.id).sort())}` : null;
            
            const hasProgressChanged = progressKey !== lastProgressUpdate;
            const hasBacklogChanged = backlogKey !== lastBacklogUpdate;
            
            if (hasProgressChanged || hasBacklogChanged) {
                // Atualizar estado
                if (progressData.success) {
                    dashboardState.progress = progressData.progress;
                    lastProgressUpdate = progressKey;
                }
                if (backlogData.success) {
                    dashboardState.backlog = backlogData.tasks || [];
                    lastBacklogUpdate = backlogKey;
                }
                
                // Renderizar apenas o backlog (mais rápido)
                renderBacklog();
                
                // Adicionar indicador visual de atualização
                const backlogSection = document.querySelector('.backlog-section');
                if (backlogSection) {
                    backlogSection.style.opacity = '0.95';
                    setTimeout(() => {
                        backlogSection.style.opacity = '1';
                    }, 200);
                }
            }
        }
    } catch (error) {
        // Silenciar erros de rede durante polling
        if (error.message && !error.message.includes('fetch')) {
            console.error('Erro ao atualizar backlog:', error);
        }
    }
}

// Atualizar dashboard sem recriar tudo
async function updateDashboard() {
    try {
        await Promise.all([
            loadWorkflowStatus(),
            loadProgress(), // Carregar progresso para mapear status das tarefas
            loadAgents(),
            loadScores(),
            loadDecisions(),
            loadBacklog(),
            loadApprovals(),
            loadActivities()
        ]);
        
        // Atualizar apenas elementos que mudaram, não recriar gráficos
        renderProgress();
        renderStatusCards();
        renderScoreCards();
        renderTimeline();
        renderAgents();
        renderBacklog(); // Renderizar backlog DEPOIS de carregar progresso
        renderDecisions();
        renderApprovals();
        renderActivities();
        
        // Atualizar gráficos apenas se necessário
        updateCharts();
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// Atualizar gráficos (destruir e recriar apenas se necessário)
function updateCharts() {
    // Verificar se os dados mudaram antes de atualizar gráficos
    const currentScores = JSON.stringify(dashboardState.scores);
    const currentAgents = JSON.stringify(dashboardState.agents.map(a => a.issues));
    
    if (!window.lastScores || window.lastScores !== currentScores) {
        window.lastScores = currentScores;
        // Aguardar um pouco para garantir que não há conflito
        setTimeout(() => {
            renderScoresChart();
        }, 50);
    }
    
    if (!window.lastAgents || window.lastAgents !== currentAgents) {
        window.lastAgents = currentAgents;
        // Aguardar um pouco para garantir que não há conflito
        setTimeout(() => {
            renderIssuesChart();
        }, 50);
    }
}

// Notificações
function showSuccess(message) {
    console.log('✅', message);
    // Criar notificação visual
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = `✅ ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    console.error('❌', message);
    // Criar notificação visual
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = `❌ ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

