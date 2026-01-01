# 🔥 Configuração Firebase

## Credenciais de Produção

As credenciais do Firebase estão configuradas no módulo de conexão:

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

## Variáveis de Ambiente (Opcional)

Para sobrescrever as credenciais ou usar diferentes ambientes, crie um arquivo `.env`:

```bash
# .env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Ambiente
NODE_ENV=development  # ou 'production'
USE_FIREBASE_EMULATORS=true  # força uso de emuladores
```

## Detecção Automática de Ambiente

O módulo de conexão detecta automaticamente:

- **Desenvolvimento:** Se `NODE_ENV=development` ou `USE_FIREBASE_EMULATORS=true`
- **Produção:** Se as variáveis de ambiente estiverem configuradas ou usar credenciais padrão

## Uso

### Desenvolvimento (Emuladores)

```bash
# Usa emuladores automaticamente
NODE_ENV=development npm run test:firebase
```

### Produção

```bash
# Usa Firebase real
NODE_ENV=production npm run test:firebase
```

## Segurança

⚠️ **IMPORTANTE:** As credenciais do Firebase são públicas por design (API keys são seguras para uso público). No entanto:

1. Configure regras de segurança no Firestore
2. Use autenticação para proteger dados sensíveis
3. Não exponha credenciais de service account

## Links Úteis

- **Console Firebase:** https://console.firebase.google.com/project/planning-with-ai-fa2a3
- **Documentação:** https://firebase.google.com/docs

