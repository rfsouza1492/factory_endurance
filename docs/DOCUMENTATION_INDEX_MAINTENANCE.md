# 🔄 Manutenção do DOCUMENTATION_INDEX.md

**Guia para manter o índice de documentação sempre atualizado**

---

## 🎯 Objetivo

O `DOCUMENTATION_INDEX.md` é o índice centralizado de toda a documentação do sistema Maestro. Ele deve ser mantido atualizado para facilitar a navegação e descoberta de documentos.

---

## 🤖 Atualização Automática

### Script de Atualização

Um script automatizado foi criado para manter o índice atualizado:

**Localização:** `docs/update-documentation-index.js`

### Como Usar

```bash
# Executar manualmente
node docs/update-documentation-index.js

# Ou via npm script
npm run docs:update-index
```

### O Que o Script Faz

1. ✅ Escaneia todos os arquivos `.md` em `docs/`
2. ✅ Extrai títulos automaticamente
3. ✅ Categoriza documentos baseado em nome e conteúdo
4. ✅ Gera tabela organizada por categoria
5. ✅ Atualiza estatísticas
6. ✅ Mantém estrutura consistente

---

## 📋 Quando Atualizar

### Atualização Automática Recomendada

Execute o script sempre que:
- ✅ Novo documento é criado
- ✅ Documento é movido ou renomeado
- ✅ Estrutura de diretórios muda
- ✅ Antes de commits importantes

### Atualização Manual (Opcional)

Se preferir atualizar manualmente:
1. Adicione novo documento na categoria apropriada
2. Mantenha formato consistente
3. Atualize estatísticas no final

---

## 🔧 Processo Recomendado

### Workflow Diário

```bash
# 1. Criar/editar documentos
# ... trabalho normal ...

# 2. Antes de commit, atualizar índice
npm run docs:update-index

# 3. Verificar mudanças
git diff docs/DOCUMENTATION_INDEX.md

# 4. Commit incluindo índice atualizado
git add docs/DOCUMENTATION_INDEX.md
git commit -m "docs: atualizar índice de documentação"
```

### Workflow Automatizado (Git Hooks)

Você pode configurar um git hook para atualizar automaticamente:

```bash
# .git/hooks/pre-commit
#!/bin/bash
node docs/update-documentation-index.js
git add docs/DOCUMENTATION_INDEX.md
```

---

## 📊 Estrutura do Índice

### Seções Principais

1. **Por Onde Começar?** - Guias rápidos para diferentes perfis
2. **Categorias de Documentos** - Tabelas organizadas por categoria
3. **Busca Rápida por Tópico** - Links rápidos para tópicos comuns
4. **Estatísticas** - Métricas da documentação
5. **Manutenção** - Informações sobre atualização

### Formato das Tabelas

```markdown
| Documento | Descrição | Prioridade |
|-----------|-----------|------------|
| [`NOME.md`](./NOME.md) | Descrição do documento | ⭐⭐⭐ |
```

**Prioridades:**
- ⭐⭐⭐ - Alta prioridade (essencial)
- ⭐⭐ - Média prioridade (importante)
- ⭐ - Baixa prioridade (referência)

---

## 🎨 Categorias Disponíveis

O script categoriza automaticamente em:

1. **Visão Geral e Onboarding**
2. **Processos e Workflows**
3. **Agentes e Implementação**
4. **Firebase e Infraestrutura**
5. **Testes**
6. **Dashboard e UI**
7. **Status e Resumos**
8. **Autofix e Backlog**
9. **Configuração e Setup**
10. **Bugs e Fixes**
11. **Aprovação e Fluxos**
12. **Documentação e Manutenção**
13. **API e Referências**

---

## 🔍 Como o Script Categoriza

### Baseado em Nome do Arquivo

O script procura palavras-chave no nome do arquivo:
- `TEST*` → Testes
- `API*` ou `*REFERENCE*` → API e Referências
- `FIREBASE*` ou `FIRESTORE*` → Firebase e Infraestrutura
- `AGENT*` ou `IMPLEMENTATION*` → Agentes e Implementação
- etc.

### Baseado em Conteúdo

Se não encontrar no nome, verifica as primeiras 500 linhas do conteúdo.

---

## ⚙️ Configuração

### Personalizar Categorias

Edite `update-documentation-index.js`:

```javascript
const CATEGORIES = {
  'Nova Categoria': {
    keywords: ['PALAVRA_CHAVE'],
    priority: 3
  }
};
```

### Ajustar Prioridades

Modifique a propriedade `priority`:
- `3` = Alta prioridade (⭐⭐⭐)
- `2` = Média prioridade (⭐⭐)
- `1` = Baixa prioridade (⭐)

---

## 🐛 Troubleshooting

### Problema: Documento não aparece no índice

**Solução:**
1. Verificar se arquivo está em `docs/` ou subdiretórios
2. Verificar se tem extensão `.md`
3. Executar script novamente
4. Verificar se não está sendo ignorado

### Problema: Categoria incorreta

**Solução:**
1. Adicionar palavra-chave apropriada em `CATEGORIES`
2. Ou renomear arquivo para incluir palavra-chave
3. Executar script novamente

### Problema: Script não executa

**Solução:**
```bash
# Verificar permissões
chmod +x docs/update-documentation-index.js

# Executar diretamente
node docs/update-documentation-index.js
```

---

## 📝 Boas Práticas

### ✅ Fazer

- Executar script antes de commits importantes
- Manter nomes de arquivos descritivos
- Usar palavras-chave nos nomes para categorização automática
- Revisar índice após atualização automática

### ❌ Evitar

- Editar índice manualmente sem executar script depois
- Criar documentos fora de `docs/`
- Usar nomes genéricos demais (ex: `doc1.md`)

---

## 🔗 Referências

- [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) - Índice atual
- [`update-documentation-index.js`](./update-documentation-index.js) - Script de atualização
- [`DOCUMENTATION_REVIEW.md`](./DOCUMENTATION_REVIEW.md) - Revisão completa

---

## ✅ Checklist de Manutenção

- [ ] Script executado após criar novo documento
- [ ] Índice revisado após atualização automática
- [ ] Estatísticas corretas
- [ ] Links funcionando
- [ ] Categorias apropriadas
- [ ] Prioridades corretas

---

**Última atualização:** 31 de Dezembro de 2025  
**Responsável:** Equipe de desenvolvimento

