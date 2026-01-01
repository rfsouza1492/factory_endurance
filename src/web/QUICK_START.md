# 🚀 Quick Start - Interface Web Maestro

## Instalação Rápida

```bash
# 1. Instalar dependências (se ainda não instalou)
npm install express cors

# 2. Iniciar servidor
npm run maestro:web
```

## Acessar Interface

Abra seu navegador em: **http://localhost:3000**

## Como Usar

### 1. Executar Workflow
1. Clique no botão **"▶️ Executar Workflow Completo"**
2. Aguarde a execução (pode levar alguns minutos)
3. O status será atualizado automaticamente

### 2. Revisar Aprovações
1. Após a execução, aparecerá uma decisão na seção **"✅ Aprovações Pendentes"**
2. Revise:
   - Decisão (GO/NO-GO/GO WITH CONCERNS)
   - Score geral
   - Issues críticos
   - Justificativa
3. Escolha:
   - **✅ Aprovar**: Se concorda com a decisão
   - **❌ Rejeitar**: Se não concorda (será solicitado motivo)
   - **📄 Ver Detalhes**: Para ver o relatório completo

### 3. Ver Histórico
- A seção **"📜 Backlog de Aprovações"** mostra todas as decisões anteriores
- Inclui status (aprovado/rejeitado) e quem aprovou/rejeitou

### 4. Monitorar Status
- A seção **"📊 Status Atual"** mostra scores em tempo real
- Atualiza automaticamente a cada 5 segundos

## Recursos

- ✅ Interface moderna e responsiva
- ✅ Atualização automática
- ✅ Visualização de logs
- ✅ Histórico completo
- ✅ Aprovação/rejeição com um clique

## Troubleshooting

### Servidor não inicia
- Verifique se a porta 3000 está livre
- Verifique se as dependências estão instaladas: `npm install express cors`

### Workflow não executa
- Verifique se o script `run-workflow.js` está acessível
- Verifique os logs no console do servidor

### Aprovações não aparecem
- Execute o workflow primeiro
- Verifique se o arquivo `go-no-go-report.md` foi gerado em `maestro/shared/decisions/`

---

**Dica**: Mantenha o servidor rodando e a página aberta para atualizações automáticas!

