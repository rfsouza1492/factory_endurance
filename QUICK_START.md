# 🚀 Quick Start - Maestro Workflow

## ⚠️ Problema Identificado

O servidor está rodando na **porta 8000** ao invés de **3001**, e os **emuladores do Firebase não estão rodando**.

## ✅ Solução Rápida

### 1. Iniciar Emuladores Firebase

```bash
cd "/Users/rafaelsouza/Desktop/Tasks Man"
npm run firebase:dev
```

Aguarde até ver: `All emulators ready!`

### 2. Iniciar Servidor na Porta Correta

```bash
cd maestro-workflow
PORT=3001 node src/web/server.js
```

Ou simplesmente:
```bash
npm run maestro:web
```

### 3. Acessar Dashboard

- **Multi-Project Dashboard:** http://localhost:3001/multi-project
- **Dashboard Padrão:** http://localhost:3001/dashboard
- **Firebase Emulator UI:** http://localhost:4000

## 🔧 Verificar Status

```bash
# Verificar portas em uso
lsof -i :3001,8000,8080,4000

# Verificar processos Firebase
ps aux | grep firebase | grep -v grep

# Verificar servidor Node
ps aux | grep "node.*server" | grep -v grep
```

## 🐛 Troubleshooting

### Servidor na porta errada

Se o servidor estiver na porta 8000:
```bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9

# Iniciar na porta correta
PORT=3001 npm run maestro:web
```

### Emuladores não conectam

Se houver erro `ECONNREFUSED 127.0.0.1:8080`:
```bash
# Parar emuladores
npm run firebase:kill

# Iniciar novamente
npm run firebase:dev
```

### Workflow falha ao salvar

O modo híbrido salva em arquivos mesmo se Firestore falhar. Verifique:
- `maestro-workflow/src/shared/results/` - Resultados salvos
- `maestro-workflow/src/shared/backlog/` - Backlog salvo

## 📊 Status Esperado

Quando tudo estiver funcionando:

```
✅ Firebase Emulators rodando:
   - Firestore: localhost:8080
   - Auth: localhost:9099
   - Storage: localhost:9199
   - Functions: localhost:5001
   - UI: localhost:4000

✅ Maestro Web Server rodando:
   - Dashboard: http://localhost:3001/dashboard
   - Multi-Project: http://localhost:3001/multi-project
```

