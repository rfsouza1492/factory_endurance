# 📋 Mapeamento: Issue → AutoFixTask

**Data:** 31 de Dezembro de 2025  
**Status:** 📝 **ESTRUTURA PREPARADA - AGUARDANDO IMPLEMENTAÇÃO**

---

## 🎯 Objetivo

Guia para implementar `convertIssueToTask()` que transforma issues identificados pelos agentes em AutoFixTask completas.

**Regra:** Se não for possível gerar AutoFixTask completa → retornar `null` (não entra no backlog).

---

## 📊 Tabela de Mapeamento

| Tipo de Issue | fixType | Campos Mínimos | Estratégia de Geração | Exemplo |
|--------------|---------|----------------|----------------------|---------|
| **Arquivo faltando** | `create` | `targetPath`, `newContent` | Template baseado em tipo de arquivo | `firestore.rules` → template de regras |
| **Arquivo com problema** | `patch` | `targetPath`, `patch` | LLM gera diff ou trecho substituto | Código com bug → patch corrigindo |
| **Config incorreta** | `config` | `targetPath`, `configKey`, `newValue` | Heurística baseada em tipo de config | `.eslintrc` → regra específica |
| **Dependência faltando** | `command` | `command` | Comando npm/yarn baseado em nome | `package.json` → `npm install <pkg>` |
| **Documentação faltando** | `create` | `targetPath`, `newContent` | LLM gera documentação baseada em código | README.md → doc gerada |
| **Código com problema** | `patch` ou `rewrite` | `targetPath`, `patch` ou `newContent` | LLM analisa e gera correção | Função com bug → função corrigida |
| **Teste faltando** | `create` | `targetPath`, `newContent` | Template de teste + LLM para lógica | `test/file.test.js` → teste gerado |
| **Import faltando** | `patch` | `targetPath`, `patch` | Heurística: adicionar import no topo | `import { X } from 'y'` |
| **Código não usado** | `delete` | `targetPath`, `targetLocator` | Heurística: remover função/import | Função não usada → remover |

---

## 🔍 Análise Detalhada

### 1. Arquivo Faltando

**Detecção:**
- Issue: `type: 'Dependency' | 'Security' | 'Documentation'`
- Message: contém "não encontrado", "não existe", "missing"
- Location: caminho do arquivo

**Geração:**
```javascript
{
  fixType: 'create',
  targetPath: issue.location,
  newContent: generateTemplate(issue.type, issue.location)
}
```

**Templates:**
- `firestore.rules` → regras básicas de segurança
- `package.json` → estrutura mínima
- `README.md` → template baseado em projeto
- `test/` → estrutura de testes

**Estratégia:** Template + LLM para personalização

---

### 2. Arquivo com Problema

**Detecção:**
- Issue: `type: 'Code Quality' | 'Security' | 'Performance'`
- Message: descreve problema específico
- Location: caminho do arquivo

**Geração:**
```javascript
{
  fixType: 'patch',
  targetPath: issue.location,
  patch: await generatePatch(issue.message, issue.location)
}
```

**Estratégia:** LLM analisa arquivo e gera diff/patch

---

### 3. Config Incorreta

**Detecção:**
- Issue: `type: 'Configuration'`
- Message: descreve regra/config faltando
- Location: arquivo de config

**Geração:**
```javascript
{
  fixType: 'config',
  targetPath: issue.location,
  configKey: extractConfigKey(issue.message),
  newValue: extractConfigValue(issue.message)
}
```

**Estratégia:** Heurística + parsing de mensagem

---

### 4. Dependência Faltando

**Detecção:**
- Issue: `type: 'Dependency'`
- Message: nome do pacote faltando
- Location: `package.json`

**Geração:**
```javascript
{
  fixType: 'command',
  targetPath: issue.location,
  command: `npm install ${extractPackageName(issue.message)}`
}
```

**Estratégia:** Parsing de mensagem + comando padrão

---

### 5. Documentação Faltando

**Detecção:**
- Issue: `type: 'Documentation'`
- Message: tipo de doc faltando
- Location: caminho do arquivo

**Geração:**
```javascript
{
  fixType: 'create',
  targetPath: issue.location,
  newContent: await generateDocumentation(issue.message, projectContext)
}
```

**Estratégia:** LLM gera documentação baseada em contexto do projeto

---

### 6. Código com Problema

**Detecção:**
- Issue: `type: 'Code Quality' | 'Bug'`
- Message: descreve problema
- Location: arquivo + função/linha

**Geração:**
```javascript
{
  fixType: 'patch', // ou 'rewrite' se mudança grande
  targetPath: issue.location,
  targetLocator: extractFunctionOrLine(issue.message),
  patch: await generateCodeFix(issue.message, issue.location)
}
```

**Estratégia:** LLM analisa código e gera correção

---

## 🚫 Issues Não Auto-Fixáveis

Estes tipos de issue **NÃO** devem entrar no backlog:

1. **Arquitetura**
   - "Arquitetura precisa ser refatorada"
   - "Migrar para microserviços"
   - → Vai para `insights/architecture.md`

2. **Lógica de Negócio**
   - "Regra de negócio precisa ser implementada"
   - "Fluxo de aprovação precisa ser definido"
   - → Vai para `insights/business-logic.md`

3. **Decisões de Design**
   - "Escolher framework X ou Y"
   - "Definir padrão de API"
   - → Vai para `insights/design-decisions.md`

4. **Mudanças Grandes**
   - "Refatorar módulo completo"
   - "Reescrever sistema de autenticação"
   - → Vai para `manualActions/large-changes.md`

---

## 📝 Estrutura de Implementação

```javascript
export function convertIssueToTask(issue) {
  // 1. Analisar se pode ser auto-fixável
  if (!canBeAutoFixed(issue)) {
    return null; // Não entra no backlog
  }
  
  // 2. Determinar fixType baseado no tipo de issue
  const fixType = determineFixType(issue);
  
  // 3. Gerar campos específicos do fixType
  const fixFields = await generateFixFields(issue, fixType);
  
  // 4. Montar AutoFixTask completa
  return {
    id: generateTaskId(),
    title: generateTitle(issue),
    description: issue.message,
    targetType: determineTargetType(issue),
    targetPath: issue.location,
    fixType,
    ...fixFields, // patch, command, newContent, etc.
    priority: issue.priority || determinePriority(issue),
    riskLevel: determineRiskLevel(issue, fixType),
    requiresApproval: determineRequiresApproval(issue),
    status: 'todo',
    createdAt: new Date().toISOString(),
    originalIssue: issue
  };
}
```

---

## 🧪 Testes Necessários

Para cada tipo de issue:

1. ✅ Issue válido → AutoFixTask completa gerada
2. ✅ Issue inválido → retorna `null`
3. ✅ AutoFixTask gerada → passa em `validateAutoFixTask()`
4. ✅ AutoFixTask gerada → não contém `undefined`

---

## 📋 Próximos Passos

1. ⏭️ Implementar `canBeAutoFixed(issue)`
2. ⏭️ Implementar `determineFixType(issue)`
3. ⏭️ Implementar `generateFixFields(issue, fixType)` para cada fixType
4. ⏭️ Implementar templates para arquivos comuns
5. ⏭️ Integrar LLM para geração de patches/conteúdo
6. ⏭️ Testar com backlog real

---

**Status:** 📝 **ESTRUTURA PREPARADA - AGUARDANDO FASE 2**

