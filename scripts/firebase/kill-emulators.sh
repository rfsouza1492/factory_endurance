#!/bin/bash

# Script para parar Firebase Emulators
# Identifica e mata processos nas portas dos emuladores

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Parando Firebase Emulators...${NC}"

# Portas dos emuladores
PORTS=(4000 8080 9099 9199 5001 5002)
KILLED=0

for port in "${PORTS[@]}"; do
    PID=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}   Parando processo na porta $port (PID: $PID)${NC}"
        kill -9 $PID 2>/dev/null || true
        KILLED=$((KILLED + 1))
    fi
done

if [ $KILLED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum emulador encontrado rodando${NC}"
else
    echo -e "${GREEN}✅ $KILLED processo(s) parado(s)${NC}"
fi

# Verificar se ainda há processos
REMAINING=0
for port in "${PORTS[@]}"; do
    if lsof -ti:$port >/dev/null 2>&1; then
        REMAINING=$((REMAINING + 1))
    fi
done

if [ $REMAINING -gt 0 ]; then
    echo -e "${RED}⚠️  Ainda há processos rodando em $REMAINING porta(s)${NC}"
    echo -e "${YELLOW}   Tente manualmente: lsof -ti:PORTA | xargs kill -9${NC}"
else
    echo -e "${GREEN}✅ Todas as portas estão livres${NC}"
fi

