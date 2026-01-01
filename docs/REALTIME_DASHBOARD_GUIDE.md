# 📊 Maestro Real-Time Dashboard - Guia de Uso

**Data:** 2024-12-30  
**Status:** ✅ Implementado

---

## 🎯 Objetivo

Dashboard de monitoramento em tempo real para acompanhar indicadores e processos do sistema Maestro com Background Agents, atualizando minuto a minuto (ou mais frequente).

---

## 🚀 Como Usar

### 1. Iniciar o Servidor Maestro

```bash
cd maestro-workflow
npm run maestro:web
```

O servidor iniciará na porta **3000**.

### 2. Acessar o Dashboard

Abra seu navegador e acesse:

```
http://localhost:3000/realtime-dashboard
```

---

## 📊 Features do Dashboard

### Métricas em Tempo Real

O dashboard exibe 4 métricas principais:

1. **Agents Ativos** - Quantidade de agents em execução
2. **Agents Completos** - Quantidade de agents que finalizaram
3. **Fase Atual** - Fase do workflow (Idle, Execução, Avaliação, Decisão)
4. **Tempo de Execução** - Tempo total desde o início do workflow

### Visualização de Fases

Cada fase do workflow é exibida em um card separado:

- **Fase 1: Execução dos Agentes**
  - Progresso geral da fase
  - Status de cada agent individual
  - Barra de progresso por agent

- **Fase 2: Avaliação Cruzada**
  - Status da avaliação
  - Progresso geral

- **Fase 3: Decisão Go/No-go**
  - Status da decisão
  - Progresso geral

### Status dos Agents

Cada agent exibe:
- **Nome do Agent**
- **Status** (pending, running, complete, error)
- **Progresso** (0-100%)
- **Indicador visual** (cor e animação)

### Timeline de Atividades

Mostra as últimas 10 atividades do workflow:
- Mudanças de fase
- Completamento de agents
- Eventos importantes

---

## ⚙️ Configurações

### Auto-Refresh

O dashboard atualiza automaticamente a cada **30 segundos** por padrão.

**Toggle Auto-Refresh:**
- Clique no toggle no header para ativar/desativar
- Quando ativo (azul), atualiza automaticamente
- Quando inativo (cinza), atualização manual apenas

**Atualização Manual:**
- Pressione `Ctrl + R` (ou `Cmd + R` no Mac) para atualizar manualmente

### Intervalo de Atualização

Para alterar o intervalo de atualização, edite o arquivo `realtime-dashboard.html`:

```javascript
let refreshIntervalSeconds = 30; // Altere para o valor desejado (em segundos)
```

**Recomendações:**
- **30 segundos** - Padrão, bom para monitoramento geral
- **10 segundos** - Para monitoramento mais ativo
- **60 segundos** - Para economizar recursos

---

## 🔍 Entendendo os Indicadores

### Status do Workflow

- 🟡 **Idle** - Workflow não está rodando
- 🟢 **Running** - Workflow em execução
- ✅ **Complete** - Workflow completado
- ❌ **Error** - Erro no workflow

### Status dos Agents

- **Pending** (cinza) - Agent ainda não iniciou
- **Running** (azul, pulsante) - Agent em execução
- **Complete** (verde) - Agent completou com sucesso
- **Error** (vermelho) - Agent encontrou erro

### Status das Fases

- **Pending** - Fase ainda não iniciou
- **Running** - Fase em execução
- **Complete** - Fase completada
- **Error** - Erro na fase

---

## 📡 APIs Utilizadas

O dashboard utiliza duas APIs:

### 1. `/api/progress`
Retorna o progresso completo do workflow:
- Status do workflow
- Status de cada fase
- Status de cada agent
- Progresso percentual

### 2. `/api/metrics`
Retorna métricas calculadas:
- Contagem de agents por status
- Tempo de execução
- Taxa de conclusão
- Progresso geral

---

## 🎨 Design

O dashboard utiliza:
- **Dark Mode** - Tema escuro para melhor visualização
- **Responsive** - Funciona em desktop e mobile
- **Real-time Updates** - Atualizações suaves sem recarregar página
- **Visual Indicators** - Cores e animações para status

---

## 🔧 Troubleshooting

### Dashboard não atualiza

1. Verifique se o servidor está rodando: `npm run maestro:web`
2. Verifique o console do navegador (F12) para erros
3. Verifique se o auto-refresh está ativado
4. Tente atualizar manualmente (Ctrl+R)

### Dados não aparecem

1. Verifique se há um workflow em execução
2. Verifique se o arquivo `workflow-progress.json` existe
3. Verifique os logs do servidor para erros

### Performance lenta

1. Aumente o intervalo de atualização (30s → 60s)
2. Feche outras abas do navegador
3. Verifique recursos do sistema

---

## 📚 Referências

- `maestro-workflow/src/web/realtime-dashboard.html` - Código do dashboard
- `maestro-workflow/src/web/server.js` - Servidor e APIs
- `maestro-workflow/src/shared/workflow-progress.json` - Arquivo de progresso

---

**Last Updated**: 2024-12-30  
**Version**: 1.0

