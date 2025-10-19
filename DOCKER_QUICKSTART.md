# Docker Quick Start - Open Agent Builder

## 🚀 Get Running in 3 Steps

### Step 1: Setup Environment

```bash
cd open-agent-builder
cp env.example .env
```

Edit `.env` and add these **required** keys:

```env
# Convex (Database) - Get from https://dashboard.convex.dev
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk (Auth) - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# Firecrawl (Web Scraping) - Get from https://firecrawl.dev
FIRECRAWL_API_KEY=fc-...
```

**Also update:** `convex/auth.config.ts` with your Clerk domain

### Step 2: Start Services

```bash
docker-compose up
```

**First run takes 5-10 minutes** to download Ollama models (~6GB total)

### Step 3: Use the App

Open **http://localhost:3000**

1. Sign in with Clerk
2. Create a new workflow
3. Add an Agent node
4. Select: **Ollama (Local) - Llama 3.2 3B** (FREE!)
5. Add instructions and run

## 🎯 What You Get

✅ **Free Local LLM** - Ollama with Llama 3.2 & Qwen 2.5 Coder
✅ **No Node.js Needed** - Everything runs in Docker
✅ **No LLM Costs** - Zero API fees for local models
✅ **Hot Reloading** - Code changes update instantly
✅ **Easy Management** - Simple npm scripts

## 📊 Required Services

You **must** set up these 3 cloud services:

| Service | Purpose | Free Tier | Setup Time |
|---------|---------|-----------|------------|
| [Convex](https://convex.dev) | Database | Yes | 2 min |
| [Clerk](https://clerk.com) | Authentication | Yes | 3 min |
| [Firecrawl](https://firecrawl.dev) | Web Scraping | Yes | 1 min |

**Total setup: ~6 minutes**

## 🔧 Common Commands

```bash
# Start
docker-compose up

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Clean rebuild
docker-compose down -v && docker-compose up --build
```

## 🤖 Ollama Commands

```bash
# List models
npm run ollama:list

# Check status
npm run ollama:status

# Pull new model
docker-compose exec ollama ollama pull llama3.1:8b

# Test model
docker-compose exec ollama ollama run llama3.2:3b "Hello!"
```

## 🐛 Quick Troubleshooting

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Ollama not responding?**
```bash
docker-compose restart ollama
curl http://localhost:11434/
```

**Models not downloading?**
```bash
docker-compose logs ollama-setup
```

**Out of space?**
```bash
docker system prune -a
```

## 💡 Tips

- **Llama 3.2 3B** - Fast, use for quick tasks
- **Qwen 2.5 Coder 7B** - Best for coding workflows  
- **First inference** - Slow (loading model), then fast
- **Offline mode** - Works after models downloaded
- **Cloud LLMs** - Optional, for higher quality

## 📚 Full Documentation

- **[DOCKER.md](./DOCKER.md)** - Complete setup guide
- **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** - Implementation details
- **[README.md](./README.md)** - Application docs

## 🎉 That's It!

You now have a fully containerized AI agent builder with free local LLMs!

**Enjoy building workflows without cloud LLM costs!** 🔥

