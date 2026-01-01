# 🔥 Guia de Integração - Agentes com Firestore

## ✅ Helper Criado

**Arquivo:** `maestro-workflow/src/firebase/agent-results-helper.js`

Este helper permite que os agentes salvem resultados diretamente no Firestore mantendo compatibilidade com o sistema de arquivos.

## 📦 Funções Disponíveis

### 1. `saveAgentResultToFirestore(agentName, resultData, options)`

Salva resultado de agente no Firestore.

**Parâmetros:**
- `agentName` (string): Nome do agente (ex: 'architecture-review')
- `resultData` (object): Dados do resultado
- `options` (object):
  - `markdownContent` (string): Conteúdo markdown do relatório
  - `filePath` (string): Caminho do arquivo (para modo híbrido)
  - `timestamp` (string): Timestamp do resultado

**Exemplo:**
```javascript
import { saveAgentResultToFirestore } from '../firebase/agent-results-helper.js';

const result = await saveAgentResultToFirestore(
  'architecture-review',
  {
    score: 85,
    issues: [...],
    recommendations: [...]
  },
  {
    markdownContent: reportMarkdown,
    filePath: path.join(RESULTS_DIR, 'architecture-review', `${timestamp}-review.md`),
    timestamp
  }
);
```

### 2. `saveBacklogToFirestore(backlogData, options)`

Salva backlog no Firestore.

**Exemplo:**
```javascript
import { saveBacklogToFirestore } from '../firebase/agent-results-helper.js';

await saveBacklogToFirestore(backlogData, {
  backlogId: 'current',
  filePath: path.join(BACKLOG_DIR, 'current-backlog.json')
});
```

### 3. `saveEvaluationToFirestore(evaluationId, evaluationData, options)`

Salva avaliação cruzada no Firestore.

### 4. `saveDecisionToFirestore(decisionId, decisionData, options)`

Salva decisão Go/No-go no Firestore.

### 5. `saveEventToFirestore(eventId, eventData)`

Salva evento no Firestore.

## 🔄 Modo de Operação

O helper suporta dois modos:

### Modo Híbrido (Padrão)
- Salva no Firestore **E** em arquivo
- Mantém compatibilidade total
- Variável: `FIREBASE_SAVE_MODE=hybrid` (ou não definir)

### Modo Firestore
- Salva apenas no Firestore
- Fallback para arquivo se Firestore falhar
- Variável: `FIREBASE_SAVE_MODE=firestore`

## 📝 Como Integrar um Agente

### Passo 1: Importar o Helper

```javascript
import { saveAgentResultToFirestore } from '../firebase/agent-results-helper.js';
```

### Passo 2: Substituir Salvamento em Arquivo

**Antes:**
```javascript
const content = generateReport(results, timestamp);
fs.writeFileSync(filePath, content);
```

**Depois:**
```javascript
const content = generateReport(results, timestamp);

// Salvar no Firestore e arquivo (modo híbrido)
const saveResult = await saveAgentResultToFirestore(
  'agent-name',
  {
    ...results,
    score: results.score,
    status: 'completed'
  },
  {
    markdownContent: content,
    filePath: filePath,
    timestamp
  }
);

// Manter compatibilidade (salvar arquivo se Firestore falhou)
if (!saveResult.filePath && filePath) {
  fs.writeFileSync(filePath, content);
}
```

### Passo 3: Atualizar Resultado com Firestore ID

```javascript
const result = {
  agent: 'Agent Name',
  timestamp,
  status: 'completed',
  file: filePath,
  firestoreId: saveResult.firestoreId, // Adicionar ID do Firestore
  data: results
};
```

## ✅ Agentes Já Integrados

- ✅ Architecture Review Agent
- ✅ Code Quality Review Agent

## 🔄 Agentes Pendentes

- [ ] Document Analysis Agent
- [ ] Product Manager Agent
- [ ] Security Audit Agent
- [ ] Performance Analysis Agent
- [ ] Dependency Management Agent
- [ ] Testing Coverage Agent
- [ ] Accessibility Audit Agent
- [ ] API Design Review Agent
- [ ] Implementation Tracking Agent

## 🚀 Exemplo Completo

```javascript
// No run-workflow.js ou no próprio agente

import { saveAgentResultToFirestore } from '../firebase/agent-results-helper.js';

// Executar agente
const agentResult = await runSomeAgent();

// Gerar relatório
const reportContent = generateReport(agentResult.results, timestamp);

// Salvar no Firestore
const saveResult = await saveAgentResultToFirestore(
  'some-agent',
  {
    ...agentResult.results,
    score: agentResult.results.score || 0,
    status: agentResult.success ? 'completed' : 'error'
  },
  {
    markdownContent: reportContent,
    filePath: path.join(RESULTS_DIR, 'some-agent', `${timestamp}-result.md`),
    timestamp
  }
);

// Verificar resultado
if (saveResult.success) {
  console.log(`✅ Resultado salvo no Firestore: ${saveResult.firestoreId}`);
} else {
  console.warn(`⚠️  Erro ao salvar no Firestore: ${saveResult.error}`);
}
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Modo de salvamento
FIREBASE_SAVE_MODE=hybrid  # ou 'firestore'

# Firebase (já configurado)
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
```

## 📊 Benefícios

1. **Sincronização em Tempo Real**: Dashboard pode observar mudanças
2. **Backup Automático**: Dados no Firestore e arquivos
3. **Histórico Completo**: Todos os resultados preservados
4. **Compatibilidade**: Sistema de arquivos continua funcionando
5. **Escalabilidade**: Firestore escala automaticamente

## 🐛 Troubleshooting

### Firestore não salva

- Verificar se emuladores estão rodando: `npm run firebase:dev`
- Verificar regras do Firestore: `maestro-workflow/firestore.rules`
- Verificar logs de erro no console

### Arquivo não é salvo

- Verificar permissões do diretório
- Verificar se `filePath` está correto
- Modo híbrido sempre salva arquivo se Firestore falhar

---

**Próximo passo:** Integrar os agentes restantes seguindo este padrão.

