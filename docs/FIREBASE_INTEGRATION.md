# 🔥 Integração Firebase - Maestro Workflow

Guia completo de integração do Firebase no Maestro Workflow.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Sistema Híbrido](#sistema-híbrido)
4. [Migração de Dados](#migração-de-dados)
5. [Real-time Updates](#real-time-updates)
6. [Cloud Functions](#cloud-functions)
7. [Testes](#testes)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Maestro Workflow agora suporta integração com Firebase usando um **sistema híbrido** que:

- ✅ Mantém compatibilidade com sistema de arquivos
- ✅ Sincroniza automaticamente com Firestore
- ✅ Suporta atualizações em tempo real
- ✅ Usa Cloud Functions para processamento pesado

### Arquitetura

```
┌─────────────────┐
│  Maestro Agents │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Migration      │────▶│  Firestore   │
│  (Híbrido)     │     │  (Real-time)  │
└────────┬────────┘     └──────┬───────┘
         │                     │
         ▼                     ▼
┌─────────────────┐     ┌──────────────┐
│  File System    │     │  Cloud       │
│  (Backup)       │     │  Functions   │
└─────────────────┘     └──────────────┘
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` no diretório `maestro-workflow/`:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id

# Firebase Settings
USE_FIRESTORE=true          # Habilitar Firestore
SYNC_TO_FILES=true          # Manter sincronização com arquivos
USE_FIREBASE_EMULATORS=true # Usar emuladores em desenvolvimento
```

### 2. Inicializar Firebase

```bash
# Usar emuladores (desenvolvimento)
npm run firebase:dev

# Ou inicializar projeto Firebase
npm run firebase:init
```

## 🔄 Sistema Híbrido

O sistema híbrido permite:

- **Modo Arquivo**: Apenas sistema de arquivos (compatibilidade)
- **Modo Híbrido**: Arquivos + Firestore (recomendado)
- **Modo Firestore**: Apenas Firestore (produção)

### Configuração do Modo

```javascript
// migration.js
const USE_FIRESTORE = process.env.USE_FIRESTORE !== 'false';
const SYNC_TO_FILES = process.env.SYNC_TO_FILES !== 'false';
```

### Como Funciona

1. **Salvar**: Dados são salvos em arquivo E Firestore
2. **Ler**: Prioriza Firestore, fallback para arquivo
3. **Sincronização**: Automática em ambas direções

## 📦 Migração de Dados

### Migração Automática

```bash
# Migrar todos os dados existentes
npm run firebase:migrate
```

### Migração Programática

```javascript
import { migrateFilesToFirestore } from './src/firebase/migration.js';

const results = await migrateFilesToFirestore();
console.log('Migração concluída:', results);
```

### O que é Migrado

- ✅ Progresso do workflow (`workflow-progress.json`)
- ✅ Resultados dos agentes (`results/`)
- ✅ Backlog (`backlog/`)
- ✅ Decisões (`decisions/`)

## 🔴 Real-time Updates

### Observar Progresso do Workflow

```javascript
import { watchWorkflowProgress } from './src/firebase/migration.js';

const unsubscribe = watchWorkflowProgress((progress) => {
  console.log('Progresso atualizado:', progress);
  // Atualizar UI em tempo real
});

// Parar de observar
unsubscribe();
```

### Observar Resultados de Agentes

```javascript
import { watchAgentResults } from './src/firebase/migration.js';

const unsubscribe = watchAgentResults('architecture', (results) => {
  console.log('Novos resultados:', results);
});

// Parar de observar
unsubscribe();
```

### Dashboard Web

O dashboard em `src/web/realtime-dashboard.html` já está configurado para usar Firestore quando disponível.

## ☁️ Cloud Functions

### Funções Disponíveis

1. **`processAgentResult`**: Processa resultado de agente
2. **`generateAggregatedReport`**: Gera relatório agregado
3. **`processBacklog`**: Processa backlog e prioriza tarefas
4. **`executeAgent`**: Executa agente remotamente

### Usar Cloud Functions

```javascript
import { functions } from './src/firebase/connection.js';
import { httpsCallable } from 'firebase/functions';

const processAgent = httpsCallable(functions, 'processAgentResult');
const result = await processAgent({
  agentName: 'architecture',
  result: { score: 85, status: 'completed' }
});
```

### Triggers Automáticos

- **`onResultAdded`**: Processa automaticamente novos resultados
- **`onProgressUpdated`**: Notifica quando progresso muda

## 🧪 Testes

### Teste de Conexão Básica

```bash
npm run test:firebase
```

### Teste de Integração Completa

```bash
npm run test:firebase:integration
```

Este teste verifica:
- ✅ Conexão com Firebase
- ✅ Migração de dados
- ✅ Sincronização híbrida
- ✅ Real-time updates
- ✅ Performance

### Teste Manual

```javascript
import { db } from './src/firebase/connection.js';
import { collection, addDoc } from 'firebase/firestore';

const testRef = collection(db, 'test');
await addDoc(testRef, { message: 'Teste', timestamp: new Date() });
console.log('✅ Conexão funcionando!');
```

## 🔧 Troubleshooting

### Erro: "Firebase não disponível"

**Solução**: Verifique se as variáveis de ambiente estão configuradas:

```bash
echo $FIREBASE_PROJECT_ID
```

### Erro: "Emuladores não conectados"

**Solução**: Inicie os emuladores:

```bash
npm run firebase:dev
```

### Dados não sincronizando

**Solução**: Verifique o modo de sincronização:

```javascript
console.log('USE_FIRESTORE:', process.env.USE_FIRESTORE);
console.log('SYNC_TO_FILES:', process.env.SYNC_TO_FILES);
```

### Performance lenta

**Solução**: 
- Use Firestore apenas (desabilite `SYNC_TO_FILES`)
- Use índices do Firestore para queries
- Considere usar Cloud Functions para processamento pesado

## 📚 Próximos Passos

1. **Migração Completa**: Migrar tudo para Firestore
2. **Notificações Push**: Adicionar FCM para notificações
3. **Analytics**: Integrar Firebase Analytics
4. **Performance**: Monitorar com Firebase Performance

## 🔗 Referências

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
