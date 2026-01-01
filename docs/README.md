# 🎭 Maestro - Sistema de Coordenação de Agentes

## 🎯 Visão Geral

O **Maestro** é o sistema central de coordenação que orquestra a colaboração entre os agentes especializados do projeto. Ele garante que cada agente execute sua função, compartilhe resultados, avalie as conclusões dos outros agentes e, juntos, cheguem a uma decisão Go/No-go com todas as preocupações identificadas para aprovação do usuário.

---

## 🤖 Agentes Coordenados

### 1. **Architecture Review Agent** 🏗️
- **Função**: Revisar arquitetura do sistema
- **Foco**: Estrutura, padrões, segurança, performance, escalabilidade
- **Outputs**: Issues críticos, melhorias sugeridas, análise de dependências

### 2. **Code Quality Review Agent** ✅
- **Função**: Avaliar qualidade do código
- **Foco**: Padrões de código, business logic, acessibilidade, manutenibilidade
- **Outputs**: Relatórios de qualidade, recomendações, scores

### 3. **Document Analysis Agent** 📚
- **Função**: Analisar documentação do projeto
- **Foco**: Extrair requisitos, mapear dependências, identificar gaps
- **Outputs**: Resumos, insights, action items

---

## 🔄 Workflow Automático

```
┌─────────────────────────────────────────────────────────┐
│                    INÍCIO DO WORKFLOW                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  FASE 1: EXECUÇÃO PARALELA                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Architecture │  │ Code Quality │  │  Document    │ │
│  │   Review     │  │    Review    │  │  Analysis    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                        │                                 │
│                        ▼                                 │
│              Compartilhar Resultados                     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  FASE 2: AVALIAÇÃO CRUZADA                              │
│  Cada agente avalia os resultados dos outros            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Architecture │  │ Code Quality │  │  Document    │ │
│  │  avalia:     │  │  avalia:     │  │  avalia:     │ │
│  │  - Code      │  │  - Arch      │  │  - Arch      │ │
│  │  - Docs      │  │  - Docs      │  │  - Code      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                        │                                 │
│                        ▼                                 │
│              Consolidar Avaliações                       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  FASE 3: DECISÃO GO/NO-GO                               │
│  - Consolidar todas as preocupações                     │
│  - Identificar conflitos                                │
│  - Priorizar issues                                      │
│  - Gerar recomendação final                             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  FASE 4: APROVAÇÃO DO USUÁRIO                           │
│  - Apresentar resumo executivo                          │
│  - Listar todas as preocupações                         │
│  - Mostrar recomendações                                │
│  - Aguardar aprovação/rejeição                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
maestro/
├── README.md                    # Este arquivo
├── processes/                   # Processos do workflow
│   ├── workflow-execution.md    # Processo principal de execução
│   ├── agent-coordination.md    # Como coordenar agentes
│   ├── cross-evaluation.md      # Processo de avaliação cruzada
│   └── go-no-go-decision.md    # Processo de decisão Go/No-go
├── templates/                   # Templates para comunicação
│   ├── agent-result-template.md    # Template para resultados de agentes
│   ├── cross-evaluation-template.md # Template para avaliação cruzada
│   ├── go-no-go-report-template.md # Template para relatório Go/No-go
│   └── approval-request-template.md # Template para solicitar aprovação
├── shared/                      # Área compartilhada entre agentes
│   ├── results/                 # Resultados de cada agente
│   │   ├── architecture-review/
│   │   ├── code-quality-review/
│   │   └── document-analysis/
│   ├── evaluations/             # Avaliações cruzadas
│   │   ├── architecture-evaluates-code.md
│   │   ├── architecture-evaluates-docs.md
│   │   ├── code-evaluates-architecture.md
│   │   ├── code-evaluates-docs.md
│   │   ├── docs-evaluates-architecture.md
│   │   └── docs-evaluates-code.md
│   └── decisions/               # Decisões e relatórios finais
│       ├── go-no-go-report.md
│       └── concerns-summary.md
└── scripts/                     # Scripts de automação
    └── run-workflow.js          # Script principal de execução
```

---

## 🚀 Quick Start

### Executar Workflow Completo

```bash
# Executar workflow completo
node Agents/maestro/scripts/run-workflow.js

# Ou usar npm script (se configurado)
npm run maestro:workflow
```

### Executar Fase Específica

```bash
# Apenas execução dos agentes
node Agents/maestro/scripts/run-workflow.js --phase=execution

# Apenas avaliação cruzada
node Agents/maestro/scripts/run-workflow.js --phase=evaluation

# Apenas decisão Go/No-go
node Agents/maestro/scripts/run-workflow.js --phase=decision
```

---

## 📋 Fases Detalhadas

### Fase 1: Execução Paralela

Cada agente executa sua tarefa independentemente:

1. **Architecture Review Agent**
   - Executa processo: `Agents/architecture-review/processes/review-process.md`
   - Gera resultado em: `maestro/shared/results/architecture-review/`

2. **Code Quality Review Agent**
   - Executa processo: `Agents/code-quality-review/processes/code-evaluation.md`
   - Gera resultado em: `maestro/shared/results/code-quality-review/`

3. **Document Analysis Agent**
   - Executa processo: `Agents/document-analysis/processes/analysis-workflow.md`
   - Gera resultado em: `maestro/shared/results/document-analysis/`

**Output**: Cada agente salva seu resultado usando `templates/agent-result-template.md`

---

### Fase 2: Avaliação Cruzada

Cada agente avalia os resultados dos outros sob sua perspectiva:

1. **Architecture Review avalia:**
   - Resultados do Code Quality (impacto arquitetural)
   - Resultados do Document Analysis (requisitos arquiteturais)

2. **Code Quality Review avalia:**
   - Resultados do Architecture Review (qualidade da arquitetura)
   - Resultados do Document Analysis (requisitos de qualidade)

3. **Document Analysis avalia:**
   - Resultados do Architecture Review (documentação necessária)
   - Resultados do Code Quality (documentação de padrões)

**Output**: Cada avaliação salva em `maestro/shared/evaluations/` usando `templates/cross-evaluation-template.md`

---

### Fase 3: Decisão Go/No-go

O Maestro consolida todas as informações:

1. **Consolidação**
   - Agrega todas as preocupações
   - Identifica conflitos entre agentes
   - Prioriza issues por severidade e impacto

2. **Análise de Riscos**
   - Identifica blockers críticos
   - Avalia impacto em features futuras
   - Calcula esforço de correção

3. **Recomendação**
   - **GO**: Pode prosseguir (com ou sem preocupações menores)
   - **NO-GO**: Bloqueado (precisa resolver issues críticos)
   - **GO WITH CONCERNS**: Pode prosseguir mas com atenção a preocupações

**Output**: Relatório em `maestro/shared/decisions/go-no-go-report.md`

---

### Fase 4: Aprovação do Usuário

Apresenta resumo para o usuário:

1. **Resumo Executivo**
   - Decisão Go/No-go
   - Score geral
   - Principais preocupações

2. **Detalhamento**
   - Todas as preocupações por categoria
   - Recomendações de cada agente
   - Conflitos identificados

3. **Ação**
   - Aguarda aprovação do usuário
   - Se aprovado: aplica mudanças ou prossegue
   - Se rejeitado: retorna para correção

---

## 🎯 Critérios de Decisão

### GO (Pode Prosseguir)
- ✅ Nenhum issue crítico (P0)
- ✅ Issues de alta prioridade (P1) são conhecidos e aceitos
- ✅ Nenhum blocker arquitetural
- ✅ Documentação suficiente para prosseguir

### NO-GO (Bloqueado)
- ❌ Issues críticos (P0) não resolvidos
- ❌ Blockers arquiteturais
- ❌ Conflitos entre requisitos e implementação
- ❌ Falta de documentação crítica

### GO WITH CONCERNS (Prosseguir com Atenção)
- ⚠️ Issues de alta prioridade (P1) identificados
- ⚠️ Preocupações arquiteturais menores
- ⚠️ Gaps de documentação não críticos
- ⚠️ Recomendações de melhoria futura

---

## 📊 Métricas e Tracking

O Maestro rastreia:
- Tempo de execução de cada fase
- Número de issues identificados por agente
- Conflitos entre agentes
- Taxa de aprovação/rejeição
- Histórico de decisões Go/No-go

---

## 🔄 Melhoria Contínua

Após cada execução:
- [ ] Revisar conflitos entre agentes
- [ ] Refinar critérios de decisão
- [ ] Atualizar templates baseado em feedback
- [ ] Documentar aprendizados

---

## 📚 Documentação Relacionada

- `processes/workflow-execution.md` - Processo detalhado de execução
- `processes/agent-coordination.md` - Como coordenar agentes
- `processes/cross-evaluation.md` - Processo de avaliação cruzada
- `processes/go-no-go-decision.md` - Critérios de decisão

---

**Última Atualização**: 2024-12-30  
**Status**: ✅ Sistema Ativo

