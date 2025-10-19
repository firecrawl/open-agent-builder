#!/bin/bash

# Open Agent Builder - Quick Start Script
# Self-Hosted Version with Ollama, Browserless, and NextAuth

set -e

echo "🚀 Open Agent Builder - Self-Hosted Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Creating from env.example..."
    cp env.example .env
    echo -e "${GREEN}✓${NC} Created .env file"
    echo ""
    echo -e "${YELLOW}📝 Please edit .env and set:${NC}"
    echo "  - NEXT_PUBLIC_CONVEX_URL"
    echo "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "  - DATABASE_URL"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if required env vars are set
source .env

if [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_CONVEX_URL not set in .env${NC}"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET not set${NC}"
    echo "Generating..."
    SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$SECRET" >> .env
    echo -e "${GREEN}✓${NC} Generated NEXTAUTH_SECRET"
fi

echo -e "${GREEN}✓${NC} Environment variables configured"
echo ""

# Start services
echo "🐳 Starting Docker services..."
echo ""
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if database needs migration
echo ""
echo "🗄️  Setting up database..."
docker-compose exec -T nextjs npx prisma generate > /dev/null 2>&1
docker-compose exec -T nextjs npx prisma migrate deploy > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Database ready"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Open Agent Builder is running!${NC}"
echo "=========================================="
echo ""
echo "📍 Application: http://localhost:3000"
echo "📍 pgAdmin: http://localhost:5050"
echo "📍 Ollama: http://localhost:11434"
echo "📍 Browserless: http://localhost:3001"
echo ""
echo "🔐 First time?"
echo "   1. Visit http://localhost:3000/sign-up"
echo "   2. Create your account"
echo "   3. Start building workflows!"
echo ""
echo "🤖 Using local LLM:"
echo "   - Select 'Ollama (Local)' in any Agent node"
echo "   - FREE models: Llama 3.2 3B, Qwen 2.5 Coder 7B"
echo ""
echo "🌐 Web scraping:"
echo "   - Jina.ai (FREE) + Browserless (local)"
echo "   - No API key needed!"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""

