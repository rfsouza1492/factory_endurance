# 👋 Guia de Onboarding - Maestro System

**Bem-vindo ao Maestro!** Este guia vai te ajudar a entender e começar a trabalhar com o sistema.

---

## 🎯 O Que É o Maestro?

O **Maestro** é um sistema automatizado de coordenação de agentes especializados que trabalham juntos para:
- ✅ Avaliar o estado de desenvolvimento de projetos
- ✅ Revisar código, arquitetura e documentação
- ✅ Gerar backlog de melhorias
- ✅ Decidir Go/No-go para produção
- ✅ Implementar correções automaticamente

---

## 📋 Pré-requisitos

### Conhecimentos Necessários
- ✅ JavaScript/Node.js (ES6+)
- ✅ Conceitos básicos de arquitetura de software
- ✅ Git e controle de versão
- ✅ Firebase/Firestore (básico)

### Ferramentas Necessárias
- ✅ Node.js 18+ instalado
- ✅ npm ou yarn
- ✅ Git
- ✅ Editor de código (VS Code recomendado)
- ✅ Terminal/CLI

---

## 🚀 Setup Inicial

### 1. Clonar e Instalar

```bash
# Navegar para o diretório do projeto
cd "/Users/rafaelsouza/Desktop/Tasks Man/maestro-workflow"

# Instalar dependências
npm install
```

### 2. Configurar Firebase

```bash
# Verificar configuração
cat FIREBASE_CONFIG.md

# Iniciar emuladores (desenvolvimento)
npm run firebase:dev
```

### 3. Verificar Instalação

```bash
# Testar conexão Firebase
npm run test:firebase

# Executar testes básicos
npm run test:unit
```

---

## 📚 Ordem de Leitura Recomendada

### Fase 1: Entender o Sistema (1-2 horas)

1. **Visão Geral**
   - [`README.md`](../README.md) - Visão geral do sistema
   - [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md) - Resumo executivo

2. **Arquitetura**
   - [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) - Arquitetura
   - [`PROCESS_MAPPING.md`](./PROCESS_MAPPING.md) - Mapeamento de processos
   - [`WORKFLOW_DIAGRAM.md`](./WORKFLOW_DIAGRAM.md) - Diagramas

### Fase 2: Entender o Workflow (1-2 horas)

3. **Processos**
   - [`processes/workflow-execution.md`](./processes/workflow-execution.md) - Execução
   - [`processes/backlog-generation.md`](./processes/backlog-generation.md) - Backlog
   - [`processes/go-no-go-decision.md`](./processes/go-no-go-decision.md) - Decisão

4. **Agentes**
   - [`IMPLEMENTATION_AGENT.md`](./IMPLEMENTATION_AGENT.md) - Agent de implementação
   - [`PRODUCT_MANAGER_AGENT.md`](./PRODUCT_MANAGER_AGENT.md) - Product Manager

### Fase 3: Hands-On (2-3 horas)

5. **Primeiro Workflow**
   - [`QUICK_START.md`](../QUICK_START.md) - Início rápido
   - Executar workflow completo: `npm run maestro`

6. **Explorar Resultados**
   - Verificar `src/shared/results/`
   - Verificar `src/shared/backlog/`
   - Acessar dashboard: http://localhost:3001

### Fase 4: Aprofundar (Opcional)

7. **Firebase**
   - [`FIREBASE_INTEGRATION.md`](./FIREBASE_INTEGRATION.md) - Integração
   - [`FIRESTORE_BLINDAGE_COMPLETE.md`](./FIRESTORE_BLINDAGE_COMPLETE.md) - Blindagem

8. **Testes**
   - [`testing-methodology/README.md`](./testing-methodology/README.md) - Metodologia
   - [`TEST_EXECUTION_AGENT.md`](./TEST_EXECUTION_AGENT.md) - Agent de testes

---

## 🎓 Conceitos Fundamentais

### 1. Agentes Especializados

Agentes são módulos especializados que executam tarefas específicas:

- **Architecture Review Agent** - Revisa arquitetura
- **Code Quality Review Agent** - Avalia qualidade de código
- **Document Analysis Agent** - Analisa documentação
- **Implementation Agent** - Implementa correções
- **Product Manager Agent** - Gerencia backlog

### 2. Workflow em Fases

```
Fase 0: Product Manager
  ↓
Fase 1: Execução (Agentes paralelos)
  ↓
Fase 2: Avaliação Cruzada
  ↓
Fase 3: Decisão Go/No-go
  ↓
Fase 4: Testes
  ↓
Fase 5: Implementação
  ↓
Fase 6: Aprovação
```

### 3. Dados Compartilhados

- `src/shared/results/` - Resultados dos agentes
- `src/shared/backlog/` - Backlog de tarefas
- `src/shared/evaluations/` - Avaliações cruzadas
- `src/shared/decisions/` - Decisões Go/No-go

### 4. Firestore Integration

- Dados sincronizados em tempo real
- Modo híbrido (arquivos + Firestore)
- Emuladores para desenvolvimento

---

## 🛠️ Primeiros Passos Práticos

### Exercício 1: Executar Workflow Completo

```bash
# 1. Iniciar emuladores Firebase
npm run firebase:dev

# 2. Em outro terminal, executar workflow
npm run maestro

# 3. Verificar resultados
ls -la src/shared/results/
ls -la src/shared/backlog/
```

### Exercício 2: Explorar Dashboard

```bash
# 1. Iniciar servidor web
npm run maestro:web

# 2. Acessar dashboard
# http://localhost:3001/dashboard
# http://localhost:3001/multi-project
```

### Exercício 3: Executar Testes

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e
```

---

## 🔍 Estrutura do Código

```
maestro-workflow/
├── src/
│   ├── agents/              # Agentes especializados
│   │   ├── architecture-agent.js
│   │   ├── code-quality-agent.js
│   │   ├── implementation-agent.js
│   │   └── ...
│   ├── scripts/             # Scripts de execução
│   │   ├── run-workflow.js  # Workflow principal
│   │   └── backlog-generator.js
│   ├── shared/              # Dados compartilhados
│   │   ├── results/
│   │   ├── backlog/
│   │   └── ...
│   ├── firebase/            # Integração Firebase
│   │   ├── connection.js
│   │   └── ...
│   ├── web/                 # Interface web
│   │   ├── server.js
│   │   └── ...
│   └── utils/               # Utilitários
├── docs/                     # Documentação
├── tests/                    # Testes
└── config/                   # Configurações
```

---

## 🐛 Troubleshooting Comum

### Problema: Emuladores não conectam

```bash
# Verificar se estão rodando
lsof -i :8080

# Reiniciar
npm run firebase:kill
npm run firebase:dev
```

### Problema: Servidor na porta errada

```bash
# Verificar porta
lsof -i :3001

# Iniciar na porta correta
PORT=3001 npm run maestro:web
```

### Problema: Erro de undefined no Firestore

Ver [`FIRESTORE_FIX_SUMMARY.md`](./FIRESTORE_FIX_SUMMARY.md)

---

## 📞 Onde Buscar Ajuda

### Documentação
- [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) - Índice completo
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Guia de troubleshooting

### Código
- `src/agents/` - Implementação dos agentes
- `src/scripts/run-workflow.js` - Workflow principal
- `tests/` - Exemplos de uso

### Comunidade
- Issues no repositório
- Documentação de cada componente

---

## ✅ Checklist de Onboarding

- [ ] Pré-requisitos instalados
- [ ] Projeto clonado e dependências instaladas
- [ ] Firebase configurado e emuladores rodando
- [ ] Testes básicos passando
- [ ] README.md lido
- [ ] Workflow completo executado uma vez
- [ ] Dashboard acessado e explorado
- [ ] Estrutura de código entendida
- [ ] Primeiro agente explorado
- [ ] Documentação de referência localizada

---

## 🎯 Próximos Passos

Após completar o onboarding:

1. **Explorar um agente específico**
   - Escolher um agente de interesse
   - Ler documentação específica
   - Analisar código-fonte

2. **Contribuir**
   - Identificar área de interesse
   - Ler guias de contribuição
   - Fazer primeiro PR

3. **Aprofundar**
   - Estudar arquitetura em detalhes
   - Entender integração Firebase
   - Explorar testes

---

## 📚 Recursos Adicionais

- [`QUICK_START.md`](../QUICK_START.md) - Início rápido
- [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) - Índice completo
- [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md) - Resumo executivo

---

**Bem-vindo ao Maestro!** 🎭

Se tiver dúvidas, consulte a documentação ou abra uma issue.

**Última atualização:** 31 de Dezembro de 2025

