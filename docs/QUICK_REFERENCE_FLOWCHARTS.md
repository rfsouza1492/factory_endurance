# 🚀 Quick Reference - Flowcharts Essenciais

**Versão:** 2.0  
**Última Atualização:** 2025-12-30

---

## 📋 Visão Rápida

Este documento contém os flowcharts essenciais para entendimento rápido do sistema Maestro Workflow.

Para flowcharts detalhados, consulte [PROCESS_FLOWCHARTS.md](PROCESS_FLOWCHARTS.md).

---

## 🔄 Fluxo Principal Simplificado

```mermaid
graph LR
    A[Product Manager] -->|backlog-ready.json| B[Maestro]
    B --> C[Fase 1: Execução]
    C --> D[Fase 2: Avaliação]
    D --> E[Fase 3: Decisão]
    E --> F[Fase 4: Aprovação]
    F -->|workflow-feedback.json| A
    
    style A fill:#d1ecf1
    style B fill:#fff3cd
    style C fill:#e1f5ff
    style D fill:#e1f5ff
    style E fill:#e1f5ff
    style F fill:#e1f5ff
```

---

## 🎯 Decisão Go/No-go (Simplificada)

```mermaid
graph TB
    Start([Consolidar Preocupações]) --> CheckP0{Issues P0<br/>de Segurança?}
    
    CheckP0 -->|Sim| NOGO[❌ NO-GO]
    CheckP0 -->|Não| CheckScore{Score<br/>< 50?}
    
    CheckScore -->|Sim| NOGO
    CheckScore -->|Não| CheckP1{Issues P1<br/>ou Score 50-74?}
    
    CheckP1 -->|Sim| GOC[⚠️ GO WITH CONCERNS]
    CheckP1 -->|Não| GO[✅ GO]
    
    NOGO --> Backlog[Gerar Backlog]
    GOC --> Backlog
    GO --> Backlog
    
    Backlog --> End([Fim])
    
    style NOGO fill:#f8d7da
    style GOC fill:#fff3cd
    style GO fill:#d4edda
```

---

## 📊 Agentes e Suas Funções

```mermaid
graph TB
    PM[Product Manager<br/>📊 Trigger Inicial] --> Maestro[Maestro<br/>🎭 Coordenador]
    
    Maestro --> Agents[6 Agentes em Paralelo]
    
    Agents --> Arch[Architecture<br/>🏗️ Estrutura]
    Agents --> Code[Code Quality<br/>✅ Qualidade]
    Agents --> Docs[Document Analysis<br/>📚 Documentação]
    Agents --> Sec[Security<br/>🔒 Segurança]
    Agents --> Perf[Performance<br/>⚡ Performance]
    Agents --> Dep[Dependency<br/>📦 Dependências]
    
    Arch --> Results[Resultados]
    Code --> Results
    Docs --> Results
    Sec --> Results
    Perf --> Results
    Dep --> Results
    
    Results --> Decision[Decisão Go/No-go]
    
    style PM fill:#d1ecf1
    style Maestro fill:#fff3cd
    style Agents fill:#e1f5ff
    style Decision fill:#d4edda
```

---

## 🔄 Ciclo de Feedback

```mermaid
graph LR
    PM[Product Manager] -->|1. backlog-ready.json| M[Maestro]
    M -->|2. Executa Workflow| W[Workflow]
    W -->|3. Gera Decisão| D[Decisão]
    D -->|4. Gera Backlog| B[Backlog Atualizado]
    B -->|5. workflow-feedback.json| PM
    
    style PM fill:#d1ecf1
    style M fill:#fff3cd
    style W fill:#e1f5ff
    style D fill:#d4edda
    style B fill:#d1ecf1
```

---

## 📁 Estrutura de Dados

```mermaid
graph TB
    Events[events/] -->|backlog-ready.json| Maestro[Maestro]
    
    Maestro --> Results[results/]
    Results --> Arch[architecture-review/]
    Results --> Code[code-quality-review/]
    Results --> Docs[document-analysis/]
    Results --> Sec[security-audit/]
    Results --> Perf[performance-analysis/]
    Results --> Dep[dependency-management/]
    
    Results --> Evals[evaluations/]
    Evals --> Decisions[decisions/]
    Decisions --> Backlog[backlog/]
    
    Backlog -->|workflow-feedback.json| Events
    
    style Events fill:#d4edda
    style Results fill:#e1f5ff
    style Evals fill:#e1f5ff
    style Decisions fill:#e1f5ff
    style Backlog fill:#e1f5ff
```

---

**Para flowcharts detalhados, consulte:** [PROCESS_FLOWCHARTS.md](PROCESS_FLOWCHARTS.md)

