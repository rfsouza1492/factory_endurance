# 🧪 Teste do Servidor Maestro

## ✅ Servidor de Teste Criado

Um servidor de teste simples foi criado em `test-server.js` para verificar se tudo está funcionando.

## 🚀 Como Testar

### Opção 1: Servidor de Teste (Recomendado)

```bash
cd maestro-workflow
node test-server.js
```

Em outro terminal:
```bash
# Testar endpoint básico
curl http://localhost:3001/test

# Testar API de projetos
curl http://localhost:3001/api/projects
```

### Opção 2: Servidor Completo

```bash
cd maestro-workflow
npm run maestro:web
```

Acesse no navegador:
- Dashboard: http://localhost:3001/dashboard
- Multi-Project: http://localhost:3001/multi-project

## 🔍 Verificar se está rodando

```bash
# Ver processos Node rodando
ps aux | grep "node.*server"

# Verificar porta 3001
lsof -i :3001
```

## 🐛 Troubleshooting

Se o servidor não iniciar:

1. **Verificar dependências:**
   ```bash
   cd maestro-workflow
   npm install
   ```

2. **Verificar sintaxe:**
   ```bash
   node --check src/web/server.js
   ```

3. **Verificar porta:**
   ```bash
   lsof -i :3001
   # Se estiver em uso, matar processo:
   kill -9 <PID>
   ```

4. **Executar com logs:**
   ```bash
   node src/web/server.js
   ```

## 📊 Endpoints Disponíveis

- `GET /test` - Teste básico
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Adicionar projeto
- `GET /api/projects/:id` - Obter projeto
- `DELETE /api/projects/:id` - Remover projeto
- `POST /api/projects/:id/analyze` - Executar análise
- `GET /multi-project` - Dashboard multi-projeto

