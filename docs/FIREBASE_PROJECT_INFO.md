# 🔥 Informações do Projeto Firebase

**Data:** 31 de Dezembro de 2025  
**Projeto:** Planning With AI

---

## 📋 Informações do Projeto

### Dados Básicos
- **Nome do Projeto:** Planning With AI
- **ID do Projeto:** `planning-with-ai-fa2a3`
- **Número do Projeto:** `341098460420`
- **Empresa-mãe/Pasta no GCP:** `endurance.build`
- **Ambiente:** Não especificado

---

## 📱 Aplicativos

### App da Web
- **Apelido:** Planning With AI
- **ID do Aplicativo:** `1:341098460420:web:78b96216c227100dd44c51`
- **Site do Firebase Hosting:** `planning-with-ai-fa2a3`

---

## 🔑 Configuração do Firebase

### Credenciais
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74",
  authDomain: "planning-with-ai-fa2a3.firebaseapp.com",
  projectId: "planning-with-ai-fa2a3",
  storageBucket: "planning-with-ai-fa2a3.firebasestorage.app",
  messagingSenderId: "341098460420",
  appId: "1:341098460420:web:78b96216c227100dd44c51"
};
```

### Links Úteis
- **Console Firebase:** https://console.firebase.google.com/project/planning-with-ai-fa2a3
- **Firestore Database:** https://console.firebase.google.com/project/planning-with-ai-fa2a3/firestore
- **Authentication:** https://console.firebase.google.com/project/planning-with-ai-fa2a3/authentication
- **Storage:** https://console.firebase.google.com/project/planning-with-ai-fa2a3/storage
- **Hosting:** https://console.firebase.google.com/project/planning-with-ai-fa2a3/hosting

---

## 📦 Instalação do SDK

### NPM
```bash
npm install firebase
```

### Inicialização
```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74",
  authDomain: "planning-with-ai-fa2a3.firebaseapp.com",
  projectId: "planning-with-ai-fa2a3",
  storageBucket: "planning-with-ai-fa2a3.firebasestorage.app",
  messagingSenderId: "341098460420",
  appId: "1:341098460420:web:78b96216c227100dd44c51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

**Observação:** Esta configuração usa o SDK modular para JavaScript, que reduz o tamanho do SDK.

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env.example`
Um arquivo `.env.example` foi criado com todas as variáveis necessárias. Para usar:

1. Copie o arquivo:
   ```bash
   cp .env.example .env
   ```

2. Preencha com suas credenciais (já estão preenchidas com os valores do projeto)

3. O arquivo `.env` está no `.gitignore` e não será commitado

---

## 🚀 Uso no Projeto

### Desenvolvimento (Emuladores)
```bash
# Iniciar emuladores
npm run firebase:emulators:start

# O sistema detectará automaticamente e usará emuladores
```

### Produção
```bash
# Definir variáveis de ambiente
export NODE_ENV=production
export USE_FIREBASE_EMULATORS=false

# Ou usar arquivo .env
NODE_ENV=production
USE_FIREBASE_EMULATORS=false
```

---

## 📚 Documentação

- **Firebase para Web:** https://firebase.google.com/docs/web/setup
- **Referência da API Web SDK:** https://firebase.google.com/docs/reference/js
- **Amostras:** https://firebase.google.com/docs/web/setup#available-libraries

---

**Última atualização:** 31 de Dezembro de 2025

