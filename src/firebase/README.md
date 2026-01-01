# 🔥 Firebase Integration - Maestro Workflow

Módulos e scripts para integração do Maestro Workflow com Firebase.

## 📁 Estrutura

```
src/firebase/
├── connection.js          # Módulo principal de conexão
├── test-connection.js    # Script de teste de conexão
├── migrate-data.js        # Script de migração de dados
└── README.md             # Esta documentação
```

## 🚀 Quick Start

### 1. Testar Conexão

```bash
# Garantir que emuladores estão rodando
npm run firebase:dev

# Em outro terminal, testar conexão
npm run test:firebase
```

### 2. Migrar Dados

```bash
# Modo híbrido (manter arquivos + Firestore)
npm run firebase:migrate

# Modo completo (apenas Firestore)
npm run firebase:migrate:complete
```

## 📚 Módulos

### `connection.js`

Módulo principal que gerencia a conexão com Firebase.

**Uso:**

```javascript
import { db, auth, storage, functions } from './firebase/connection.js';
import { saveAgentResult, getAgentResults } from './firebase/connection.js';

// Salvar resultado de agente
await saveAgentResult('architecture-agent', {
  score: 85,
  issues: ['Issue 1', 'Issue 2'],
  recommendations: ['Rec 1', 'Rec 2']
});

// Ler resultados
const results = await getAgentResults('architecture-agent');
```

**Funções disponíveis:**

- `saveAgentResult(agentName, result)` - Salvar resultado de agente
- `getAgentResults(agentName)` - Ler resultados de um agente
- `saveBacklog(backlogData, backlogId)` - Salvar backlog
- `getBacklog(backlogId)` - Ler backlog
- `saveDecision(decisionData, decisionId)` - Salvar decisão
- `saveEvaluation(evaluationData, evaluationId)` - Salvar avaliação
- `saveEvent(eventData, eventId)` - Salvar evento
- `subscribeToCollection(collectionName, callback, options)` - Observar coleção em tempo real
- `subscribeToDocument(collectionName, docId, callback)` - Observar documento em tempo real

### `test-connection.js`

Script para testar a conexão com Firebase.

**Testa:**
- ✅ Firestore (leitura/escrita)
- ✅ Authentication (login anônimo)
- ✅ Storage (upload/download)
- ✅ Functions (disponibilidade)
- ✅ Estrutura de dados (coleções)

**Saída:**
```
🧪 Teste de Conexão Firebase
============================================================
ℹ️  Modo: Firebase Emulators (Desenvolvimento)
ℹ️  UI: http://localhost:4000

ℹ️  Testando Firestore...
✅ Firestore: Escrita bem-sucedida
✅ Firestore: Leitura bem-sucedida
...
```

### `migrate-data.js`

Script para migrar dados do sistema de arquivos para Firestore.

**Migra:**
- 📦 Backlog (`src/shared/backlog/`)
- 📊 Resultados de agentes (`src/shared/results/`)
- 📝 Avaliações (`src/shared/evaluations/`)
- 🎯 Decisões (`src/shared/decisions/`)
- 📅 Eventos (`src/shared/events/`)
- 🔧 Implementações (`src/shared/implementations/`)

**Modos:**
- **Híbrido** (padrão): Mantém arquivos + Firestore
- **Completo**: Apenas Firestore (remove arquivos após migração)

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Desenvolvimento (usa emuladores automaticamente)
NODE_ENV=development

# Produção
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your_app_id
```

### Estrutura Firestore

```
planning-with-ai-fa2a3/
├── backlog/
│   ├── current (documento único)
│   └── backlog-improvements-{timestamp} (histórico)
├── results/
│   └── {agent-name}-{timestamp}
├── evaluations/
│   └── {evaluation-id}
├── decisions/
│   └── {decision-id}
├── events/
│   └── {event-id}
├── implementations/
│   └── {implementation-id}
└── statistics/
    ├── metrics (métricas agregadas)
    └── agent-scores (scores de agentes)
```

## 📊 Integração com Dashboard Web

O dashboard web pode usar Firestore para atualizações em tempo real.

**Arquivo:** `src/web/firebase-realtime.js`

**Uso no HTML:**

```html
<!-- Carregar Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"></script>

<!-- Carregar módulo de tempo real -->
<script src="/firebase-realtime.js"></script>

<script>
  // Inicializar
  await FirebaseRealtime.initializeFirebase();
  
  // Observar backlog em tempo real
  FirebaseRealtime.subscribeToBacklog((backlog) => {
    console.log('Backlog atualizado:', backlog);
    updateDashboard(backlog);
  });
  
  // Observar resultados de agentes
  FirebaseRealtime.subscribeToAgentResults('architecture-agent', (results) => {
    console.log('Resultados atualizados:', results);
    updateResults(results);
  });
</script>
```

## 🚀 Cloud Functions

As Cloud Functions estão em `functions/index.js` e incluem:

- **processAgentResult** - Processa resultados de agentes automaticamente
- **generateReport** - Gera relatórios sob demanda
- **processBacklog** - Processa e valida backlog
- **calculateMetrics** - Calcula métricas agregadas (agendado)
- **cleanupOldData** - Limpa dados antigos (agendado)

**Deploy:**

```bash
cd functions
npm install
firebase deploy --only functions
```

## 🧪 Testes

```bash
# Testar conexão
npm run test:firebase

# Testar migração (dry-run)
npm run firebase:migrate
```

## 📝 Checklist de Integração

- [x] Firebase SDK instalado
- [x] Módulo de conexão criado
- [x] Script de teste de conexão
- [x] Script de migração de dados
- [x] Helpers para salvar/ler dados
- [x] Integração com dashboard web
- [x] Cloud Functions configuradas
- [ ] Testar tudo localmente
- [ ] Deploy quando pronto

## 🔗 Links Úteis

- [Firebase Emulator UI](http://localhost:4000)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

---

**Próximos passos:** Ver `scripts/firebase/INTEGRATION_STEPS.md`

