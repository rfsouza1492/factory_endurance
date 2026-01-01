#!/bin/bash
# Quick Test Script for Maestro Workflow

echo "🧪 Teste Rápido - Maestro Workflow"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar ambiente
echo "1. Verificando ambiente..."
NODE_VERSION=$(node --version 2>/dev/null)
NPM_VERSION=$(npm --version 2>/dev/null)

if [ -z "$NODE_VERSION" ]; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
fi

if [ -z "$NPM_VERSION" ]; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
fi

# 2. Verificar dependências
echo ""
echo "2. Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Instalando...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
fi

# 3. Verificar estrutura
echo ""
echo "3. Verificando estrutura..."
if [ ! -d "src" ]; then
    echo -e "${RED}❌ Diretório src/ não encontrado${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Estrutura OK${NC}"
fi

# 4. Executar workflow (fase de execução apenas)
echo ""
echo "4. Executando workflow (fase execution)..."
echo ""

node src/scripts/run-workflow.js --phase=execution 2>&1 | head -50

# 5. Verificar resultados
echo ""
echo "5. Verificando resultados..."
echo ""

# Contar agentes executados
AGENT_COUNT=0
for dir in src/shared/results/*/; do
    if [ -d "$dir" ]; then
        FILE_COUNT=$(ls -1 "$dir" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$FILE_COUNT" -gt 0 ]; then
            AGENT_COUNT=$((AGENT_COUNT + 1))
            AGENT_NAME=$(basename "$dir")
            echo -e "${GREEN}✅ $AGENT_NAME: $FILE_COUNT arquivo(s)${NC}"
        fi
    fi
done

echo ""
echo "Agentes executados: $AGENT_COUNT/6"

# Verificar avaliações
EVAL_COUNT=$(ls -1 src/shared/evaluations/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Avaliações cruzadas: $EVAL_COUNT/6"

# Verificar decisão
if [ -f "src/shared/decisions/go-no-go-report.md" ]; then
    echo -e "${GREEN}✅ Decisão Go/No-go gerada${NC}"
    DECISION=$(grep -i "DECISÃO:" src/shared/decisions/go-no-go-report.md | head -1)
    echo "   $DECISION"
else
    echo -e "${YELLOW}⚠️  Decisão não gerada (executar fase decision)${NC}"
fi

# Verificar backlog
if [ -f "src/shared/backlog/current-backlog.json" ]; then
    echo -e "${GREEN}✅ Backlog gerado${NC}"
    if command -v jq &> /dev/null; then
        TASK_COUNT=$(jq '.tasks | length' src/shared/backlog/current-backlog.json 2>/dev/null)
        echo "   Tarefas: $TASK_COUNT"
    fi
else
    echo -e "${YELLOW}⚠️  Backlog não gerado${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ Teste completo!${NC}"
echo ""
echo "Para teste completo, execute:"
echo "  node src/scripts/run-workflow.js"

