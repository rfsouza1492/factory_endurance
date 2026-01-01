# 🐛 Troubleshooting - Maestro System

**Guia consolidado de resolução de problemas**

---

## 📋 Índice Rápido

- [Firebase e Emuladores](#firebase-e-emuladores)
- [Servidor Web](#servidor-web)
- [Workflow](#workflow)
- [Firestore e Dados](#firestore-e-dados)
- [Testes](#testes)
- [Dashboard](#dashboard)
- [Performance](#performance)
- [Erros Comuns](#erros-comuns)

---

## 🔥 Firebase e Emuladores

### Problema: Emuladores não conectam

**Sintomas:**
```
Error: ECONNREFUSED 127.0.0.1:8080
Firestore não disponível
```

**Solução:**
```bash
# 1. Parar emuladores existentes
npm run firebase:kill

# 2. Verificar se portas estão livres
lsof -i :8080,9099,9199,5001,4000

# 3. Iniciar emuladores
npm run firebase:dev

# 4. Aguardar mensagem: "All emulators ready!"
```

**Verificação:**
```bash
# Verificar processos Firebase
ps aux | grep firebase | grep -v grep

# Verificar portas
lsof -i :8080  # Firestore
lsof -i :9099  # Auth
lsof -i :9199  # Storage
lsof -i :5001  # Functions
lsof -i :4000  # UI
```

---

### Problema: Firebase não disponível

**Sintomas:**
```
Firebase não disponível
Erro ao conectar ao Firestore
```

**Solução:**
```bash
# 1. Verificar variáveis de ambiente
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_API_KEY

# 2. Verificar configuração
cat maestro-workflow/FIREBASE_CONFIG.md

# 3. Testar conexão
npm run test:firebase
```

**Configuração:**
- Ver [`FIREBASE_CONFIG.md`](../FIREBASE_CONFIG.md) para credenciais
- Ver [`FIREBASE_INTEGRATION.md`](./FIREBASE_INTEGRATION.md) para setup completo

---

### Problema: Dados não sincronizando

**Sintomas:**
- Dados salvos em arquivos mas não aparecem no Firestore
- Mudanças no Firestore não refletem em arquivos

**Solução:**
```bash
# 1. Verificar modo de sincronização
echo $USE_FIRESTORE
echo $SYNC_TO_FILES

# 2. Verificar logs
tail -f maestro-workflow/src/shared/workflow.log

# 3. Testar sincronização manual
node maestro-workflow/src/firebase/test-integration.js
```

**Modos disponíveis:**
- **Híbrido:** `USE_FIRESTORE=true SYNC_TO_FILES=true` (padrão)
- **Apenas Firestore:** `USE_FIRESTORE=true SYNC_TO_FILES=false`
- **Apenas Arquivos:** `USE_FIRESTORE=false`

---

## 🌐 Servidor Web

### Problema: Servidor na porta errada

**Sintomas:**
- Servidor rodando na porta 8000 ao invés de 3001
- Dashboard não acessível

**Solução:**
```bash
# 1. Verificar porta atual
lsof -i :3001
lsof -i :8000

# 2. Matar processo na porta errada
lsof -ti:8000 | xargs kill -9

# 3. Iniciar na porta correta
cd maestro-workflow
PORT=3001 npm run maestro:web

# Ou usar script
./start-server.sh
```

**Verificação:**
```bash
# Verificar servidor rodando
ps aux | grep "node.*server" | grep -v grep

# Testar endpoint
curl http://localhost:3001/api/status
```

---

### Problema: Servidor não inicia

**Sintomas:**
```
Error: Cannot find module
Error: Port already in use
```

**Solução:**
```bash
# 1. Verificar dependências
cd maestro-workflow
npm install

# 2. Verificar sintaxe
node --check src/web/server.js

# 3. Verificar porta
lsof -i :3001
# Se estiver em uso:
kill -9 <PID>

# 4. Executar com logs
node src/web/server.js
```

**Dependências necessárias:**
- Node.js 18+
- npm install executado
- Firebase configurado

---

### Problema: Rate limiting excessivo

**Sintomas:**
```
429 Too Many Requests
Rate limit exceeded
```

**Solução:**
```bash
# 1. Verificar configuração de rate limiter
grep -r "rateLimiter" maestro-workflow/src/middleware/

# 2. Ajustar limites (se necessário)
# Editar: src/middleware/rate-limiter.js

# 3. Aguardar janela de tempo resetar
# Padrão: 60 segundos
```

---

## 🔄 Workflow

### Problema: Workflow falha ao salvar

**Sintomas:**
```
Erro ao salvar backlog no Firestore
Erro ao salvar resultado
```

**Solução:**
```bash
# 1. Verificar modo híbrido (fallback para arquivos)
# Dados devem estar em:
ls -la maestro-workflow/src/shared/results/
ls -la maestro-workflow/src/shared/backlog/

# 2. Verificar Firestore
# Acessar: http://localhost:4000
# Verificar coleções: backlog, results, evaluations

# 3. Verificar logs
tail -f maestro-workflow/src/shared/workflow.log
```

**Modo híbrido:**
- Salva em arquivos mesmo se Firestore falhar
- Verificar ambos os locais

---

### Problema: Workflow não completa

**Sintomas:**
- Workflow para em uma fase
- Agentes não executam
- Timeout

**Solução:**
```bash
# 1. Executar com verbose
npm run maestro -- --verbose

# 2. Executar fase específica
npm run maestro -- --phase=execution

# 3. Verificar progresso
cat maestro-workflow/src/shared/workflow-progress.json

# 4. Verificar logs
tail -f maestro-workflow/src/shared/workflow.log
```

**Debug:**
```bash
# Habilitar debug
DEBUG=* npm run maestro

# Verificar status de agentes
cat maestro-workflow/src/shared/results/*/status.json
```

---

### Problema: Agentes não executam

**Sintomas:**
- Agentes não geram resultados
- Erros silenciosos

**Solução:**
```bash
# 1. Verificar configuração de agentes
cat maestro-workflow/config/agents.json

# 2. Testar agente individual
node maestro-workflow/src/agents/architecture-agent.js

# 3. Verificar dependências
npm list | grep -E "anthropic|openai"

# 4. Verificar variáveis de ambiente
echo $ANTHROPIC_API_KEY
```

---

## 💾 Firestore e Dados

### Problema: Erro "undefined" no Firestore

**Sintomas:**
```
Function setDoc() called with invalid data. Unsupported field value: undefined
```

**Solução:**
```bash
# 1. Verificar sanitização
# Dados devem ser limpos antes de salvar
# Ver: maestro-workflow/src/firebase/firestore-sanitizer.js

# 2. Executar validação
npm run test:firestore-blindage

# 3. Verificar logs de sanitização
grep "sanitize" maestro-workflow/src/shared/workflow.log
```

**Prevenção:**
- Usar `removeUndefined()` antes de salvar
- Validar com `validateForFirestore()`
- Ver [`FIRESTORE_FIX_SUMMARY.md`](./FIRESTORE_FIX_SUMMARY.md)

---

### Problema: Dados não aparecem no Firestore

**Sintomas:**
- Dados salvos mas não visíveis no UI
- Queries retornam vazias

**Solução:**
```bash
# 1. Verificar emuladores rodando
npm run firebase:dev

# 2. Acessar UI
# http://localhost:4000

# 3. Verificar coleções
# Firestore > Data > Verificar collections

# 4. Verificar índices
# Firestore > Indexes > Verificar índices necessários
```

**Queries:**
```javascript
// Verificar dados
import { db } from './firebase/connection.js';
import { collection, getDocs } from 'firebase/firestore';

const snapshot = await getDocs(collection(db, 'backlog'));
snapshot.forEach(doc => console.log(doc.id, doc.data()));
```

---

## 🧪 Testes

### Problema: Testes falham

**Sintomas:**
```
Testes falhando
Erros de conexão
```

**Solução:**
```bash
# 1. Executar testes individualmente
npm run test:unit
npm run test:integration
npm run test:e2e

# 2. Verificar emuladores (para testes E2E)
npm run firebase:dev

# 3. Verificar ambiente de teste
node maestro-workflow/tests/setup-test-env.js setup

# 4. Limpar ambiente
node maestro-workflow/tests/setup-test-env.js cleanup
```

**Testes específicos:**
```bash
# Teste de blindagem Firestore
npm run test:firestore-blindage

# Teste de conexão Firebase
npm run test:firebase

# Teste de integração Firebase
npm run test:firebase:integration
```

---

### Problema: Test Execution Agent bloqueia produção

**Sintomas:**
```
Produção bloqueada por testes
Testes falhando mas código está OK
```

**Solução:**
```bash
# 1. Executar testes manualmente
npm run test:pre-production

# 2. Verificar relatório
cat maestro-workflow/src/shared/results/test-execution/*-report.md

# 3. Pular validação (se necessário)
npm run test:pre-production -- --skip-validation

# 4. Não bloquear produção (temporário)
npm run test:pre-production -- --no-block
```

**⚠️ Atenção:** Não usar `--no-block` em produção sem revisar falhas!

---

## 📊 Dashboard

### Problema: Dashboard não carrega dados

**Sintomas:**
- Dashboard vazio
- Dados não aparecem
- Erros no console

**Solução:**
```bash
# 1. Verificar servidor rodando
curl http://localhost:3001/api/status

# 2. Verificar endpoints
curl http://localhost:3001/api/backlog
curl http://localhost:3001/api/scores

# 3. Verificar console do navegador
# F12 > Console > Verificar erros

# 4. Verificar Firestore (se usando real-time)
# Acessar: http://localhost:4000
```

**Endpoints principais:**
- `/api/status` - Status do servidor
- `/api/backlog` - Backlog atual
- `/api/scores` - Scores dos agentes
- `/api/progress` - Progresso do workflow

---

### Problema: Atualizações em tempo real não funcionam

**Sintomas:**
- Dashboard não atualiza automaticamente
- Dados desatualizados

**Solução:**
```bash
# 1. Verificar sincronização Firestore
# Ver: maestro-workflow/src/firebase/dashboard-integration.js

# 2. Verificar subscriptions ativas
# Console do navegador > Network > WebSocket

# 3. Verificar emuladores
npm run firebase:dev

# 4. Recarregar página
# Ctrl+R ou Cmd+R
```

**Verificação:**
```javascript
// No console do navegador
console.log('Firestore connected:', window.firestoreConnected);
```

---

## ⚡ Performance

### Problema: Workflow lento

**Sintomas:**
- Workflow demora muito para executar
- Timeouts

**Solução:**
```bash
# 1. Verificar logs de tempo
grep "tempo\|time\|duration" maestro-workflow/src/shared/workflow.log

# 2. Executar agentes em paralelo (padrão)
# Verificar: src/scripts/run-workflow.js

# 3. Usar Firestore apenas (sem sync para arquivos)
USE_FIRESTORE=true SYNC_TO_FILES=false npm run maestro

# 4. Verificar rate limiting de APIs
# Ajustar se necessário
```

**Otimizações:**
- Executar agentes em paralelo
- Usar Firestore apenas (sem arquivos)
- Cache de resultados
- Índices do Firestore

---

### Problema: Performance lenta do Firestore

**Sintomas:**
- Queries lentas
- Timeouts no Firestore

**Solução:**
```bash
# 1. Verificar índices
# Firestore UI > Indexes > Verificar índices necessários

# 2. Usar queries otimizadas
# Limitar resultados: .limit(10)
# Usar índices compostos

# 3. Cache local
# Implementar cache em memória

# 4. Usar Cloud Functions para processamento pesado
# Ver: maestro-workflow/functions/
```

---

## ❌ Erros Comuns

### Erro: "Module not found"

**Solução:**
```bash
npm install
```

### Erro: "Port already in use"

**Solução:**
```bash
lsof -ti:3001 | xargs kill -9
```

### Erro: "Firestore rules denied"

**Solução:**
- Verificar `firestore.rules`
- Verificar autenticação
- Verificar permissões

### Erro: "Rate limit exceeded"

**Solução:**
- Aguardar janela de tempo
- Ajustar rate limiter
- Usar cache

---

## 📞 Ainda com Problemas?

### Verificar Documentação
- [`QUICK_START.md`](../QUICK_START.md) - Início rápido
- [`FIREBASE_INTEGRATION.md`](./FIREBASE_INTEGRATION.md) - Integração Firebase
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Guia de testes

### Verificar Logs
```bash
# Logs do workflow
tail -f maestro-workflow/src/shared/workflow.log

# Logs do servidor
# Verificar console onde servidor está rodando

# Logs do Firebase
# Acessar: http://localhost:4000 > Logs
```

### Verificar Status
```bash
# Status do sistema
curl http://localhost:3001/api/status

# Status do Firebase
curl http://localhost:3001/api/firebase/status

# Progresso do workflow
cat maestro-workflow/src/shared/workflow-progress.json
```

---

**Última atualização:** 31 de Dezembro de 2025

