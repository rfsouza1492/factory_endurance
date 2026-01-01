# 🚀 Guia Completo: Configuração GitHub para Factory System

**Data:** 1 de Janeiro de 2025  
**Repositório:** `rfsouza1492/factory_endurance`

---

## 📋 Índice

1. [Configurar Secrets no GitHub](#1-configurar-secrets-no-github)
2. [Configurar Variáveis de Ambiente no Deploy](#2-configurar-variáveis-de-ambiente-no-deploy)
3. [Ativar e Configurar GitHub Actions](#3-ativar-e-configurar-github-actions)

---

## 1. Configurar Secrets no GitHub

### 🎯 O que são Secrets?

Secrets são variáveis de ambiente criptografadas que o GitHub armazena de forma segura. Elas são usadas em workflows do GitHub Actions para acessar credenciais sem expô-las no código.

### 📍 Onde Configurar

1. **Acesse o repositório no GitHub:**
   - URL: https://github.com/rfsouza1492/factory_endurance

2. **Navegue até Settings:**
   - Clique na aba **"Settings"** no topo do repositório

3. **Acesse Secrets and variables:**
   - No menu lateral esquerdo, clique em **"Secrets and variables"**
   - Selecione **"Actions"**

4. **Adicione os Secrets:**
   - Clique no botão **"New repository secret"**

### 🔑 Secrets Necessários

Adicione os seguintes secrets um por um:

#### Firebase Credentials (Obrigatórios)

| Nome do Secret | Valor | Descrição |
|---------------|-------|-----------|
| `FIREBASE_API_KEY` | `AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74` | Chave da API do Firebase |
| `FIREBASE_AUTH_DOMAIN` | `planning-with-ai-fa2a3.firebaseapp.com` | Domínio de autenticação |
| `FIREBASE_PROJECT_ID` | `planning-with-ai-fa2a3` | ID do projeto Firebase |
| `FIREBASE_STORAGE_BUCKET` | `planning-with-ai-fa2a3.firebasestorage.app` | Bucket de storage |
| `FIREBASE_MESSAGING_SENDER_ID` | `341098460420` | ID do remetente de mensagens |
| `FIREBASE_APP_ID` | `1:341098460420:web:78b96216c227100dd44c51` | ID do aplicativo |

#### Configurações Opcionais

| Nome do Secret | Valor | Descrição |
|---------------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de execução |
| `USE_FIREBASE_EMULATORS` | `false` | Usar emuladores (false para produção) |
| `FIREBASE_SYNC_ENABLED` | `true` | Habilitar sincronização Firebase |
| `FIREBASE_SYNC_MODE` | `hybrid` | Modo de sincronização (hybrid/firestore/files) |
| `API_KEYS` | `sua-api-key-aqui` | Chaves de API para autenticação (separadas por vírgula) |
| `ADMIN_USERS` | `admin@example.com` | Usuários administradores (separados por vírgula) |
| `REQUIRE_AUTH` | `true` | Exigir autenticação (true/false) |
| `PORT` | `3001` | Porta do servidor (opcional, padrão: 3001) |

### 📝 Passo a Passo Detalhado

#### Passo 1: Criar Secret FIREBASE_API_KEY

1. Clique em **"New repository secret"**
2. No campo **"Name"**, digite: `FIREBASE_API_KEY`
3. No campo **"Secret"**, cole: `AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74`
4. Clique em **"Add secret"**

#### Passo 2: Repetir para Todos os Secrets

Repita o processo acima para cada secret listado na tabela.

### ✅ Verificação

Após adicionar todos os secrets, você verá uma lista como esta:

```
Repository secrets (12)
FIREBASE_API_KEY          Updated 2 minutes ago
FIREBASE_AUTH_DOMAIN      Updated 2 minutes ago
FIREBASE_PROJECT_ID       Updated 2 minutes ago
FIREBASE_STORAGE_BUCKET   Updated 2 minutes ago
FIREBASE_MESSAGING_SENDER_ID  Updated 2 minutes ago
FIREBASE_APP_ID           Updated 2 minutes ago
NODE_ENV                  Updated 2 minutes ago
USE_FIREBASE_EMULATORS    Updated 2 minutes ago
FIREBASE_SYNC_ENABLED     Updated 2 minutes ago
FIREBASE_SYNC_MODE        Updated 2 minutes ago
API_KEYS                  Updated 2 minutes ago
ADMIN_USERS               Updated 2 minutes ago
```

### 🔒 Segurança

- ✅ Secrets são **criptografados** pelo GitHub
- ✅ **Nunca** aparecem em logs públicos
- ✅ Apenas workflows do repositório podem acessá-los
- ✅ Podem ser atualizados a qualquer momento
- ⚠️ **Nunca** commite secrets no código!

---

## 2. Configurar Variáveis de Ambiente no Deploy

### 🎯 Onde Fazer Deploy?

O Factory System pode ser deployado em várias plataformas. Aqui estão as principais:

1. **Vercel** (Recomendado para Node.js)
2. **Railway**
3. **Render**
4. **Heroku**
5. **AWS/GCP/Azure** (VMs ou containers)

### 📍 Vercel (Recomendado)

#### Passo 1: Conectar Repositório

1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `factory_endurance`
5. Clique em **"Import"**

#### Passo 2: Configurar Build Settings

```
Framework Preset: Other
Root Directory: maestro-workflow
Build Command: npm install
Output Directory: (deixar vazio)
Install Command: npm ci
```

#### Passo 3: Adicionar Environment Variables

Na seção **"Environment Variables"**, adicione todas as variáveis:

| Name | Value | Environment |
|------|-------|-------------|
| `FIREBASE_API_KEY` | `AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74` | Production, Preview, Development |
| `FIREBASE_AUTH_DOMAIN` | `planning-with-ai-fa2a3.firebaseapp.com` | Production, Preview, Development |
| `FIREBASE_PROJECT_ID` | `planning-with-ai-fa2a3` | Production, Preview, Development |
| `FIREBASE_STORAGE_BUCKET` | `planning-with-ai-fa2a3.firebasestorage.app` | Production, Preview, Development |
| `FIREBASE_MESSAGING_SENDER_ID` | `341098460420` | Production, Preview, Development |
| `FIREBASE_APP_ID` | `1:341098460420:web:78b96216c227100dd44c51` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `USE_FIREBASE_EMULATORS` | `false` | Production |
| `FIREBASE_SYNC_ENABLED` | `true` | Production, Preview, Development |
| `FIREBASE_SYNC_MODE` | `hybrid` | Production, Preview, Development |
| `PORT` | `3001` | Production, Preview, Development |

#### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse a URL fornecida (ex: `factory-endurance.vercel.app`)

### 📍 Railway

#### Passo 1: Conectar Repositório

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha `factory_endurance`

#### Passo 2: Configurar Variáveis

1. Vá em **"Variables"**
2. Adicione todas as variáveis de ambiente (mesmas da tabela acima)
3. Configure o **"Start Command"**: `cd maestro-workflow && npm start`

### 📍 Render

#### Passo 1: Criar Web Service

1. Acesse: https://render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte o repositório `factory_endurance`

#### Passo 2: Configurar

```
Name: factory-endurance
Environment: Node
Build Command: cd maestro-workflow && npm install
Start Command: cd maestro-workflow && npm start
```

#### Passo 3: Adicionar Environment Variables

Na seção **"Environment"**, adicione todas as variáveis.

### 📍 Heroku

#### Passo 1: Criar App

```bash
heroku create factory-endurance
cd maestro-workflow
heroku git:remote -a factory-endurance
```

#### Passo 2: Configurar Variáveis

```bash
heroku config:set FIREBASE_API_KEY="AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74"
heroku config:set FIREBASE_AUTH_DOMAIN="planning-with-ai-fa2a3.firebaseapp.com"
heroku config:set FIREBASE_PROJECT_ID="planning-with-ai-fa2a3"
heroku config:set FIREBASE_STORAGE_BUCKET="planning-with-ai-fa2a3.firebasestorage.app"
heroku config:set FIREBASE_MESSAGING_SENDER_ID="341098460420"
heroku config:set FIREBASE_APP_ID="1:341098460420:web:78b96216c227100dd44c51"
heroku config:set NODE_ENV="production"
heroku config:set USE_FIREBASE_EMULATORS="false"
heroku config:set FIREBASE_SYNC_ENABLED="true"
heroku config:set FIREBASE_SYNC_MODE="hybrid"
heroku config:set PORT="3001"
```

#### Passo 3: Deploy

```bash
git push heroku main
```

### ✅ Verificação Pós-Deploy

Após o deploy, verifique se o servidor está rodando:

```bash
# Testar endpoint de status
curl https://seu-app.vercel.app/api/status

# Testar endpoint do Firebase
curl https://seu-app.vercel.app/api/firebase/status
```

Resposta esperada:
```json
{
  "status": "ok",
  "firebase": {
    "connected": true,
    "projectId": "planning-with-ai-fa2a3"
  }
}
```

---

## 3. Ativar e Configurar GitHub Actions

### 🎯 O que são GitHub Actions?

GitHub Actions é uma plataforma de CI/CD integrada ao GitHub que permite automatizar testes, builds e deploys.

### 📍 Verificar se GitHub Actions Está Ativo

1. Acesse: https://github.com/rfsouza1492/factory_endurance
2. Clique na aba **"Actions"**
3. Se você ver a mensagem **"Get started with GitHub Actions"**, significa que está desativado
4. Se você ver workflows listados, está ativo

### 🔧 Ativar GitHub Actions

#### Passo 1: Habilitar Actions no Repositório

1. Vá em **Settings** → **Actions** → **General**
2. Em **"Actions permissions"**, selecione:
   - ✅ **"Allow all actions and reusable workflows"**
3. Em **"Workflow permissions"**, selecione:
   - ✅ **"Read and write permissions"**
   - ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Clique em **"Save"**

#### Passo 2: Verificar Workflow Existente

O projeto já possui um workflow em `.github/workflows/ci.yml`. Vamos atualizá-lo para usar os secrets:

### 📝 Atualizar Workflow CI

Vamos melhorar o workflow para usar os secrets e executar testes com Firebase:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      working-directory: ./maestro-workflow
      run: npm ci
    
    - name: Run linter
      working-directory: ./maestro-workflow
      run: npm run lint
    
    - name: Run tests
      working-directory: ./maestro-workflow
      env:
        NODE_ENV: test
        USE_FIREBASE_EMULATORS: true
      run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      working-directory: ./maestro-workflow
      run: npm ci
    
    - name: Build check
      working-directory: ./maestro-workflow
      run: npm run build || echo "No build script"

  deploy-preview:
    runs-on: ubuntu-latest
    needs: [test, build]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
    
    - name: Install dependencies
      working-directory: ./maestro-workflow
      run: npm ci
    
    - name: Test Firebase connection
      working-directory: ./maestro-workflow
      env:
        FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
        FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
        FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
        FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
        NODE_ENV: production
        USE_FIREBASE_EMULATORS: false
      run: |
        echo "Testing Firebase connection..."
        node -e "
          const { initializeFirebase } = require('./src/firebase/connection.js');
          initializeFirebase().then(() => {
            console.log('✅ Firebase connection successful');
            process.exit(0);
          }).catch(err => {
            console.error('❌ Firebase connection failed:', err);
            process.exit(1);
          });
        "
```

### 🔄 Criar Workflow de Deploy Automático

Crie um novo arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
    
    - name: Install dependencies
      working-directory: ./maestro-workflow
      run: npm ci
    
    - name: Run tests
      working-directory: ./maestro-workflow
      env:
        NODE_ENV: test
        USE_FIREBASE_EMULATORS: true
      run: npm test
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./maestro-workflow
        scope: ${{ secrets.VERCEL_ORG_ID }}
```

### 📊 Monitorar Workflows

1. Acesse a aba **"Actions"** no GitHub
2. Clique em um workflow para ver detalhes
3. Clique em um job para ver logs
4. Verifique se todos os steps passaram (✅ verde)

### 🐛 Troubleshooting

#### Workflow não executa

- Verifique se Actions está habilitado em Settings
- Verifique se o arquivo `.github/workflows/*.yml` existe
- Verifique a sintaxe YAML (use um validador online)

#### Secrets não encontrados

- Verifique se os secrets foram criados corretamente
- Verifique se o nome do secret no workflow corresponde ao nome no GitHub
- Lembre-se: secrets são case-sensitive!

#### Testes falham

- Verifique os logs do workflow
- Execute os testes localmente primeiro
- Verifique se as dependências estão instaladas

#### Deploy falha

- Verifique se as variáveis de ambiente estão configuradas na plataforma de deploy
- Verifique os logs de build
- Verifique se o `package.json` tem o script `start` configurado

---

## 📋 Checklist Final

### ✅ Secrets no GitHub
- [ ] `FIREBASE_API_KEY` configurado
- [ ] `FIREBASE_AUTH_DOMAIN` configurado
- [ ] `FIREBASE_PROJECT_ID` configurado
- [ ] `FIREBASE_STORAGE_BUCKET` configurado
- [ ] `FIREBASE_MESSAGING_SENDER_ID` configurado
- [ ] `FIREBASE_APP_ID` configurado
- [ ] Variáveis opcionais configuradas (se necessário)

### ✅ Variáveis no Deploy
- [ ] Plataforma de deploy escolhida (Vercel/Railway/Render/etc)
- [ ] Repositório conectado
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] Build settings configurados
- [ ] Deploy executado com sucesso
- [ ] Endpoints testados

### ✅ GitHub Actions
- [ ] Actions habilitado no repositório
- [ ] Workflow CI atualizado
- [ ] Workflow de deploy criado (opcional)
- [ ] Primeiro workflow executado com sucesso
- [ ] Logs verificados

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/rfsouza1492/factory_endurance
- **GitHub Secrets:** https://github.com/rfsouza1492/factory_endurance/settings/secrets/actions
- **GitHub Actions:** https://github.com/rfsouza1492/factory_endurance/actions
- **Firebase Console:** https://console.firebase.google.com/project/planning-with-ai-fa2a3
- **Documentação GitHub Actions:** https://docs.github.com/en/actions
- **Documentação Vercel:** https://vercel.com/docs

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do workflow
2. Verifique a documentação do Firebase
3. Verifique a documentação da plataforma de deploy
4. Abra uma issue no repositório

---

**Última atualização:** 1 de Janeiro de 2025

