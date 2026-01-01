# Backlog Generation Process

## 🎯 Purpose

O Backlog Generator converte issues identificados pelos agentes em tarefas estruturadas, priorizadas e prontas para implementação. Ele também pode mesclar tarefas de diferentes fontes (Product Manager, melhorias identificadas).

---

## 📋 Pré-requisitos

Antes de gerar backlog:

- [ ] Issues identificados pelos agentes disponíveis
- [ ] Estrutura de pastas `src/shared/backlog/` criada
- [ ] Função `generateBacklogFromIssues()` disponível

---

## 🔄 Processo Completo

### Step 1: Coletar Issues

**Fontes de Issues:**
1. **Resultados dos Agentes:**
   - Architecture Review issues
   - Code Quality Review issues
   - Document Analysis gaps
   - Security Audit vulnerabilities ⭐
   - Performance Analysis bottlenecks ⭐
   - Dependency Management issues ⭐

2. **Avaliações Cruzadas:**
   - Preocupações identificadas nas avaliações

3. **Decisão Go/No-go:**
   - Issues consolidados da decisão

**Formato Esperado:**
```javascript
[
  {
    type: 'Security',
    message: 'Vulnerabilidade crítica em firebase.js',
    location: 'src/firebase.js',
    severity: 'critical',
    priority: 'P0',
    agent: 'Security Audit'
  },
  ...
]
```

**Checklist:**
- [ ] Issues coletados de todos os agentes
- [ ] Issues formatados corretamente
- [ ] Prioridades atribuídas

---

### Step 2: Agrupar Issues por Tipo

**Tipos Identificados:**
- **Security**: Vulnerabilidades, secrets, configurações
- **Performance**: Bottlenecks, queries lentas, renderização
- **Code Quality**: Code smells, padrões, qualidade
- **Architecture**: Estrutura, padrões arquiteturais
- **Documentation**: Gaps, documentação faltante
- **Testing**: Cobertura, testes faltantes
- **Accessibility**: Acessibilidade, ARIA
- **Other**: Outros tipos

**Processo:**
1. Para cada issue, determinar tipo baseado em:
   - Campo `type` do issue
   - Mensagem do issue
   - Agente que identificou

2. Agrupar issues por tipo

**Output:**
```javascript
{
  security: [issue1, issue2, ...],
  performance: [issue3, issue4, ...],
  codeQuality: [issue5, ...],
  ...
}
```

**Checklist:**
- [ ] Issues agrupados por tipo
- [ ] Tipos identificados corretamente

---

### Step 3: Converter Issues em Tarefas

**Processo:**
1. Para cada issue:
   - Gerar ID único: `task-001`, `task-002`, etc.
   - Criar título baseado na mensagem do issue
   - Determinar tipo de tarefa:
     - `feature`: Implementar nova funcionalidade
     - `fix`: Corrigir bug ou issue
     - `refactor`: Refatorar código
     - `test`: Adicionar testes
     - `docs`: Documentar
   - Atribuir prioridade (P0, P1, P2, P3)
   - Estimar esforço (XS, S, M, L, XL)
   - Gerar descrição
   - Criar critérios de aceitação
   - Identificar localização (se aplicável)
   - Marcar agente que identificou

**Mapeamento de Prioridade:**
- `critical` ou `P0` → P0
- `high` ou `P1` → P1
- `medium` ou `P2` → P2
- `low` ou `P3` → P3

**Estimativa de Esforço:**
- Baseado em tipo de issue e prioridade
- P0 geralmente requer M (4-8h) ou L (8-16h)
- P1 geralmente requer S (1-4h) ou M (4-8h)
- P2 geralmente requer S (1-4h)
- P3 geralmente requer XS (<1h)

**Output:**
```javascript
{
  id: "task-001",
  title: "Corrigir vulnerabilidade crítica em firebase.js",
  type: "fix",
  priority: "P0",
  effort: "M",
  description: "Vulnerabilidade crítica em firebase.js",
  acceptanceCriteria: [
    "Issue resolvido",
    "Código validado",
    "Testes passam"
  ],
  dependencies: [],
  location: "src/firebase.js",
  agent: "Security Audit",
  status: "todo",
  createdAt: "2025-12-30T10:00:00.000Z"
}
```

**Checklist:**
- [ ] Tarefas criadas
- [ ] Tipos determinados
- [ ] Prioridades atribuídas
- [ ] Esforço estimado
- [ ] Critérios de aceitação criados

---

### Step 4: Priorizar Tarefas

**Processo:**
1. Ordenar tarefas por:
   - Prioridade (P0 primeiro)
   - Esforço (menor primeiro dentro da mesma prioridade)

2. Criar ordem de execução sugerida

**Algoritmo:**
```javascript
tasks.sort((a, b) => {
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const effortOrder = { XS: 0, S: 1, M: 2, L: 3, XL: 4 };
  
  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  
  return effortOrder[a.effort] - effortOrder[b.effort];
});
```

**Checklist:**
- [ ] Tarefas ordenadas
- [ ] Ordem de execução definida

---

### Step 5: Identificar Dependências

**Processo:**
1. Para cada tarefa:
   - Analisar descrição para mencionar outras tarefas
   - Verificar se há dependências lógicas:
     - Tarefa A precisa ser feita antes de B
     - Tarefa C depende de resultado de D

2. Criar grafo de dependências

**Exemplo:**
- Task-001: "Configurar Firebase" → Task-002: "Implementar autenticação"
- Task-003: "Adicionar testes" → Task-004: "Implementar feature"

**Output:**
```javascript
{
  id: "task-002",
  dependencies: ["task-001"]
}
```

**Checklist:**
- [ ] Dependências identificadas
- [ ] Grafo de dependências criado

---

### Step 6: Agrupar Tarefas

**Agrupamentos:**
1. **Por Prioridade:**
   - P0: Tarefas críticas
   - P1: Tarefas alta prioridade
   - P2: Tarefas média prioridade
   - P3: Tarefas baixa prioridade

2. **Por Tipo:**
   - Feature: Novas funcionalidades
   - Fix: Correções
   - Refactor: Refatorações
   - Test: Testes
   - Docs: Documentação

3. **Por Esforço:**
   - XS: < 1 hora
   - S: 1-4 horas
   - M: 4-8 horas
   - L: 8-16 horas
   - XL: > 16 horas

**Output:**
```javascript
{
  byPriority: {
    P0: [task1, task2],
    P1: [task3, task4],
    ...
  },
  byType: {
    feature: [task1],
    fix: [task2, task3],
    ...
  },
  byEffort: {
    XS: [task4],
    S: [task5],
    ...
  }
}
```

**Checklist:**
- [ ] Tarefas agrupadas por prioridade
- [ ] Tarefas agrupadas por tipo
- [ ] Tarefas agrupadas por esforço

---

### Step 7: Calcular Summary

**Métricas a Calcular:**
1. **Total de Tarefas:** Número total
2. **Por Prioridade:**
   - P0: Número de tarefas críticas
   - P1: Número de tarefas alta
   - P2: Número de tarefas média
   - P3: Número de tarefas baixa

3. **Esforço Total:**
   - Converter esforço em horas:
     - XS: 0.5h
     - S: 2h
     - M: 6h
     - L: 12h
     - XL: 24h
   - Somar todas as horas

4. **Data de Conclusão Estimada:**
   - Assumir 4 horas por dia de trabalho
   - Calcular dias necessários
   - Adicionar à data atual

**Output:**
```javascript
{
  totalTasks: 15,
  p0Tasks: 2,
  p1Tasks: 6,
  p2Tasks: 5,
  p3Tasks: 2,
  estimatedEffort: "40 hours",
  estimatedCompletion: "2025-01-10"
}
```

**Checklist:**
- [ ] Total calculado
- [ ] Por prioridade calculado
- [ ] Esforço total calculado
- [ ] Data de conclusão estimada

---

### Step 8: Criar Estrutura de Backlog

**Estrutura Completa:**
```json
{
  "backlogId": "backlog-improvements-2025-12-30T10-00-00",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "createdBy": "Backlog Generator",
  "milestone": "Improvements",
  "deadline": "2025-01-10",
  "tasks": [
    {
      "id": "task-001",
      "title": "...",
      "type": "fix",
      "priority": "P0",
      "effort": "M",
      "description": "...",
      "acceptanceCriteria": [...],
      "dependencies": [],
      "location": "...",
      "agent": "...",
      "status": "todo",
      "createdAt": "...",
      "originalIssue": {
        "id": "...",
        "type": "...",
        "severity": "..."
      }
    }
  ],
  "groups": {
    "byPriority": {...},
    "byType": {...},
    "byEffort": {...}
  },
  "summary": {
    "totalTasks": 15,
    "p0Tasks": 2,
    "p1Tasks": 6,
    "p2Tasks": 5,
    "p3Tasks": 2,
    "estimatedEffort": "40 hours",
    "estimatedCompletion": "2025-01-10"
  }
}
```

**Checklist:**
- [ ] Estrutura criada
- [ ] Todos os campos preenchidos
- [ ] Formato JSON válido

---

### Step 9: Mesclar com Backlog Original (Se Aplicável)

**Processo:**
1. Se havia backlog do Product Manager:
   - Carregar backlog original
   - Mesclar tarefas:
     - Adicionar tarefas de melhoria ao backlog original
     - Manter backlogId original
     - Atualizar summary

2. Se não havia backlog:
   - Criar novo backlog apenas com melhorias

**Checklist:**
- [ ] Backlog original verificado
- [ ] Tarefas mescladas (se aplicável)
- [ ] Summary atualizado

---

### Step 10: Salvar Backlog

**Processo:**
1. Salvar backlog em:
   - `src/shared/backlog/[backlogId].json`
   - `src/shared/backlog/current-backlog.json` (sempre atualizado)

2. Validar JSON:
   - Formato válido
   - Estrutura correta
   - Todos os campos obrigatórios presentes

**Checklist:**
- [ ] Backlog salvo
- [ ] JSON válido
- [ ] Arquivo atualizado

---

## 📊 Outputs

### Arquivos Gerados

1. **Backlog JSON:**
   - `src/shared/backlog/[backlogId].json`
   - Estrutura completa de tarefas

2. **Backlog Atual:**
   - `src/shared/backlog/current-backlog.json`
   - Sempre reflete o backlog mais recente

### Estrutura de Tarefa

Cada tarefa contém:
- **id**: Identificador único
- **title**: Título descritivo
- **type**: Tipo (feature, fix, refactor, test, docs)
- **priority**: Prioridade (P0, P1, P2, P3)
- **effort**: Esforço estimado (XS, S, M, L, XL)
- **description**: Descrição detalhada
- **acceptanceCriteria**: Critérios de aceitação
- **dependencies**: IDs de tarefas dependentes
- **location**: Localização no código (se aplicável)
- **agent**: Agente que identificou o issue
- **status**: Status (todo, in-progress, review, done)
- **createdAt**: Data de criação
- **originalIssue**: Referência ao issue original

---

## ✅ Checklist de Execução

Antes de considerar backlog gerado:

- [ ] Issues coletados de todos os agentes
- [ ] Issues agrupados por tipo
- [ ] Tarefas criadas
- [ ] Prioridades atribuídas
- [ ] Esforço estimado
- [ ] Dependências identificadas
- [ ] Tarefas agrupadas
- [ ] Summary calculado
- [ ] Estrutura criada
- [ ] Backlog mesclado (se aplicável)
- [ ] Backlog salvo
- [ ] JSON válido

---

## 🎯 Boas Práticas

1. **Títulos Descritivos:** Títulos devem ser claros e específicos
2. **Critérios de Aceitação:** Sempre incluir critérios claros
3. **Estimativas Realistas:** Estimar esforço com base em complexidade
4. **Dependências Explícitas:** Identificar todas as dependências
5. **Priorização Consistente:** Usar critérios consistentes para priorizar
6. **Agrupamento Lógico:** Agrupar tarefas relacionadas

---

## ⚠️ Problemas Comuns

### Issues Vazios

**Problema:** Nenhum issue para converter

**Solução:** Verificar se agentes executaram corretamente e identificaram issues.

### Dependências Circulares

**Problema:** Tarefa A depende de B, B depende de A

**Solução:** Revisar dependências e quebrar ciclo, ou combinar tarefas.

### Estimativas Incorretas

**Problema:** Esforço estimado muito diferente do real

**Solução:** Revisar histórico de tarefas similares e ajustar estimativas.

---

**Última Atualização**: 2025-12-30  
**Versão**: 2.0

