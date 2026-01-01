#!/bin/bash

# Script para iniciar Firebase Emulators
# Verifica se Firebase CLI está instalado e se emuladores já estão rodando

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Verificando Firebase Setup...${NC}"

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI não está instalado${NC}"
    echo -e "${YELLOW}   Instale com: npm install -g firebase-tools${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI encontrado${NC}"

# Verificar se já está logado
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Não está logado no Firebase${NC}"
    echo -e "${YELLOW}   Execute: firebase login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado no Firebase${NC}"

# Verificar se emuladores já estão rodando
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Emuladores já estão rodando${NC}"
    echo -e "${BLUE}   UI: http://localhost:4000${NC}"
    echo -e "${BLUE}   Firestore: http://localhost:8080${NC}"
    echo -e "${BLUE}   Auth: http://localhost:9099${NC}"
    echo -e "${BLUE}   Storage: http://localhost:9199${NC}"
    echo -e "${BLUE}   Functions: http://localhost:5001${NC}"
    echo ""
    echo -e "${YELLOW}   Para parar os emuladores: npm run firebase:kill${NC}"
    exit 0
fi

# Verificar se outras portas estão em uso
PORTS=(8080 9099 9199 5001 5002)
CONFLICTS=()

for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        CONFLICTS+=($port)
    fi
done

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Portas em conflito detectadas: ${CONFLICTS[*]}${NC}"
    echo -e "${YELLOW}   Execute: npm run firebase:kill${NC}"
    exit 1
fi

# Navegar para o diretório do projeto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"
cd "$PROJECT_DIR"

echo -e "${BLUE}📁 Diretório do projeto: $PROJECT_DIR${NC}"

# Verificar se firebase.json existe
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ firebase.json não encontrado${NC}"
    echo -e "${YELLOW}   Execute: firebase init${NC}"
    exit 1
fi

echo -e "${GREEN}✅ firebase.json encontrado${NC}"

# Iniciar emuladores
echo ""
echo -e "${BLUE}🚀 Iniciando Firebase Emulators...${NC}"
echo ""

firebase emulators:start

# Nota: O comando acima bloqueia, então estas linhas só executam se houver erro
echo ""
echo -e "${GREEN}✅ Emuladores iniciados!${NC}"
echo -e "${BLUE}🌐 UI: http://localhost:4000${NC}"
echo -e "${BLUE}📊 Firestore: http://localhost:8080${NC}"
echo -e "${BLUE}🔐 Auth: http://localhost:9099${NC}"
echo -e "${BLUE}📦 Storage: http://localhost:9199${NC}"
echo -e "${BLUE}⚡ Functions: http://localhost:5001${NC}"
echo -e "${BLUE}🌍 Hosting: http://localhost:5002${NC}"

