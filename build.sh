#!/bin/bash

# Script de build para Netlify
# Resolve problemas de permissão do pnpm

set -e

echo "🚀 Iniciando build no Netlify..."

# Configurar variáveis de ambiente
export PNPM_HOME="/opt/buildhome/.pnpm"
export PNPM_STORE_DIR="/opt/buildhome/.pnpm-store"
export npm_config_cache="/opt/buildhome/.npm"
export npm_config_userconfig="/opt/buildhome/.npmrc"

# Adicionar PNPM_HOME ao PATH
export PATH="$PNPM_HOME:$PATH"

echo "📦 Configurando pnpm..."

# Criar diretórios necessários com permissões adequadas
mkdir -p "$PNPM_HOME"
mkdir -p "$PNPM_STORE_DIR"
mkdir -p "$(dirname "$npm_config_cache")"

echo "🔧 Instalando dependências com pnpm..."

# Instalar dependências
pnpm install --frozen-lockfile

echo "🏗️ Executando build..."

# Executar build
pnpm run build

echo "✅ Build concluído com sucesso!"
