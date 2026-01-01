# 🔥 Firebase Setup - Guia Completo

**Data:** 31 de Dezembro de 2025  
**Versão:** 1.0

---

## 📋 Índice

1. [Requisitos](#requisitos)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Uso](#uso)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## ✅ Requisitos

### Software Necessário

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **Firebase CLI:** Instalado globalmente
- **Java 21:** (para Firebase Emulators)

### Verificar Instalações

```bash
# Verificar Node.js
node --version  # Deve ser >= 18.0.0

# Verificar npm
npm --version  # Deve ser >= 9.0.0

# Verificar Firebase CLI
firebase --version

# Se não estiver instalado:
npm install -g firebase-tools

# Verificar Java (para emuladores)
java -version  # Deve ser Java 21
```

---

## 📦 Instalação

### 1. Instalar Firebase SDK

```bash
cd maestro-workflow
npm install firebase
```

### 2. Login no Firebase

```bash
firebase login
```

### 3. Inicializar Firebase (se ainda não feito)

```bash
firebase init
```

**Opções recomendadas:**
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage
- ✅ Emulators

---

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

**Copiar template:**
```bash
cp .env.example .env
```

**Editar `.env`:**
```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74
FIREBASE_AUTH_DOMAIN=planning-with-ai-fa2a3.firebaseapp.com
FIREBASE_PROJECT_ID=planning-with-ai-fa2a3
FIREBASE_STORAGE_BUCKET=planning-with-ai-fa2a3.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=341098460420
FIREBASE_APP_ID=1:341098460420:web:78b96216c227100dd44c51

# Environment
NODE_ENV=development
USE_FIREBASE_EMULATORS=true
FIREBASE_SYNC_ENABLED=true
FIREBASE_SYNC_MODE=hybrid
```

### 2. Verificar Configuração

```bash
# Testar conexão
npm run test:firebase
```

---

## 🚀 Uso

### Desenvolvimento (Emuladores)

#### Iniciar Emuladores

```bash
# Opção 1: Script inteligente (recomendado)
npm run firebase:emulators:start

# Opção 2: Comando direto
npm run firebase:emulators

# Opção 3: Apenas UI
npm run firebase:emulators:ui
```

**Acessar UI:**
- **Firebase Emulator UI:** http://localhost:4000
- **Firestore:** http://localhost:8080
- **Auth:** http://localhost:9099
- **Storage:** http://localhost:9199
- **Functions:** http://localhost:5001

#### Parar Emuladores

```bash
npm run firebase:kill
```

#### Verificar Status

```bash
# Via API
curl http://localhost:3001/api/firebase/status

# Health check
curl http://localhost:3001/api/firebase/health
```

---

### Produção

#### Configurar Variáveis de Ambiente

```bash
export NODE_ENV=production
export USE_FIREBASE_EMULATORS=false
export FIREBASE_API_KEY=your_production_key
export FIREBASE_PROJECT_ID=your_production_project
# ... outras variáveis
```

#### Deploy de Regras

```bash
# Deploy de regras de produção
npm run firebase:rules:deploy:prod
```

**⚠️ ATENÇÃO:** O script pedirá confirmação antes de fazer deploy em produção.

---

## 🔧 Troubleshooting

### Problema 1: Emuladores não iniciam

**Sintomas:**
```
Error: Could not start Emulator UI, port taken.
```

**Solução:**
```bash
# Parar processos nas portas
npm run firebase:kill

# Verificar portas manualmente
lsof -ti:4000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:9099 | xargs kill -9
lsof -ti:9199 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

---

### Problema 2: Erro de conexão aos emuladores

**Sintomas:**
```
⚠️  Não foi possível conectar aos emuladores
```

**Solução:**
1. Verificar se emuladores estão rodando:
   ```bash
   curl http://localhost:4000
   ```

2. Iniciar emuladores:
   ```bash
   npm run firebase:emulators:start
   ```

3. Aguardar alguns segundos para inicialização completa

---

### Problema 3: Variáveis de ambiente não encontradas

**Sintomas:**
```
❌ ERRO: Variáveis de ambiente obrigatórias não encontradas
```

**Solução:**
1. Verificar se arquivo `.env` existe:
   ```bash
   ls -la .env
   ```

2. Criar a partir do template:
   ```bash
   cp .env.example .env
   ```

3. Preencher com credenciais corretas

---

### Problema 4: Erro de permissão no Firestore

**Sintomas:**
```
PERMISSION_DENIED: false for 'read' @ L5
```

**Solução:**
1. **Em desenvolvimento:** Verificar se está usando emuladores
   ```bash
   npm run firebase:emulators:start
   ```

2. **Em produção:** Verificar regras de segurança
   ```bash
   # Ver regras atuais
   firebase firestore:rules:get
   
   # Deploy de regras de desenvolvimento
   npm run firebase:rules:deploy:dev
   ```

---

### Problema 5: Firebase CLI não encontrado

**Sintomas:**
```
❌ Firebase CLI não está instalado
```

**Solução:**
```bash
# Instalar globalmente
npm install -g firebase-tools

# Verificar instalação
firebase --version

# Login
firebase login
```

---

### Problema 6: Erro ao validar conexão

**Sintomas:**
```
⚠️  Erro ao validar conexão: [erro]
```

**Solução:**
1. Verificar se Firebase está acessível:
   ```bash
   curl http://localhost:3001/api/firebase/health
   ```

2. Verificar logs do servidor:
   ```bash
   tail -f /tmp/maestro-server.log
   ```

3. Testar conexão diretamente:
   ```bash
   npm run test:firebase
   ```

---

## 📚 Best Practices

### 1. Desenvolvimento

- ✅ **Sempre use emuladores** em desenvolvimento
- ✅ **Use `.env`** para variáveis de ambiente
- ✅ **Nunca commite `.env`** no repositório
- ✅ **Use regras de desenvolvimento** para testes

### 2. Produção

- ✅ **Sempre use variáveis de ambiente** do sistema
- ✅ **Use regras de produção** restritivas
- ✅ **Valide variáveis** antes de iniciar
- ✅ **Monitore conexão** regularmente

### 3. Segurança

- ✅ **Nunca commite credenciais** no código
- ✅ **Use `.env.example`** como template
- ✅ **Rotacione credenciais** regularmente
- ✅ **Use autenticação** em produção

### 4. Performance

- ✅ **Use emuladores** para desenvolvimento rápido
- ✅ **Cache conexões** quando possível
- ✅ **Monitore uso** de recursos
- ✅ **Otimize queries** do Firestore

---

## 🔍 Comandos Úteis

### Gerenciamento de Emuladores

```bash
# Iniciar
npm run firebase:emulators:start

# Parar
npm run firebase:kill

# Apenas UI
npm run firebase:emulators:ui
```

### Deploy de Regras

```bash
# Desenvolvimento
npm run firebase:rules:deploy:dev

# Produção (com confirmação)
npm run firebase:rules:deploy:prod
```

### Testes

```bash
# Testar conexão
npm run test:firebase

# Testar integração
npm run test:firebase:integration
```

### Migração

```bash
# Migrar dados para Firestore
npm run firebase:migrate
```

---

## 📊 Verificar Status

### Via API

```bash
# Status detalhado
curl http://localhost:3001/api/firebase/status | jq

# Health check
curl http://localhost:3001/api/firebase/health

# Status geral
curl http://localhost:3001/api/status | jq
```

### Via Console

```bash
# Acessar Firebase Emulator UI
open http://localhost:4000

# Ver Firestore
open http://localhost:4000/firestore
```

---

## 🔗 Links Úteis

- **Console Firebase:** https://console.firebase.google.com/project/planning-with-ai-fa2a3
- **Firestore:** https://console.firebase.google.com/project/planning-with-ai-fa2a3/firestore
- **Documentação Firebase:** https://firebase.google.com/docs
- **Firestore Best Practices:** https://firebase.google.com/docs/firestore/best-practices

---

## 📝 Exemplos Práticos

### Exemplo 1: Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis
cp .env.example .env
# Editar .env com suas credenciais

# 3. Iniciar emuladores
npm run firebase:emulators:start

# 4. Em outro terminal, iniciar servidor
npm run maestro:web

# 5. Verificar status
curl http://localhost:3001/api/firebase/status
```

### Exemplo 2: Testar Conexão

```bash
# Testar conexão básica
npm run test:firebase

# Testar integração completa
npm run test:firebase:integration

# Verificar health check
curl http://localhost:3001/api/firebase/health
```

### Exemplo 3: Deploy em Produção

```bash
# 1. Configurar variáveis de produção
export NODE_ENV=production
export USE_FIREBASE_EMULATORS=false
# ... outras variáveis

# 2. Deploy de regras
npm run firebase:rules:deploy:prod

# 3. Verificar status
curl https://your-production-url/api/firebase/status
```

---

## 🎯 Checklist de Setup

### Desenvolvimento
- [ ] Firebase CLI instalado
- [ ] Login no Firebase realizado
- [ ] Arquivo `.env` criado
- [ ] Credenciais configuradas
- [ ] Emuladores testados
- [ ] Conexão validada

### Produção
- [ ] Variáveis de ambiente configuradas
- [ ] Regras de produção deployadas
- [ ] Autenticação configurada
- [ ] Monitoramento ativo
- [ ] Backup configurado

---

**Última atualização:** 31 de Dezembro de 2025

