# 🚀 Guia de Setup - Maestro Workflow

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git (opcional, para versionamento)

## 🔧 Instalação

### 1. Navegar para o diretório

```bash
cd maestro-workflow
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Caminho para o workspace/projeto a ser analisado
WORKSPACE_ROOT=/caminho/para/seu/projeto

# Caminho específico do projeto (opcional)
PROJECT_DIR=/caminho/para/projeto/especifico

# Porta para interface web (opcional, padrão: 3000)
PORT=3000
```

### 4. Ajustar caminhos nos scripts (se necessário)

Se você moveu o repositório para outro local, pode ser necessário ajustar os caminhos relativos nos scripts. Os scripts usam `WORKSPACE_ROOT` da variável de ambiente ou tentam detectar automaticamente.

## ▶️ Executar

### Workflow Completo

```bash
npm run maestro
```

### Fases Individuais

```bash
# Apenas execução dos agentes
npm run maestro:execution

# Apenas avaliação cruzada
npm run maestro:evaluation

# Apenas decisão Go/No-go
npm run maestro:decision
```

### Interface Web

```bash
npm run maestro:web
```

Acesse `http://localhost:3000` no navegador.

## 📁 Estrutura de Diretórios

Após a primeira execução, os seguintes diretórios serão criados automaticamente:

```
src/shared/
├── backlog/          # Backlogs gerados
├── results/          # Resultados dos agentes
│   ├── architecture-review/
│   ├── code-quality-review/
│   ├── document-analysis/
│   ├── security-audit/
│   ├── performance-analysis/
│   └── dependency-management/
├── evaluations/      # Avaliações cruzadas
├── decisions/        # Decisões Go/No-go
└── events/          # Eventos do sistema
```

## 🔍 Verificar Instalação

Execute um teste rápido:

```bash
node src/scripts/run-workflow.js --help
```

Se você ver a mensagem de ajuda, a instalação está correta!

## ⚠️ Problemas Comuns

### Erro: "Cannot find module"

**Solução:** Execute `npm install` novamente.

### Erro: "WORKSPACE_ROOT not found"

**Solução:** Configure a variável de ambiente `WORKSPACE_ROOT` no arquivo `.env` ou exporte no terminal:

```bash
export WORKSPACE_ROOT=/caminho/para/projeto
```

### Erro: "Port already in use"

**Solução:** A porta 3000 está em uso. Altere a porta no `.env`:

```env
PORT=3001
```

## 📚 Próximos Passos

1. Leia o [README.md](README.md) para entender o sistema
2. Consulte a [documentação](docs/) para detalhes
3. Execute o workflow e explore os resultados
4. Acesse a interface web para visualização

---

**Precisa de ajuda?** Abra uma issue no repositório!

