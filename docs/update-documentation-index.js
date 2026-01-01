#!/usr/bin/env node
/**
 * Script para atualizar automaticamente o DOCUMENTATION_INDEX.md
 * 
 * Uso:
 *   node docs/update-documentation-index.js
 * 
 * Este script:
 * 1. Escaneia todos os arquivos .md em docs/
 * 2. Categoriza automaticamente
 * 3. Atualiza DOCUMENTATION_INDEX.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = path.join(__dirname);
const INDEX_FILE = path.join(DOCS_DIR, 'DOCUMENTATION_INDEX.md');

// Categorias e suas palavras-chave
const CATEGORIES = {
  'Visão Geral e Onboarding': {
    keywords: ['README', 'ONBOARDING', 'QUICK_START', 'EXECUTIVE_SUMMARY'],
    priority: 3
  },
  'Processos e Workflows': {
    keywords: ['PROCESS', 'WORKFLOW', 'FLOWCHART', 'MAPPING'],
    priority: 3
  },
  'Agentes e Implementação': {
    keywords: ['AGENT', 'IMPLEMENTATION', 'PRODUCT_MANAGER', 'CURSOR'],
    priority: 3
  },
  'Firebase e Infraestrutura': {
    keywords: ['FIREBASE', 'FIRESTORE', 'BACKEND', 'INFRASTRUCTURE'],
    priority: 3
  },
  'Testes': {
    keywords: ['TEST', 'TESTING', 'EXECUTION'],
    priority: 3
  },
  'Dashboard e UI': {
    keywords: ['DASHBOARD', 'UI', 'REALTIME', 'MULTI_PROJECT'],
    priority: 2
  },
  'Status e Resumos': {
    keywords: ['SUMMARY', 'STATUS', 'ROADMAP', 'SESSION', 'FINAL'],
    priority: 2
  },
  'Autofix e Backlog': {
    keywords: ['AUTOFIX', 'BACKLOG', 'ISSUE'],
    priority: 2
  },
  'Configuração e Setup': {
    keywords: ['CONFIG', 'SETUP', 'HOW_TO'],
    priority: 2
  },
  'Bugs e Fixes': {
    keywords: ['BUG', 'FIX', 'TROUBLESHOOTING'],
    priority: 1
  },
  'Aprovação e Fluxos': {
    keywords: ['APPROVAL', 'AUTOMATION', 'TRIGGER'],
    priority: 2
  },
  'Documentação e Manutenção': {
    keywords: ['DOCUMENTATION', 'CONSOLIDATION', 'REVIEW', 'INDEX', 'IMPROVEMENTS'],
    priority: 3
  },
  'API e Referências': {
    keywords: ['API', 'REFERENCE'],
    priority: 3
  }
};

/**
 * Escanear arquivos .md no diretório docs/
 */
function scanDocumentationFiles() {
  const files = [];
  
  function scanDir(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        // Pular node_modules e outros diretórios não relevantes
        if (!['node_modules', '.git', 'shared', 'results'].includes(entry.name)) {
          scanDir(fullPath, relPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Pular o próprio índice
        if (entry.name !== 'DOCUMENTATION_INDEX.md') {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const title = extractTitle(content, entry.name);
          const category = categorizeFile(entry.name, content);
          
          files.push({
            name: entry.name,
            path: relPath,
            fullPath: fullPath,
            title: title,
            category: category,
            priority: CATEGORIES[category]?.priority || 1
          });
        }
      }
    }
  }
  
  scanDir(DOCS_DIR);
  return files;
}

/**
 * Extrair título do arquivo
 */
function extractTitle(content, filename) {
  // Tentar extrair do primeiro H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Fallback: usar nome do arquivo
  return filename.replace('.md', '').replace(/_/g, ' ');
}

/**
 * Categorizar arquivo baseado em nome e conteúdo
 */
function categorizeFile(filename, content) {
  const upperFilename = filename.toUpperCase();
  const upperContent = content.substring(0, 500).toUpperCase(); // Primeiros 500 chars
  
  // Ordenar categorias por especificidade (mais específicas primeiro)
  const sortedCategories = Object.entries(CATEGORIES).sort((a, b) => {
    return b[1].keywords.length - a[1].keywords.length;
  });
  
  for (const [category, config] of sortedCategories) {
    for (const keyword of config.keywords) {
      if (upperFilename.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Segunda passada: verificar conteúdo
  for (const [category, config] of sortedCategories) {
    for (const keyword of config.keywords) {
      if (upperContent.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Categorias especiais baseadas em padrões de nome
  if (upperFilename.includes('TEST') || upperFilename.includes('TESTING')) {
    return 'Testes';
  }
  if (upperFilename.includes('API') || upperFilename.includes('REFERENCE')) {
    return 'API e Referências';
  }
  if (upperFilename.includes('TROUBLESHOOTING') || upperFilename.includes('BUG')) {
    return 'Bugs e Fixes';
  }
  if (upperFilename.includes('ONBOARDING') || upperFilename.includes('QUICK_START')) {
    return 'Visão Geral e Onboarding';
  }
  
  return 'Documentação e Manutenção'; // Default
}

/**
 * Gerar conteúdo do índice
 */
function generateIndexContent(files) {
  // Agrupar por categoria
  const byCategory = {};
  for (const file of files) {
    if (!byCategory[file.category]) {
      byCategory[file.category] = [];
    }
    byCategory[file.category].push(file);
  }
  
  // Ordenar arquivos por prioridade e nome
  for (const category in byCategory) {
    byCategory[category].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Maior prioridade primeiro
      }
      return a.name.localeCompare(b.name);
    });
  }
  
  let content = `# 📚 Índice Completo da Documentação - Maestro System

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}  
**Total de documentos:** ${files.length}

---

## 🎯 Por Onde Começar?

### 👋 Novo no Sistema?
1. [\`README.md\`](../README.md) - Visão geral do sistema
2. [\`ONBOARDING.md\`](./ONBOARDING.md) - Guia de onboarding completo
3. [\`QUICK_START.md\`](../QUICK_START.md) - Início rápido

### 🏗️ Entendendo Arquitetura?
1. [\`EXECUTIVE_SUMMARY.md\`](./EXECUTIVE_SUMMARY.md) - Resumo executivo
2. [\`BACKEND_ARCHITECTURE.md\`](./BACKEND_ARCHITECTURE.md) - Arquitetura backend
3. [\`PROCESS_MAPPING.md\`](./PROCESS_MAPPING.md) - Mapeamento de processos

### 🚀 Implementando Features?
1. [\`IMPLEMENTATION_AGENT.md\`](./IMPLEMENTATION_AGENT.md) - Agent de implementação
2. [\`AUTOFIX_IMPLEMENTATION_PLAN.md\`](./AUTOFIX_IMPLEMENTATION_PLAN.md) - Plano de autofix
3. [\`FIREBASE_INTEGRATION.md\`](./FIREBASE_INTEGRATION.md) - Integração Firebase

---

## 📖 Categorias de Documentos

`;

  // Gerar tabela para cada categoria
  const categoryOrder = Object.keys(CATEGORIES).sort();
  
  for (const category of categoryOrder) {
    const categoryFiles = byCategory[category] || [];
    if (categoryFiles.length === 0) continue;
    
    content += `### ${getCategoryNumber(categoryOrder.indexOf(category) + 1)}. ${category}\n\n`;
    content += `| Documento | Descrição | Prioridade |\n`;
    content += `|-----------|-----------|------------|\n`;
    
    for (const file of categoryFiles) {
      const linkPath = file.path.replace(/\\/g, '/');
      const priorityStars = '⭐'.repeat(file.priority);
      content += `| [\`${file.name}\`](./${linkPath}) | ${file.title} | ${priorityStars} |\n`;
    }
    
    content += '\n';
  }
  
  content += `---

## 🔍 Busca Rápida por Tópico

### Arquitetura
- [\`BACKEND_ARCHITECTURE.md\`](./BACKEND_ARCHITECTURE.md)
- [\`PROCESS_MAPPING.md\`](./PROCESS_MAPPING.md)
- [\`WORKFLOW_DIAGRAM.md\`](./WORKFLOW_DIAGRAM.md)

### Firebase
- [\`FIREBASE_INTEGRATION.md\`](./FIREBASE_INTEGRATION.md)
- [\`FIRESTORE_BLINDAGE_COMPLETE.md\`](./FIRESTORE_BLINDAGE_COMPLETE.md)
- [\`FIRESTORE_FIX_SUMMARY.md\`](./FIRESTORE_FIX_SUMMARY.md)

### Testes
- [\`testing-methodology/\`](./testing-methodology/)
- [\`TEST_EXECUTION_AGENT.md\`](./TEST_EXECUTION_AGENT.md)
- [\`TESTING_GUIDE.md\`](./TESTING_GUIDE.md)

### Implementação
- [\`IMPLEMENTATION_AGENT.md\`](./IMPLEMENTATION_AGENT.md)
- [\`AUTOFIX_IMPLEMENTATION_PLAN.md\`](./AUTOFIX_IMPLEMENTATION_PLAN.md)
- [\`ISSUE_TO_AUTOFIX_MAPPING.md\`](./ISSUE_TO_AUTOFIX_MAPPING.md)

### Dashboard
- [\`DASHBOARD_SPECIFICATION.md\`](./DASHBOARD_SPECIFICATION.md)
- [\`REALTIME_DASHBOARD_GUIDE.md\`](./REALTIME_DASHBOARD_GUIDE.md)
- [\`MULTI_PROJECT_GUIDE.md\`](./MULTI_PROJECT_GUIDE.md)

### API e Referências
- [\`API_REFERENCE.md\`](./API_REFERENCE.md) - Referência completa da API
- [\`TROUBLESHOOTING.md\`](./TROUBLESHOOTING.md) - Troubleshooting consolidado

---

## 📊 Estatísticas

- **Total de documentos:** ${files.length}
- **Categorias:** ${Object.keys(byCategory).length}
- **Documentos prioritários (⭐⭐⭐):** ${files.filter(f => f.priority === 3).length}
- **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 🔄 Manutenção

Este índice é **atualizado automaticamente** quando você executa:
\`\`\`bash
node docs/update-documentation-index.js
\`\`\`

**Responsável:** Equipe de desenvolvimento  
**Frequência de atualização:** Sempre que novos documentos são criados

---

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}
`;

  return content;
}

/**
 * Obter número da categoria
 */
function getCategoryNumber(n) {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return n <= 10 ? emojis[n - 1] : `${n}.`;
}

/**
 * Main
 */
function main() {
  console.log('📚 Atualizando DOCUMENTATION_INDEX.md...\n');
  
  try {
    const files = scanDocumentationFiles();
    console.log(`✅ Encontrados ${files.length} documentos\n`);
    
    const content = generateIndexContent(files);
    fs.writeFileSync(INDEX_FILE, content, 'utf-8');
    
    console.log('✅ DOCUMENTATION_INDEX.md atualizado com sucesso!');
    console.log(`   Total de documentos indexados: ${files.length}`);
    console.log(`   Categorias: ${new Set(files.map(f => f.category)).size}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar índice:', error);
    process.exit(1);
  }
}

main();

