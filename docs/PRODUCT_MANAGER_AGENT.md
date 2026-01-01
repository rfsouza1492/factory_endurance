# 📊 Product Manager Agent - Coordenador de Desenvolvimento

**Data:** 2025-12-30  
**Sistema:** Maestro - Coordenação de Agentes  
**Versão:** 1.0

---

## 🎯 Missão

O **Product Manager Agent** é o coordenador estratégico que avalia o status atual do desenvolvimento em relação aos milestones do roadmap, cria backlog de tarefas automaticamente, e aciona o Maestro para iniciar o workflow de desenvolvimento e revisão.

---

## 📋 Responsabilidades Principais

### 1. Avaliação de Status de Desenvolvimento
- Analisar progresso atual vs. milestones do roadmap
- Identificar gaps entre estado atual e objetivos
- Avaliar qualidade do código atual
- Verificar se features planejadas foram implementadas

### 2. Criação Automática de Backlog
- Gerar tarefas baseadas em gaps identificados
- Priorizar tarefas por impacto e urgência
- Estimar esforço e dependências
- Agrupar tarefas por milestone/sprint

### 3. Acionamento do Maestro
- Enviar backlog para o Maestro
- Solicitar execução do workflow completo
- Especificar prioridades e deadlines

### 4. Coordenação de Implementação
- Receber feedback dos agentes sobre implementações
- Aprovar ou solicitar melhorias antes da implementação
- Rastrear progresso de tarefas

---

## 🔄 Fluxo de Trabalho

```
┌─────────────────────────────────────────────────────────┐
│         PRODUCT MANAGER AGENT (Trigger Inicial)          │
│                                                          │
│  1. Avaliar Status Atual                                 │
│     ├─> Ler Roadmap                                      │
│     ├─> Analisar código atual                           │
│     ├─> Comparar com milestones                         │
│     └─> Identificar gaps                                │
│                                                          │
│  2. Criar Backlog de Tarefas                            │
│     ├─> Gerar tarefas para gaps                         │
│     ├─> Priorizar por impacto                           │
│     ├─> Estimar esforço                                 │
│     └─> Agrupar por milestone                           │
│                                                          │
│  3. Enviar para Maestro                                  │
│     ├─> Criar backlog.json                             │
│     ├─> Acionar Maestro                                │
│     └─> Aguardar workflow                              │
│                                                          │
│  4. Receber Feedback dos Agentes                        │
│     ├─> Revisar sugestões                              │
│     ├─> Aprovar implementação                          │
│     └─> Solicitar melhorias                            │
│                                                          │
│  5. Coordenar Implementação                             │
│     ├─> Aprovar código para merge                      │
│     ├─> Solicitar refatorações                         │
│     └─> Rastrear progresso                             │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    MAESTRO WORKFLOW                      │
│                                                          │
│  Recebe backlog do Product Manager                      │
│  Executa workflow completo                              │
│  Retorna feedback para Product Manager                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Processo Detalhado

### Fase 1: Avaliação de Status

#### 1.1 Ler Roadmap e Milestones
```yaml
Arquivos a ler:
  - knowledge/product/ROADMAP.md
  - knowledge/product/BACKLOG.md
  - knowledge/implementation/BUILD_SUMMARY.md

Extrair:
  - Milestones planejados
  - Features por milestone
  - Deadlines
  - Dependências entre features
```

#### 1.2 Analisar Código Atual
```yaml
Verificações:
  - Features implementadas vs. planejadas
  - Qualidade do código atual
  - Testes existentes
  - Documentação atualizada
  - Status de deploy
```

#### 1.3 Comparar com Milestones
```yaml
Análise:
  - Progresso atual: X% do milestone
  - Features completadas: Y de Z
  - Features faltantes: Lista
  - Bloqueadores identificados
  - Riscos de deadline
```

#### 1.4 Identificar Gaps
```yaml
Gaps identificados:
  - Features não implementadas
  - Features parcialmente implementadas
  - Qualidade abaixo do esperado
  - Documentação faltante
  - Testes insuficientes
```

### Fase 2: Criação de Backlog

#### 2.1 Gerar Tarefas
```yaml
Para cada gap identificado:
  - Criar tarefa com:
    - ID único
    - Título descritivo
    - Descrição detalhada
    - Tipo: feature | fix | refactor | test | docs
    - Prioridade: P0 | P1 | P2 | P3
    - Esforço estimado: XS | S | M | L | XL
    - Milestone associado
    - Dependências
    - Critérios de aceitação
```

#### 2.2 Priorizar Tarefas
```yaml
Matriz de Priorização:
  - Urgência (deadline próximo) + Alto Impacto = P0
  - Alto Impacto + Média Urgência = P1
  - Média Impacto + Alta Urgência = P1
  - Média Impacto + Média Urgência = P2
  - Baixo Impacto = P3
```

#### 2.3 Agrupar por Milestone
```yaml
Agrupamento:
  - Milestone 1: [tarefas]
  - Milestone 2: [tarefas]
  - Backlog Geral: [tarefas sem milestone]
```

#### 2.4 Estimar Esforço Total
```yaml
Cálculo:
  - Esforço por tarefa
  - Esforço por milestone
  - Esforço total do backlog
  - Tempo estimado para conclusão
```

### Fase 3: Envio para Maestro

#### 3.1 Criar Backlog JSON
```json
{
  "backlogId": "backlog-2025-01-01",
  "createdAt": "2025-01-01T00:00:00Z",
  "createdBy": "Product Manager Agent",
  "milestone": "Milestone 1.0",
  "deadline": "2025-01-15",
  "tasks": [
    {
      "id": "task-001",
      "title": "Implementar feature X",
      "type": "feature",
      "priority": "P0",
      "effort": "M",
      "description": "...",
      "acceptanceCriteria": [...],
      "dependencies": [],
      "milestone": "Milestone 1.0"
    }
  ],
  "summary": {
    "totalTasks": 10,
    "p0Tasks": 2,
    "p1Tasks": 5,
    "estimatedEffort": "40 hours",
    "estimatedCompletion": "2025-01-12"
  }
}
```

#### 3.2 Salvar Backlog
```yaml
Localização:
  - maestro/shared/backlog/backlog-[timestamp].json
  - maestro/shared/backlog/current-backlog.json (último)
```

#### 3.3 Acionar Maestro
```yaml
Ação:
  - Criar evento: "backlog-ready"
  - Notificar Maestro
  - Passar referência do backlog
  - Solicitar execução do workflow
```

### Fase 4: Receber Feedback dos Agentes

#### 4.1 Aguardar Workflow do Maestro
```yaml
Workflow executado:
  - Fase 1: Execução paralela dos agentes
  - Fase 2: Avaliação cruzada
  - Fase 3: Decisão Go/No-go
  - Fase 4: Geração de backlog (atualizado)
```

#### 4.2 Revisar Feedback
```yaml
Feedback recebido:
  - Issues identificados pelos agentes
  - Sugestões de melhorias
  - Conflitos identificados
  - Recomendações de implementação
```

#### 4.3 Decidir sobre Implementação
```yaml
Decisões:
  - ✅ Aprovar: Código pode ser implementado
  - ⚠️ Melhorar: Solicitar melhorias antes
  - ❌ Rejeitar: Não implementar, revisar requisitos
```

### Fase 5: Coordenar Implementação

#### 5.1 Aprovar Implementação
```yaml
Se aprovado:
  - Marcar tarefa como "approved-for-implementation"
  - Criar branch de feature
  - Iniciar implementação
  - Rastrear progresso
```

#### 5.2 Solicitar Melhorias
```yaml
Se melhorias necessárias:
  - Criar tarefas de melhoria
  - Priorizar melhorias
  - Re-enviar para Maestro após melhorias
  - Aguardar nova revisão
```

#### 5.3 Rastrear Progresso
```yaml
Monitoramento:
  - Status de cada tarefa
  - Progresso do milestone
  - Tempo gasto vs. estimado
  - Bloqueadores identificados
```

---

## 📊 Output Esperado

### Estrutura do Backlog

```markdown
# Backlog - [Data]

## 📊 Resumo Executivo
- Milestone: [Nome]
- Deadline: [Data]
- Total de Tarefas: X
- Tarefas P0: Y
- Tarefas P1: Z
- Esforço Estimado: W horas
- Conclusão Estimada: [Data]

## 🎯 Tarefas por Prioridade

### P0 - Crítico
- [Tarefa 1]
- [Tarefa 2]

### P1 - Alta
- [Tarefa 3]
- [Tarefa 4]

## 📋 Tarefas por Milestone

### Milestone 1.0
- [Lista de tarefas]

## 📈 Progresso
- Tarefas Completadas: X/Y
- Progresso: Z%
```

---

## 🔗 Integração com Maestro

### Fluxo de Comunicação

```
Product Manager Agent
    │
    ├─> Cria backlog.json
    │
    ├─> Salva em maestro/shared/backlog/
    │
    ├─> Cria evento "backlog-ready"
    │
    └─> Notifica Maestro
            │
            ▼
        Maestro
            │
            ├─> Lê backlog.json
            │
            ├─> Executa workflow completo
            │
            ├─> Gera feedback
            │
            └─> Retorna para Product Manager
                    │
                    ▼
            Product Manager Agent
                │
                ├─> Revisa feedback
                │
                ├─> Aprova ou solicita melhorias
                │
                └─> Coordena implementação
```

### Formato de Comunicação

#### Product Manager → Maestro
```json
{
  "event": "backlog-ready",
  "backlogId": "backlog-2025-01-01",
  "backlogPath": "maestro/shared/backlog/backlog-2025-01-01.json",
  "priority": "high",
  "deadline": "2025-01-15",
  "requestedActions": [
    "review-code",
    "review-architecture",
    "review-documentation",
    "generate-improvements"
  ]
}
```

#### Maestro → Product Manager
```json
{
  "event": "workflow-complete",
  "workflowId": "workflow-2025-01-01",
  "backlogId": "backlog-2025-01-01",
  "decision": "GO WITH CONCERNS",
  "scores": {
    "overall": 75,
    "architecture": 60,
    "codeQuality": 90,
    "documentation": 73
  },
  "issues": {
    "critical": [],
    "high": 6,
    "medium": 2
  },
  "recommendations": [...],
  "reportPath": "maestro/shared/decisions/go-no-go-report.md"
}
```

---

## 🎯 Critérios de Sucesso

### Avaliação de Status
- ✅ Identifica corretamente gaps entre roadmap e código atual
- ✅ Prioriza tarefas baseado em impacto e urgência
- ✅ Estima esforço com precisão razoável

### Criação de Backlog
- ✅ Todas as tarefas necessárias são criadas
- ✅ Prioridades refletem importância real
- ✅ Dependências são mapeadas corretamente

### Coordenação
- ✅ Maestro é acionado corretamente
- ✅ Feedback é processado adequadamente
- ✅ Implementação é coordenada eficientemente

---

## 📝 Template de Backlog

```markdown
# Backlog - [Milestone] - [Data]

## 📊 Resumo
- **Milestone**: [Nome]
- **Deadline**: [Data]
- **Status**: [Planejado | Em Progresso | Completo]
- **Progresso**: X%

## 🎯 Tarefas

### P0 - Crítico
| ID | Título | Tipo | Esforço | Status |
|----|--------|------|---------|--------|
| T001 | [Tarefa] | feature | M | todo |

### P1 - Alta
| ID | Título | Tipo | Esforço | Status |
|----|--------|------|---------|--------|

## 📈 Métricas
- Total de Tarefas: X
- Tarefas Completadas: Y
- Tarefas em Progresso: Z
- Esforço Restante: W horas
```

---

## 🔄 Ciclo de Vida Completo

```
1. Product Manager avalia status
   └─> Identifica gaps

2. Product Manager cria backlog
   └─> Gera tarefas priorizadas

3. Product Manager envia para Maestro
   └─> Aciona workflow

4. Maestro executa workflow
   ├─> Agentes revisam código
   ├─> Identificam issues
   └─> Geram recomendações

5. Maestro retorna feedback
   └─> Product Manager recebe

6. Product Manager decide
   ├─> Aprova implementação
   ├─> Solicita melhorias
   └─> Rejeita (se necessário)

7. Implementação (se aprovado)
   └─> Código desenvolvido

8. Loop: Volta para passo 1
   └─> Avaliar novo status
```

---

**Última Atualização**: 2025-12-30  
**Status**: 📋 Especificação Completa

