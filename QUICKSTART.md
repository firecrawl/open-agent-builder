# 🚀 Quick Start - Self-Hosted Open Agent Builder

## TL;DR

```bash
# 1. Setup
cp env.example .env
# Edit .env - add NEXT_PUBLIC_CONVEX_URL and generate NEXTAUTH_SECRET

# 2. Start (one command)
./start.sh

# 3. Create account
open http://localhost:3000/sign-up

# 4. Build workflows!
```

---

## What You Get (Out of the Box)

- ✅ **FREE Local LLM** - Ollama with Llama 3.2 & Qwen Coder
- ✅ **FREE Web Scraping** - Jina.ai + Browserless  
- ✅ **Self-Hosted Auth** - NextAuth + PostgreSQL
- ✅ **No Subscriptions** - Save $100-300/month
- ✅ **Complete Privacy** - All data on your server

---

## First Time Setup (5 minutes)

### Step 1: Environment Variables

```bash
cp env.example .env
```

Edit `.env` and set:

```env
# Required:
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # Generate this
DATABASE_URL=postgresql://agent_builder:changeme123@postgres:5432/agent_builder

# Database passwords:
DB_PASSWORD=changeme123
PGADMIN_PASSWORD=admin123
```

### Step 2: Start Everything

```bash
./start.sh
```

### Step 3: Create Your Account

1. Open http://localhost:3000/sign-up
2. Enter your name, email, password
3. Click "Create account"
4. Sign in with your credentials

### Step 4: Build Your First Workflow

1. Click "New Workflow"
2. Add nodes:
   - **Start** → **Firecrawl Scrape** → **Agent** → **End**
3. Configure:
   - **Scrape**: Enter any URL (uses FREE Jina.ai)
   - **Agent**: Select "Ollama (Local)" / "Llama 3.2 3B"
4. Click "Run" → Watch it execute for FREE! ✨

---

## Available Services

After running `./start.sh`:

| Service | URL | Purpose |
|---------|-----|---------|
| **Application** | http://localhost:3000 | Main app |
| **pgAdmin** | http://localhost:5050 | Database admin |
| **Ollama** | http://localhost:11434 | LLM inference |
| **Browserless** | http://localhost:3001 | Browser automation |

---

## Common Commands

```bash
# Start everything
./start.sh

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart after changes
docker-compose restart nextjs

# Database admin
open http://localhost:5050
# Email: admin@local.dev
# Password: (from .env PGADMIN_PASSWORD)

# Manage Ollama models
npm run ollama:list      # List installed models
npm run ollama:pull      # Pull new model
npm run ollama:popular   # Show popular models
```

---

## Free LLM Models (Ollama)

Pre-installed:
- **Llama 3.2 3B** - Fast general purpose (FREE)
- **Qwen 2.5 Coder 7B** - Specialized for coding (FREE)

Add more:
```bash
docker-compose exec ollama ollama pull llama3:70b
docker-compose exec ollama ollama pull codellama:7b
docker-compose exec ollama ollama pull mistral:7b
```

---

## Free Web Scraping

**Jina.ai Reader** (Default):
- FREE public API
- Markdown conversion
- No authentication needed
- Works with any URL

**Browserless** (Advanced):
- Local Docker container
- Full browser automation
- JavaScript rendering
- Screenshots & PDFs

Both work automatically - no configuration needed!

---

## Cost Comparison

### Before:
- Firecrawl: $50-100/month
- Claude/GPT API: $50-200/month  
- Clerk: $25-100/month
- **Total: $125-400/month**

### After:
- Everything: $0/month
- **Total: $0/month** 💰

**Annual savings: $1,500 - $4,800!**

---

## Example Workflows

### 1. Simple Web Scraper
```
Start → Scrape (Jina.ai) → Agent (Ollama) → End
```
- Scrapes any website
- Summarizes with local LLM
- Completely FREE

### 2. Research Assistant
```
Start → Search (Jina.ai) → Agent (Ollama) → Transform → End
```
- Searches the web
- Analyzes results locally
- Formats output

### 3. Data Extraction
```
Start → Scrape (Browserless) → Agent (Ollama) → Transform → End
```
- JavaScript-heavy sites
- Complex extraction
- Local processing

---

## Troubleshooting

### "Cannot connect to database"
```bash
docker-compose ps postgres  # Check if running
docker-compose restart postgres
```

### "Prisma Client not found"
```bash
docker-compose exec nextjs npx prisma generate
```

### "Ollama models missing"
```bash
docker-compose logs ollama-setup
docker-compose exec ollama ollama pull llama3.2:3b
```

### "Session not persisting"
Check `NEXTAUTH_SECRET` is set in `.env`

---

## File Structure

```
/home/muhammadmotawe/open-source-agents/open-agent-builder/
├── start.sh                    # Quick start script
├── docker-compose.yml          # All services
├── env.example                 # Environment template
├── .env                        # Your config (create this)
│
├── app/
│   ├── sign-in/               # Login page
│   ├── sign-up/               # Registration page
│   └── api/
│       ├── auth/              # NextAuth endpoints
│       └── execute-firecrawl/ # Scraping API
│
├── lib/
│   ├── auth.ts                # Auth helpers
│   ├── scraping/              # Jina.ai & Browserless
│   └── config/llm-config.ts   # Ollama configuration
│
├── prisma/
│   └── schema.prisma          # Database schema
│
└── docs/
    ├── MIGRATION_COMPLETE.md  # Full migration summary
    ├── COMPLETE_SELF_HOSTING_GUIDE.md  # Detailed guide
    └── QUICKSTART.md          # This file
```

---

## Next Steps

### Option 1: Start Using (Recommended)
- You're ready to go!
- Build workflows
- Enjoy FREE local AI

### Option 2: Optional Upgrades
- Add more Ollama models
- Configure external LLM APIs (optional)
- Customize auth pages
- Add more scraping strategies

### Option 3: Complete Phase 1
- Replace Convex with PostgreSQL
- Achieve 100% self-hosting
- See `dockerize-open-agent-builder.plan.md`

---

## Need Help?

**Documentation:**
- `README.md` - Full documentation
- `MIGRATION_COMPLETE.md` - What's been done
- `COMPLETE_SELF_HOSTING_GUIDE.md` - Detailed guide
- `DOCKER.md` - Docker details

**Scripts:**
- `./start.sh` - Quick start
- `npm run ollama:status` - Check Ollama
- `npm run migrate:api` - Migrate API routes

---

## You're All Set! 🎉

Open http://localhost:3000 and start building AI workflows - completely FREE and self-hosted!

**No subscriptions. No API costs. No vendor lock-in.** ✨

