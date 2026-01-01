# ⚡ Quick Start: Configuração GitHub

Guia rápido para configurar secrets, variáveis de ambiente e GitHub Actions.

---

## 🚀 3 Passos Rápidos

### 1️⃣ Configurar Secrets (5 minutos)

1. Acesse: https://github.com/rfsouza1492/factory_endurance/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Adicione os 6 secrets do Firebase:

```
FIREBASE_API_KEY = AIzaSyDn36Eojkj6hOhEuag1dHLQWpoit7R6q74
FIREBASE_AUTH_DOMAIN = planning-with-ai-fa2a3.firebaseapp.com
FIREBASE_PROJECT_ID = planning-with-ai-fa2a3
FIREBASE_STORAGE_BUCKET = planning-with-ai-fa2a3.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID = 341098460420
FIREBASE_APP_ID = 1:341098460420:web:78b96216c227100dd44c51
```

### 2️⃣ Ativar GitHub Actions (2 minutos)

1. Acesse: https://github.com/rfsouza1492/factory_endurance/settings/actions
2. Em **"Actions permissions"**, selecione: **"Allow all actions"**
3. Em **"Workflow permissions"**, selecione: **"Read and write permissions"**
4. Clique em **"Save"**

### 3️⃣ Testar (1 minuto)

1. Faça um pequeno commit e push:
   ```bash
   git commit --allow-empty -m "test: trigger CI"
   git push
   ```
2. Acesse: https://github.com/rfsouza1492/factory_endurance/actions
3. Verifique se o workflow executou com sucesso ✅

---

## 📦 Deploy (Opcional)

### Vercel (Recomendado)

1. Acesse: https://vercel.com
2. **"Add New Project"** → Selecione `factory_endurance`
3. Configure:
   - **Root Directory:** `maestro-workflow`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Adicione as mesmas variáveis de ambiente do Firebase
5. Clique em **"Deploy"**

---

## ✅ Checklist

- [ ] Secrets configurados (6 do Firebase)
- [ ] GitHub Actions ativado
- [ ] Workflow executou com sucesso
- [ ] Deploy configurado (opcional)

---

## 📚 Documentação Completa

Para instruções detalhadas, veja: [GITHUB_SETUP_GUIDE.md](./GITHUB_SETUP_GUIDE.md)

---

**Tempo total:** ~10 minutos

