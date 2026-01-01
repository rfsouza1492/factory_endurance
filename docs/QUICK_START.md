# 🚀 Quick Start - Maestro Workflow

## Execução Rápida

### Executar Workflow Completo

```bash
npm run maestro
```

ou

```bash
node Agents/maestro/scripts/run-workflow.js
```

---

## Fases do Workflow

### 1️⃣ Execução Paralela dos Agentes

Cada agente executa sua análise:
- **Architecture Review** → Analisa arquitetura
- **Code Quality Review** → Avalia qualidade do código
- **Document Analysis** → Analisa documentação

**Resultados salvos em:** `maestro/shared/results/`

---

### 2️⃣ Avaliação Cruzada

Cada agente avalia os resultados dos outros:
- Architecture avalia Code Quality e Document Analysis
- Code Quality avalia Architecture e Document Analysis
- Document Analysis avalia Architecture e Code Quality

**Avaliações salvas em:** `maestro/shared/evaluations/`

---

### 3️⃣ Decisão Go/No-go

Maestro consolida tudo e decide:
- **GO**: Pode prosseguir
- **NO-GO**: Bloqueado, precisa corrigir
- **GO WITH CONCERNS**: Pode prosseguir mas com atenção

**Relatório em:** `maestro/shared/decisions/go-no-go-report.md`

---

### 4️⃣ Aprovação do Usuário

Usuário revisa e aprova/rejeita a decisão.

---

## Comandos Úteis

```bash
# Workflow completo
npm run maestro

# Apenas execução dos agentes
npm run maestro:execution

# Apenas avaliação cruzada
npm run maestro:evaluation

# Apenas decisão Go/No-go
npm run maestro:decision

# Com opções
npm run maestro -- --skip-approval
npm run maestro -- --verbose
```

---

## Estrutura de Arquivos

```
maestro/
├── README.md                    # Documentação completa
├── QUICK_START.md               # Este arquivo
├── processes/                    # Processos detalhados
│   ├── workflow-execution.md
│   ├── agent-coordination.md
│   ├── cross-evaluation.md
│   └── go-no-go-decision.md
├── templates/                    # Templates
│   ├── agent-result-template.md
│   ├── cross-evaluation-template.md
│   ├── go-no-go-report-template.md
│   └── approval-request-template.md
├── scripts/                     # Scripts
│   └── run-workflow.js
└── shared/                      # Área compartilhada (gerado)
    ├── results/
    ├── evaluations/
    └── decisions/
```

---

## Próximos Passos

1. **Executar workflow**: `npm run maestro`
2. **Revisar resultados**: Ver `maestro/shared/results/`
3. **Revisar avaliações**: Ver `maestro/shared/evaluations/`
4. **Revisar decisão**: Ver `maestro/shared/decisions/go-no-go-report.md`
5. **Aprovar/Rejeitar**: Editar relatório e atualizar seção de aprovação

---

## Documentação Completa

- **README**: `maestro/README.md` - Visão geral completa
- **Processos**: `maestro/processes/` - Processos detalhados
- **Templates**: `maestro/templates/` - Templates para uso

---

**Última Atualização**: 2024-12-30

