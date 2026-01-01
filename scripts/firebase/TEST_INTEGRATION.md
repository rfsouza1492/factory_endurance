# 🧪 Guia de Teste de Integração Firebase

## ✅ Checklist de Implementação

- [x] Script de teste de conexão (`src/firebase/test-connection.js`)
- [x] Script de migração híbrida (`src/firebase/migration.js`)
- [x] Script de migração completa (`src/firebase/migration.js`)
- [x] Integração Firestore para dashboard (`src/web/firestore-integration.js`)
- [x] Dashboard com Firestore (`src/web/dashboard-firestore.js`)
- [x] Cloud Functions para processamento (`functions/index.js`)

---

## 🚀 Como Testar

### 1. Testar Conexão Firebase

```bash
# Garantir que emuladores estão rodando
cd maestro-workflow
npm run firebase:dev

# Em outro terminal, testar conexão
node src/firebase/test-connection.js
```

**Resultado esperado:**
- ✅ Todos os serviços (Firestore, Auth, Storage, Functions) conectados
- ✅ Testes de leitura/escrita passando
- ✅ Estrutura de dados verificada

---

### 2. Testar Migração de Dados

#### Opção A: Migração Híbrida

```bash
# Migrar dados mantendo arquivos
node src/firebase/migration.js hybrid
```

**O que faz:**
- Migra dados de `src/shared/` para Firestore
- Mantém arquivos originais
- Adiciona flag `syncEnabled: true`
- Permite sincronização bidirecional

#### Opção B: Migração Completa

```bash
# Migrar tudo para Firestore
node src/firebase/migration.js complete
```

**O que faz:**
- Migra todos os dados
- Marca como `migrationComplete: true`
- Mantém arquivos como backup
- Sistema passa a usar apenas Firestore

#### Verificar Status

```bash
# Ver status da migração
node src/firebase/migration.js status
```

---

### 3. Testar Dashboard com Firestore

#### Opção 1: Dashboard Standalone

1. Abrir `src/web/dashboard-firestore.html` (criar se não existir)
2. Verificar console do navegador
3. Dados devem aparecer em tempo real

#### Opção 2: Integrar com Dashboard Existente

```javascript
// No dashboard.js existente, adicionar:
import { integrateWithDashboard } from './firestore-integration.js';

// Substituir polling por:
integrateWithDashboard(dashboardState);
```

**Resultado esperado:**
- ✅ Dados aparecem automaticamente
- ✅ Atualizações em tempo real
- ✅ Sincronização entre abas/sessões

---

### 4. Testar Cloud Functions

#### Localmente (Emuladores)

```bash
# Functions já estão configuradas
cd maestro-workflow
npm run firebase:dev

# Acessar UI: http://localhost:4000
# Ir para aba "Functions"
# Testar função "processAgent"
```

#### Via Código

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from './firebase/connection.js';

// Chamar função
const processAgent = httpsCallable(functions, 'processAgent');
const result = await processAgent({
  agentName: 'architecture-agent',
  inputData: { test: true }
});

console.log('Resultado:', result.data);
```

**Funções disponíveis:**
- `processAgent` - Processa um agente
- `generateReport` - Gera relatório agregado
- `calculateMetrics` - Calcula métricas
- `batchProcessAgents` - Processa múltiplos agentes

---

## 📊 Estrutura de Dados no Firestore

Após migração, você terá:

```
planning-with-ai-fa2a3/
├── backlog/
│   └── current (documento único)
├── results/
│   ├── architecture-agent-{timestamp}
│   ├── code-quality-agent-{timestamp}
│   └── ...
├── evaluations/
│   └── {evaluation-id}
├── decisions/
│   └── {decision-id}
├── events/
│   └── {event-id}
├── workflow/
│   └── progress (documento único)
├── processes/
│   └── {process-id}
├── reports/
│   └── {report-id}
├── metrics/
│   └── current (documento único)
└── batches/
    └── {batch-id}
```

---

## 🔍 Verificar no Firebase Emulator UI

1. Acessar: http://localhost:4000
2. Ir para aba "Firestore"
3. Verificar coleções criadas
4. Verificar dados migrados
5. Testar regras de segurança

---

## ⚠️ Troubleshooting

### Erro: "Firestore não disponível"
- **Solução**: Verificar se emuladores estão rodando
- **Comando**: `npm run firebase:dev`

### Erro: "Permission denied"
- **Solução**: Verificar `firestore.rules`
- **Ação**: Atualizar regras para permitir leitura/escrita

### Erro: "Collection not found"
- **Solução**: Executar migração primeiro
- **Comando**: `node src/firebase/migration.js hybrid`

### Dashboard não atualiza
- **Solução**: Verificar se `firestore-integration.js` está importado
- **Ação**: Verificar console do navegador para erros

### Functions não funcionam
- **Solução**: Verificar se Functions estão rodando
- **Ação**: Verificar logs em http://localhost:4000

---

## ✅ Checklist de Testes

- [ ] Conexão Firebase testada e funcionando
- [ ] Migração híbrida executada com sucesso
- [ ] Dados aparecem no Firestore Emulator UI
- [ ] Dashboard mostra dados em tempo real
- [ ] Atualizações aparecem automaticamente
- [ ] Cloud Functions respondem corretamente
- [ ] Sincronização entre sessões funciona
- [ ] Regras de segurança validadas

---

## 🎯 Próximos Passos

1. **Testar em produção** (quando pronto)
   - Configurar credenciais de produção
   - Fazer deploy das Functions
   - Testar com dados reais

2. **Otimizar performance**
   - Adicionar índices no Firestore
   - Implementar paginação
   - Cache de dados frequentes

3. **Melhorar segurança**
   - Revisar regras do Firestore
   - Implementar autenticação adequada
   - Validar inputs nas Functions

---

**Última atualização**: 2024-12-30

