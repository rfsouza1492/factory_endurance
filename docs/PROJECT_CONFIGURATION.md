# 📋 Configuração do Projeto - Life Goals App

## 🎯 Projeto Alvo

O **Maestro Workflow** está configurado para trabalhar com o projeto **Life Goals App**.

**Localização do Projeto:**
```
Agents/life-goals-app/
```

---

## ⚙️ Configuração Centralizada

A configuração do projeto está centralizada em:
```
maestro-workflow/config/project-config.js
```

### Variáveis de Configuração

```javascript
WORKSPACE_ROOT      // Raiz do workspace "Tasks Man"
PROJECT_DIR         // Agents/life-goals-app/
KNOWLEDGE_DIR       // knowledge/
PROJECT_SRC_DIR     // Agents/life-goals-app/src/
PROJECT_PACKAGE_JSON // Agents/life-goals-app/package.json
```

---

## 🔧 Como Usar a Configuração

### Nos Agentes

```javascript
import config from '../../config/project-config.js';

const PROJECT_DIR = config.PROJECT_DIR;
const PROJECT_SRC_DIR = config.PROJECT_SRC_DIR;
```

### Validação

```javascript
import { validateProjectConfig } from '../../config/project-config.js';

const validation = validateProjectConfig();
if (!validation.valid) {
  console.error('Erros:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('Avisos:', validation.warnings);
}
```

---

## 📁 Estrutura Esperada

O Maestro espera encontrar o Life Goals App em:

```
Agents/life-goals-app/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── firebase.js
│   └── index.css
├── package.json
├── firebase.json
├── firestore.rules
└── ...
```

---

## 🔄 Agentes Configurados

Os seguintes agentes já estão configurados para usar `Agents/life-goals-app/`:

- ✅ **Architecture Agent** - Usa `PROJECT_DIR`
- ✅ **Code Quality Agent** - Analisa o projeto
- ✅ **Document Analysis Agent** - Analisa documentação
- ✅ **Product Manager Agent** - Usa `PROJECT_DIR`
- ✅ **Security Agent** - Usa `PROJECT_DIR`
- ✅ **Performance Agent** - Usa `PROJECT_DIR`
- ✅ **Dependency Agent** - Usa `PROJECT_DIR`
- ✅ **Implementation Agent** - Implementa no projeto
- ✅ **Testing Agent** - Usa `PROJECT_DIR`
- ✅ **Accessibility Agent** - Usa `PROJECT_DIR`

---

## 🚀 Executar Workflow

```bash
# Executar workflow completo no Life Goals App
npm run maestro

# Executar apenas fase de execução
npm run maestro:execution

# Executar apenas avaliação
npm run maestro:evaluation

# Executar apenas decisão
npm run maestro:decision
```

---

## ✅ Verificar Configuração

Para verificar se a configuração está correta:

```bash
cd maestro-workflow
node -e "import('./config/project-config.js').then(c => console.log('PROJECT_DIR:', c.config.PROJECT_DIR))"
```

---

## 📝 Notas

- O projeto **deve** estar em `Agents/life-goals-app/`
- A base de conhecimento está em `knowledge/`
- Todos os agentes usam a configuração centralizada
- A configuração pode ser sobrescrita via variável de ambiente `WORKSPACE_ROOT`

---

**Última Atualização**: 2024-12-30
**Projeto Alvo**: Life Goals App (`Agents/life-goals-app/`)

