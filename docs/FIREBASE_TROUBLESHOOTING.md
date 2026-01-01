# 🔧 Firebase Troubleshooting

**Guia de solução de problemas comuns do Firebase**

---

## 📋 Índice

1. [Problemas de Conexão](#problemas-de-conexão)
2. [Problemas de Emuladores](#problemas-de-emuladores)
3. [Problemas de Autenticação](#problemas-de-autenticação)
4. [Problemas de Regras](#problemas-de-regras)
5. [Problemas de Variáveis de Ambiente](#problemas-de-variáveis-de-ambiente)
6. [Problemas de Performance](#problemas-de-performance)

---

## 🔌 Problemas de Conexão

### Erro: "Cannot connect to Firebase"

**Sintomas:**
```
❌ Erro ao conectar ao Firebase
```

**Diagnóstico:**
```bash
# 1. Verificar se emuladores estão rodando
curl http://localhost:4000

# 2. Verificar status via API
curl http://localhost:3001/api/firebase/status

# 3. Verificar health check
curl http://localhost:3001/api/firebase/health
```

**Soluções:**
1. **Emuladores não rodando:**
   ```bash
   npm run firebase:emulators:start
   ```

2. **Portas ocupadas:**
   ```bash
   npm run firebase:kill
   ```

3. **Variáveis de ambiente incorretas:**
   ```bash
   # Verificar .env
   cat .env
   
   # Recriar se necessário
   cp .env.example .env
   ```

---

### Erro: "Network request failed"

**Sintomas:**
```
Firebase: Error (auth/network-request-failed)
```

**Soluções:**
1. **Verificar conectividade:**
   ```bash
   ping google.com
   ```

2. **Verificar firewall:**
   - Permitir conexões nas portas dos emuladores
   - Verificar proxy/VPN

3. **Aguardar inicialização:**
   - Emuladores podem levar alguns segundos para iniciar
   - Aguardar 5-10 segundos após iniciar

---

## 🎮 Problemas de Emuladores

### Erro: "Port already in use"

**Sintomas:**
```
Error: Could not start Emulator UI, port taken.
```

**Solução:**
```bash
# Parar todos os emuladores
npm run firebase:kill

# Verificar portas manualmente
lsof -ti:4000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:9099 | xargs kill -9
lsof -ti:9199 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

---

### Erro: "Emulators not responding"

**Sintomas:**
```
⚠️  Não foi possível conectar aos emuladores
```

**Soluções:**
1. **Reiniciar emuladores:**
   ```bash
   npm run firebase:kill
   npm run firebase:emulators:start
   ```

2. **Verificar logs:**
   ```bash
   # Ver logs do Firebase
   tail -f firebase-debug.log
   ```

3. **Verificar Java:**
   ```bash
   java -version  # Deve ser Java 21
   ```

---

## 🔐 Problemas de Autenticação

### Erro: "PERMISSION_DENIED"

**Sintomas:**
```
PERMISSION_DENIED: false for 'read' @ L5
```

**Soluções:**
1. **Em desenvolvimento:**
   ```bash
   # Verificar se está usando emuladores
   echo $USE_FIREBASE_EMULATORS
   
   # Deploy de regras de desenvolvimento
   npm run firebase:rules:deploy:dev
   ```

2. **Em produção:**
   ```bash
   # Verificar autenticação
   # Certifique-se de estar autenticado antes de acessar
   ```

---

### Erro: "Auth not initialized"

**Sintomas:**
```
Firebase: Error (auth/network-request-failed)
```

**Soluções:**
1. **Verificar inicialização:**
   ```javascript
   import { auth } from './src/firebase/connection.js';
   console.log('Auth:', auth);
   ```

2. **Verificar emuladores:**
   ```bash
   # Auth emulator deve estar rodando na porta 9099
   curl http://localhost:9099
   ```

---

## 📜 Problemas de Regras

### Erro: "Rules validation failed"

**Sintomas:**
```
Error: Rules validation failed
```

**Soluções:**
1. **Validar sintaxe:**
   ```bash
   firebase firestore:rules:get
   ```

2. **Testar regras:**
   ```bash
   # Deploy de desenvolvimento primeiro
   npm run firebase:rules:deploy:dev
   ```

3. **Verificar sintaxe:**
   - Usar `rules_version = '2'`
   - Verificar helper functions
   - Verificar paths de match

---

### Erro: "Rules too restrictive"

**Sintomas:**
```
PERMISSION_DENIED mesmo com autenticação
```

**Soluções:**
1. **Verificar regras ativas:**
   ```bash
   firebase firestore:rules:get
   ```

2. **Usar regras de desenvolvimento temporariamente:**
   ```bash
   npm run firebase:rules:deploy:dev
   ```

3. **Revisar regras:**
   - Verificar se `isAuthenticated()` está funcionando
   - Verificar paths de match
   - Verificar condições

---

## 🔑 Problemas de Variáveis de Ambiente

### Erro: "Missing required Firebase env vars"

**Sintomas:**
```
❌ ERRO: Variáveis de ambiente obrigatórias não encontradas
```

**Soluções:**
1. **Verificar arquivo .env:**
   ```bash
   cat .env
   ```

2. **Recriar .env:**
   ```bash
   cp .env.example .env
   # Preencher com credenciais
   ```

3. **Verificar variáveis do sistema:**
   ```bash
   echo $FIREBASE_API_KEY
   echo $FIREBASE_PROJECT_ID
   ```

---

### Erro: "Invalid API key"

**Sintomas:**
```
Firebase: Error (auth/invalid-api-key)
```

**Soluções:**
1. **Verificar credenciais:**
   - Acessar Firebase Console
   - Verificar API key no projeto
   - Atualizar `.env`

2. **Verificar projeto:**
   ```bash
   firebase projects:list
   ```

---

## ⚡ Problemas de Performance

### Erro: "Timeout"

**Sintomas:**
```
Operation timed out
```

**Soluções:**
1. **Verificar conectividade:**
   ```bash
   ping google.com
   ```

2. **Aumentar timeout:**
   ```javascript
   // Em connection.js
   const settings = {
     timeout: 30000 // 30 segundos
   };
   ```

3. **Verificar recursos:**
   - CPU e memória disponíveis
   - Conexão de rede estável

---

## 🔍 Comandos de Diagnóstico

### Verificar Status Completo

```bash
# Status detalhado
curl http://localhost:3001/api/firebase/status | jq

# Health check
curl http://localhost:3001/api/firebase/health

# Status geral
curl http://localhost:3001/api/status | jq
```

### Verificar Emuladores

```bash
# Verificar portas
lsof -i :4000
lsof -i :8080
lsof -i :9099
lsof -i :9199
lsof -i :5001

# Verificar processos
ps aux | grep firebase
```

### Verificar Logs

```bash
# Logs do Firebase
tail -f firebase-debug.log

# Logs do servidor
tail -f /tmp/maestro-server.log

# Logs do Firestore
tail -f firestore-debug.log
```

---

## 📞 Suporte Adicional

### Recursos

- **Documentação Firebase:** https://firebase.google.com/docs
- **Firebase Console:** https://console.firebase.google.com
- **Stack Overflow:** Tag `firebase`

### Logs para Debug

```bash
# Habilitar logs detalhados
export DEBUG=firebase:*

# Executar com logs
npm run maestro:web
```

---

**Última atualização:** 31 de Dezembro de 2025

