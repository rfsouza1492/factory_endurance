# 🎭 Maestro Web Interface - Início Rápido

## ⚡ Início Rápido (3 passos)

### 1. Instalar Dependências
```bash
npm install express cors
```

### 2. Iniciar Servidor
```bash
npm run maestro:web
```

### 3. Abrir no Navegador
Acesse: **http://localhost:3000**

---

## 🎯 O que você pode fazer

### ▶️ Executar Workflow
- Clique no botão **"Executar Workflow Completo"**
- Aguarde alguns minutos
- O sistema executará:
  - Architecture Review
  - Code Quality Review
  - Document Analysis
  - Avaliação Cruzada
  - Decisão Go/No-go

### ✅ Aprovar/Rejeitar Decisões
Após a execução, você verá:
- **Decisão**: GO / NO-GO / GO WITH CONCERNS
- **Score**: Pontuação geral
- **Issues Críticos**: Problemas que bloqueiam
- **Justificativa**: Por que essa decisão foi tomada

Você pode:
- ✅ **Aprovar**: Concorda com a decisão
- ❌ **Rejeitar**: Não concorda (precisa informar motivo)
- 📄 **Ver Detalhes**: Abre relatório completo

### 📊 Monitorar Status
- Scores atualizados em tempo real
- Atualização automática a cada 5 segundos
- Métricas de cada agente

### 📜 Ver Histórico
- Todas as decisões anteriores
- Status de cada uma
- Quem aprovou/rejeitou

---

## 🎨 Interface

A interface é moderna e intuitiva:
- 🟢 Verde = Bom/GO
- 🟡 Amarelo = Atenção/GO WITH CONCERNS
- 🔴 Vermelho = Problema/NO-GO
- ⚪ Cinza = Pendente

---

## 🔧 Comandos Úteis

```bash
# Iniciar servidor
npm run maestro:web

# Executar workflow via CLI (alternativa)
npm run maestro

# Ver ajuda
node Agents/maestro/scripts/run-workflow.js --help
```

---

## ❓ Problemas Comuns

### Porta 3000 já em uso
```bash
# Matar processo na porta 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### Dependências faltando
```bash
npm install express cors
```

### Workflow não executa
- Verifique se está na pasta raiz do projeto
- Verifique os logs no console do servidor
- Execute manualmente: `npm run maestro`

---

## 📚 Documentação Completa

- **README**: `Agents/maestro/web/README.md`
- **Quick Start**: `Agents/maestro/web/QUICK_START.md`
- **Maestro Principal**: `Agents/maestro/README.md`

---

**Pronto para começar?** Execute `npm run maestro:web` e abra http://localhost:3000! 🚀

