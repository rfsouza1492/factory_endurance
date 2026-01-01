# 🔄 Flowcharts dos Processos - Maestro Workflow

**Data:** 2025-12-30  
**Versão:** 2.0  
**Status:** ✅ Atualizado

---

## 📋 Índice

1. [Workflow Execution Process](#1-workflow-execution-process)
2. [Product Manager Process](#2-product-manager-process)
3. [Go/No-go Decision Process](#3-go-no-go-decision-process)
4. [Backlog Generation Process](#4-backlog-generation-process)
5. [Fluxo Completo Integrado](#5-fluxo-completo-integrado)

---

## 1. Workflow Execution Process

### 1.1 Fluxograma Principal

```mermaid
graph TB
    Start([🚀 Início]) --> CheckBacklog{Verificar Backlog<br/>do Product Manager}
    
    CheckBacklog -->|Backlog encontrado| LoadBacklog[📋 Carregar Backlog]
    CheckBacklog -->|Sem backlog| Phase1
    
    LoadBacklog --> Phase1[📋 FASE 1: Execução Paralela]
    
    Phase1 --> ArchAgent[🏗️ Architecture Review Agent]
    Phase1 --> CodeAgent[✅ Code Quality Review Agent]
    Phase1 --> DocAgent[📚 Document Analysis Agent]
    Phase1 --> SecAgent[🔒 Security Audit Agent]
    Phase1 --> PerfAgent[⚡ Performance Analysis Agent]
    Phase1 --> DepAgent[📦 Dependency Management Agent]
    
    ArchAgent --> Results[📁 shared/results/]
    CodeAgent --> Results
    DocAgent --> Results
    SecAgent --> Results
    PerfAgent --> Results
    DepAgent --> Results
    
    Results --> Phase2[🔄 FASE 2: Avaliação Cruzada]
    
    Phase2 --> Eval1[Architecture avalia Code Quality]
    Phase2 --> Eval2[Architecture avalia Document Analysis]
    Phase2 --> Eval3[Code Quality avalia Architecture]
    Phase2 --> Eval4[Code Quality avalia Document Analysis]
    Phase2 --> Eval5[Document Analysis avalia Architecture]
    Phase2 --> Eval6[Document Analysis avalia Code Quality]
    
    Eval1 --> Evals[📁 shared/evaluations/]
    Eval2 --> Evals
    Eval3 --> Evals
    Eval4 --> Evals
    Eval5 --> Evals
    Eval6 --> Evals
    
    Evals --> Phase3[🎯 FASE 3: Decisão Go/No-go]
    
    Phase3 --> Consolidate[Consolidar Preocupações]
    Phase3 --> Conflicts[Identificar Conflitos]
    Phase3 --> Scores[Calcular Scores]
    Phase3 --> Decision{Decisão}
    
    Consolidate --> Decision
    Conflicts --> Decision
    Scores --> Decision
    
    Decision -->|Nenhum Issue Crítico| GO[✅ GO]
    Decision -->|Issues Críticos| NOGO[❌ NO-GO]
    Decision -->|Issues Alta Prioridade| GOC[⚠️ GO WITH CONCERNS]
    
    GO --> BacklogGen[📋 Gerar Backlog Atualizado]
    NOGO --> BacklogGen
    GOC --> BacklogGen
    
    BacklogGen --> Feedback[📤 Retornar Feedback<br/>para Product Manager]
    
    Feedback --> Phase4[✅ FASE 4: Aprovação]
    
    Phase4 --> WebUI[🌐 Interface Web<br/>localhost:3000]
    
    WebUI --> UserDecision{Usuário Decide}
    
    UserDecision -->|Aprovar| Approved[✅ Aprovado]
    UserDecision -->|Rejeitar| Rejected[❌ Rejeitado]
    UserDecision -->|Revisar| Review[🔄 Revisar]
    
    Approved --> End([✅ Fim])
    Rejected --> Phase3
    Review --> Phase2
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Phase1 fill:#fff3cd
    style Phase2 fill:#fff3cd
    style Phase3 fill:#fff3cd
    style Phase4 fill:#fff3cd
    style GO fill:#d4edda
    style NOGO fill:#f8d7da
    style GOC fill:#fff3cd
```

---

### 1.2 Fase 1: Execução Paralela (Detalhada)

```mermaid
graph TB
    Start([Fase 1: Execução Paralela]) --> Prepare[Preparar Ambiente Compartilhado]
    
    Prepare --> Parallel[Executar Agentes em Paralelo]
    
    Parallel --> Arch[🏗️ Architecture Review]
    Parallel --> Code[✅ Code Quality Review]
    Parallel --> Docs[📚 Document Analysis]
    Parallel --> Sec[🔒 Security Audit]
    Parallel --> Perf[⚡ Performance Analysis]
    Parallel --> Dep[📦 Dependency Management]
    
    Arch --> ArchResult[📄 Review Report<br/>Score: X/100<br/>Issues: P0, P1, P2, P3]
    Code --> CodeResult[📄 Quality Report<br/>Score: X/100<br/>Issues: P0, P1, P2, P3]
    Docs --> DocsResult[📄 Analysis Report<br/>Score: X/100<br/>Gaps identificados]
    Sec --> SecResult[📄 Security Report<br/>Score: X/100<br/>Vulnerabilidades]
    Perf --> PerfResult[📄 Performance Report<br/>Score: X/100<br/>Bottlenecks]
    Dep --> DepResult[📄 Dependency Report<br/>Score: X/100<br/>Vulnerabilidades/Desatualizadas]
    
    ArchResult --> Save1[💾 Salvar em<br/>results/architecture-review/]
    CodeResult --> Save2[💾 Salvar em<br/>results/code-quality-review/]
    DocsResult --> Save3[💾 Salvar em<br/>results/document-analysis/]
    SecResult --> Save4[💾 Salvar em<br/>results/security-audit/]
    PerfResult --> Save5[💾 Salvar em<br/>results/performance-analysis/]
    DepResult --> Save6[💾 Salvar em<br/>results/dependency-management/]
    
    Save1 --> Consolidate[Consolidar Resultados]
    Save2 --> Consolidate
    Save3 --> Consolidate
    Save4 --> Consolidate
    Save5 --> Consolidate
    Save6 --> Consolidate
    
    Consolidate --> End([Resultados Prontos<br/>para Fase 2])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Parallel fill:#fff3cd
    style Consolidate fill:#d1ecf1
```

---

### 1.3 Fase 2: Avaliação Cruzada (Detalhada)

```mermaid
graph TB
    Start([Fase 2: Avaliação Cruzada]) --> ReadResults[Ler Resultados<br/>de Todos os Agentes]
    
    ReadResults --> Eval1[📐 Architecture avalia<br/>Code Quality]
    ReadResults --> Eval2[📐 Architecture avalia<br/>Document Analysis]
    ReadResults --> Eval3[✅ Code Quality avalia<br/>Architecture]
    ReadResults --> Eval4[✅ Code Quality avalia<br/>Document Analysis]
    ReadResults --> Eval5[📚 Document Analysis avalia<br/>Architecture]
    ReadResults --> Eval6[📚 Document Analysis avalia<br/>Code Quality]
    
    Eval1 --> Concerns1[Preocupações Arquiteturais<br/>Críticas e Altas]
    Eval2 --> Concerns2[Requisitos Arquiteturais<br/>da Documentação]
    Eval3 --> Concerns3[Qualidade Arquitetural<br/>Code Smells]
    Eval4 --> Concerns4[Requisitos de Qualidade<br/>da Documentação]
    Eval5 --> Concerns5[Necessidades de<br/>Documentação Arquitetural]
    Eval6 --> Concerns6[Documentação de<br/>Padrões de Código]
    
    Concerns1 --> Save1[💾 Salvar<br/>architecture-evaluates-code.md]
    Concerns2 --> Save2[💾 Salvar<br/>architecture-evaluates-docs.md]
    Concerns3 --> Save3[💾 Salvar<br/>code-evaluates-architecture.md]
    Concerns4 --> Save4[💾 Salvar<br/>code-evaluates-docs.md]
    Concerns5 --> Save5[💾 Salvar<br/>docs-evaluates-architecture.md]
    Concerns6 --> Save6[💾 Salvar<br/>docs-evaluates-code.md]
    
    Save1 --> Consolidate[Consolidar Avaliações]
    Save2 --> Consolidate
    Save3 --> Consolidate
    Save4 --> Consolidate
    Save5 --> Consolidate
    Save6 --> Consolidate
    
    Consolidate --> End([Avaliações Prontas<br/>para Fase 3])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Consolidate fill:#d1ecf1
```

---

## 2. Product Manager Process

### 2.1 Fluxograma Completo

```mermaid
graph TB
    Start([🚀 Product Manager Agent<br/>Inicia Análise]) --> ReadRoadmap[📖 Ler Roadmap e Milestones]
    
    ReadRoadmap --> Extract[Extrair Informações]
    Extract --> Milestones[Milestones e Versões]
    Extract --> Features[Features por Milestone]
    Extract --> Deadlines[Deadlines]
    
    Milestones --> AnalyzeCode[🔍 Analisar Código Atual]
    Features --> AnalyzeCode
    Deadlines --> AnalyzeCode
    
    AnalyzeCode --> CheckStructure[Verificar Estrutura]
    AnalyzeCode --> ListFiles[Listar Arquivos]
    AnalyzeCode --> DetectFeatures[Detectar Features Implementadas]
    AnalyzeCode --> CheckQuality[Verificar Qualidade Básica]
    
    CheckStructure --> Compare[⚖️ Comparar com Milestones]
    ListFiles --> Compare
    DetectFeatures --> Compare
    CheckQuality --> Compare
    
    Compare --> IdentifyGaps[Identificar Gaps]
    
    IdentifyGaps --> MissingFeatures[Features Faltantes]
    IdentifyGaps --> QualityIssues[Issues de Qualidade]
    IdentifyGaps --> DocGaps[Gaps de Documentação]
    IdentifyGaps --> TestGaps[Gaps de Testes]
    
    MissingFeatures --> Prioritize[Priorizar Gaps]
    QualityIssues --> Prioritize
    DocGaps --> Prioritize
    TestGaps --> Prioritize
    
    Prioritize --> GenerateBacklog[📋 Gerar Backlog de Tarefas]
    
    GenerateBacklog --> Convert[Converter Gaps em Tarefas]
    Convert --> Estimate[Estimar Esforço]
    Estimate --> Dependencies[Identificar Dependências]
    Dependencies --> Group[Agrupar Tarefas]
    Group --> Summary[Calcular Summary]
    
    Summary --> SaveBacklog[💾 Salvar Backlog]
    
    SaveBacklog --> SaveJSON[Salvar backlog.json]
    SaveBacklog --> SaveCurrent[Salvar current-backlog.json]
    
    SaveJSON --> CreateEvent[📤 Criar Evento]
    SaveCurrent --> CreateEvent
    
    CreateEvent --> EventFile[backlog-ready.json]
    
    EventFile --> GenerateReport[📄 Gerar Relatório de Status]
    
    GenerateReport --> ReportFile[status.md]
    
    ReportFile --> NotifyMaestro[🚀 Acionar Maestro]
    
    NotifyMaestro --> WaitFeedback[⏳ Aguardar Feedback<br/>do Maestro]
    
    WaitFeedback --> ReadFeedback[📥 Ler Feedback]
    
    ReadFeedback --> Feedback{Feedback Recebido?}
    
    Feedback -->|Sim| ReviewFeedback[Revisar Feedback]
    Feedback -->|Não| WaitFeedback
    
    ReviewFeedback --> Decision{Decidir Próximos Passos}
    
    Decision -->|Aprovar| Approve[✅ Aprovar Implementação]
    Decision -->|Melhorar| Improve[🔄 Solicitar Melhorias]
    Decision -->|Rejeitar| Reject[❌ Rejeitar]
    
    Approve --> End([✅ Fim])
    Improve --> GenerateBacklog
    Reject --> End
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style GenerateBacklog fill:#fff3cd
    style NotifyMaestro fill:#d1ecf1
    style Decision fill:#f8d7da
```

---

### 2.2 Geração de Backlog (Detalhada)

```mermaid
graph TB
    Start([Gerar Backlog]) --> CollectGaps[Coletar Gaps Identificados]
    
    CollectGaps --> GapTypes{Tipo de Gap}
    
    GapTypes -->|Feature Faltante| FeatureTask[Tarefa tipo: feature]
    GapTypes -->|Issue de Qualidade| FixTask[Tarefa tipo: fix]
    GapTypes -->|Gap de Documentação| DocsTask[Tarefa tipo: docs]
    GapTypes -->|Gap de Testes| TestTask[Tarefa tipo: test]
    
    FeatureTask --> CreateTask[Criar Tarefa]
    FixTask --> CreateTask
    DocsTask --> CreateTask
    TestTask --> CreateTask
    
    CreateTask --> AssignID[Atribuir ID único]
    AssignID --> GenerateTitle[Gerar Título]
    GenerateTitle --> DetermineType[Determinar Tipo]
    DetermineType --> AssignPriority[Atribuir Prioridade]
    AssignPriority --> EstimateEffort[Estimar Esforço]
    EstimateEffort --> GenerateDesc[Gerar Descrição]
    GenerateDesc --> CreateCriteria[Criar Critérios de Aceitação]
    CreateCriteria --> IdentifyDeps[Identificar Dependências]
    
    IdentifyDeps --> PrioritizeTasks[Priorizar Tarefas]
    
    PrioritizeTasks --> GroupTasks[Agrupar Tarefas]
    
    GroupTasks --> ByPriority[Por Prioridade<br/>P0, P1, P2, P3]
    GroupTasks --> ByType[Por Tipo<br/>feature, fix, docs, test]
    GroupTasks --> ByEffort[Por Esforço<br/>XS, S, M, L, XL]
    
    ByPriority --> CalculateSummary[Calcular Summary]
    ByType --> CalculateSummary
    ByEffort --> CalculateSummary
    
    CalculateSummary --> TotalTasks[Total de Tarefas]
    CalculateSummary --> ByPriorityCount[Por Prioridade]
    CalculateSummary --> TotalEffort[Esforço Total]
    CalculateSummary --> CompletionDate[Data de Conclusão]
    
    TotalTasks --> CreateStructure[Criar Estrutura de Backlog]
    ByPriorityCount --> CreateStructure
    TotalEffort --> CreateStructure
    CompletionDate --> CreateStructure
    
    CreateStructure --> SaveBacklog[💾 Salvar Backlog]
    
    SaveBacklog --> End([Backlog Gerado])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style CreateTask fill:#fff3cd
    style CalculateSummary fill:#d1ecf1
```

---

## 3. Go/No-go Decision Process

### 3.1 Fluxograma Completo

```mermaid
graph TB
    Start([Fase 3: Decisão Go/No-go]) --> Collect[🔍 Step 1: Coletar Preocupações]
    
    Collect --> ReadAgents[Ler Resultados dos Agentes]
    Collect --> ReadEvals[Ler Avaliações Cruzadas]
    
    ReadAgents --> ArchIssues[Architecture Issues]
    ReadAgents --> CodeIssues[Code Quality Issues]
    ReadAgents --> DocsIssues[Document Analysis Issues]
    ReadAgents --> SecIssues[Security Issues]
    ReadAgents --> PerfIssues[Performance Issues]
    ReadAgents --> DepIssues[Dependency Issues]
    
    ReadEvals --> CrossConcerns[Preocupações das Avaliações]
    
    ArchIssues --> Consolidate[Consolidar Lista]
    CodeIssues --> Consolidate
    DocsIssues --> Consolidate
    SecIssues --> Consolidate
    PerfIssues --> Consolidate
    DepIssues --> Consolidate
    CrossConcerns --> Consolidate
    
    Consolidate --> RemoveDups[Remover Duplicatas]
    RemoveDups --> Categorize[Categorizar por Tipo e Prioridade]
    
    Categorize --> Prioritize[🎯 Step 2: Priorizar]
    
    Prioritize --> CalculateSeverity[Calcular Severidade]
    Prioritize --> CalculateImpact[Calcular Impacto]
    CalculateSeverity --> ApplyMatrix[Aplicar Matriz de Priorização]
    CalculateImpact --> ApplyMatrix
    
    ApplyMatrix --> P0[Issues P0 - Críticos]
    ApplyMatrix --> P1[Issues P1 - Alta]
    ApplyMatrix --> P2[Issues P2 - Média]
    ApplyMatrix --> P3[Issues P3 - Baixa]
    
    P0 --> IdentifyConflicts[⚠️ Step 3: Identificar Conflitos]
    P1 --> IdentifyConflicts
    P2 --> IdentifyConflicts
    P3 --> IdentifyConflicts
    
    IdentifyConflicts --> CompareRecs[Comparar Recomendações]
    CompareRecs --> AnalyzeConflicts[Analisar Cada Conflito]
    AnalyzeConflicts --> ClassifyConflicts[Classificar Conflitos]
    
    ClassifyConflicts --> CalculateScores[📊 Step 4: Calcular Scores]
    
    CalculateScores --> CheckNewAgents{Novos Agentes<br/>Presentes?}
    
    CheckNewAgents -->|Sim| FormulaNew[Fórmula com Novos Agentes<br/>Arch 30% + Code 30% + Docs 15%<br/>+ Security 15% + Perf 5% + Dep 5%]
    CheckNewAgents -->|Não| FormulaOld[Fórmula Original<br/>Arch 40% + Code 40% + Docs 20%]
    
    FormulaNew --> AdjustScores[Ajustar Scores]
    FormulaOld --> AdjustScores
    
    AdjustScores --> ApplyCriteria[🎯 Step 5: Aplicar Critérios]
    
    ApplyCriteria --> CheckNOGO{Verificar<br/>Critérios NO-GO}
    
    CheckNOGO -->|P0 Security| NOGO[❌ NO-GO]
    CheckNOGO -->|P0 Geral| NOGO
    CheckNOGO -->|Bloqueador| NOGO
    CheckNOGO -->|Conflito Bloqueador| NOGO
    CheckNOGO -->|Score < 50| NOGO
    CheckNOGO -->|Nenhum| CheckCONCERNS
    
    CheckCONCERNS{Verificar<br/>Critérios GO WITH CONCERNS} -->|P1 Issues| GOC[⚠️ GO WITH CONCERNS]
    CheckCONCERNS -->|Vulnerabilidades Alta| GOC
    CheckCONCERNS -->|Bottlenecks| GOC
    CheckCONCERNS -->|Dependências Desatualizadas| GOC
    CheckCONCERNS -->|Score 50-74| GOC
    CheckCONCERNS -->|Nenhum| GO
    
    GO[✅ GO]
    
    NOGO --> GenerateReport[📝 Step 6: Gerar Relatório]
    GOC --> GenerateReport
    GO --> GenerateReport
    
    GenerateReport --> ReportFile[go-no-go-report.md]
    
    ReportFile --> GenerateBacklog[📋 Step 7: Gerar Backlog Atualizado]
    
    GenerateBacklog --> ConvertIssues[Converter Issues em Tarefas]
    ConvertIssues --> MergeBacklog{Mesclar com<br/>Backlog Original?}
    
    MergeBacklog -->|Sim| Merge[Mesclar Tarefas]
    MergeBacklog -->|Não| NewBacklog[Criar Novo Backlog]
    
    Merge --> SaveBacklog[💾 Salvar Backlog]
    NewBacklog --> SaveBacklog
    
    SaveBacklog --> ReturnFeedback[📤 Step 8: Retornar Feedback]
    
    ReturnFeedback --> CreateFeedback[workflow-feedback.json]
    CreateFeedback --> RemoveEvent[Remover backlog-ready.json]
    
    RemoveEvent --> End([Decisão Completa])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style NOGO fill:#f8d7da
    style GOC fill:#fff3cd
    style GO fill:#d4edda
    style CalculateScores fill:#d1ecf1
    style GenerateBacklog fill:#fff3cd
```

---

### 3.2 Matriz de Decisão

```mermaid
graph TB
    Start([Aplicar Critérios de Decisão]) --> CheckP0{Issues P0<br/>de Segurança?}
    
    CheckP0 -->|Sim| NOGO1[❌ NO-GO<br/>Vulnerabilidade Crítica]
    CheckP0 -->|Não| CheckP0Gen
    
    CheckP0Gen{Issues P0<br/>Geral?} -->|Sim| CheckSecurity{É de<br/>Segurança?}
    CheckP0Gen -->|Não| CheckBlockers
    
    CheckSecurity -->|Sim| NOGO2[❌ NO-GO<br/>Security Critical]
    CheckSecurity -->|Não| GOC1[⚠️ GO WITH CONCERNS<br/>P0 não-security]
    
    CheckBlockers{Bloqueadores<br/>Arquiteturais?} -->|Sim| NOGO3[❌ NO-GO<br/>Blocker]
    CheckBlockers -->|Não| CheckConflicts
    
    CheckConflicts{Conflitos<br/>Não Resolvíveis?} -->|Sim| NOGO4[❌ NO-GO<br/>Conflito Bloqueador]
    CheckConflicts -->|Não| CheckScore
    
    CheckScore{Score Geral<br/>< 50?} -->|Sim| NOGO5[❌ NO-GO<br/>Score Muito Baixo]
    CheckScore -->|Não| CheckP1
    
    CheckP1{Issues P1<br/>ou Vulnerabilidades Alta?} -->|Sim| CheckMultiple{2+ Critérios<br/>GO WITH CONCERNS?}
    CheckP1 -->|Não| CheckScore75
    
    CheckMultiple -->|Sim| GOC2[⚠️ GO WITH CONCERNS<br/>Múltiplas Preocupações]
    CheckMultiple -->|Não| GOC3[⚠️ GO WITH CONCERNS<br/>Menor]
    
    CheckScore75{Score Geral<br/>50-74?} -->|Sim| GOC4[⚠️ GO WITH CONCERNS<br/>Score Moderado]
    CheckScore75 -->|Não| GO1
    
    GO1[✅ GO<br/>Nenhum Blocker<br/>Score ≥ 75]
    
    NOGO1 --> End
    NOGO2 --> End
    NOGO3 --> End
    NOGO4 --> End
    NOGO5 --> End
    GOC1 --> End
    GOC2 --> End
    GOC3 --> End
    GOC4 --> End
    GO1 --> End([Decisão Final])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style NOGO1 fill:#f8d7da
    style NOGO2 fill:#f8d7da
    style NOGO3 fill:#f8d7da
    style NOGO4 fill:#f8d7da
    style NOGO5 fill:#f8d7da
    style GOC1 fill:#fff3cd
    style GOC2 fill:#fff3cd
    style GOC3 fill:#fff3cd
    style GOC4 fill:#fff3cd
    style GO1 fill:#d4edda
```

---

## 4. Backlog Generation Process

### 4.1 Fluxograma Completo

```mermaid
graph TB
    Start([Backlog Generation Process]) --> Collect[Step 1: Coletar Issues]
    
    Collect --> FromAgents[Issues dos Agentes]
    Collect --> FromEvals[Issues das Avaliações]
    Collect --> FromDecision[Issues da Decisão]
    
    FromAgents --> ArchIssues[Architecture Issues]
    FromAgents --> CodeIssues[Code Quality Issues]
    FromAgents --> DocsIssues[Document Analysis Issues]
    FromAgents --> SecIssues[Security Issues]
    FromAgents --> PerfIssues[Performance Issues]
    FromAgents --> DepIssues[Dependency Issues]
    
    ArchIssues --> Group[Step 2: Agrupar por Tipo]
    CodeIssues --> Group
    DocsIssues --> Group
    SecIssues --> Group
    PerfIssues --> Group
    DepIssues --> Group
    FromEvals --> Group
    FromDecision --> Group
    
    Group --> SecurityGroup[Security]
    Group --> PerformanceGroup[Performance]
    Group --> CodeQualityGroup[Code Quality]
    Group --> ArchitectureGroup[Architecture]
    Group --> DocumentationGroup[Documentation]
    Group --> TestingGroup[Testing]
    Group --> OtherGroup[Other]
    
    SecurityGroup --> Convert[Step 3: Converter em Tarefas]
    PerformanceGroup --> Convert
    CodeQualityGroup --> Convert
    ArchitectureGroup --> Convert
    DocumentationGroup --> Convert
    TestingGroup --> Convert
    OtherGroup --> Convert
    
    Convert --> GenerateID[Gerar ID único]
    GenerateID --> CreateTitle[Criar Título]
    CreateTitle --> DetermineType[Determinar Tipo]
    DetermineType --> AssignPriority[Atribuir Prioridade]
    AssignPriority --> EstimateEffort[Estimar Esforço]
    EstimateEffort --> GenerateDesc[Gerar Descrição]
    GenerateDesc --> CreateCriteria[Criar Critérios]
    CreateCriteria --> MarkLocation[Marcar Localização]
    MarkLocation --> MarkAgent[Marcar Agente]
    
    MarkAgent --> Prioritize[Step 4: Priorizar Tarefas]
    
    Prioritize --> SortPriority[Ordenar por Prioridade]
    SortPriority --> SortEffort[Ordenar por Esforço]
    
    SortEffort --> IdentifyDeps[Step 5: Identificar Dependências]
    
    IdentifyDeps --> AnalyzeDesc[Analisar Descrições]
    AnalyzeDesc --> FindDeps[Encontrar Dependências]
    FindDeps --> CreateGraph[Criar Grafo de Dependências]
    
    CreateGraph --> GroupTasks[Step 6: Agrupar Tarefas]
    
    GroupTasks --> ByPriority[Por Prioridade<br/>P0, P1, P2, P3]
    GroupTasks --> ByType[Por Tipo<br/>feature, fix, refactor, test, docs]
    GroupTasks --> ByEffort[Por Esforço<br/>XS, S, M, L, XL]
    
    ByPriority --> Calculate[Step 7: Calcular Summary]
    ByType --> Calculate
    ByEffort --> Calculate
    
    Calculate --> TotalTasks[Total de Tarefas]
    Calculate --> ByPriorityCount[Por Prioridade]
    Calculate --> TotalHours[Esforço Total em Horas]
    Calculate --> CompletionDate[Data de Conclusão]
    
    TotalTasks --> CreateStructure[Step 8: Criar Estrutura]
    ByPriorityCount --> CreateStructure
    TotalHours --> CreateStructure
    CompletionDate --> CreateStructure
    
    CreateStructure --> CheckOriginal{Backlog Original<br/>Existe?}
    
    CheckOriginal -->|Sim| Merge[Step 9: Mesclar]
    CheckOriginal -->|Não| NewBacklog[Criar Novo]
    
    Merge --> MergeTasks[Mesclar Tarefas]
    Merge --> KeepId[Manter backlogId Original]
    Merge --> UpdateSummary[Atualizar Summary]
    
    NewBacklog --> Save[Step 10: Salvar Backlog]
    MergeTasks --> Save
    KeepId --> Save
    UpdateSummary --> Save
    
    Save --> SaveJSON[Salvar [backlogId].json]
    Save --> SaveCurrent[Salvar current-backlog.json]
    
    SaveJSON --> End([Backlog Gerado])
    SaveCurrent --> End
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Convert fill:#fff3cd
    style Calculate fill:#d1ecf1
    style Merge fill:#fff3cd
```

---

### 4.2 Conversão de Issues em Tarefas

```mermaid
graph TB
    Start([Converter Issue em Tarefa]) --> ReadIssue[Ler Issue]
    
    ReadIssue --> ExtractInfo[Extrair Informações]
    ExtractInfo --> Message[Mensagem]
    ExtractInfo --> Type[Tipo]
    ExtractInfo --> Severity[Severidade]
    ExtractInfo --> Location[Localização]
    ExtractInfo --> Agent[Agente]
    
    Message --> GenerateID[Gerar ID: task-001]
    GenerateID --> CreateTitle[Criar Título<br/>baseado na mensagem]
    
    CreateTitle --> DetermineTaskType{Determinar<br/>Tipo de Tarefa}
    
    DetermineTaskType -->|implement/add/create| Feature[Tarefa: feature]
    DetermineTaskType -->|fix/correct/resolve| Fix[Tarefa: fix]
    DetermineTaskType -->|refactor/improve/optimize| Refactor[Tarefa: refactor]
    DetermineTaskType -->|test/coverage| Test[Tarefa: test]
    DetermineTaskType -->|document/readme/doc| Docs[Tarefa: docs]
    DetermineTaskType -->|outro| Fix
    
    Feature --> AssignPriority[Atribuir Prioridade]
    Fix --> AssignPriority
    Refactor --> AssignPriority
    Test --> AssignPriority
    Docs --> AssignPriority
    
    AssignPriority --> MapPriority{Severidade}
    MapPriority -->|critical/P0| P0[Prioridade: P0]
    MapPriority -->|high/P1| P1[Prioridade: P1]
    MapPriority -->|medium/P2| P2[Prioridade: P2]
    MapPriority -->|low/P3| P3[Prioridade: P3]
    
    P0 --> EstimateEffort[Estimar Esforço]
    P1 --> EstimateEffort
    P2 --> EstimateEffort
    P3 --> EstimateEffort
    
    EstimateEffort --> EffortLogic{Lógica de Esforço}
    EffortLogic -->|P0| M_Effort[Esforço: M 4-8h]
    EffortLogic -->|P1| S_Effort[Esforço: S 1-4h]
    EffortLogic -->|refactor| L_Effort[Esforço: L 8-16h]
    EffortLogic -->|docs| XS_Effort[Esforço: XS <1h]
    
    M_Effort --> GenerateDesc[Gerar Descrição]
    S_Effort --> GenerateDesc
    L_Effort --> GenerateDesc
    XS_Effort --> GenerateDesc
    
    GenerateDesc --> CreateCriteria[Gerar Critérios de Aceitação]
    
    CreateCriteria --> CriteriaFeature[Feature:<br/>- Funciona conforme espec<br/>- Testes passam<br/>- Docs atualizada]
    CreateCriteria --> CriteriaFix[Fix:<br/>- Issue resolvido<br/>- Código validado<br/>- Testes passam]
    CreateCriteria --> CriteriaRefactor[Refactor:<br/>- Refatoração completa<br/>- Funcionalidade mantida<br/>- Testes atualizados]
    CreateCriteria --> CriteriaTest[Test:<br/>- Testes criados<br/>- Cobertura adequada<br/>- Todos passam]
    CreateCriteria --> CriteriaDocs[Docs:<br/>- Docs criada/atualizada<br/>- Exemplos incluídos<br/>- Formato correto]
    
    CriteriaFeature --> AddMetadata[Adicionar Metadados]
    CriteriaFix --> AddMetadata
    CriteriaRefactor --> AddMetadata
    CriteriaTest --> AddMetadata
    CriteriaDocs --> AddMetadata
    
    AddMetadata --> AddLocation[Adicionar Location]
    AddMetadata --> AddAgent[Adicionar Agent]
    AddMetadata --> AddStatus[Status: todo]
    AddMetadata --> AddTimestamp[createdAt: timestamp]
    AddMetadata --> AddOriginal[originalIssue: referência]
    
    AddLocation --> TaskComplete[Tarefa Completa]
    AddAgent --> TaskComplete
    AddStatus --> TaskComplete
    AddTimestamp --> TaskComplete
    AddOriginal --> TaskComplete
    
    TaskComplete --> End([Tarefa Criada])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style DetermineTaskType fill:#fff3cd
    style EstimateEffort fill:#d1ecf1
```

---

## 5. Fluxo Completo Integrado

### 5.1 Workflow End-to-End

```mermaid
graph TB
    Start([🚀 Sistema Maestro Workflow]) --> PM[📊 Product Manager Agent]
    
    PM --> PM1[Ler Roadmap]
    PM1 --> PM2[Analisar Código]
    PM2 --> PM3[Comparar Milestones]
    PM3 --> PM4[Identificar Gaps]
    PM4 --> PM5[Gerar Backlog]
    PM5 --> PM6[Salvar Backlog]
    PM6 --> PM7[Criar Evento backlog-ready.json]
    
    PM7 --> Maestro[🎭 Maestro Detecta Evento]
    
    Maestro --> CheckBacklog{Backlog<br/>Disponível?}
    
    CheckBacklog -->|Sim| LoadBacklog[Carregar Backlog]
    CheckBacklog -->|Não| Phase1
    
    LoadBacklog --> Phase1[📋 FASE 1: Execução Paralela]
    
    Phase1 --> Agents[6 Agentes Executam]
    Agents --> Results[Resultados Salvos]
    
    Results --> Phase2[🔄 FASE 2: Avaliação Cruzada]
    
    Phase2 --> Evals[6 Avaliações Cruzadas]
    Evals --> EvalResults[Avaliações Salvas]
    
    EvalResults --> Phase3[🎯 FASE 3: Decisão Go/No-go]
    
    Phase3 --> Consolidate[Consolidar Preocupações]
    Phase3 --> Conflicts[Identificar Conflitos]
    Phase3 --> Scores[Calcular Scores]
    Phase3 --> Decision{Decisão}
    
    Consolidate --> Decision
    Conflicts --> Decision
    Scores --> Decision
    
    Decision -->|GO| GO[✅ GO]
    Decision -->|NO-GO| NOGO[❌ NO-GO]
    Decision -->|GO WITH CONCERNS| GOC[⚠️ GO WITH CONCERNS]
    
    GO --> BacklogGen[📋 Gerar Backlog Atualizado]
    NOGO --> BacklogGen
    GOC --> BacklogGen
    
    BacklogGen --> BacklogGen1[Converter Issues em Tarefas]
    BacklogGen1 --> BacklogGen2[Priorizar Tarefas]
    BacklogGen2 --> BacklogGen3[Calcular Summary]
    BacklogGen3 --> BacklogGen4[Salvar Backlog]
    
    BacklogGen4 --> Feedback[📤 Retornar Feedback]
    
    Feedback --> Feedback1[Criar workflow-feedback.json]
    Feedback1 --> Feedback2[Incluir Decisão, Scores, Issues]
    Feedback2 --> Feedback3[Incluir Backlog Atualizado]
    
    Feedback3 --> Phase4[✅ FASE 4: Aprovação]
    
    Phase4 --> WebUI[🌐 Interface Web]
    WebUI --> User{Usuário<br/>Aprova?}
    
    User -->|Aprovar| Approved[✅ Aprovado]
    User -->|Rejeitar| Rejected[❌ Rejeitado]
    User -->|Revisar| Review[🔄 Revisar]
    
    Approved --> PMRead[Product Manager Lê Feedback]
    Rejected --> Phase3
    Review --> Phase2
    
    PMRead --> PMDecision{Product Manager<br/>Decide}
    
    PMDecision -->|Aprovar| Implement[🛠️ Implementar Tarefas]
    PMDecision -->|Melhorar| PM4
    PMDecision -->|Rejeitar| End
    
    Implement --> End([✅ Fim do Workflow])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style PM fill:#d1ecf1
    style Maestro fill:#fff3cd
    style Phase1 fill:#fff3cd
    style Phase2 fill:#fff3cd
    style Phase3 fill:#fff3cd
    style Phase4 fill:#fff3cd
    style GO fill:#d4edda
    style NOGO fill:#f8d7da
    style GOC fill:#fff3cd
    style BacklogGen fill:#d1ecf1
    style Feedback fill:#d1ecf1
```

---

### 5.2 Fluxo de Dados

```mermaid
graph LR
    PM[Product Manager] -->|backlog-ready.json| Events[📁 events/]
    
    Events --> Maestro[Maestro]
    
    Maestro -->|Executa Agentes| Results[📁 results/]
    Results -->|Architecture| ArchRes[architecture-review/]
    Results -->|Code Quality| CodeRes[code-quality-review/]
    Results -->|Document Analysis| DocsRes[document-analysis/]
    Results -->|Security| SecRes[security-audit/]
    Results -->|Performance| PerfRes[performance-analysis/]
    Results -->|Dependency| DepRes[dependency-management/]
    
    ArchRes --> Evals[📁 evaluations/]
    CodeRes --> Evals
    DocsRes --> Evals
    SecRes --> Evals
    PerfRes --> Evals
    DepRes --> Evals
    
    Evals --> Decisions[📁 decisions/]
    Decisions -->|go-no-go-report.md| DecisionFile[Decisão Final]
    
    DecisionFile --> Backlog[📁 backlog/]
    Backlog -->|backlog-improvements-*.json| BacklogFile[Backlog Atualizado]
    Backlog -->|current-backlog.json| CurrentBacklog[Backlog Atual]
    
    BacklogFile --> Events
    CurrentBacklog --> Events
    Events -->|workflow-feedback.json| Feedback[Feedback para PM]
    
    Feedback --> PM
    
    style PM fill:#d1ecf1
    style Maestro fill:#fff3cd
    style Results fill:#e1f5ff
    style Evals fill:#e1f5ff
    style Decisions fill:#e1f5ff
    style Backlog fill:#e1f5ff
    style Events fill:#d4edda
```

---

### 5.3 Ciclo de Vida Completo

```mermaid
stateDiagram-v2
    [*] --> ProductManager: Trigger Inicial
    
    ProductManager --> Analyzing: Ler Roadmap
    Analyzing --> Comparing: Analisar Código
    Comparing --> Generating: Comparar Milestones
    Generating --> BacklogReady: Gerar Backlog
    
    BacklogReady --> Maestro: Evento Criado
    
    Maestro --> Phase1: Carregar Backlog
    Phase1 --> Phase2: Agentes Executam
    Phase2 --> Phase3: Avaliações Cruzadas
    Phase3 --> Decision: Consolidar e Decidir
    
    Decision --> GO: Nenhum Blocker
    Decision --> GOC: Issues P1
    Decision --> NOGO: Issues P0
    
    GO --> BacklogGeneration: Gerar Backlog
    GOC --> BacklogGeneration
    NOGO --> BacklogGeneration
    
    BacklogGeneration --> Feedback: Retornar Feedback
    
    Feedback --> Approval: Interface Web
    Approval --> Approved: Usuário Aprova
    Approval --> Rejected: Usuário Rejeita
    Approval --> Review: Usuário Revisa
    
    Approved --> Implementation: Implementar
    Rejected --> Phase3: Re-executar Decisão
    Review --> Phase2: Re-executar Avaliação
    
    Implementation --> Verification: Verificar
    Verification --> [*]: Completo
    
    note right of ProductManager
        Fase 0: Trigger Inicial
    end note
    
    note right of Phase1
        Fase 1: Execução Paralela
        6 Agentes
    end note
    
    note right of Phase2
        Fase 2: Avaliação Cruzada
        6 Avaliações
    end note
    
    note right of Phase3
        Fase 3: Decisão Go/No-go
        Consolidar e Decidir
    end note
    
    note right of Approval
        Fase 4: Aprovação
        Interface Web
    end note
```

---

## 📊 Legenda de Cores

### Status dos Componentes

- 🟢 **Verde**: Processo completo e funcional
- 🟡 **Amarelo**: Processo em execução ou pendente
- 🔴 **Vermelho**: Bloqueador ou erro
- 🔵 **Azul**: Informação ou dados

### Tipos de Nós

- **Retângulo Arredondado**: Início/Fim
- **Retângulo**: Processo/Ação
- **Losango**: Decisão/Condição
- **Cilindro**: Dados/Arquivo
- **Paralelogramo**: Entrada/Saída

---

## 🔗 Referências

- [Workflow Execution Process](processes/workflow-execution.md)
- [Product Manager Process](processes/product-manager.md)
- [Go/No-go Decision Process](processes/go-no-go-decision.md)
- [Backlog Generation Process](processes/backlog-generation.md)
- [Process Review](PROCESS_REVIEW.md)
- [Process Mapping](PROCESS_MAPPING.md)

---

## 📝 Notas

### Sobre os Diagramas

1. **Mermaid Syntax**: Todos os diagramas usam sintaxe Mermaid válida
2. **Atualização**: Diagramas refletem a implementação atual (v2.0)
3. **Novos Agentes**: Security, Performance e Dependency incluídos
4. **Fase 0**: Product Manager Agent incluído como trigger inicial
5. **Backlog Generator**: Processo completo documentado

### Como Usar

1. **Visualização**: Use um renderizador Mermaid (GitHub, VS Code, etc.)
2. **Edição**: Edite diretamente o código Mermaid
3. **Exportação**: Exporte como PNG/SVG usando ferramentas Mermaid

---

**Última Atualização:** 2025-12-30  
**Versão:** 2.0  
**Status:** ✅ Completo e Atualizado

