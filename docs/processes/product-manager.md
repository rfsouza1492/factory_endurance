# Product Manager Agent Process

## 🎯 Purpose

O Product Manager Agent é o trigger inicial do workflow Maestro. Ele avalia o status atual de desenvolvimento, compara com o roadmap e milestones, identifica gaps, e gera um backlog de tarefas que é enviado para o Maestro processar.

---

## 📋 Pré-requisitos

Antes de executar o Product Manager Agent:

- [ ] Roadmap disponível em `knowledge/product/ROADMAP.md`
- [ ] Backlog disponível em `knowledge/product/BACKLOG.md` (opcional)
- [ ] Código do projeto disponível para análise
- [ ] Estrutura de pastas `src/shared/` criada

---

## 🔄 Processo Completo

### Step 1: Ler Roadmap e Milestones

**Arquivos a Ler:**
- `knowledge/product/ROADMAP.md`
- `knowledge/product/BACKLOG.md` (se existir)
- `knowledge/implementation/BUILD_SUMMARY.md` (se existir)

**Processo:**
1. Ler arquivo ROADMAP.md
2. Extrair milestones e suas versões
3. Extrair status de cada milestone (completed, shipped, in-progress, planned)
4. Extrair features de cada milestone
5. Extrair deadlines (se disponíveis)
6. Ler BACKLOG.md para features adicionais

**Output:**
```javascript
{
  milestones: [
    {
      version: "v1.0",
      status: "completed",
      features: ["Feature 1", "Feature 2"],
      deadline: "2025-01-15"
    }
  ],
  features: ["Feature 1", "Feature 2", ...]
}
```

**Checklist:**
- [ ] Roadmap lido
- [ ] Milestones extraídos
- [ ] Features identificadas
- [ ] Deadlines identificadas

---

### Step 2: Analisar Código Atual

**Processo:**
1. Verificar estrutura do projeto:
   - Diretório `src/` existe?
   - `package.json` existe?
   - Arquivos de configuração existem?

2. Listar arquivos principais:
   - Arquivos JavaScript/JSX/TS/TSX
   - Estrutura de diretórios

3. Detectar features implementadas:
   - Analisar código para identificar features
   - Verificar imports e dependências
   - Identificar funcionalidades principais

4. Verificar qualidade básica:
   - Testes existem?
   - Documentação existe?
   - Configurações básicas presentes?

**Output:**
```javascript
{
  features: ["Firebase Integration", "Authentication", "Goal Management"],
  files: ["src/App.jsx", "src/firebase.js", ...],
  structure: {
    hasSrc: true,
    hasPackageJson: true,
    hasConfig: true,
    hasRules: true
  },
  quality: {
    hasTests: false,
    hasDocs: true,
    score: 0
  }
}
```

**Checklist:**
- [ ] Estrutura analisada
- [ ] Arquivos listados
- [ ] Features detectadas
- [ ] Qualidade básica verificada

---

### Step 3: Comparar com Milestones

**Processo:**
1. Para cada milestone não completo:
   - Verificar quais features do milestone estão implementadas
   - Identificar features faltantes
   - Calcular progresso percentual

2. Identificar gaps:
   - Features faltantes por milestone
   - Issues de qualidade
   - Gaps de documentação
   - Gaps de testes

3. Priorizar gaps:
   - P0: Bloqueadores críticos
   - P1: Alta prioridade (deadline próximo)
   - P2: Média prioridade
   - P3: Baixa prioridade

**Output:**
```javascript
{
  missingFeatures: [
    {
      feature: "Feature X",
      milestone: "v1.1",
      priority: "P1"
    }
  ],
  incompleteFeatures: [],
  qualityIssues: [
    {
      issue: "Diretório src/ não encontrado",
      priority: "P0"
    }
  ],
  documentationGaps: [
    {
      issue: "README.md não encontrado",
      priority: "P1"
    }
  ],
  testGaps: [
    {
      issue: "Testes não encontrados",
      priority: "P1"
    }
  ]
}
```

**Checklist:**
- [ ] Milestones comparados
- [ ] Gaps identificados
- [ ] Gaps priorizados

---

### Step 4: Gerar Backlog de Tarefas

**Processo:**
1. Converter gaps em tarefas:
   - Cada feature faltante → Tarefa tipo "feature"
   - Cada issue de qualidade → Tarefa tipo "fix"
   - Cada gap de documentação → Tarefa tipo "docs"
   - Cada gap de testes → Tarefa tipo "test"

2. Estimar esforço:
   - XS: < 1 hora
   - S: 1-4 horas
   - M: 4-8 horas
   - L: 8-16 horas
   - XL: > 16 horas

3. Identificar dependências:
   - Tarefas que dependem de outras
   - Ordem de execução sugerida

4. Agrupar por tipo e prioridade

**Output:**
```json
{
  "backlogId": "backlog-2025-12-30T10-00-00",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "createdBy": "Product Manager Agent",
  "milestone": "Milestone 1.0",
  "deadline": "2025-01-15",
  "tasks": [
    {
      "id": "task-001",
      "title": "Implementar Feature X",
      "type": "feature",
      "priority": "P1",
      "effort": "M",
      "description": "...",
      "acceptanceCriteria": [...],
      "dependencies": [],
      "milestone": "v1.1",
      "status": "todo"
    }
  ],
  "summary": {
    "totalTasks": 10,
    "p0Tasks": 2,
    "p1Tasks": 5,
    "p2Tasks": 3,
    "estimatedEffort": "40 hours",
    "estimatedCompletion": "2025-01-10"
  }
}
```

**Checklist:**
- [ ] Tarefas criadas
- [ ] Esforço estimado
- [ ] Dependências identificadas
- [ ] Summary calculado

---

### Step 5: Salvar Backlog

**Processo:**
1. Salvar backlog em:
   - `src/shared/backlog/[backlogId].json`
   - `src/shared/backlog/current-backlog.json` (atualizado)

2. Criar evento para Maestro:
   - `src/shared/events/backlog-ready.json`

**Estrutura do Evento:**
```json
{
  "type": "backlog-ready",
  "backlogId": "backlog-2025-12-30T10-00-00",
  "timestamp": "2025-12-30T10:00:00.000Z",
  "backlogPath": "src/shared/backlog/backlog-2025-12-30T10-00-00.json"
}
```

**Checklist:**
- [ ] Backlog salvo
- [ ] Evento criado
- [ ] Maestro pode detectar backlog

---

### Step 6: Gerar Relatório de Status

**Processo:**
1. Criar relatório markdown com:
   - Resumo executivo
   - Status de cada milestone
   - Progresso percentual
   - Features implementadas vs. faltantes
   - Backlog gerado
   - Tarefas por prioridade

2. Salvar em:
   - `src/shared/results/product-manager/[timestamp]-status.md`

**Checklist:**
- [ ] Relatório gerado
- [ ] Métricas incluídas
- [ ] Relatório salvo

---

### Step 7: Acionar Maestro

**Processo:**
1. Evento `backlog-ready.json` criado
2. Maestro detecta evento automaticamente
3. Maestro carrega backlog
4. Maestro executa workflow baseado em backlog

**Nota:** O Maestro pode ser acionado manualmente também, mas o Product Manager cria o evento para automação.

**Checklist:**
- [ ] Evento criado
- [ ] Maestro pode detectar
- [ ] Workflow pode iniciar

---

## 🔄 Integração com Maestro

### Fluxo Completo

```
Product Manager Agent
    ↓
Gera Backlog
    ↓
Cria Evento (backlog-ready.json)
    ↓
Maestro Detecta Evento
    ↓
Maestro Carrega Backlog
    ↓
Maestro Executa Workflow (Fases 1-3)
    ↓
Maestro Gera Backlog Atualizado
    ↓
Maestro Cria Feedback (workflow-feedback.json)
    ↓
Product Manager Lê Feedback
    ↓
Product Manager Decide Próximos Passos
```

### Recebimento de Feedback

**Processo:**
1. Product Manager verifica `src/shared/events/workflow-feedback.json`
2. Lê feedback do Maestro:
   - Decisão Go/No-go
   - Scores consolidados
   - Issues identificados
   - Recomendações
   - Backlog atualizado

3. Product Manager decide:
   - Aprovar implementação
   - Solicitar melhorias
   - Rejeitar e revisar

---

## 📊 Métricas e Outputs

### Métricas Geradas

- **Features Implementadas:** Número de features do roadmap já implementadas
- **Features Faltantes:** Número de features ainda não implementadas
- **Progresso por Milestone:** Percentual de conclusão
- **Tarefas Criadas:** Total de tarefas no backlog
- **Esforço Estimado:** Total de horas estimadas
- **Data de Conclusão Estimada:** Quando todas as tarefas serão concluídas

### Outputs

1. **Backlog JSON:** Estrutura completa de tarefas
2. **Relatório de Status:** Documento markdown com análise
3. **Evento backlog-ready:** Sinal para Maestro iniciar workflow

---

## ✅ Checklist de Execução

Antes de considerar processo completo:

- [ ] Roadmap lido e parseado
- [ ] Código atual analisado
- [ ] Comparação com milestones feita
- [ ] Gaps identificados e priorizados
- [ ] Backlog de tarefas gerado
- [ ] Esforço estimado
- [ ] Dependências identificadas
- [ ] Backlog salvo
- [ ] Evento criado
- [ ] Relatório de status gerado
- [ ] Maestro pode detectar backlog

---

## ⚠️ Problemas Comuns

### Roadmap não encontrado

**Solução:** Verificar se `knowledge/product/ROADMAP.md` existe e está no formato correto.

### Nenhuma feature detectada

**Solução:** Verificar se o código está no diretório correto e se a análise está funcionando.

### Backlog vazio

**Solução:** Verificar se há gaps identificados. Se não houver, o backlog pode estar vazio (projeto completo).

---

## 🎯 Boas Práticas

1. **Manter Roadmap Atualizado:** Roadmap deve refletir o estado atual do projeto
2. **Deadlines Realistas:** Estimar esforço com precisão
3. **Priorização Clara:** Usar critérios consistentes para priorizar
4. **Dependências Explícitas:** Identificar todas as dependências entre tarefas
5. **Feedback Loop:** Ler feedback do Maestro e ajustar roadmap se necessário

---

**Última Atualização**: 2025-12-30  
**Versão**: 2.0

