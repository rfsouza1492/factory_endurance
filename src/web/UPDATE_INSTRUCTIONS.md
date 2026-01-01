# Instruções para Atualizar Interface Web

## Problema Identificado

A interface web estava mostrando relatórios antigos (NO-GO com score 39/100) em vez do relatório mais recente (GO WITH CONCERNS com score 75/100).

## Correções Aplicadas

1. **Parsing de Decisão Melhorado**
   - Agora captura corretamente "GO WITH CONCERNS" (antes capturava apenas "GO WITH")
   - Suporta "NO-GO", "NO", "GO", e "GO WITH CONCERNS"

2. **Carregamento de Relatório Atualizado**
   - O servidor agora sempre prioriza o relatório mais recente do arquivo `go-no-go-report.md`
   - Se o arquivo foi atualizado, o relatório antigo é substituído mesmo se estava aprovado
   - Status é resetado para "pending" quando há atualização

3. **Atualização Automática Após Workflow**
   - Após executar workflow, o relatório é automaticamente atualizado
   - Status é sempre definido como "pending" para novas execuções

## Como Aplicar

1. **Parar o servidor atual** (se estiver rodando):
   ```bash
   # Encontrar processo na porta 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Reiniciar o servidor**:
   ```bash
   npm run maestro:web
   ```

3. **Abrir a interface**:
   ```
   http://localhost:3000
   ```

4. **Verificar**:
   - Deve mostrar o relatório mais recente (GO WITH CONCERNS, score 75/100)
   - Status deve ser "pending"
   - 0 issues críticos
   - 6 issues de alta prioridade

## Relatório Mais Recente

- **Workflow ID**: 2025-12-30T17-25-16
- **Decisão**: GO WITH CONCERNS
- **Score**: 75/100
- **Issues Críticos**: 0
- **Issues Alta Prioridade**: 6

---

**Status**: ✅ Correções aplicadas. Reinicie o servidor para ver as mudanças.

