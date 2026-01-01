#!/bin/bash

# Script para fazer deploy das regras do Firestore
# Permite escolher entre desenvolvimento e produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-development}

echo -e "${BLUE}🔥 Deploy de Regras do Firestore${NC}"
echo -e "${BLUE}   Ambiente: ${ENVIRONMENT}${NC}"
echo ""

# Navegar para o diretório do projeto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"
cd "$PROJECT_DIR"

# Verificar se firebase.json existe
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ firebase.json não encontrado${NC}"
    exit 1
fi

# Escolher arquivo de regras baseado no ambiente
if [ "$ENVIRONMENT" == "production" ]; then
    RULES_FILE="firestore.rules.production"
    echo -e "${YELLOW}⚠️  ATENÇÃO: Fazendo deploy de regras de PRODUÇÃO${NC}"
    echo -e "${YELLOW}   Estas regras são RESTRITIVAS e requerem autenticação${NC}"
    echo ""
    read -p "Continuar? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Deploy cancelado${NC}"
        exit 0
    fi
    
    # Copiar regras de produção para o arquivo principal
    cp "$RULES_FILE" firestore.rules
    echo -e "${GREEN}✅ Regras de produção copiadas${NC}"
elif [ "$ENVIRONMENT" == "development" ]; then
    RULES_FILE="firestore.rules.development"
    echo -e "${BLUE}📝 Usando regras de desenvolvimento${NC}"
    
    # Copiar regras de desenvolvimento para o arquivo principal
    cp "$RULES_FILE" firestore.rules
    echo -e "${GREEN}✅ Regras de desenvolvimento copiadas${NC}"
else
    echo -e "${RED}❌ Ambiente inválido: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}   Use: development ou production${NC}"
    exit 1
fi

# Verificar se arquivo de regras existe
if [ ! -f "$RULES_FILE" ]; then
    echo -e "${RED}❌ Arquivo de regras não encontrado: $RULES_FILE${NC}"
    exit 1
fi

# Fazer deploy
echo ""
echo -e "${BLUE}🚀 Fazendo deploy das regras...${NC}"
firebase deploy --only firestore:rules

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${BLUE}   Regras ativas: $ENVIRONMENT${NC}"

