# Workflow Execution Process

## 🎯 Purpose

Processo principal de execução do workflow maestro que coordena todos os agentes.

---

## 📋 Pré-requisitos

Antes de iniciar o workflow:

- [ ] Todos os agentes estão configurados e funcionais
- [ ] Estrutura de pastas `src/shared/` criada
- [ ] Templates disponíveis (se aplicável)
- [ ] Contexto do projeto disponível (código, documentação)
- [ ] Variável de ambiente `WORKSPACE_ROOT` configurada (opcional)

---

## 🔄 FASE 0: Product Manager Agent (Trigger Inicial)

### Step 0.1: Verificar Backlog do Product Manager

**Processo:**
1. Verificar se existe arquivo `src/shared/events/backlog-ready.json`
2. Verificar se existe `src/shared/backlog/current-backlog.json`
3. Se encontrado, carregar backlog e preparar workflow baseado em tarefas

**Output Esperado:**
- Backlog carregado (se disponível)
- Lista de tarefas para análise

**Checklist:**
- [ ] Backlog verificado
- [ ] Tarefas identificadas (se houver)
- [ ] Workflow preparado

---

## 🔄 FASE 1: Execução Paralela dos Agentes

### Step 1.1: Preparar Ambiente Compartilhado

```bash
# Estrutura criada automaticamente pelo script
src/shared/
├── results/
│   ├── architecture-review/
│   ├── code-quality-review/
│   ├── document-analysis/
│   ├── product-manager/
│   ├── security-audit/
│   ├── performance-analysis/
│   └── dependency-management/
├── evaluations/
├── decisions/
├── backlog/
└── events/
```

### Step 1.2: Executar Architecture Review Agent

**Comando/Processo:**
- Função: `runArchitectureReview()`
- Arquivo: `src/agents/architecture-agent.js`

**Output Esperado:**
- Review report completo
- Lista de issues críticos, altos, médios e baixos
- Sugestões de melhorias
- Análise de dependências
- Score de arquitetura (0-100)

**Salvar em:**
- `src/shared/results/architecture-review/[timestamp]-review.md`

**Checklist:**
- [ ] Review report gerado
- [ ] Issues identificados e categorizados
- [ ] Melhorias sugeridas
- [ ] Dependências mapeadas
- [ ] Score calculado
- [ ] Resultado salvo

---

### Step 1.3: Executar Code Quality Review Agent

**Comando/Processo:**
- Função: `runCodeQualityEvaluation()`
- Arquivo: `src/agents/code-quality-agent.js`
- Integra com: `evaluate-code-quality.js`

**Output Esperado:**
- Relatório de qualidade
- Score geral e por categoria
- Issues categorizados por severidade
- Recomendações priorizadas
- Score de qualidade (0-100)

**Salvar em:**
- `src/shared/results/code-quality-review/[timestamp]-evaluation.md`

**Checklist:**
- [ ] Relatório de qualidade gerado
- [ ] Scores calculados
- [ ] Issues categorizados
- [ ] Recomendações criadas
- [ ] Resultado salvo

---

### Step 1.4: Executar Document Analysis Agent

**Comando/Processo:**
- Função: `runDocumentAnalysis()`
- Arquivo: `src/agents/document-analysis-agent.js`

**Output Esperado:**
- Resumos de documentos
- Insights extraídos
- Action items identificados
- Gaps de documentação
- Score de documentação (0-100)

**Salvar em:**
- `src/shared/results/document-analysis/[timestamp]-analysis.md`

**Checklist:**
- [ ] Documentos analisados
- [ ] Insights extraídos
- [ ] Action items identificados
- [ ] Gaps documentados
- [ ] Score calculado
- [ ] Resultado salvo

---

### Step 1.5: Executar Security Audit Agent ⭐ NOVO

**Comando/Processo:**
- Função: `runSecurityAudit()`
- Arquivo: `src/agents/security-agent.js`

**Output Esperado:**
- Análise OWASP Top 10
- Vulnerabilidades identificadas
- Issues de segurança categorizados
- Recomendações de segurança
- Score de segurança (0-100)

**Análises Realizadas:**
- Análise de código (injection, XSS, broken auth, etc.)
- Análise de configurações
- Análise de dependências vulneráveis
- Análise de regras de segurança (Firestore, etc.)

**Salvar em:**
- `src/shared/results/security-audit/[timestamp]-audit.md`

**Checklist:**
- [ ] Análise de código completa
- [ ] Vulnerabilidades identificadas
- [ ] Configurações verificadas
- [ ] Dependências auditadas
- [ ] Regras de segurança verificadas
- [ ] Score calculado
- [ ] Resultado salvo

---

### Step 1.6: Executar Performance Analysis Agent ⭐ NOVO

**Comando/Processo:**
- Função: `runPerformanceAnalysis()`
- Arquivo: `src/agents/performance-agent.js`

**Output Esperado:**
- Análise de performance do código
- Identificação de bottlenecks
- Análise de queries (problema N+1)
- Análise de bundle size
- Análise de renderização
- Otimizações sugeridas
- Score de performance (0-100)

**Análises Realizadas:**
- Profiling básico de código
- Análise de queries de banco
- Análise de tamanho de bundle
- Análise de renderização e re-renders

**Salvar em:**
- `src/shared/results/performance-analysis/[timestamp]-analysis.md`

**Checklist:**
- [ ] Análise de código completa
- [ ] Bottlenecks identificados
- [ ] Queries analisadas
- [ ] Bundle analisado
- [ ] Renderização analisada
- [ ] Otimizações sugeridas
- [ ] Score calculado
- [ ] Resultado salvo

---

### Step 1.7: Executar Dependency Management Agent ⭐ NOVO

**Comando/Processo:**
- Função: `runDependencyAnalysis()`
- Arquivo: `src/agents/dependency-agent.js`

**Output Esperado:**
- Análise de package.json
- Dependências desatualizadas identificadas
- Vulnerabilidades encontradas (npm audit)
- Dependências não utilizadas
- Recomendações de atualização
- Score de dependências (0-100)

**Análises Realizadas:**
- Análise de package.json
- Verificação de vulnerabilidades (npm audit)
- Identificação de dependências não utilizadas
- Verificação de dependências desatualizadas

**Salvar em:**
- `src/shared/results/dependency-management/[timestamp]-analysis.md`

**Checklist:**
- [ ] package.json analisado
- [ ] Vulnerabilidades verificadas
- [ ] Dependências não utilizadas identificadas
- [ ] Dependências desatualizadas identificadas
- [ ] Recomendações geradas
- [ ] Score calculado
- [ ] Resultado salvo

---

## 🔍 FASE 2: Avaliação Cruzada

### Step 2.1: Architecture Review avalia Code Quality

**Perspectiva:** Impacto arquitetural das questões de qualidade

**Processo:**
1. Ler resultado do Code Quality Review
2. Avaliar cada issue sob perspectiva arquitetural:
   - Este issue afeta a arquitetura?
   - Precisa de mudança arquitetural para resolver?
   - Bloqueia features futuras?
   - Impacta escalabilidade/performance?

**Output:**
- Arquivo: `src/shared/evaluations/architecture-evaluates-code.md`
- Preocupações críticas e de alta prioridade

**Checklist:**
- [ ] Resultado do Code Quality lido
- [ ] Issues avaliados sob perspectiva arquitetural
- [ ] Preocupações arquiteturais identificadas
- [ ] Avaliação documentada

---

### Step 2.2: Architecture Review avalia Document Analysis

**Perspectiva:** Requisitos arquiteturais da documentação

**Processo:**
1. Ler resultado do Document Analysis
2. Avaliar requisitos arquiteturais:
   - Documentação menciona requisitos arquiteturais?
   - Há gaps arquiteturais na documentação?
   - Requisitos documentados são viáveis arquiteturalmente?
   - Há conflitos entre documentação e arquitetura atual?

**Output:**
- Arquivo: `src/shared/evaluations/architecture-evaluates-docs.md`

**Checklist:**
- [ ] Resultado do Document Analysis lido
- [ ] Requisitos arquiteturais identificados
- [ ] Gaps e conflitos identificados
- [ ] Avaliação documentada

---

### Step 2.3: Code Quality avalia Architecture Review

**Perspectiva:** Qualidade da arquitetura proposta

**Processo:**
1. Ler resultado do Architecture Review
2. Avaliar qualidade arquitetural:
   - Arquitetura segue boas práticas?
   - Padrões de código são consistentes?
   - Há code smells arquiteturais?
   - Manutenibilidade é adequada?

**Output:**
- Arquivo: `src/shared/evaluations/code-evaluates-architecture.md`

**Checklist:**
- [ ] Resultado do Architecture Review lido
- [ ] Qualidade arquitetural avaliada
- [ ] Code smells identificados
- [ ] Avaliação documentada

---

### Step 2.4: Code Quality avalia Document Analysis

**Perspectiva:** Requisitos de qualidade da documentação

**Processo:**
1. Ler resultado do Document Analysis
2. Avaliar requisitos de qualidade:
   - Documentação especifica padrões de qualidade?
   - Há requisitos de qualidade não atendidos?
   - Documentação menciona business rules de qualidade?
   - Há gaps de qualidade na documentação?

**Output:**
- Arquivo: `src/shared/evaluations/code-evaluates-docs.md`

**Checklist:**
- [ ] Resultado do Document Analysis lido
- [ ] Requisitos de qualidade identificados
- [ ] Gaps identificados
- [ ] Avaliação documentada

---

### Step 2.5: Document Analysis avalia Architecture Review

**Perspectiva:** Documentação necessária para arquitetura

**Processo:**
1. Ler resultado do Architecture Review
2. Avaliar necessidades de documentação:
   - Arquitetura está bem documentada?
   - Há decisões arquiteturais não documentadas?
   - Documentação está atualizada com a arquitetura?
   - Faltam guias de implementação?

**Output:**
- Arquivo: `src/shared/evaluations/docs-evaluates-architecture.md`

**Checklist:**
- [ ] Resultado do Architecture Review lido
- [ ] Necessidades de documentação identificadas
- [ ] Gaps de documentação identificados
- [ ] Avaliação documentada

---

### Step 2.6: Document Analysis avalia Code Quality

**Perspectiva:** Documentação de padrões de código

**Processo:**
1. Ler resultado do Code Quality Review
2. Avaliar documentação de padrões:
   - Padrões de código estão documentados?
   - Há guias de estilo?
   - Documentação de business rules está completa?
   - Faltam exemplos de código?

**Output:**
- Arquivo: `src/shared/evaluations/docs-evaluates-code.md`

**Checklist:**
- [ ] Resultado do Code Quality lido
- [ ] Necessidades de documentação identificadas
- [ ] Gaps identificados
- [ ] Avaliação documentada

---

### Step 2.7: Novos Agentes - Avaliações Cruzadas ⚠️ PENDENTE

**Nota:** Avaliações cruzadas para Security, Performance e Dependency agents ainda não estão implementadas, mas são recomendadas:

- Security avalia Architecture, Code Quality
- Performance avalia Architecture, Code Quality
- Dependency avalia Architecture, Code Quality
- Outros agentes avaliam Security, Performance, Dependency

---

## 🎯 FASE 3: Decisão Go/No-go

### Step 3.1: Consolidar Todas as Preocupações

**Processo:**
1. Ler todos os resultados dos agentes (incluindo novos)
2. Ler todas as avaliações cruzadas
3. Agregar todas as preocupações em uma lista única
4. Categorizar por tipo e prioridade:
   - Crítico (P0) - Bloqueador
   - Alta (P1) - Importante
   - Média (P2) - Melhoria
   - Baixa (P3) - Futuro

**Agentes Incluídos:**
- Architecture Review
- Code Quality Review
- Document Analysis
- Security Audit ⭐
- Performance Analysis ⭐
- Dependency Management ⭐

**Output:**
- Lista consolidada de preocupações
- Categorização por prioridade

---

### Step 3.2: Identificar Conflitos

**Processo:**
1. Comparar recomendações entre agentes
2. Identificar contradições:
   - Architecture sugere X, Code Quality sugere Y
   - Security identifica vulnerabilidade que conflita com implementação
   - Performance sugere otimização que conflita com arquitetura
   - Document Analysis identifica requisito que conflita com implementação

**Output:**
- Lista de conflitos identificados
- Análise de cada conflito

---

### Step 3.3: Priorizar Issues

**Processo:**
1. Para cada issue, calcular:
   - **Severidade**: Crítica, Alta, Média, Baixa
   - **Impacto**: Bloqueador, Alto, Médio, Baixo
   - **Esforço**: Alto, Médio, Baixo
   - **Urgência**: Imediata, Próxima sprint, Futuro

2. Criar matriz de priorização:
   ```
   Alta Severidade + Alto Impacto = P0 (Crítico)
   Alta Severidade + Médio Impacto = P1 (Alta)
   Média Severidade + Alto Impacto = P1 (Alta)
   Média Severidade + Médio Impacto = P2 (Média)
   ```

**Output:**
- Lista priorizada de issues
- Matriz de priorização

---

### Step 3.4: Calcular Scores Consolidados

**Fórmula Atualizada (com novos agentes):**

Se novos agentes estão presentes:
```
Score Geral = (Architecture × 0.3) + 
              (Code Quality × 0.3) + 
              (Documentation × 0.15) + 
              (Security × 0.15) + 
              (Performance × 0.05) + 
              (Dependency × 0.05)
```

Se apenas agentes originais:
```
Score Geral = (Architecture × 0.4) + 
              (Code Quality × 0.4) + 
              (Documentation × 0.2)
```

**Ajustes:**
- Reduzir score se houver issues P0: -2 pontos por P0
- Reduzir score se houver conflitos bloqueadores: -1 ponto por conflito
- Aumentar score se todos os agentes concordam: +1 ponto

**Score Final:**
- **75-100**: Excelente (GO)
- **60-74**: Bom (GO WITH CONCERNS)
- **50-59**: Regular (GO WITH CONCERNS ou NO-GO dependendo de P0)
- **0-49**: Ruim (NO-GO)

---

### Step 3.5: Aplicar Critérios de Decisão

**Processo:**
1. Verificar critérios de NO-GO:
   - [ ] Existe issue P0 (Crítico) de segurança?
   - [ ] Existe blocker arquitetural?
   - [ ] Existe conflito não resolvível?
   - [ ] Score geral < 50?
   - [ ] Falta documentação crítica?

2. Se nenhum critério de NO-GO:
   - Verificar critérios de GO WITH CONCERNS:
     - [ ] Existe issue P1 (Alta)?
     - [ ] Existe preocupação arquitetural menor?
     - [ ] Existe gap de documentação não crítico?
     - [ ] Score geral < 75?

3. Se nenhum critério acima:
   - Decisão: **GO**

**Output:**
- Decisão: GO / NO-GO / GO WITH CONCERNS
- Justificativa da decisão
- Confiança na decisão

---

### Step 3.6: Gerar Relatório Go/No-go

**Processo:**
1. Incluir:
   - Resumo executivo
   - Decisão e justificativa
   - Todas as preocupações priorizadas
   - Conflitos identificados
   - Scores consolidados (incluindo novos agentes)
   - Recomendações consolidadas
   - Próximos passos

**Output:**
- Arquivo: `src/shared/decisions/go-no-go-report.md`

---

### Step 3.7: Gerar Backlog Atualizado ⭐ NOVO

**Processo:**
1. Converter todos os issues identificados em tarefas
2. Priorizar tarefas automaticamente
3. Estimar esforço para cada tarefa
4. Identificar dependências entre tarefas
5. Se havia backlog do Product Manager, mesclar tarefas

**Output:**
- Arquivo: `src/shared/backlog/backlog-improvements-[timestamp].json`
- Arquivo: `src/shared/backlog/current-backlog.json` (atualizado)

**Checklist:**
- [ ] Issues convertidos em tarefas
- [ ] Tarefas priorizadas
- [ ] Esforço estimado
- [ ] Dependências identificadas
- [ ] Backlog salvo

---

### Step 3.8: Retornar Feedback para Product Manager ⭐ NOVO

**Processo:**
1. Criar evento de feedback:
   - Decisão Go/No-go
   - Scores consolidados
   - Issues identificados
   - Recomendações
   - Backlog atualizado

2. Salvar em:
   - `src/shared/events/workflow-feedback.json`

3. Remover evento de backlog-ready (se existir)

**Output:**
- Evento de feedback criado
- Product Manager pode ler feedback e decidir próximos passos

---

## 🔧 FASE 4: Implementação Automática (Opcional) ⭐ NOVO

### Step 4.1: Verificar Se Implementação é Necessária

**Processo:**
1. Verificar se decisão é GO ou GO WITH CONCERNS
2. Verificar se há tarefas auto-fixáveis no backlog
3. Verificar se usuário aprovou implementação automática
4. Verificar configuração de automação (`maestro.config.yaml` ou variável de ambiente)

**Condições para Executar:**
- Decisão: GO ou GO WITH CONCERNS
- Há tarefas com `autoFixable: true` no backlog
- Configuração permite implementação automática
- Usuário aprovou (ou configuração permite sem aprovação)

**Checklist:**
- [ ] Condições verificadas
- [ ] Decisão tomada sobre executar implementação

---

### Step 4.2: Executar Implementation Agent

**Comando/Processo:**
- Função: `runImplementationAgent(options)`
- Arquivo: `src/agents/implementation-agent.js`

**Processo:**
1. Ler backlog atual (`src/shared/backlog/current-backlog.json`)
2. Filtrar tarefas auto-fixáveis:
   - `status: "todo"` ou `"in-progress"`
   - `autoFixable: true` (ou baseado em regras de segurança)
   - Prioridade: P0, P1, P2 (conforme configuração)
3. Ordenar por:
   - Prioridade (P0 > P1 > P2 > P3)
   - Dependências (tarefas sem dependências primeiro)
   - Esforço (XS, S primeiro)
4. Para cada tarefa selecionada:
   - Analisar contexto e tipo de correção
   - Implementar correção (código, docs, config)
   - Validar implementação
   - Criar commit estruturado
   - Atualizar status no backlog

**Tipos de Correções Implementadas:**
- **Code Fix**: Formatação, imports, nomenclatura, código morto
- **Documentation**: JSDoc, README.md, atualização de docs
- **Configuration**: Arquivos de config básicos (.eslintrc, .prettierrc, firestore.rules básico)

**Output Esperado:**
- Relatório de implementação
- Commits criados no repositório
- Backlog atualizado
- Métricas de implementação

**Salvar em:**
- `src/shared/implementations/[timestamp]/implementation-report.md`
- `src/shared/implementations/[timestamp]/changes.json`
- `src/shared/implementations/[timestamp]/validation-results.json`
- `src/shared/backlog/current-backlog.json` (atualizado)

**Checklist:**
- [ ] Tarefas processadas
- [ ] Correções implementadas
- [ ] Validações passaram
- [ ] Commits criados
- [ ] Backlog atualizado
- [ ] Relatório gerado

---

### Step 4.3: Validação Pós-Implementação

**Processo:**
1. Executar linters/formatters:
   - ESLint
   - Prettier
   - Outros linters configurados
2. Executar testes (se existirem):
   - Testes unitários
   - Testes de integração
3. Verificar que código compila/executa:
   - `npm run build` (se aplicável)
   - Verificar sintaxe
4. Validar que critérios de aceitação foram atendidos:
   - Tarefa foi completamente implementada?
   - Todos os critérios atendidos?
5. Verificar que não introduziu novos problemas:
   - Código ainda funciona?
   - Não introduziu novos erros?

**Output Esperado:**
- Resultados de validação
- Lista de tarefas validadas
- Lista de tarefas com erros (se houver)

**Salvar em:**
- `src/shared/implementations/[timestamp]/validation-results.json`

**Checklist:**
- [ ] Validações executadas
- [ ] Resultados documentados
- [ ] Tarefas com erro identificadas

---

### Step 4.4: Re-executar Workflow (Opcional)

**Processo:**
1. Se implementação foi bem-sucedida
2. E configuração permite re-execução
3. Re-executar workflow completo (Fases 1-3)
4. Validar que issues foram resolvidos:
   - Comparar issues antes/depois
   - Verificar que scores melhoraram
   - Confirmar que tarefas foram marcadas como resolvidas
5. Comparar scores antes/depois:
   - Score geral melhorou?
   - Scores individuais melhoraram?
   - Issues críticos foram resolvidos?

**Output Esperado:**
- Novo relatório Go/No-go
- Comparação de scores
- Validação de resolução de issues

**Checklist:**
- [ ] Workflow re-executado (se aplicável)
- [ ] Scores comparados
- [ ] Issues validados

---

## ✅ FASE 4: Aprovação do Usuário

### Step 4.1: Apresentar Resumo (Interface Web)

**Processo:**
1. Interface web disponível em `http://localhost:3000`
2. Apresentar:
   - Decisão em destaque
   - Top 5 preocupações
   - Conflitos principais
   - Recomendação final
   - Backlog atualizado

**Checklist:**
- [ ] Interface web acessível
- [ ] Resumo apresentado
- [ ] Detalhes disponíveis

---

### Step 4.2: Aguardar Aprovação

**Processo:**
1. Usuário pode:
   - ✅ **Aprovar**: Prosseguir com a decisão
   - ❌ **Rejeitar**: Não prosseguir, revisar
   - 🔄 **Revisar**: Solicitar mais informações

2. Se aprovado:
   - Decisão documentada
   - Backlog disponível para implementação
   - Próximos passos definidos

3. Se rejeitado:
   - Identificar o que precisa ser corrigido
   - Retornar para fase apropriada
   - Documentar razão da rejeição

4. Se revisar:
   - Coletar informações adicionais
   - Re-executar fase específica
   - Re-avaliar decisão

---

## ⏱️ Time Estimates

| Fase | Tempo Estimado |
|------|----------------|
| Fase 0: Product Manager | 5-10 min |
| Fase 1: Execução Paralela | 3-5 horas (com novos agentes) |
| Fase 2: Avaliação Cruzada | 1-2 horas |
| Fase 3: Decisão Go/No-go | 30-60 min |
| Fase 4: Aprovação | 5-15 min |
| **Total** | **5-8 horas** |

---

## ✅ Checklist Final

Antes de considerar workflow completo:

- [ ] Todos os agentes executaram suas tarefas (incluindo novos)
- [ ] Todos os resultados foram salvos
- [ ] Todas as avaliações cruzadas foram feitas
- [ ] Decisão Go/No-go foi tomada
- [ ] Relatório foi gerado
- [ ] Backlog atualizado foi gerado
- [ ] Feedback foi enviado para Product Manager
- [ ] Usuário foi consultado (via interface web)
- [ ] Decisão foi documentada

---

## 🆕 Mudanças desde Versão 1.0

### Novos Agentes
- ✅ Security Audit Agent
- ✅ Performance Analysis Agent
- ✅ Dependency Management Agent

### Novas Funcionalidades
- ✅ Product Manager Agent (Fase 0)
- ✅ Backlog Generator automático
- ✅ Geração de backlog atualizado
- ✅ Retorno de feedback para Product Manager
- ✅ Interface web para aprovação

### Melhorias
- ✅ Fórmula de score atualizada para incluir novos agentes
- ✅ Consolidação de preocupações inclui novos agentes
- ✅ Verificação automática de backlog do Product Manager

---

**Última Atualização**: 2025-12-30  
**Versão**: 2.0

