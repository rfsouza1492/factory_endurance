#!/bin/bash

# Script para iniciar o servidor Maestro Web

cd "$(dirname "$0")"

echo "🚀 Iniciando Maestro Web Server..."
echo "📁 Diretório: $(pwd)"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
  echo "⚠️  Dependências não encontradas. Instalando..."
  npm install
fi

# Iniciar servidor
echo "🎭 Iniciando servidor na porta 3001..."
echo "📊 Dashboard: http://localhost:3001/dashboard"
echo "🌐 Multi-Project: http://localhost:3001/multi-project"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

node src/web/server.js

