# 🔧 Troubleshooting - Maestro Dashboard

## Problema: Navegador não consegue acessar o website

### ✅ Verificação Rápida

1. **Servidor está rodando?**
   ```bash
   lsof -ti:3000
   ```
   Se retornar um número (PID), o servidor está rodando.

2. **Servidor responde?**
   ```bash
   curl http://localhost:3000/api/status
   ```
   Se retornar JSON, o servidor está funcionando.

---

## 🔍 Soluções

### Solução 1: Verificar URL Correta

**URLs corretas:**
- Dashboard: `http://localhost:3000/dashboard`
- Interface antiga: `http://localhost:3000/`
- API: `http://localhost:3000/api/status`

**Alternativas:**
- `http://127.0.0.1:3000/dashboard`
- `http://0.0.0.0:3000/dashboard` (não recomendado)

---

### Solução 2: Limpar Cache do Navegador

**Chrome/Edge:**
1. Pressione `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
2. Selecione "Imagens e arquivos em cache"
3. Clique em "Limpar dados"

**Firefox:**
1. Pressione `Ctrl+Shift+Delete`
2. Selecione "Cache"
3. Clique em "Limpar agora"

**Safari:**
1. Pressione `Cmd+Option+E`
2. Ou: Desenvolvedor > Limpar Caches

---

### Solução 3: Modo Anônimo/Privado

Abra o navegador em modo anônimo/privado:
- Chrome: `Ctrl+Shift+N` (Windows) ou `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)
- Safari: `Cmd+Shift+N`

---

### Solução 4: Verificar Console do Navegador

1. Abra o navegador
2. Pressione `F12` ou `Ctrl+Shift+I` (Windows) ou `Cmd+Option+I` (Mac)
3. Vá para a aba "Console"
4. Verifique se há erros
5. Tente acessar `http://localhost:3000/dashboard`

---

### Solução 5: Reiniciar o Servidor

**Parar servidor atual:**
```bash
kill -9 $(lsof -ti:3000)
```

**Iniciar novamente:**
```bash
cd maestro-workflow
npm run maestro:web
```

Ou da raiz:
```bash
npm run maestro:web
```

---

### Solução 6: Verificar Firewall

**macOS:**
1. Preferências do Sistema > Segurança e Privacidade > Firewall
2. Verifique se o Node.js está permitido

**Windows:**
1. Painel de Controle > Firewall do Windows
2. Verifique se a porta 3000 está permitida

---

### Solução 7: Verificar se Porta está em Uso

**Ver processos na porta 3000:**
```bash
lsof -i:3000
```

**Se houver múltiplos processos:**
```bash
# Matar todos os processos na porta 3000
kill -9 $(lsof -ti:3000)
```

---

### Solução 8: Usar Porta Diferente

Se a porta 3000 estiver bloqueada, use outra porta:

**Modificar server.js:**
```javascript
const PORT = process.env.PORT || 3001; // Mudar para 3001
```

**Ou definir variável de ambiente:**
```bash
PORT=3001 npm run maestro:web
```

Depois acesse: `http://localhost:3001/dashboard`

---

## 🐛 Erros Comuns

### Erro: "Cannot GET /dashboard"

**Causa:** Arquivo `dashboard.html` não encontrado

**Solução:**
```bash
# Verificar se arquivo existe
ls -la maestro-workflow/src/web/dashboard.html

# Se não existir, verificar estrutura
ls -la maestro-workflow/src/web/
```

---

### Erro: "EADDRINUSE: address already in use"

**Causa:** Porta 3000 já está em uso

**Solução:**
```bash
# Parar processo na porta 3000
kill -9 $(lsof -ti:3000)

# Ou usar outra porta
PORT=3001 npm run maestro:web
```

---

### Erro: "Cannot find module"

**Causa:** Dependências não instaladas

**Solução:**
```bash
cd maestro-workflow
npm install
```

---

### Erro: CORS no navegador

**Causa:** Problema de CORS (improvável, já está configurado)

**Solução:** Verificar se `cors` está instalado:
```bash
cd maestro-workflow
npm list cors
```

---

## 📞 Verificação Final

Execute estes comandos para verificar tudo:

```bash
# 1. Verificar se servidor está rodando
lsof -ti:3000 && echo "✅ Servidor rodando" || echo "❌ Servidor não rodando"

# 2. Testar API
curl http://localhost:3000/api/status

# 3. Testar dashboard
curl http://localhost:3000/dashboard | head -5

# 4. Verificar processos Node
ps aux | grep node
```

---

## ✅ Checklist de Troubleshooting

- [ ] Servidor está rodando? (`lsof -ti:3000`)
- [ ] API responde? (`curl http://localhost:3000/api/status`)
- [ ] URL está correta? (`http://localhost:3000/dashboard`)
- [ ] Cache do navegador limpo?
- [ ] Console do navegador verificado?
- [ ] Firewall não está bloqueando?
- [ ] Porta 3000 não está em uso por outro processo?
- [ ] Dependências instaladas? (`npm install`)

---

**Última Atualização:** 2025-12-30

