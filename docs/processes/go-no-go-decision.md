# Processo de Decisão Go/No-go

## 🎯 Purpose

Processo detalhado para chegar à decisão Go/No-go baseado em todas as análises e avaliações cruzadas dos agentes, incluindo os novos agentes implementados (Security, Performance, Dependency).

---

## 📋 Pré-requisitos

Antes de iniciar a decisão:

- [ ] Todos os agentes executaram suas análises (incluindo novos agentes)
- [ ] Todos os resultados foram salvos em `src/shared/results/`
- [ ] Todas as avaliações cruzadas foram completadas
- [ ] Todas as avaliações foram salvas em `src/shared/evaluations/`

**Agentes Incluídos:**
- Architecture Review Agent
- Code Quality Review Agent
- Document Analysis Agent
- Security Audit Agent ⭐
- Performance Analysis Agent ⭐
- Dependency Management Agent ⭐

---

## 🔍 Step 1: Coletar Todas as Preocupações

### 1.1 Ler Resultados dos Agentes

**Arquivos a ler:**
- `src/shared/results/architecture-review/[arquivo]`
- `src/shared/results/code-quality-review/[arquivo]`
- `src/shared/results/document-analysis/[arquivo]`
- `src/shared/results/security-audit/[arquivo]` ⭐
- `src/shared/results/performance-analysis/[arquivo]` ⭐
- `src/shared/results/dependency-management/[arquivo]` ⭐

**Extrair:**
- Todos os issues identificados (com prioridade)
- Todas as recomendações
- Todos os gaps identificados
- Scores de cada agente

---

### 1.2 Ler Avaliações Cruzadas

**Arquivos a ler:**
- `src/shared/evaluations/architecture-evaluates-code.md`
- `src/shared/evaluations/architecture-evaluates-docs.md`
- `src/shared/evaluations/code-evaluates-architecture.md`
- `src/shared/evaluations/code-evaluates-docs.md`
- `src/shared/evaluations/docs-evaluates-architecture.md`
- `src/shared/evaluations/docs-evaluates-code.md`

**Nota:** Avaliações cruzadas dos novos agentes ainda não estão implementadas, mas são recomendadas.

**Extrair:**
- Todas as preocupações identificadas nas avaliações cruzadas
- Conflitos entre perspectivas
- Gaps adicionais identificados

---

### 1.3 Consolidar Lista de Preocupações

**Processo:**
1. Criar lista única de todas as preocupações
2. Remover duplicatas (mesma preocupação identificada por múltiplos agentes)
3. Marcar preocupações que foram identificadas por múltiplos agentes (mais críticas)
4. Categorizar por tipo:
   - Arquitetura
   - Qualidade de Código
   - Documentação
   - Segurança ⭐
   - Performance ⭐
   - Dependências ⭐
   - Outros

**Output:**
- Lista consolidada de preocupações
- Contagem por categoria
- Contagem por prioridade

---

## 🎯 Step 2: Priorizar Preocupações

### 2.1 Aplicar Matriz de Priorização

Para cada preocupação, calcular:

**Severidade:**
- **Crítica (P0)**: Bloqueia funcionalidade ou segurança
- **Alta (P1)**: Impacta significativamente qualidade ou manutenibilidade
- **Média (P2)**: Melhoria importante mas não bloqueadora
- **Baixa (P3)**: Melhoria futura

**Impacto:**
- **Alto**: Afeta múltiplas áreas ou usuários
- **Médio**: Afeta área específica
- **Baixo**: Impacto limitado

**Urgência:**
- **Imediata**: Precisa resolver agora
- **Próxima Sprint**: Resolver em breve
- **Futuro**: Pode esperar

**Esforço:**
- **Alto**: Requer mudanças significativas
- **Médio**: Requer mudanças moderadas
- **Baixo**: Mudanças simples

**Prioridade Final:**
```
Crítica + Alto Impacto = P0 (Bloqueador)
Crítica + Médio Impacto = P0 (Bloqueador)
Alta + Alto Impacto = P1 (Alta)
Alta + Médio Impacto = P1 (Alta)
Média + Alto Impacto = P1 (Alta)
Média + Médio Impacto = P2 (Média)
```

---

### 2.2 Identificar Preocupações Críticas (P0)

**Critérios para P0:**
- Bloqueia funcionalidade crítica
- Compromete segurança (vulnerabilidades críticas) ⭐
- Bloqueia features futuras planejadas
- Violação de requisitos obrigatórios
- Bloqueia deploy em produção
- Vulnerabilidades de segurança críticas ⭐

**Listar todas as P0:**
- [Preocupação 1]
- [Preocupação 2]
- [Preocupação 3]

---

## ⚠️ Step 3: Identificar Conflitos

### 3.1 Comparar Recomendações entre Agentes

**Processo:**
1. Comparar recomendações do Architecture Review com Code Quality
2. Comparar recomendações do Code Quality com Document Analysis
3. Comparar recomendações do Document Analysis com Architecture Review
4. Comparar recomendações de Security com Architecture e Code Quality ⭐
5. Comparar recomendações de Performance com Architecture ⭐
6. Verificar avaliações cruzadas para conflitos explícitos

**Tipos de Conflitos:**
- **Conflito de Direção**: Agentes sugerem soluções diferentes
- **Conflito de Prioridade**: Agentes priorizam coisas diferentes
- **Conflito de Requisitos**: Documentação conflita com implementação
- **Conflito de Arquitetura**: Arquitetura proposta conflita com qualidade
- **Conflito de Segurança**: Security identifica vulnerabilidade que conflita com implementação ⭐
- **Conflito de Performance**: Performance sugere otimização que conflita com arquitetura ⭐

---

### 3.2 Analisar Cada Conflito

Para cada conflito identificado:

**Análise:**
- **Natureza do Conflito**: [Descrição]
- **Agentes Envolvidos**: [Lista]
- **Perspectiva de Cada Agente**: [Como cada um vê]
- **Impacto do Conflito**: [Impacto no projeto]
- **Resolvível?**: [Sim/Não]
- **Resolução Sugerida**: [Como resolver]

**Classificar:**
- **Bloqueador**: Conflito não resolvível que bloqueia progresso
- **Importante**: Conflito que precisa ser resolvido mas não bloqueia
- **Menor**: Conflito que pode ser resolvido depois

---

## 📊 Step 4: Calcular Scores e Métricas

### 4.1 Score Geral (Fórmula Atualizada)

**Se novos agentes estão presentes:**

```
Score Geral = (Architecture × 0.3) + 
              (Code Quality × 0.3) + 
              (Documentation × 0.15) + 
              (Security × 0.15) + 
              (Performance × 0.05) + 
              (Dependency × 0.05)
```

**Se apenas agentes originais:**

```
Score Geral = (Architecture × 0.4) + 
              (Code Quality × 0.4) + 
              (Documentation × 0.2)
```

**Ajustes:**
- Reduzir score se houver issues P0: -2 pontos por P0
- Reduzir score se houver conflitos bloqueadores: -1 ponto por conflito
- Reduzir score se houver vulnerabilidades críticas de segurança: -5 pontos ⭐
- Aumentar score se todos os agentes concordam: +1 ponto

**Score Final:**
- **75-100**: Excelente (GO)
- **60-74**: Bom (GO WITH CONCERNS)
- **50-59**: Regular (GO WITH CONCERNS ou NO-GO dependendo de P0)
- **0-49**: Ruim (NO-GO)

---

### 4.2 Métricas por Categoria

**Arquitetura:**
- Score: [X/100]
- Issues P0: [Número]
- Issues P1: [Número]
- Status: [✅/⚠️/❌]

**Qualidade de Código:**
- Score: [X/100]
- Issues P0: [Número]
- Issues P1: [Número]
- Status: [✅/⚠️/❌]

**Documentação:**
- Score: [X/100]
- Gaps Críticos: [Número]
- Gaps Importantes: [Número]
- Status: [✅/⚠️/❌]

**Segurança:** ⭐
- Score: [X/100]
- Vulnerabilidades Críticas: [Número]
- Vulnerabilidades Alta: [Número]
- Status: [✅/⚠️/❌]

**Performance:** ⭐
- Score: [X/100]
- Bottlenecks Críticos: [Número]
- Otimizações Sugeridas: [Número]
- Status: [✅/⚠️/❌]

**Dependências:** ⭐
- Score: [X/100]
- Vulnerabilidades: [Número]
- Desatualizadas: [Número]
- Status: [✅/⚠️/❌]

---

## 🎯 Step 5: Aplicar Critérios de Decisão

### 5.1 Verificar Critérios de NO-GO

**Critérios (qualquer um resulta em NO-GO):**

1. **Issues Críticos (P0) de Segurança** ⭐
   - [ ] Existe pelo menos 1 issue P0 de segurança?
   - Se SIM → **NO-GO**

2. **Vulnerabilidades Críticas** ⭐
   - [ ] Existe vulnerabilidade crítica de segurança?
   - Se SIM → **NO-GO**

3. **Issues Críticos (P0) Gerais**
   - [ ] Existe pelo menos 1 issue P0 (não segurança)?
   - Se SIM → **NO-GO** (a menos que não seja bloqueador)

4. **Bloqueadores Arquiteturais**
   - [ ] Existe blocker arquitetural que impede progresso?
   - Se SIM → **NO-GO**

5. **Conflitos Não Resolvíveis**
   - [ ] Existe conflito bloqueador entre agentes?
   - Se SIM → **NO-GO**

6. **Documentação Crítica Faltando**
   - [ ] Falta documentação crítica para prosseguir?
   - Se SIM → **NO-GO**

7. **Score Muito Baixo**
   - [ ] Score geral < 50?
   - Se SIM → **NO-GO**

**Resultado:**
- Se qualquer critério atendido → **NO-GO**
- Se nenhum critério atendido → Continuar para Step 5.2

---

### 5.2 Verificar Critérios de GO WITH CONCERNS

**Critérios (se não for NO-GO, verificar):**

1. **Issues de Alta Prioridade (P1)**
   - [ ] Existe pelo menos 1 issue P1?
   - Se SIM → Adicionar à lista de preocupações

2. **Vulnerabilidades de Alta Prioridade** ⭐
   - [ ] Existe vulnerabilidade alta (não crítica)?
   - Se SIM → Adicionar à lista de preocupações

3. **Preocupações Arquiteturais Menores**
   - [ ] Existe preocupação arquitetural não bloqueadora?
   - Se SIM → Adicionar à lista de preocupações

4. **Gaps de Documentação Não Críticos**
   - [ ] Existe gap de documentação não crítico?
   - Se SIM → Adicionar à lista de preocupações

5. **Bottlenecks de Performance** ⭐
   - [ ] Existe bottleneck de performance não crítico?
   - Se SIM → Adicionar à lista de preocupações

6. **Dependências Desatualizadas** ⭐
   - [ ] Existe dependência desatualizada importante?
   - Se SIM → Adicionar à lista de preocupações

7. **Score Moderado**
   - [ ] Score geral entre 50-74?
   - Se SIM → Adicionar à lista de preocupações

**Resultado:**
- Se 2 ou mais critérios atendidos → **GO WITH CONCERNS**
- Se 1 critério atendido → **GO WITH CONCERNS** (menor)
- Se nenhum critério atendido → Continuar para Step 5.3

---

### 5.3 Decisão GO

**Se não for NO-GO nem GO WITH CONCERNS:**
- **Decisão: GO**
- Pode prosseguir sem preocupações significativas
- Ainda pode ter melhorias futuras (P2/P3)
- Score geral ≥ 75

---

## 📝 Step 6: Gerar Relatório

### 6.1 Usar Template

**Template:** (gerado automaticamente pelo script)

**Preencher:**
- Decisão e justificativa
- Todas as preocupações priorizadas (incluindo de novos agentes)
- Conflitos identificados
- Scores e métricas (incluindo novos agentes)
- Recomendações consolidadas
- Próximos passos

**Salvar em:**
- `src/shared/decisions/go-no-go-report.md`

---

### 6.2 Criar Resumo de Preocupações

**Arquivo separado:** (opcional)

**Conteúdo:**
- Lista consolidada de todas as preocupações
- Agrupadas por prioridade
- Agrupadas por categoria (incluindo novas categorias)
- Fácil referência rápida

---

## 🔄 Step 7: Gerar Backlog Atualizado ⭐ NOVO

### 7.1 Converter Issues em Tarefas

**Processo:**
1. Para cada issue identificado:
   - Converter em tarefa estruturada
   - Determinar tipo (feature, fix, refactor, test, docs)
   - Priorizar baseado em P0/P1/P2/P3
   - Estimar esforço

2. Agrupar tarefas:
   - Por prioridade
   - Por tipo
   - Por esforço

3. Identificar dependências:
   - Tarefas que dependem de outras
   - Ordem sugerida de execução

**Output:**
- Backlog JSON estruturado
- Salvo em: `src/shared/backlog/backlog-improvements-[timestamp].json`

---

### 7.2 Mesclar com Backlog Original

**Processo:**
1. Se havia backlog do Product Manager:
   - Mesclar tarefas
   - Manter backlogId original
   - Adicionar tarefas de melhoria

2. Se não havia backlog:
   - Criar novo backlog apenas com melhorias

**Output:**
- Backlog atualizado
- Salvo em: `src/shared/backlog/current-backlog.json`

---

## 📤 Step 8: Retornar Feedback para Product Manager ⭐ NOVO

### 8.1 Criar Evento de Feedback

**Processo:**
1. Criar arquivo `src/shared/events/workflow-feedback.json`:

```json
{
  "event": "workflow-complete",
  "workflowId": "2025-12-30T10-00-00",
  "timestamp": "2025-12-30T10:00:00.000Z",
  "decision": "GO WITH CONCERNS",
  "scores": {
    "overall": 75,
    "architecture": 60,
    "codeQuality": 90,
    "documentation": 73,
    "security": 85,
    "performance": 80,
    "dependency": 70
  },
  "issues": {
    "critical": 0,
    "high": 6,
    "medium": 2,
    "low": 1
  },
  "recommendations": [...],
  "reportPath": "src/shared/decisions/go-no-go-report.md",
  "updatedBacklog": {
    "backlogId": "backlog-improvements-...",
    "tasks": [...]
  }
}
```

2. Remover evento `backlog-ready.json` (se existir)

**Checklist:**
- [ ] Feedback criado
- [ ] Scores incluídos
- [ ] Issues incluídos
- [ ] Backlog atualizado incluído
- [ ] Evento antigo removido

---

## ✅ Checklist de Decisão

Antes de finalizar:

- [ ] Todas as preocupações foram coletadas (incluindo novos agentes)
- [ ] Todas as preocupações foram priorizadas
- [ ] Conflitos foram identificados e analisados
- [ ] Scores foram calculados (com nova fórmula)
- [ ] Critérios de decisão foram aplicados
- [ ] Decisão foi justificada
- [ ] Relatório foi gerado
- [ ] Backlog atualizado foi gerado ⭐
- [ ] Feedback foi enviado para Product Manager ⭐

---

## 🎯 Resultados Esperados

### Outputs:

1. **Relatório Go/No-go Completo**
   - Arquivo: `src/shared/decisions/go-no-go-report.md`
   - Contém: Decisão, justificativa, todas as preocupações, recomendações, scores de todos os agentes

2. **Backlog Atualizado** ⭐
   - Arquivo: `src/shared/backlog/backlog-improvements-[timestamp].json`
   - Contém: Tarefas de melhoria baseadas em issues identificados

3. **Feedback para Product Manager** ⭐
   - Arquivo: `src/shared/events/workflow-feedback.json`
   - Contém: Decisão, scores, issues, recomendações, backlog atualizado

4. **Métricas e Scores**
   - Incluídos no relatório principal
   - Scores por agente (incluindo novos)
   - Score geral (com nova fórmula)
   - Métricas por categoria (incluindo novas)

---

## 🆕 Mudanças desde Versão 1.0

### Novos Agentes Incluídos
- ✅ Security Audit Agent
- ✅ Performance Analysis Agent
- ✅ Dependency Management Agent

### Nova Fórmula de Score
- Pesos ajustados para incluir novos agentes
- Security tem peso 0.15 (alta importância)
- Performance e Dependency têm peso 0.05 cada

### Novos Critérios de Decisão
- Vulnerabilidades críticas de segurança → NO-GO
- Vulnerabilidades alta de segurança → GO WITH CONCERNS
- Bottlenecks de performance → GO WITH CONCERNS
- Dependências desatualizadas → GO WITH CONCERNS

### Novas Funcionalidades
- Geração automática de backlog atualizado
- Retorno de feedback para Product Manager
- Mesclagem de backlog original com melhorias

---

**Última Atualização**: 2025-12-30  
**Versão**: 2.0

